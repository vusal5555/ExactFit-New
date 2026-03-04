from app.database.db import supabase
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer


def get_current_user():
    try:

        response = supabase.auth.get_user()
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
