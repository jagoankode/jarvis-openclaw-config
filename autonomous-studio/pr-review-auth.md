# 🔍 PR Review — feat/auth: Login + Authentication Module

**Source:** `feat/auth-login` → `development`  
**Reviewer:** Andi (Senior Developer)  
**Date:** 2026-07-12  
**Files changed:** 4 added (`src/auth/`), 1 modified (`src/api/routes.ts`)  
**Lines:** ~550 + 3 lines integration

---

## 📊 Verdict: ⚠️ Approve with Changes Required

`1 🔴 Blocker · 3 🟡 Major · 5 🟢 Minor`

---

## 🔴 Blocker — Must Fix Before Merge

### B1. JWT base64url → base64 conversion is missing in `_verify`

**File:** `service.ts:45`  
**Severity:** 🔴 Critical — silently fails on any token with `+` or `/` in payload

```typescript
const payload: TokenPayload = JSON.parse(Buffer.from(bodyB64, 'base64').toString());
```

`bodyB64` adalah **base64url** (pakai `-` dan `_`), tapi `Buffer.from(..., 'base64')` expect **standard base64** (pakai `+` dan `/`). Kalau payload mengandung karakter yang perlu di-encode ke `+` atau `/`, token akan gagal decode.

**Fix:**
```typescript
function _fromBase64url(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

// Di _verify:
const payload: TokenPayload = JSON.parse(_fromBase64url(bodyB64));
```

Ini **tidak selalu kelihatan** karena payload pendek (email + role) jarang trigger `+` atau `/`. Tapi payload dengan `sub` (user ID random hex) pasti akan trigger sooner or later.

---

## 🟡 Major — Should Fix

### M1. PBKDF2 sync = blocks event loop

**File:** `service.ts:57`  
**Severity:** 🟡 Major — performance/DoS risk

```typescript
const hash = crypto.pbkdf2Sync(password, s, 100_000, 64, 'sha512').toString('hex');
```

`pbkdf2Sync` dengan 100k iterasi memakan ~50-100ms CPU time. Dipanggil synchronous → block seluruh event loop. Under concurrent login requests, ini jadi bottleneck.

**Fix:**
```typescript
import { pbkdf2 } from 'crypto/promises'; // or promisify

async function _hashPassword(password: string, salt?: string): Promise<{hash: string; salt: string}> {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = (await pbkdf2(password, s, 100_000, 64, 'sha512')).toString('hex');
  return { hash, salt: s };
}
```

Butuh propagate async ke `login()` method. Cost: 10 menit refactor.

### M2. Token exposed in success page HTML

**File:** `routes.ts:184`  
**Severity:** 🟡 Major — security  

```javascript
document.getElementById('tokenDisplay').textContent = data.data.token;
```

Token JWT ditampilkan dalam plain text di halaman sukses login. Ini bagus buat debugging, tapi **jangan di production**. Kalau user share screenshot atau ada shoulder-surfing, token bocor.

**Fix:** Truncate atau hide behind toggle:
```javascript
tokenDisplay.textContent = token.slice(0, 20) + '...' + token.slice(-10);
```

Atau tambahin `<!-- DEBUG ONLY -->` comment + conditional based on env.

### M3. `localStorage` for token = XSS vulnerable

**File:** `service.ts:194-215` + `routes.ts` JS  
**Severity:** 🟡 Major — security best practice

Token disimpan di `localStorage`. Kalau ada XSS di domain yang sama, attacker bisa baca token. HttpOnly cookie lebih aman.

**Rekomendasi:** Untuk production, switch ke HttpOnly cookie + CSRF token. `localStorage` ok untuk dev/MVP, tapi tambahin comment warning.

---

## 🟢 Minor — Nice to Fix

### N1. `declare var localStorage` is a hack
**File:** `service.ts:5`

Ini works tapi gak clean. Kalau mau proper typing, extend tsconfig `lib` ke `["ES2022", "DOM"]` atau split client helpers ke file terpisah (`auth/client.ts`) dengan tsconfig sendiri.

### N2. `(req as any).user` — no type safety
**File:** `routes.ts:31,42,52`

Extend Express `Request` interface:
```typescript
// types.ts
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
```

Ini 5 menit fix, menghilangkan semua `as any`.

### N3. Duplicate email regex
**File:** `service.ts:116` vs `routes.ts` (JS validation)

Regex email ada di 2 tempat — backend validation + frontend validation. Kalau regex berubah di satu tempat, satunya gak ikut. Either:
- Export regex dari service & inject ke HTML template
- Atau terima bahwa frontend validation is "best effort" dan backend tetap authoritative

### N4. `AuthService` imported tapi gak dipakai di routes.ts
**File:** `routes.ts:4`

```typescript
import { authService, AuthService } from './service';
```

`AuthService` (class) gak dipakai. Cuma `authService` (instance). Hapus dari import.

### N5. Login page HTML in routes.ts — 230 lines inline
**File:** `routes.ts:140-370`

HTML template 230+ lines di dalem file TypeScript route. Separation of concerns:
- Move ke `src/auth/login-page.html`
- Read with `fs.readFileSync` + cache di production
- Atau pake template engine (EJS/Pug) kalo nanti banyak page

---

## ✅ What's Good

| Area | Notes |
|------|-------|
| **JWT implementation** | ✅ Zero dependency. Self-contained. HS256 with proper header/payload/signature structure |
| **Password hashing** | ✅ PBKDF2-SHA512, 100k iterasi, salt random — strong defaults |
| **Error messages** | ✅ Generic "Invalid email or password" — doesn't leak whether user exists |
| **RBAC middleware** | ✅ Clean `requireRole()` with hierarchy check. Good composability with `requireAuth` |
| **Token expiry** | ✅ `me` endpoint signals `shouldRefresh` when < 30 min left — proactive |
| **Session resume** | ✅ Login page auto-checks stored token on load — good UX |
| **UI polish** | ✅ Dark theme, loading state, error states, responsive — production quality |
| **Type safety** | ✅ Discriminated union `LoginResponse | LoginError` with `success: true/false` |
| **Email normalization** | ✅ `.toLowerCase()` on lookup — prevents case-sensitivity bugs |

---

## 📋 Merge Checklist

```
[ ] B1: Fix base64url → base64 conversion in _verify
[ ] M1: Switch pbkdf2Sync → pbkdf2 async (atau documented as acceptable for MVP)
[ ] M2: Truncate token display in success page
[ ] M3: Document localStorage vs HttpOnly cookie tradeoff
[ ] N2: Extend Express Request type (remove as any)
[ ] N4: Remove unused AuthService import
[ ] N1/N3/N5: Deferred to next iteration
```

---

## 🎯 Recommendation

**Approve with B1 fix mandatory.** Sisanya bisa follow-up PR. Auth module solid secara arsitektur — JWT self-contained, RBAC composable, type-safe response discrimination, UI dark theme polished. Fix B1 (5 menit) then 🟢 merge.

*— Andi, Senior Developer | Autonomous Studio*
