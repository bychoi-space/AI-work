# Apple Design Guide (LF Editor Studio V2)

## Overview
Apple's web presence is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge product "tiles" — alternating light and dark canvases, each centered on a hero headline, a one-line tagline, two tiny blue pill CTAs, and an impossibly crisp product render. Nothing competes with the product. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

## Colors
- **Action Blue** (#0066cc): The single brand-level interactive color.
- **Pure White** (#ffffff): The dominant canvas.
- **Parchment** (#f5f5f7): The signature Apple off-white.
- **Near-Black Ink** (#1d1d1f): Headlines and body text.
- **Near-Black Tile** (#272729): Dark tile background.
- **Pure Black** (#000000): Global nav bar background.

## Typography
- **Primary Font**: SF Pro Display / Text (Fallback: Inter).
- **Body**: 17px (Apple signature pace).
- **Headline Tracking**: Negative letter-spacing (e.g., -0.28px for 56px hero) for "Apple tight" feel.
- **Weights**: 300 (rare/airy), 400 (body), 600 (headlines). 500 is absent.

## Layout & Shapes
- **Rhythm**: Alternating Tiles (White ↔ Dark).
- **Rounded**: 
  - `pill` (9999px) for Primary CTAs and Search.
  - `lg` (18px) for Utility Cards.
  - `sm` (8px) for Utility Buttons.
- **Elevation**: Exactly one drop-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) for product images only. No shadows on UI.

## Components
- **Global Nav**: Thin black bar (44px).
- **Sub-Nav**: Frosted glass effect, persistent Action Blue CTA.
- **Pill CTA**: #0066cc background, 17px text, pill shape.

## Do's and Don'ts
- **Do**: Use ONE accent color (Action Blue). Use Inter at 17px body. Use negative tracking on headlines.
- **Don't**: No decorative gradients. No shadows on UI. No weight 500.
