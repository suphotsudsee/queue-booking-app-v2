#!/usr/bin/env python3
"""
Script สำหรับเพิ่มข้อมูลเริ่มต้นในฐานข้อมูล
Usage: python seed_data.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import Service, Staff, StaffService, StaffSchedule, BusinessHours
from sqlmodel import Session, select
from datetime import time, datetime, UTC

def seed_business_hours():
    """เพิ่มข้อมูลเวลาทำการร้าน"""
    with Session(engine) as session:
        # เพิ่มข้อมูลใหม่
        business_hours = []
        for weekday in range(0, 7):  # 0=Monday, 6=Sunday
            if weekday < 6:  # Mon-Sat เปิด
                business_hours.append(BusinessHours(
                    weekday=weekday,
                    open_time=time(9, 0),  # 09:00
                    close_time=time(17, 0),  # 17:00
                    slot_minutes=30
                ))
            else:  # Sunday ปิด
                business_hours.append(BusinessHours(
                    weekday=weekday,
                    open_time=time(0, 0),  # 00:00
                    close_time=time(0, 0),  # 00:00
                    slot_minutes=30
                ))
        
        session.add_all(business_hours)
        session.commit()
        print("✅ เพิ่มข้อมูลเวลาทำการร้านสำเร็จ")
        print(f"  - จันทร์-เสาร์: 09:00-17:00")
        print(f"  - อาทิตย์: ปิด")

def seed_services():
    """เพิ่มข้อมูลบริการ"""
    with Session(engine) as session:
        # เพิ่มข้อมูลใหม่
        services = [
            Service(name="ตัดผม", description="ตัดผมชาย", duration_minutes=30, price=100),
            Service(name="สระไดร์", description="สระไดร์", duration_minutes=60, price=200),
            Service(name="ทำเล็บ", description="ทำเล็บ", duration_minutes=45, price=150),
        ]
        
        session.add_all(services)
        session.commit()
        print("✅ เพิ่มข้อมูลบริการสำเร็จ")
        
        # แสดงข้อมูลที่เพิ่ม
        for service in services:
            print(f"  - {service.name}: {service.duration_minutes} นาที, ฿{service.price}")
        
        return services

def seed_staff():
    """เพิ่มข้อมูลพนักงาน"""
    with Session(engine) as session:
        # เพิ่มข้อมูลใหม่
        staff = [
            Staff(name="พนักงาน 1", phone="081-234-5678"),
            Staff(name="พนักงาน 2", phone="082-345-6789"),
        ]
        
        session.add_all(staff)
        session.commit()
        print("✅ เพิ่มข้อมูลพนักงานสำเร็จ")
        
        # แสดงข้อมูลที่เพิ่ม
        for person in staff:
            print(f"  - {person.name}: {person.phone}")
        
        return staff

def seed_staff_services(services, staff):
    """เพิ่มความสัมพันธ์พนักงาน-บริการ"""
    with Session(engine) as session:
        # เพิ่มข้อมูลใหม่
        current_time = datetime.now(UTC)
        staff_services = [
            StaffService(staff_id=staff[0].id, service_id=services[0].id, created_at=current_time),
            StaffService(staff_id=staff[0].id, service_id=services[1].id, created_at=current_time),
            StaffService(staff_id=staff[0].id, service_id=services[2].id, created_at=current_time),
            StaffService(staff_id=staff[1].id, service_id=services[0].id, created_at=current_time),
            StaffService(staff_id=staff[1].id, service_id=services[1].id, created_at=current_time),
        ]
        
        session.add_all(staff_services)
        session.commit()
        print("✅ เพิ่มความสัมพันธ์พนักงาน-บริการสำเร็จ")
        
        # แสดงข้อมูลที่เพิ่ม
        for ss in staff_services:
            print(f"  - พนักงาน {ss.staff_id} ทำได้บริการ {ss.service_id}")

def seed_staff_schedules(staff):
    """เพิ่มตารางเวลาของพนักงาน"""
    with Session(engine) as session:
        # เพิ่มข้อมูลใหม่
        current_time = datetime.now(UTC)
        schedules = []
        for person in staff:  # สำหรับพนักงานทุกคน
            for weekday in range(0, 6):  # Mon-Sat (0=Monday, 5=Saturday)
                schedules.append(StaffSchedule(
                    staff_id=person.id,
                    weekday=weekday,
                    open_time=time(9, 0),  # 09:00
                    close_time=time(17, 0),  # 17:00
                    is_working=True,
                    created_at=current_time
                ))
        
        session.add_all(schedules)
        session.commit()
        print("✅ เพิ่มตารางเวลาของพนักงานสำเร็จ")
        
        # แสดงข้อมูลที่เพิ่ม
        print(f"  - พนักงานทั้ง {len(staff)} คน ทำงาน จันทร์-เสาร์ 09:00-17:00")

def main():
    """ฟังก์ชันหลัก"""
    print("🚀 เริ่มต้นเพิ่มข้อมูลในฐานข้อมูล...")
    print("=" * 50)
    
    try:
        # ลบข้อมูลทั้งหมดก่อน (ตามลำดับ foreign key)
        print("🗑️  ลบข้อมูลเดิม...")
        with Session(engine) as session:
            # ลบตามลำดับ foreign key (child tables ก่อน)
            session.exec(StaffService.__table__.delete())
            session.exec(StaffSchedule.__table__.delete())
            session.exec(Service.__table__.delete())
            session.exec(Staff.__table__.delete())
            session.exec(BusinessHours.__table__.delete())
            session.commit()
        print("✅ ลบข้อมูลเดิมสำเร็จ")
        print()
        
        # เพิ่มข้อมูลใหม่ตามลำดับที่ถูกต้อง และเก็บ object ที่ return กลับมา
        seed_business_hours()
        print()
        services = seed_services()
        print()
        staff = seed_staff()
        print()
        seed_staff_services(services, staff)
        print()
        seed_staff_schedules(staff)
        print()
        print("🎉 เพิ่มข้อมูลทั้งหมดสำเร็จ!")
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
