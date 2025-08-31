#!/usr/bin/env python3
"""
Script สำหรับเพิ่มข้อมูลเริ่มต้นในฐานข้อมูล (แบบปลอดภัย)
Usage: python seed_data_safe.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import Service, Staff, StaffService, StaffSchedule
from sqlmodel import Session, select
from datetime import time

def seed_services_safe():
    """เพิ่มข้อมูลบริการ (ถ้ายังไม่มี)"""
    with Session(engine) as session:
        # ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        existing_services = session.exec(select(Service)).all()
        if existing_services:
            print("ℹ️  มีข้อมูลบริการอยู่แล้ว ข้ามการเพิ่ม")
            for service in existing_services:
                print(f"  - {service.name}: {service.duration_minutes} นาที, ฿{service.price}")
            return
        
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

def seed_staff_safe():
    """เพิ่มข้อมูลพนักงาน (ถ้ายังไม่มี)"""
    with Session(engine) as session:
        # ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        existing_staff = session.exec(select(Staff)).all()
        if existing_staff:
            print("ℹ️  มีข้อมูลพนักงานอยู่แล้ว ข้ามการเพิ่ม")
            for person in existing_staff:
                print(f"  - {person.name}: {person.phone}")
            return
        
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

def seed_staff_services_safe():
    """เพิ่มความสัมพันธ์พนักงาน-บริการ (ถ้ายังไม่มี)"""
    with Session(engine) as session:
        # ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        existing_staff_services = session.exec(select(StaffService)).all()
        if existing_staff_services:
            print("ℹ️  มีความสัมพันธ์พนักงาน-บริการอยู่แล้ว ข้ามการเพิ่ม")
            return
        
        # ตรวจสอบว่ามีข้อมูล Staff และ Service หรือไม่
        staff_count = session.exec(select(Staff)).count()
        service_count = session.exec(select(Service)).count()
        
        if staff_count < 2 or service_count < 3:
            print("⚠️  ต้องมีข้อมูลพนักงานและบริการก่อน ข้ามการเพิ่ม StaffService")
            return
        
        # เพิ่มข้อมูลใหม่
        staff_services = [
            StaffService(staff_id=1, service_id=1),  # พนักงาน 1 - ตัดผม
            StaffService(staff_id=1, service_id=2),  # พนักงาน 1 - สระไดร์
            StaffService(staff_id=1, service_id=3),  # พนักงาน 1 - ทำเล็บ
            StaffService(staff_id=2, service_id=1),  # พนักงาน 2 - ตัดผม
            StaffService(staff_id=2, service_id=2),  # พนักงาน 2 - สระไดร์
        ]
        
        session.add_all(staff_services)
        session.commit()
        print("✅ เพิ่มความสัมพันธ์พนักงาน-บริการสำเร็จ")
        
        # แสดงข้อมูลที่เพิ่ม
        for ss in staff_services:
            print(f"  - พนักงาน {ss.staff_id} ทำได้บริการ {ss.service_id}")

def seed_staff_schedules_safe():
    """เพิ่มตารางเวลาพนักงาน (ถ้ายังไม่มี)"""
    with Session(engine) as session:
        # ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        existing_schedules = session.exec(select(StaffSchedule)).all()
        if existing_schedules:
            print("ℹ️  มีตารางเวลาพนักงานอยู่แล้ว ข้ามการเพิ่ม")
            return
        
        # ตรวจสอบว่ามีข้อมูล Staff หรือไม่
        staff_count = session.exec(select(Staff)).count()
        if staff_count < 2:
            print("⚠️  ต้องมีข้อมูลพนักงานก่อน ข้ามการเพิ่ม StaffSchedule")
            return
        
        # เพิ่มข้อมูลใหม่
        schedules = []
        for staff_id in [1, 2]:  # สำหรับพนักงานทั้ง 2 คน
            for weekday in range(0, 6):  # Mon-Sat
                schedules.append(StaffSchedule(
                    staff_id=staff_id,
                    weekday=weekday,
                    open_time=time(9, 0),  # 09:00
                    close_time=time(17, 0),  # 17:00
                    is_working=True
                ))
        
        session.add_all(schedules)
        session.commit()
        print("✅ เพิ่มตารางเวลาพนักงานสำเร็จ")
        
        # แสดงข้อมูลที่เพิ่ม
        print(f"  - พนักงานทั้ง 2 คน ทำงาน จันทร์-เสาร์ 09:00-17:00")

def main():
    """ฟังก์ชันหลัก"""
    print("🚀 เริ่มต้นเพิ่มข้อมูลในฐานข้อมูล (แบบปลอดภัย)...")
    print("=" * 60)
    
    try:
        # เพิ่มข้อมูลตามลำดับที่ถูกต้อง
        seed_services_safe()
        print()
        seed_staff_safe()
        print()
        seed_staff_services_safe()
        print()
        seed_staff_schedules_safe()
        print()
        print("🎉 เพิ่มข้อมูลเสร็จสิ้น!")
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")
        print("💡 ลองรัน backend ก่อนเพื่อให้ seed data ทำงานอัตโนมัติ")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
