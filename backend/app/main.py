from fastapi import FastAPI
from app.database.db import supabase
from app.routes import auth
from app.scrapers.hn_scraper import search_hn
from app.routes.analyze import router as analyze_router


app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(analyze_router, prefix="/api/analyze", tags=["analyze"])


@app.get("/")
async def root():
    return {"message": "ExactFit API", "supabase_connected": bool(supabase)}


@app.get("/test/hn")
async def test_hn():
    results = await search_hn("CRM alternatives")
    return {"count": len(results), "results": results}
