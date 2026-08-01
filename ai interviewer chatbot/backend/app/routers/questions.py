import os
import time
import logging
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional

from app.deps import get_current_user

logger = logging.getLogger("app.questions")

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)

# Configure Gemini Client Globally
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class QuestionRequest(BaseModel):
    role: str = Field(..., min_length=1, max_length=100)
    company: Optional[str] = Field(default="Google", max_length=100)
    difficulty: Optional[str] = Field(default="Medium", max_length=50)
    round_type: Optional[str] = Field(default="Technical", max_length=50)


class QuestionResponse(BaseModel):
    questions: List[str]


@router.post("/generate", response_model=QuestionResponse)
async def generate_questions(
    req: QuestionRequest,
    current_user=Depends(get_current_user),
):
    """
    Generates interview questions using Gemini API with input validation.
    """
    start_time = time.time()
    user_id = getattr(current_user, "id", "unknown")

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is not configured.",
        )

    prompt = (
        f"Generate 5 distinct {req.difficulty} {req.round_type} interview questions "
        f"for a {req.role} position at {req.company}. "
        f"Return ONLY a plain list with one question per line, without numbers or bullet points."
    )

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        raw_text = response.text or ""
        questions = [
            line.strip().lstrip("0123456789.-* ")
            for line in raw_text.split("\n")
            if line.strip()
        ]

        # Ensure fallback defaults if AI output is empty
        if not questions:
            questions = [
                f"Explain a challenging {req.role} project you built.",
                f"How do you handle system trade-offs at {req.company}?",
                "Describe a time you solved a complex production bug.",
                "How do you optimize code performance and memory usage?",
                "Explain core data structures you use daily."
            ]

        elapsed = time.time() - start_time
        logger.info(f"Generated {len(questions)} questions for user {user_id} in {elapsed:.2f}s")

        return {"questions": questions[:5]}

    except Exception as e:
        logger.error(f"Gemini Question Generation failed for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate questions. Please try again.",
        )