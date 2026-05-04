import time
import logging
from sqlalchemy import create_engine, text
from config import settings
import subprocess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db():
    engine = create_engine(settings.DATABASE_URL)
    retries = 10
    while retries > 0:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("✅ Database is ready!")
            return True
        except Exception as e:
            logger.info(f"⏳ Waiting for database... ({retries} retries left)")
            retries -= 1
            time.sleep(3)
    logger.error("❌ Database not ready after 10 retries.")
    return False

def run_migrations():
    logger.info("🚀 Running migrations...")
    try:
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        logger.info("✅ Migrations completed successfully!")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Migrations failed: {e}")
        exit(1)

if __name__ == "__main__":
    if wait_for_db():
        run_migrations()
    else:
        exit(1)
