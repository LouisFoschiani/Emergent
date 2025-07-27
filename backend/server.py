from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from routes import users, groups, equipments, statistics
from models import User, Group, Equipment
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include route modules
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(equipments.router, prefix="/equipments", tags=["equipments"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])

# Keep the original root endpoint
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database with sample data if empty"""
    logger.info("Starting up application...")
    
    # Check if we need to seed data
    user_count = await db.users.count_documents({})
    if user_count == 0:
        logger.info("Seeding database with initial data...")
        await seed_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

async def seed_database():
    """Seed database with initial data"""
    
    # Sample users
    sample_users = [
        {
            "name": "Jean Dupont",
            "email": "jean.dupont@company.com",
            "role": "Administrateur",
            "status": "Actif",
            "department": "IT",
            "phone": "+33 1 23 45 67 89",
            "last_login": datetime(2025, 1, 20, 14, 30)
        },
        {
            "name": "Marie Martin",
            "email": "marie.martin@company.com",
            "role": "Utilisateur",
            "status": "Actif",
            "department": "RH",
            "phone": "+33 1 23 45 67 90",
            "last_login": datetime(2025, 1, 20, 9, 15)
        },
        {
            "name": "Pierre Leroy",
            "email": "pierre.leroy@company.com",
            "role": "Manager",
            "status": "Inactif",
            "department": "Commercial",
            "phone": "+33 1 23 45 67 91",
            "last_login": datetime(2025, 1, 18, 16, 45)
        },
        {
            "name": "Sophie Bernard",
            "email": "sophie.bernard@company.com",
            "role": "Utilisateur",
            "status": "Actif",
            "department": "Marketing",
            "phone": "+33 1 23 45 67 92",
            "last_login": datetime(2025, 1, 20, 11, 20)
        },
        {
            "name": "Luc Moreau",
            "email": "luc.moreau@company.com",
            "role": "Utilisateur",
            "status": "Actif",
            "department": "Finance",
            "phone": "+33 1 23 45 67 93",
            "last_login": datetime(2025, 1, 19, 15, 30)
        }
    ]
    
    users = [User(**user_data) for user_data in sample_users]
    await db.users.insert_many([user.dict() for user in users])
    
    # Sample groups
    sample_groups = [
        {
            "name": "Équipe IT",
            "description": "Équipe informatique et développement",
            "members": 12,
            "leader": "Jean Dupont",
            "status": "Actif",
            "permissions": ["admin", "read", "write"]
        },
        {
            "name": "Ressources Humaines",
            "description": "Gestion du personnel et recrutement",
            "members": 8,
            "leader": "Marie Martin",
            "status": "Actif",
            "permissions": ["read", "write"]
        },
        {
            "name": "Commercial",
            "description": "Équipe commerciale et ventes",
            "members": 15,
            "leader": "Pierre Leroy",
            "status": "Actif",
            "permissions": ["read", "write"]
        },
        {
            "name": "Marketing",
            "description": "Communication et marketing digital",
            "members": 6,
            "leader": "Sophie Bernard",
            "status": "Actif",
            "permissions": ["read", "write"]
        },
        {
            "name": "Direction",
            "description": "Équipe de direction",
            "members": 3,
            "leader": "Directeur Général",
            "status": "Actif",
            "permissions": ["admin", "read", "write", "delete"]
        }
    ]
    
    groups = [Group(**group_data) for group_data in sample_groups]
    await db.groups.insert_many([group.dict() for group in groups])
    
    # Sample equipments
    sample_equipments = [
        {
            "name": "MacBook Pro 16\"",
            "type": "Ordinateur portable",
            "serial_number": "MB2023001",
            "status": "En service",
            "assigned_to": "Jean Dupont",
            "location": "Bureau 101",
            "purchase_date": datetime(2023, 3, 15),
            "warranty": datetime(2025, 3, 15),
            "value": 2500.0
        },
        {
            "name": "iPhone 14 Pro",
            "type": "Smartphone",
            "serial_number": "IP2023002",
            "status": "En service",
            "assigned_to": "Marie Martin",
            "location": "Bureau 205",
            "purchase_date": datetime(2023, 9, 20),
            "warranty": datetime(2024, 9, 20),
            "value": 1200.0
        },
        {
            "name": "Dell Monitor 27\"",
            "type": "Écran",
            "serial_number": "DL2023003",
            "status": "Disponible",
            "assigned_to": None,
            "location": "Stock IT",
            "purchase_date": datetime(2023, 6, 10),
            "warranty": datetime(2026, 6, 10),
            "value": 350.0
        },
        {
            "name": "Imprimante Canon",
            "type": "Imprimante",
            "serial_number": "CN2023004",
            "status": "En maintenance",
            "assigned_to": None,
            "location": "Open Space",
            "purchase_date": datetime(2023, 1, 20),
            "warranty": datetime(2024, 1, 20),
            "value": 800.0
        },
        {
            "name": "Surface Laptop",
            "type": "Ordinateur portable",
            "serial_number": "SF2023005",
            "status": "En service",
            "assigned_to": "Sophie Bernard",
            "location": "Bureau 312",
            "purchase_date": datetime(2023, 8, 15),
            "warranty": datetime(2025, 8, 15),
            "value": 1800.0
        }
    ]
    
    equipments = [Equipment(**equipment_data) for equipment_data in sample_equipments]
    await db.equipments.insert_many([equipment.dict() for equipment in equipments])
    
    logger.info("Database seeded successfully!")
