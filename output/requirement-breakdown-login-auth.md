# 📋 Requirement Breakdown: Halaman Login dengan Autentikasi

**Status:** Draft v1  
**Dibuat:** 2026-07-12  
**Author:** CEO (pm-enterprise) — Autonomous Studio  
**Tipe:** Standalone Feature  
**Estimasi:** 3-5 hari (1 engineer)

---

## 1. Scope Definition

**In scope:**
- Halaman login (email + password)
- Autentikasi backend (JWT / session-based)
- Validasi input & error handling
- Redirect setelah login sukses
- Session persistence (remember me)
- Logout

**Out of scope:**
- Registrasi / sign-up (fitur terpisah)
- Social login (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Password reset / forgot password
- Role/permission management

---

## 2. User Stories

---

### US-1: Login dengan Email & Password

> **As a** registered user  
> **I want** to log in using my email and password  
> **So that** I can access the authenticated area of the application.

**Acceptance Criteria:**
- [ ] Form dengan 2 field: email (type=email) dan password (type=password)
- [ ] Placeholder: "Enter your email" & "Enter your password"
- [ ] Label visible di atas setiap field
- [ ] Tombol submit: "Sign In" (atau "Masuk")
- [ ] Autocomplete attributes: `email="email"`, `current-password`
- [ ] Keyboard submit: Enter pada password field = klik Sign In
- [ ] Link "Forgot password?" di bawah form (redirect ke halaman forgot password — placeholder)

**Priority:** 🔴 Must Have

---

### US-2: Validasi Input

> **As a** user  
> **I want** to see clear validation errors when I submit invalid data  
> **So that** I can correct my input without guessing what went wrong.

**Acceptance Criteria:**
- [ ] Email kosong → "Email is required" (field-level error)
- [ ] Email format invalid → "Please enter a valid email address"
- [ ] Password kosong → "Password is required"
- [ ] Password < 8 karakter → "Password must be at least 8 characters"
- [ ] Error message muncul di bawah field yang bersangkutan (bukan toast/top-level)
- [ ] Border field berubah merah saat error
- [ ] Error hilang saat user mulai mengetik di field tersebut
- [ ] Validasi client-side (instant) + server-side fallback

**Priority:** 🔴 Must Have

---

### US-3: Autentikasi Backend

> **As a** system  
> **I want** to verify user credentials and issue a secure token  
> **So that** authenticated users can access protected resources.

**Acceptance Criteria:**
- [ ] Endpoint: `POST /api/auth/login`
- [ ] Request body: `{ email: string, password: string }`
- [ ] Sukses (200): `{ token: string, user: { id, email, name } }`
- [ ] Gagal (401): `{ error: "Invalid email or password" }`
- [ ] JWT token dengan expiry 24 jam (atau configurable)
- [ ] Password di-hash (bcrypt/argon2) — tidak pernah plaintext
- [ ] Rate limiting: max 5 percobaan gagal per IP per 15 menit
- [ ] Response time < 500ms (p99)
- [ ] Gagal (429): `{ error: "Too many attempts. Try again in X minutes." }`

**Priority:** 🔴 Must Have

---

### US-4: Feedback State & UI States

> **As a** user  
> **I want** to see loading, success, and error states during login  
> **So that** I know what's happening and don't think the app is broken.

**Acceptance Criteria:**
- [ ] Loading state: tombol disabled + spinner/text "Signing in…" selama request
- [ ] Form disabled selama loading (gak bisa double-submit)
- [ ] Error state (401 Invalid credentials): pesan error di atas form — "Invalid email or password. Please try again."
- [ ] Error state (429 Rate limited): "Too many login attempts. Please try again in X minutes."
- [ ] Error state (Network error): "Connection failed. Please check your internet."
- [ ] Error state (500 Server error): "Something went wrong. Please try again later."
- [ ] Fokus kembali ke email field setelah error

**Priority:** 🔴 Must Have

---

### US-5: Redirect Pasca Login

> **As a** user  
> **I want** to be redirected to the dashboard (or intended page) after login  
> **So that** I don't have to navigate manually.

**Acceptance Criteria:**
- [ ] Sukses login → redirect ke `/dashboard` (default)
- [ ] Jika user mengakses protected URL sebelum login (misal `/settings`) → redirect ke login dulu → setelah login balik ke `/settings`
- [ ] Redirect disimpan via `?redirect=/settings` query param
- [ ] Redirect dalam < 1 detik setelah sukses
- [ ] Tidak bisa akses halaman login lagi setelah authenticated (redirect ke dashboard)

**Priority:** 🔴 Must Have

---

### US-6: Remember Me & Session Persistence

> **As a** user  
> **I want** to stay logged in even after closing the browser  
> **So that** I don't have to log in every time I open the app.

**Acceptance Criteria:**
- [ ] Checkbox "Remember me" di bawah password field
- [ ] Default: unchecked (session lasts until browser close)
- [ ] Checked: token disimpan di `localStorage` atau `httpOnly cookie` dengan `maxAge` lebih lama (7-30 hari)
- [ ] Token refresh mechanism: jika token expired tapi within refresh window → auto-refresh
- [ ] Saat user buka app lagi → auto-login (redirect ke dashboard tanpa lihat login page)

**Priority:** 🟡 Should Have

---

### US-7: Logout

> **As a** user  
> **I want** to log out of my account  
> **So that** my session is terminated and no one else can access my account on this device.

**Acceptance Criteria:**
- [ ] Tombol/logout endpoint: `POST /api/auth/logout`
- [ ] Token di-blacklist atau dihapus dari client-side
- [ ] Redirect ke halaman login setelah logout
- [ ] Session di-clear (token, user data, cache)
- [ ] Tombol logout accessible dari header/dropdown user menu

**Priority:** 🔴 Must Have

---

### US-8: Halaman Login — Visual & UX

> **As a** user  
> **I want** the login page to be clean, centered, and fast to load  
> **So that** I can log in quickly without distractions.

**Acceptance Criteria:**
- [ ] Layout: centered card (max-width 400px) di tengah layar
- [ ] Company logo + nama app di atas form
- [ ] Responsive: mobile-friendly (min 320px), tidak overflow
- [ ] Lighthouse Performance score ≥ 90
- [ ] First paint < 1 detik
- [ ] Tab order logis: email → password → remember me → sign in
- [ ] Focus ring visible untuk accessibility (keyboard navigation)
- [ ] Error banner untuk screen reader: `role="alert"` + `aria-live="polite"`
- [ ] Touch target min 44x44px untuk mobile

**Priority:** 🔴 Must Have

---

## 3. API Contract

### `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://cdn.example.com/avatars/john.jpg"
  }
}
```

**Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Response (429):**
```json
{
  "error": "Too many attempts. Try again in 15 minutes.",
  "retryAfter": 900
}
```

---

### `POST /api/auth/logout`

**Request:** (Bearer token in header)

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### `GET /api/auth/me`

**Request:** (Bearer token in header)

**Response (200):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## 4. MoSCoW Summary

| Priority | Count | Stories |
|----------|-------|---------|
| 🔴 Must Have | **6** | US-1 Login form, US-2 Validation, US-3 Auth API, US-4 States, US-5 Redirect, US-7 Logout, US-8 UI/UX |
| 🟡 Should Have | **1** | US-6 Remember me |
| 🟢 Could Have | **0** | (v1 cukup) |
| ❌ Won't Have | — | Registrasi, Social login, MFA, Forgot password |

---

## 5. File Structure (Suggested)

```
src/
├── pages/
│   └── auth/
│       └── login.tsx              # Halaman login
├── components/
│   └── auth/
│       ├── login-form.tsx         # Form component
│       ├── login-form.test.tsx    # Unit test
│       └── protected-route.tsx    # Auth guard
├── hooks/
│   ├── use-auth.ts               # Auth hook (login, logout, session)
│   └── use-auth.test.ts
├── services/
│   └── auth-api.ts               # API calls (login, logout, me)
├── store/
│   └── auth-slice.ts             # Redux/Zustand auth state
└── utils/
    └── token.ts                  # Token storage & parsing
