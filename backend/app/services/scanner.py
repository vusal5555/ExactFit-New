import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from app.scrapers.twitter_scraper import search_twitter
from app.scrapers.reddit_scraper import search_reddit
from app.scrapers.hn_scraper import search_hn
from app.scrapers.linkedin_scraper import search_linkedin
from app.ai import intent_analyzer
from app.database.db import get_supabase_client

logger = logging.getLogger(__name__)

SCRAPER_MAP = {
    "hackernews": search_hn,
    "reddit": search_reddit,
    "twitter": search_twitter,
    "linkedin": search_linkedin,
}


async def run_scraper(platform: str, keyword: str) -> list[dict]:
    scraper = SCRAPER_MAP.get(platform)
    if not scraper:
        logger.warning(f"Unknown platform: {platform}")
        return []
    try:
        return await scraper(keyword)
    except Exception as e:
        logger.error(f"Scraper failed [{platform}]: {e}")
        return []


async def get_existing_urls(monitor_id: str) -> set[str]:
    supabase = get_supabase_client()
    res = supabase.table("leads").select("url").eq("monitor_id", monitor_id).execute()
    return {row["url"] for row in (res.data or [])}


async def scan_monitor(monitor_id: str) -> dict[str, Any]:
    supabase = get_supabase_client()

    response = (
        supabase.table("keyword_monitors")
        .select("*")
        .eq("id", monitor_id)
        .single()
        .execute()
    )

    monitor = response.data

    if not monitor:
        raise ValueError(f"Monitor not found: {monitor_id}")

    keyword = monitor["keyword"]
    platforms = monitor["platforms"]
    min_intent_score = monitor["min_intent_score"]
    user_id = monitor["user_id"]

    scraper_tasks = [run_scraper(platform, keyword) for platform in platforms]
    results = await asyncio.gather(*scraper_tasks)

    all_posts = [post for platform_posts in results for post in platform_posts]

    existing_urls = await get_existing_urls(monitor_id)
    new_posts = [p for p in all_posts if p.get("url") not in existing_urls]

    qualified = []
    for post in new_posts:
        try:
            analysis = await intent_analyzer.analyze_intent(post, keyword)
            score = float(analysis.get("intent_score", 0))
            if score >= min_intent_score:
                qualified.append(
                    {
                        "user_id": user_id,
                        "monitor_id": monitor_id,
                        "title": post.get("title", ""),
                        "content": post.get("content", ""),
                        "url": post.get("url", ""),
                        "author": post.get("author", ""),
                        "platform": post.get("platform", ""),
                        "intent_score": score,
                        "buying_stage": analysis.get("buying_stage"),
                        "urgency": analysis.get("urgency"),
                        "pain_points": analysis.get("pain_points"),
                        "recommended_action": analysis.get("recommended_action"),
                        "reasoning": analysis.get("reasoning"),
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    }
                )
        except Exception as e:
            logger.error(f"AI analysis failed for {post.get('url')}: {e}")

    if qualified:
        supabase.table("leads").insert(qualified).execute()

    return {
        "monitor_id": monitor_id,
        "keyword": keyword,
        "platforms": platforms,
        "total_scraped": len(all_posts),
        "new_posts": len(new_posts),
        "qualified_leads": len(qualified),
    }


async def scan_all_monitors() -> list[dict[str, Any]]:
    supabase = get_supabase_client()
    res = (
        supabase.table("keyword_monitors").select("id").eq("is_active", True).execute()
    )
    monitor_ids = [row["id"] for row in (res.data or [])]

    tasks = [scan_monitor(mid) for mid in monitor_ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    summaries = []
    for mid, result in zip(monitor_ids, results):
        if isinstance(result, Exception):
            logger.error(f"scan_monitor failed [{mid}]: {result}")
            summaries.append({"monitor_id": mid, "error": str(result)})
        else:
            summaries.append(result)

    return summaries
