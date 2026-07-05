# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Code Convention

- **Location:** ~/convention/code-convention.md
- **Scope:** ASUM FE — Next.js, TypeScript, Jest, Tailwind
- **Wajib dicek sebelum review PR:**
  - Module Architecture (component/container/hook split)
  - JSDoc mandatory on public funcs, format `@param {Type} name - desc`
  - No `useState`/`useEffect` in `.component.tsx`
  - Event Handler: `onClick={handle}` not `onClick={() => handle()}`
  - Private funcs: `_` prefix
  - Constants: `UPPER_SNAKE_CASE`
  - Boolean vars: `is`, `has`, `can`, `should` prefix
  - Arrays: plural form
  - Test naming: `should + expected behavior`

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Related

- [Agent workspace](/concepts/agent-workspace)

## SSH Hosts

- `jimmy-vps` → 103.93.161.116, user: jimmy-bot, key: ~/.ssh/jimmy-openclaw.pem

