from typing import Optional
from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    email: Optional[str] = None
    role: str = "customer"  # 'customer' or 'admin'
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # ชื่อบริการ เช่น "ตัดผม", "สระไดร์", "ทำเล็บ"
    description: Optional[str] = None
    duration_minutes: int = 30  # ระยะเวลาบริการ
    price: Optional[float] = None  # ราคา (ถ้ามี)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Staff(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # ชื่อพนักงาน
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StaffService(SQLModel, table=True):
    """ความสัมพันธ์ระหว่างพนักงานและบริการที่ทำได้"""
    id: Optional[int] = Field(default=None, primary_key=True)
    staff_id: int = Field(foreign_key="staff.id")
    service_id: int = Field(foreign_key="service.id")
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BusinessHours(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    weekday: int  # 0=Mon ... 6=Sun
    open_time: time
    close_time: time
    slot_minutes: int = 30

class StaffSchedule(SQLModel, table=True):
    """ตารางเวลาของพนักงานแต่ละคน"""
    id: Optional[int] = Field(default=None, primary_key=True)
    staff_id: int = Field(foreign_key="staff.id")
    weekday: int  # 0=Mon ... 6=Sun
    open_time: time
    close_time: time
    is_working: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Appointment(SQLModel, table=True):
    __table_args__ = (
        # เปลี่ยน constraint ให้รองรับ resource-based
        UniqueConstraint("date", "start_time", "end_time", "staff_id", "service_id", name="uq_appointment_slot"),
    )
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str
    customer_phone: str
    date: date
    start_time: time
    end_time: time
    service_id: int = Field(foreign_key="service.id")  # บริการที่จอง
    staff_id: int = Field(foreign_key="staff.id")      # พนักงานที่ให้บริการ
    status: str = "pending"  # pending | confirmed | completed | canceled
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Holiday(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    reason: Optional[str] = None
