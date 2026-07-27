import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.reporting import build_session_report_pdf


def test_build_session_report_pdf_returns_bytes():
    session = {"id": 7, "role": "Backend Engineer", "date": "2026-07-05T00:00:00"}
    responses = [
        {
            "question": "Explain a REST API.",
            "user_answer": "I explained it clearly.",
            "feedback_text": "Good structure.",
            "technical_score": 8,
            "communication_score": 7,
            "relevance_score": 8,
            "confidence_score": 7,
            "grammar_score": 8,
            "overall_score": 7.6,
        }
    ]

    pdf_bytes = build_session_report_pdf(session, responses, weak_topics=[{"type": "technical", "avg_score": 6.5}])

    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b'%PDF')
