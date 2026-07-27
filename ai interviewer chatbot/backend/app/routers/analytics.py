from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models_interview import InterviewResult

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):
    total_interviews = db.query(InterviewResult).count()

    average_score = (
        db.query(
            func.avg(InterviewResult.overall_score)
        ).scalar()
        or 0
    )

    highest_score = (
        db.query(
            func.max(InterviewResult.overall_score)
        ).scalar()
        or 0
    )

    # Your InterviewResult model has no 'status' column,
    # so use a simple success rate for now.
    success_rate = 100 if total_interviews > 0 else 0

    return {
        "total_interviews": total_interviews,
        "average_score": round(average_score, 2),
        "highest_score": round(highest_score, 2),
        "success_rate": success_rate,
    }