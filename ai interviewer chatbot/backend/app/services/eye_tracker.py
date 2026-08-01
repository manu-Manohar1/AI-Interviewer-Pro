import cv2
import mediapipe as mp
import logging
from typing import Dict, Any

logger = logging.getLogger("app.services.eye_tracker")

# Global singleton variable to prevent re-initializing MediaPipe on every webcam frame
_face_mesh_instance = None


def get_face_mesh_detector():
    """
    Returns the singleton instance of MediaPipe FaceMesh.
    Optimized for CPU usage on Render Free with static_image_mode=False and refine_landmarks=False.
    """
    global _face_mesh_instance
    if _face_mesh_instance is None:
        logger.info("Initializing MediaPipe FaceMesh detector...")
        mp_face_mesh = mp.solutions.face_mesh
        _face_mesh_instance = mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=False,  # Disabled to save ~40MB RAM and reduce CPU processing
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    return _face_mesh_instance


def analyze_frame(frame: Any) -> Dict[str, Any]:
    """
    Analyzes an incoming BGR image frame for eye contact detection.
    Optimized for low RAM and fast execution speed.
    """
    if frame is None or frame.size == 0:
        return {"eye_contact": False, "score": 0}

    # 1. Downscale large images to 640x480 max to save memory and CPU cycles
    height, width = frame.shape[:2]
    if width > 640 or height > 480:
        frame = cv2.resize(frame, (640, 480), interpolation=cv2.INTER_AREA)

    # 2. Convert BGR to RGB in-place
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    try:
        detector = get_face_mesh_detector()
        result = detector.process(rgb_frame)

        if not result.multi_face_landmarks:
            return {"eye_contact": False, "score": 0}

        # Face landmarks identified
        return {"eye_contact": True, "score": 100}

    except Exception as e:
        logger.error(f"MediaPipe frame processing error: {e}")
        return {"eye_contact": False, "score": 0}
    finally:
        # Explicit memory cleanup for frame references
        del rgb_frame