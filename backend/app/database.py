import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from backend.app.config import settings

# Create database engine
# Convert PostgresDsn to string for SQLAlchemy
DATABASE_URL = str(settings.DATABASE_URL)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Test connections before using them
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for database models
Base = declarative_base()
