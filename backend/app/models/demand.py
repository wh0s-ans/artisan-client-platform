from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum as SAEnum, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class DemandCategory(str, enum.Enum):
    plomberie = "plomberie"
    electricite = "electricite"
    peinture = "peinture"
    menuiserie = "menuiserie"
    climatisation = "climatisation"
    carrelage = "carrelage"
    jardinage = "jardinage"
    maconnerie = "maconnerie"
    autre = "autre"


class DemandStatus(str, enum.Enum):
    ouverte = "ouverte"
    en_attente = "en_attente"
    acceptee = "acceptee"
    en_cours = "en_cours"
    terminee = "terminee"
    annulee = "annulee"


class Demand(Base):
    __tablename__ = "demands"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(SAEnum(DemandCategory), nullable=False)
    budget_min = Column(Float)
    budget_max = Column(Float)
    localisation = Column(String)
    ville = Column(String)
    urgence = Column(Boolean, default=False)
    status = Column(SAEnum(DemandStatus), default=DemandStatus.ouverte)
    photos_urls = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    client = relationship("User", foreign_keys=[client_id])
    quotes = relationship("Quote", back_populates="demand", cascade="all, delete-orphan")
