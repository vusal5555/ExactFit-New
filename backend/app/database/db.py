from supabase import create_client, Client
from app.config import settings


def get_supabase_client() -> Client:
    return create_client(settings.supabase_database_url, settings.supabase_anon_key)


supabase = get_supabase_client()
