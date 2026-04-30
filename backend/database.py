from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg://postgres:whosans@localhost:5432/artisan_platform"
    )
    
    class Config:
        env_file = ".env"

settings = Settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Health check before each connection
    pool_recycle=3600,   # Recycle connections every hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()