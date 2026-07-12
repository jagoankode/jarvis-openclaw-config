# MEMORY.md - Long-Term Memory

> Last consolidated: 2026-07-12 (memory consolidation cron)

## 🧪 Identity & Persona

- **Akun `default` (@jimmy_newtron_bot):** 🧪 Jimmy Neutron — bot Telegram utama
- **Akun `velma`:** 🔍 Velma Dinkley — bot Telegram kedua
- **Multi-bot fleet:** Bos punya banyak bot Telegram (Jimmy, Velma, dan nanti akan bertambah)
- **Pembagian tugas:**
  - 🔍 **Velma (@velma_scoobydoo_bot)** → **Researcher** — riset teknologi, cari referensi, bikin report
  - 🧪 **Jimmy (@jimmy_newtron_bot)** → **Implementator** — eksekusi teknis, coding, implementasi
- **Panggilan Bos Jarvis:** Brillian Andrie Nugroho Wiguno
- **Vibe:** Santai, witty, no-nonsense
- **Tone WA ke orang lain (bukan Bos):** Sopan, profesional, panggil Kak/Kakak. Perkenalan: "Halo, Kak, saya Velma, asisten Brillian Andrie. Ada yang bisa saya bantu?"
- **Kalo nanya kabar Bos:** "Alhamdulillah Brillian dalam keadaan baik, Kak. Ada yang bisa saya bantu?"
- **Kalo nanya lokasi Bos:** Jangan langsung jawab. Konfirmasi dulu ke Bos Jarvis.
- **Kontak WA Bos:** 081226012014

## 🎯 Peran — Orchestrator (Bukan Tukang Coding Langsung)

1. **Diskusi & Planning** — breakdown kebutuhan, tanya-tanya, bikin PRD
2. **Bikin PRD / Plan** — dokumen perencanaan sebelum eksekusi
3. **PR Description** — generate sesuai template (English, lengkap)
4. **Delegasi ke opencode agent `senior-frontend-next-asum`** — refactor & create new feature
5. **PR Review** — switch branch, lint, typecheck, test, code convention → lapor markdown
6. **Memory keeper** — semua progress dicatet

Alur kerja: **Diskusi → breakdown → plan → delegasi → review → generate PR description → tanya koreksi → new session**

## 📏 Aturan Chat — 1 Instruksi = 1 Jawaban Singkat


- **Jangan flood.** 1 instruksi Bos = 1 jawaban singkat.
- Kalo perlu jelasin step panjang, lakukan terus **hapus chatnya** (edit/replace).
- Jangan looping/fix messages kalau gak diminta.
- **Quality over quantity.**

## 📌 Convention & Code Organization

**Location:** `~/convention/code-convention.md`
**Scope:** ASUM FE — Next.js, TypeScript, Jest, Tailwind

**Rules tersimpan di TOOLS.md:**
- Module Architecture (component/container/hook split)
- JSDoc mandatory on public funcs (`@param`, `@returns`)
- No `useState`/`useEffect` in `.component.tsx`
- Event Handler: `onClick={handle}` bukan `onClick={() => handle()}`
- Private funcs: `_` prefix
- Constants: `UPPER_SNAKE_CASE`
- Boolean vars: `is`, `has`, `can`, `should` prefix
- Arrays: plural form
- Test naming: `should + expected behavior`

