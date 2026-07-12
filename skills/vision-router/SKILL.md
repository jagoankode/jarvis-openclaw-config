# vision-router — Image Routing & Model Selection

Use when user provides an image, screenshot, UI mockup, browser screenshot, terminal screenshot, or error screenshot.

## Goal

Classify image type → select cheapest adequate vision model → analyze → recommend next action.

## Available Vision Models

| Model | Cost | Best For |
|-------|------|----------|
| 🆓 `mimo-v2-omni` | **$0** / $0 | Fast preview, simple UI screenshots, terminal errors, quick glance |
| 💰 `mimo-v2.5` | $0.4 / $2 | Complex UI mockups, dense diagrams, multi-step visual analysis |

## Decision Matrix

| Condition | Use Model | Why |
|-----------|-----------|-----|
| Simple error screenshot, short terminal output | `mimo-v2-omni` | Free, enough to read error text |
| UI screenshot / mockup with few elements | `mimo-v2-omni` | Free, light analysis |
| Dense UI with many components, nested layout | `mimo-v2.5` | Better at detail |
| Figma design reference → frontend code | `mimo-v2.5` | Needs precision |
| Multiple images, comparison | `mimo-v2.5` | Richer multimodal |
| User says "detail", "jelas", "analisa dalam" | `mimo-v2.5` | Heavy task |

Always default to **mimo-v2-omni ($0)** first. Upgrade to mimo-v2.5 only when the image is complex enough to warrant it.

## Usage

When analyzing an image, call the `image` tool with the `model` parameter:

```
image(image="<path_or_url>", model="opencode-go/mimo-v2-omni")
```

## Output Format

```
Image type: [error/UI mockup/bug/design reference/diagram]
Model used: mimo-v2-omni / mimo-v2.5
Extracted text: (if any)
Detail: (2-3 bullet concise)
Recommended action: (fix / implement / describe / ask clarification)
```
