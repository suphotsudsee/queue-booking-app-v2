#!/usr/bin/env python3
"""
Script ง่ายๆ สำหรับเพิ่มข้อมูลบริการ
Usage: python add_services.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import Service
from sqlmodel import Session

def add_services():
    """เพิ่มข้อมูลบริการ"""
    with Session(engine) as session:
        # เพิ่มข้อมูลบริการ
        services = [
            Service(name="ตัดผม", description="ตัดผมชาย", duration_minutes=30, price=100),
            Service(name="สระไดร์", description="สระไดร์", duration_minutes=60, price=200),
            Service(name="ทำเล็บ", description="ทำเล็บ", duration_minutes=45, price=150),
        ]
        
        for service in services:
            session.add(service)
            print(f"➕ เพิ่ม: {service.name} - {service.duration_minutes} นาที, ฿{service.price}")
        
        session.commit()
        print("✅ เพิ่มข้อมูลบริการสำเร็จ!")

if __name__ == "__main__":
    try:
        add_services()
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")
        print("💡 ตรวจสอบว่า backend รันอยู่และฐานข้อมูลพร้อมใช้งาน")
