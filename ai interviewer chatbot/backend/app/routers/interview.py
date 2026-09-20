from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import time
import logging

from app.database import SessionLocal
from app.deps import get_current_user
from app.models_interview import InterviewResult
from app.scoring import calculate_scores

logger = logging.getLogger("app.interview")

router = APIRouter(
    prefix="/interview",
    tags=["interview"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class EvaluateRequest(BaseModel):
    session_id: Optional[int] = Field(default=None)
    question: str = Field(..., min_length=1, max_length=1000)
    answer: str = Field(..., min_length=1, max_length=10000)
    ideal_answer: Optional[str] = Field(default="", max_length=5000)


class EvaluateResponse(BaseModel):
    technical_score: float
    communication_score: float
    confidence_score: float
    relevance_score: float
    grammar_score: float
    overall_score: float
    feedback_text: str


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(req: EvaluateRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    start_time = time.time()
    try:
        scores = calculate_scores(req.question, req.answer, req.ideal_answer or "")
        result = InterviewResult(
            user_id=current_user.id, question=req.question, answer=req.answer,
            technical_score=scores["technical"], communication_score=scores["communication"],
            confidence_score=scores["confidence"], relevance_score=scores["relevance"],
            grammar_score=scores["grammar"], overall_score=scores["overall"],
            feedback_text=scores["feedback"]
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        logger.info(f"Answer evaluated for user {current_user.id} in {time.time() - start_time:.4f}s")
        return scores
    except Exception as e:
        db.rollback()
        logger.error(f"Error evaluating answer for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to evaluate interview answer.")


@router.get("/history")
async def history(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Paginated interview history query.
    """
    return (
        db.query(InterviewResult)
        .filter(InterviewResult.user_id == current_user.id)
        .order_by(InterviewResult.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/stats")
async def stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    Aggregates stats directly via database SQL functions.
    """
    agg = (
        db.query(
            func.max(InterviewResult.overall_score).label("best_score"),
            func.avg(InterviewResult.overall_score).label("average_score"),
            func.count(InterviewResult.id).label("total_interviews"),
        )
        .filter(InterviewResult.user_id == current_user.id)
        .first()
    )

    if not agg or agg.total_interviews == 0:
        return {"best_score": 0, "average_score": 0, "total_interviews": 0}

    return {
        "best_score": round(float(agg.best_score or 0), 2),
        "average_score": round(float(agg.average_score or 0), 2),
        "total_interviews": agg.total_interviews,
    }
