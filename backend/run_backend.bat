@echo off
echo ========================================
echo    Queue Booking App - Backend
echo ========================================
echo.

REM ตรวจสอบว่า Python ติดตั้งแล้วหรือไม่
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python ไม่ได้ติดตั้ง หรือไม่ได้อยู่ใน PATH
    echo กรุณาติดตั้ง Python 3.8+ และเพิ่มใน PATH
    pause
    exit /b 1
)

REM ตรวจสอบว่าไฟล์ .env มีอยู่หรือไม่
if not exist ".env" (
    echo ⚠️  Warning: ไม่พบไฟล์ .env
    echo กรุณาสร้างไฟล์ .env ตามตัวอย่างใน README_BACKEND.md
    echo.
)

echo 🚀 กำลังเริ่ม FastAPI backend...
echo 📍 Host: 0.0.0.0
echo 🔌 Port: 8000
echo 📖 API Docs: http://localhost:8000/docs
echo 🔍 Health Check: http://localhost:8000/health
echo.
echo กด Ctrl+C เพื่อหยุด
echo ========================================
echo.

REM Run backend
python run_backend.py

pause
