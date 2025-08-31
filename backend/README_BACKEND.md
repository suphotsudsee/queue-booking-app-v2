# 🚀 Backend Setup & Run Guide

## 📋 Prerequisites

ก่อนเริ่มต้น ต้องมี:
- Python 3.8+ 
- MySQL/MariaDB database
- pip หรือ poetry

## 🔧 การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. สร้างไฟล์ .env
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` โดยใช้ตัวอย่างนี้:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=queue_user
DB_PASSWORD=queue_pass
DB_NAME=queue_db

# App Security
APP_SECRET=your_super_secret_key_here_change_this
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# LINE Notify (Optional)
LINE_NOTIFY_TOKEN=your_line_notify_token_here
```

### 3. ตั้งค่าฐานข้อมูล
```sql
-- สร้างฐานข้อมูล
CREATE DATABASE queue_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- สร้าง user (ถ้าต้องการ)
CREATE USER 'queue_user'@'localhost' IDENTIFIED BY 'queue_pass';
GRANT ALL PRIVILEGES ON queue_db.* TO 'queue_user'@'localhost';
FLUSH PRIVILEGES;
```

## 🚀 วิธี Run Backend

### วิธีที่ 1: ใช้ Python Script (แนะนำ)
```bash
cd backend
python run_backend.py
```

### วิธีที่ 2: ใช้ uvicorn โดยตรง
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### วิธีที่ 3: ใช้ Python Module
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 การเข้าถึง

เมื่อ backend ทำงานแล้ว:

- **API Endpoints**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **ReDoc**: http://localhost:8000/redoc

## 🔍 การทดสอบ

### 1. ทดสอบ Health Check
```bash
curl http://localhost:8000/health
```

### 2. ทดสอบ API Slots
```bash
curl "http://localhost:8000/appointments/slots?d=2024-01-15"
```

### 3. ทดสอบ Swagger UI
เปิดเบราว์เซอร์ไปที่ http://localhost:8000/docs

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:

1. **Database Connection Error**
   - ตรวจสอบ DB_HOST, DB_USER, DB_PASSWORD ใน .env
   - ตรวจสอบว่า MySQL/MariaDB ทำงานอยู่

2. **Port Already in Use**
   - เปลี่ยน port ใน .env หรือ command line
   - ใช้ `--port 8001` แทน

3. **Import Error**
   - ตรวจสอบว่า run จากโฟลเดอร์ `backend/`
   - ตรวจสอบ requirements.txt

### Debug Mode
```bash
# เปิด debug logging
uvicorn app.main:app --reload --log-level debug
```

## 🔒 Security Notes

- **เปลี่ยน APP_SECRET** ทุกครั้งก่อน deploy
- **เปลี่ยน ADMIN_PASSWORD** จากค่าเริ่มต้น
- **ตั้งค่า ALLOWED_ORIGINS** ให้เหมาะสมกับ production

## 📱 LINE Notify Setup (Optional)

1. ไปที่ https://notify-bot.line.me/
2. Login และสร้าง Token
3. เพิ่ม Token ใน .env
4. ทดสอบการแจ้งเตือน

## 🚀 Production Deployment

สำหรับ production:
```bash
# ใช้ gunicorn แทน uvicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ logs ใน terminal
2. ตรวจสอบ .env file
3. ตรวจสอบ database connection
4. ดู error messages ใน Swagger UI
