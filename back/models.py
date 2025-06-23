from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    memory_items = relationship("MemoryItem", back_populates="owner")
    reviews = relationship("ReviewSchedule", back_populates="user")

class MemoryItem(Base):
    __tablename__ = "memory_items"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    memory_aids = Column(Text)  # JSON string of memory aids
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="memory_items")
    reviews = relationship("ReviewSchedule", back_populates="memory_item")

class ReviewSchedule(Base):
    __tablename__ = "review_schedules"

    id = Column(Integer, primary_key=True, index=True)
    memory_item_id = Column(Integer, ForeignKey("memory_items.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    review_date = Column(DateTime(timezone=True))
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    memory_item = relationship("MemoryItem", back_populates="reviews")
    user = relationship("User", back_populates="reviews") 