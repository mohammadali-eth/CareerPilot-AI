import logging
import json
import uuid
import re
from typing import Any, Dict, Optional
from contextvars import ContextVar

# Context variables for tracing logs across async operations
correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="")
user_id_ctx: ContextVar[str] = ContextVar("user_id", default="")

# PII Masking regular expressions
EMAIL_REGEX = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
PHONE_REGEX = re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b")
PASSWORD_REGEX = re.compile(r"(password|hashed_password|token|jwt|secret|api_key|key|token_jti)\":\s*\"([^\"]+)\"", re.IGNORECASE)

class MaskingFormatter(logging.Formatter):
    """
    Structured logging formatter that outputs JSON and masks PII/credentials.
    """
    def __init__(self, fmt: Optional[str] = None, datefmt: Optional[str] = None):
        super().__init__(fmt, datefmt)

    def mask_sensitive_data(self, val: str) -> str:
        if not val or not isinstance(val, str):
            return val
        # Mask emails
        val = EMAIL_REGEX.sub("[MASKED_EMAIL]", val)
        # Mask phones
        val = PHONE_REGEX.sub("[MASKED_PHONE]", val)
        # Mask credentials in json-like contexts
        val = PASSWORD_REGEX.sub(r'\1": "[MASKED_SENSITIVE]"', val)
        return val

    def format(self, record: logging.LogRecord) -> str:
        # Resolve trace correlation IDs
        corr_id = correlation_id_ctx.get()
        usr_id = user_id_ctx.get()

        log_data: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": self.mask_sensitive_data(record.getMessage()),
        }

        if corr_id:
            log_data["correlation_id"] = corr_id
        if usr_id:
            log_data["user_id"] = usr_id

        # Merge extra payload if dictionary
        if hasattr(record, "extra") and isinstance(record.extra, dict):
            for k, v in record.extra.items():
                if k not in log_data:
                    log_data[k] = self.mask_sensitive_data(str(v))

        # Check for exception info
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def configure_structured_logging():
    """
    Applies custom JSON/Correlation-ID formatter to uvicorn/application logs.
    """
    handler = logging.StreamHandler()
    formatter = MaskingFormatter()
    handler.setFormatter(formatter)
    
    # Configure root logger and uvicorn dependencies
    for logger_name in ["careerpilot", "uvicorn", "uvicorn.access", "uvicorn.error", "sqlalchemy.engine"]:
        log = logging.getLogger(logger_name)
        log.handlers = []
        log.addHandler(handler)
        log.propagate = False
        log.setLevel(logging.INFO)
