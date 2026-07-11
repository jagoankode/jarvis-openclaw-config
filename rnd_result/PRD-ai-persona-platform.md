# 📄 PRD: Multi-Agent Persona Platform (MAP)
**Codename:** "Crew" atau "Koloni"
**Status:** Draft v1
**Tanggal:** 10 Juli 2026

---

## 1. 🎯 Vision

Platform yang memungkinkan user **membangun virtual company** — bikin AI persona dengan skill dan personality, atur hierarchy & direct report, lalu mereka saling berkolaborasi otomatis kayak tim karyawan sungguhan.

**Motto:** *Build your dream team. Zero hires.*

---

## 2. 🧩 Core Concepts

### Persona
Unit dasar dari platform. Sebuah AI agent dengan identitas lengkap:
- **Nama** — Misal: "Budi", "Alex", "Sarah"
- **Role / Jabatan** — "Senior Engineer", "Content Writer", "Project Manager"
- **Personality** — Tone of voice, decision style (detail-oriented, risk-averse, creative)
- **Skills** — Daftar kemampuan yang bisa dipanggil
- **Model** — DeepSeek V4 Flash (default), V4 Pro (opsional)
- **Tools** — MCP servers yang bisa diakses

### Hierarchy
Struktur organisasi antar persona:
```
CEO AI
├── CTO AI
│   ├── Frontend Dev AI
│   ├── Backend Dev AI
│   └── DevOps AI
├── CMO AI
│   ├── Content Writer AI
│   └── Social Media AI
└── CFO AI
```
- Setiap persona punya `manager_id` (nullable — CEO ga punya manager)
- Workflow routing berdasarkan hierarchy: task dikasih ke manager → di-breakdown ke staff
- Approval chain: staff → manager → director

### Skill System
Blok bangunan kemampuan persona. Setiap skill adalah:

```typescript
interface Skill {
  id: string;
  name: string;          // "code-review", "content-write", "data-analyze"
  label: string;         // "Code Review", "Content Writing"
  description: string;
  prompt: string;        // System prompt untuk skill ini
  tools: Tool[];         // MCP tools yang dibutuhkan
  model: 'flash' | 'pro'; // Default model
}
```

### Task / Assignment
Unit kerja yang dikasih ke persona:
- **Task** → masalah/pekerjaan yang perlu diselesaikan
- Task bisa dipecah oleh Manager AI ke subordinate
- Setiap task punya status: `pending → in_progress → review → done`
- Multi-persona collaboration: task bisa melibatkan >1 persona secara paralel

---

## 3. 👤 User Flows

### Flow A: Setup Perusahaan
```
1. Register / Login
2. Create "Organization" (nama perusahaan virtual)
3. Define initial team structure:
   a. Create CEO persona (nama, personality, skills)
   b. Add CTO persona → assign as direct_report ke CEO
   c. Add Engineer persona → assign as direct_report ke CTO
   d. Repeat buat semua role
4. System ready → user kasih task ke CEO
```

### Flow B: Daily Operation
```
1. User submit task: "Bikin landing page company"
2. Task masuk ke CEO AI → CEO breakdown:
   - "Desain UI" → Frontend Dev
   - "Setup API" → Backend Dev
   - "Deploy infra" → DevOps
3. Masing-masing persona kerja
4. Hasil direview oleh CTO
5. CTO report ke CEO → CEO present ke user
```

### Flow C: Custom Persona
```
1. User klik "Buat Persona Baru"
2. Isi: Nama, Role, Personality (free text atau pilih template)
3. Attach skills: centang dari skill library
4. Pilih model: Flash (irit) / Pro (pintar)
5. Tentukan posisi di hierarchy (report ke siapa)
6. Persona siap dipakai
```

---

## 4. 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Next.js)              │
│  Dashboard │ Org Chart │ Persona Creator │ Chat    │
└──────────────────────┬──────────────────────────┘
                       │ API
