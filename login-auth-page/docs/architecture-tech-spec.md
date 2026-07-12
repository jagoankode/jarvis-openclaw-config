# 🔐 Login & Authentication — Arsitektur & Tech Spec

**Status:** Draft v1.0  
**Task:** Halaman login dengan autentikasi  
**Author:** CTO  
**Date:** 2026-07-12

---

## 1. Scope

Fitur login page sederhana dengan:

| Fitur | Deskripsi |
|---|---|
| 📝 Register | User baru daftar dengan email + password + nama |
| 🔑 Login | Autentikasi, dapat access token + refresh token |
| 🔄 Token Refresh | Rotasi refresh token tanpa re-login |
| 🚪 Logout | Hapus refresh token dari server |
| 👤 Profile | GET data user yang sedang login |
| 🎨 UI | Halaman login/register yang clean & responsive |

---

## 2. Arsitektur

```
┌──────────────────────────┐        ┌──────────────────────────┐
│      🎨 Frontend          │        │      🔧 Backend           │
│   Login + Register Page   │  HTTP  │   Express + JWT + bcrypt  │
│                           │ ────→  │                           │
│  ┌───────────────────┐    │  POST  │  ┌───────────────────┐    │
│  │  LoginForm        │────┼────────→│  │  POST /auth/login │    │
│  │  email + password │    │  JSON  │  │  verify hash       │    │
│  └───────────────────┘    │        │  │  sign JWT          │    │
│                           │ ←────  │  │  return tokens     │    │
│  ┌───────────────────┐    │ tokens │  └───────────────────┘    │
│  │  RegisterForm     │────┼────────→│  ┌───────────────────┐    │
│  │  name+email+pass  │    │        │  │  POST /auth/       │    │
│  └───────────────────┘    │        │  │       register     │    │
│                           │        │  │  hash password     │    │
│                           │        │  │  insert user       │    │
│                           │        │  │  return tokens     │    │
│                           │        │  └───────────────────┘    │
│                           │        │                           │
│  localStorage             │        │  ┌───────────────┐        │
│  ├── token (JWT)          │  Auth  │  │  PostgreSQL   │        │
│  └── user (profile)       │ Header │  │  users table  │        │
│                           │        │  │  refresh_     │        │
│                           │        │  │    tokens     │        │
│                           │        │  └───────────────┘        │
└──────────────────────────┘        └──────────────────────────┘
```

### Flow Sederhana

```
Register → bcrypt hash → simpan user → generate JWT → return token
Login    → bcrypt compare → valid? → generate JWT → return token
Request  → Authorization: Bearer <token> → verify → allow/deny
Refresh  → old refresh token → verify → rotate → new pair
Logout   → delete refresh token dari DB
```

---

## 3. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Express.js | Ringan, middleware-friendly |
| Auth | `jsonwebtoken` + `bcryptjs` | Standard, battle-tested |
| Validation | `express-validator` | Sanitasi input, declarative |
| Database | PostgreSQL + `pg` (node-postgres) | Reliable, parametrized queries |
| Frontend | Vanilla HTML/CSS/JS SPA | Zero build step, langsung deploy |
| Rate Limit | `express-rate-limit` | Anti brute-force |

### Kenapa bukan…

| Alternatif | Kenapa ditolak |
|---|---|
| Passport.js | Overkill untuk JWT-only auth |
| OAuth/Social login | Scope diluar — simple email/password dulu |
| Session-based auth | Stateless lebih scalable, JWT + refresh token sudah cukup |
| React/Next.js | Vanilla SPA lebih cepat deliver; ga perlu build tool |

---

## 4. Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

**Hanya 2 tabel.** `users` untuk akun, `refresh_tokens` untuk token rotation.

---

## 5. API Design

