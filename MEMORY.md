# MEMORY.md - Long-Term Memory

## 🔍 Identity & Persona

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
4. **Delegasi ke opencode agent `senior-frontend-next-asum`** — refactor besar/kecil & create new feature
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

**CLI:** `opencode` di `~/.opencode/bin/opencode`
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

- **Main repo (review PR & git ops):** `~/project/epics-portal`
- **Remote:** `ssh://git@code.ifg-life.id:7999/iaso/epics-portal.git`
<<<<<<< HEAD
- **Worktree (coding/refactor):** `/var/www/html/project-asum/` — dari repo `epics-development`

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
- Reusable utilities di `src/libs/utils/`, module-specific utils di module sendiri

### Branch Convention
- `development` → trunk
- `feature/components`, `feature/product-config`, `feature/case-management`, `feature/master-product-config`, `feature/new-business`
- `fix/*|refactor/*|chore/*` → branch out dari salah satu `feature/*`
- Cek base: `git merge-base <branch> <candidate-base>` + `git rev-list --count`

### 🚫 Location Rules
1. **Coding / refactor** → `/var/www/html/project-asum/` (worktree dari `epics-development`)
2. **Review PR** → `~/project/epics-portal` (switch branch, **JANGAN** bikin worktree)
3. **Worktree baru** — WAJIB tanya: branch name, path, base branch. Format: `worktree [type]/[IIAU-xxx-nama] → [base-branch]`
4. **Jangan auto commit & push** — kerjain selesai → tunjukkin hasil → **TUNGGU INSTRUKSI**
=======
- **Worktree (coding/refactor):** Ada di **WSL** — VPS cuma tunnel via `nep@192.168.1.100` (atau host WSL terakhir)
- **JANGAN cek worktree di VPS** — worktree hanya ada di WSL!
- **Tech:** Next.js, TypeScript, React Hook Form, Redux RTK Query, yup, Tailwind, React Table, ESLint strict
- **Rules:** Scoped lint rules, pre-commit hook (lint + test coverage), JSDoc required, private funcs `_` prefixed

### 🚫 Location Rules — INGAT INI!

1. **Semua terkait ASUM** (coding, review PR, git ops, dll) → **di WSL**, bukan VPS!
2. **VPS ini (`jimmy-vps`)** — gak kepake buat ASUM sama sekali
3. Review PR → juga di WSL, bukan di `~/project/epics-portal` VPS
4. **JANGAN cek path manapun di VPS** kalo soal ASUM
>>>>>>> 0947359 (chore: weekly auto-sync [2026-07-12])

### Langkah Bikin Worktree
1. `cat [existing-worktree]/.git` → cari main repo
2. `cd [MAIN-REPO]` → `git fetch origin [BASE-BRANCH]`
3. `git worktree add -b [type/IIAU-xxx-nama] /var/www/html/project-asum/[IIAU-xxx] origin/[base-branch]`

## 🚀 PR Review — Workflow & Strategi

### Speed Strategy
1. **Batch 1 exec call** — gabung fetch, diff, convention, tools, cleanup
2. **Priority skip** — `.style.ts` / `.config.ts` aja? skip ESLint/TS/Test
3. **Sub-agent parallel** — review convention dulu, tooling berat di background
4. **Remote diff dulu** (`git diff origin/$TARGET...origin/$SOURCE`) — jangan switch dulu
5. **JANGAN auto-stash** — `git checkout -- .` aja
6. **ESLint cuma $SRC**, TS tetap full project output di-filter
7. **Selesai → cleanup** — switch ke `development`, hapus semua local branch lain
8. **`--deep`** — scan logic + potensi bug + solusi

### Steps
1. `git fetch origin $SOURCE $TARGET` → remote diff — **GAK PERLU SWITCH**
2. Switch cuma kalo perlu run lint/typecheck/test — discard local changes
3. Review: ESLint source (changed), ESLint test (changed), TS typecheck (scoped), Jest di scope module
4. **Report** → save ke `~/project/review-pr/[nama-branch].md` + tampilkan di chat
5. **Cleanup:** `git switch development`, `git branch -D [SOURCE]`

### Report Format (minimal)
```
## 📋 PR Review: source → target
### ✅ Branch & Git Hygiene
### ✅ Code Convention
### ✅ ESLint
Verdict: ✅ / ❌ / ⚠️
```

