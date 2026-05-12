from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ── Demand ──
class DemandCreate(BaseModel):
    title: str
    description: str
    category: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    localisation: Optional[str] = None
    ville: Optional[str] = None
    urgence: bool = False


class DemandUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    localisation: Optional[str] = None
    urgence: Optional[bool] = None


class DemandResponse(BaseModel):
    id: int
    client_id: int
    title: str
    description: str
    category: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    localisation: Optional[str] = None
    ville: Optional[str] = None
    urgence: bool = False
    status: str
    photos_urls: list[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Joined
    client_name: Optional[str] = None
    quotes_count: int = 0

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str


# ── Quote ──
class QuoteCreate(BaseModel):
    prix_estime: float
    delai_jours: int
    message: Optional[str] = None


class QuoteResponse(BaseModel):
    id: int
    demand_id: int
    artisan_id: int
    prix_estime: float
    delai_jours: int
    message: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    # Joined
    artisan_name: Optional[str] = None
    artisan_rating: Optional[float] = None
    artisan_avatar: Optional[str] = None

    class Config:
        from_attributes = True


# ── Project ──
class ProjectResponse(BaseModel):
    id: int
    demand_id: int
    quote_id: int
    artisan_id: int
    client_id: int
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    # Joined
    demand_title: Optional[str] = None
    artisan_name: Optional[str] = None
    client_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Message ──
class MessageCreate(BaseModel):
    content: str
    file_url: Optional[str] = None


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    project_id: int
    content: str
    file_url: Optional[str] = None
    is_read: bool = False
    created_at: Optional[datetime] = None
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Review ──
class ReviewCreate(BaseModel):
    rating: float
    qualite_travail: Optional[float] = None
    respect_delai: Optional[float] = None
    communication: Optional[float] = None
    rapport_qualite_prix: Optional[float] = None
    commentaire: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    project_id: int
    reviewer_id: int
    reviewed_id: int
    reviewer_role: str
    rating: float
    qualite_travail: Optional[float] = None
    respect_delai: Optional[float] = None
    communication: Optional[float] = None
    rapport_qualite_prix: Optional[float] = None
    commentaire: Optional[str] = None
    created_at: Optional[datetime] = None
    reviewer_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Notification ──
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    content: str
    is_read: bool = False
    related_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
