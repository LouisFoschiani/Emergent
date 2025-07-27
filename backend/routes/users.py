from fastapi import APIRouter, HTTPException
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from backend.models import User, UserCreate, UserUpdate
from datetime import datetime
import os

router = APIRouter()

# MongoDB connection
from backend.server import db

@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    department: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all users with optional filtering"""
    query = {}
    
    # Build search query
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"department": {"$regex": search, "$options": "i"}}
        ]
    
    if department:
        query["department"] = department
    if role:
        query["role"] = role
    if status:
        query["status"] = status
    
    users = await db.users.find(query).skip(skip).limit(limit).to_list(limit)
    return [User(**user) for user in users]

@router.post("/", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.dict()
    user = User(**user_dict)
    
    await db.users.insert_one(user.dict())
    return user

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get a specific user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserUpdate):
    """Update a user"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {k: v for k, v in user_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id})
    return User(**updated_user)

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Delete a user"""
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.put("/{user_id}/login")
async def update_last_login(user_id: str):
    """Update user's last login time"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"id": user_id}, 
        {"$set": {"last_login": datetime.utcnow()}}
    )
    return {"message": "Last login updated"}