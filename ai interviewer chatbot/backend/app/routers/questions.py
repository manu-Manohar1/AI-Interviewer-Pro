from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
import re

from app.deps import get_current_user
from app.database import SessionLocal
from app.models_resume import Resume
from app.ai import generate_questions


router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)


# ======================================================
# Request Schema
# ======================================================

class QuestionRequest(BaseModel):
    company: str
    round: str
    job_role: str
    difficulty: str
    count: int = Field(default=5, ge=1, le=10)


# ======================================================
# Response Schema
# ======================================================

class QuestionItem(BaseModel):
    type: str
    question: str
    difficulty: str


# ======================================================
# Detect Question Type
# ======================================================

def detect_question_type(question: str) -> str:

    text = question.lower()

    hr_keywords = [
        "tell me about yourself",
        "introduce yourself",
        "strength",
        "weakness",
        "leadership",
        "team",
        "conflict",
        "challenge",
        "career",
        "motivation",
        "goal",
        "five years",
        "why should",
        "why do you",
        "internship",
    ]

    if any(keyword in text for keyword in hr_keywords):
        return "HR"

    return "Technical"


# ======================================================
# Generate Questions
# ======================================================

@router.post(
    "/generate",
    response_model=List[QuestionItem],
    status_code=status.HTTP_200_OK,
)
async def generate(
    request: QuestionRequest,
    current_user=Depends(get_current_user),
):

    db = SessionLocal()

    try:

        print("QUESTION GENERATION USER ID:", current_user.id)
        print("QUESTION GENERATION EMAIL:", current_user.email)
        print("COMPANY:", request.company)
        print("ROUND:", request.round)
        print("ROLE:", request.job_role)
        print("DIFFICULTY:", request.difficulty)

        # ==========================================
        # Get Latest Resume
        # ==========================================

        resume = (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id)
            .order_by(Resume.id.desc())
            .first()
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Please upload your resume before starting the interview.",
            )

        resume_content = resume.content or ""

        if not resume_content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume content is empty.",
            )

        # ==========================================
        # AI Prompt
        # ==========================================

        prompt = f"""
You are a Senior Interviewer at {request.company}.

COMPANY:
{request.company}

INTERVIEW ROUND:
{request.round}

JOB ROLE:
{request.job_role}

DIFFICULTY:
{request.difficulty}

CANDIDATE RESUME:
{resume_content}

Generate EXACTLY {request.count} interview questions.

GENERAL RULES:

- Personalize questions using the candidate resume.
- Match the interview style of {request.company}.
- Match the interview round.
- Match the difficulty.
- Do NOT provide answers.
- Return ONLY numbered questions.

COMPANY STYLE:

Google:
Algorithms
Data Structures
Coding
Problem Solving

Amazon:
Leadership Principles
Ownership
Customer Obsession
Backend APIs
System Design

Microsoft:
Coding
OOP
Design Patterns

Meta:
Coding
Distributed Systems
Scalability

Apple:
Optimization
Performance

Netflix:
Ownership
High Performance

OpenAI:
Python
Machine Learning
LLMs
Deep Learning
Generative AI

TCS / Infosys / Wipro:
Aptitude
SQL
OOP
HR

ROUND STYLE:

Online Assessment:
Coding
MCQs
Aptitude

Technical:
Programming
Core Subjects

System Design:
REST APIs
Databases
Microservices
Caching
Architecture

Behavioral:
Leadership
Conflict Resolution
Communication

HR:
Introduction
Strengths
Weaknesses
Career Goals

Return ONLY numbered questions.

Example:

1. Question
2. Question
3. Question
4. Question
5. Question
"""# ==========================================
        # Generate Using AI
        # ==========================================

        result = generate_questions(prompt)

        print("RAW AI QUESTION RESULT:")
        print(result)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI returned an empty response.",
            )

        # ==========================================
        # Parse AI Questions
        # ==========================================

        questions = []

        for raw_line in result.splitlines():

            line = raw_line.strip()

            if not line:
                continue

            match = re.match(
                r"^\d+[\.\)]\s*(.+)$",
                line,
            )

            if not match:
                continue

            question_text = match.group(1).strip()

            if not question_text:
                continue

            questions.append(
                QuestionItem(
                    type=detect_question_type(question_text),
                    question=question_text,
                    difficulty=request.difficulty,
                )
            )

        if len(questions) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI generated questions but parsing failed.",
            )

        questions = questions[: request.count]

        print(f"SUCCESSFULLY GENERATED {len(questions)} QUESTIONS")

        return questions

    except HTTPException:
        raise

    except Exception as exc:

        print("QUESTION GENERATION ERROR:")
        print(repr(exc))

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question generation failed: {str(exc)}",
        )

    finally:
        db.close()