from fastapi import APIRouter, HTTPException, Depends
from services.job_service import job_service
from schemas import JobResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
