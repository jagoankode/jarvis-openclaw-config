# diff-guardian

Use this skill before finalizing code changes.

## Goal

Ensure the diff is minimal, safe, and related to the task.

## Checklist

- No unrelated file changes.
- No unnecessary formatting changes.
- No public API rename unless requested.
- No business logic change unless required.
- No new dependency unless approved.
- No large refactor for a small bug.
- Existing behavior is preserved.

## Output

Summarize:
- files changed
- reason for each change
- risk level
- tests or checks to run