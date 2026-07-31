from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from app.deps import get_current_user

import whisper
import tempfile
import os
import re
import html
import logging

logger = logging.getLogger("app.transcribe")
logger.setLevel(logging.INFO)

router = APIRouter(
    prefix="/transcribe",
    tags=["transcribe"],
)

# =====================================================
# Global Whisper Model Cache
# =====================================================

whisper_model = None

FILLER_WORD_PATTERN = re.compile(
    r"\b(?:um|uh|like|actually|basically)\b",
    re.IGNORECASE,
)


def get_model():
    """
    Load Whisper only once.
    Future requests reuse the same model.
    """
    global whisper_model

    if whisper_model is None:
        logger.info("Loading Whisper Tiny model...")
        whisper_model = whisper.load_model("tiny")
        logger.info("Whisper model loaded successfully.")

    return whisper_model


# =====================================================
# Filler Word Analysis
# =====================================================

def analyze_filler_words(text: str):

    if not text:
        return {
            "filler_word_count": 0,
            "highlighted_transcript": "",
        }

    escaped = html.escape(text)

    count = 0

    def replace(match):
        nonlocal count
        count += 1
        return f'<mark class="bg-yellow-300">{html.escape(match.group())}</mark>'

    highlighted = FILLER_WORD_PATTERN.sub(replace, escaped)

    return {
        "filler_word_count": count,
        "highlighted_transcript": highlighted,
    }


# =====================================================
# Background Whisper Worker
# =====================================================

def run_whisper(file_path: str):

    model = get_model()

    result = model.transcribe(
        file_path,
        fp16=False,
        language="en",   # Faster if interview is English
    )

    return result.get("text", "").strip()


# =====================================================
# API
# =====================================================

@router.post("/whisper")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):

    temp_path = None

    try:

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Invalid audio file.",
            )

        ext = os.path.splitext(file.filename)[1]

        if ext == "":
            ext = ".wav"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=ext,
        ) as temp:

            temp_path = temp.name

            while chunk := await file.read(1024 * 1024):
                temp.write(chunk)

        logger.info(
            f"Starting transcription for user {current_user.id}"
        )

        text = await run_in_threadpool(
            run_whisper,
            temp_path,
        )

        analysis = analyze_filler_words(text)

        return {
            "text": text,
            "filler_word_count": analysis["filler_word_count"],
            "highlighted_transcript": analysis["highlighted_transcript"],
        }

    except HTTPException:
        raise

    except Exception as e:

        logger.exception("Whisper transcription failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}",
        )

    finally:

        if temp_path and os.path.exists(temp_path):

            try:
                os.remove(temp_path)
            except Exception:
                pass