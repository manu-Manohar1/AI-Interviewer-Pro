import asyncio
import whisper
from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os

router = APIRouter()
_whisper_model = None 

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model("base") 
    return _whisper_model

def process_audio(file_path: str) -> str:
    model = get_whisper_model()
    result = model.transcribe(file_path)
    return result["text"]

@router.post("/whisper")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.filename.endswith(('.wav', '.mp3', '.m4a')):
        raise HTTPException(status_code=400, detail="Unsupported audio format.")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        transcription = await asyncio.to_thread(process_audio, tmp_path)
        
        os.remove(tmp_path)
        return {"transcription": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
