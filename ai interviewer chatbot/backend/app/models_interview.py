from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class InterviewResult(Base):
    __tablename__ = "interview_results"

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

    session_id = Column(
        Integer,
        ForeignKey("interview_sessions.id"),
        nullable=True,
    )

    question = Column(
        String,
        nullable=False,
    )

    answer = Column(
        String,
        nullable=False,
    )

    technical_score = Column(
        Float,
        nullable=False,
    )

    communication_score = Column(
        Float,
        nullable=False,
    )

    confidence_score = Column(
        Float,
        nullable=False,
    )

    relevance_score = Column(
        Float,
        nullable=False,
    )

    grammar_score = Column(
        Float,
        nullable=False,
    )

    overall_score = Column(
        Float,
        nullable=False,
    )

    feedback_text = Column(
        String,
        nullable=False,
    )

    # Relationship back to User (ADDED THIS LINE)
    user = relationship("User", back_populates="results")

    # Relationship back to InterviewSession
    session = relationship(
        "InterviewSession",
        back_populates="results",
    )