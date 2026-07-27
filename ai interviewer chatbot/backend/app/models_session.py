from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    role = Column(
        String,
        nullable=False,
    )

    company = Column(
        String,
        nullable=True,
    )

    difficulty = Column(
        String,
        default="Medium",
    )

    total_questions = Column(
        Integer,
        default=5,
    )

    answered_questions = Column(
        Integer,
        default=0,
    )

    average_score = Column(
        Float,
        default=0.0,
    )

    status = Column(
        String,
        default="In Progress",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationship back to User (ADDED THIS LINE)
    user = relationship("User", back_populates="sessions")

    # Relationship to InterviewResult
    results = relationship(
        "InterviewResult",
        back_populates="session",
        cascade="all, delete-orphan",
    )