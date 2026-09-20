from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.deps import get_current_user
from app.models_interview import InterviewResult

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Scoped to the current user only -- this previously had no auth at
    # all and aggregated every user's results together, which both leaked
    # data across accounts and made the numbers meaningless per-user.
    base_query = db.query(InterviewResult).filter(
        InterviewResult.user_id == current_user.id
    )

    total_interviews = base_query.count()

    average_score = (
        db.query(func.avg(InterviewResult.overall_score))
        .filter(InterviewResult.user_id == current_user.id)
        .scalar()
        or 0
    )

    highest_score = (
        db.query(func.max(InterviewResult.overall_score))
        .filter(InterviewResult.user_id == current_user.id)
        .scalar()
        or 0
    )

    # InterviewResult has no 'status' column, so this is a placeholder
    # success indicator, not a real pass/fail rate.
    success_rate = 100 if total_interviews > 0 else 0

    return {
        "total_interviews": total_interviews,
        "average_score": round(average_score, 2),
        "highest_score": round(highest_score, 2),
        "success_rate": success_rate,
    }
