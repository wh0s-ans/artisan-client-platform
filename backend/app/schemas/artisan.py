from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ArtisanProfileResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str] = None
    years_experience: int = 0
    zone_geographique: Optional[str] = None
    ville: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    disponible: bool = True
    tarif_horaire: Optional[float] = None
    portfolio_urls: list[str] = []
    certifications: list[str] = []
    badge: str = "none"
    rating_avg: float = 0.0
    reviews_count: int = 0
    response_time_minutes: Optional[int] = None
    skills: list["SkillResponse"] = []
    # User info
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False

    class Config:
        from_attributes = True


class ArtisanProfileUpdate(BaseModel):
    bio: Optional[str] = None
    years_experience: Optional[int] = None
    zone_geographique: Optional[str] = None
    ville: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    disponible: Optional[bool] = None
    tarif_horaire: Optional[float] = None
    portfolio_urls: Optional[list[str]] = None
    certifications: Optional[list[str]] = None


class SkillResponse(BaseModel):
    id: int
    skill_name: str
    category: Optional[str] = None

    class Config:
        from_attributes = True


class SkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = None


class ArtisanSearchParams(BaseModel):
    q: Optional[str] = None
    ville: Optional[str] = None
    category: Optional[str] = None
    note_min: Optional[float] = None
    prix_max: Optional[float] = None
    disponible: Optional[bool] = None
    sort: Optional[str] = None  # "rating", "price", "experience"


# Resolve forward ref
ArtisanProfileResponse.model_rebuild()
