"""Create all database tables from the new v2 models."""
from app.core.database import engine, Base
from app.models import *  # noqa: F401,F403 — import all models so Base sees them

def init():
    print("Creating all v2 tables...")
    Base.metadata.create_all(bind=engine)
    print("Done! Tables created.")

if __name__ == "__main__":
    init()