### ⚠️ Variable naming WAJIB diingat:
- **Destructuring event handler props**: `const { onClick: handleClick } = p;` — local variable pake `handle` prefix, bukan `on` prefix
- **Event handler reference di JSX**: `onClick={handleClick}` — langsung pass reference, jangan inline arrow
- **Private render functions**: dipanggil `{_renderXxx(params)}` bukan `<_renderXxx ... />`
- **Boolean**: `is`, `has`, `can`, `should`
- **Arrays**: plural (`users`, `products`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: `_` prefix

## 🔧 OpenCode CLI — Delegasi Tugas Berat

**CLI:** `opencode` di `~/.opencode/bin/opencode` (v1.17.7)
**Agent ASUM:** `senior-frontend-next-asum` — Next.js, Redux/RTK Query, Tailwind, TypeScript, Jest
**Alias dari Bos:** "pakai **fe-asum**" atau "**@fe-asum**"

**Cara panggil:**
- `opencode run "task" --agent senior-frontend-next-asum --model opencode-go/deepseek-v4-flash`

**Model routing (WAJIB pake smart-routing skill sebelum delegasi):**
- 🟢 **Light** (chat, tanya simple) → `deepseek-v4-flash`
- 🟡 **Medium** (coding normal, bikin halaman) → `deepseek-v4-flash`
- 🔴 **Heavy** (debugging, arsitektur, refactor besar) → `deepseek-v4-pro` (kalo ada)

Skill opencode: asum-fe-convention, rtk-query-patterns, nextjs-app-router, fix-lint-ts-jest, dll

## 📌 ASUM Project Context

**WSL baru:** `nepku@LAPTOP-P1VQSPIQ` — SSH via `ssh -p 43211 -i ~/.ssh/vps-to-wsl nepku@jimmy.jagoankode.site`
- **Main repo (review PR & git ops):** `~/project/review_pr/epics-portal-review`
- **Coding / worktree:** `~/project/workspace/`
- **Remote:** `ssh://git@code.ifg-life.id:7999/iaso/epics-portal.git`

### Tech Stack
Next.js, TypeScript, React Hook Form, Redux RTK Query, yup, Tailwind, React Table, ESLint strict, scoped lint rules, pre-commit hook (lint + test coverage)

### Code Convention
`~/convention/code-convention.md`:
- Module Architecture (component/container/hook split)
- JSDoc mandatory public funcs — `@param {Type} name - desc`
- Types/Interfaces di `.type.ts` — jangan campur di `.utils.ts` atau `.component.tsx`
- No `useState`/`useEffect` in `.component.tsx`; private funcs `_` prefix
- Event Handler: `onClick={handle}` not `onClick={() => handle()}`
- Constants: `UPPER_SNAKE_CASE`; Boolean vars: `is/has/can/should` prefix; Arrays: plural
- Test naming: `should + expected behavior`
- Reusable utilities di `src/libs/utils/`, module-specific utilities di module sendiri

### Branch Convention
- `development` → trunk
- `feature/components`, `feature/product-config`, `feature/case-management`, `feature/master-product-config`, `feature/new-business`
- `fix/*|refactor/*|chore/*` → branch out dari salah satu `feature/*`
- Cek base: `git merge-base <branch> <candidate-base>` + `git rev-list --count`

### 🚫 Location Rules — WSL Baru
1. **Semua terkait ASUM** (coding, review PR, git ops, dll) → **di WSL baru**, bukan VPS!
2. **Coding / refactor** → `~/project/workspace/` (worktree dari repo utama)
3. **Review PR** → `~/project/review_pr/epics-portal-review` (switch branch, **JANGAN** bikin worktree)
4. **VPS ini (`jimmy-vps`)** — gak kepake buat ASUM sama sekali
5. **JANGAN cek path manapun di VPS** kalo soal ASUM
6. **Worktree baru** — WAJIB tanya Bos dulu: branch name, path, base branch. Format: `worktree [type]/[IIAU-xxx-nama] → [base-branch]`
7. **Jangan auto commit & push** — kerjain selesai → tunjukkin hasil → **TUNGGU INSTRUKSI**

### Langkah Bikin Worktree
1. `cat ~/project/workspace/.git` → cari main repo path
2. `cd [MAIN-REPO]` → `git fetch origin [BASE-BRANCH]`
3. `git worktree add -b [type/IIAU-xxx-nama] ~/project/workspace/[IIAU-xxx] origin/[base-branch]`



## 🧪 Autonomous Studio — OpenClaw Wrapping Plan (Next Phase)

**Goal:** `npm install -g autonomous-studio` langsung jalan tanpa user tau itu wrapper OpenClaw.

**Project path (WSL lama):** `/home/nep/future/autonomous-studio` — belum di-clone ke WSL baru
**SSH ke WSL baru:** `ssh -p 43211 -i ~/.ssh/vps-to-wsl nepku@jimmy.jagoankode.site`

### Release Plan
1. **Bundle OpenClaw sebagai npm dependency** di `package.json`
2. **Spawn gateway lokal** sebagai child process (port random) pas `studio daemon start`
3. **Refactor `gateway-client.ts` ke HTTP API** (`/v1/chat/completions`) — ganti SSH jadi `fetch()`
4. **Config flexible**: `gatewayUrl` + `gatewayToken` — support VPS atau lokal

### Status Sekarang
- ✅ `emp list` — nampilin employee ID
- ✅ `chat send -e <empId> -m "<msg>"` — kirim + dapet reply (via SSH ke VPS)
- ✅ Parse reply dari `result.payloads[0].text`
- ⏳ Next phase: refactor ke HTTP + spawn gateway lokal

## 🐍 DeepClaude Setup
- **Path:** `~/.local/bin/deepclaude` | **Config:** `~/.config/deepclaude/config`
- **Model:** deepseek-v4-pro (utama), deepseek-v4-flash (sub-agent)
- **Juga ada:** Claude Code CLI v2.1.175
- **Panggil:** `deepclaude -p "prompt"`
- **Catatan:** Saat manggil untuk coding ASUM, WAJIB inject code convention dulu (`~/convention/code-convention.md`)

## 📦 ASUM Product Configuration Architecture
- **2 layer:** `master-product-config/configuration` (change history + workflow) dan `product-configuration` (core create/edit)
- **Product Components (master data):** rate, formula, cost-component, cover-note, commission-note, deductible, object, placing-slip, policy-clause, policy-template, premium-note, receipt, validation
- **Form:** Product Info → Distribution Channel → Plan Tabs (Coverage, Underwriting Data, System Data, Documents, Supporting Files)
- **Underwriting Data:** general info, material fact, cost component, deductible, discount, limit of liability, payment scheme, loss ratio
- **System Data:** formula, validation, object transaction request/response
- **Workflow:** WFProductConfig → WFApprovalProductConfig (via case-management)
