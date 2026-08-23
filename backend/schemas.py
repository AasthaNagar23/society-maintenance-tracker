from pydantic import BaseModel, EmailStr
from datetime import date, datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MaintenanceCreate(BaseModel):
    user_id: int
    amount: float
    month: str
    due_date: date


class MaintenanceResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    month: str
    status: str
    due_date: date
    paid_at: datetime | None = None

    class Config:
        from_attributes = True


# =========================
# Complaint Schemas
# =========================

class ComplaintCreate(BaseModel):
    category: str
    description: str


class ComplaintResponse(BaseModel):
    id: int
    user_id: int
    category: str
    description: str
    photo_url: str | None = None
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplaintHistoryResponse(BaseModel):
    id: int
    complaint_id: int
    actor_id: int
    old_status: str | None = None
    new_status: str
    note: str | None = None
    changed_at: datetime

    class Config:
        from_attributes = True

class ComplaintStatusUpdate(BaseModel):
    status: str
    note: str | None = None