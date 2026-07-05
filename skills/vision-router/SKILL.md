# vision-router

Use this skill when the user provides an image, screenshot, UI mockup, browser screenshot, terminal screenshot, or error screenshot.

## Goal

Decide how the image should be handled before coding.

## Rules

- If the image contains error text, use OCR-style extraction first.
- If the image shows UI, describe layout, component structure, spacing, state, and possible implementation approach.
- If the image shows a bug, identify the visible issue and map it to likely code areas.
- If the image is a design reference, convert it into frontend implementation requirements.
- Do not guess text that is unreadable.
- Ask for a clearer screenshot only if the important content cannot be read.
- Prefer concise visual analysis before editing code.

## Output

Provide:
- image type
- visible important details
- extracted text if available
- likely task category
- recommended coding approach