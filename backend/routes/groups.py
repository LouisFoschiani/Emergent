from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import Group, GroupCreate, GroupUpdate
from datetime import datetime
import os

router = APIRouter()

# MongoDB connection
from server import db

@router.get("/", response_model=List[Group])
async def get_groups(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all groups with optional filtering"""
    query = {}
    
    # Build search query
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"leader": {"$regex": search, "$options": "i"}}
        ]
    
    if status:
        query["status"] = status
    
    groups = await db.groups.find(query).skip(skip).limit(limit).to_list(limit)
    return [Group(**group) for group in groups]

@router.post("/", response_model=Group)
async def create_group(group_data: GroupCreate):
    """Create a new group"""
    # Check if group name already exists
    existing_group = await db.groups.find_one({"name": group_data.name})
    if existing_group:
        raise HTTPException(status_code=400, detail="Group name already exists")
    
    group_dict = group_data.dict()
    group = Group(**group_dict)
    
    await db.groups.insert_one(group.dict())
    return group

@router.get("/{group_id}", response_model=Group)
async def get_group(group_id: str):
    """Get a specific group by ID"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return Group(**group)

@router.put("/{group_id}", response_model=Group)
async def update_group(group_id: str, group_data: GroupUpdate):
    """Update a group"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    update_data = {k: v for k, v in group_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.groups.update_one({"id": group_id}, {"$set": update_data})
    
    updated_group = await db.groups.find_one({"id": group_id})
    return Group(**updated_group)

@router.delete("/{group_id}")
async def delete_group(group_id: str):
    """Delete a group"""
    result = await db.groups.delete_one({"id": group_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted successfully"}

@router.post("/{group_id}/members/{user_id}")
async def add_member_to_group(group_id: str, user_id: str):
    """Add a user to a group"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user exists
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Increment members count
    await db.groups.update_one(
        {"id": group_id}, 
        {"$inc": {"members": 1}}
    )
    
    return {"message": "User added to group successfully"}

@router.delete("/{group_id}/members/{user_id}")
async def remove_member_from_group(group_id: str, user_id: str):
    """Remove a user from a group"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Decrement members count (ensure it doesn't go below 0)
    current_members = group.get("members", 0)
    if current_members > 0:
        await db.groups.update_one(
            {"id": group_id}, 
            {"$inc": {"members": -1}}
        )
    
    return {"message": "User removed from group successfully"}