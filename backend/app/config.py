import os
import secrets
from typing import Any, Dict, Optional
from pydantic import PostgresDsn, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # PostgreSQL database settings
    POSTGRES_SERVER: str = os.getenv("PGHOST", "localhost")
    POSTGRES_USER: str = os.getenv("PGUSER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("PGPASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("PGDATABASE", "windows_db")
    POSTGRES_PORT: int = int(os.getenv("PGPORT", "5432"))
    DATABASE_URL: Optional[PostgresDsn] = None

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            username=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            port=values.get("POSTGRES_PORT"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )

    # JWT Authentication
    # Using a fixed SECRET_KEY for development
    SECRET_KEY: str = "d026b3d4d927dfa346c8644149c07247b01fc51d1be4a49defa18aee764b6a0f"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Paths
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "/storage")
    CSV_FILE_PATH: str = os.getenv("CSV_FILE_PATH", "/home/runner/workspace/Rozszerzona_tabela_opcji.csv")

    # Security
    CORS_ORIGINS: list = ["http://localhost:5000", "http://localhost:8000"]

    class Config:
        env_file = ".env"

settings = Settings()
