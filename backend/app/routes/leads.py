from fastapi import APIRouter, HTTPException, Depends, Query
from app.database.db import supabase
from app.utils.auth import get_current_user
from typing import Optional
from datetime import datetime, timezone, timedelta

router = APIRouter()


@router.get("/stats")
async def get_lead_stats(user=Depends(get_current_user)):
    all_leads = (
        supabase.table("leads").select("*").eq("user_id", str(user.id)).execute().data
    )

    now = datetime.now(timezone.utc)
    today = now.date()
    week_ago = today - timedelta(days=7)

    by_platform = {}
    by_stage = {}
    scores = []
    leads_today = 0
    leads_this_week = 0

    for lead in all_leads:
        by_platform[lead["platform"]] = by_platform.get(lead["platform"], 0) + 1
        by_stage[lead["buying_stage"]] = by_stage.get(lead["buying_stage"], 0) + 1
        if lead["intent_score"] is not None:
            scores.append(lead["intent_score"])
        created = datetime.fromisoformat(lead["created_at"].replace("Z", "+00:00"))
        if created.date() == today:
            leads_today += 1
        if created >= week_ago:
            leads_this_week += 1

    return {
        "total_leads": len(all_leads),
        "avg_score": round(sum(scores) / len(scores), 2) if scores else 0,
        "leads_by_platform": by_platform,
        "leads_by_stage": by_stage,
        "leads_today": leads_today,
        "leads_this_week": leads_this_week,
    }


@router.get("/")
async def get_leads(
    user=Depends(get_current_user),
    platform: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None),
    buying_stage: Optional[str] = Query(None),
    is_contacted: Optional[bool] = Query(None),
    is_dismissed: Optional[bool] = Query(None),
    monitor_id: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    limit: int = Query(50),
    offset: int = Query(0),
):

    query = supabase.table("leads").select("*").eq("user_id", str(user.id))

    if platform:
        query = query.eq("platform", platform)
    if min_score is not None:
        query = query.gte("intent_score", min_score)
    if buying_stage:
        query = query.eq("buying_stage", buying_stage)
    if is_contacted is not None:
        query = query.eq("is_contacted", is_contacted)
    if is_dismissed is not None:
        query = query.eq("is_dismissed", is_dismissed)
    if monitor_id:
        query = query.eq("monitor_id", monitor_id)

    query = query.order(sort_by, desc=True).range(offset, offset + limit - 1)

    result = query.execute()
    return result.data


@router.get("/{lead_id}")
async def get_lead(lead_id: str, user=Depends(get_current_user)):
    lead = (
        supabase.table("leads")
        .select("*")
        .eq("id", lead_id)
        .eq("user_id", str(user.id))
        .single()
        .execute()
        .data
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}/contact")
async def mark_contacted(lead_id: str, user=Depends(get_current_user)):
    response = (
        supabase.table("leads")
        .update({"is_contacted": True})
        .eq("id", lead_id)
        .eq("user_id", str(user.id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"lead": response.data[0]}


@router.put("/{lead_id}/dismiss")
async def dismiss_lead(lead_id: str, user=Depends(get_current_user)):
    response = (
        supabase.table("leads")
        .update({"is_dismissed": True})
        .eq("id", lead_id)
        .eq("user_id", str(user.id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"lead": response.data[0]}
