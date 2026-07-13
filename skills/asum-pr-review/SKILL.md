---
name: "asum-pr-review"
description: "Streamlined ASUM PR review: bundle fetch, diff, convention, ESLint, TS, test, laporan."
---

# asum-pr-review — ASUM PR Review Workflow

## Description
Streamlined PR review workflow for ASUM `epics-portal`. Bundles remote fetch, diff analysis, convention check, ESLint, TypeScript typecheck, test coverage, and summary report.

## Tools (WAJIB pakai ini, jangan exec manual)
- **`review-pr` tool** — handles fetch → switch → lint → test → cleanup via WSL tunnel
- Defined in `tools.profiles.json` profile `coding`
- Falls back to SSH tunnel `wsl-exec` (nep@localhost:43210)

## Repository
- Main repo: `~/project/epics-portal`
- Remote: `ssh://git@code.ifg-life.id:7999/iaso/epics-portal.git`
- **JANGAN akses repo langsung dari VPS** — semua operasi via WSL tunnel

## Convention Rules (from TOOLS.md & MEMORY.md)
- Module Architecture: component/container/hook split
- Types/Interfaces wajib di `.type.ts` atau `.types.ts` — **tidak boleh** di `.component.tsx`, `.container.tsx`, atau file lain ❌
- JSDoc mandatory on public funcs: `@param {Type} name - desc`
- No `useState`/`useEffect` in `.component.tsx`
- Event Handler: `onClick={handle}` not `onClick={() => handle()}`
- Private funcs: `_` prefix
- Constants: `UPPER_SNAKE_CASE`
- Boolean vars: `is`, `has`, `can`, `should` prefix
- Arrays: plural form
- Test naming: `should + expected behavior`

## 🎯 Priority Check Order
### 🥇 Primary Gates (FAIL = ❌ otomatis, no-go)
1. **ESLint** — wajib 0 error
2. **TypeScript** — wajib `tsc --noEmit` lulus
3. **Jest** — wajib semua test pass, coverage ≥ 70%

### 🥈 Secondary Gates
4. **Code Convention** — dilanjutin cek kalo primary gates lolos

## Workflow

### Step 1: Identify Source & Target
- `SOURCE`: PR/branch being reviewed (e.g. `feat/IIAU-xxx-nama`)
- `TARGET`: Destination feature branch (check merge-base from diff or convention)

### Step 2: Run Review via Tool
Use `review-pr <branch-name>` tool. It handles:
- Fetch remote branches
- Switch branch
- ESLint
- Jest tests
- Cleanup (switch back to development, delete local branch)

**Output the tool result.** If the tool returns output, read it.

### 🚦 Alur Review (Gate System)

```
START → Cek ESLint → ❌ STOP & LAPOR
      ✅ → Cek TypeScript → ❌ STOP & LAPOR
                        ✅ → Cek Jest → ❌ STOP & LAPOR
                                     ✅ → Cek Convention → ✅ SELESAI
```

---

### Step 3: Cek ESLint
Cek hasil dari `review-pr` tool.
- ✅ **0 errors** → lanjut ke Step 4
- ❌ **Ada error** → catat per-file, **LANGSUNG STOP**. Laporkan verdict ❌. Jangan lanjut ke step berikutnya.

---

### Step 4: Cek TypeScript
Jalanin `npx tsc --noEmit` via WSL.
- ✅ **Lulus** → lanjut ke Step 5
- ❌ **Ada type errors** → catat, **LANGSUNG STOP**. Laporkan verdict ❌. Jangan lanjut.

---

### Step 5: Cek Jest / Unit Test
Cek hasil dari `review-pr` tool.
- ✅ **All test pass + coverage ≥ 70%** → lanjut ke Step 6
- ❌ **Ada fail ATAU coverage < 70%** → catat, **LANGSUNG STOP**. Laporkan verdict ❌. Jangan lanjut.

---

### Step 6: Cek Code Convention (Final Gate)
Hanya dijalankan kalo ESLint ✅ → TS ✅ → Jest ✅.

Scan all changed files in diff for violations:
- **Types/Interfaces di luar `.type.ts` / `.types.ts`?** ❌ — ini paling sering dilanggar!
- New exports missing JSDoc? Cross-check with existing code — if it's an existing export with changed signature, flag as "⚠️ verify" not "❌ missing"
- `useState`/`useEffect` in `.component.tsx`? ❌
- Inline arrow handlers `onClick={() => handle()}` instead of `onClick={handle}`? ❌
- Private func missing `_` prefix? ❌
- Constants not `UPPER_SNAKE_CASE`? ❌
- Boolean vars missing `is/has/can/should` prefix? ❌
- Arrays not plural? ❌
- Test not following `should + expected behavior`? ❌

### Step 7: Save Report
Save report to `~/project/report-review/<branch-name>.md` sebelum deliver ke chat.

### Step 8: Deliver Summary ke Chat
Kirim hasil review lengkap:

**Jika STOP di tengah (❌):**
```
## 📋 PR Review: <branch> → <target>

❌ **STOP di [ESLint/TypeScript/Jest]** — tidak lanjut ke tahap berikutnya.

## Errors:
... (detail error)

Verdict: ❌
```

**Jika lolos semua (✅):**
```
## 📋 PR Review: <branch> → <target>

### 1️⃣ ESLint       ✅
### 2️⃣ TypeScript   ✅
### 3️⃣ Jest         ✅
### 4️⃣ Convention   ✅
### 5️⃣ Diff Assessment

Verdict: ✅
```

### Step 9: Cleanup
Review-pr tool already handles cleanup. Just confirm: `git switch development`, branch deleted.

## 🔒 Guard Rules (Mencegah Double Delivery)
1. **WAJIB pakai `review-pr` tool** — jangan exec SSH/wsl-exec langsung untuk review flow utama
2. **Single delivery** — simpan report dulu ke file, baru deliver ke chat. **Sekali kirim.**
3. **Skip jika duplikat** — kalo udah pernah deliver hasil untuk branch yang sama di sesi ini, jangan deliver lagi
4. **Jangan reply ke error messages** dari OpenClaw runtime (exec timeout, etc) — abaikan saja
5. **NO parallel sub-agents** untuk review — semua step jalan serial di thread utama

## Report Format
```
## 📋 PR Review: <branch> → <target>

### 1️⃣ ESLint
- Status: ✅ / ❌
- Errors: ... per-file

### 2️⃣ TypeScript
- Status: ✅ / ❌
- Errors: ...

### 3️⃣ Tests
- Status: ✅ / ❌
- Coverage: ...
- Pass/Fail: ...

### 4️⃣ Code Convention
- Types placement: ✅ / ❌
- Hooks: ✅ / ❌
- Event handlers: ✅ / ❌
- Naming: ✅ / ❌

### 5️⃣ Branch & Git Hygiene
### 6️⃣ Diff Assessment

---
**Verdict:** ✅ / ⚠️ / ❌
```

> ⚠️ **Prioritas:** ESLint > TypeScript > Jest > Convention. Gagal di 1-3 → ❌ langsung.
