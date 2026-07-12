# 🔐 Auth API Reference

**Base URL:** `http://localhost:3000/api/auth`

---

## POST /register

Register user baru.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "min8character",
  "fullName": "John Doe",
  "phone": "08123456789"  // optional
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "08123456789",
      "role": "user",
      "created_at": "2026-07-12T07:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (409):**
```json
{ "success": false, "message": "Email already registered." }
```

**Error (422):**
```json
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

## POST /login

Login dengan email & password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "min8character"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "full_name": "John Doe", "role": "user" },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Error (401):**
```json
{ "success": false, "message": "Invalid email or password." }
```

**Error (403):**
```json
{ "success": false, "message": "Account is deactivated." }
```

---

## POST /refresh

Rotate refresh token.

**Request:**
```json
{ "refreshToken": "eyJhbGciOi..." }
```

**Success (200):**
```json
{
  "success": true,
  "message": "Token refreshed.",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Error (401):**
```json
{ "success": false, "message": "Invalid refresh token." }
```

---

## POST /logout

Hapus refresh token.

**Request:**
```json
{ "refreshToken": "eyJhbGciOi..." }
```

**Success (200):**
```json
{ "success": true, "message": "Logged out successfully.", "data": null }
```

---

## GET /profile

Ambil data user saat ini.

**Headers:** `Authorization: Bearer <accessToken>`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "08123456789",
    "role": "user",
    "created_at": "2026-07-12T07:00:00Z"
  }
}
```

**Error (401):**
```json
{ "success": false, "message": "Access denied. No token provided." }
```
