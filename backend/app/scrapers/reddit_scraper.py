import httpx
from datetime import datetime, timedelta
from app.config import settings
import json


BRIGHTDATA_API_KEY = settings.bright_data_api_key
DATASET_ID = "gd_lvz8ah06191smkebj4"
BASE_URL = "https://api.brightdata.com/datasets/v3"
HEADERS = {"Authorization": f"Bearer {BRIGHTDATA_API_KEY}"}


async def trigger_job(
    client: httpx.AsyncClient, keyword: str, date: str, num_of_posts: int
):
    response = await client.post(
        f"{BASE_URL}/scrape",
        headers={**HEADERS, "Content-Type": "application/json"},
        params={
            "dataset_id": DATASET_ID,
            "include_errors": "true",
            "type": "discover_new",
            "discover_by": "keyword",
        },
        json={
            "input": [
                {
                    "keyword": keyword,
                    "date": date,
                    "num_of_posts": num_of_posts,
                    "sort_by": "Hot",
                }
            ]
        },
    )
    response.raise_for_status()
    return [
        json.loads(line) for line in response.text.strip().splitlines() if line.strip()
    ]


def normalize(posts: list[dict]) -> list[dict]:
    results = []

    for post in posts:
        top_comments = " | ".join(
            comment.get("comment", "") for comment in (post.get("comments") or [])[:10]
        )

        content = " ".join(filter(None, [post.get("selftext", ""), top_comments]))

        results.append(
            {
                "title": post.get("title", ""),
                "content": content,
                "url": post.get("url", ""),
                "author": post.get("user_posted", ""),
                "platform": "reddit",
                "created_at": post.get("date_posted", ""),
                "engagement": {
                    "comments": post.get("num_comments", 0),
                    "upvotes": post.get("num_upvotes", 0),
                },
                "community": {
                    "name": post.get("community_name", ""),
                    "members": post.get("community_members_num", 0),
                },
                "raw": post,
            }
        )

    return results


async def search_reddit(keyword: str, max_results: int = 20) -> list[dict]:
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(read=90.0, connect=10.0, write=10.0, pool=5.0)
    ) as client:
        try:
            posts = await trigger_job(client, keyword, "Past week", max_results)
            return normalize(posts)
        except httpx.TimeoutException:
            raise RuntimeError(f"Reddit scrape timed out for keyword: {keyword}")
        except httpx.HTTPStatusError as e:
            raise RuntimeError(
                f"Reddit API error {e.response.status_code}: {e.response.text}"
            )
