from fastapi import FastAPI, HTTPException, Depends, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from config import settings
from database import get_db, engine
import models
import schemas
from models import Base

app = FastAPI(title="MemBuddy API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/api/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": "mock_refresh_token"  # Implement proper refresh token
    }

class MemoryGenerateRequest(BaseModel):
    content: str

@app.post("/api/memory/generate")
async def generate_memory_aids(
    request: MemoryGenerateRequest,
    current_user: schemas.User = Depends(get_current_user)
):
    print(f"前端传来的内容: {request.content}")
    # 动态 mock 数据
    mind_map = {
    "id": "root",
    "label": "机器学习的分类",
    "children": [
        {"id": "part1", "label": "监督学习", "children": [
            {"id": "leaf1", "label": "分类"},
            {"id": "leaf2", "label": "回归"}
        ]},
        {"id": "part2", "label": "非监督学习", "children": [
            {"id": "leaf3", "label": "聚类"},
            {"id": "leaf4", "label": "降维"}
        ]},
        {"id": "part3", "label": "半监督学习", "children": [
            {"id": "leaf5", "label": "有少量标签数据"},
            {"id": "leaf6", "label": "大量无标签数据"}
        ]},
        {"id": "part4", "label": "强化学习", "children": [
            {"id": "leaf7", "label": "基于奖励"},
            {"id": "leaf8", "label": "智能体与环境交互"}
        ]}
    ]
    }

    mnemonics = [
        {
            "id": "rhyme", "title": "顺口溜记忆法", "content": "监督分类又回归，非监督里聚降维，半监督少量有标签，强化学习奖励追。", "type": "rhyme"
        },
        {
            "id": "acronym", "title": "首字法", "content": "监非半强", "type": "acronym", "explanation": "利用监督、非监督、半监督、强化学习的首字母记忆"
        },
        {
            "id": "story", "title": "故事联想法", "content": "想象一个学生（机器学习），在老师（监督）的指导下学会了分类和回归。后来，学生离开了老师，自己摸索（非监督），学会了聚类和降维。有时，学生会得到一些提示（半监督），少量有标签的数据，大部分还是靠自己。最后，学生通过不断尝试和错误，根据奖励来调整自己的行为（强化学习）。", "type": "story"
        }
    ]

    sensory_associations = [
        {
            "id": "visual", "title": "视觉联想", "type": "visual", "content": [
                {"dynasty": "监督学习", "image": "🌟", "color": "#fbbf24", "association": "老师批改作业，有明确的对错"},
                {"dynasty": "非监督学习", "image": "🔵", "color": "#06b6d4", "association": "自己整理房间，没有固定的标准"}
            ]
        },
        {
            "id": "auditory", "title": "听觉联想", "type": "auditory", "content": [
                {"dynasty": "半监督学习", "sound": "提示音", "rhythm": "断断续续"},
                {"dynasty": "强化学习", "sound": "游戏音效", "rhythm": "紧张刺激"}
            ]
        },
        {
            "id": "tactile", "title": "触觉联想", "type": "tactile", "content": [
                {"dynasty": "分类", "texture": "分拣箱", "feeling": "整理"},
                {"dynasty": "回归", "texture": "平滑的曲线", "feeling": "流畅"}
            ]
        }
    ]
    return {
        "mindMap": mind_map,
        "mnemonics": mnemonics,
        "sensoryAssociations": sensory_associations
    }

@app.get("/api/memory/items", response_model=List[schemas.MemoryItem])
def get_memory_items(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(models.MemoryItem)\
        .filter(models.MemoryItem.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return items

@app.post("/api/memory/items", response_model=schemas.MemoryItem)
def create_memory_item(
    item: schemas.MemoryItemCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_item = models.MemoryItem(
        content=item.content,
        memory_aids=json.dumps(item.memory_aids),
        user_id=current_user.id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/memory/items/{item_id}", response_model=schemas.MemoryItem)
def get_memory_item(
    item_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.MemoryItem)\
        .filter(models.MemoryItem.id == item_id, models.MemoryItem.user_id == current_user.id)\
        .first()
    if item is None:
        raise HTTPException(status_code=404, detail="Memory item not found")
    return item

@app.put("/api/memory/items/{item_id}", response_model=schemas.MemoryItem)
def update_memory_item(
    item_id: int,
    item: schemas.MemoryItemCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_item = db.query(models.MemoryItem)\
        .filter(models.MemoryItem.id == item_id, models.MemoryItem.user_id == current_user.id)\
        .first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Memory item not found")
    
    db_item.content = item.content
    db_item.memory_aids = json.dumps(item.memory_aids)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/memory/items/{item_id}")
def delete_memory_item(
    item_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_item = db.query(models.MemoryItem)\
        .filter(models.MemoryItem.id == item_id, models.MemoryItem.user_id == current_user.id)\
        .first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Memory item not found")
    
    db.delete(db_item)
    db.commit()
    return {"status": "success"}

@app.post("/api/review/schedule", response_model=schemas.ReviewSchedule)
def schedule_review(
    review: schemas.ReviewScheduleCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify memory item exists and belongs to user
    memory_item = db.query(models.MemoryItem)\
        .filter(models.MemoryItem.id == review.memory_item_id, models.MemoryItem.user_id == current_user.id)\
        .first()
    if memory_item is None:
        raise HTTPException(status_code=404, detail="Memory item not found")
    
    db_review = models.ReviewSchedule(
        memory_item_id=review.memory_item_id,
        user_id=current_user.id,
        review_date=review.review_date,
        completed=review.completed
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@app.get("/api/review/schedule", response_model=List[schemas.ReviewSchedule])
def get_review_schedule(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviews = db.query(models.ReviewSchedule)\
        .filter(models.ReviewSchedule.user_id == current_user.id)\
        .all()
    return reviews

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Initialize database tables
Base.metadata.create_all(bind=engine)
