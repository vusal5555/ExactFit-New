import asyncio
from app.scrapers.twitter_scraper import search_twitter


async def test():
    posts = await search_twitter("saas pricing", max_results=5)
    print(posts)
    print("Got posts:", len(posts))
    print("First post:", posts[0]["title"])


asyncio.run(test())
