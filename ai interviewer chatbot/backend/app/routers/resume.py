import io
import os
import time
import logging
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from typing import Any, Dict, Optional

import pdfplumber
from docx import Document

from app.deps import get_current_user
from app.resume_analyzer import analyze_resume as run_resume_analysis

logger = logging.getLogger("app.resume")

router = APIRouter(
    prefix="/resume",
    tags=["resume"],
)

MAX_RESUME_SIZE = 5 * 1024 * 1024  # 5 MB Limit
ALLOWED_RESUME_EXTENSIONS = {".pdf", ".docx"}


def _extract_text(contents: bytes, ext: str) -> str:
    if ext == ".pdf":
        text_parts = []
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                text_parts.append(page.extract_text() or "")
        return "\n".join(text_parts)

    if ext == ".docx":
        doc = Document(io.BytesIO(contents))
        return "\n".join(p.text for p in doc.paragraphs)

    return ""


@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    role: Optional[str] = Form(default="Software Engineer"),
    current_user=Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Extracts text from an uploaded resume (PDF/DOCX, max 5MB) and runs it
    through the real rule-based analyzer in app/resume_analyzer.py --
    skill matching, ATS scoring, and recommendations based on the actual
    resume content, not a fixed canned response.
    """
    start_time = time.time()
    user_id = getattr(current_user, "id", "unknown")
    filename = resume.filename or "resume.pdf"

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_RESUME_EXTENSIONS:
        await resume.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid format '{ext}'. Only PDF and DOCX files are permitted.",
        )

    contents = await resume.read()
    if len(contents) > MAX_RESUME_SIZE:
        await resume.close()
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Resume file size exceeds maximum limit of 5 MB.",
        )

    await resume.close()

    try:
        text = _extract_text(contents, ext)
    except Exception as e:
        logger.error(f"Resume text extraction failed for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read this file. Please make sure it's a valid, non-corrupted PDF or DOCX.",
        )

    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No readable text found in this resume. If it's a scanned image, "
                   "try a text-based PDF or DOCX instead.",
        )

    try:
        analysis = run_resume_analysis(text, role or "Software Engineer")

        # Map the analyzer's field names onto what the frontend expects
        # (ResumeAnalyzer.jsx reads .score, .strengths, .missingSkills, .suggestions).
        result = {
            "score": analysis["overall_score"],
            "keywordMatch": analysis["ats_score"],
            "strengths": analysis["strengths"] or ["No strong keyword matches detected yet."],
            "weaknesses": analysis["weaknesses"] or [],
            "missingSkills": analysis["missing_skills"],
            "suggestions": " ".join(analysis["recommendations"]) if isinstance(analysis["recommendations"], list) else (analysis["recommendations"] or ""),
            "skillsFound": analysis["skills_found"],
            "projectsDetected": analysis["projects_detected"],
            "certificationsDetected": analysis["certifications_detected"],
        }

        elapsed = time.time() - start_time
        logger.info(f"Resume analysis completed for user {user_id} in {elapsed:.2f}s")
        return result

    except Exception as e:
        logger.error(f"Resume analysis error for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error analyzing resume.",
        )
