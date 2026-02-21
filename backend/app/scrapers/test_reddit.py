import asyncio
from app.scrapers.reddit_scraper import search_reddit


async def test():
    posts = await search_reddit("saas pricing", max_results=5)
    print(posts[0])
    print("Got posts:", len(posts))
    print("First post:", posts[0]["title"])


asyncio.run(test())
