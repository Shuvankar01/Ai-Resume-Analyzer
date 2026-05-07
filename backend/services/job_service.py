import uuid
import redis
import logging
from typing import Optional, Dict
from config import settings
from database import SessionLocal
import models
from utils.serializer import redis_dumps, redis_loads

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL)

    def create_job(self, user_id: int, resume_id: int) -> str:
        job_id = str(uuid.uuid4())
        
        # 1. Persist to PostgreSQL (Source of Truth)
        db = SessionLocal()
        try:
            new_job = models.Job(
                id=job_id,
                user_id=user_id,
                resume_id=resume_id,
                status="pending"
            )
            db.add(new_job)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to create job in DB: {str(e)}")
        finally:
            db.close()

        # 2. Cache in Redis for fast polling
        job_data = {
            "id": job_id,
            "status": "pending",
            "result": None,
            "error": None
        }
        try:
            self.redis_client.setex(f"job:{job_id}", 3600, redis_dumps(job_data))
        except Exception as e:
            logger.error(f"Redis write failure: {str(e)}")
        return job_id

    def update_job(self, job_id: str, status: str, result: Optional[Dict] = None, error: Optional[str] = None):
        # 1. Update PostgreSQL
        db = SessionLocal()
        try:
            db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
            if db_job:
                db_job.status = status
                db_job.is_done = status in ["done", "failed"]
                if result:
                    db_job.result = redis_dumps(result)
                if error:
                    db_job.error_message = error
                db.commit()
        except Exception as e:
            logger.error(f"Failed to update job in DB: {str(e)}")
        finally:
            db.close()

        # 2. Update Redis Cache
        try:
            job_raw = self.redis_client.get(f"job:{job_id}")
            job_data = redis_loads(job_raw) if job_raw else {"id": job_id}
            job_data["status"] = status
            job_data["is_done"] = status in ["done", "failed"]
            if result:
                job_data["result"] = result
            if error:
                job_data["error_message"] = error
            self.redis_client.setex(f"job:{job_id}", 3600, redis_dumps(job_data))
        except Exception as e:
            logger.error(f"Redis update failure: {str(e)}")

    def get_job(self, job_id: str) -> Optional[Dict]:
        # 1. Try Redis Cache first (Fast)
        try:
            job_raw = self.redis_client.get(f"job:{job_id}")
            if job_raw:
                return redis_loads(job_raw)
        except Exception as e:
            logger.warning(f"Redis read failure, falling back to DB: {str(e)}")

        # 2. Fallback to PostgreSQL
        db = SessionLocal()
        try:
            db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
            if db_job:
                return {
                    "id": db_job.id,
                    "status": db_job.status,
                    "is_done": db_job.is_done,
                    "job_name": db_job.job_name,
                    "job_metadata": redis_loads(db_job.job_metadata) if db_job.job_metadata else None,
                    "result": redis_loads(db_job.result) if db_job.result else None,
                    "error_message": db_job.error_message
                }
        finally:
            db.close()
        return None

job_service = JobService()
