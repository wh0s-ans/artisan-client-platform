from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum as SAEnum, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class BadgeType(str, enum.Enum):
    none = "none"
    verified = "verified"
    top = "top"


class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(String)
    years_experience = Column(Integer, default=0)
    zone_geographique = Column(String)
    ville = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    disponible = Column(Boolean, default=True)
    tarif_horaire = Column(Float)
    portfolio_urls = Column(ARRAY(String), default=[])
    certifications = Column(ARRAY(String), default=[])
    badge = Column(SAEnum(BadgeType), default=BadgeType.none)
    rating_avg = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    response_time_minutes = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="artisan_profile")
    skills = relationship("ArtisanSkill", back_populates="artisan", cascade="all, delete-orphan")
