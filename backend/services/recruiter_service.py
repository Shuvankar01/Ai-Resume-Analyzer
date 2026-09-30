"""Recruiter profile, candidate actions and candidate intelligence.

Everything a recruiter does on the dashboard that used to be a localStorage
write is now persisted here, so status survives a device change and the
dashboard metrics can be calculated from real rows instead of seeded numbers.
"""
import logging
from typing import Optional, Dict, Any, List

from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, UploadFile

import models
import schemas
from services.gemini_service import gemini_service
from utils.pdf_parser import extract_text_from_pdf
from utils.serializer import redis_dumps, redis_loads
from utils.cache import get_cached_preview

logger = logging.getLogger(__name__)

# Maps the frontend action vocabulary to the pipeline status it produces.
ACTION_TO_STATUS = {
    "SHORTLIST": "Shortlisted",
    "REJECT": "Rejected",
    "INTERVIEW": "Interview",
    "OFFER": "Offer",
}

# Statuses the pipeline tracker counts, in funnel order.
PIPELINE_STATUSES = ["Shortlisted", "Interview", "Offer", "Hired", "Rejected"]


# ── Recruiter profile ──────────────────────────────────────────────

def get_or_create_profile(db: Session, user: models.User) -> models.RecruiterProfile:
    """Fetch the recruiter's profile row, creating an empty one on first access.

    An empty row is what marks "not onboarded yet" — the frontend checks
    `onboarding_completed` and required fields, not row existence alone.
    """
    profile = db.query(models.RecruiterProfile).filter(
        models.RecruiterProfile.user_id == user.id
    ).first()

    if profile is None:
        profile = models.RecruiterProfile(user_id=user.id, onboarding_completed=False)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        logger.info(f"Created empty recruiter profile for user {user.id}")

    return profile


