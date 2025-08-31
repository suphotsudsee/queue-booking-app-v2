#!/bin/bash

echo "========================================"
echo "    Queue Booking App - Backend"
echo "========================================"
echo

# ตรวจสอบว่า Python ติดตั้งแล้วหรือไม่
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python3 ไม่ได้ติดตั้ง"
    echo "กรุณาติดตั้ง Python 3.8+"
    exit 1
fi

# ตรวจสอบว่าไฟล์ .env มีอยู่หรือไม่
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: ไม่พบไฟล์ .env"
    echo "กรุณาสร้างไฟล์ .env ตามตัวอย่างใน README_BACKEND.md"
    echo
fi

echo "🚀 กำลังเริ่ม FastAPI backend..."
echo "📍 Host: 0.0.0.0"
echo "🔌 Port: 8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo
echo "กด Ctrl+C เพื่อหยุด"
echo "========================================"
echo

# Run backend
python3 run_backend.py
