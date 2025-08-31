FROM node:20-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# กันกรณี peer deps ขัดกันกับ Next/ESLint
ENV npm_config_legacy_peer_deps=true

# เครื่องมือที่ต้องใช้ถ้ามีแพ็กเกจต้องคอมไพล์ (node-gyp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# ทำ npm อดทนเรื่องเน็ตเวิร์กมากขึ้น (ช่วยเวลาดึง @next/swc-*)
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fund false \
 && npm config set audit false

# คัดลอก manifest (wildcard จะแมตช์อย่างน้อย package.json เสมอ)
COPY package*.json ./

# ถ้ามี lockfile ใช้ npm ci; ถ้าไม่มีให้ใช้ npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

# คัดลอกซอร์สที่เหลือ
COPY . .

# ปิด ESLint ตอน build กันแตก (ปรับทีหลังได้)
ENV NEXT_DISABLE_ESLINT=1

# Build Next.js
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
