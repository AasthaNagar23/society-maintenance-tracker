from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from datetime import datetime

from database import Base, engine, SessionLocal
from models import User, Maintenance, Complaint, ComplaintHistory

from schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    MaintenanceCreate,
    MaintenanceResponse,
    ComplaintCreate,
    ComplaintResponse,
    ComplaintHistoryResponse,
    ComplaintStatusUpdate
)

from auth import create_access_token, verify_access_token, require_admin


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Society Maintenance Tracker API"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


password_hash = PasswordHash.recommended()


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user(
    payload=Depends(verify_access_token),
    db: Session = Depends(get_db)
):
    # IMPORTANT:
    # JWT token contains "sub", not "user_id"
    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Society Maintenance Tracker API is running!"
    }


# =========================================================
# REGISTER
# =========================================================

@app.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_hash.hash(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=hashed_password,
        role="resident"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    user: LoginRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not password_hash.verify(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(existing_user.id),
            "role": existing_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================================================
# GET CURRENT USER
# =========================================================

@app.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.get("/admin")
def admin_dashboard(
    current_admin=Depends(require_admin)
):
    return {
        "message": "Welcome Admin!",
        "user_id": current_admin["user_id"],
        "role": current_admin["role"]
    }


# =========================================================
# CREATE MAINTENANCE
# =========================================================

@app.post(
    "/maintenance",
    response_model=MaintenanceResponse
)
def create_maintenance(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin)
):

    user = db.query(User).filter(
        User.id == maintenance.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_maintenance = Maintenance(
        user_id=maintenance.user_id,
        amount=maintenance.amount,
        month=maintenance.month,
        due_date=maintenance.due_date,
        status="pending"
    )

    db.add(new_maintenance)
    db.commit()
    db.refresh(new_maintenance)

    return new_maintenance


# =========================================================
# CREATE COMPLAINT
# =========================================================

@app.post(
    "/complaints",
    response_model=ComplaintResponse
)
def create_complaint(
    complaint: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_complaint = Complaint(
        user_id=current_user.id,
        category=complaint.category,
        description=complaint.description,
        status="Open",
        priority="Medium"
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    history = ComplaintHistory(
        complaint_id=new_complaint.id,
        actor_id=current_user.id,
        old_status=None,
        new_status="Open",
        note="Complaint created"
    )

    db.add(history)
    db.commit()

    return new_complaint


# =========================================================
# GET MY COMPLAINTS
# =========================================================

@app.get(
    "/complaints",
    response_model=list[ComplaintResponse]
)
def get_my_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id
    ).all()

    return complaints


# =========================================================
# GET COMPLAINT HISTORY
# =========================================================

@app.get(
    "/complaints/{complaint_id}/history",
    response_model=list[ComplaintHistoryResponse]
)
def get_complaint_history(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.user_id == current_user.id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    history = db.query(ComplaintHistory).filter(
        ComplaintHistory.complaint_id == complaint_id
    ).order_by(
        ComplaintHistory.changed_at
    ).all()

    return history


# =========================================================
# ADMIN - GET ALL COMPLAINTS
# =========================================================

@app.get(
    "/admin/complaints",
    response_model=list[ComplaintResponse]
)
def get_all_complaints(
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    complaints = db.query(Complaint).all()

    return complaints


# =========================================================
# ADMIN - UPDATE COMPLAINT STATUS
# =========================================================

@app.put(
    "/admin/complaints/{complaint_id}/status",
    response_model=ComplaintResponse
)
def update_complaint_status(
    complaint_id: int,
    update: ComplaintStatusUpdate,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    old_status = complaint.status

    complaint.status = update.status

    history = ComplaintHistory(
        complaint_id=complaint.id,
        actor_id=current_admin["user_id"],
        old_status=old_status,
        new_status=update.status,
        note=update.note
    )

    db.add(history)
    db.commit()
    db.refresh(complaint)

    return complaint


# =========================================================
# GET MY MAINTENANCE
# =========================================================

@app.get(
    "/maintenance",
    response_model=list[MaintenanceResponse]
)
def get_my_maintenance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    maintenance = db.query(Maintenance).filter(
        Maintenance.user_id == current_user.id
    ).all()

    return maintenance


# =========================================================
# MARK MAINTENANCE AS PAID
# =========================================================

@app.put(
    "/maintenance/{maintenance_id}/pay",
    response_model=MaintenanceResponse
)
def pay_maintenance(
    maintenance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    maintenance = db.query(Maintenance).filter(
        Maintenance.id == maintenance_id,
        Maintenance.user_id == current_user.id
    ).first()

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    if maintenance.status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Maintenance already paid"
        )

    maintenance.status = "paid"
    maintenance.paid_at = datetime.utcnow()

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# ADMIN - GET ALL MAINTENANCE
# =========================================================

@app.get(
    "/admin/maintenance",
    response_model=list[MaintenanceResponse]
)
def get_all_maintenance(
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    maintenance = db.query(Maintenance).all()

    return maintenance


# =========================================================
# ADMIN DASHBOARD STATISTICS
# =========================================================

@app.get("/admin/dashboard")
def admin_dashboard_stats(
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    total_users = db.query(User).count()

    total_complaints = db.query(Complaint).count()

    open_complaints = db.query(Complaint).filter(
        Complaint.status == "Open"
    ).count()

    in_progress_complaints = db.query(Complaint).filter(
        Complaint.status == "In Progress"
    ).count()

    resolved_complaints = db.query(Complaint).filter(
        Complaint.status == "Resolved"
    ).count()

    total_maintenance = db.query(Maintenance).count()

    pending_maintenance = db.query(Maintenance).filter(
        Maintenance.status == "pending"
    ).count()

    paid_maintenance = db.query(Maintenance).filter(
        Maintenance.status == "paid"
    ).count()

    return {
        "total_users": total_users,
        "total_complaints": total_complaints,
        "open_complaints": open_complaints,
        "in_progress_complaints": in_progress_complaints,
        "resolved_complaints": resolved_complaints,
        "total_maintenance": total_maintenance,
        "pending_maintenance": pending_maintenance,
        "paid_maintenance": paid_maintenance
    }


# =========================================================
# ADMIN - UPDATE COMPLAINT PRIORITY
# =========================================================

@app.put(
    "/admin/complaints/{complaint_id}/priority",
    response_model=ComplaintResponse
)
def update_complaint_priority(
    complaint_id: int,
    priority: str,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    allowed_priorities = [
        "Low",
        "Medium",
        "High",
        "Critical"
    ]

    if priority not in allowed_priorities:
        raise HTTPException(
            status_code=400,
            detail="Invalid priority"
        )

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    complaint.priority = priority

    db.commit()
    db.refresh(complaint)

    return complaint


# =========================================================
# ADMIN - FILTER COMPLAINTS
# =========================================================

@app.get(
    "/admin/complaints/filter",
    response_model=list[ComplaintResponse]
)
def filter_complaints(
    status: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    query = db.query(Complaint)

    if status:
        query = query.filter(
            Complaint.status == status
        )

    if priority:
        query = query.filter(
            Complaint.priority == priority
        )

    if category:
        query = query.filter(
            Complaint.category == category
        )

    return query.all()


# =========================================================
# ADMIN - SEARCH COMPLAINTS
# =========================================================

@app.get(
    "/admin/complaints/search",
    response_model=list[ComplaintResponse]
)
def search_complaints(
    keyword: str,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    complaints = db.query(Complaint).filter(
        (Complaint.description.ilike(f"%{keyword}%")) |
        (Complaint.category.ilike(f"%{keyword}%"))
    ).all()

    return complaints


# =========================================================
# GET SINGLE COMPLAINT
# =========================================================

@app.get(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse
)
def get_single_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.user_id == current_user.id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint


# =========================================================
# UPDATE PROFILE
# =========================================================

@app.put(
    "/me",
    response_model=UserResponse
)
def update_profile(
    name: str,
    phone: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.name = name
    current_user.phone = phone

    db.commit()
    db.refresh(current_user)

    return current_user


# =========================================================
# MAINTENANCE DETAILS
# =========================================================

@app.get("/maintenance/{maintenance_id}")
def get_maintenance_details(
    maintenance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    maintenance = db.query(Maintenance).filter(
        Maintenance.id == maintenance_id,
        Maintenance.user_id == current_user.id
    ).first()

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    return {
        "id": maintenance.id,
        "user_id": maintenance.user_id,
        "amount": maintenance.amount,
        "month": maintenance.month,
        "status": maintenance.status,
        "due_date": maintenance.due_date,
        "paid_at": maintenance.paid_at
    }


# =========================================================
# ADMIN - GET ALL RESIDENTS
# =========================================================

@app.get("/admin/residents")
def get_all_residents(
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    residents = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
        for user in residents
    ]


# =========================================================
# ADMIN - RESIDENT MAINTENANCE
# =========================================================

@app.get("/admin/residents/{user_id}/maintenance")
def get_resident_maintenance(
    user_id: int,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Resident not found"
        )

    maintenance = db.query(Maintenance).filter(
        Maintenance.user_id == user_id
    ).all()

    return maintenance


# =========================================================
# ADMIN - RESIDENT COMPLAINTS
# =========================================================

@app.get(
    "/admin/residents/{user_id}/complaints",
    response_model=list[ComplaintResponse]
)
def get_resident_complaints(
    user_id: int,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Resident not found"
        )

    complaints = db.query(Complaint).filter(
        Complaint.user_id == user_id
    ).all()

    return complaints


# =========================================================
# ADMIN - DELETE COMPLAINT
# =========================================================

@app.delete("/admin/complaints/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    db.query(ComplaintHistory).filter(
        ComplaintHistory.complaint_id == complaint_id
    ).delete()

    db.delete(complaint)
    db.commit()

    return {
        "message": "Complaint deleted successfully",
        "complaint_id": complaint_id
    }


# =========================================================
# ADMIN - DELETE MAINTENANCE
# =========================================================

@app.delete("/admin/maintenance/{maintenance_id}")
def delete_maintenance(
    maintenance_id: int,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    maintenance = db.query(Maintenance).filter(
        Maintenance.id == maintenance_id
    ).first()

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    db.delete(maintenance)
    db.commit()

    return {
        "message": "Maintenance deleted successfully",
        "maintenance_id": maintenance_id
    }


# =========================================================
# ADMIN - UPDATE USER ROLE
# =========================================================

@app.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    allowed_roles = [
        "resident",
        "admin"
    ]

    if role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Use resident or admin."
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.role = role

    db.commit()
    db.refresh(user)

    return {
        "message": "User role updated successfully",
        "user_id": user.id,
        "role": user.role
    }


# =========================================================
# ADMIN - DASHBOARD SUMMARY
# =========================================================

@app.get("/admin/dashboard/summary")
def admin_dashboard_summary(
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    total_residents = db.query(User).filter(
        User.role == "resident"
    ).count()

    total_complaints = db.query(Complaint).count()

    open_complaints = db.query(Complaint).filter(
        Complaint.status == "Open"
    ).count()

    in_progress_complaints = db.query(Complaint).filter(
        Complaint.status == "In Progress"
    ).count()

    resolved_complaints = db.query(Complaint).filter(
        Complaint.status == "Resolved"
    ).count()

    total_maintenance = db.query(Maintenance).count()

    pending_maintenance = db.query(Maintenance).filter(
        Maintenance.status == "pending"
    ).count()

    paid_maintenance = db.query(Maintenance).filter(
        Maintenance.status == "paid"
    ).count()

    return {
        "total_residents": total_residents,
        "total_complaints": total_complaints,
        "open_complaints": open_complaints,
        "in_progress_complaints": in_progress_complaints,
        "resolved_complaints": resolved_complaints,
        "total_maintenance": total_maintenance,
        "pending_maintenance": pending_maintenance,
        "paid_maintenance": paid_maintenance
    }


# =========================================================
# RESIDENT - DASHBOARD SUMMARY
# =========================================================

@app.get("/dashboard")
def resident_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    total_complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id
    ).count()

    open_complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id,
        Complaint.status == "Open"
    ).count()

    in_progress_complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id,
        Complaint.status == "In Progress"
    ).count()

    resolved_complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id,
        Complaint.status == "Resolved"
    ).count()

    total_maintenance = db.query(Maintenance).filter(
        Maintenance.user_id == current_user.id
    ).count()

    pending_maintenance = db.query(Maintenance).filter(
        Maintenance.user_id == current_user.id,
        Maintenance.status == "pending"
    ).count()

    paid_maintenance = db.query(Maintenance).filter(
        Maintenance.user_id == current_user.id,
        Maintenance.status == "paid"
    ).count()

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "role": current_user.role
        },
        "complaints": {
            "total": total_complaints,
            "open": open_complaints,
            "in_progress": in_progress_complaints,
            "resolved": resolved_complaints
        },
        "maintenance": {
            "total": total_maintenance,
            "pending": pending_maintenance,
            "paid": paid_maintenance
        }
    }