### ⚠️ Lesson: Jangan Blind Trust ke Automated PR Review
PR `fix/deductible` — skill ngeflag `_getTableProps` sebagai "missing JSDoc" → **false positive** (existing export, cuma signature berubah).
1. Cross-check skill output sama raw diff
2. "missing JSDoc" → cek: beneran export baru atau cuma signature berubah?
3. Diff `...` includes perubahan existing code
4. Better "⚠️ perlu dicek" daripada langsung "❌"

## 📋 List PR — Format & Aturan

Kalo Brillian minta list PR:
- Cek **semua** feature branch: `feature/components`, `feature/product-config`, `feature/case-management`, `feature/master-product-config`, `feature/new-business`
- Format: `email.author@domain.com - YYYY-MM-DD HH:mm \n branch-name`
- Author email & datetime dari latest commit di PR branch
- Filter merge: `git merge-base --is-ancestor <sha> origin/<feature-branch>` — skip merged
- PR refs: `git ls-remote origin | grep "pull-requests"` (bukan `git branch -r`)
- Branch name: `git branch -r --contains <sha>` → filter `pull-requests`

## 🧪 Key Lesson: Sub-Agents buat Project Work

Brillian nyaranin pake **sub-agents + skills** pas ngerjain project task. Gak usah everything in main thread — delegasi yang berat-berat.

## 🧪 IIAU-778 Bug Quill Editor

**Branch:** `fix/IIAU-778-bug-quil-editor` → `feature/components`
**Worktree:** `/var/www/html/project-asum/IIAU-778-bug-quil-editor`
**Status:** ⏳ Waiting for Brillian's confirmation to push (since June 29 — ~11 days)

### 5 Issues Fixed
- **Auto Page Break** — Deleted `useAutoPageBreak`, `_wrapOnChange`, `AUTO_PAGE_BREAK_PATTERN`
- **Tab Key Lost After Reload** — Clipboard regex converts `\t` to space, fixed with custom Tab binding inserting `\u00a0×4`
- **Dual Language Border** — `borderless-table` class lost in clipboard, fixed register `border-color` StyleAttributor + inline `border-color: transparent`
- **Hierarchical Numbering** — CSS selectors scoped to wrapper but PDF preview HTML is bare, fixed JS pre-compute → `data-number` attr → `content: attr(data-number)`
- **KaTeX Formula** — Not registered for PDF rendering, fixed with `import katex`, `window.katex=katex`, `katex.css.ts`

### Key Learning
CSS scoped to `.document-composer-quill-wrapper .ql-editor` **tidak** bekerja di PDF preview (HTML dikirim bare). CSS counters unreliable di PDF API → JS pre-compute + `data-number` attribute.

Detail: [`memory/archive/2026-06-28.md`] → [`memory/archive/2026-06-29.md`]

## 🧪 Autonomous Studio Project (On Hold Since July 3)

- **Path:** `/home/nep/project/autonomous-studio` → `src/jim.ts`
- **Status:** Functional — OpenCode-style TUI, 6 commands (/personas, /generate, /chat, /workflow, /help, /exit), CLI args, state machine, menu overlay, scroll UI
- **Run:** `npx tsx src/jim.ts` or globally `autonomous`
- **TODO:** Visual polish, resize handling, /workflow placeholder

## 🧪 Portfolio Project

- **Path:** `/home/nep/project/portofolio/index.html`
- **GitHub:** https://github.com/jagoankode
- **LinkedIn:** https://www.linkedin.com/in/brillian-andrie-nugroho-wiguno/
- **CV:** https://jagoankode.github.io/assets/pdf/Brillian-Andrie-CV.pdf (online)
  - Backup path dulu: `/home/nep/project/portofolio/assets/pdf/Brillian-Andrie-CV.pdf`
- **Tech stack:** JS/TS, React, Next.js, Node.js, Go, Java, Swift, Kotlin, iOS/Android Native, Docker, Jenkins, Git, Tailwind, REST API, Microservices, AI/LLM, OpenClaw

## 🛠️ Workspace Skills

| Skill | Dipake Kapan |
|-------|-------------|
| 🧭 context-scout | Sebelum modify code, cari context |
| 🛡️ diff-guardian | Sebelum finalisasi, cek minimal diff |
| 🔍 error-triage | Pas runtime/build/ESLint/TS/test error |
| 📋 handoff-summary | Akhir coding session |
| 🚧 refactor-gate | Sebelum refactor |
| 💰 token-saver | Limited context / model mahal |
| 🧠 smart-routing | Auto pilih model sesuai complexity |
| 👁️ vision-router | Gambar → tentuin jenis & cara handle |
| 🎨 figma-screenshot-analyzer | Figma screenshot → frontend code |
| 📖 qmd | Nyari di local markdown docs |

