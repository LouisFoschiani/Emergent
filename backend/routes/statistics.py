from fastapi import APIRouter
from models import Statistics

router = APIRouter()

# MongoDB connection
from server import db

@router.get("/", response_model=Statistics)
async def get_statistics():
    """Get application statistics"""
    
    # Count users
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"status": "Actif"})
    
    # Count groups
    total_groups = await db.groups.count_documents({})
    
    # Count equipments
    total_equipments = await db.equipments.count_documents({})
    equipments_in_service = await db.equipments.count_documents({"status": "En service"})
    equipments_available = await db.equipments.count_documents({"status": "Disponible"})
    equipments_in_maintenance = await db.equipments.count_documents({"status": "En maintenance"})
    
    # Count office plans and elements
    total_office_plans = await db.office_plans.count_documents({"is_active": True})
    total_office_elements = await db.office_elements.count_documents({})
    available_desks = await db.office_elements.count_documents({
        "type": "desk",
        "status": "available"
    })
    occupied_desks = await db.office_elements.count_documents({
        "type": "desk", 
        "status": "occupied"
    })
    
    return Statistics(
        total_users=total_users,
        active_users=active_users,
        total_groups=total_groups,
        total_equipments=total_equipments,
        equipments_in_service=equipments_in_service,
        equipments_available=equipments_available,
        equipments_in_maintenance=equipments_in_maintenance,
        total_office_plans=total_office_plans,
        total_office_elements=total_office_elements,
        available_desks=available_desks,
        occupied_desks=occupied_desks
    )