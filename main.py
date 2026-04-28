from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
import os
import json

app = FastAPI(
    title="User Manager API",
    description="API pour gérer les utilisateurs",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost", "http://localhost:3000", "http://localhost:5173"]')
try:
    cors_origins = json.loads(cors_origins)
except:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    """Health check endpoint for load balancers"""
    return {"status": "healthy"}

# CREATE USER
@app.post("/users")
def create_user(name: str, email: str, db: Session = Depends(get_db)):
    user = models.User(name=name, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# GET USERS
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()