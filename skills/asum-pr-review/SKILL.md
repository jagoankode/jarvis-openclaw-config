---
name: "asum-pr-review"
description: "Streamlined ASUM PR review: auto-detect target branch & env, diff, convention, ESLint, TS, test, laporan."
---

# asum-pr-review — ASUM PR Review Workflow

## Description
Streamlined PR review workflow for ASUM `epics-portal`. Auto-detects merge target **dan environment (VPS/WSL)**, then bundles diff analysis, convention check, ESLint, TypeScript typecheck, test run, and summary report.

## Environment Detection

**🚨 KRITIS: Deteksi dulu apakah kita di VPS (butuh tunnel) atau langsung di WSL.**

```bash
# Cek apakah repo WSL ada secara lokal
if [ -d ~/project/review_pr/epics-portal-review/.git ]; then
  echo "ENV=WSL"
else
  echo "ENV=VPS"
fi
```

- **ENV=WSL** → semua command jalan lokal, tanpa SSH
- **ENV=VPS** → semua command via SSH tunnel ke WSL baru

## Connection Config

### If VPS → SSH Tunnel ke WSL
```bash
SSH_CMD="ssh -p 43211 -i ~/.ssh/vps-to-wsl nepku@jimmy.jagoankode.site"
```

### If WSL → Local execution
```bash
SSH_CMD=""
```

## Repository
- **WSL path:** `~/project/review_pr/epics-portal-review`
- **Worktree/coding:** `~/project/workspace/`
- **Remote:** `ssh://git@code.ifg-life.id:7999/iaso/epics-portal.git`
- **Report path:** `~/project/review_pr/epics-portal-review/<SOURCE>.report.md`
- **🚫 JANGAN operasi repo langsung dari VPS** — kalo ENV=VPS, wajib via SSH tunnel

## Code Convention
- **File:** `~/convention/code-convention.md` (di WSL)
- Module Architecture: component/container/hook split
- JSDoc mandatory on public funcs: `@param {Type} name - desc`
- Types/Interfaces di `.type.ts` — jangan campur di `.utils.ts` atau `.component.tsx`
- No `useState`/`useEffect` in `.component.tsx`; private funcs `_` prefix
- Event Handler: `onClick={handle}` not `onClick={() => handle()}`
- Constants: `UPPER_SNAKE_CASE`; Boolean vars: `is/has/can/should` prefix; Arrays: plural
- Test naming: `should + expected behavior`
- Reusable utilities di `src/libs/utils/`, module-specific utils di module sendiri

## Branch Convention
- `development` → trunk
- `feature/components`, `feature/product-config`, `feature/case-management`, `feature/master-product-config`, `feature/new-business`
- `fix/*|refactor/*|chore/*` → branch out dari salah satu `feature/*`

---

## 🔄 Workflow (9 Steps)

### Step 0: Detect Environment
```bash
REPO_PATH=~/project/review_pr/epics-portal-review
if [ -d "$REPO_PATH/.git" ]; then
  ENV="WSL"
  SSH_CMD=""
else
  ENV="VPS"
  SSH_CMD="ssh -p 43211 -i ~/.ssh/vps-to-wsl nepku@jimmy.jagoankode.site"
fi
```
**📌 Semua step berikut menggunakan `$SSH_CMD` — otomatis local/tunnel sesuai env.**

### Step 1: Identify Source Branch
- Extract branch name from PR context / user command
- Extract `IIAU-xxx` from branch name

### Step 2: 🔑 Auto-Detect Target Branch
**🚨 Kritis! Jalankan auto-detect ini. JANGAN tebak, JANGAN tanya user.**

```bash
# Via SSH atau local sesuai ENV
CMD="cd $REPO_PATH && git fetch origin && for base in development feature/components feature/product-config feature/case-management feature/master-product-config feature/new-business; do
  [ \"$SOURCE\" = \"\$base\" ] && continue
  if git rev-parse --verify \"origin/$SOURCE\" >/dev/null 2>&1 || git rev-parse --verify \"$SOURCE\" >/dev/null 2>&1; then
    MERGE_BASE=\$(git merge-base \"origin/$SOURCE\" \"origin/\$base\" 2>/dev/null || git merge-base \"$SOURCE\" \"origin/\$base\" 2>/dev/null || git merge-base \"$SOURCE\" \"\$base\" 2>/dev/null)
    [ -n \"\$MERGE_BASE\" ] && COUNT=\$(git rev-list --count \"$SOURCE\" \"^\$MERGE_BASE\" 2>/dev/null)
    [ -n \"\$COUNT\" ] && [ \"\$COUNT\" -gt 0 ] 2>/dev/null && echo \"\$base:\$COUNT\"
  fi
done"

if [ "$ENV" = "VPS" ]; then
  $SSH_CMD "$CMD"
else
  cd $REPO_PATH && eval "$CMD"
fi
```

**Logika:** Loop kandidat → merge-base → `rev-list --count` → pilih yang paling kecil & > 0.

### Step 3: Fetch & Branch Prep
```bash
if [ "$ENV" = "VPS" ]; then
  $SSH_CMD "cd $REPO_PATH && git fetch origin && git checkout $SOURCE"
else
  cd $REPO_PATH && git fetch origin && git checkout $SOURCE
fi
```

### Step 4: Full Diff & Logic Review
- Dapatkan diff: `git diff $TARGET...$SOURCE`
- Review kritis: logic errors, edge cases, dead code, anti-patterns, security, naming

