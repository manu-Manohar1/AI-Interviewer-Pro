import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, interview, resume, transcribe, dashboard

app = FastAPI(title="AI Interviewer Pro API")

origins = os.getenv("FRONTEND_URL", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(interview.router, prefix="/api/v1/interview", tags=["Interview"])
app.include_router(transcribe.router, prefix="/api/v1/transcribe", tags=["Transcription"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])

@app.get("/health")
def health_check():
    return {"status": "Production backend is running."}
