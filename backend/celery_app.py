from celery import Celery
from config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["services.tasks"] # We will move worker logic here
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300, # 5 minutes hard limit
    task_soft_time_limit=240, # 4 minutes soft limit
    worker_prefetch_multiplier=1, # One task per worker process at a time
    worker_max_tasks_per_child=100, # Restart worker after 100 tasks to prevent memory leaks
    broker_connection_retry_on_startup=True
)
