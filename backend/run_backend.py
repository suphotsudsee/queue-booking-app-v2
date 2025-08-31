#!/usr/bin/env python3
"""
Script สำหรับ run FastAPI backend
Usage: python run_backend.py
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables จาก .env file
load_dotenv()

if __name__ == "__main__":
    # ตั้งค่า host และ port
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    print(f"🚀 Starting FastAPI backend...")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"📖 API Docs: http://{host}:{port}/docs")
    print(f"🔍 Health Check: http://{host}:{port}/health")
    print("=" * 50)
    
    # Run FastAPI app
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,  # Auto-reload เมื่อแก้ไขโค้ด
        log_level="info"
    )