┌──────────────────────▼──────────────────────────┐
│                Backend API Layer                  │
│  Auth │ Org │ Persona │ Skill │ Task │ Workflow   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│             Orchestration Engine                  │
│                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │Router AI│  │Task AI │  │Review AI│          │
│  │(break-  │  │(exec   │  │(quality │          │
│  │ down)   │  │task)   │  │check)   │          │
│  └─────────┘  └─────────┘  └─────────┘          │
│                                                   │
│  Agent-to-Agent Communication Protocol            │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              AI Model Gateway                     │
│                                                   │
│  ┌─────────────────────┐                         │
│  │  DeepSeek V4 Flash   │ ← Default (irit)      │
│  │  DeepSeek V4 Pro     │ ← Opsional (pintar)   │
│  └─────────────────────┘                         │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              MCP Tool Servers                     │
│                                                   │
│  ├─ Coding (GitHub, GitLab)                       │
│  ├─ Writing (Notion, Google Docs)                 │
│  ├─ Research (Web Search, Browser)                │
│  ├─ Design (Figma API, Image Gen)                 │
│  ├─ Data (Spreadsheet, Database)                  │
│  └─ Communication (Slack, Email)                  │
└─────────────────────────────────────────────────┘
```

### Key Components:

1. **Orchestration Engine** (Core Logic)
   - **Router AI** — Menerima task dari user, breakdown ke persona yang relevan berdasarkan hierarchy & skill match
   - **Task Executor** — Mengeksekusi task via AI model, handle context passing antar persona
   - **Review AI** — Quality control, verify hasil sebelum dikirim ke user
   - **Agent-to-Agent Protocol** — Standar komunikasi antar persona (message passing, context sharing)

2. **AI Model Gateway**
   - **DeepSeek V4 Flash** → Default buat semua persona (irit, cepet)
   - **DeepSeek V4 Pro** → Heavy tasks (coding complex, deep analysis)
   - Load balancing & retry logic
   - Token usage tracking & budgeting

3. **MCP Tool Servers**
   - Standar MCP protocol (Model Context Protocol)
   - Setiap skill punya tools masing-masing
   - User bisa register custom MCP tools

### Data Models (Simplified)

```typescript
interface Organization {
  id: string;
  name: string;
  ownerId: string;
  personas: Persona[];
  createdAt: Date;
}

interface Persona {
  id: string;
  orgId: string;
  name: string;
  role: string;
  personality: string;      // Free text personality description
  model: 'flash' | 'pro';
  skills: Skill[];
  managerId: string | null; // null = CEO
  subordinates: string[];   // list of persona IDs
  systemPrompt: string;     // Generated from name+role+personality+skills
  createdAt: Date;
}

interface Skill {
  id: string;
  name: string;
  label: string;
  description: string;
  promptTemplate: string;    // System prompt untuk skill ini
  tools: string[];           // Nama MCP tools yang dibutuhkan
  category: 'engineering' | 'marketing' | 'support' | 'finance' | 'general';
}

interface Task {
  id: string;
  orgId: string;
  title: string;
  description: string;
  assignedTo: string;       // Persona ID
  parentTaskId: string | null; // Jika sub-task
  status: 'pending' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subtasks: Task[];          // Breakdown tasks
  conversation: Message[];   // Agent-to-agent conversation log
  result: string | null;
  tokenCost: number;         // Total token usage
  modelUsed: 'flash' | 'pro';
  createdAt: Date;
  completedAt: Date | null;
}

