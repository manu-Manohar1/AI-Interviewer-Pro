from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.deps import get_current_user

import whisper
import tempfile
import os
import re
import html

router = APIRouter(
    prefix="/transcribe",
    tags=["Transcribe"]
)

# Load Whisper model once
model = whisper.load_model("base")

FILLER_WORD_PATTERN = re.compile(
    r"\b(?:um|uh|like|actually|basically)\b",
    re.IGNORECASE,
)


def analyze_filler_words(text: str):
    if not text:
        return {
            "filler_word_count": 0,
            "highlighted_transcript": ""
        }

    escaped = html.escape(text)

    highlighted = FILLER_WORD_PATTERN.sub(
        lambda m: f'<mark class="bg-yellow-300">{html.escape(m.group())}</mark>',
        escaped,
    )

    return {
        "filler_word_count": len(FILLER_WORD_PATTERN.findall(text)),
        "highlighted_transcript": highlighted,
    }


@router.post("/whisper")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    temp_path = None

    try:
        filename = file.filename or "audio.wav"
        suffix = os.path.splitext(filename)[1] or ".wav"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(await file.read())
            temp_path = temp.name

        result = model.transcribe(temp_path)

        text = result.get("text", "").strip()

        analysis = analyze_filler_words(text)

        return {
            "success": True,
            "text": text,
            "filler_word_count": analysis["filler_word_count"],
            "highlighted_transcript": analysis["highlighted_transcript"],
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)