from pydantic import BaseModel, EmailStr
from datetime import date, datetime


# =========================================================
# USER SCHEMAS
# =========================================================

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


# =========================================================
# MAINTENANCE SCHEMAS
# =========================================================

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


# =========================================================
# COMPLAINT SCHEMAS
# =========================================================

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

    # Overdue status calculated by Complaint model
    is_overdue: bool = False

    class Config:
        from_attributes = True


# =========================================================
# COMPLAINT HISTORY
# =========================================================

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


# =========================================================
# COMPLAINT STATUS UPDATE
# =========================================================

class ComplaintStatusUpdate(BaseModel):
    status: str
    note: str | None = None


# =========================================================
# NOTICE BOARD SCHEMAS
# =========================================================

class NoticeCreate(BaseModel):
    title: str
    content: str
    is_important: bool = False
    is_pinned: bool = False


class NoticeResponse(BaseModel):
    id: int
    title: str
    content: str
    is_important: bool
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    created_by: int

    class Config:
        from_attributes = True