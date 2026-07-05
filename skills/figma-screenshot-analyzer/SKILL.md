# figma-screenshot-analyzer

Use this skill when converting a Figma screenshot, UI mockup, or design image into frontend code.

## Goal

Analyze the screenshot and implement the matching UI using the existing frontend stack and project conventions.

## Workflow

1. Identify the screen or component type.
2. Extract visible UI requirements.
3. Break the design into component hierarchy.
4. Search the repository for similar existing components.
5. Reuse existing components, hooks, and styling patterns.
6. Implement the smallest matching UI.
7. Review the diff for unrelated changes.

## Visual Analysis

Extract:

- Main container structure
- Text content
- Buttons
- Inputs
- Icons
- Cards
- Lists
- Tables
- Empty states
- Loading states
- Error states
- Spacing and alignment
- Typography hierarchy
- Color usage
- Border radius
- Shadows
- Responsive behavior if visible

## Rules

- Use the screenshot as visual guidance, not as permission to rewrite the app.
- Do not implement invisible features.
- Do not guess unclear copy.
- Do not add business logic unless required.
- Prefer existing project components.
- Prefer existing Tailwind/token conventions.
- Avoid unnecessary abstraction.
- Keep code readable.
- Keep changes minimal.
- Preserve existing behavior.

## Before Editing

Output a compact plan:

- Screenshot type
- Components needed
- Existing files likely related
- New files needed, if any
- Risk level

## While Editing

- Inspect existing patterns before creating new components.
- Match naming conventions.
- Match import style.
- Match component structure.
- Use explicit TypeScript types.
- Avoid `any`.
- Avoid nested ternary.
- Avoid unrelated formatting changes.

## After Editing

Output:

- Files changed
- What UI was implemented
- Assumptions made
- Possible differences from the screenshot
- Suggested checks