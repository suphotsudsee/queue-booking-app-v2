# Queue Booking App (FastAPI + Next.js + MariaDB)

ระบบจองคิวร้านแบบพร้อมใช้งาน (MVP) สำหรับติดตั้งให้ลูกค้าได้ทันที — **เวอร์ชันปรับปรุง**

## ✅ สิ่งที่ปรับปรุงจากโค้ดเดิม
- แก้ชื่อแพ็กเกจให้ถูกต้อง (`__init__.py`) เพื่อให้ FastAPI import ได้
- บังคับใช้ **JWT + สิทธิ์ Admin** กับ endpoint จัดการคิว/ตั้งค่า
- เพิ่ม **LINE Notify**: แจ้งเตือนคิวใหม่, ยืนยัน, ยกเลิก (ตั้งค่า `LINE_NOTIFY_TOKEN`)
- ป้องกันการจองซ้ำด้วย **UniqueConstraint(date,start_time,end_time)**
- MySQL ใช้ **UTF8MB4** รองรับภาษาไทยเต็มรูปแบบ
- ล้างข้อมูลตั้งค่า/วันหยุดด้วย SQLAlchemy `delete()` ปลอดภัยกว่า raw SQL
- เก็บ JWT ใน `localStorage` ฝั่งแอดมินเพื่อความสะดวก
- เอกสารและตัวอย่าง `.env` พร้อมใช้งาน

## โครงสร้าง
```
queue-booking-app-v2/
├─ backend/        # FastAPI + SQLModel
├─ frontend/       # Next.js 14 (App Router)
└─ docker-compose.yml
```

## เริ่มต้นอย่างไว (ครั้งแรก)
```bash
cd queue-booking-app-v2
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API (Swagger): http://localhost:8000/docs
- Adminer (DB): http://localhost:8080  (Server: `db`, User: `queue_user`, Pass: `queue_pass`, DB: `queue_db`)

> บัญชี Admin (seed): `admin@example.com` / `admin123` (ควรเปลี่ยนก่อนใช้งานจริง)

## ตั้งค่า ENV
- แก้ `backend/.env` อย่างน้อย:
  - `APP_SECRET` ให้เป็นสตริงลับ
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - (ไม่บังคับ) `LINE_NOTIFY_TOKEN` ถ้าต้องการแจ้งเตือนไปบัญชีไลน์ส่วนตัว/กลุ่ม
- แก้ `frontend/.env` ให้ชี้ `NEXT_PUBLIC_API_URL` ตามโดเมนจริงเมื่อ deploy

## วิธีใช้งาน
- หน้าเว็บลูกค้า: เลือกวันที่ → เลือกช่วงเวลา → กรอกชื่อ/โทรศัพท์ → ยืนยัน
- หน้าแอดมิน: `/admin` → Login → ใส่ช่วงวันที่ → โหลดรายการ → ยืนยัน/ยกเลิก

## API สำคัญ
- `GET /appointments/slots?d=YYYY-MM-DD`  ดูช่องว่าง
- `POST /appointments`  สร้างคิว (public)
- `GET /appointments` (admin)  อ่านรายการ
- `POST /appointments/{id}/confirm` (admin)
- `POST /appointments/{id}/cancel` (admin)
- `GET/POST /settings/business-hours` (admin)
- `GET/POST /settings/holidays` (admin)

## Deploy แนวทาง
- แนะนำใช้ Nginx Proxy Manager / Caddy ทำ HTTPS และพร็อกซีให้ Frontend/Backend
- ตั้งค่า CORS ให้ชี้โดเมนจริงใน `backend/.env`
- เปลี่ยนรหัสผ่าน DB และ `APP_SECRET` ทุกครั้งก่อนโปรดักชัน

## ต่อเติมถัดไป
- รองรับหลายบริการ/พนักงาน (Resource-based slots)
- มัดจำ/ชำระเงินล่วงหน้า (PromptPay QR)
- รายงานรายวัน/เดือน
- ตั้งค่าเวลาเปิด-ปิด/วันหยุดจากหน้า Admin (UI)

> ถ้าต้องการผมช่วยต่อยอดฟีเจอร์เหล่านี้ บอกมาได้เลยครับ 🚀
"# queue-booking-app-v2" 
