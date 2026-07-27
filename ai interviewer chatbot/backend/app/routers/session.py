from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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

# Import question generator from existing questions router/service
try:
    from app.routers.questions import generate_interview_questions
except ImportError:
    try:
        from app.routers.questions import generate_questions as generate_interview_questions
    except ImportError:
        generate_interview_questions = None

router = APIRouter(
    prefix="/session",
    tags=["Interview Session"],
)


@router.get("/user/{user_id}", response_model=List[SessionResponse])
def get_user_sessions(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetches all past interview sessions for a specific user.
    """
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
    """
    Initializes a new multi-question interview session and generates Question 1.
    """
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
        company=payload.company,
        difficulty=payload.difficulty or "Medium",
        total_questions=payload.total_questions or 5,
        answered_questions=0,
        average_score=0.0,
        status="In Progress",
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    first_question = f"Tell me about your experience and background as a {payload.role}."

    if generate_interview_questions:
        try:
            generated = generate_interview_questions(
                role=payload.role,
                company=payload.company or "General",
                difficulty=payload.difficulty or "Medium",
                num_questions=1,
            )
            if isinstance(generated, list) and len(generated) > 0:
                first_question = generated[0]
            elif isinstance(generated, str) and generated.strip():
                first_question = generated
        except Exception:
            pass

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
    """
    Saves an answer, updates metrics, and returns evaluation with a UNIQUE next question.
    """
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

    # 1. Save current answer result to DB
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

    # 2. Update session metrics
    session.answered_questions += 1
    existing_results = db.query(InterviewResult).filter(InterviewResult.session_id == session_id).all()
    all_scores = [r.overall_score for r in existing_results] + [payload.overall_score]
    session.average_score = sum(all_scores) / len(all_scores)

    next_question = None
    is_completed = False

    # 3. Check progress & generate unique next question
    if session.answered_questions >= session.total_questions:
        session.status = "Completed"
        session.completed_at = datetime.now(timezone.utc)
        is_completed = True
    else:
        asked_questions = [r.question for r in existing_results] + [payload.question]
        next_q_num = session.answered_questions + 1

        fallbacks = [
            f"Describe a challenging technical project you worked on as a {session.role}.",
            f"How do you handle debugging and troubleshooting critical issues in production?",
            f"Explain key system design concepts relevant to building scalable {session.role} applications.",
            f"What are your best practices for code reviews and writing maintainable code?",
        ]
        fallback_index = (next_q_num - 2) % len(fallbacks)
        default_next_q = fallbacks[fallback_index]

        if generate_interview_questions:
            try:
                generated = generate_interview_questions(
                    role=session.role,
                    company=session.company or "General",
                    difficulty=session.difficulty,
                    num_questions=3,
                )
                if isinstance(generated, list):
                    candidate_q = next((q for q in generated if q not in asked_questions), None)
                    next_question = candidate_q if candidate_q else generated[0]
                elif isinstance(generated, str) and generated.strip() and generated not in asked_questions:
                    next_question = generated
                else:
                    next_question = default_next_q
            except Exception:
                next_question = default_next_q
        else:
            next_question = default_next_q

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