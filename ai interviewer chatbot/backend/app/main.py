import logging
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
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starting up...")
    yield
    logger.info("Application shutting down...")


app = FastAPI(
    title="AI Interviewer Pro API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration allowing cross-origin requests from Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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