from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from auth import hash_password, verify_password, create_access_token, get_db, get_current_user, require_auth
import models
import os
import json
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# ========================
# PYDANTIC SCHEMAS
# ========================
class LoginRequest(BaseModel):
    email: str
    password: str

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    phone: str
    user_type: str

class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    specialties: Optional[list] = None
    service_radius: Optional[int] = None
    availability: Optional[str] = None

class DemandCreateRequest(BaseModel):
    title: str
    description: str
    category: str
    location: str
    budget: Optional[float] = None
    urgency: str = "normal"

class DemandStatusUpdate(BaseModel):
    status: str
    accepted_artisan_id: Optional[int] = None

class ProposalCreateRequest(BaseModel):
    demand_id: int
    price: float
    timeline: str
    message: Optional[str] = None

class ProposalStatusUpdate(BaseModel):
    status: str  # accepted, rejected

class MessageCreateRequest(BaseModel):
    demand_id: int
    receiver_id: int
    content: str

class RatingCreateRequest(BaseModel):
    rated_user_id: int
    score: float
    comment: Optional[str] = None
    demand_id: Optional[int] = None
    quality_score: Optional[float] = None
    timeliness_score: Optional[float] = None
    communication_score: Optional[float] = None
    value_score: Optional[float] = None
    clarity_score: Optional[float] = None
    commitment_score: Optional[float] = None
    payment_score: Optional[float] = None

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Artisan Platform API",
    description="API pour la plateforme de mise en relation Artisans & Clients",
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

# ========================
# HEALTH CHECK
# ========================
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

# ========================
# AUTH ENDPOINTS
# ========================

@app.post("/auth/register")
def register(data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = models.User(
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        user_type=data.user_type
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_type": user.user_type,
            "phone": user.phone
        }
    }

@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login and get JWT token"""
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_type": user.user_type,
            "phone": user.phone,
            "bio": user.bio,
            "location": user.location,
            "specialties": user.specialties,
            "average_rating": user.average_rating,
            "total_ratings": user.total_ratings,
            "is_verified": user.is_verified,
            "profile_picture": user.profile_picture
        }
    }

@app.get("/auth/me")
def get_me(current_user: models.User = Depends(require_auth)):
    """Get current user profile"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "user_type": current_user.user_type,
        "phone": current_user.phone,
        "bio": current_user.bio,
        "location": current_user.location,
        "specialties": current_user.specialties,
        "service_radius": current_user.service_radius,
        "availability": current_user.availability,
        "certifications": current_user.certifications,
        "portfolio_images": current_user.portfolio_images,
        "average_rating": current_user.average_rating,
        "total_ratings": current_user.total_ratings,
        "is_verified": current_user.is_verified,
        "profile_picture": current_user.profile_picture,
        "created_at": current_user.created_at
    }

# ========================
# USERS ENDPOINTS
# ========================

