# 🛒 TokoKita — Sistem Ecommerce Lengkap

**Stack:** Node.js + Express + PostgreSQL + Midtrans + Vanilla HTML/CSS/JS

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│                  👤 Customer                      │
│         frontend-store/index.html                │
│   Browse → Cart → Checkout → Orders              │
└──────────────────┬──────────────────────────────┘
                   │ REST API (fetch)
┌──────────────────▼──────────────────────────────┐
│              🔧 Backend API                      │
│          ecommerce-api/ (Node.js)                │
│   /api/auth  /api/products  /api/orders          │
│   /api/cart  /api/checkout  /api/payments        │
└──────┬───────────────────────┬──────────────────┘
       │                       │
┌──────▼──────┐    ┌───────────▼──────────┐
│  PostgreSQL │    │  Midtrans Payment    │
│  (7 tables) │    │  (Snap + Webhook)    │
└─────────────┘    └──────────────────────┘

┌─────────────────────────────────────────────────┐
│                 🔑 Admin Dashboard               │
│         admin-dashboard/index.html               │
│   Products CRUD  •  Order Management  •  Stats   │
└──────────────────┬──────────────────────────────┘
                   │ REST API (admin auth)
                   ▼
              🔧 Backend API
```

## 📂 Project Structure

```
ecommerce-system/
├── ecommerce-api/              # Backend (dari task sebelumnya)
│   ├── src/
│   │   ├── config/             # Database, migration
│   │   ├── middleware/         # Auth, error handler
│   │   ├── modules/            # auth, products, orders, payments
│   │   └── utils/              # JWT, response, validator
│   ├── database/               # schema.sql, seed.sql
│   └── package.json
├── frontend-store/             # Customer Store (Andi)
│   └── index.html              # Single-page app
└── admin-dashboard/            # Admin Dashboard (Andi)
    └── index.html              # Single-page app
```

## 🚀 Quick Start

### 1. Backend API

```bash
cd ecommerce-api
cp .env.example .env
# Isi DATABASE_URL, JWT_SECRET, MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY
npm install
npm run db:migrate
npm run dev    # → http://localhost:3000
```

### 2. Frontend Store

Buka `frontend-store/index.html` di browser, atau serve dengan:

```bash
npx serve frontend-store -p 8080
# → http://localhost:8080
```

Pastikan `API_BASE` di HTML mengarah ke backend: `const API_BASE = 'http://localhost:3000/api';`

### 3. Admin Dashboard

```bash
npx serve admin-dashboard -p 8081
# → http://localhost:8081
```

Login dengan akun admin (role: `admin` di database).

## 📊 Status Pengerjaan

| Komponen | Status | Engineer |
|---|---|---|
| Backend API (22 endpoint) | ✅ Selesai | Yoga (CTO) |
| Database Schema (7 tabel) | ✅ Selesai | Yoga (CTO) |
| Frontend Customer Store | ✅ Selesai | Andi |
| Admin Dashboard | ✅ Selesai | Andi |
| Integrasi & Dokumentasi | ✅ Selesai | CTO |

## 🧪 Test Report

| Test Case | Hasil |
|---|---|
| Health check (200) | ✅ Pass |
| Route 404 handler | ✅ Pass |
| Auth validasi (422) | ✅ Pass |
| Auth required (401) | ✅ Pass |
| Public products | ✅ Pass |
| Cart auth gate | ✅ Pass |
| Payment webhook | ✅ Pass |

## 🔜 Yang Belum (Future Enhancement)

- [ ] Upload gambar produk
- [ ] Payment method selection (bank transfer, e-wallet)
- [ ] Email notification (order confirmation, payment reminder)
- [ ] Search dengan full-text PostgreSQL
- [ ] Review & rating produk
- [ ] Voucher / diskon
- [ ] Multi-role: reseller, dropshipper
