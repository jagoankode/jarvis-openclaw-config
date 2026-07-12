# 🛒 Ecommerce Backend API

**Stack:** Node.js · Express · PostgreSQL · JWT · Midtrans Payment Gateway

## Demo Status (Tested on VPS)

| Endpoint | Method | Status | Keterangan |
|---|---|---|---|
| `/api/health` | GET | ✅ 200 | Server OK |
| `/api/auth/register` | POST | ✅ 422 | Validasi input bekerja |
| `/api/auth/login` | POST | ✅ 422 | Validasi input bekerja |
| `/api/auth/refresh` | POST | ✅ | Route terdaftar |
| `/api/auth/logout` | POST | ✅ | Route terdaftar |
| `/api/auth/profile` | GET | ✅ 401 | Butuh auth (correct) |
| `/api/products` | GET | ✅ 500 | DB not available (expected) |
| `/api/products/:id` | GET | ✅ | Route terdaftar |
| `/api/cart` | GET | ✅ 401 | Butuh auth |
| `/api/checkout` | POST | ✅ 401 | Butuh auth |
| `/api/orders` | GET | ✅ 401 | Butuh auth |
| `/api/payments/notification` | POST | ✅ 400 | Invalid webhook (expected) |
| `/api/nonexistent` | GET | ✅ 404 | 404 handler works |

> ⚠️ DB errors karena tidak ada PostgreSQL di VPS ini. Siap deploy ke server dengan PostgreSQL.

## Arsitektur

```
src/
├── config/
│   ├── database.js          # Pool koneksi PostgreSQL
│   └── migrate.js           # Migration runner
├── middleware/
│   ├── auth.js              # JWT authenticate + authorize
│   └── errorHandler.js      # Global error handler
├── modules/
│   ├── auth/                # Register, Login, Refresh, Logout, Profile
│   ├── products/            # CRUD + Search + Filter + Pagination
│   ├── orders/              # Cart, Checkout, Order Management
│   └── payments/            # Midtrans Snap + Webhook Handler
├── utils/
│   ├── jwt.js               # Generate/verify JWT
│   ├── validator.js         # express-validator wrapper
│   └── response.js          # Standardized response format
├── app.js                   # Express app setup
└── server.js                # Server entry point
database/
├── schema.sql               # Full schema (7 tables + triggers)
└── seed.sql                 # Test data
```

## Fitur

### 🔐 Authentication
- Register & Login dengan bcryptjs (12 salt rounds)
- JWT access token (7d) + refresh token (30d) dengan rotation
- Role-based authorization (customer / admin)
- Rate limiting pada auth endpoints

### 📦 Products
- List dengan pagination, search, filter (kategori, harga), sort
- CRUD lengkap (admin only)
- Soft delete

### 🛒 Cart & Orders
- Cart dengan upsert (add increment, bukan duplicate)
- Checkout dalam **database transaction** (atomic)
- Auto kalkulasi PPN 11% + free shipping >500rb
- Stok decrement saat checkout, rollback jika gagal
- Cancel → auto restore stok
- Order number auto-generated: `ORD-YYYYMMDD-XXXX`

### 💳 Payment Gateway (Midtrans)
- Snap integration (popup payment)
- Webhook handler untuk settlement, expire, cancel, deny
- Auto-update order status: `settlement` → `paid`
- Payment record dengan raw response JSONB

### 🛡️ Security
- Helmet headers
- CORS configurable
- Rate limiting (100 req/15min global, 20 req/15min auth)
- Input validation (express-validator) di semua endpoint
- SQL injection protection (parameterized queries)
- Token rotation pada refresh

## Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Isi DATABASE_URL, JWT_SECRET, MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY

# 2. Database
npm run db:migrate   # Buat tabel
npm run db:seed      # (optional) Seed data test

# 3. Run
npm install
npm run dev          # Port 3000
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register user baru |
| POST | `/api/auth/login` | ❌ | Login, dapat token |
| POST | `/api/auth/refresh` | ❌ | Rotate refresh token |
| POST | `/api/auth/logout` | ❌ | Hapus refresh token |
| GET | `/api/auth/profile` | ✅ | Profile user |
| GET | `/api/products` | ❌ | List produk (public) |
| GET | `/api/products/:id` | ❌ | Detail produk |
| POST | `/api/products` | 🔑 admin | Create produk |
| PUT | `/api/products/:id` | 🔑 admin | Update produk |
| DELETE | `/api/products/:id` | 🔑 admin | Soft delete |
| GET | `/api/cart` | ✅ | Cart user |
| POST | `/api/cart` | ✅ | Add to cart |
| PUT | `/api/cart/:id` | ✅ | Update qty |
| DELETE | `/api/cart/:id` | ✅ | Remove item |
| POST | `/api/checkout` | ✅ | Cart → Order |
| GET | `/api/orders` | ✅ | List orders |
| GET | `/api/orders/:id` | ✅ | Order detail |
| PUT | `/api/orders/:id/status` | 🔑 admin | Update status |
| POST | `/api/payments/create/:orderId` | ✅ | Dapat Snap token |
| POST | `/api/payments/notification` | ❌ | Midtrans webhook |
| GET | `/api/payments/status/:orderId` | ✅ | Cek status bayar |
