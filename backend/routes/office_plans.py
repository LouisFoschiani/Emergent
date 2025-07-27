from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import OfficePlan, OfficePlanCreate, OfficePlanUpdate, OfficeElement, OfficeElementCreate, OfficeElementUpdate
from datetime import datetime
import os

router = APIRouter()

# MongoDB connection
from server import db

@router.get("/", response_model=List[OfficePlan])
async def get_office_plans(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    created_by: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get all office plans with optional filtering"""
    query = {}
    
    # Build search query
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"created_by": {"$regex": search, "$options": "i"}}
        ]
    
    if created_by:
        query["created_by"] = created_by
    if is_active is not None:
        query["is_active"] = is_active
    
    # Get plans
    plans = await db.office_plans.find(query).skip(skip).limit(limit).to_list(limit)
    
    # Get elements for each plan
    result = []
    for plan in plans:
        elements = await db.office_elements.find({"office_plan_id": plan["id"]}).to_list(1000)
        plan["elements"] = [OfficeElement(**element) for element in elements]
        result.append(OfficePlan(**plan))
    
    return result

@router.post("/", response_model=OfficePlan)
async def create_office_plan(plan_data: OfficePlanCreate):
    """Create a new office plan"""
    # Check if plan name already exists for this user
    existing_plan = await db.office_plans.find_one({
        "name": plan_data.name,
        "created_by": plan_data.created_by
    })
    if existing_plan:
        raise HTTPException(status_code=400, detail="Plan name already exists for this user")
    
    plan_dict = plan_data.dict()
    plan = OfficePlan(**plan_dict)
    
    await db.office_plans.insert_one(plan.dict())
    return plan

@router.get("/{plan_id}", response_model=OfficePlan)
async def get_office_plan(plan_id: str):
    """Get a specific office plan by ID"""
    plan = await db.office_plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Office plan not found")
    
    # Get elements for this plan
    elements = await db.office_elements.find({"office_plan_id": plan_id}).to_list(1000)
    plan["elements"] = [OfficeElement(**element) for element in elements]
    
    return OfficePlan(**plan)

@router.put("/{plan_id}", response_model=OfficePlan)
async def update_office_plan(plan_id: str, plan_data: OfficePlanUpdate):
    """Update an office plan"""
    plan = await db.office_plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Office plan not found")
    
    update_data = {k: v for k, v in plan_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.office_plans.update_one({"id": plan_id}, {"$set": update_data})
    
    # Get updated plan with elements
    updated_plan = await db.office_plans.find_one({"id": plan_id})
    elements = await db.office_elements.find({"office_plan_id": plan_id}).to_list(1000)
    updated_plan["elements"] = [OfficeElement(**element) for element in elements]
    
    return OfficePlan(**updated_plan)

@router.delete("/{plan_id}")
async def delete_office_plan(plan_id: str):
    """Delete an office plan and all its elements"""
    result = await db.office_plans.delete_one({"id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Office plan not found")
    
    # Delete all elements associated with this plan
    await db.office_elements.delete_many({"office_plan_id": plan_id})
    
    return {"message": "Office plan deleted successfully"}

@router.post("/{plan_id}/elements", response_model=OfficeElement)
async def add_element_to_plan(plan_id: str, element_data: OfficeElementCreate):
    """Add an element to an office plan"""
    # Check if plan exists
    plan = await db.office_plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Office plan not found")
    
    # Set the plan_id
    element_data.office_plan_id = plan_id
    
    element_dict = element_data.dict()
    element = OfficeElement(**element_dict)
    
    await db.office_elements.insert_one(element.dict())
    
    # Update plan's updated_at
    await db.office_plans.update_one(
        {"id": plan_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return element

@router.get("/{plan_id}/elements", response_model=List[OfficeElement])
async def get_plan_elements(plan_id: str):
    """Get all elements for a specific plan"""
    # Check if plan exists
    plan = await db.office_plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Office plan not found")
    
    elements = await db.office_elements.find({"office_plan_id": plan_id}).to_list(1000)
    return [OfficeElement(**element) for element in elements]

@router.put("/{plan_id}/elements/{element_id}", response_model=OfficeElement)
async def update_plan_element(plan_id: str, element_id: str, element_data: OfficeElementUpdate):
    """Update an element in an office plan"""
    element = await db.office_elements.find_one({
        "id": element_id,
        "office_plan_id": plan_id
    })
    if not element:
        raise HTTPException(status_code=404, detail="Element not found in this plan")
    
    update_data = {k: v for k, v in element_data.dict().items() if v is not None}
    
    await db.office_elements.update_one(
        {"id": element_id},
        {"$set": update_data}
    )
    
    # Update plan's updated_at
    await db.office_plans.update_one(
        {"id": plan_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    updated_element = await db.office_elements.find_one({"id": element_id})
    return OfficeElement(**updated_element)

@router.delete("/{plan_id}/elements/{element_id}")
async def delete_plan_element(plan_id: str, element_id: str):
    """Delete an element from an office plan"""
    result = await db.office_elements.delete_one({
        "id": element_id,
        "office_plan_id": plan_id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Element not found in this plan")
    
    # Update plan's updated_at
    await db.office_plans.update_one(
        {"id": plan_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Element deleted successfully"}

@router.post("/{plan_id}/duplicate")
async def duplicate_office_plan(plan_id: str, new_name: str, created_by: str):
    """Duplicate an office plan with all its elements"""
    # Get original plan
    original_plan = await db.office_plans.find_one({"id": plan_id})
    if not original_plan:
        raise HTTPException(status_code=404, detail="Office plan not found")
    
    # Check if new name already exists for this user
    existing_plan = await db.office_plans.find_one({
        "name": new_name,
        "created_by": created_by
    })
    if existing_plan:
        raise HTTPException(status_code=400, detail="Plan name already exists for this user")
    
    # Create new plan
    new_plan_data = {
        **original_plan,
        "name": new_name,
        "created_by": created_by,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    del new_plan_data["_id"]  # Remove MongoDB _id
    new_plan = OfficePlan(**new_plan_data)
    
    await db.office_plans.insert_one(new_plan.dict())
    
    # Get and duplicate elements
    original_elements = await db.office_elements.find({"office_plan_id": plan_id}).to_list(1000)
    
    new_elements = []
    for element in original_elements:
        del element["_id"]  # Remove MongoDB _id
        new_element_data = {
            **element,
            "office_plan_id": new_plan.id
        }
        new_element = OfficeElement(**new_element_data)
        new_elements.append(new_element.dict())
    
    if new_elements:
        await db.office_elements.insert_many(new_elements)
    
    # Return new plan with elements
    elements = await db.office_elements.find({"office_plan_id": new_plan.id}).to_list(1000)
    new_plan.elements = [OfficeElement(**element) for element in elements]
    
    return new_plan