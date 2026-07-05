# context-scout

Use this skill before modifying code.

## Goal

Find only the relevant context needed for the task.

## Rules

- Do not read the whole repository.
- Search by component name, function name, hook name, route name, or error symbol.
- Prefer nearby files before global search.
- Inspect usage sites before changing shared code.
- Stop reading when enough context is found.
- Summarize the relevant context before editing.

## Output

Provide:
- relevant files found
- why each file matters
- what should be edited
- what should not be touched