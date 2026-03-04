from fastapi import FastAPI
from app.database.db import supabase
from app.routes import auth
from app.scrapers.hn_scraper import search_hn
from app.routes.analyze import router as analyze_router
from app.routes.leads import router as leads_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(analyze_router, prefix="/api/analyze", tags=["analyze"])
app.include_router(leads_router, prefix="/api/leads", tags=["leads"])


@app.get("/")
async def root():
    return {"message": "ExactFit API", "supabase_connected": bool(supabase)}


@app.get("/test/hn")
async def test_hn():
    results = await search_hn("CRM alternatives")
    return {"count": len(results), "results": results}
