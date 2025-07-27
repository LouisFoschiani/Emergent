from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.models import Equipment, EquipmentCreate, EquipmentUpdate
from datetime import datetime
import os

router = APIRouter()

# MongoDB connection
from backend.server import db

@router.get("/", response_model=List[Equipment])
async def get_equipments(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    assigned_to: Optional[str] = None
):
    """Get all equipments with optional filtering"""
    query = {}
    
    # Build search query
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"type": {"$regex": search, "$options": "i"}},
            {"serial_number": {"$regex": search, "$options": "i"}},
            {"assigned_to": {"$regex": search, "$options": "i"}}
        ]
    
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    if assigned_to:
        query["assigned_to"] = assigned_to
    
    equipments = await db.equipments.find(query).skip(skip).limit(limit).to_list(limit)
    return [Equipment(**equipment) for equipment in equipments]

@router.post("/", response_model=Equipment)
async def create_equipment(equipment_data: EquipmentCreate):
    """Create a new equipment"""
    # Check if serial number already exists
    existing_equipment = await db.equipments.find_one({"serial_number": equipment_data.serial_number})
    if existing_equipment:
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    equipment_dict = equipment_data.dict()
    equipment = Equipment(**equipment_dict)
    
    await db.equipments.insert_one(equipment.dict())
    return equipment

@router.get("/{equipment_id}", response_model=Equipment)
async def get_equipment(equipment_id: str):
    """Get a specific equipment by ID"""
    equipment = await db.equipments.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return Equipment(**equipment)

@router.put("/{equipment_id}", response_model=Equipment)
async def update_equipment(equipment_id: str, equipment_data: EquipmentUpdate):
    """Update an equipment"""
    equipment = await db.equipments.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    update_data = {k: v for k, v in equipment_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.equipments.update_one({"id": equipment_id}, {"$set": update_data})
    
    updated_equipment = await db.equipments.find_one({"id": equipment_id})
    return Equipment(**updated_equipment)

@router.delete("/{equipment_id}")
async def delete_equipment(equipment_id: str):
    """Delete an equipment"""
    result = await db.equipments.delete_one({"id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted successfully"}

@router.put("/{equipment_id}/assign/{user_id}")
async def assign_equipment(equipment_id: str, user_id: str):
    """Assign equipment to a user"""
    equipment = await db.equipments.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Check if user exists
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update equipment assignment and status
    await db.equipments.update_one(
        {"id": equipment_id}, 
        {
            "$set": {
                "assigned_to": user["name"],
                "status": "En service",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Equipment assigned successfully"}

@router.put("/{equipment_id}/unassign")
async def unassign_equipment(equipment_id: str):
    """Unassign equipment from user"""
    equipment = await db.equipments.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Update equipment to remove assignment
    await db.equipments.update_one(
        {"id": equipment_id}, 
        {
            "$set": {
                "assigned_to": None,
                "status": "Disponible",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Equipment unassigned successfully"}