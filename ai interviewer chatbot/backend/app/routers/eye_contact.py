import cv2
import numpy as np
import logging
import time
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.eye_tracker import analyze_frame

logger = logging.getLogger("app.routers.eye_contact")

router = APIRouter(
    prefix="/eye-contact",
    tags=["eye-contact"],
)

MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2 MB Limit


@router.post("/analyze")
async def analyze_eye_contact(file: UploadFile = File(...)):
    """
    Accepts webcam frame snapshot (max 2MB), validates format, and analyzes eye contact.
    """
    start_time = time.time()

    # 1. Read and validate content size
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image frame size exceeds maximum allowed limit of 2 MB.",
        )

    if not contents:
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded.",
        )

    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Free raw bytes memory immediately
    del contents
    del nparr

    # 2. Validate decoded OpenCV image frame
    if frame is None or frame.size == 0:
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format or corrupted frame payload.",
        )

    try:
        result = analyze_frame(frame)
        elapsed = time.time() - start_time
        logger.info(f"Eye contact analysis completed in {elapsed:.4f}s")
        return result
    except Exception as e:
        logger.error(f"Eye contact processing failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing camera frame.",
        )
    finally:
        # Explicitly release frame buffer memory
        if 'frame' in locals() and frame is not None:
            del frame
        await file.close()