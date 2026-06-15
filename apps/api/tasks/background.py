import asyncio
from uuid import UUID
from contextlib import asynccontextmanager
from celery import shared_task
from database.session import AsyncSessionLocal
from services.analytics import AnalyticsService
from services.user import UserRepository
from utils.email import email_service
import os
import logging

logger = logging.getLogger("careerpilot")

# Pre-import all models to register them in metadata class registry
import models.user
import models.admin
import models.analytics
import models.career
import models.interview
import models.mentor
import models.resume
import models.roadmap

@asynccontextmanager
async def get_task_db():
    """
    Context manager to spin up scoped database sessions for celery tasks.
    """
    async with AsyncSessionLocal() as db:
        try:
            yield db
        except Exception:
            await db.rollback()
            raise
        finally:
            await db.close()


def run_async(coro):
    """
    Helper to execute async coroutines in sync celery workers.
    """
    return asyncio.run(coro)


@shared_task(name="tasks.background.export_report_task", bind=True, max_retries=3)
def export_report_task(self, user_id_str: str, report_id_str: str, export_type: str):
    """
    Background worker task to export McKinsey-style analytics PDF/Excel reports
    and deliver them directly to the user's registered email.
    """
    logger.info(f"Starting background export for report {report_id_str} ({export_type})")
    
    async def process():
        user_id = UUID(user_id_str)
        report_id = UUID(report_id_str)
        
        async with get_task_db() as db:
            # 1. Fetch user email
            user_repo = UserRepository(db)
            user_obj = await user_repo.get(user_id)
            if not user_obj:
                logger.error(f"User {user_id_str} not found in database.")
                return False

            # 2. Run export service
            analytics_service = AnalyticsService(db)
            export_res = await analytics_service.export_report(user_id, report_id, export_type)
            
            # 3. Read generated file from disk to attach to email
            filename = f"careerpilot_report_{report_id_str}.{export_type.lower()}"
            export_dir = os.path.abspath("apps/api/exports")
            file_path = os.path.join(export_dir, filename)
            
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    file_bytes = f.read()
                
                # 4. Dispatch email with PDF attachment
                email_service.send_report_email(
                    to_email=user_obj.email,
                    report_name=f"Report_{report_id_str[:8]}",
                    report_bytes=file_bytes
                )
                logger.info(f"Report {report_id_str} successfully sent to {user_obj.email}")
                return True
            else:
                logger.error(f"Export file not found at: {file_path}")
                return False

    try:
        return run_async(process())
    except Exception as exc:
        logger.error(f"Error executing report export task: {exc}")
        raise self.retry(exc=exc, countdown=10)


@shared_task(name="tasks.background.send_email_notification_task", bind=True, max_retries=3)
def send_email_notification_task(self, to_email: str, subject: str, html_content: str):
    """
    Generic task to dispatch notification emails in the background.
    """
    logger.info(f"Dispatching notification email to {to_email}")
    try:
        success = email_service.send_email(to_email, subject, html_content)
        if not success:
            raise Exception("SMTP dispatch failed")
        return True
    except Exception as exc:
        logger.error(f"Failed to dispatch email: {exc}")
        raise self.retry(exc=exc, countdown=15)
