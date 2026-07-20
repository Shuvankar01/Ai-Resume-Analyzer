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

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
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
            "snapshot": {{"name": "Candidate Name", "estimated_experience": "X Years", "target_roles": ["Role 1"]}},
            "health": {{"overall_score": 85, "ai_confidence": 90, "upload_quality": 95, "completeness": 80}},
            "summary": "AI summary string",
            "ats": {{"readability_score": 80, "formatting_score": 90, "buzzword_density": 40}},
            "skills": {{
                "matched": {{"languages": [], "frameworks": [], "tools": [], "soft_skills": [], "domain_keywords": []}},
                "missing": {{"languages": [], "frameworks": [], "tools": [], "soft_skills": [], "domain_keywords": []}}
            }},
            "sections": ["Summary", "Experience"],
            "roles": [{{"title": "Role Name", "confidence": 95}}],
            "recommendations": [{{"priority": "high", "category": "formatting", "suggestion": "Fix margins"}}],
            "risks": ["Too long"]
        }}

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
                "health": {"overall_score": 50, "ai_confidence": 0, "upload_quality": 50, "completeness": 50},
                "summary": "AI synchronization unavailable. Could not generate comprehensive summary.",
                "ats": {"readability_score": 50, "formatting_score": 50, "buzzword_density": 0},
                "skills": {"matched": {"languages": [], "frameworks": [], "tools": [], "soft_skills": [], "domain_keywords": []}, "missing": {"languages": [], "frameworks": [], "tools": [], "soft_skills": [], "domain_keywords": []}},
                "sections": [],
                "roles": [],
                "recommendations": [{"priority": "high", "category": "System", "suggestion": "Try again later."}],
                "actions": [{"id": str(uuid.uuid4()), "label": "Run Full Analysis", "action_type": "analyze"}],
                "risks": ["AI analysis failed."]
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

# Global Instance
gemini_service = GeminiService()
