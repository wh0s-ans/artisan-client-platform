from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class UserType(str, enum.Enum):
    ARTISAN = "artisan"
    CLIENT = "client"


class DemandStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    user_type = Column(Enum(UserType), nullable=False)
    
    # Profile info
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    profile_picture = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    
    # Artisan specific
    specialties = Column(JSON, nullable=True)
    location = Column(String, nullable=True)
    service_radius = Column(Integer, nullable=True)
    certifications = Column(JSON, nullable=True)
    portfolio_images = Column(JSON, nullable=True)
    availability = Column(String, nullable=True)
    
    # Ratings
    average_rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    
    # Verification
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    demands = relationship("Demand", foreign_keys="Demand.client_id", back_populates="client")
    proposals = relationship("Proposal", back_populates="artisan")
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    ratings_given = relationship("Rating", foreign_keys="Rating.rater_id", back_populates="rater")
    ratings_received = relationship("Rating", foreign_keys="Rating.rated_user_id", back_populates="rated_user")


class Demand(Base):
    __tablename__ = "demands"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    budget = Column(Float, nullable=True)
    location = Column(String, nullable=False)
    images = Column(JSON, nullable=True)
    urgency = Column(String, default="normal")
    status = Column(Enum(DemandStatus), default=DemandStatus.PENDING)
    
    accepted_artisan_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="demands")
    proposals = relationship("Proposal", back_populates="demand")
    messages = relationship("Message", back_populates="demand")


class Proposal(Base):
    __tablename__ = "proposals"
    
    id = Column(Integer, primary_key=True, index=True)
    demand_id = Column(Integer, ForeignKey("demands.id"), nullable=False)
    artisan_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    price = Column(Float, nullable=False)
    timeline = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String, default="pending")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    demand = relationship("Demand", back_populates="proposals")
    artisan = relationship("User", back_populates="proposals")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    demand_id = Column(Integer, ForeignKey("demands.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    attachments = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    demand = relationship("Demand", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="messages_received")


class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    rater_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rated_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    demand_id = Column(Integer, ForeignKey("demands.id"), nullable=True)
    
    score = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    
    # For artisans (rated by clients)
    quality_score = Column(Float, nullable=True)
    timeliness_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    value_score = Column(Float, nullable=True)
    
    # For clients (rated by artisans)
    clarity_score = Column(Float, nullable=True)
    commitment_score = Column(Float, nullable=True)
    payment_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    rater = relationship("User", foreign_keys=[rater_id], back_populates="ratings_given")
    rated_user = relationship("User", foreign_keys=[rated_user_id], back_populates="ratings_received")
