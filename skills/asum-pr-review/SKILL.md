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

### Step 3: Primary Gates — ESLint, TypeScript, Jest
**Harus dicek dan dilapor duluan sebelum ngapa-ngapain.**

#### 3a. ESLint
`review-pr` tool handles this. Check output:
- ✅ 0 errors → lanjut
- ❌ Ada error → catat per-file, **Verdict ❌ langsung**

#### 3b. TypeScript
Jalanin `npx tsc --noEmit` via WSL:
- ✅ Lulus → lanjut
- ❌ Type errors → catat, **Verdict ❌ langsung**

#### 3c. Jest
`review-pr` tool handles this. Check:
- ✅ All tests pass, coverage ≥ 70% → lanjut
- ❌ Ada fail atau coverage < 70% → catat, **Verdict ❌ langsung**

> Jika 3a/3b/3c gagal → skip Step 4, langsung lapor ❌

### Step 4: Code Convention Check (Secondary Gate)
Hanya dilakukan jika Primary Gates (ESLint/TS/Jest) lolos.

Scan all changed files in diff for violations:
- **Types di luar `.type.ts` / `.types.ts`?** ❌ — ini paling sering dilanggar!
- New exports missing JSDoc? Cross-check with existing code — if it's an existing export with changed signature, flag as "⚠️ verify" not "❌ missing"
- `useState`/`useEffect` in `.component.tsx`? ❌
- Inline arrow handlers `onClick={() => handle()}` instead of `onClick={handle}`? ❌
- Private func missing `_` prefix? ❌
- Constants not `UPPER_SNAKE_CASE`? ❌
- Boolean vars missing `is/has/can/should` prefix? ❌
- Arrays not plural? ❌
- Test not following `should + expected behavior`? ❌

### Step 5: Save Report
Save report to `~/project/report-review/<branch-name>.md` before delivering to chat.

### Step 6: Deliver Summary
Provide a concise summary:
- Verdict: ✅ / ⚠️ / ❌
- Key findings (max 3-5 bullets)

### Step 7: Cleanup
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
