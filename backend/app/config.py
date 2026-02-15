from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    supabase_database_url: str
    supabase_anon_key: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
