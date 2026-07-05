# code-review-checklist

PR review SOP for **Epics Portal (ASUM)** — Next.js, TypeScript, Jest, Tailwind, ESLint strict.

Optimized with: **batch exec**, **priority-based skip**, and **parallel sub-agent** for heavy tooling.

**WAJIB** reference code convention di `~/convention/code-convention.md` (tapi **jangan baca full file tiap review** — rules udah di TOOLS.md + MEMORY.md di context. Baca file cuma kalo ada yang spesifik/ragu).

Scoped to **diff-only** files. No full project scan.

---

## 🎯 When to Use

- When asked to review a PR

## 📥 Input

```
review <source-branch> -> <target-branch>
review <source-branch> -> <target-branch> --deep    # + deep bug detection
```

**Branch Convention ASUM:**
- `feature/*` → base = `development`
- `fix/*` / `refactor/*` / `chore/*` → base = salah satu `feature/*` (cek pake `git merge-base`)
- Kalo target gak disebut, auto-detect pake `git merge-base`

## 📤 Output

Full report → `~/project/review-pr/[branch-name].md`
Chat → **ringkasan** + path file report.

**6 section report:**
1. **Header** — source→target, files, +lines/-lines
2. **Changed Files** — daftar file
3. **Convention Check** — console.log / @ts-ignore / any / inline arrow / type
4. **ESLint** — hasil lint (kalo ada error)
5. **TypeScript** — output tsc filter per file PR
6. **Tests** — hasil Jest (pass/fail)
7. **🔍 Findings & Suggestions** — potensi bug, warning, saran perbaikan (diisi agent setelah review diff)

---

## ⚡ Strategi Kecepatan

### 1. Batch — 1 Exec Call

Gabung fetch, diff, convention, lint, typecheck, test, cleanup jadi **satu** shell script. Jangan pecah jadi 5-6 exec terpisah.

### 2. Priority-Based Skip

| Tipe PR (dari diff files) | Cukup Cek | Skip |
|---|---|---|
| `.style.ts` atau `.config.ts` aja | Convention | ESLint, TS, Test |
| `.type.ts` aja | Convention | ESLint, TS, Test |
| `.hook.ts` / logic changes | ESLint + TS + Convention | — |
| `.component.tsx` + `.test.ts` | Full check | — |

### 3. Parallel Tooling (dalam 1 exec)

```
ESLint ($SRC)  ─┐
tsc --noEmit    ─┤  & + wait  →  selesai ~2x lebih cepet
Jest ($TST)     ─┘
```

---

## 🔧 Execution Plan

### 0. Pre-check

```bash
SOURCE=<source>
TARGET=<target>
REPO=~/project/epics-portal
REPORT=~/project/review-pr
```

Detect tipe PR dari branch name + diff files untuk tentuin priority skip.

### 1. Git Ops — Batch Exec

