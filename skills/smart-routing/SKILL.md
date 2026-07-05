---
name: "smart-routing"
description: "Auto-selects optimal model per task complexity (ringan/sedang/berat) using session model override."
---

# Smart Routing — Auto Model Selection

Automatically evaluates task complexity and switches to the most appropriate model for each request. Ensures fast responses for simple tasks and powerful reasoning for complex ones without manual intervention.

## Model Tier Definitions

Using the user's configured OpenCode Go / DeepSeek provider:

| Tier | Use Case | Model | Why |
|------|----------|-------|-----|
| **Light 🟢** | Casual chat, quick Q&A, simple searches, small edits, greetings | `deepseek-v4-flash` | Fastest, cheapest, overkill-proof |
| **Medium 🟡** | Code review, normal coding, documentation, intermediate analysis | `deepseek-v4-flash` (with reasoning on) | Flash with reasoning handles most tasks well; sufficient for medium work |
| **Heavy 🔴** | Complex refactoring, deep debugging, large-scale architecture, multi-step reasoning, research | `deepseek-v4-pro` | Full reasoning power, best for complex tasks |

## Decision Matrix

When the user sends a request, evaluate:

**Task is LIGHT if:**
- Simple factual question
- Greeting / small talk
- Quick file read / status check
- One-liner command or script
- "What is..." / "Siapa..." / generic chat

**Task is MEDIUM if:**
- Code review or debugging (not deeply complex)
- Writing documentation or specs
- Refactoring a single file
- Multi-step but well-defined task
- Analysis of small-to-medium codebase

**Task is HEAVY if:**
- Complex debugging spanning multiple files
- Architecture decisions
- Large-scale refactoring
- Research / deep analysis
- Tasks requiring long reasoning chains
- User explicitly asks for "deep" or "heavy" analysis
- User mentions complex project structure

## Switching Models

Use `session_status` tool with `model` parameter to switch:

```markdown
# Switch to heavy model
session_status(model="opencode-go/deepseek-v4-flash")  -- light/medium actually can use same flash
# OR if user needs v4-pro
session_status(model="opencode-go/deepseek-v4-pro")
```

Actually, since both are available through OpenCode Go and the subscription is flat-rate, the primary distinction is:

- `opencode-go/deepseek-v4-flash` → default for most tasks (fast + reasoning when needed)
- `opencode-go/deepseek-v4-pro` → explicitly switch for deep/heavy tasks only

When user specifically asks for complex work, suggest switching to `deepseek-v4-pro` and explain the reasoning choice.

## Notes

- Reset to default model after heavy task completion: `session_status(model="default")`
- If the user asks about models or routing, explain the current tier assignment
- Don't overthink the classification — err on the side of light/medium
- The goal is **transparent optimization**, not ceremony
