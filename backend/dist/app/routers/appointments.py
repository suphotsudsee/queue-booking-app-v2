from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from ..database import get_session
from ..models import Appointment, BusinessHours, Holiday, Service, StaffService, StaffSchedule
from ..deps import require_admin
from ..core.config import settings
from ..line_notify import send_line_notify
from datetime import datetime, timedelta, date, time
from typing import List

router = APIRouter(prefix="/appointments", tags=["appointments"])

def _overlap(a_start: time, a_end: time, b_start: time, b_end: time) -> bool:
    return max(a_start, b_start) < min(a_end, b_end)

@router.get("")
def list_appointments(
    session: Session = Depends(get_session),
    date_from: date | None = None,
    date_to: date | None = None,
    status: str | None = None,
    _: None = Depends(require_admin),
):
    stmt = select(Appointment)
    if date_from:
        stmt = stmt.where(Appointment.date >= date_from)
    if date_to:
        stmt = stmt.where(Appointment.date <= date_to)
    if status:
        stmt = stmt.where(Appointment.status == status)
    return session.exec(stmt.order_by(Appointment.date, Appointment.start_time)).all()

@router.get("/slots")
def get_slots(
    d: date = Query(..., description="YYYY-MM-DD"), 
    service_id: int = Query(..., description="Service ID"),
    session: Session = Depends(get_session)
):
    # ตรวจสอบบริการ
    service = session.get(Service, service_id)
    if not service or not service.is_active:
        raise HTTPException(status_code=400, detail="Service not found")
    
    # หาพนักงานที่ทำบริการนี้ได้
    staff_services = session.exec(
        select(StaffService).where(
            StaffService.service_id == service_id,
            StaffService.is_active == True
        )
    ).all()
    
    if not staff_services:
        return {"date": d.isoformat(), "slots": [], "message": "No staff available for this service"}
    
    staff_ids = [ss.staff_id for ss in staff_services]
    
    # หาตารางเวลาของพนักงาน
    staff_schedules = session.exec(
        select(StaffSchedule).where(
            StaffSchedule.staff_id.in_(staff_ids),
            StaffSchedule.weekday == d.weekday(),
            StaffSchedule.is_working == True
        )
    ).all()
    
    if not staff_schedules:
        return {"date": d.isoformat(), "slots": []}
    
    # สร้าง slots จากตารางเวลาของพนักงาน
    slots = []
    for schedule in staff_schedules:
        start = datetime.combine(d, schedule.open_time)
        end = datetime.combine(d, schedule.close_time)
        slot_duration = timedelta(minutes=service.duration_minutes)
        
        # หาคิวที่มีอยู่แล้ว
        existing = session.exec(
            select(Appointment).where(
                Appointment.date == d,
                Appointment.staff_id == schedule.staff_id,
                Appointment.status != "canceled"
            )
        ).all()
        
        t = start
        while t + slot_duration <= end:
            slot_start = t.time()
            slot_end = (t + slot_duration).time()
            
            # ตรวจสอบว่าช่วงเวลานี้ว่างหรือไม่
            conflict = any(
                _overlap(slot_start, slot_end, ap.start_time, ap.end_time) 
                for ap in existing
            )
            
            slots.append({
                "start": slot_start.strftime("%H:%M"),
                "end": slot_end.strftime("%H:%M"),
                "available": not conflict,
                "staff_id": schedule.staff_id,
                "service_id": service_id,
                "duration_minutes": service.duration_minutes
            })
            
            t += slot_duration
    
    return {
        "date": d.isoformat(), 
        "slots": slots, 
        "service": service.name,
        "duration_minutes": service.duration_minutes
    }

@router.post("")
def create_appointment(ap: Appointment, session: Session = Depends(get_session)):
    # แปลง date string เป็น date object ถ้าจำเป็น
    if isinstance(ap.date, str):
        try:
            from datetime import datetime
            ap.date = datetime.strptime(ap.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # แปลง time string เป็น time object ถ้าจำเป็น
    if isinstance(ap.start_time, str):
        try:
            ap.start_time = datetime.strptime(ap.start_time, "%H:%M").time()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_time format. Use HH:MM")
    
    if isinstance(ap.end_time, str):
        try:
            ap.end_time = datetime.strptime(ap.end_time, "%H:%M").time()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_time format. Use HH:MM")
    
    # Basic validation: not in holiday, within business hours, no overlap
    bh = session.exec(select(BusinessHours).where(BusinessHours.weekday == ap.date.weekday())).first()
    if not bh:
        raise HTTPException(status_code=400, detail="Shop closed on this day")
    if not (bh.open_time <= ap.start_time and ap.end_time <= bh.close_time):
        raise HTTPException(status_code=400, detail="Outside business hours")
    # Holiday check
    if session.exec(select(Holiday).where(Holiday.date == ap.date)).first():
        raise HTTPException(status_code=400, detail="Holiday")
    # Overlap check
    exist = session.exec(select(Appointment).where(Appointment.date == ap.date, Appointment.status != "canceled")).all()
    for e in exist:
        if max(ap.start_time, e.start_time) < min(ap.end_time, e.end_time):
            raise HTTPException(status_code=400, detail="Time slot already booked")

    session.add(ap)
    session.commit()
    session.refresh(ap)

    # Notify admin via LINE (optional)
    msg = f"📅 คิวใหม่: #{ap.id} {ap.date} {ap.start_time}-{ap.end_time}\n👤 {ap.customer_name} ({ap.customer_phone})\nหมายเหตุ: {ap.note or '-'}"
    send_line_notify(settings.line_notify_token, msg)

    return ap

@router.post("/{ap_id}/confirm")
def confirm(ap_id: int, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    ap = session.get(Appointment, ap_id)
    if not ap:
        raise HTTPException(status_code=404, detail="Not found")
    ap.status = "confirmed"
    session.add(ap)
    session.commit()

    send_line_notify(settings.line_notify_token, f"✅ ยืนยันคิว #{ap.id} {ap.date} {ap.start_time}-{ap.end_time}")

    return {"ok": True}

@router.post("/{ap_id}/cancel")
def cancel(ap_id: int, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    ap = session.get(Appointment, ap_id)
    if not ap:
        raise HTTPException(status_code=404, detail="Not found")
    ap.status = "canceled"
    session.add(ap)
    session.commit()

    send_line_notify(settings.line_notify_token, f"❌ ยกเลิกคิว #{ap.id} {ap.date} {ap.start_time}-{ap.end_time}")

    return {"ok": True}
