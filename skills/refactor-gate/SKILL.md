# refactor-gate

Use this skill before doing any refactor.

## Goal

Decide whether refactor is actually needed.

## Rules

- If the user only asks to fix an error, do not refactor.
- If readability improves with a small extraction, allow it.
- If refactor changes behavior, stop and explain.
- If many files are affected, ask for explicit approval.
- Prefer local refactor over architectural changes.

## Allowed Refactors

- Extract variable.
- Extract small helper.
- Remove nested ternary.
- Simplify duplicated condition.
- Improve type clarity.

## Avoid

- Changing folder structure.
- Rewriting components from scratch.
- Replacing libraries.
- Renaming shared APIs.