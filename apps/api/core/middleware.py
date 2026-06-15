import time
import uuid
import re
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from utils.logging import correlation_id_ctx, user_id_ctx
from utils.redis import redis_manager
import logging

logger = logging.getLogger("careerpilot")

# Compiles security validation sanitization checks
XSS_PATTERNS = [
    re.compile(r"<script.*?>.*?</script.*?>", re.IGNORECASE | re.DOTALL),
    re.compile(r"javascript\s*:", re.IGNORECASE),
    re.compile(r"onload\s*=", re.IGNORECASE),
    re.compile(r"onerror\s*=", re.IGNORECASE),
]

class TraceMiddleware(BaseHTTPMiddleware):
    """
    Trace correlation ID middleware to tie logs of a request context together.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        corr_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        correlation_id_ctx.set(corr_id)
        
        # Set user context if present in auth state
        user_id = request.state.user_id if hasattr(request.state, "user_id") else ""
        user_id_ctx.set(user_id)

        response: Response = await call_next(request)
        response.headers["X-Correlation-ID"] = corr_id
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    IP-based and user-based request rate limiting.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Exclude documentation or health endpoints
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        # Identify client (Authenticated User ID or Remote Client IP)
        user_id = request.headers.get("Authorization") or request.client.host
        # Clean identity key for Redis namespace
        identity_key = str(hash(user_id))

        # Endpoint-specific limits (e.g., login or AI generation has lower thresholds)
        limit = 60
        window = 60
        if "auth" in request.url.path:
            limit = 15  # Login/Register limit
        elif any(path in request.url.path for path in ["interview", "mentor", "resume"]):
            limit = 30  # AI processing limit

        is_limited = await redis_manager.is_rate_limited(identity_key, limit, window)
        if is_limited:
            logger.warning(f"Rate limit exceeded for client identity: {user_id}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "RateLimitExceeded",
                    "message": "Too many requests. Please throttle execution attempts.",
                }
            )

        return await call_next(request)


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    Structured server performance and latency metrics calculation.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        
        try:
            response: Response = await call_next(request)
            duration = (time.perf_counter() - start_time) * 1000
            
            # Log slow queries/endpoints > 500ms
            if duration > 500:
                logger.warning(
                    f"Slow request detected: {request.method} {request.url.path} took {duration:.2f}ms",
                    extra={"duration_ms": duration, "status_code": response.status_code}
                )
            else:
                logger.info(
                    f"Request {request.method} {request.url.path} completed in {duration:.2f}ms",
                    extra={"duration_ms": duration, "status_code": response.status_code}
                )
            return response
            
        except Exception as e:
            duration = (time.perf_counter() - start_time) * 1000
            logger.exception(
                f"Unhandled Exception on {request.method} {request.url.path} after {duration:.2f}ms: {e}"
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "InternalServerError",
                    "message": "An unexpected server error occurred during transaction execution.",
                }
            )


class InputSanitizationMiddleware(BaseHTTPMiddleware):
    """
    Validate incoming query parameters and headers against XSS vector injection tags.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Check URL query params for potential script injections
        query_string = str(request.url.query)
        for pattern in XSS_PATTERNS:
            if pattern.search(query_string):
                logger.warning("Sanitizer caught blocked XSS pattern in URL Query Params.")
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "error": "MalformedRequest",
                        "message": "Input contains forbidden characters or scripts.",
                    }
                )
        return await call_next(request)
