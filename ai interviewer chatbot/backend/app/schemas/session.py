from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# --- REQUEST SCHEMAS ---

class SessionCreateRequest(BaseModel):
    user_id: Optional[int] = 1
    role: str
    company: Optional[str] = None
    difficulty: Optional[str] = "Medium"
    total_questions: Optional[int] = 5


class AnswerSubmitRequest(BaseModel):
    user_id: int
    question: str
    answer: str
    technical_score: float
    communication_score: float
    confidence_score: float
    relevance_score: float
    grammar_score: float
    overall_score: float
    feedback_text: str


# --- RESPONSE SCHEMAS ---

class SessionStartResponse(BaseModel):
    session_id: int
    question_number: int
    question: str
    status: str

    class Config:
        from_attributes = True


class EvaluationDetail(BaseModel):
    technical_score: float
    communication_score: float
    confidence_score: float
    relevance_score: float
    grammar_score: float
    overall_score: float
    feedback_text: str


class AnswerSubmissionResponse(BaseModel):
    session_id: int
    question_number: int
    next_question: Optional[str] = None
    evaluation: EvaluationDetail
    is_completed: bool


class InterviewResultResponse(BaseModel):
    id: int
    session_id: int
    question: str
    answer: str
    technical_score: float
    communication_score: float
    confidence_score: float
    relevance_score: float
    grammar_score: float
    overall_score: float
    feedback_text: str

    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    id: int
    user_id: int
    role: str
    company: Optional[str] = None
    difficulty: str
    total_questions: int
    answered_questions: int
    average_score: float
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SessionDetailResponse(SessionResponse):
    results: List[InterviewResultResponse] = []

    class Config:
        from_attributes = True


# Aliases for backward compatibility
SessionCreate = SessionCreateRequest