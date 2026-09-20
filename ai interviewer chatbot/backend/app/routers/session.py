import os
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from google import genai

from app.database import get_db
from app.deps import get_current_user
from app.models_interview import InterviewResult
from app.models_session import InterviewSession
from app.scoring import calculate_scores
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


def _get_owned_session(db: Session, session_id: int, current_user) -> InterviewSession:
    """Fetch a session and confirm it belongs to the current user. 404s either way
    (not found vs. not yours) so we don't leak which session IDs exist to other users."""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found.",
        )
    return session


@router.get("/user/{user_id}", response_model=List[SessionResponse])
def get_user_sessions(
    user_id: int,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's sessions.",
        )

    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return sessions


@router.post("/create", response_model=SessionStartResponse, status_code=status.HTTP_201_CREATED)
def create_interview_session(
    payload: SessionCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_session = InterviewSession(
        user_id=current_user.id,
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
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    session = _get_owned_session(db, session_id, current_user)

    if session.status == "Completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview session is already completed.",
        )

    # Scores are always computed here, server-side, from the real answer text.
    # They are never accepted from the client -- a client can't be trusted to
    # grade its own answer.
    scores = calculate_scores(payload.question, payload.answer)

    new_result = InterviewResult(
        user_id=current_user.id,
        session_id=session.id,
        question=payload.question,
        answer=payload.answer,
        technical_score=scores["technical"],
        communication_score=scores["communication"],
        confidence_score=scores["confidence"],
        relevance_score=scores["relevance"],
        grammar_score=scores["grammar"],
        overall_score=scores["overall"],
        feedback_text=scores["feedback"],
    )
    db.add(new_result)

    session.answered_questions += 1
    existing_results = db.query(InterviewResult).filter(InterviewResult.session_id == session_id).all()
    all_scores = [r.overall_score for r in existing_results] + [scores["overall"]]
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
        technical_score=scores["technical"],
        communication_score=scores["communication"],
        confidence_score=scores["confidence"],
        relevance_score=scores["relevance"],
        grammar_score=scores["grammar"],
        overall_score=scores["overall"],
        feedback_text=scores["feedback"],
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
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return _get_owned_session(db, session_id, current_user)


@router.post("/{session_id}/complete", response_model=SessionResponse)
def complete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    session = _get_owned_session(db, session_id, current_user)

    session.status = "Completed"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session
