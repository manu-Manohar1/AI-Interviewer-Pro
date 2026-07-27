from fastapi import APIRouter, Depends
from app.deps import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)

@router.get("/me")
def get_profile(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "college": current_user.college,
    }