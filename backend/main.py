from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, Base
from routers import auth_router, resume_router, analytics_router, job_router
from config import settings

from utils.logging_config import setup_logging

# Initialize structured logging
setup_logging()
logger = logging.getLogger(__name__)

# Rate Limiter setup
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL,
    default_limits=[settings.RATE_LIMIT_PER_MINUTE]
)

# DB Tables are now managed via Alembic migrations
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Analyzer API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, RateLimitExceeded):
        return await _rate_limit_exceeded_handler(request, exc)
    logger.error(f"Unhandled error: {str(exc)} at {request.url}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )

# Include routers
app.include_router(auth_router.router)
app.include_router(resume_router.router)
app.include_router(analytics_router.router)
app.include_router(job_router.router)

@app.on_event("startup")
def startup_event():
    logger.info("🚀 AI Resume Analyzer API started successfully")

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Resume Analyzer API"}

@app.get("/health")
def health_check():
    from database import SessionLocal
    from sqlalchemy.sql import text
    
    db_status = "error"
    ai_status = "ok" if settings.GEMINI_API_KEY else "missing"
    
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        logger.error(f"Health check DB failure: {str(e)}")
    finally:
        db.close()
        
    status = "ok" if db_status == "ok" else "degraded"
    
    return {
        "status": status,
        "database": db_status,
        "ai_service": ai_status,
        "service": "AI Resume Analyzer"
    }