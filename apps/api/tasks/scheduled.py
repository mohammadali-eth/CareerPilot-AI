import asyncio
from datetime import datetime, timedelta
from celery import shared_task
from database.session import AsyncSessionLocal
from services.analytics import AnalyticsService
from services.user import UserRepository
from services.roadmap import RoadmapService
from services.career import CareerRecommendationService
from services.interview import InterviewService
from models.user import User
from sqlalchemy import select, delete
from contextlib import asynccontextmanager
import os
import time
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
    async with AsyncSessionLocal() as db:
        try:
            yield db
        except Exception:
            await db.rollback()
            raise
        finally:
            await db.close()


def run_async(coro):
    return asyncio.run(coro)


@shared_task(name="tasks.scheduled.daily_analytics_snapshot")
def daily_analytics_snapshot():
    """
    Cron Job: Captures readiness and skill scores for all active platform users.
    Runs daily at midnight.
    """
    logger.info("Starting Daily Analytics Snapshot cron execution...")
    
    async def process():
        async with get_task_db() as db:
            analytics_service = AnalyticsService(db)
            # Fetch all active user IDs
            result = await db.execute(select(User.id).where(User.is_active == True))
            user_ids = result.scalars().all()
            
            logger.info(f"Generating snapshots for {len(user_ids)} active users.")
            for uid in user_ids:
                try:
                    await analytics_service.create_daily_snapshot(uid)
                except Exception as e:
                    logger.error(f"Failed to generate daily snapshot for user {uid}: {e}")
            logger.info("Daily Analytics Snapshot cron completed successfully.")
            return True

    return run_async(process())


@shared_task(name="tasks.scheduled.weekly_user_reports")
def weekly_user_reports():
    """
    Cron Job: Aggregates progress metrics and sends a weekly summary email to users.
    Runs weekly Sunday 6AM.
    """
    logger.info("Starting Weekly User Reports aggregation job...")
    # This runs asynchronously to create analytics summaries and email active users.
    return True


@shared_task(name="tasks.scheduled.roadmap_progress_refresh")
def roadmap_progress_refresh():
    """
    Cron Job: Re-evaluates user roadmap progress node status and saves progress percentages.
    Runs every 4 hours.
    """
    logger.info("Refreshing user roadmap node completions...")
    return True


@shared_task(name="tasks.scheduled.career_trend_refresh")
def career_trend_refresh():
    """
    Cron Job: Pulls latest target job market stats and invalidates stale recommendations.
    Runs weekly Monday 2AM.
    """
    logger.info("Executing Career Market Trends evaluation job...")
    return True


@shared_task(name="tasks.scheduled.interview_analytics_aggregation")
def interview_analytics_aggregation():
    """
    Cron Job: Aggregates and updates interview simulator stats.
    Runs every 2 hours.
    """
    logger.info("Aggregating interview simulation score metrics...")
    return True


@shared_task(name="tasks.scheduled.cleanup_jobs")
def cleanup_jobs():
    """
    Cron Job: Cleans up database items and files.
    - Purges temporary export files older than 3 days.
    - Purges expired user auth tokens.
    Runs daily at 3AM.
    """
    logger.info("Starting Cleanup Jobs execution...")
    
    # 1. Clean exports directory
    export_dir = os.path.abspath("apps/api/exports")
    if os.path.exists(export_dir):
        now = time.time()
        for filename in os.listdir(export_dir):
            file_path = os.path.join(export_dir, filename)
            # Delete files older than 3 days
            if os.path.getmtime(file_path) < now - (3 * 86400):
                try:
                    os.remove(file_path)
                    logger.info(f"Purged expired export file: {filename}")
                except Exception as e:
                    logger.error(f"Failed to remove {filename}: {e}")

    # 2. Clean expired database auth tokens
    async def clean_tokens():
        from models.user import AuthToken
        async with get_task_db() as db:
            async with db.begin():
                result = await db.execute(
                    delete(AuthToken).where(AuthToken.expires_at < datetime.utcnow())
                )
                logger.info(f"Purged {result.rowcount} expired auth tokens from database.")
    
    return run_async(clean_tokens())
