from fastapi import APIRouter, HTTPException
from app.database.db import supabase
from pydantic import BaseModel

router = APIRouter()


class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(user: UserRegisterRequest):
    try:
        response = supabase.auth.sign_up(
            {"email": user.email, "password": user.password}
        )

        if response.user:
            supabase.table("users").insert(
                {
                    "id": str(response.user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                }
            ).execute()
        return {"message": "User registered successfully", "user": response.user}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(user: LoginRequest):

    try:
        response = supabase.auth.sign_in_with_password(
            {"email": user.email, "password": user.password}
        )
        if not response.user:
            raise HTTPException(status_code=401, detail=response["error"]["message"])

        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user_id": str(response.user.id),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
