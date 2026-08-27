from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    Date,
    DateTime,
    Text,
    Boolean
)

from database import Base
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    phone = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="resident"
    )


# =========================================================
# MAINTENANCE
# =========================================================

class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    month = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="pending"
    )

    due_date = Column(
        Date,
        nullable=False
    )

    paid_at = Column(
        DateTime,
        nullable=True
    )


# =========================================================
# COMPLAINT
# =========================================================

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    # Optional uploaded complaint photo
    photo_url = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="Open",
        nullable=False
    )

    priority = Column(
        String,
        default="Medium",
        nullable=False
    )

    # Complaint creation timestamp
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Last update timestamp
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # =====================================================
    # OVERDUE DETECTION
    # =====================================================

    @property
    def is_overdue(self):
        """
        A complaint is overdue when:

        1. It is not Resolved
        2. It has existed for at least OVERDUE_DAYS

        OVERDUE_DAYS is configured through .env.
        Default = 3 days.
        """

        overdue_days = int(
            os.getenv(
                "OVERDUE_DAYS",
                "3"
            )
        )

        # Resolved complaints are never overdue
        if self.status == "Resolved":
            return False

        # Safety check
        if not self.created_at:
            return False

        # Calculate complaint age
        age_in_days = (
            datetime.utcnow() - self.created_at
        ).days

        return age_in_days >= overdue_days


# =========================================================
# COMPLAINT HISTORY
# =========================================================

class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

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

    old_status = Column(
        String,
        nullable=True
    )

    new_status = Column(
        String,
        nullable=False
    )

    note = Column(
        Text,
        nullable=True
    )

    changed_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    content = Column(Text, nullable=False)

    is_important = Column(
        Boolean,
        default=False,
        nullable=False
    )

    is_pinned = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )