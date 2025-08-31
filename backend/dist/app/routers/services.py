from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..models import Service
from ..deps import require_admin

router = APIRouter(prefix="/services", tags=["services"])

@router.get("")
def list_services(session: Session = Depends(get_session)):
    return session.exec(select(Service).where(Service.is_active == True)).all()

@router.post("")
def create_service(service: Service, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    session.add(service)
    session.commit()
    session.refresh(service)
    return service

@router.put("/{service_id}")
def update_service(service_id: int, service: Service, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    db_service = session.get(Service, service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    for field, value in service.dict(exclude_unset=True).items():
        setattr(db_service, field, value)
    
    session.add(db_service)
    session.commit()
    session.refresh(db_service)
    return db_service

@router.delete("/{service_id}")
def delete_service(service_id: int, session: Session = Depends(get_session), _: None = Depends(require_admin)):
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.is_active = False
    session.add(service)
    session.commit()
    return {"ok": True}
