# MEMORY.md - Long-Term Memory

## 🧪 Identity & Persona

- **Nama:** Jimmy Neutron 🧪 — lab-grown chaos agent, degree in curiosity
- **Panggilan Bos Jarvis:** Brillian Andrie Nugroho Wiguno
- **Vibe:** Santai, witty, no-nonsense
- **Tone WA ke orang lain (bukan Bos):** Sopan, profesional, panggil Kak/Kakak. Perkenalan: "Halo, Kak, saya Jimmy Neutron, asisten Brillian Andrie. Ada yang bisa saya bantu?"
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

## 📌 Convention & Code Organization

**Location:** `~/convention/code-convention.md`
**Scope:** ASUM FE — Next.js, TypeScript, Jest, Tailwind
**Rules di TOOLS.md:** Module Architecture, JSDoc, no state/effect in `.component.tsx`, event handler naming, private `_` prefix, `UPPER_SNAKE_CASE` constants, `is/has/can/should` booleans, plural arrays, `should + expected behavior` test naming.

**Wajib dicek:**
- **Types/Interfaces** di file `.type.ts` — jangan campur di `.utils.ts` atau `.component.tsx`
- **Reusable utilities** di `src/libs/utils/`, module-specific utils di module sendiri

## 📌 Branch Convention ASUM

- **`development`** → branch utama / trunk
- **`feature/*`** → branch out dari `development`: `feature/components`, `feature/product-config`, `feature/case-management`, `feature/master-product-config`, `feature/new-business`
- **Prefix lain** (`fix/*`, `refactor/*`, `chore/*`, dll) → branch out dari salah satu `feature/*`
- Cek base branch: `git merge-base <branch> <candidate-base>` + `git rev-list --count`

## 📌 ASUM Project Context

- **Main repo (review PR & git ops):** `~/project/epics-portal`
- **Remote:** `ssh://git@code.ifg-life.id:7999/iaso/epics-portal.git`
- **Worktree (coding/refactor):** `/var/www/html/project-asum/` — dari repo `epics-development`
- **Tech:** Next.js, TypeScript, React Hook Form, Redux RTK Query, yup, Tailwind, React Table, ESLint strict
- **Rules:** Scoped lint rules, pre-commit hook (lint + test coverage), JSDoc required, private funcs `_` prefixed

### 🚫 Location Rules

1. **Coding / refactor** → `/var/www/html/project-asum/` (pake worktree dari `epics-development`)
2. **Review PR** → `~/project/epics-portal` (switch branch, **JANGAN** bikin worktree)
3. **Bikin worktree** → `cd /var/www/html/project-asum/epics-development && git worktree add ...`

### 🚫 WAJIB Tanya Sebelum Bikin Worktree

1. Branch name apa?
2. Worktree path / folder name apa?
3. Base dari branch mana? (origin/xxx)

Format dari Bos: `worktree [type]/[IIAU-xxx-nama] → [base-branch]`

**Langkah bikin worktree:**
1. Cari main repo dari existing worktree: `cat [existing-worktree]/.git`
2. `cd [MAIN-REPO]`
3. `git fetch origin [BASE-BRANCH]`
4. `git worktree add -b [type/IIAU-xxx-nama] /var/www/html/project-asum/[IIAU-xxx] origin/[base-branch]`

### 🚫 Jangan Auto Commit & Push

1. Kerjain tugas sampai selesai
2. Tunjukin hasilnya
3. **TUNGGU INSTRUKSI** buat commit & push
4. Jangan auto-generate PR description — hanya generate kalo **secara eksplisit diminta**

## 🚀 PR Review — Workflow & Strategi

### Strategi Kecepatan (Updated 27 Jun 2026)

1. **Batch 1 exec call** — gabung fetch, diff, convention, tools, cleanup
2. **Priority skip** — `.style.ts` / `.config.ts` aja? skip ESLint/TS/Test
3. **Sub-agent parallel** — review convention dulu, tooling berat di background
4. **Remote diff dulu** (`git diff origin/$TARGET...origin/$SOURCE`) — jangan switch sebelum tau apa yang berubah
5. **JANGAN auto-stash** — local changes discard aja (`git checkout -- .`). Local changes gak relevan buat review
6. **ESLint cuma $SRC** — bukan full project
7. **TS tetap full project, output di-filter**
8. **Selesai → cleanup** — switch ke `development`, hapus semua local branch lain
9. **`--deep` flag** — kalo lo tambahin `--deep`, gue scan logic + potensi bug + solusi di report

### Langkah Review PR

1. `git fetch origin $SOURCE $TARGET` dulu
2. Ambil diff dari remote refs — `git diff origin/$TARGET...origin/$SOURCE`
3. **GAK PERLU SWITCH** — remote diff udah cukup buat lihat perubahan
4. **Cuma switch kalo perlu run lint/typecheck/test** — discard local changes, gak perlu auto-stash
5. **Review:** ESLint source files (changed only), ESLint test files (changed only), TypeScript typecheck (scoped), Jest tests di scope module
6. **Report → save** ke `~/project/review-pr/[nama-branch].md` + tampilkan di chat
7. **Cleanup:** `git switch development`, `git branch -D [SOURCE]`

### Format Report (minimal)

```
## 📋 PR Review: source → target

### ✅ Branch & Git Hygiene
### ✅ Code Convention
### ✅ ESLint

Verdict: ✅ / ❌ / ⚠️
```

### ⚠️ Lesson: Jangan Blind Trust ke Automated PR Review

Pas review PR `fix/deductible`, skill `code-review-checklist` ngeflag `_getTableProps` sebagai "missing JSDoc" — ternyata **false positive** (existing export, JSDoc udah ada, cuma signature berubah).

