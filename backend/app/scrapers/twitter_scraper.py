import httpx
from datetime import datetime, timedelta, timezone


from app.config import settings


x_api_key = settings.x_api_key
BASE_URL = "https://api.twitter.com/2/tweets/search/recent"


def headers():
    return {"Authorization": f"Bearer {x_api_key}"}


def build_params(keyword: str, max_results: int) -> dict:
    start_time = (datetime.now(timezone.utc) - timedelta(days=7)).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    return {
        "query": keyword,
        "max_results": min(max(max_results, 10), 100),
        "start_time": start_time,
        "tweet.fields": "created_at,public_metrics,author_id,text",
        "expansions": "author_id",
        "user.fields": "name,username",
    }


def normalize(tweet: dict, users: dict) -> dict:

    text = tweet.get("text", "")
    author_id = tweet.get("author_id", "")
    user = users.get(author_id, {})
    metrics = tweet.get("public_metrics", {})

    return {
        "title": text[:100],
        "content": text,
        "url": f"https://twitter.com/i/web/status/{tweet['id']}",
        "author": user.get("username", author_id),
        "platform": "twitter",
        "created_at": tweet.get("created_at", ""),
        "engagement": {
            "likes": metrics.get("like_count", 0),
            "retweets": metrics.get("retweet_count", 0),
            "replies": metrics.get("reply_count", 0),
        },
        "raw": tweet,
    }


async def search_twitter(keyword: str, max_results: int = 20) -> list[dict]:
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(read=90.0, connect=10.0, write=10.0, pool=5.0)
    ) as client:
        try:
            response = await client.get(
                BASE_URL, headers=headers(), params=build_params(keyword, max_results)
            )
            response.raise_for_status()
            data = response.json()
            tweets = data.get("data", [])
            users = {u["id"]: u for u in data.get("includes", {}).get("users", [])}
            return [normalize(tweet, users) for tweet in tweets]
        except httpx.TimeoutException:
            raise RuntimeError(f"Twitter scrape timed out for keyword: {keyword}")
        except httpx.HTTPStatusError as e:
            raise RuntimeError(
                f"Twitter API error {e.response.status_code}: {e.response.text}"
            )
