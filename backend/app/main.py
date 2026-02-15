from fastapi import FastAPI
from app.database.db import supabase
from app.routes import auth


app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/")
async def root():
    return {"message": "ExactFit API", "supabase_connected": bool(supabase)}
