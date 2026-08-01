import os
import re
import html
import time
import logging
import tempfile
from typing import Dict, Any

import torch
import whisper
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool

from app.deps import get_current_user

# Throttle PyTorch to single CPU thread to prevent RAM & CPU thrashing on Render
torch.set_num_threads(int(os.getenv("TORCH_CPU_THREADS", "1")))

logger = logging.getLogger("app.transcribe")

router = APIRouter(
    prefix="/transcribe",
    tags=["transcribe"],
)

MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25 MB Limit
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg"}
CHUNK_SIZE = 1024 * 1024  # 1 MB chunk

FILLER_WORD_PATTERN = re.compile(
    r"\b(?:um|uh|like|actually|basically)\b",
    re.IGNORECASE,
)

whisper_model: whisper.Whisper = None


def get_model() -> whisper.Whisper:
    global whisper_model
    if whisper_model is None:
        logger.info("Loading Whisper Tiny model into RAM...")
        whisper_model = whisper.load_model("tiny")
        logger.info("Whisper model loaded successfully.")
    return whisper_model


def analyze_filler_words(text: str) -> Dict[str, Any]:
    if not text:
        return {
            "filler_word_count": 0,
            "highlighted_transcript": "",
        }

    escaped = html.escape(text)
    count = 0

    def replace(match: re.Match) -> str:
        nonlocal count
        count += 1
        return f'<mark class="bg-yellow-300">{html.escape(match.group())}</mark>'

    highlighted = FILLER_WORD_PATTERN.sub(replace, escaped)

    return {
        "filler_word_count": count,
        "highlighted_transcript": highlighted,
    }


def run_whisper(file_path: str) -> str:
    model = get_model()
    result = model.transcribe(
        file_path,
        fp16=False,
        language="en",
    )
    return result.get("text", "").strip()


@router.post("/whisper")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
) -> Dict[str, Any]:
    start_time = time.time()
    user_id = getattr(current_user, "id", "unknown")
    filename = file.filename or "audio.wav"

    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        ext = ".wav"

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    temp_path = None
    file_size = 0

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp:
            temp_path = temp.name
            while chunk := await file.read(CHUNK_SIZE):
                file_size += len(chunk)
                if file_size > MAX_AUDIO_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File size exceeds maximum allowed limit of 25 MB.",
                    )
                temp.write(chunk)

        text = await run_in_threadpool(run_whisper, temp_path)
        analysis = analyze_filler_words(text)

        elapsed = time.time() - start_time
        logger.info(f"Transcription completed for user {user_id} in {elapsed:.2f}s")

        return {
            "text": text,
            "filler_word_count": analysis["filler_word_count"],
            "highlighted_transcript": analysis["highlighted_transcript"],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Whisper transcription failed for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}",
        )
    finally:
        try:
            await file.close()
        except Exception:
            pass

        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass