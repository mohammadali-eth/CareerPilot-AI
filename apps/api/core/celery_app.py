import os
from celery import Celery
from celery.schedules import crontab
from core.config import settings

# Initialize Celery app instance
celery_app = Celery(
    "careerpilot_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Standard celery configuration guidelines
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600, # 1 hour max execution
    worker_concurrency=4, # Concurrent worker processes
    
    # Configure Celery Beat Scheduled Tasks
    beat_schedule={
        "daily-analytics-snapshot": {
            "task": "tasks.scheduled.daily_analytics_snapshot",
            "schedule": crontab(hour="0", minute="0"), # Run daily at midnight
        },
        "weekly-user-reports": {
            "task": "tasks.scheduled.weekly_user_reports",
            "schedule": crontab(day_of_week="sunday", hour="6", minute="0"), # Run weekly Sunday 6AM
        },
        "roadmap-progress-refresh": {
            "task": "tasks.scheduled.roadmap_progress_refresh",
            "schedule": crontab(minute="0", hour="*/4"), # Run every 4 hours
        },
        "career-trend-refresh": {
            "task": "tasks.scheduled.career_trend_refresh",
            "schedule": crontab(day_of_week="monday", hour="2", minute="0"), # Run weekly Monday 2AM
        },
        "interview-analytics-aggregation": {
            "task": "tasks.scheduled.interview_analytics_aggregation",
            "schedule": crontab(minute="0", hour="*/2"), # Run every 2 hours
        },
        "cleanup-temporary-files": {
            "task": "tasks.scheduled.cleanup_jobs",
            "schedule": crontab(hour="3", minute="0"), # Run daily at 3AM
        },
    }
)

# Autodiscover background task modules
celery_app.autodiscover_tasks(["tasks.background", "tasks.scheduled"])
