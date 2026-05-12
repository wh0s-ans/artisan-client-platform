from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_artisan
from app.models.user import User
from app.models.artisan_profile import ArtisanProfile
from app.models.artisan_skill import ArtisanSkill
from app.schemas.artisan import ArtisanProfileResponse, ArtisanProfileUpdate, SkillCreate, SkillResponse

router = APIRouter()


def _build_artisan_response(profile: ArtisanProfile) -> dict:
    user = profile.user
    data = {
        "id": profile.id, "user_id": profile.user_id,
        "bio": profile.bio, "years_experience": profile.years_experience,
        "zone_geographique": profile.zone_geographique, "ville": profile.ville,
        "latitude": profile.latitude, "longitude": profile.longitude,
        "disponible": profile.disponible, "tarif_horaire": profile.tarif_horaire,
        "portfolio_urls": profile.portfolio_urls or [], "certifications": profile.certifications or [],
        "badge": profile.badge.value if profile.badge else "none",
        "rating_avg": profile.rating_avg or 0, "reviews_count": profile.reviews_count or 0,
        "response_time_minutes": profile.response_time_minutes,
        "skills": [{"id": s.id, "skill_name": s.skill_name, "category": s.category} for s in (profile.skills or [])],
        "full_name": user.full_name, "email": user.email, "phone": user.phone,
        "avatar_url": user.avatar_url, "is_verified": user.is_verified,
    }
    return data


@router.get("", response_model=list[ArtisanProfileResponse])
def list_artisans(
    ville: Optional[str] = None,
    category: Optional[str] = None,
    note_min: Optional[float] = None,
    disponible: Optional[bool] = None,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(ArtisanProfile).options(joinedload(ArtisanProfile.user), joinedload(ArtisanProfile.skills))
    if ville:
        q = q.filter(ArtisanProfile.ville.ilike(f"%{ville}%"))
    if note_min:
        q = q.filter(ArtisanProfile.rating_avg >= note_min)
    if disponible is not None:
        q = q.filter(ArtisanProfile.disponible == disponible)
    if category:
        q = q.join(ArtisanSkill).filter(ArtisanSkill.category.ilike(f"%{category}%"))

    profiles = q.offset(skip).limit(limit).all()
    return [_build_artisan_response(p) for p in profiles]


@router.get("/me", response_model=ArtisanProfileResponse)
def get_my_artisan_profile(current_user: User = Depends(require_artisan), db: Session = Depends(get_db)):
    profile = db.query(ArtisanProfile).options(
        joinedload(ArtisanProfile.skills)
    ).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil artisan introuvable")
    return _build_artisan_response(profile)


@router.get("/me/stats")
def artisan_stats(current_user: User = Depends(require_artisan), db: Session = Depends(get_db)):
    from app.models.quote import Quote
    from app.models.project import Project, ProjectStatus
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    total_quotes = db.query(Quote).filter(Quote.artisan_id == current_user.id).count()
    accepted = db.query(Quote).filter(Quote.artisan_id == current_user.id, Quote.status == "accepte").count()
    projects_done = db.query(Project).filter(
        Project.artisan_id == current_user.id, Project.status == ProjectStatus.termine
    ).count()
    return {
        "total_quotes": total_quotes, "accepted_quotes": accepted,
        "projects_completed": projects_done,
        "rating_avg": profile.rating_avg if profile else 0,
        "reviews_count": profile.reviews_count if profile else 0,
    }


@router.get("/{artisan_id}", response_model=ArtisanProfileResponse)
def get_artisan(artisan_id: int, db: Session = Depends(get_db)):
    profile = db.query(ArtisanProfile).options(
        joinedload(ArtisanProfile.user), joinedload(ArtisanProfile.skills)
    ).filter(ArtisanProfile.id == artisan_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Artisan introuvable")
    return _build_artisan_response(profile)


@router.put("/me", response_model=ArtisanProfileResponse)
def update_artisan_profile(
    data: ArtisanProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_artisan)
):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return _build_artisan_response(profile)


@router.post("/me/skills", response_model=SkillResponse)
def add_skill(skill: SkillCreate, db: Session = Depends(get_db), current_user: User = Depends(require_artisan)):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    s = ArtisanSkill(artisan_id=profile.id, skill_name=skill.skill_name, category=skill.category)
    db.add(s)
    db.commit()
    db.refresh(s)
    return SkillResponse.model_validate(s)


@router.delete("/me/skills/{skill_id}")
def remove_skill(skill_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_artisan)):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    skill = db.query(ArtisanSkill).filter(ArtisanSkill.id == skill_id, ArtisanSkill.artisan_id == profile.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Compétence introuvable")
    db.delete(skill)
    db.commit()
    return {"detail": "Compétence supprimée"}
