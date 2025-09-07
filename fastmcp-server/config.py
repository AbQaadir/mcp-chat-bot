import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PG_CONNECTION_STRING: str = str(os.getenv("PG_CONNECTION_STRING"))
    GOOGLE_API_KEY: str = str(os.getenv("GOOGLE_API_KEY"))
    EMBEDDING_MODEL: str = str(os.getenv("EMBEDDING_MODEL"))

settings = Settings()