**Workflow coding:** vision-router → figma-screenshot-analyzer → context-scout → (ngoding/delegasi) → refactor-gate → error-triage → diff-guardian → handoff-summary

## 🚨 New Session Flow

Setelah **deliver hasil**: compact → tanya Bos Jarvis koreksi → kalo gak ada → **new session**

## 🚀 VPS Setup (jimmy-vps)

<<<<<<< HEAD
### Auto Tunnel WSL → VPS
- **WSL → VPS:** Autossh reverse tunnel port 43210 → localhost:22
- **Systemd:** `/etc/systemd/system/reverse-tunnel.service` + cron @reboot backup
- **Health check:** Cron `*/5 * * * *` cek port 43210, auto-restart
- **VPS → WSL:** `ssh wsl-tunnel` (via 127.0.0.1:43210)
- **Script:** `/home/nep/.local/bin/tunnel-wsl.sh`

| Item | Detail |
|------|--------|
| **IP** | 103.93.161.116 |
| **User** | jimmy-bot |
| **SSH key** | `~/.ssh/jimmy-openclaw.pem` |
| **SSH alias** | `jimmy-vps` |
| **OpenClaw** | v2026.6.11 |
| **Primary model** | opencode-go/deepseek-v4-flash |
| **API key** | sk-cRj…ghoZ (opencode-go) |
| **Gateway** | port 18789, bind LAN |
| **Telegram** | @jimmy_newtron_bot — running via VPS |

### Git Backup
- **Repo:** github.com/jagoankode/jarvis-openclaw-config — semua workspace + daily notes
- **Restore:** clone ke `~/.openclaw/workspace`
=======
### VPS Setup (Jimmy-OpenClaw)
- **IP:** 103.93.161.116
- **User:** jimmy-bot
- **SSH key:** ~/.ssh/jimmy-openclaw.pem
- **SSH alias:** `jimmy-vps` (via ~/.ssh/config)
- **OpenClaw:** v2026.6.11
- **Model:** opencode-go/deepseek-v4-flash (primary)
- **API key:** sk-cRj…ghoZ (opencode-go)
- **Gateway:** port 18789, bind LAN
- **Telegram (akun velma):** Velma Dinkley 🔍 — running via VPS
- **Telegram (akun default):** @jimmy_newtron_bot Jimmy Neutron 🧪 — bot Telegram lama

## 🔬 Tugas: Tech Research & Report (Velma)

- **Mulai:** 6 Juli 2026
- **Siklus:** Setiap 2 hari
- **Sesi:** Mulai 00:00 hari-1 sampai 23:59 hari-2
- **Report deadline:** 23:55 WIB di hari ke-2
- **Folder:** `~/rnd_result/{YYYY-MM-DD}.md` (tanggal mulai sesi)
- **Topik prioritas (rotate):** AI → Front End → Back End → Infra
- **Delivery:** File detail + summary Telegram
- **Otomatis via cron:** `velma-tech-research`

### Git Backup
- **Repo:** github.com/jagoankode/jarvis-openclaw-config
- **Isi:** Semua workspace files + daily notes
- **Cara restore:** git clone ke ~/.openclaw/workspace di mana aja
- **Auto-sync:** cron job `weekly-sync-github-backup` — setiap Minggu 00:00 WIB
>>>>>>> 0947359 (chore: weekly auto-sync [2026-07-12])

## 🧪 Autonomous Studio — OpenClaw Wrapping Plan (Next Phase)

**Goal:** `npm install -g autonomous-studio` langsung jalan tanpa user tau itu wrapper OpenClaw.

**Project path (WSL):** `/home/nep/future/autonomous-studio`
**SSH ke WSL:** `ssh -p 43210 -i ~/.ssh/vps-to-wsl nep@127.0.0.1`

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

## 📦 ASUM Product Configuration Architecture
- **2 layer:** `master-product-config/configuration` (change history + workflow) dan `product-configuration` (core create/edit)
- **Product Components (master data):** rate, formula, cost-component, cover-note, commission-note, deductible, object, placing-slip, policy-clause, policy-template, premium-note, receipt, validation
- **Form:** Product Info → Distribution Channel → Plan Tabs (Coverage, Underwriting Data, System Data, Documents, Supporting Files)
- **Underwriting Data:** general info, material fact, cost component, deductible, discount, limit of liability, payment scheme, loss ratio
- **System Data:** formula, validation, object transaction request/response
- **Workflow:** WFProductConfig → WFApprovalProductConfig (via case-management)