```bash
cd ~/project/epics-portal

# Fetch + Diff
git fetch origin $SOURCE $TARGET
DIFF=$(git diff origin/$TARGET...origin/$SOURCE --name-only --diff-filter=ACM)
[ -z "$DIFF" ] && echo "ℹ️ No file changes" && exit 0

TS=$(echo "$DIFF" | grep -E '\.(ts|tsx)$' || true)
SRC=$(echo "$TS" | grep -vE '\.(test|spec|snap)\.' || true)
TST=$(echo "$DIFF" | grep -E '\.(test|spec)\.(ts|tsx)$' || true)
FULL_DIFF=$(git diff origin/$TARGET...origin/$SOURCE)
INS=$(echo "$FULL_DIFF" | grep "^+" | grep -v "^+++" | wc -l)
DEL=$(echo "$FULL_DIFF" | grep "^-" | grep -v "^---" | wc -l)

# Convention check — dari diff, gak perlu switch
echo "## Branch & Git Hygiene"
echo "- Branch: $SOURCE -> $TARGET"
echo "- Files: $(echo "$DIFF" | wc -l) | +$INS/-$DEL"

echo ""
echo "## Convention Check (from diff)"

# console.log
echo "$FULL_DIFF" | grep "^+" | grep -q "console.log" && echo "❌ console.log detected"

# @ts-ignore
echo "$FULL_DIFF" | grep "^+" | grep -qE "@ts-ignore|@ts-expect-error" && echo "❌ @ts-ignore detected"

# any type
echo "$FULL_DIFF" | grep "^+" | grep -qE ": any[^a-zA-Z]" && echo "⚠️ 'any' type detected"

# inline arrow
echo "$FULL_DIFF" | grep "^+" | grep -qE "on[A-Z]\w+=\{\(.*\)\s*=>" && echo "⚠️ Inline arrow handler"

# Types outside .type.ts
for f in $SRC; do
  [[ "$f" == *.type.ts ]] && continue
  echo "$FULL_DIFF" | grep "^+.export (type|interface)" | grep -qF "$f" && echo "❌ Type in $f — move to .type.ts"
done

# Priority skip
NEED_SWITCH=false
HAS_LOGIC=$(echo "$SRC" | grep -vE '\.(style|config)\.' || true)
[ -n "$HAS_LOGIC" ] && NEED_SWITCH=true
[ -n "$TST" ] && NEED_SWITCH=true

if [ "$NEED_SWITCH" = false ]; then
  echo "ℹ️ Style/config/type only — no tooling needed"
  exit 0
fi

# Switch branch
# ⚡ Gak perlu `git pull` — udah fetch di langkah sebelumnya
git checkout -- . 2>/dev/null && git clean -fd 2>/dev/null
git switch $SOURCE

# Resolve TEST_TARGETS — cari test files yg relevan
TEST_TARGETS="$TST"
for sf in $SRC; do
  TF=$(echo "$sf" | sed 's/\.component\.tsx/.component.test.tsx/' | sed 's/\.container\.tsx/.container.test.ts/')
  [ -f "$TF" ] && TEST_TARGETS="$TEST_TARGETS $TF"
done
TEST_TARGETS=$(echo "$TEST_TARGETS" | tr ' ' '\n' | sort -u | tr '\n' ' ')

# ──────────────────────────────────────────────
# 🚀 PARALLEL: ESLint + tsc + Jest jalan bareng
# ──────────────────────────────────────────────

REPORT_FILE="$REPORT"/$(echo $SOURCE | tr '/' '-').md
mkdir -p "$REPORT"

# Init report
cat > "$REPORT_FILE" <<EOFR
# PR Review: \`$SOURCE\` → \`$TARGET\`

**Files:** $(echo "$DIFF" | wc -l) | **+$INS/-$DEL**

## Convention Check
EOFR

# Convention check (instant, tulis ke report)
echo "$FULL_DIFF" | grep "^+" | grep -q "console.log" && echo "- ❌ console.log detected" >> "$REPORT_FILE"
echo "$FULL_DIFF" | grep "^+" | grep -qE "@ts-ignore|@ts-expect-error" && echo "- ❌ @ts-ignore detected" >> "$REPORT_FILE"
echo "$FULL_DIFF" | grep "^+" | grep -qE ": any[^a-zA-Z]" && echo "- ⚠️ 'any' type detected" >> "$REPORT_FILE"
echo "$FULL_DIFF" | grep "^+" | grep -qE "on[A-Z]\\w+=\\{\\(.*\\)\\s*=>" && echo "- ⚠️ Inline arrow handler" >> "$REPORT_FILE"
for f in $SRC; do
  [[ "$f" == *.type.ts ]] && continue
  echo "$FULL_DIFF" | grep "^+.export (type|interface)" | grep -qF "$f" && echo "- ❌ Type in \`$f\` — move to .type.ts" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "## ESLint" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

# Jalanin ESLint + tsc + Jest bareng ➡ masing2 tulis ke file sementara
# ESLint — pake temp file biar word splitting reliable
echo "$SRC" | while read f; do [ -n "$f" ] && [ -f "$f" ] && echo "$f"; done > /tmp/review_eslint_files.txt
[ -s /tmp/review_eslint_files.txt ] && node_modules/.bin/eslint --format compact $(cat /tmp/review_eslint_files.txt) > /tmp/review_eslint.txt 2>&1 &

# TypeScript — filter output ke diff files
npx tsc --noEmit > /tmp/review_tsc_full.txt 2>&1 &

# Tests — 1x panggil pake temp file biar word splitting reliable
echo "$TEST_TARGETS" | while read f; do [ -n "$f" ] && [ -f "$f" ] && echo "$f"; done > /tmp/review_jest_files.txt
[ -s /tmp/review_jest_files.txt ] && npx jest --no-coverage --silent $(cat /tmp/review_jest_files.txt) > /tmp/review_jest.txt 2>&1 &

# Tunggu semua selesai
wait

# Tulis hasil ESLint ke report
cat /tmp/review_eslint.txt >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## TypeScript" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
# Filter tsc output ke diff files aja
cat /tmp/review_tsc_full.txt | while IFS= read -r line; do
  for f in $SRC; do [[ "$line" =~ $f ]] && echo "$line" && break; done
done >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Tests" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
cat /tmp/review_jest.txt | tail -20 >> "$REPORT_FILE"
echo '
```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## 🔍 Findings & Suggestions" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "_Diisi oleh reviewer setelah memeriksa diff secara keseluruhan._" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Capture summary dari temp files sebelum cleanup
ESLINT_ERR=$(grep -c 'error' /tmp/review_eslint.txt 2>/dev/null; true)
TSC_ERR=$(grep -c 'error' /tmp/review_tsc_full.txt 2>/dev/null; true)
# Ambil jumlah failed tests dari output Jest
JEST_FAIL=$(grep -oP 'Tests:\s+\d+ failed' /tmp/review_jest.txt 2>/dev/null | grep -oP '\d+' || echo 0)

