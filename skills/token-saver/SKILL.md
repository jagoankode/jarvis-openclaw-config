# token-saver

Use this skill when working with limited context or expensive models.

## Rules

- Read only files directly related to the task.
- Prefer grep/search over opening full files.
- Do not paste full files unless necessary.
- Summarize large files instead of loading everything.
- Avoid repeating previous context.
- Make small diffs.
- Stop after solving the requested problem.

## Escalation

Only read more files if:
- the first fix is risky
- the symbol is shared
- tests fail
- behavior is unclear