interface Message {
  from: string;   // Persona ID
  to: string;     // Persona ID
  content: string;
  type: 'task' | 'review' | 'question' | 'update' | 'approval';
  timestamp: Date;
}
```

---

## 5. 🛠️ Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 14+ (App Router) | Sama kayak ASUM |
| **UI** | Tailwind CSS + Shadcn/ui | Familiar |
| **State** | React Query + Zustand | Untuk API & client state |
| **Backend API** | Next.js API Routes / tRPC | Atau Express sendiri |
| **Database** | PostgreSQL (via Prisma) | Complex relations |
| **Queue** | BullMQ / Redis | Task queue & agent comms |
| **AI Gateway** | Custom (OpenAI-compatible SDK) | DeepSeek API format |
| **MCP** | MCP Protocol (Anthropic std) | Tool integration |
| **Auth** | NextAuth.js / Clerk | Autentikasi |
| **Deploy** | Vercel / Docker | Tergantung scale |

---

## 6. 💰 Pricing Strategy

### Freemium Model:
| Tier | Price | Limit |
|------|-------|-------|
| **Free** | $0 | 3 persona, 50 tasks/bulan, Flash only |
| **Starter** | $19/bulan | 10 persona, 500 tasks, Flash+Pro |
| **Pro** | $79/bulan | 50 persona, 5000 tasks, hierarchy, custom tools |
| **Enterprise** | Custom | Unlimited, dedicated infra, custom MCP |

### Cost Breakdown (per user):
| Komponen | Cost/Month |
|----------|-----------|
| DeepSeek Flash (avg 100 tasks/hari × $0.05) | ~$150 |
| DeepSeek Pro (avg 20 tasks/hari × $0.10) | ~$60 |
| Infra (DB, API, Redis) | ~$50 |
| **Total/user** | **~$260** |
| **Revenue/user** (Pro tier) | **$79** |

> **Catatan:** Margin tipis di awal. Scaling diperlukan: rate limiting, caching, batch processing. Model pricing ke depan bisa lebih murah.

---

## 7. 🚀 Execution Plan

### Phase 1: MVP (4-6 minggu)
- ✅ Basic auth & org creation
- ✅ Create persona (name, role, personality, skills)
- ✅ Hierarchy setup (manager → subordinate)
- ✅ Single persona task execution (DeepSeek V4 Flash)
- ✅ Basic chat interface (user → persona)
- ✅ Minimal UI (dashboard + org chart)

### Phase 2: Collaboration (4-6 minggu)
- ✅ Task breakdown (persona → subordinate auto-routing)
- ✅ Agent-to-agent communication
- ✅ Multi-persona task execution
- ✅ Review & approval workflow
- ✅ Conversation log & audit trail
- ✅ Skill library (pre-built skills)

### Phase 3: Enterprise (8-12 minggu)
- ✅ DeepSeek V4 Pro integration
- ✅ MCP tool integration
- ✅ Custom skill creator
- ✅ Template persona marketplace
- ✅ Token usage dashboard
- ✅ Subscription & billing

### Phase 4: Scale (ongoing)
- ✅ Advanced hierarchy (matrix org, project-based teams)
- ✅ External API integration (Slack, Notion, GitHub)
- ✅ Analytics & insights
- ✅ Team cloning (copy org structure)
- ✅ Persona export/import

---

## 8. ⚠️ Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| **Token cost unpredictability** | Hard limit per task, alert when approaching budget |
| **Agent hallucination** | Review AI layer, confirmation before execution |
| **DeepSeek API deprecation** | OpenAI-compatible SDK → swap provider seamless |
| **Complex hierarchy confusion** | Auto-validate org chart (no circular reference) |
| **Low margin** | Scale users, optimize prompt length, batch requests |
| **User trust** | Transparency: show exactly what AI did & token cost |

---

## 9. 🔑 Key Differentiators

Apa yang bikin platform ini beda dari OpenClaw / Claude Agents / lainnya:

| Fitur | MAP Platform | OpenClaw | Claude Agents |
|-------|-------------|----------|---------------|
| **Persona builder** | ✅ Full custom | ❌ Fixed agents | ❌ Template |
| **Hierarchy** | ✅ N-level org chart | ❌ Flat | ❌ Flat |
| **Auto breakdown** | ✅ Manager → staff | ❌ Manual | ⚠️ Limited |
| **DeepSeek first** | ✅ Default | ❌ Claude/GPT | ❌ Claude only |
| **MCP tools** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Cost optimized** | ✅ Flash default | ❌ Mahal | ❌ Mahal |
| **Marketplace** | ✅ Persona templates | ⚠️ ClawHub | ❌ |

---

**Next steps:** Kalo setuju sama PRD ini, gue bisa:
1. Breakdown Phase 1 ke task-level execution plan
2. Bikin UI mockup / component tree
3. Setup project structure (Next.js + Prisma + API routes)
4. Atau langsung coding? 🧪

Mau proceed ke mana Bos?
