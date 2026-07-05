---
name: "asum-pr-review"
description: "Streamlined ASUM PR review: bundle fetch, diff, convention, ESLint, TS, test, laporan."
---

# asum-pr-review — ASUM PR Review Workflow

## Description
Streamlined PR review workflow for ASUM `epics-portal`. Bundles remote fetch, diff analysis, convention check, ESLint, TypeScript typecheck, test coverage, and summary report into one efficient pipeline.

## Repository
- Main repo: `~/project/epics-portal`
- Worktree: `/var/www/html/project-asum/epics-development`
- Remote: `ssh://git@code.ifg-life.id:7999/iaso/epics-portal.git`

## Convention Rules (from TOOLS.md)
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
- `SOURCE`: PR/branch being reviewed
- `TARGET`: Destination feature branch (e.g. `feature/components`, `feature/product-config`, etc.)

### Step 2: Remote Fetch (DO NOT SWITCH YET)
```bash
cd ~/project/epics-portal
git fetch origin $SOURCE $TARGET
```

### Step 3: Get Remote Diff
```bash
git diff origin/$TARGET...origin/$SOURCE --stat
git diff origin/$TARGET...origin/$SOURCE
```
- From remote refs, **not local branches**.
- Do **NOT switch branches** yet.
- Do **NOT auto-stash** — local changes are irrelevant for review.

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

### Step 5: Run Tool Checks (Parallel via Sub-Agents)
Use sub-agents for parallel execution:
1. **ESLint** on changed files only (not full project):
   ```bash
   cd ~/project/epics-portal && git checkout $SOURCE && npx eslint $CHANGED_FILES --max-warnings 0
   ```
2. **TypeScript** typecheck (full project, filter output):
   ```bash
   cd ~/project/epics-portal && npx tsc --noEmit 2>&1 | head -50
   ```
3. **Tests** related to changed files:
   ```bash
   cd ~/project/epics-portal && npx jest --related $CHANGED_FILES --silent 2>&1
   ```

**Priority skip**: If only `.style.ts` / `.config.ts` / non-logic files changed → skip ESLint/TS/Test entirely.

### Step 6: Summary Report
Format:
```
## 🔍 PR Review: <branch-name>

**Target:** <target-branch>
**Commits:** <commit-count>

### 📝 Convention Check
✅ / ⚠️ / ❌ per file

### 🔧 ESLint
✅ / ❌ (output or "skipped")

### 🔷 TypeScript
✅ / ❌ (output or "skipped")

### 🧪 Tests
✅ / ❌ (output or "skipped")

### 💡 Notes
- Notable findings, potential issues, suggestions
```

**`--deep` flag**: When caller adds `--deep`, also scan:
- Logic bugs or edge cases
- Performance concerns
- Potential refactors
- Specific improvement suggestions

### Step 7: Cleanup
```bash
cd ~/project/epics-portal
git checkout development
git branch -D <local-branch> 2>/dev/null; true
git checkout -- .  # discard any local changes
```

## Notes
- Always cross-check skill output with raw diff before verdict.
- False positives: JSDoc check on existing exports that only changed signature → flag as "⚠️ verify", not "❌ missing".
- Never auto-stash. Discard local changes: `git checkout -- .`
