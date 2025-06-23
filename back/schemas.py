from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Memory item schemas
class MemoryItemBase(BaseModel):
    content: str
    memory_aids: List[str]

class MemoryItemCreate(MemoryItemBase):
    pass

class MemoryItem(MemoryItemBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Review schedule schemas
class ReviewScheduleBase(BaseModel):
    memory_item_id: int
    review_date: datetime
    completed: bool = False

class ReviewScheduleCreate(ReviewScheduleBase):
    pass

class ReviewSchedule(ReviewScheduleBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 