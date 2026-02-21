import asyncio
from app.models.intent import PostInput, IntentAnalysis
from app.ai.prompts import INTENT_ANALYZER_SYSTEM_PROMPT, build_user_message
from app.utils.llm import invoke_llm_async


async def analyze_intent(post: PostInput) -> IntentAnalysis:
    result: IntentAnalysis = await invoke_llm_async(
        system_prompt=INTENT_ANALYZER_SYSTEM_PROMPT,
        user_message=build_user_message(post),
        model="gpt-5-mini",
        response_format=IntentAnalysis,
    )
    result.is_qualified = result.intent_score >= post.min_intent_score
    return result


async def analyze_intent_batch(posts: list[PostInput]) -> list[IntentAnalysis]:
    return await asyncio.gather(*[analyze_intent(post) for post in posts])