### 5.1 Endpoints

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | `{email, password, fullName}` | `{user, accessToken, refreshToken}` |
| `POST` | `/api/auth/login` | ❌ | `{email, password}` | `{user, accessToken, refreshToken}` |
| `POST` | `/api/auth/refresh` | ❌ | `{refreshToken}` | `{accessToken, refreshToken}` |
| `POST` | `/api/auth/logout` | ❌ | `{refreshToken}` | `{message}` |
| `GET` | `/api/auth/profile` | ✅ Bearer | — | `{id, email, fullName, role}` |

### 5.2 Token Spec

```
Access Token:
  - Algorithm: HS256
  - Payload:  { userId, email, role, iat, exp }
  - Expiry:   7 hari (configurable via JWT_EXPIRES_IN)
  - Storage:  Client: localStorage | Server: tidak disimpan (stateless)

Refresh Token:
  - Algorithm: HS256
  - Payload:  { userId, email, role, iat, exp }
  - Expiry:   30 hari (configurable via JWT_REFRESH_EXPIRES_IN)
  - Storage:  Client: localStorage | Server: tabel refresh_tokens
  - Rotation: Token lama dihapus, token baru di-generate setiap refresh
```

### 5.3 Response Standard

```json
// Success
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": "uuid", "email": "...", "full_name": "...", "role": "user" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}

// Error
{
  "success": false,
  "message": "Invalid email or password."
}

// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required." },
    { "field": "password", "message": "Password must be at least 8 characters." }
  ]
}
```

---

## 6. Frontend Design

### 6.1 Component Structure

```
Login Page (index.html — single SPA)
├── AuthContainer
│   ├── [state: login] → LoginForm
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Login Button
│   │   └── "Belum punya akun? Daftar" link
│   │
│   ├── [state: register] → RegisterForm
│   │   ├── Full Name Input
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Register Button
│   │   └── "Sudah punya akun? Login" link
│   │
│   └── [state: loading] → Spinner
│
├── Toast (notifikasi: sukses/gagal)
└── Redirect → halaman utama setelah login
```

### 6.2 UI States

| State | UI |
|---|---|
| **Idle** | Form bersih, tombol enabled |
| **Loading** | Tombol disabled + spinner, input readonly |
| **Success** | Toast hijau, redirect ke `/dashboard` |
| **Error** | Toast merah dengan pesan error, form tetap aktif |
| **Validation** | Field error border merah + teks error di bawah input |
| **Logged In** | Redirect, jangan tampilkan login page lagi |

### 6.3 Design Spec

```
Layout:   Centered card, max-width 400px
Color:    Primary #2563eb, Error #ef4444, Success #10b981
Font:     System font stack
Responsive: Card full-width di mobile (< 480px)
Dark mode: Optional, via prefers-color-scheme
```

---

## 7. Security Measures

| Measure | Implementation |
|---|---|
| **Password hashing** | bcryptjs, 12 salt rounds |
| **Brute-force protection** | Rate limit: 20 req/15min pada `/auth/login` & `/auth/register` |
| **Input validation** | express-validator: email format, password min 8 char |
| **SQL injection** | Parameterized queries (`$1`, `$2`), never string concat |
| **XSS** | Helmet headers, CSP |
| **Token rotation** | Refresh token dihapus & diganti setiap refresh → mencegah replay |
| **HTTPS** | Production: wajib HTTPS (nginx reverse proxy) |
| **CORS** | Whitelist origin, jangan `*` di production |
| **Password in response** | JANGAN pernah return `password_hash` dari query |

---

## 8. File Structure

```
login-auth-page/
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.js          # Entry point
│   │   ├── app.js             # Express setup + middleware
│   │   ├── config/
│   │   │   └── database.js    # PostgreSQL pool
│   │   ├── middleware/
│   │   │   ├── auth.js        # authenticate middleware
│   │   │   └── errorHandler.js
│   │   ├── modules/
│   │   │   └── auth/
│   │   │       ├── auth.service.js    # Business logic
│   │   │       ├── auth.controller.js # Request handler
│   │   │       └── auth.routes.js     # Routes + validation
│   │   └── utils/
│   │       ├── jwt.js          # generateAccessToken, generateRefreshToken, verifyToken
│   │       ├── response.js     # success(), error() helpers
│   │       └── validator.js    # Validation middleware
│   └── database/
│       └── schema.sql
│
├── client/
│   └── index.html              # Single-page login + register UI
│
└── README.md
```

