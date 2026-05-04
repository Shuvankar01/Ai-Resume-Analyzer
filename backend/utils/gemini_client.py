import json
import logging
import re
from typing import Dict

from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential
from config import settings

logger = logging.getLogger(__name__)

# Initialize Gemini client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# -------------------------------
# 🔹 SMART KEYWORD EXTRACTION
# -------------------------------
STOPWORDS = {
    "the", "and", "with", "for", "to", "of", "in", "on", "a", "an",
    "is", "are", "as", "by", "at", "from", "or"
}


def extract_keywords(text: str):
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    return set(w for w in words if w not in STOPWORDS)


# -------------------------------
# 🔹 FALLBACK ATS (NO AI)
# -------------------------------
def simple_ats(resume_text: str, job_description: str) -> Dict:
    jd_keywords = extract_keywords(job_description)
    resume_keywords = extract_keywords(resume_text)

    matched = jd_keywords & resume_keywords
    missing = jd_keywords - resume_keywords

    score = (len(matched) / max(len(jd_keywords), 1)) * 100

    return {
        "ats_score": round(score, 2),
        "matched_keywords": list(matched)[:10],
        "missing_keywords": list(missing)[:10],
        "recommendations": "AI unavailable. Improve missing skills and include relevant keywords naturally.",
        "recruiter_summary": "Fallback keyword-based analysis used",
        "candidate_strengths": list(matched)[:3]
    }


# -------------------------------
# 🔹 GEMINI CALL WITH RETRY
# -------------------------------
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
def call_gemini(prompt: str):
    return client.models.generate_content(
        model=settings.GEMINI_MODEL,   # use gemini-1.5-flash
        contents=prompt,
    )


# -------------------------------
# 🔹 MAIN ANALYSIS FUNCTION
# -------------------------------
async def analyze_resume_with_gemini(resume_text: str, job_description: str) -> Dict:
    prompt = f"""
You are an advanced ATS system.

Return STRICT JSON ONLY:
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
        response = call_gemini(prompt)

        text_output = response.text.strip()

        # 🔹 Clean markdown if AI returns ```json
        if text_output.startswith("```"):
            text_output = text_output.replace("```json", "").replace("```", "").strip()

        # 🔹 Parse JSON safely
        try:
            result = json.loads(text_output)

            required_keys = [
                "ats_score",
                "matched_keywords",
                "missing_keywords",
                "recommendations",
                "recruiter_summary",
                "candidate_strengths"
            ]

            if not all(k in result for k in required_keys):
                raise ValueError("Invalid schema from AI")

            return result

        except Exception:
            logger.warning("Invalid AI JSON format. Falling back.")
            return simple_ats(resume_text, job_description)

    except Exception as e:
        logger.error(f"Gemini Error: {str(e)}")

        # 🔥 SMART FALLBACK (quota / API failure)
        return simple_ats(resume_text, job_description)