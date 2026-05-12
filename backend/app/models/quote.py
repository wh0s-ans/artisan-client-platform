from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class QuoteStatus(str, enum.Enum):
    en_attente = "en_attente"
    accepte = "accepte"
    refuse = "refuse"


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    demand_id = Column(Integer, ForeignKey("demands.id", ondelete="CASCADE"), nullable=False)
    artisan_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    prix_estime = Column(Float, nullable=False)
    delai_jours = Column(Integer, nullable=False)
    message = Column(String)
    status = Column(SAEnum(QuoteStatus), default=QuoteStatus.en_attente)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    demand = relationship("Demand", back_populates="quotes")
    artisan = relationship("User", foreign_keys=[artisan_id])
    project = relationship("Project", back_populates="quote", uselist=False)
