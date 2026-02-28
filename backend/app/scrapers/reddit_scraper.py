from apify_client import ApifyClientAsync
from app.config import settings

ACTOR_ID = "3XedXIRBcjfKrnsDJ"


def normalize(items: list[dict], keyword: str) -> list[dict]:
    leads = []
    for item in items:
        data_type = item.get("dataType")
        if data_type not in ["post", "comment"]:
            continue

        if data_type == "post":
            title = item.get("title")
            body = item.get("body") or ""
            url = item.get("postUrl", "") or item.get("contentUrl", "")
            author = item.get("authorName", "")
            created_at = item.get("createdAt", "")
            likes = item.get("upVotes", 0)
            comments = item.get("commentsCount", 0)

        if not author or not body:
            continue

        leads.append(
            {
                "title": title,
                "content": body,
                "url": url,
                "author": author,
                "platform": "reddit",
                "signal_type": (
                    "posted_about" if data_type == "post" else "commented_on_post"
                ),
                "keyword": keyword,
                "created_at": created_at,
                "engagement": {
                    "likes": likes,
                    "comments": comments,
                },
                "raw": item,
            }
        )

    return leads


async def search_reddit(keyword: str, max_results: int = 20) -> list[dict]:
    client = ApifyClientAsync(settings.apify_token)
    run = await client.actor(ACTOR_ID).call(
        run_input={
            "startUrls": [],
            "crawlCommentsPerPost": True,
            "fastMode": True,
            "searchTerms": [keyword],
            "searchPosts": True,
            "searchComments": True,
            "searchCommunities": True,
            "searchSort": "new",
            "withinCommunity": "",
            "searchTime": "all",
            "includeNSFW": False,
            "maxPostsCount": max_results,
            "maxCommentsCount": 10,
            "maxCommentsPerPost": 10,
            "maxCommunitiesCount": 2,
            "proxy": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"],
            },
        }
    )
    items = []
    async for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        items.append(item)
    return normalize(items, keyword)
