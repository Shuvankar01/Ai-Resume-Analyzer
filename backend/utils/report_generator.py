from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
import io

def generate_analysis_report(analysis_data: dict, candidate_name: str) -> bytes:
    """Generates a PDF report of the analysis."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, f"AI Resume Analysis Report: {candidate_name}")
    
    c.setFont("Helvetica", 14)
    c.drawString(50, height - 100, f"ATS Score: {analysis_data.get('ats_score', 0)} / 100")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 130, "Matched Keywords:")
    c.setFont("Helvetica", 11)
    
    y = height - 150
    matched = ", ".join(analysis_data.get("matched_keywords", []))
    lines = simpleSplit(matched, "Helvetica", 11, width - 100)
    for line in lines:
        c.drawString(50, y, line)
        y -= 15
        
    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Missing Keywords (e.g., Docker, AWS, Redis, System Design):")
    c.setFont("Helvetica", 11)
    
    y -= 20
    missing = ", ".join(analysis_data.get("missing_keywords", []))
    lines = simpleSplit(missing, "Helvetica", 11, width - 100)
    for line in lines:
        c.drawString(50, y, line)
        y -= 15
        
    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Recommendations:")
    c.setFont("Helvetica", 11)
    
    y -= 20
    recs = analysis_data.get("recommendations", "")
    lines = simpleSplit(recs, "Helvetica", 11, width - 100)
    for line in lines:
        if y < 50:
            c.showPage()
            y = height - 50
        c.drawString(50, y, line)
        y -= 15

    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
