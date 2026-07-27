from fastapi import APIRouter
from pydantic import BaseModel
import cv2
import numpy as np

from app.services.eye_tracker import analyze_frame

router = APIRouter(
    prefix="/eye",
    tags=["Eye Contact"]
)

class FrameRequest(BaseModel):
    image: str

@router.post("/analyze")
def analyze(request: FrameRequest):
    try:
        image_bytes = bytes.fromhex(request.image)
        frame = cv2.imdecode(
            np.frombuffer(image_bytes, np.uint8),
            cv2.IMREAD_COLOR,
        )

        result = analyze_frame(frame)

        return result

    except Exception as e:
        return {
            "eye_contact": False,
            "score": 0,
            "error": str(e),
        }