### Step 5: Run Automated Checks
```bash
if [ "$ENV" = "VPS" ]; then
  $SSH_CMD "cd $REPO_PATH && echo '=== ESLINT ===' && git diff --name-only \"$TARGET\"...HEAD -- '*.ts' '*.tsx' | xargs npx eslint --no-error-on-unmatched-pattern 2>&1 && echo '=== TYPECHECK ===' && npx tsc --noEmit 2>&1 | tail -20 && echo '=== TESTS ===' && CHANGED_TESTS=\$(git diff --name-only \"$TARGET\"...HEAD -- '*.test.*' '*.spec.*') && [ -n \"\$CHANGED_TESTS\" ] && echo \"\$CHANGED_TESTS\" | xargs npx jest --no-coverage 2>&1 | tail -20 || echo 'No test files changed.'"
else
  cd $REPO_PATH && echo '=== ESLINT ===' && git diff --name-only "$TARGET"...HEAD -- '*.ts' '*.tsx' | xargs npx eslint --no-error-on-unmatched-pattern 2>&1 && echo '=== TYPECHECK ===' && npx tsc --noEmit 2>&1 | tail -20 && echo '=== TESTS ===' && CHANGED_TESTS=$(git diff --name-only "$TARGET"...HEAD -- '*.test.*' '*.spec.*') && [ -n "$CHANGED_TESTS" ] && echo "$CHANGED_TESTS" | xargs npx jest --no-coverage 2>&1 | tail -20 || echo 'No test files changed.'
fi
```

### Step 6: Convention Check
Scan semua file changed di diff buat violations:
- New exports missing JSDoc
- `useState`/`useEffect` di `.component.tsx` ❌
- Inline arrow handlers ❌
- Private func missing `_` prefix ❌
- Constants not `UPPER_SNAKE_CASE` ❌
- Boolean vars missing `is/has/can/should` prefix ❌
- Arrays not plural ❌
- Test naming ❌
- Types/Interfaces di file salah ❌

### Step 7: Save Report
Simpan report di `$REPO_PATH/$SOURCE.report.md`.

### Step 8: Deliver Summary ke Chat
Kirim ringkasan ke chat:
- **Branch:** `<source>` → `<target>`
- **Commits ahead:** `N`
- **Verdict:** ✅ / ⚠️ / ❌
- **Key findings** (max 3-5 bullets)
- **Ticket:** `[IIAU-xxx](...)`

### Step 9: Cleanup
```bash
if [ "$ENV" = "VPS" ]; then
  $SSH_CMD "cd $REPO_PATH && git switch development"
else
  cd $REPO_PATH && git switch development
fi
```

---

## 📋 Report Template

Setiap section diisi dengan temuan konkret, bukan "OK" doang. Kalo gak ada masalah, tulis "No issues found."

```markdown
## 📋 PR Review: <SOURCE> → <TARGET>

**Ticket:** IIAU-xxx
**Commits ahead of base:** N
**Environment:** VPS / WSL

### ✅ 1. Branch & Git Hygiene
- Branch naming sesuai convention? ⚠️ / ✅
- Merge conflicts? Clean / Ada
- Commit messages clear? ✅ / ⚠️

### ✅ 2. Diff Assessment
- Logic correctness ✅ / ⚠️
- Edge cases handled / Missing

### ✅ 3. Code Convention
- JSDoc: ✅ / ⚠️ (sebutin file)
- `useState`/`useEffect` in component: ❌ / ✅
- Inline handlers: ❌ / ✅
- Private func prefix: ❌ / ✅
- Naming convention: ✅ / ⚠️

### ✅ 4. ESLint
- ✅ No errors (atau sebutin error yg muncul)

### ✅ 5. TypeScript
- ✅ No type errors (atau sebutin errornya)

### ✅ 6. Tests
- ✅ All passed / ⚠️ N tests failed
- Coverage: changed files covered / uncovered

### ⚠️ 7. Potential Bugs & Solutions
<!-- Temuan konkret: bug potensial + saran perbaikan. Kalo gak ada, tulis "No bugs found." -->
- **Bug:** [deskripsi]
  **File:** `path/to/file.tsx:L42`
  **Solusi:** [saran perbaikan]
- **Bug:** [deskripsi]
  **File:** `path/to/file.tsx:L88-L95`
  **Solusi:** [saran perbaikan]

### ⚡ 8. Warnings
<!-- Hal yang gak kritikal tapi perlu dicatat: tech debt, performance concern, potensi refactor, dll -->
- [warning 1]
- [warning 2]

### ✅ 9. Overall

**Verdict:** ✅ / ⚠️ / ❌
```

---

## PR Description Template (kalo diminta)
```markdown
## Title
[type]([module]):[IIAU-xxx] [short description]

Link Ticket: __[IIAU-xxx](https://ifg-life.atlassian.net/browse/IIAU-xxx)__

📌 **Summary:**

🎯 **Purpose / Background:**

🛠️ **Key Changes:**

📸 **Screenshots:**
```

## 🔒 Guard Rules
1. **Step 0: Detect Environment** — jalankan duluan. Jangan asumsi.
2. **Semua operasi repo via WSL** — kalo ENV=VPS, wajib SSH tunnel.
3. **Auto-detect target branch** — jangan tebak, jangan tanya user. Step 2 wajib.
4. **Single delivery** — simpan report dulu, baru kirim. Sekali deliver.
5. **Skip jika duplikat** — kalo udah pernah deliver untuk branch yang sama di sesi ini, skip.
6. **NO parallel sub-agents** — semua step serial.
7. **Jangan commit & push** — minta persetujuan user dulu.
8. **Report di WSL** — path: `$REPO_PATH/$SOURCE.report.md`
