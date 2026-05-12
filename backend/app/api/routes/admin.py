from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User, UserRole
from app.models.artisan_profile import ArtisanProfile, BadgeType
from app.models.demand import Demand
from app.models.project import Project
from app.models.quote import Quote
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/users", response_model=list[UserResponse])
def list_users(
    role: str = None, skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db), admin: User = Depends(require_admin)
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    users = q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}/verify")
def verify_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.is_verified = True
    if user.role == UserRole.artisan:
        profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == user_id).first()
        if profile:
            profile.badge = BadgeType.verified
    db.commit()
    return {"detail": "Utilisateur vérifié"}


@router.put("/users/{user_id}/ban")
def ban_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.is_active = False
    db.commit()
    return {"detail": "Utilisateur banni"}


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return {
        "total_users": db.query(User).count(),
        "total_clients": db.query(User).filter(User.role == UserRole.client).count(),
        "total_artisans": db.query(User).filter(User.role == UserRole.artisan).count(),
        "total_demands": db.query(Demand).count(),
        "total_quotes": db.query(Quote).count(),
        "total_projects": db.query(Project).count(),
        "verified_artisans": db.query(User).filter(User.role == UserRole.artisan, User.is_verified == True).count(),
    }
