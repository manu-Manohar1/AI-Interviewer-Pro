import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.routers.questions import build_question_prompt


def test_google_company_mode_adds_google_style_guidance():
    prompt = build_question_prompt(
        role="Software Engineer",
        difficulty="Intermediate",
        skills="Python, APIs",
        projects="Built a search service",
        company="Google",
    )

    assert "Google" in prompt
    assert "Googleyness" in prompt or "DSA" in prompt
