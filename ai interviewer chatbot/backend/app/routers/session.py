import os
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google import genai

from app.database import get_db
from app.models import User
from app.models_interview import InterviewResult
from app.models_session import InterviewSession
from app.schemas.session import (
    AnswerSubmissionResponse,
    AnswerSubmitRequest,
    EvaluationDetail,
    InterviewResultResponse,
    SessionCreateRequest,
    SessionDetailResponse,
    SessionResponse,
    SessionStartResponse,
)

logger = logging.getLogger("app.session")

router = APIRouter(
    prefix="/session",
    tags=["Interview Session"],
)

# Initialize Gemini Client directly for reliable session question generation
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def generate_session_question(role: str, company: str, difficulty: str, excluded_questions: List[str] = None) -> str:
    """Helper function to synchronously generate a single targeted question via Gemini."""
    if not client:
        return f"Tell me about a challenging {role} project you built."

    excluded_str = ", ".join([f'"{q}"' for q in (excluded_questions or [])])
    prompt = (
        f"Generate 1 distinct {difficulty} interview question for a {role} position at {company}. "
        f"Do NOT generate any of the following questions: [{excluded_str}]. "
        f"Return ONLY the question text without numbers, quotes, or formatting."
    )

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        question_text = (response.text or "").strip().lstrip("0123456789.-* ")
        return question_text if question_text else f"Explain key system design trade-offs for {role}."
    except Exception as e:
        logger.error(f"Failed to generate Gemini question: {e}")
        return f"Describe a time you solved a complex issue as a {role}."


@router.get("/user/{user_id}", response_model=List[SessionResponse])
def get_user_sessions(
    user_id: int,
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )
    return sessions


@router.post("/create", response_model=SessionStartResponse, status_code=status.HTTP_201_CREATED)
def create_interview_session(
    payload: SessionCreateRequest,
    db: Session = Depends(get_db)
):
    target_user_id = payload.user_id if payload.user_id is not None else 1

    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        user = User(
            id=target_user_id,
            email=f"user{target_user_id}@example.com",
            name="Demo User",
            hashed_password="demo_password_hash",
        )
        db.add(user)
        db.commit()

    new_session = InterviewSession(
        user_id=target_user_id,
        role=payload.role,
        company=payload.company or "General",
        difficulty=payload.difficulty or "Medium",
        total_questions=payload.total_questions or 5,
        answered_questions=0,
        average_score=0.0,
        status="In Progress",
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    first_question = generate_session_question(
        role=payload.role,
        company=payload.company or "General",
        difficulty=payload.difficulty or "Medium",
    )

    return SessionStartResponse(
        session_id=new_session.id,
        question_number=1,
        question=first_question,
        status=new_session.status,
    )


@router.post("/{session_id}/answer", response_model=AnswerSubmissionResponse)
def submit_answer_for_session(
    session_id: int,
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )

    if session.status == "Completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview session is already completed."
        )

    new_result = InterviewResult(
        user_id=payload.user_id,
        session_id=session.id,
        question=payload.question,
        answer=payload.answer,
        technical_score=payload.technical_score,
        communication_score=payload.communication_score,
        confidence_score=payload.confidence_score,
        relevance_score=payload.relevance_score,
        grammar_score=payload.grammar_score,
        overall_score=payload.overall_score,
        feedback_text=payload.feedback_text,
    )
    db.add(new_result)

    session.answered_questions += 1
    existing_results = db.query(InterviewResult).filter(InterviewResult.session_id == session_id).all()
    all_scores = [r.overall_score for r in existing_results] + [payload.overall_score]
    session.average_score = sum(all_scores) / len(all_scores)

    next_question = None
    is_completed = False

    if session.answered_questions >= session.total_questions:
        session.status = "Completed"
        session.completed_at = datetime.now(timezone.utc)
        is_completed = True
    else:
        asked_questions = [r.question for r in existing_results] + [payload.question]
        next_question = generate_session_question(
            role=session.role,
            company=session.company,
            difficulty=session.difficulty,
            excluded_questions=asked_questions,
        )

    db.commit()

    evaluation_summary = EvaluationDetail(
        technical_score=payload.technical_score,
        communication_score=payload.communication_score,
        confidence_score=payload.confidence_score,
        relevance_score=payload.relevance_score,
        grammar_score=payload.grammar_score,
        overall_score=payload.overall_score,
        feedback_text=payload.feedback_text,
    )

    return AnswerSubmissionResponse(
        session_id=session.id,
        question_number=session.answered_questions if is_completed else session.answered_questions + 1,
        next_question=next_question,
        evaluation=evaluation_summary,
        is_completed=is_completed,
    )


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session_details(
    session_id: int,
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )
    return session


@router.post("/{session_id}/complete", response_model=SessionResponse)
def complete_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )

    session.status = "Completed"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session