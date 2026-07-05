# error-triage

Use this skill when handling runtime, build, ESLint, TypeScript, or test errors.

## Steps

1. Identify the exact error.
2. Locate the source symbol or file.
3. Determine whether it is:
  - syntax issue
  - type issue
  - dependency issue
  - runtime data issue
  - test/mock issue
  - config issue
4. Propose the smallest fix.
5. Check for similar patterns in the repo.

## Rules

- Do not guess without tracing the error.
- Do not rewrite unrelated code.
- Prefer fixing root cause over silencing the error.