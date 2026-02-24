# Autone Design System 2.0

Reference for the [Autone Design System (Figma)](https://www.figma.com/design/V9kSoKdOVw6dmxJjIEuwal/NEW-Autone---Design-System-2.0?node-id=12025-33585). Use these tokens and patterns for **all** UI components in this project.

---

## Typeface

- **Primary:** Neue Montreal (Pangram Pangram). For web prototype, fallback to **Inter** if Neue Montreal is not loaded.
- **Weights:** Regular (400), Medium (500), Bold (700), Light (300 for accents).

---

## Typography scale

Use these semantic roles and sizes. Line height is 100% (1.0) unless noted.

| Role | Size | Weight | Usage |
|------|------|--------|--------|
| **H1** | 48px | Medium / Bold | Headline 1 |
| **H2** | 40px | Medium / Bold | Headline 2 |
| **H3** | 32px | Medium / Bold | Headline 3 |
| **H4** | 28px | Medium / Bold | Headline 4 |
| **H5** | 24px | Bold | Headline 5 |
| **H6** | 18px | Medium / Bold | Headline 6 |
| **B1** | 16px | Regular / Medium / Bold | Body 1 |
| **B2** | 14px | Regular / Medium / Bold | Body 2 |
| **B3** | 12px | Regular / Medium / Bold | Body 3 |
| **B4** | 10px | Regular | Body 4 (small) |
| **L1** | 16px | Medium | Label 1 |
| **L2** | 14px | Medium | Label 2 |
| **L3** | 12px | Medium | Label 3 |

---

## Colors

### Semantic / Figma variables

| Token | Hex | Use |
|-------|-----|-----|
| **Surface dark** | `#12171e` | Dark backgrounds (e.g. sidebar) |
| **Monotone black** | `#00050a` | Primary text on light |
| **Neutral 900** | `#101C2D` | Headings, primary text |
| **Neutral 700** | `#2F3A4C` | Subheadings, secondary headings |
| **Base 900** | `#212b36` | Strong text |
| **Base 800** | `#4b535c` | Body, secondary text |
| **Base 400** | `#bbb` | Placeholder, muted |
| **Base 300** | `#dfe0e2` | Dividers, disabled |
| **Neutral 200** | `#DDE4EE` | Borders |
| **Neutral 100** | `#F1F4F9` | Light surfaces |
| **Base 100** | `#f8f8f8` | Input/surface background |
| **Monotone white** | `#ffffff` | Cards, main background |

Use these in Tailwind via the theme (e.g. `text-[#101C2D]`, or the custom classes defined in `src/index.css`).

---

## Border radius

- **Small (s):** 4px — chips, small controls, cards.
- Use 8px, 10px, 14px for larger components (buttons, panels) as in existing Figma frames.

---

## Spacing

- Use 4, 8, 12, 14, 16, 24, 32, 40, 48px consistently.
- Section gaps: 24px, 32px. Tight grouping: 8px, 14px.

---

## Applying in code

1. **Tailwind:** Use the theme variables and utilities from `src/index.css` (e.g. `font-autone`, `text-heading-1`, `text-base-800`).
2. **Headings:** Prefer semantic tags (`h1`–`h6`) with the corresponding heading classes.
3. **Body/labels:** Use B1–B4 and L1–L3 classes for body text and labels.
4. **Colors:** Prefer design-system color tokens over arbitrary hex values.

When in doubt, match the [Figma design system file](https://www.figma.com/design/V9kSoKdOVw6dmxJjIEuwal/NEW-Autone---Design-System-2.0?node-id=12025-33585).
