from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy import delete
from ..database import get_session
from ..models import Staff, StaffService, StaffSchedule
from ..deps import require_admin

router = APIRouter(prefix="/staff", tags=["staff"])

@router.get("")
def list_staff(session: Session = Depends(get_session)):
    return session.exec(select(Staff).where(Staff.is_active == True)).all()

@router.post("")
def create_staff(staff: Staff, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff

@router.put("/{staff_id}")
def update_staff(staff_id: int, staff: Staff, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    db_staff = session.get(Staff, staff_id)
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    for field, value in staff.dict(exclude_unset=True).items():
        setattr(db_staff, field, value)
    
    session.add(db_staff)
    session.commit()
    session.refresh(db_staff)
    return db_staff

@router.delete("/{staff_id}")
def delete_staff(staff_id: int, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    staff.is_active = False
    session.add(staff)
    session.commit()
    return {"ok": True}

@router.get("/{staff_id}/services")
def get_staff_services(staff_id: int, session: Session = Depends(get_session)):
    return session.exec(select(StaffService).where(StaffService.staff_id == staff_id, StaffService.is_active == True)).all()

@router.post("/{staff_id}/services")
def assign_service_to_staff(staff_id: int, service_id: int, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    staff_service = StaffService(staff_id=staff_id, service_id=service_id)
    session.add(staff_service)
    session.commit()
    return staff_service

@router.get("/{staff_id}/schedule")
def get_staff_schedule(staff_id: int, session: Session = Depends(get_session)):
    return session.exec(select(StaffSchedule).where(StaffSchedule.staff_id == staff_id)).all()

@router.post("/{staff_id}/schedule")
def set_staff_schedule(staff_id: int, schedules: list[StaffSchedule], session: Session = Depends(get_session), _: None = Depends(require_admin)):
    # ลบตารางเดิม
    session.exec(delete(StaffSchedule).where(StaffSchedule.staff_id == staff_id))
    
    # เพิ่มตารางใหม่
    for schedule in schedules:
        schedule.staff_id = staff_id
        session.add(schedule)
    
    session.commit()
    return {"ok": True}
