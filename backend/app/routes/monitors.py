from fastapi import APIRouter, HTTPException, Depends
from app.database.db import supabase
from pydantic import BaseModel
from typing import Optional
from app.utils.auth import get_current_user


router = APIRouter()


class MonitorCreateRequest(BaseModel):
    keyword: str
    platforms: list[str]
    min_intent_score: Optional[float] = 7


class MonitorUpdateRequest(BaseModel):
    keyword: Optional[str] = None
    platforms: Optional[list[str]] = None
    min_intent_score: Optional[float] = None


@router.post("/")
async def create_monitor(request: MonitorCreateRequest, user=Depends(get_current_user)):
    try:
        response = (
            supabase.table("keyword_monitors")
            .insert(
                {
                    "user_id": str(user.id),
                    "keyword": request.keyword,
                    "platforms": request.platforms,
                    "min_intent_score": request.min_intent_score,
                }
            )
            .execute()
        )

        return {"message": "Monitor created successfully", "monitor": response.data[0]}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def get_monitors(user=Depends(get_current_user)):
    try:
        response = (
            supabase.table("keyword_monitors")
            .select("*")
            .eq("user_id", str(user.id))
            .execute()
        )

        return {"monitors": response.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{monitor_id}")
async def update_monitor(
    monitor_id: str, request: MonitorUpdateRequest, user=Depends(get_current_user)
):
    try:

        update_data = {}
        if request.keyword is not None:
            update_data["keyword"] = request.keyword
        if request.platforms is not None:
            update_data["platforms"] = request.platforms
        if request.min_intent_score is not None:
            update_data["min_intent_score"] = request.min_intent_score

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = (
            supabase.table("keyword_monitors")
            .update(update_data)
            .eq("id", monitor_id)
            .eq("user_id", str(user.id))
            .execute()
        )

        return {"message": "Monitor updated successfully", "monitor": response.data[0]}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{monitor_id}")
async def delete_monitor(monitor_id: str, user=Depends(get_current_user)):
    try:
        (
            supabase.table("keyword_monitors")
            .delete()
            .eq("id", monitor_id)
            .eq("user_id", str(user.id))
            .execute()
        )

        return {"message": "Monitor deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
