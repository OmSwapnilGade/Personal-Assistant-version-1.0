from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "student_workspace"

    # Groq AI
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # App
    app_name: str = "Student AI Workspace"
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
