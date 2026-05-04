## Overview

Framer's marketing canvas is a near-pure black artboard. The dominant surface is `{colors.canvas}` — almost pure black with a faint warmth — and on top of it sits oversized white display type set in **GT Walsheim Medium** with letter-spacing pulled to extreme negative values (-5.5px on the 110px display, -4.25px on the 85px hero). The page reads like a poster: one assertive statement per band, generous breathing room above and below.

The single accent is `{colors.accent-blue}` — used scarcely, mostly for hyperlinks, selection halos, and a subtle blue-tinted shadow ring on focused inputs. The brand chrome itself is monochrome: white pill buttons, charcoal cards, gray secondary text. What makes Framer distinctive is the rhythm break — every few sections the page drops in a **vibrant gradient atmosphere card**: a magenta-violet spotlight, a sunset-orange wash, a coral-pink panel. These aren't section backgrounds; they're individual cards arranged in a card grid, each one a small living poster that shows what Framer can produce.

Body type is **Inter Variable**, with Framer leaning hard into Inter's character variants (`cv01`, `cv05`, `cv09`, `cv11`, `ss03`, `ss07`, `dlig`) — the result is a body voice that feels custom-tuned, with single-storey "a", straight-leg "l", and tabular figures. There's no light mode on the marketing site; the brand IS dark.

**Key Characteristics:**
- Black-canvas marketing system: `{colors.canvas}` is the surface for hero, body, pricing, FAQ, and footer alike — no light interludes.
- Massive negative letter-spacing on display sizes (-5.5px / -4.25px / -3.1px) creates a poster-grade headline cadence.
- White pill (`{components.button-primary}`) is the only primary CTA shape across the site; secondary actions live as charcoal pills (`{components.button-secondary}`) or text links.
- Oversized **gradient spotlight cards** (violet, magenta, orange, coral) act as showcase tiles inside the dark grid; they are individual cards, not section backgrounds.
- Inter Variable with bespoke OpenType character variants (`cv01/05/09/11`, `ss03/ss07`, `dlig`) used everywhere body type appears — the typographic voice is unmistakable.
- Border radius scale runs from 4px utility chips up to 100px pills and full circles, with 15–20px the default for cards and 30px for atmospheric gradient cards.
- A single chromatic accent `{colors.accent-blue}` reserved for hyperlinks, focus, and selection — never decorative.

## Colors

### Brand & Accent
- **Pure White** ({colors.primary}): The brand primary surface. Every primary CTA pill, every display headline, every body line on canvas.
- **Sky Blue** ({colors.accent-blue}): The single chromatic accent. Hyperlinks, focused-input rings, and a few selection states. Never used for backgrounds or as a brand fill.

### Surface
- **Canvas** ({colors.canvas}): Default page background — near-black with a faint warmth. Footer, pricing, hero, and FAQ all sit on it.
- **Surface 1** ({colors.surface-1}): One step above canvas — pricing cards, secondary buttons, mockup tiles.
- **Surface 2** ({colors.surface-2}): Two steps above — featured pricing card, hero pill backdrop, selected pricing tab.
- **Hairline** ({colors.hairline}): 1px borders on input groups, comparison-table dividers.
- **Hairline Soft** ({colors.hairline-soft}): Subtler dividers — between FAQ rows and footer column rules.
- **Inverse Canvas** ({colors.inverse-canvas}): Pure white — used as the surface of light-on-dark pill CTAs and a small set of light-mode template thumbnails embedded in the showcase grid.

### Text
- **Ink** ({colors.ink}): All headline and emphasized body type — pure white.
- **Ink Muted** ({colors.ink-muted}): Secondary type — gray (#999999) used for meta info, footer columns, comparison-row labels, deselected pricing tabs. Hierarchy on the dark canvas is carried by ink → ink-muted contrast, not by weight changes.

### Semantic
- **Success Green** ({colors.semantic-success}): Pricing comparison-table checkmarks. Glyph fill, not surface.

### Brand Gradient (signature)
- **Gradient Magenta** ({colors.gradient-magenta}): Spotlight card variant.
- **Gradient Violet** ({colors.gradient-violet}): Spotlight card variant — most common.
- **Gradient Orange** ({colors.gradient-orange}): Spotlight card variant — sunset wash.
- **Gradient Coral** ({colors.gradient-coral}): Spotlight card variant — coral/pink.

## Typography

### Font Family
- **GT Walsheim Medium** — Framer's display typeface. Geometric, slightly humanist, very confident at large sizes with extreme negative tracking. 
- **Inter Variable** — System body typeface. OpenType variants: `cv01`, `cv05`, `cv09`, `cv11`, `ss03`, `ss07`, `dlig`.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| `{typography.display-xxl}` | 110px | 500 | 0.85 | -5.5px |
| `{typography.display-xl}` | 85px | 500 | 0.95 | -4.25px |
| `{typography.display-lg}` | 62px | 500 | 1.00 | -3.1px |
| `{typography.display-md}` | 32px | 500 | 1.13 | -1.0px |
| `{typography.headline}` | 22px | 700 | 1.20 | -0.8px |
| `{typography.body}` | 15px | 400 | 1.30 | -0.15px |
| `{typography.button}` | 14px | 500 | 1.0 | -0.14px |

## Layout

### Spacing System
- **Base unit**: 5px.
- Section padding (vertical): ~96px.

## Shapes

### Border Radius Scale
| Token | Value | Use |
|---|---|---|
| `{rounded.md}` | 10px | Form input |
| `{rounded.lg}` | 15px | Template thumbnails |
| `{rounded.xl}` | 20px | Content cards |
| `{rounded.xxl}` | 30px | Gradient spotlight cards |
| `{rounded.pill}` | 100px | CTAs |

## Components

### Buttons
- **Primary**: White pill, black text.
- **Secondary**: Charcoal pill (#1a1a1a), white text.
