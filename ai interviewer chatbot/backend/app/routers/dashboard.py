from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.deps import get_current_user
from app.models_interview import InterviewResult
from app.models_resume import Resume

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
def get_dashboard_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_interviews = (
        db.query(InterviewResult)
        .join(InterviewResult.session)
        .filter_by(user_id=current_user.id)
        .count()
    )

    average_score = (
        db.query(func.avg(InterviewResult.overall_score))
        .join(InterviewResult.session)
        .filter_by(user_id=current_user.id)
        .scalar()
        or 0
    )

    best_score = (
        db.query(func.max(InterviewResult.overall_score))
        .join(InterviewResult.session)
        .filter_by(user_id=current_user.id)
        .scalar()
        or 0
    )

    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .count()
    )

    return {
        "interviews": total_interviews,
        "averageScore": round(average_score, 1),
        "bestScore": round(best_score, 1),
        "resumes": resumes,
    }