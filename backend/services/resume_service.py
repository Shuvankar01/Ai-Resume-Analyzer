import json
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import models, schemas
from utils.pdf_parser import extract_text_from_pdf
from utils.gemini_client import analyze_resume_with_gemini
from utils.cache import get_cached_analysis, set_cached_analysis

logger = logging.getLogger(__name__)

async def process_resume_upload(file: UploadFile, db: Session, user_id: int):
    logger.info(f"Processing upload for file: {file.filename} (User ID: {user_id})")
    
    # 1. MIME Type Validation
    if file.content_type != "application/pdf" and not file.filename.endswith('.pdf'):
        logger.warning(f"Unsupported file type: {file.filename} (MIME: {file.content_type})")
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # 2. File Size Validation (10MB limit)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    try:
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            logger.warning(f"File too large: {file.filename} ({len(contents)} bytes)")
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
        # Reset file pointer for any subsequent reads (if needed, but we already have contents)
        # file.seek(0)
        extracted_text = extract_text_from_pdf(contents)
        
        new_resume = models.Resume(
            owner_id=user_id,
            filename=file.filename,
            extracted_text=extracted_text
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        
        logger.info(f"Successfully uploaded and saved resume ID: {new_resume.id}")
        return new_resume
    except Exception as e:
        logger.error(f"Error during resume upload: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process resume upload")

async def analyze_candidate_resume(resume_id: int, job_description: str, db: Session, user_id: int):
    logger.info(f"Initiating analysis for resume ID: {resume_id}")
    
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id, 
        models.Resume.owner_id == user_id
    ).first()
    
    if not resume:
        logger.warning(f"Resume ID {resume_id} not found for User {user_id}")
        raise HTTPException(status_code=404, detail="Resume not found")
        
    job_id_hash = hash(job_description)
    cached = get_cached_analysis(resume_id, job_id_hash)
    if cached:
        logger.info(f"Returning cached analysis for resume ID {resume_id}")
        return cached

    try:
        analysis_result = await analyze_resume_with_gemini(resume.extracted_text, job_description)
        
        new_analysis = models.Analysis(
            resume_id=resume_id,
            ats_score=analysis_result.get("ats_score", 0),
            matched_keywords=json.dumps(analysis_result.get("matched_keywords", [])),
            missing_keywords=json.dumps(analysis_result.get("missing_keywords", [])),
            recommendations=analysis_result.get("recommendations", ""),
            recruiter_summary=analysis_result.get("recruiter_summary", ""),
            candidate_strengths=json.dumps(analysis_result.get("candidate_strengths", []))
        )
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        
        response_data = schemas.AnalysisResponse(
            id=new_analysis.id,
            resume_id=new_analysis.resume_id,
            job_description_id=None,
            ats_score=new_analysis.ats_score,
            matched_keywords=json.loads(new_analysis.matched_keywords) if new_analysis.matched_keywords else [],
            missing_keywords=json.loads(new_analysis.missing_keywords) if new_analysis.missing_keywords else [],
            recommendations=new_analysis.recommendations,
            recruiter_summary=new_analysis.recruiter_summary,
            candidate_strengths=json.loads(new_analysis.candidate_strengths) if new_analysis.candidate_strengths else [],
            created_at=new_analysis.created_at
        )
        
        set_cached_analysis(resume_id, job_id_hash, response_data.model_dump(), exp=3600*24)
        logger.info(f"Analysis completed and cached for resume ID {resume_id}")
        return response_data
    except Exception as e:
        logger.error(f"Analysis failed for resume ID {resume_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="AI Analysis failed")
