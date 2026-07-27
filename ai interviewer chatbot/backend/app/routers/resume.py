from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import io
import re

from app.database import SessionLocal
from app import models_resume
from app.deps import get_current_user
from app.resume_analyzer import analyze_resume

router = APIRouter(
    prefix="/resume",
    tags=["resume"],
)


# --------------------------------------------------
# Database
# --------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------------------------------
# Resume Analysis Request
# --------------------------------------------------

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    role: str


# --------------------------------------------------
# Allowed File Types
# --------------------------------------------------

ALLOWED = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


# --------------------------------------------------
# PDF Text Extraction
# --------------------------------------------------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    import pdfplumber

    text = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text.append(page_text)

    return "\n".join(text)


# --------------------------------------------------
# DOCX Text Extraction
# --------------------------------------------------

def extract_text_from_docx(file_bytes: bytes) -> str:
    import docx
    from io import BytesIO

    doc = docx.Document(BytesIO(file_bytes))

    paragraphs = [
        p.text
        for p in doc.paragraphs
    ]

    return "\n".join(paragraphs)


# --------------------------------------------------
# Resume Parser
# --------------------------------------------------

def parse_text_simple(text: str):

    skills = set()

    projects = []

    education = []

    skill_keywords = [
        "Python",
        "Java",
        "C",
        "C++",
        "SQL",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "FastAPI",
        "Flask",
        "Django",
        "React",
        "Node",
        "JavaScript",
        "TypeScript",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "Machine Learning",
        "Deep Learning",
        "Docker",
        "Git",
        "GitHub",
        "AWS",
        "Azure",
        "Linux",
    ]

    for skill in skill_keywords:
        if re.search(
            rf"\b{re.escape(skill)}\b",
            text,
            re.IGNORECASE,
        ):
            skills.add(skill)

    for line in text.splitlines():
        if re.search(
            r"project|developed|built|created|implemented",
            line,
            re.IGNORECASE,
        ):
            projects.append(line.strip())

    for line in text.splitlines():
        if re.search(
            r"college|university|bachelor|master|degree|b.tech|m.tech",
            line,
            re.IGNORECASE,
        ):
            education.append(line.strip())

    return {
        "skills": ", ".join(sorted(skills)),
        "projects": "\n".join(projects),
        "education": "\n".join(education),
    }


# --------------------------------------------------
# Upload Resume
# --------------------------------------------------

@router.post("/upload")
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    if file.content_type not in ALLOWED:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type",
        )

    contents = file.file.read()

    try:

        if file.content_type == "application/pdf":
            text = extract_text_from_pdf(contents)

        else:
            text = extract_text_from_docx(contents)

    finally:
        file.file.close()

    parsed = parse_text_simple(text)

    resume = models_resume.Resume(
        user_id=current_user.id,
        filename=file.filename,
        content=text,
        skills=parsed["skills"],
        projects=parsed["projects"],
        education=parsed["education"],
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "filename": resume.filename,
        "skills": resume.skills,
        "projects": resume.projects,
        "education": resume.education,
    }


# --------------------------------------------------
# Resume Analyzer
# --------------------------------------------------

@router.post("/analyze")
def analyze_resume_api(request: ResumeAnalysisRequest):

    result = analyze_resume(
        request.resume_text,
        request.role,
    )

    return result