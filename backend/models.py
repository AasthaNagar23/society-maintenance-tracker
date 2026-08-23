from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Text
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="resident")


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount = Column(Float, nullable=False)
    month = Column(String, nullable=False)
    status = Column(String, default="pending")
    due_date = Column(Date, nullable=False)
    paid_at = Column(DateTime, nullable=True)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    photo_url = Column(String, nullable=True)

    status = Column(String, default="Open", nullable=False)
    priority = Column(String, default="Medium", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False
    )

    actor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)

    note = Column(Text, nullable=True)

    changed_at = Column(
        DateTime,
        default=datetime.utcnow
    )