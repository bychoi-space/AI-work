---
name: lf-editor-flowchart
description: Use when creating or editing LF Editor process screens, flowcharts, 1440x900 absolute-position layouts, nodes, connectors, elbow arrows, straight arrows, diamond decisions, Y/N labels, dividers, swimlane-like sections, or scroll-free process diagrams.
---

# LF Editor Flowchart

## Canvas
- Place nodes and connectors with `position: absolute` inside the 1440x900 canvas.
- Avoid browser scroll by fitting the whole process layout inside the canvas.
- Keep screen dimensions aligned with the Cover canvas size.

## Flow Semantics
- Use diamond nodes for conditional branches.
- Add separate `Y` and `N` text nodes for every conditional branch so direction is unambiguous.
- When the actor/system changes, such as LFMall, OMS/SAP, or POS, use horizontal dotted dividers to separate visual zones.

## Connector Precision
- Mix elbow connectors (`v4-connector-elbow`), straight connectors (`v4-connector-straight`), and block arrows (`v4-shape-arrow`) only when it improves readability.
- Utilize automatic port magnetic snapping (`collectSnapTargets`) and real-time anchoring (`syncAnchoredPositions`) so connectors stay pixel-precisely attached to node edges.
- Recheck connector positions after moving any node; ensure automatic follow-along logic (`syncAnchoredPositions`) keeps lines smoothly connected.

## Text
- Keep labels short and readable.
- Use `white-space: nowrap;` for branch labels, dates, and compact process tags that must stay on one line.
