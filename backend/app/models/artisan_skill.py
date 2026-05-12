from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ArtisanSkill(Base):
    __tablename__ = "artisan_skills"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String, nullable=False)
    category = Column(String)

    artisan = relationship("ArtisanProfile", back_populates="skills")