**Estimasi: ~500 baris code.**

---

## 9. Sequence Diagrams

### Login Flow

```
Client                    Server                   Database
  │                         │                         │
  │  POST /auth/login       │                         │
  │  {email, password}      │                         │
  │────────────────────────→│                         │
  │                         │  SELECT * FROM users    │
  │                         │  WHERE email = $1       │
  │                         │────────────────────────→│
  │                         │          user row       │
  │                         │←────────────────────────│
  │                         │                         │
  │                         │  bcrypt.compare()       │
  │                         │  jwt.sign(access)       │
  │                         │  jwt.sign(refresh)      │
  │                         │                         │
  │                         │  INSERT refresh_tokens  │
  │                         │────────────────────────→│
  │                         │          ok             │
  │                         │←────────────────────────│
  │                         │                         │
  │  200 {user, tokens}     │                         │
  │←────────────────────────│                         │
  │                         │                         │
  │  Simpan token di        │                         │
  │  localStorage           │                         │
  │  Redirect ke /dashboard │                         │
```

### Token Refresh Flow

```
Client                    Server                   Database
  │                         │                         │
  │  POST /auth/refresh     │                         │
  │  {refreshToken}         │                         │
  │────────────────────────→│                         │
  │                         │  jwt.verify(refresh)    │
  │                         │  SELECT rt + user join  │
  │                         │────────────────────────→│
  │                         │          row            │
  │                         │←────────────────────────│
  │                         │                         │
  │                         │  DELETE old token       │
  │                         │────────────────────────→│
  │                         │                         │
  │                         │  jwt.sign(new access)   │
  │                         │  jwt.sign(new refresh)  │
  │                         │  INSERT new token       │
  │                         │────────────────────────→│
  │                         │                         │
  │  200 {access, refresh}  │                         │
  │←────────────────────────│                         │
  │                         │                         │
  │  Update localStorage    │                         │
```

---

## 10. Implementation Checklist

- [ ] `package.json` + dependencies
- [ ] `.env` config (JWT_SECRET, DATABASE_URL, PORT)
- [ ] Database schema + migration
- [ ] `src/config/database.js` — Pool
- [ ] `src/utils/jwt.js` — generate + verify
- [ ] `src/utils/response.js` — format helpers
- [ ] `src/utils/validator.js` — express-validator wrapper
- [ ] `src/middleware/auth.js` — Bearer token verify
- [ ] `src/middleware/errorHandler.js` — global catch
- [ ] `src/modules/auth/auth.service.js` — register, login, refresh, logout, profile
- [ ] `src/modules/auth/auth.controller.js` — request handlers
- [ ] `src/modules/auth/auth.routes.js` — routes + validation rules
- [ ] `src/app.js` — Express setup, helmet, cors, rate-limit
- [ ] `src/server.js` — listen + graceful shutdown
- [ ] `client/index.html` — Login + Register SPA
- [ ] Test: register → login → refresh → profile → logout

---

## 11. Risk & Edge Cases

| Case | Handling |
|---|---|
| Email sudah terdaftar | Return 409 Conflict |
| Password salah | Return 401 — jangan bedakan "email not found" vs "wrong password" (anti-enumeration) |
| Token expired | Return 401 → client auto-refresh |
| Refresh token invalid/expired | Return 401 → redirect ke login |
| Brute force | Rate limit 20 req/15min |
| Concurrent refresh | Token rotation mencegah replay (token lama dihapus) |
| User dinonaktifkan (is_active=false) | Return 403 Forbidden |
