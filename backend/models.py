from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMINISTRATEUR = "Administrateur"
    MANAGER = "Manager" 
    UTILISATEUR = "Utilisateur"

class UserStatus(str, Enum):
    ACTIF = "Actif"
    INACTIF = "Inactif"

class GroupStatus(str, Enum):
    ACTIF = "Actif"
    INACTIF = "Inactif"

class EquipmentStatus(str, Enum):
    EN_SERVICE = "En service"
    DISPONIBLE = "Disponible"
    EN_MAINTENANCE = "En maintenance"
    HORS_SERVICE = "Hors service"

class Permission(str, Enum):
    ADMIN = "admin"
    READ = "read"
    WRITE = "write"
    DELETE = "delete"

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: UserRole
    status: UserStatus
    department: str
    phone: str
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str
    role: UserRole
    department: str
    phone: str
    status: UserStatus = UserStatus.ACTIF

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None

# Group Models
class Group(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    leader: str
    members: int = 0
    status: GroupStatus
    permissions: List[Permission]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class GroupCreate(BaseModel):
    name: str
    description: str
    leader: str
    permissions: List[Permission]
    status: GroupStatus = GroupStatus.ACTIF

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    leader: Optional[str] = None
    permissions: Optional[List[Permission]] = None
    status: Optional[GroupStatus] = None
    members: Optional[int] = None

# Equipment Models
class Equipment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str
    serial_number: str
    status: EquipmentStatus
    assigned_to: Optional[str] = None
    location: str
    purchase_date: datetime
    warranty: datetime
    value: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EquipmentCreate(BaseModel):
    name: str
    type: str
    serial_number: str
    location: str
    purchase_date: datetime
    warranty: datetime
    value: float
    status: EquipmentStatus = EquipmentStatus.DISPONIBLE
    assigned_to: Optional[str] = None

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[EquipmentStatus] = None
    assigned_to: Optional[str] = None
    location: Optional[str] = None
    purchase_date: Optional[datetime] = None
    warranty: Optional[datetime] = None
    value: Optional[float] = None

# Statistics Model
class Statistics(BaseModel):
    total_users: int
    active_users: int
    total_groups: int
    total_equipments: int
    equipments_in_service: int
    equipments_available: int
    equipments_in_maintenance: int