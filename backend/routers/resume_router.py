from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
import json
from database import get_db
import models, schemas
from utils.security import get_current_active_user
from utils.pdf_parser import extract_text_from_pdf
from utils.gemini_client import analyze_resume_with_gemini
from utils.cache import get_cached_analysis, set_cached_analysis
from utils.report_generator import generate_analysis_report
from fastapi.responses import Response

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=schemas.ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    contents = await file.read()
    extracted_text = extract_text_from_pdf(contents)
    
    new_resume = models.Resume(
        owner_id=current_user.id,
        filename=file.filename,
        extracted_text=extracted_text
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume

@router.post("/{resume_id}/analyze", response_model=schemas.AnalysisResponse)
async def analyze_resume(
    resume_id: int,
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Optional caching
    # This requires hashing the JD or saving the JD and using its ID. 
    # For simplicity, we create a dummy job_id = hash(job_description)
    job_id_hash = hash(job_description)
    cached = get_cached_analysis(resume_id, job_id_hash)
    if cached:
        # Create Analysis response from cache
        # Wait, if we return from cache, we might want to still save it to DB if it's not there
        return cached

    analysis_result = await analyze_resume_with_gemini(resume.extracted_text, job_description)
    
    # Save to DB
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
    return response_data

@router.get("/{resume_id}/report")
async def download_report(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    analysis = db.query(models.Analysis).filter(models.Analysis.resume_id == resume_id).order_by(models.Analysis.id.desc()).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    # Check if user owns the resume
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if resume.owner_id != current_user.id and not current_user.is_recruiter:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    analysis_data = {
        "ats_score": analysis.ats_score,
        "matched_keywords": json.loads(analysis.matched_keywords),
        "missing_keywords": json.loads(analysis.missing_keywords),
        "recommendations": analysis.recommendations
    }
    
    pdf_bytes = generate_analysis_report(analysis_data, current_user.full_name or "Candidate")
    
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=report_{resume_id}.pdf"})