def serialize_profile(profile: models.RecruiterProfile) -> schemas.RecruiterProfileResponse:
    return schemas.RecruiterProfileResponse(
        id=profile.id,
        company_name=profile.company_name,
        industry=profile.industry,
        designation=profile.designation,
        hiring_goals=profile.hiring_goals,
        experience_level=profile.experience_level,
        tech_stack=redis_loads(profile.tech_stack) or [],
        bio_summary=profile.bio_summary,
        source_filename=profile.source_filename,
        onboarding_completed=bool(profile.onboarding_completed),
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


def update_profile(db: Session, user: models.User, payload: schemas.RecruiterProfileUpdate) -> schemas.RecruiterProfileResponse:
    """Option A — save the manual onboarding form.

    Onboarding is only marked complete once the recruiter has actually supplied
    the core company/domain details, so a blank submit does not silently mark
    the account as onboarded.
    """
    profile = get_or_create_profile(db, user)

    for field in ("company_name", "industry", "designation", "hiring_goals",
                  "experience_level", "bio_summary", "source_filename"):
        value = getattr(payload, field, None)
        if value is not None:
            setattr(profile, field, value)

    if payload.tech_stack is not None:
        profile.tech_stack = redis_dumps([s for s in payload.tech_stack if s])

    profile.onboarding_completed = bool(
        profile.company_name
        and profile.industry
    )

    db.commit()
    db.refresh(profile)
    logger.info(f"Recruiter profile updated for user {user.id} (onboarded={profile.onboarding_completed})")
    return serialize_profile(profile)


async def parse_recruiter_bio_upload(db: Session, user: models.User, file: UploadFile) -> Dict[str, Any]:
    """Option B — read a recruiter bio/resume PDF with the AI parser and apply
    the result to the profile.

    Re-uploading is allowed at any time and simply overwrites the AI-derived
    fields, which is what makes "re-verify or update profile details" work.
    """
    if not (file.content_type == "application/pdf" or (file.filename or "").endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    MAX_FILE_SIZE = 10 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    try:
        bio_text = extract_text_from_pdf(contents)
    except Exception as e:
        logger.error(f"Failed to extract recruiter bio PDF text: {str(e)}")
        raise HTTPException(status_code=400, detail="Could not read that PDF. Try a text-based PDF.")

    if not bio_text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in that PDF.")

    parsed = await gemini_service.parse_recruiter_bio(bio_text, file.filename)

    profile = get_or_create_profile(db, user)
    profile.experience_level = parsed.get("experience_level") or profile.experience_level
    profile.tech_stack = redis_dumps(parsed.get("tech_stack") or [])
    profile.bio_summary = parsed.get("bio_summary") or profile.bio_summary
    profile.source_filename = parsed.get("source_filename")
    # Only fill company/domain if the recruiter has not set them manually yet,
    # so an AI guess never clobbers a deliberate answer.
    if not profile.company_name and parsed.get("company_name"):
        profile.company_name = parsed["company_name"]
    if not profile.industry and parsed.get("industry"):
        profile.industry = parsed["industry"]
    if not profile.designation and parsed.get("designation"):
        profile.designation = parsed["designation"]
    if not profile.hiring_goals and parsed.get("hiring_goals"):
        profile.hiring_goals = parsed["hiring_goals"]
    profile.onboarding_completed = bool(profile.company_name and profile.industry)

    db.commit()
    db.refresh(profile)

    return {
        "parsed": parsed,
        "profile": serialize_profile(profile),
    }


# ── Candidate actions ──────────────────────────────────────────────

def record_action(db: Session, recruiter: models.User, payload: schemas.CandidateActionCreate) -> schemas.CandidateActionResponse:
    """Persist a shortlist / reject / interview / offer decision."""
    status = ACTION_TO_STATUS.get(payload.action.upper())
    if not status:
        raise HTTPException(status_code=400, detail=f"Unknown action '{payload.action}'")

    action = models.CandidateAction(
        recruiter_id=recruiter.id,
        candidate_id=payload.candidate_id,
        candidate_name=payload.candidate_name,
        action=payload.action.upper(),
        status=status,
        ats_score=payload.ats_score,
        notes=payload.notes,
        scheduled_for=payload.scheduled_for,
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    logger.info(f"Recruiter {recruiter.id} recorded {action.action} for {action.candidate_name}")
    return schemas.CandidateActionResponse.model_validate(action)


def list_actions(db: Session, recruiter: models.User, limit: int = 200) -> List[schemas.CandidateActionResponse]:
    rows = (
        db.query(models.CandidateAction)
        .filter(models.CandidateAction.recruiter_id == recruiter.id)
        .order_by(models.CandidateAction.created_at.desc())
        .limit(limit)
        .all()
    )
    return [schemas.CandidateActionResponse.model_validate(r) for r in rows]


# ── Candidate intelligence ─────────────────────────────────────────

def _cached_preview(db: Session, resume: models.Resume) -> Dict[str, Any]:
    """Return the cached AI resume preview for a resume, or an empty dict.

    The preview is generated for the resume owner and cached in Redis by
    `resume_id`; a recruiter reading it is a read-only consumer of that same
    payload, so we go through the cache rather than re-invoking Gemini.
    """
    if not resume:
        return {}
    return get_cached_preview(resume.id) or {}


def _flatten_skills(skills: Dict[str, Any]) -> List[str]:
    if not isinstance(skills, dict):
        return []
    flat: List[str] = []
    for values in skills.values():
        if isinstance(values, list):
            flat.extend(str(v) for v in values if v)
    return flat


def get_candidate_intelligence(db: Session, candidate: models.User) -> schemas.CandidateIntelligence:
    """Assemble the complete AI-parsed dataset for one candidate.

    Combines the ATS `Analysis` row (score, matched/missing keywords,
    recruiter briefing) with the AI resume-preview payload (snapshot fields
    plus the categorized skills breakdown).

    The preview is read from cache; the router awaits generation on a cache
    miss before calling this, so a first-time view still returns a full payload.
    """
    resume = (
        db.query(models.Resume)
        .filter(models.Resume.owner_id == candidate.id)
        .order_by(models.Resume.created_at.desc())
        .first()
    )
    analysis = None
    if resume:
        analysis = (
            db.query(models.Analysis)
            .filter(models.Analysis.resume_id == resume.id)
            .order_by(models.Analysis.id.desc())
            .first()
        )

    matched = redis_loads(analysis.matched_keywords) or [] if analysis else []
    missing = redis_loads(analysis.missing_keywords) or [] if analysis else []
    strengths = redis_loads(analysis.candidate_strengths) or [] if analysis else []

    # Keyword match % = share of JD keywords the resume actually hit.
    total_keywords = len(matched) + len(missing)
    keyword_match = int(round((len(matched) / total_keywords) * 100)) if total_keywords else None

    preview: Dict[str, Any] = _cached_preview(db, resume)
    snapshot: Dict[str, Any] = preview.get("snapshot") or {}
    skills_section: Dict[str, Any] = preview.get("skills") or {}
    skills_breakdown = skills_section.get("matched") or {}
    primary_stack = _flatten_skills(skills_breakdown)

    return schemas.CandidateIntelligence(
        contact=schemas.CandidateContact(
            id=candidate.id,
            name=candidate.full_name or candidate.email,
            email=candidate.email,
            resume_id=resume.id if resume else None,
            filename=resume.filename if resume else None,
        ),
        ats_score=analysis.ats_score if analysis else None,
        keyword_match_percent=keyword_match,
        matched_keywords=matched,
        missing_keywords=missing,
        candidate_strengths=strengths,
        ai_briefing=analysis.recruiter_summary if analysis else None,
        recommendations=analysis.recommendations if analysis else None,
        experience=snapshot.get("estimated_experience"),
        expected_salary=snapshot.get("expected_salary"),
        location=snapshot.get("preferred_location"),
        availability=snapshot.get("availability"),
        notice_period=snapshot.get("notice_period"),
        career_stage=snapshot.get("career_stage"),
        market_value=snapshot.get("market_value"),
        target_roles=snapshot.get("target_roles") or [],
        summary=preview.get("summary") or None,
        primary_tech_stack=primary_stack,
        skills_breakdown=skills_breakdown,
        strengths=preview.get("strengths") or [],
        weaknesses=preview.get("weaknesses") or [],
        report_url=f"/resumes/{resume.id}/report" if resume and analysis else None,
        has_analysis=analysis is not None,
        has_preview=bool(preview),
    )


# ── Dashboard metrics ──────────────────────────────────────────────

def get_pipeline_breakdown(db: Session, recruiter: models.User) -> Dict[str, int]:
    """Live pipeline counts from the persisted action rows.

    Every candidate is counted under its most recent status only, so moving a
    candidate from Shortlisted to Interview does not inflate two stages.
    """
    rows = (
        db.query(models.CandidateAction)
        .filter(models.CandidateAction.recruiter_id == recruiter.id)
        .order_by(models.CandidateAction.created_at.desc())
        .all()
    )

    latest: Dict[Any, str] = {}
    for row in rows:
        key = row.candidate_id if row.candidate_id is not None else row.candidate_name
        latest.setdefault(key, row.status)

    breakdown = {status: 0 for status in PIPELINE_STATUSES}
    for status in latest.values():
        if status in breakdown:
            breakdown[status] += 1
    return breakdown


def _sourced_scope(db: Session, recruiter: models.User) -> tuple:
    """The candidate ids and resume ids this recruiter has actually sourced.

    Dashboard counts are scoped to the recruiter's own activity rather than the
    whole platform, so a brand new account reads 0 for every figure instead of
    inheriting totals produced by other accounts. Only candidates the recruiter
    has recorded an action against count as sourced.
    """
    candidate_ids = [
        cid
        for (cid,) in db.query(models.CandidateAction.candidate_id)
        .filter(
            models.CandidateAction.recruiter_id == recruiter.id,
            models.CandidateAction.candidate_id.isnot(None),
        )
        .distinct()
        .all()
    ]
    if not candidate_ids:
        return [], []

    resume_ids = [
        rid
        for (rid,) in db.query(models.Resume.id)
        .filter(models.Resume.owner_id.in_(candidate_ids))
        .all()
    ]
    return candidate_ids, resume_ids


def get_recruiter_metrics(db: Session, recruiter: models.User) -> Dict[str, Any]:
    """Real dashboard metrics for the consolidated KPI cards.

    A newly registered recruiter gets 0 across the board because every figure
    is derived from rows that only exist once real work happens, and the
    sourcing figures are scoped to this recruiter's own actions.
    """
    open_jobs = db.query(models.JobDescription).filter(
        models.JobDescription.recruiter_id == recruiter.id
    ).count()

    candidate_ids, resume_ids = _sourced_scope(db, recruiter)
    candidates = len(candidate_ids)
    if resume_ids:
        resumes_analyzed = (
            db.query(models.Analysis)
            .filter(models.Analysis.resume_id.in_(resume_ids))
            .count()
        )
        avg_score = (
            db.query(func.avg(models.Analysis.ats_score))
            .filter(models.Analysis.resume_id.in_(resume_ids))
            .scalar()
            or 0.0
        )
    else:
        resumes_analyzed = 0
        avg_score = 0.0

    pipeline = get_pipeline_breakdown(db, recruiter)
    pipeline_total = sum(
        pipeline[s] for s in ("Shortlisted", "Interview", "Offer", "Hired")
    )

    offers_sent = pipeline["Offer"] + pipeline["Hired"]
    offer_acceptance_rate = (
        int(round((pipeline["Hired"] / offers_sent) * 100)) if offers_sent else 0
    )

    # Time-to-hire: mean days between a candidate's first recorded action and
    # the action that moved them to Hired. Zero until someone is actually hired.
    rows = (
        db.query(models.CandidateAction)
        .filter(models.CandidateAction.recruiter_id == recruiter.id)
        .order_by(models.CandidateAction.created_at.asc())
        .all()
    )
    first_seen: Dict[Any, Any] = {}
    hire_durations = []
    for row in rows:
        key = row.candidate_id if row.candidate_id is not None else row.candidate_name
        first_seen.setdefault(key, row.created_at)
        if row.status == "Hired" and row.created_at and first_seen[key]:
            hire_durations.append((row.created_at - first_seen[key]).total_seconds() / 86400)
    time_to_hire = int(round(sum(hire_durations) / len(hire_durations))) if hire_durations else 0

    # AI benchmark: completed analyses vs. everything ever requested, and the
    # mean wall-clock time of completed analysis jobs.
    done_jobs = db.query(models.Job).filter(models.Job.status == "done").all()
    total_jobs = db.query(models.Job).count()
    durations = [
        (j.updated_at - j.created_at).total_seconds()
        for j in done_jobs
        if j.created_at and j.updated_at and (j.updated_at - j.created_at).total_seconds() >= 0
    ]
    avg_processing_seconds = round(sum(durations) / len(durations), 1) if durations else 0.0
    completion_rate = int(round((len(done_jobs) / total_jobs) * 100)) if total_jobs else 0

    return {
        "open_jobs": open_jobs,
        "resumes_analyzed": resumes_analyzed,
        "candidates": candidates,
        "average_ats_score": round(avg_score, 2),
        "pipeline": pipeline,
        "pipeline_total": pipeline_total,
        "offers_sent": offers_sent,
        "offer_acceptance_rate": offer_acceptance_rate,
        "time_to_hire_days": time_to_hire,
        "avg_processing_seconds": avg_processing_seconds,
        "ai_completion_rate": completion_rate,
    }
