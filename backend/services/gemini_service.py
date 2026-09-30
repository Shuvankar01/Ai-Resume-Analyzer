import json
import logging
import re
from typing import Dict, List, Optional
from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential
from config import settings

# Structured Logging
logger = logging.getLogger("gemini_service")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-2.0-flash"
        
        # Validate environment at startup
        if not self.api_key:
            logger.critical("🚨 GEMINI_API_KEY IS MISSING! AI features will be disabled.")
            self.client = None
        else:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"✅ Gemini Service initialized with model: {self.model_name}")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini Client: {str(e)}")
                self.client = None

        self.stop_words = {
            "the", "and", "with", "for", "to", "of", "in", "on", "a", "an",
            "is", "are", "as", "by", "at", "from", "or"
        }

    def _extract_keywords(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        return list(set(w for w in words if w not in self.stop_words))

    def _simple_fallback(self, resume_text: str, job_description: str) -> Dict:
        """Graceful fallback if AI fails"""
        logger.warning("⚠️ Using heuristic fallback for resume analysis")
        jd_keywords = set(self._extract_keywords(job_description))
        resume_keywords = set(self._extract_keywords(resume_text))

        matched = jd_keywords & resume_keywords
        missing = jd_keywords - resume_keywords

        score = (len(matched) / max(len(jd_keywords), 1)) * 100

        return {
            "ats_score": round(score, 2),
            "matched_keywords": list(matched)[:10],
            "missing_keywords": list(missing)[:10],
            "recommendations": "AI synchronization unavailable. Focus on including missing technical keywords naturally.",
            "recruiter_summary": "Heuristic fallback analysis (Keyword-based)",
            "candidate_strengths": list(matched)[:3]
        }

    # Gemini returns 503 UNAVAILABLE under load fairly often, and a short retry
    # window drops the whole AI pass into the heuristic fallback on a transient
    # capacity blip. Five attempts over ~29s rides those out while staying well
    # inside the Celery 240s soft time limit for the whole analysis job.
    @retry(stop=stop_after_attempt(5), wait=wait_exponential(min=2, max=15))
    def _call_ai(self, prompt: str) -> str:
        """Call Gemini with exponential backoff using the new SDK"""
        if not self.client:
            raise RuntimeError("Gemini Client not initialized")

        logger.info(f"🚀 AI Request -> Model: {self.model_name}")
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt
        )
        
        if not response or not response.text:
            logger.error("❌ AI returned empty or null response")
            raise ValueError("Empty AI response")
            
        logger.info("✅ AI Response received successfully")
        return response.text.strip()

    async def generate_resume_preview(self, resume_text: str, filename: str) -> dict:
        """Generate a structured preview of the resume using Gemini"""
        prompt = f"""
        You are a world-class Recruitment AI and ATS Intelligence Engine.
        Analyze the following resume and extract a comprehensive structured dashboard preview.
        Do NOT compare it to a job description. Just analyze the resume on its own merits.

        STRICT SCHEMA (JSON ONLY):
        {{
            "snapshot": {{"name": "Candidate Name", "estimated_experience": "X Years", "target_roles": ["Role 1"], "expected_salary": "$120k - $150k", "career_stage": "Senior", "market_value": "High", "notice_period": "2 Weeks", "preferred_location": "Remote / New York", "employment_type": "Full-time", "availability": "Immediate", "role_match_confidence": 85, "resume_strength": "Very Strong", "interview_readiness": "High"}},
            "health": {{
                "overall_score": 85, "overall_score_explanation": "Short punchy reason", 
                "ai_confidence": 90, "ai_confidence_explanation": "Short punchy reason", 
                "upload_quality": 95, "upload_quality_explanation": "Short punchy reason", 
                "completeness": 80, "completeness_explanation": "Short punchy reason"
            }},
            "summary": "AI summary string",
            "ats": {{"readability_score": 80, "formatting_score": 90, "buzzword_density": 40, "explanation": "Short punchy reason"}},
            "skills": {{
                "matched": {{"languages": ["Python", "JavaScript"], "frameworks": ["React", "FastAPI"], "databases": ["PostgreSQL"], "cloud": ["AWS"], "devops": ["Docker"], "soft_skills": ["Leadership"], "ai_ml": ["TensorFlow"], "testing": ["Jest"], "version_control": ["Git"]}},
                "missing": [
                    {{"name": "Kubernetes", "category": "devops", "priority": "high"}},
                    {{"name": "TypeScript", "category": "languages", "priority": "medium"}}
                ],
                "recommended": ["GraphQL", "CI/CD"]
            }},
            "sections": ["Summary", "Experience"],
            "roles": [{{"title": "Role Name", "confidence": 95}}],
            "recommendations": [{{"priority": "high", "category": "formatting", "suggestion": "Fix margins"}}],
            "risks": ["Too long"],
            "strengths": ["Strong leadership", "Cloud native"],
            "weaknesses": ["Lack of testing experience"],
            "interview_questions": ["How do you scale PostgreSQL?", "Explain React hooks architecture."],
            "learning_roadmap": ["Learn Kubernetes for modern deployment", "Study advanced TypeScript generics"],
            "career_growth_suggestions": ["Transition towards Staff Engineer", "Take ownership of system design"]
        }}

        IMPORTANT RULES:
        1. For `skills.matched`, ONLY output real technical/professional skills (e.g. Python, React, PostgreSQL, Docker, AWS). 
        2. NEVER use generic placebo terms like "startup", "working", "operating", "business", "company", "project" as technical skills.
        3. For `skills.missing`, provide 3-5 critical skills commonly expected for their target roles that are NOT on the resume, prioritized strictly as "high", "medium", or "low".
        4. Keep all explanations under 15 words.

        Resume Filename: {filename}
        Resume Content:
        {resume_text}
        """

        try:
            raw_response = self._call_ai(prompt)
            clean_json = raw_response
            if "```json" in raw_response:
                clean_json = raw_response.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_response:
                clean_json = raw_response.split("```")[1].split("```")[0].strip()

            result = json.loads(clean_json)
            
            # Add static metadata and actions locally
            from datetime import datetime
            import uuid
            
            result["metadata"] = {
                "filename": filename,
                "file_type": "application/pdf",
                "file_size_mb": 0.0,
                "upload_timestamp": datetime.utcnow().isoformat() + "Z",
                "version": "1.0.0"
            }
            
            result["actions"] = [
                {"id": str(uuid.uuid4()), "label": "Run Full Analysis", "action_type": "analyze"},
                {"id": str(uuid.uuid4()), "label": "Compare to Job Description", "action_type": "compare"},
                {"id": str(uuid.uuid4()), "label": "Generate Report", "action_type": "report"}
            ]
            
            return result

        except Exception as e:
            logger.error(f"💥 AI Preview Failure: {str(e)}")
            from datetime import datetime
            import uuid
            return {
                "snapshot": {"name": "Candidate", "estimated_experience": "Unknown", "target_roles": ["Professional"]},
                "metadata": {"filename": filename, "file_type": "application/pdf", "file_size_mb": 0.0, "upload_timestamp": datetime.utcnow().isoformat() + "Z", "version": "1.0.0"},
                "health": {
                    "overall_score": 50, "overall_score_explanation": "AI service unavailable",
                    "ai_confidence": 0, "ai_confidence_explanation": "Could not parse document",
                    "upload_quality": 50, "upload_quality_explanation": "Default fallback applied",
                    "completeness": 50, "completeness_explanation": "Insufficient data"
                },
                "summary": "AI synchronization unavailable. Could not generate comprehensive summary.",
                "ats": {"readability_score": 50, "formatting_score": 50, "buzzword_density": 0, "explanation": "Failed to parse ATS data"},
                "skills": {
                    "matched": {"languages": [], "frameworks": [], "databases": [], "cloud": [], "devops": [], "soft_skills": []}, 
                    "missing": []
                },
                "sections": [],
                "roles": [],
                "recommendations": [{"priority": "high", "category": "System", "suggestion": "Try again later."}],
                "actions": [{"id": str(uuid.uuid4()), "label": "Run Full Analysis", "action_type": "analyze"}],
                "risks": ["AI analysis failed."],
                "strengths": [],
                "weaknesses": []
            }

    async def analyze_resume(self, resume_text: str, job_description: str) -> Dict:
        prompt = f"""
        You are a world-class Recruitment AI and ATS Intelligence Engine.
        Analyze the following resume against the job description.

        STRICT SCHEMA (JSON ONLY):
        {{
          "ats_score": number,
          "matched_keywords": [string],
          "missing_keywords": [string],
          "recommendations": string,
          "recruiter_summary": string,
          "candidate_strengths": [string]
        }}

        Resume:
        {resume_text}

        Job Description:
        {job_description}
        """

        try:
            raw_response = self._call_ai(prompt)
            
            # Clean markdown JSON if present
            clean_json = raw_response
            if "```json" in raw_response:
                clean_json = raw_response.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_response:
                clean_json = raw_response.split("```")[1].split("```")[0].strip()

            result = json.loads(clean_json)
            
            # Standardize response keys to match frontend expectations
            return {
                "ats_score": result.get("ats_score", 0),
                "matched_keywords": result.get("matched_keywords", []),
                "missing_keywords": result.get("missing_keywords", []),
                "recommendations": result.get("recommendations", ""),
                "recruiter_summary": result.get("recruiter_summary", ""),
                "candidate_strengths": result.get("candidate_strengths", [])
            }

        except Exception as e:
            logger.error(f"💥 AI Pipeline Failure: {str(e)}")
            return self._simple_fallback(resume_text, job_description)

    def _parse_json_response(self, raw_response: str) -> Dict:
        """Shared fence-stripping used by every structured prompt in this service.

        Both existing prompts already hand-parse markdown fences, so this
        centralizes the same behaviour for the new recruiter parser rather than
        introducing a different convention.
        """
        clean_json = raw_response
        if "```json" in raw_response:
            clean_json = raw_response.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_response:
            clean_json = raw_response.split("```")[1].split("```")[0].strip()
        return json.loads(clean_json)

    async def parse_recruiter_bio(self, bio_text: str, filename: str) -> Dict:
        """Extract recruiter profile fields from an uploaded bio or resume PDF.

        Used by recruiter onboarding Option B. Mirrors the never-raises
        contract of the other methods here: a failure returns a heuristic
        extraction so the onboarding form always has something to show.
        """
        prompt = f"""
        You are a Recruitment Intelligence Engine. Read the following recruiter
        bio or resume and extract structured hiring profile fields.

        STRICT SCHEMA (JSON ONLY):
        {{
            "full_name": "Recruiter Name",
            "experience_level": "e.g. Senior (8+ years)",
            "company_name": "Current or most recent company, or empty string",
            "industry": "Hiring domain / industry vertical, e.g. Fintech",
            "designation": "Current role title, e.g. Senior Talent Partner",
            "hiring_goals": "One or two sentences describing what they are hiring for",
            "tech_stack": ["Python", "React", "AWS"],
            "bio_summary": "Two sentence professional summary of the recruiter"
        }}

        IMPORTANT RULES:
        1. `tech_stack` must be real technologies this recruiter has hired for or
           works with. NEVER invent generic words like "startup", "business",
           "company", "clients", "hiring" as technologies.
        2. If a field is genuinely absent from the document, return an empty
           string or empty list for it. Do NOT guess.
        3. `hiring_goals` and `bio_summary` must each be under 40 words.

        Source Filename: {filename}
        Document Content:
        {bio_text}
        """

        try:
            raw_response = self._call_ai(prompt)
            result = self._parse_json_response(raw_response)

            def as_list(value):
                if isinstance(value, list):
                    return [str(v).strip() for v in value if str(v).strip()]
                if isinstance(value, str) and value.strip():
                    return [p.strip() for p in value.split(",") if p.strip()]
                return []

            def as_text(value):
                return value.strip() if isinstance(value, str) else ""

            return {
                "full_name": as_text(result.get("full_name")),
                "experience_level": as_text(result.get("experience_level")),
                "company_name": as_text(result.get("company_name")),
                "industry": as_text(result.get("industry")),
                "designation": as_text(result.get("designation")),
                "hiring_goals": as_text(result.get("hiring_goals")),
                "tech_stack": as_list(result.get("tech_stack")),
                "bio_summary": as_text(result.get("bio_summary")),
                "source_filename": filename,
                "parse_status": "ai",
            }
        except Exception as e:
            logger.error(f"💥 Recruiter Bio Parse Failure: {str(e)}")
            # Heuristic fallback so the onboarding form still gets populated
            # rather than leaving the recruiter at a dead end.
            return {
                "full_name": "",
                "experience_level": "",
                "company_name": "",
                "industry": "",
                "designation": "",
                "hiring_goals": "",
                "tech_stack": [],
                "bio_summary": (
                    "AI parsing is unavailable right now, so we could not read this "
                    "document. Fill the form manually or try uploading again later."
                ),
                "source_filename": filename,
                "parse_status": "fallback",
            }

# Global Instance
gemini_service = GeminiService()
