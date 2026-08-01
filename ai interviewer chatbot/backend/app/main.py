import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

# Import Routers
from app.routers import transcribe, interview, questions, resume, eye_contact
from app.services.eye_tracker import get_face_mesh_detector

# Configure Centralized Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan Manager:
    Pre-loads heavy AI models during application startup to eliminate per-request cold start delays
    and RAM allocation spikes during live user interactions.
    """
    logger.info("Initializing AI models during backend startup...")
    
    # 1. Warm up Whisper Model
    try:
        transcribe.get_model()
        logger.info("Whisper Tiny model cached successfully.")
    except Exception as e:
        logger.error(f"Failed to pre-load Whisper model: {e}")

    # 2. Warm up MediaPipe FaceMesh
    try:
        get_face_mesh_detector()
        logger.info("MediaPipe FaceMesh model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to pre-load MediaPipe FaceMesh: {e}")

    logger.info("All AI services warmed up. Application ready for traffic.")
    yield
    
    # Graceful Shutdown Cleanup
    logger.info("Shutting down application and releasing global resources...")
    try:
        detector = get_face_mesh_detector()
        detector.close()
        logger.info("MediaPipe FaceMesh resources closed successfully.")
    except Exception as e:
        logger.error(f"Error closing MediaPipe detector: {e}")


app = FastAPI(
    title="AI Interviewer Pro API",
    version="2.0.0",
    lifespan=lifespan,
)

# GZip Compression Middleware (Compresses responses larger than 1000 bytes)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(transcribe.router)
app.include_router(interview.router)
app.include_router(questions.router)
app.include_router(resume.router)
app.include_router(eye_contact.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Render Health Check Probe Endpoint.
    """
    return {
        "status": "healthy",
        "service": "AI Interviewer Pro Backend",
        "version": "2.0.0"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing path {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )