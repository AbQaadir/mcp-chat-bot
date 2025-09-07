import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Dict, Any
import json


# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # FastAPI/Celery/PostgreSQL Configuration
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
    PG_CONNECTION_STRING: str = os.getenv("PG_CONNECTION_STRING", "postgresql://postgres:postgres@db:5432/resumedb")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")  # type: ignore
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "models/embedding-001")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/tmp/resume_uploads")

    # MCP Agent Configuration
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gemini-2.5-flash")
    MODEL_PROVIDER: str = os.getenv("MODEL_PROVIDER", "google_genai")
    MCP_SERVER: Dict[str, Dict[str, Any]] = {
        "resume-mcp": {
            "url": "http://fastmcp-server:8005/mcp",
            "transport": "streamable_http",
        }
    }

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create a single settings instance
settings = Settings()

if __name__ == "__main__":
    print("MCP_SERVER:", settings.MCP_SERVER)
    print("MODEL_NAME:", settings.MODEL_NAME)
    print("MODEL_PROVIDER:", settings.MODEL_PROVIDER)