**Ajarannya:**
1. Always cross-check skill output sama raw diff sebelum verdict
2. Kalo skill bilang "missing JSDoc" → cek: beneran export baru atau cuma signature berubah?
3. Diff `...` (triple-dot) includes perubahan di existing code, bukan cuma file baru
4. Better flag "⚠️ perlu dicek" daripada langsung "❌ missing" kalo ragu

## 📋 List PR — Format & Aturan

Kalo Brillian minta list PR:
- Cek **semua** branch feature tanpa tanya lagi: `feature/components`, `feature/product-config`, `feature/case-management`, `feature/master-product-config`, `feature/new-business`
- Format output: `email.author@domain.com - YYYY-MM-DD HH:mm \n branch-name`
- Ambil author email & datetime dari latest commit di PR branch
- Filter merge status: `git merge-base --is-ancestor <sha> origin/<feature-branch>` — skip yang udah merge
- Dapetin PR refs: `git ls-remote origin | grep "pull-requests"` (bukan `git branch -r`)
- Cari branch name: `git branch -r --contains <sha>` → filter `pull-requests`

## 🧪 Key Lesson: Sub-Agents buat Project Work

Brillian nyaranin pake **sub-agents + skills** pas ngerjain project task. Gak usah everything in main thread — delegasi yang berat-berat.

## 🧪 IIAU-778 Bug Quill Editor

**Branch:** `fix/IIAU-778-bug-quil-editor` → `feature/components`
**Worktree:** `/var/www/html/project-asum/IIAU-778-bug-quil-editor`

### 5 Issues Fixed
| Issue | Root Cause | Fix |
|-------|-----------|-----|
| **Auto Page Break** | Feature not needed | Deleted `useAutoPageBreak`, `_wrapOnChange`, `AUTO_PAGE_BREAK_PATTERN` |
| **Tab Key Lost After Reload** | Clipboard regex converts `\t` to space | Custom Tab binding inserts `\u00a0×4` (nbsp) |
| **Dual Language Border** | `borderless-table` class lost in clipboard | Register `border-color` StyleAttributor, inject inline `border-color: transparent` |
| **Hierarchical Numbering** | CSS selectors scoped to wrapper, PDF preview HTML is bare | JS pre-compute → `data-number` attr → `content: attr(data-number)` |
| **KaTeX Formula** | Not registered for PDF rendering | `import katex`, `window.katex=katex`, generated `katex.css.ts` |

### Key Learning
CSS scoped to `.document-composer-quill-wrapper .ql-editor` **tidak** bekerja di PDF preview (HTML dikirim bare tanpa wrapper). CSS counters juga unreliable di PDF API. Solusi: JS pre-compute + `data-number` attribute.

**Status:** Waiting for Brillian's confirmation to push.

## 🧪 Autonomous Studio Project (On Hold)

- **Path:** `/home/nep/project/autonomous-studio`
- **TUI** di `src/jim.ts` — OpenCode-style full-screen terminal UI
- **Status:** Basic done — menu, 6 commands (/personas, /generate, /chat, /workflow, /help, /exit), CLI args, proper cleanup
- **Bug fix:** Missing stdin keypress listener (`readline.emitKeypressEvents` + `resume`)
- **Run:** `npx tsx src/jim.ts` or globally `autonomous`
- **TODO:** Visual polish, resize handling, /workflow placeholder

## 🧪 Portfolio Project

- **Path:** `/home/nep/project/portofolio/index.html`
- **GitHub:** https://github.com/jagoankode
- **LinkedIn:** https://www.linkedin.com/in/brillian-andrie-nugroho-wiguno/
- **CV:** `/home/nep/project/portofolio/assets/pdf/Brillian-Andrie-CV.pdf`
- **Tech stack:** JS/TS, React, Next.js, Node.js, Go, Java, Swift, Kotlin, iOS/Android Native, Docker, Jenkins, Git, Tailwind, REST API, Microservices, AI/LLM, OpenClaw

## Skills yang Gue Punya (Workspace Skills)

| Skill | Dipake Kapan |
|-------|-------------|
| 🧭 context-scout | Sebelum modify code, cari context relevan |
| 🛡️ diff-guardian | Sebelum finalisasi, cek minimal diff |
| 🔍 error-triage | Pas ada runtime/build/ESLint/TS/test error |
| 📋 handoff-summary | Akhir coding session, bikin ringkasan |
| 🚧 refactor-gate | Sebelum refactor, tentuin apakah perlu |
| 💰 token-saver | Pas limited context / model mahal |
| 🧠 smart-routing | Auto pilih model sesuai complexity |
| 👁️ vision-router | Kalo dikasih gambar, tentuin jenis & cara handle |
| 🎨 figma-screenshot-analyzer | Konversi Figma screenshot ke frontend code |
| 📖 qmd | Nyari di local markdown docs |

**Workflow coding:** vision-router → figma-screenshot-analyzer → context-scout → (ngoding/delegasi) → refactor-gate → error-triage → diff-guardian → handoff-summary

## 🚨 Rules: New Session Flow

Setelah **deliver hasil**, langsung:
1. Jalankan **compact** dulu
2. **Tanya** Bos Jarvis: ada koreksi atau enggak?
3. Kalo **gak ada koreksi** → **new session**

## 🚀 VPS Setup (Jimmy-OpenClaw on jimmy-vps)

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
- **Repo:** github.com/jagoankode/jarvis-openclaw-config
- **Isi:** Semua workspace files + daily notes
- **Cara restore:** git clone ke `~/.openclaw/workspace` di mana aja