```

---

## 6. Flow Diagram (Text)

```
User buka app
     │
     ├─ Ada token valid? ──yes──▶ Redirect ke /dashboard
     │
     └─ No ──▶ Tampilkan Login Page
                    │
                    ├─ User isi email + password
                    ├─ Validasi client-side
                    │     │
                    │     └─ Invalid? ──▶ Tampilkan field error
                    │
                    └─ Valid ──▶ POST /api/auth/login
                                     │
                                     ├─ 200 ──▶ Simpan token, redirect /dashboard
                                     ├─ 401 ──▶ "Invalid email or password"
                                     ├─ 429 ──▶ "Too many attempts"
                                     └─ 500 ──▶ "Something went wrong"
```

---

## 7. Estimates

| Task | Effort |
|------|--------|
| Backend: Auth endpoint + JWT + rate limiting | 1-2 hari |
| Frontend: Login page + form + validation | 1-1.5 hari |
| Frontend: Auth state management + redirect + guard | 0.5-1 hari |
| Testing: Unit + integration | 0.5-1 hari |
| **Total** | **3-5 hari** |

---

## 8. Dependencies & Assumptions

- ✅ Sudah ada user database / tabel users
- ✅ Sudah ada password hashing mechanism (bcrypt/argon2)
- ✅ Sudah ada routing framework (Next.js router / React Router)
- ✅ Token-based auth (JWT) dipilih daripada session-based (cookie)

---

*End of Breakdown. Siap direview atau langsung delegasi ke engineering.*
