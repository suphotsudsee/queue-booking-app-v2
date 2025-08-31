from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from sqlalchemy import delete
from ..database import get_session
from ..models import BusinessHours, Holiday
from ..deps import require_admin

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/business-hours")
def get_business_hours(session: Session = Depends(get_session)):
    return session.exec(select(BusinessHours)).all()

@router.post("/business-hours")
def set_business_hours(hours: List[BusinessHours], session: Session = Depends(get_session), _: None = Depends(require_admin)):
    session.exec(delete(BusinessHours))
    for h in hours:
        session.add(h)
    session.commit()
    return {"ok": True}

@router.get("/holidays")
def get_holidays(session: Session = Depends(get_session)):
    return session.exec(select(Holiday)).all()

@router.post("/holidays")
def set_holidays(holidays: List[Holiday], session: Session = Depends(get_session), _: None = Depends(require_admin)):
    session.exec(delete(Holiday))
    for h in holidays:
        session.add(h)
    session.commit()
    return {"ok": True}
