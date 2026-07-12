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
- JSDoc mandatory on public funcs: `@param {Type} name - desc`
- No `useState`/`useEffect` in `.component.tsx`
- Event Handler: `onClick={handle}` not `onClick={() => handle()}`
- Private funcs: `_` prefix
- Constants: `UPPER_SNAKE_CASE`
- Boolean vars: `is`, `has`, `can`, `should` prefix
- Arrays: plural form
- Test naming: `should + expected behavior`

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

### Step 3: Manual Deep Checks (if needed)
If `--deep` flag requested, also run via WSL:
- **TypeScript typecheck**: `npx tsc --noEmit` (filter for changed files)
- **Logic scan**: manually inspect diff for bugs, edge cases

Use `wsl-exec` for any additional commands.

### Step 4: Convention Check
Scan all changed files in diff for violations:
- New exports missing JSDoc? Cross-check with existing code — if it's an existing export with changed signature, flag as "⚠️ verify" not "❌ missing"
- `useState`/`useEffect` in `.component.tsx`? ❌
- Inline arrow handlers `onClick={() => handle()}` instead of `onClick={handle}`? ❌
- Private func missing `_` prefix? ❌
- Constants not `UPPER_SNAKE_CASE`? ❌
- Boolean vars missing `is/has/can/should` prefix? ❌
- Arrays not plural? ❌
- Test not following `should + expected behavior`? ❌

### Step 5: Save Report
Save report to `~/project/review-pr/<branch-name>.md` before delivering to chat.

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

### ✅ Branch & Git Hygiene
### ✅ Code Convention
### ✅ ESLint
### ✅ TypeScript
### ✅ Tests
### ✅ Diff Assessment

Verdict: ✅ / ⚠️ / ❌
```
