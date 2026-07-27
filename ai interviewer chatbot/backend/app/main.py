from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Explicitly import models so SQLAlchemy initializes all mappers
import app.models
import app.models_interview
import app.models_session

from app.routers import (
    analytics,
    auth,
    dashboard,
    eye_contact,
    interview,
    profile,
    questions,
    report,
    resume,
    session,
    transcribe,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Interviewer Pro API",
    version="1.0.0",
    description="AI-powered interview practice and evaluation API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Interviewer Pro API Running"}

@app.get("/hello")
def hello():
    return {"message": "Hello from FastAPI"}

app.include_router(dashboard.router)
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(questions.router)
app.include_router(interview.router)
app.include_router(transcribe.router)
app.include_router(report.router)
app.include_router(profile.router)
app.include_router(analytics.router)
app.include_router(eye_contact.router)
app.include_router(session.router)