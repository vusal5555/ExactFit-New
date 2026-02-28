import httpx
from datetime import datetime, timedelta


URL = "https://hn.algolia.com/api/v1/search"


async def search_hn(keyword: str, max_results: int = 20) -> list[dict]:
    seven_days_ago = datetime.now() - timedelta(days=7)

    params = {
        "query": keyword,
        "tags": "(story,comment)",
        "hitsPerPage": max_results,
        "numericFilters": f"created_at_i>{int(seven_days_ago.timestamp())}",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(URL, params=params)
            response.raise_for_status()
            data = response.json()
            results = []
            for hit in data.get("hits", []):
                content = hit.get("story_text") or hit.get("comment_text") or ""
                if not content:
                    continue
                results.append(
                    {
                        "platform": "Hacker News",
                        "title": hit.get("title") or hit.get("comment_text", "")[:50],
                        "content": content,
                        "url": f"https://news.ycombinator.com/item?id={hit['objectID']}",
                        "author": hit.get("author", ""),
                        "created_at": hit.get("created_at", ""),
                        "points": hit.get("points", 0),
                        "num_comments": hit.get("num_comments", 0),
                    }
                )

            return results
    except Exception as e:
        print(f"Error fetching data from Hacker News: {e}")
        return []