@app.get("/users")
def list_users(user_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all users with optional filter by type"""
    query = db.query(models.User)
    if user_type:
        query = query.filter(models.User.user_type == user_type)
    return query.all()

@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/profile")
def update_profile(data: UserUpdateRequest, current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Update current user's profile"""
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

# ========================
# DEMANDS ENDPOINTS
# ========================

@app.get("/demands")
def list_demands(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all demands with optional filters"""
    query = db.query(models.Demand)
    if category:
        query = query.filter(models.Demand.category == category)
    if status:
        query = query.filter(models.Demand.status == status)
    return query.order_by(models.Demand.created_at.desc()).all()

@app.get("/demands/{demand_id}")
def get_demand(demand_id: int, db: Session = Depends(get_db)):
    """Get demand by ID with client info"""
    demand = db.query(models.Demand).filter(models.Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    return demand

@app.post("/demands")
def create_demand(data: DemandCreateRequest, current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Create a new demand (client only)"""
    demand = models.Demand(
        client_id=current_user.id,
        title=data.title,
        description=data.description,
        category=data.category,
        location=data.location,
        budget=data.budget,
        urgency=data.urgency
    )
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return demand

@app.get("/demands/my/list")
def my_demands(current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get demands created by the current user"""
    return db.query(models.Demand).filter(models.Demand.client_id == current_user.id).order_by(models.Demand.created_at.desc()).all()

@app.patch("/demands/{demand_id}/status")
def update_demand_status(demand_id: int, data: DemandStatusUpdate, current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Update demand status"""
    demand = db.query(models.Demand).filter(models.Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    if demand.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    demand.status = data.status
    if data.accepted_artisan_id:
        demand.accepted_artisan_id = data.accepted_artisan_id
    demand.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(demand)
    return demand

# ========================
# PROPOSALS ENDPOINTS
# ========================

@app.get("/demands/{demand_id}/proposals")
def get_demand_proposals(demand_id: int, db: Session = Depends(get_db)):
    """Get all proposals for a demand"""
    return db.query(models.Proposal).filter(models.Proposal.demand_id == demand_id).all()

@app.post("/proposals")
def create_proposal(data: ProposalCreateRequest, current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Create a new proposal (artisan only)"""
    demand = db.query(models.Demand).filter(models.Demand.id == data.demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    
    # Check if artisan already submitted a proposal
    existing = db.query(models.Proposal).filter(
        models.Proposal.demand_id == data.demand_id,
        models.Proposal.artisan_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already submitted a proposal for this demand")
    
    proposal = models.Proposal(
        demand_id=data.demand_id,
        artisan_id=current_user.id,
        price=data.price,
        timeline=data.timeline,
        message=data.message
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal

@app.get("/proposals/my/list")
def my_proposals(current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get proposals submitted by the current artisan"""
    return db.query(models.Proposal).filter(models.Proposal.artisan_id == current_user.id).order_by(models.Proposal.created_at.desc()).all()

@app.patch("/proposals/{proposal_id}/status")
def update_proposal_status(proposal_id: int, data: ProposalStatusUpdate, current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Accept or reject a proposal (client only)"""
    proposal = db.query(models.Proposal).filter(models.Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    demand = db.query(models.Demand).filter(models.Demand.id == proposal.demand_id).first()
    if demand.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    proposal.status = data.status
    proposal.updated_at = datetime.utcnow()
    
    if data.status == "accepted":
        demand.status = "accepted"
        demand.accepted_artisan_id = proposal.artisan_id
        demand.updated_at = datetime.utcnow()
        # Reject other proposals
        db.query(models.Proposal).filter(
            models.Proposal.demand_id == demand.id,
            models.Proposal.id != proposal_id
        ).update({"status": "rejected"})
    
    db.commit()
    db.refresh(proposal)
    return proposal

# ========================
# MESSAGES ENDPOINTS
# ========================

@app.post("/messages")
def send_message(data: MessageCreateRequest, current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Send a message"""
    message = models.Message(
        demand_id=data.demand_id,
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@app.get("/demands/{demand_id}/messages")
def get_demand_messages(demand_id: int, db: Session = Depends(get_db)):
    """Get all messages for a demand"""
    return db.query(models.Message).filter(
        models.Message.demand_id == demand_id
    ).order_by(models.Message.created_at).all()

@app.get("/messages/conversations")
def get_conversations(current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get all conversations for the current user"""
    messages = db.query(models.Message).filter(
        (models.Message.sender_id == current_user.id) | (models.Message.receiver_id == current_user.id)
    ).order_by(models.Message.created_at.desc()).all()
    
    # Group by demand_id and get latest message per demand
    conversations = {}
    for msg in messages:
        if msg.demand_id not in conversations:
            other_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
            other_user = db.query(models.User).filter(models.User.id == other_id).first()
            demand = db.query(models.Demand).filter(models.Demand.id == msg.demand_id).first()
            conversations[msg.demand_id] = {
                "demand_id": msg.demand_id,
                "demand_title": demand.title if demand else "Unknown",
                "other_user": {
                    "id": other_user.id,
                    "first_name": other_user.first_name,
                    "last_name": other_user.last_name
                } if other_user else None,
                "last_message": msg.content,
                "last_message_at": msg.created_at
            }
    return list(conversations.values())

# ========================
# RATINGS ENDPOINTS
# ========================

@app.post("/ratings")
def create_rating(data: RatingCreateRequest, current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Create a rating"""
    if data.score < 1 or data.score > 5:
        raise HTTPException(status_code=400, detail="Score must be between 1 and 5")
    
    rating = models.Rating(
        rater_id=current_user.id,
        rated_user_id=data.rated_user_id,
        score=data.score,
        comment=data.comment,
        demand_id=data.demand_id,
        quality_score=data.quality_score,
        timeliness_score=data.timeliness_score,
        communication_score=data.communication_score,
        value_score=data.value_score,
        clarity_score=data.clarity_score,
        commitment_score=data.commitment_score,
        payment_score=data.payment_score,
    )
    db.add(rating)
    
    # Update user average rating
    user = db.query(models.User).filter(models.User.id == data.rated_user_id).first()
    if user:
        all_ratings = db.query(models.Rating).filter(
            models.Rating.rated_user_id == data.rated_user_id
        ).all()
        all_ratings_list = list(all_ratings) + [rating]
        avg_score = sum([r.score for r in all_ratings_list]) / len(all_ratings_list)
        user.average_rating = round(avg_score, 2)
        user.total_ratings = len(all_ratings_list)
    
    db.commit()
    db.refresh(rating)
    return rating

@app.get("/users/{user_id}/ratings")
def get_user_ratings(user_id: int, db: Session = Depends(get_db)):
    """Get all ratings for a user"""
    ratings = db.query(models.Rating).filter(
        models.Rating.rated_user_id == user_id
    ).all()
    # Enrich with rater info
    result = []
    for r in ratings:
        rater = db.query(models.User).filter(models.User.id == r.rater_id).first()
        result.append({
            "id": r.id,
            "score": r.score,
            "comment": r.comment,
            "quality_score": r.quality_score,
            "timeliness_score": r.timeliness_score,
            "communication_score": r.communication_score,
            "value_score": r.value_score,
            "created_at": r.created_at,
            "rater": {
                "id": rater.id,
                "first_name": rater.first_name,
                "last_name": rater.last_name
            } if rater else None
        })
    return result

# ========================
# ARTISAN SEARCH ENDPOINTS
# ========================

@app.get("/artisans/search")
def search_artisans(
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    min_rating: Optional[float] = 0,
    db: Session = Depends(get_db)
):
    """Search artisans by specialty and location"""
    query = db.query(models.User).filter(
        models.User.user_type == models.UserType.ARTISAN
    )
    
    if location:
        query = query.filter(models.User.location.ilike(f"%{location}%"))
    
    if min_rating:
        query = query.filter(models.User.average_rating >= min_rating)
    
    return query.all()

# ========================
# STATS ENDPOINT
# ========================

@app.get("/stats/dashboard")
def dashboard_stats(current_user: models.User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get dashboard statistics for current user"""
    if current_user.user_type == "client":
        total_demands = db.query(models.Demand).filter(models.Demand.client_id == current_user.id).count()
        active_demands = db.query(models.Demand).filter(
            models.Demand.client_id == current_user.id,
            models.Demand.status.in_(["pending", "accepted", "in_progress"])
        ).count()
        completed = db.query(models.Demand).filter(
            models.Demand.client_id == current_user.id,
            models.Demand.status == "completed"
        ).count()
        return {
            "total_demands": total_demands,
            "active_demands": active_demands,
            "completed_demands": completed,
            "average_rating": current_user.average_rating,
            "total_ratings": current_user.total_ratings
        }
    else:  # artisan
        total_proposals = db.query(models.Proposal).filter(models.Proposal.artisan_id == current_user.id).count()
        accepted_proposals = db.query(models.Proposal).filter(
            models.Proposal.artisan_id == current_user.id,
            models.Proposal.status == "accepted"
        ).count()
        pending_proposals = db.query(models.Proposal).filter(
            models.Proposal.artisan_id == current_user.id,
            models.Proposal.status == "pending"
        ).count()
        return {
            "total_proposals": total_proposals,
            "accepted_proposals": accepted_proposals,
            "pending_proposals": pending_proposals,
            "average_rating": current_user.average_rating,
            "total_ratings": current_user.total_ratings
        }

# ========================
# SERVE FRONTEND (production)
# ========================
import pathlib
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIR = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_DIR.exists():
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve React SPA — fallback to index.html for client-side routing"""
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIR / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
