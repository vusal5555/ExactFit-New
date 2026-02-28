from apify_client import ApifyClient, ApifyClientAsync
from app.config import settings

ACTOR_ID = "buIWk2uOUzTmcLsuB"


def make_lead(post: dict, keyword: str, author: dict, signal_type: str) -> dict:
    text = post.get("content") or ""
    engagement = post.get("engagement") or {}
    return {
        "title": text[:100],
        "content": text,
        "url": post.get("linkedinUrl", ""),
        "author": author.get("name", ""),
        "author_title": author.get("info") or author.get("position", ""),
        "author_company": (
            author.get("name", "") if author.get("type") == "company" else ""
        ),
        "author_linkedin_url": author.get("linkedinUrl", ""),
        "platform": "linkedin",
        "signal_type": signal_type,
        "keyword": keyword,
        "created_at": (post.get("postedAt") or {}).get("date", ""),
        "engagement": {
            "likes": engagement.get("likes", 0),
            "comments": engagement.get("comments", 0),
        },
        "raw": post,
    }


def normalize(items: list[dict], keyword: str) -> list[dict]:
    posts_by_id: dict[str, dict] = {}
    standalone_reactions: list[dict] = []

    for item in items:
        if item.get("type") == "post":
            posts_by_id[item["id"]] = item
        elif item.get("type") == "reaction":
            standalone_reactions.append(item)

    leads = []

    for post in posts_by_id.values():
        author = post.get("author") or {}
        lead = make_lead(post, keyword, author, "posted_about")
        if lead["author"]:
            leads.append(lead)

        for r in post.get("reactions") or []:
            if not isinstance(r, dict):
                continue
            actor = r.get("actor") or {}
            if actor.get("name"):
                leads.append(make_lead(post, keyword, actor, "liked_post"))

        for c in post.get("comments") or []:
            if not isinstance(c, dict):
                continue
            commenter = c.get("author") or c.get("actor") or {}
            if isinstance(commenter, str):
                commenter = {"name": commenter}
            if commenter.get("name"):
                leads.append(make_lead(post, keyword, commenter, "commented_on_post"))

    for r in standalone_reactions:
        actor = r.get("actor") or {}
        if not actor.get("name"):
            continue
        post_id = r.get("postId", "")
        post = posts_by_id.get(
            post_id, {"linkedinUrl": (r.get("query") or {}).get("post", "")}
        )
        leads.append(make_lead(post, keyword, actor, "liked_post"))

    return leads


async def search_linkedin(keyword: str, max_results: int = 20) -> list[dict]:
    client = ApifyClientAsync(settings.apify_token)
    run = await client.actor(ACTOR_ID).call(
        run_input={
            "searchQueries": [keyword],
            "maxPosts": max_results,
            "postedLimit": "24h",
            "postedLimitDate": "",
            "sortBy": "relevance",
            "profileScraperMode": "short",
            "startPage": 1,
            "scrapeReactions": True,
            "maxReactions": 50,
            "reactionsProfileScraperMode": "short",
            "scrapeComments": True,
            "maxComments": 20,
        }
    )
    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    return normalize(items, keyword)
