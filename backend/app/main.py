from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select
from .database import engine
from .core.config import settings
from .models import User, BusinessHours, Service, Staff, StaffService, StaffSchedule
from .security import get_password_hash
from .routers import auth, appointments, settings as settings_router, services, staff

app = FastAPI(title="Queue Booking API")

any_origin = settings.allowed_origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # อนุญาตทุก origin ชั่วคราว
    allow_credentials=False,  # ต้องเป็น False เมื่อใช้ "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(appointments.router)
app.include_router(settings_router.router)
app.include_router(services.router)
app.include_router(staff.router)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    # Seed admin if not exists
    with Session(engine) as session:
        admin = session.exec(select(User).where(User.email == settings.admin_email)).first()
        if not admin:
            admin = User(
                name="Administrator",
                email=settings.admin_email,
                role="admin",
                password_hash=get_password_hash(settings.admin_password),
                phone="",
            )
            session.add(admin)
            session.commit()
        
        # Seed default business hours if none
        has_hours = session.exec(select(BusinessHours)).first()
        if not has_hours:
            import datetime as dt
            defaults = []
            for wd in range(0, 6):  # Mon-Sat open 09:00-17:00
                defaults.append(BusinessHours(weekday=wd, open_time=dt.time(9,0), close_time=dt.time(17,0), slot_minutes=30))
            session.add_all(defaults)
            session.commit()
        
        # Seed default services if none
        has_services = session.exec(select(Service)).first()
        if not has_services:
            defaults = [
                Service(name="ตัดผม", description="ตัดผมชาย", duration_minutes=30, price=100),
                Service(name="สระไดร์", description="สระไดร์", duration_minutes=60, price=200),
                Service(name="ทำเล็บ", description="ทำเล็บ", duration_minutes=45, price=150),
            ]
            session.add_all(defaults)
            session.commit()
        
        # Seed default staff if none
        has_staff = session.exec(select(Staff)).first()
        if not has_staff:
            defaults = [
                Staff(name="พนักงาน 1", phone="081-234-5678"),
                Staff(name="พนักงาน 2", phone="082-345-6789"),
            ]
            session.add_all(defaults)
            session.commit()
        
        # Seed default staff services if none
        has_staff_services = session.exec(select(StaffService)).first()
        if not has_staff_services:
            # สมมติว่าพนักงาน 1 ทำได้ทุกบริการ, พนักงาน 2 ทำได้แค่ตัดผมและสระไดร์
            staff_services = [
                StaffService(staff_id=1, service_id=1),  # พนักงาน 1 - ตัดผม
                StaffService(staff_id=1, service_id=2),  # พนักงาน 1 - สระไดร์
                StaffService(staff_id=1, service_id=3),  # พนักงาน 1 - ทำเล็บ
                StaffService(staff_id=2, service_id=1),  # พนักงาน 2 - ตัดผม
                StaffService(staff_id=2, service_id=2),  # พนักงาน 2 - สระไดร์
            ]
            session.add_all(staff_services)
            session.commit()
        
        # Seed default staff schedules if none
        has_staff_schedules = session.exec(select(StaffSchedule)).first()
        if not has_staff_schedules:
            import datetime as dt
            staff_schedules = []
            for staff_id in [1, 2]:  # สำหรับพนักงานทั้ง 2 คน
                for wd in range(0, 6):  # Mon-Sat
                    staff_schedules.append(StaffSchedule(
                        staff_id=staff_id,
                        weekday=wd,
                        open_time=dt.time(9,0),
                        close_time=dt.time(17,0),
                        is_working=True
                    ))
            session.add_all(staff_schedules)
            session.commit()

@app.get("/health")
def health():
    return {"status": "ok"}
