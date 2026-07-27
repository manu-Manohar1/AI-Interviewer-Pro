import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.routers.transcribe import analyze_filler_words


def test_detects_filler_words_and_highlights_them():
    text = "Um, I like to actually think about things basically."

    analysis = analyze_filler_words(text)

    assert analysis["filler_word_count"] == 4
    assert "<mark" in analysis["highlighted_transcript"]
    assert "actually" in analysis["highlighted_transcript"].lower()