# Bersihin temp files
rm -f /tmp/review_eslint.txt /tmp/review_tsc_full.txt /tmp/review_jest.txt /tmp/review_eslint_files.txt /tmp/review_jest_files.txt

# Cleanup branch
git switch development && git branch -D $SOURCE 2>/dev/null

# Tampilkan summary di terminal
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PR Review Selesai"
echo "   Source: $SOURCE"
echo "   File:   $(echo "$DIFF" | wc -l) changed | +$INS/-$DEL"
echo ""
echo "📊 Hasil:"
echo "   ├─ ESLint:   ${ESLINT_ERR} error(s)"
echo "   ├─ TypeScript: ${TSC_ERR} error(s)"
echo "   └─ Tests:    ${JEST_FAIL} failure(s)"
echo ""
echo "📄 Full report: $REPORT_FILE"
```

### 2. JSDoc Cross-Check

```bash
# Bedain: beneran baru vs existing cuma diubah
for f in $SRC; do
  IS_NEW=$(git diff origin/$TARGET...origin/$SOURCE --diff-filter=A --name-only | grep -cF "$f" || true)
  if [ "$IS_NEW" -gt 0 ]; then
    echo "$FULL_DIFF" | grep -B1 "^+.export " | grep -E "\*\/" || echo "⚠️ $f: new file — verify JSDoc"
  else
    echo "$FULL_DIFF" | grep "^+." | grep -E "^\+export (function|const|default)" | while read -r ex; do
      echo "⚠️ $f: possible new export — check JSDoc: $(echo "$ex" | sed 's/^+//')"
    done
  fi
done
```

---

## ⚠️ Critical Rules

1. **Remote diff first** — jangan switch duluan. `fetch` + `diff origin/...` dulu.
2. **JANGAN auto-stash** — local changes gak relevan, `git checkout -- .` aja.
3. **Batch 1 exec call** — jangan dipecah.
4. **ESLint pake `node_modules/.bin/eslint` langsung** — bukan `bun run lint`/`next lint` (gak support file args).
5. **Priority skip** — style/config aja? skip tooling.
6. **JSDoc: bedain baru vs existing** — jangan false positive.
7. **ESLint cuma $SRC** — bukan full project.
8. **TS full project, output di-filter** — keterbatasan `tsc`.
9. **Dead code check** — variable baru tapi gak dipake.
10. **--deep flag** — tambah section potensi bug + solusi di report.
11. **Report simpan ke file, summary di terminal** — gak double-write.
12. **Selesai → cleanup** — switch development, hapus local branch.
13. **ESLint + tsc + Jest jalan parallel** — pake `&` + `wait` dalam 1 exec.
14. **Jest 1x call** — gak loop per test file. Startup overhead dihemat.
