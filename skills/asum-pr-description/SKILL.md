---
name: "asum-pr-description"
description: "Generate ASUM PR description: extract ticket, template, format."
---

# asum-pr-description — PR Description Generator

## Description
Generate PR description untuk ASUM `epics-portal` sesuai template standar. Mengekstrak ticket ID, module, dan tipe dari branch name atau commit history.

## Alur Eksekusi

### Step 1: Identifikasi Branch Type

| Branch pattern | Sumber ticket ID | Target PR |
|---------------|-----------------|-----------|
| `feat/IIAU-xxx-*`, `fix/IIAU-xxx-*`, `refactor/IIAU-xxx-*`, `chore/IIAU-xxx-*` | **Branch name** — tunggal (`IIAU-` + 3+ digit) | `feature/*` |
| `feature/*` | **Commit messages** — bisa lebih dari satu | `development` |

### Step 2: Extract Info

**Dari branch name (tunggal):**
- `refactor/IIAU-344-implement-caseadmin-redesign`
- → Ticket: `IIAU-344`
- → Type: `refactor`
- → Short desc: dari konteks module

**Dari feature branch (multi-ticket):**
- Jalanin: `git log --oneline feature/product-config ^development`
- Kumpulin semua `IIAU-xxx` dari commit messages
- Kalo 1-2 ticket → sebutin di title
- Kalo banyak → pake "bulk" di title

### Step 3: Generate Link Ticket

```
https://ifg-life.atlassian.net/browse/IIAU-344
```

Format di markdown:
```md
__[IIAU-344](https://ifg-life.atlassian.net/browse/IIAU-344)__
```

### Step 4: Generate Title (Conventional Commit)

```
[type]([module]):[IIAU-xxx] [short description]
```

Contoh:
- Tunggal: `refactor(case-admin):[IIAU-344] implement CaseAdmin redesign`
- Multi (1-2): `feat(product-config):[IIAU-100][IIAU-200] formula & cost component`
- Multi (banyak): `feat(product-config): bulk implementation product configuration`

### Step 5: Isi Template

```
## Title
[type]([module]):[IIAU-xxx] [short description]

Link Ticket: __[IIAU-xxx](https://ifg-life.atlassian.net/browse/IIAU-xxx)__

📌 **Summary:**
[1-2 kalimat garis besar perubahan]

🎯 **Purpose / Background:**
[kenapa perlu dilakukan]

🛠️ **Key Changes:**
- [list perubahan per file/module]

📸 **Screenshots:**
[before/after — kalo ada UI change]
```

### Step 6: Language
Gunakan **English** — standar ASUM.

### Step 7: Kirim Draft ke Bos
```
"Ini draft PR description-nya, ada yg perlu dikoreksi?"
```
**Jangan auto commit & push.** Tunggu approval dari Bos, baru eksekusi.

## Contoh Lengkap

### Single Ticket (dari branch name)
```
## Title
refactor(case-admin):[IIAU-344] implement CaseAdmin redesign

Link Ticket: __[IIAU-344](https://ifg-life.atlassian.net/browse/IIAU-344)__

📌 **Summary:**
Redesign CaseAdmin page with new layout and improved data fetching.

🎯 **Purpose / Background:**
Current CaseAdmin page uses legacy table component that is hard to maintain.

🛠️ **Key Changes:**
- Replace table with new React Table v8
- Add search & filter functionality
- Optimize RTK Query cache strategy

📸 **Screenshots:**
N/A (internal logic change)
```

### Multi Ticket (dari feature branch)
```
## Title
feat(product-config): bulk implementation product configuration

Link Ticket:
__[IIAU-100](https://ifg-life.atlassian.net/browse/IIAU-100)__ |
__[IIAU-200](https://ifg-life.atlassian.net/browse/IIAU-200)__

📌 **Summary:**
Implement formula rate module and cost component management.

🎯 **Purpose / Background:**
Product Configuration requires these components for policy creation.

🛠️ **Key Changes:**
- IIAU-100: implement formula rate with validation rules
- IIAU-200: add cost component CRUD with approval workflow

📸 **Screenshots:**
[attach screenshots]
```
