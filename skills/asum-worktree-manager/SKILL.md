---
name: "asum-worktree-manager"
description: "Auto-detect base branch, suggest path, and create worktree for ASUM."
---

# asum-worktree-manager — ASUM Worktree Automation

## Description
Automates worktree creation for ASUM `epics-portal`. Detects base branch via `merge-base`, suggests optimal worktree path, and creates it — no more back-and-forth asking.

## Base Repo
- `/var/www/html/project-asum/epics-development`
- Remote: `ssh://git@code.ifg-life.id:7999/iaso/epics-portal.git`

## Feature Branches (candidates for base)
- `feature/components`
- `feature/product-config`
- `feature/case-management`
- `feature/master-product-config`
- `feature/new-business`

## Workflow

### Step 1: Detect Base Branch
When user says "bikin worktree for `<branch-name>`":
```bash
cd /var/www/html/project-asum/epics-development
git fetch origin
```

For each candidate feature branch, check:
```bash
git merge-base --is-ancestor origin/<feature-branch> origin/<branch-name>
```
→ If true, that feature branch is the base.
→ If no match, ask user with candidates.

### Step 2: Suggest Path
Auto-generate path: `/var/www/html/project-asum/<branch-name>`
Present to user for confirmation.

### Step 3: Create Worktree
```bash
cd /var/www/html/project-asum/epics-development
git worktree add -b <branch-name> /var/www/html/project-asum/<branch-name> origin/<feature-branch>
```

### Step 4: Confirm
Report to user:
- Worktree path
- Base branch
- Current branch status
- How to switch to it
