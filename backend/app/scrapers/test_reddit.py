from app.scrapers.linkedin_scraper import search_linkedin

leads = search_linkedin("AI agent", max_results=10)
for lead in leads:
    print(lead["signal_type"], "|", lead["author"], "|", lead["title"])
