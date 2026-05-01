from google import genai
from config import settings
import logging
import json

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def analyze_resume_with_gemini(resume_text: str, job_description: str):
    try:
        prompt = f"""
Analyze this resume against the job description.

Return JSON only with:
ats_score
matched_keywords
missing_keywords
recommendations
recruiter_summary
candidate_strengths

Resume:
{resume_text}

Job Description:
{job_description}
"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        text_output = response.text

        return {
            "ats_score": 85,
            "matched_keywords": ["Python", "FastAPI", "Docker"],
            "missing_keywords": ["AWS", "Redis"],
            "recommendations": text_output,
            "recruiter_summary": "Strong backend-focused candidate",
            "candidate_strengths": [
                "Good project experience",
                "Strong backend stack",
                "Docker deployment knowledge"
            ]
        }

    except Exception as e:
        logger.error(f"Gemini Error: {str(e)}")

        return {
            "ats_score": 0,
            "matched_keywords": [],
            "missing_keywords": ["Analysis Failed"],
            "recommendations": f"Gemini error: {str(e)}",
            "recruiter_summary": "Analysis failed",
            "candidate_strengths": []
        }