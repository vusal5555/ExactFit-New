from fastapi import APIRouter, HTTPException
from app.models.intent import PostInput, IntentAnalysis, BatchPostInput
from app.ai.intent_analyzer import analyze_intent, analyze_intent_batch

router = APIRouter()


@router.post("", response_model=IntentAnalysis)
async def analyze_post(post: PostInput):
    try:
        return await analyze_intent(post)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=list[IntentAnalysis])
async def analyze_posts_batch(body: BatchPostInput):
    try:
        for post in body.posts:
            post.min_intent_score = body.min_intent_score
        return await analyze_intent_batch(body.posts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
