import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

# Import all application routers
from app.routers import (
    auth,
    session,
    resume,
    transcribe,
    interview,
    questions,
    eye_contact,
    dashboard,
    profile,
    report,
    analytics,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starting up...")

    # NOTE: We deliberately do NOT preload the Whisper model here.
    # It was tried (eager-load at boot) to avoid a slow first
    # transcription request, but on Render's 512Mi tier the combined
    # memory of FastAPI + torch + the mediapipe/opencv import chain
    # (from eye_contact.py) plus the loaded Whisper model crosses the
    # memory limit during startup, and the whole service gets OOM-killed
    # before it can bind a port -- a full outage, which is worse than a
    # few extra seconds on someone's first recorded answer. Whisper loads
    # lazily on first use in transcribe.py's get_model() instead.
    yield
    logger.info("Application shutting down...")


app = FastAPI(
    title="AI Interviewer Pro API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration. Reads a comma-separated list of allowed origins from
# CORS_ORIGINS (e.g. "https://your-app.vercel.app,http://localhost:3000").
# If that env var isn't set, falls back to "*" so behavior is unchanged
# from before -- but you should set CORS_ORIGINS in Render once you have a
# moment after the demo, since allow_origins=["*"] + allow_credentials=True
# means any website can call this API using a logged-in user's token.
_cors_env = os.getenv("CORS_ORIGINS", "").strip()
_allowed_origins = [o.strip() for o in _cors_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API endpoints under /api/v1
app.include_router(auth.router, prefix="/api/v1")
app.include_router(session.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(transcribe.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(questions.router, prefix="/api/v1")
app.include_router(eye_contact.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(report.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Interviewer Pro Backend",
        "version": "2.0.0",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )
