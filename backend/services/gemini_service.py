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

    async def analyze_resume(self, resume_text: str, job_description: str) -> Dict:
        """Main analysis entry point with error handling and fallback"""
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
