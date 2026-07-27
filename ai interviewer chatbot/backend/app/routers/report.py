from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.database import SessionLocal
from app.deps import get_current_user
from app.models_interview import InterviewResult
from app.services.pdf_generator import generate_interview_report

router = APIRouter(
    prefix="/report",
    tags=["Report"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/download/{result_id}")
def download_report(
    result_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    interview = (
        db.query(InterviewResult)
        .filter(
            InterviewResult.id == result_id,
            InterviewResult.user_id == current_user.id,
        )
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    pdf = generate_interview_report(
        current_user,
        interview,
    )

    return StreamingResponse(
        BytesIO(pdf),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f"attachment; filename=Interview_Report_{result_id}.pdf"
        },
    )