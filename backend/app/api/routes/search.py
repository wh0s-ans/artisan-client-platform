from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.core.database import get_db
from app.models.artisan_profile import ArtisanProfile
from app.models.artisan_skill import ArtisanSkill
from app.schemas.artisan import ArtisanProfileResponse

router = APIRouter()


@router.get("/artisans", response_model=list[ArtisanProfileResponse])
def search_artisans(
    q: Optional[str] = None,
    ville: Optional[str] = None,
    category: Optional[str] = None,
    note_min: Optional[float] = None,
    prix_max: Optional[float] = None,
    disponible: Optional[bool] = None,
    sort: Optional[str] = None,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(ArtisanProfile).options(
        joinedload(ArtisanProfile.user), joinedload(ArtisanProfile.skills)
    )

    if q:
        query = query.join(ArtisanProfile.user).filter(
            ArtisanProfile.user.has(full_name=None) |  # dummy to join
            ArtisanProfile.bio.ilike(f"%{q}%") |
            ArtisanProfile.user.has(full_name=q)
        )
        # Simplified: search in bio and skills
        from sqlalchemy import or_
        from app.models.user import User
        query = db.query(ArtisanProfile).options(
            joinedload(ArtisanProfile.user), joinedload(ArtisanProfile.skills)
        ).join(ArtisanProfile.user).filter(
            or_(
                User.full_name.ilike(f"%{q}%"),
                ArtisanProfile.bio.ilike(f"%{q}%"),
            )
        )

    if ville:
        query = query.filter(ArtisanProfile.ville.ilike(f"%{ville}%"))
    if note_min:
        query = query.filter(ArtisanProfile.rating_avg >= note_min)
    if prix_max:
        query = query.filter(ArtisanProfile.tarif_horaire <= prix_max)
    if disponible is not None:
        query = query.filter(ArtisanProfile.disponible == disponible)
    if category:
        query = query.join(ArtisanSkill, isouter=True).filter(
            ArtisanSkill.category.ilike(f"%{category}%")
        )

    # Sorting
    if sort == "rating":
        query = query.order_by(ArtisanProfile.rating_avg.desc())
    elif sort == "price":
        query = query.order_by(ArtisanProfile.tarif_horaire.asc())
    elif sort == "experience":
        query = query.order_by(ArtisanProfile.years_experience.desc())
    else:
        query = query.order_by(ArtisanProfile.rating_avg.desc())

    profiles = query.offset(skip).limit(limit).all()
    results = []
    for p in profiles:
        user = p.user
        results.append({
            "id": p.id, "user_id": p.user_id, "bio": p.bio,
            "years_experience": p.years_experience,
            "zone_geographique": p.zone_geographique, "ville": p.ville,
            "latitude": p.latitude, "longitude": p.longitude,
            "disponible": p.disponible, "tarif_horaire": p.tarif_horaire,
            "portfolio_urls": p.portfolio_urls or [],
            "certifications": p.certifications or [],
            "badge": p.badge.value if p.badge else "none",
            "rating_avg": p.rating_avg or 0, "reviews_count": p.reviews_count or 0,
            "response_time_minutes": p.response_time_minutes,
            "skills": [{"id": s.id, "skill_name": s.skill_name, "category": s.category} for s in (p.skills or [])],
            "full_name": user.full_name if user else None,
            "email": user.email if user else None,
            "phone": user.phone if user else None,
            "avatar_url": user.avatar_url if user else None,
            "is_verified": user.is_verified if user else False,
        })
    return results
