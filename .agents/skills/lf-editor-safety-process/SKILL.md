---
name: lf-editor-safety-process
description: Use before risky LF Editor changes, broad refactors, metadata.json edits or merges, rollback-sensitive work, GitHub main deployment, folder moves, deletes, architecture changes, verification planning, anti-pattern checks, or post-work reporting.
---

# LF Editor Safety Process

## Five-Step Flow
1. Ponder: identify the requested outcome and possible system impact.
2. Analyze: inspect existing code and data before editing.
3. Design: fix scope and method; get approval for broad or destructive changes.
4. Execute: change only the designed scope.
5. Verify: check browser/console or the smallest reliable substitute.

## Data And Git Safety
- Do not flatten folders or move/delete subfolders without explicit user approval.
- Do not delete or overwrite shared metadata such as `data/metadata.json`.
- During conflicts, manually merge `metadata.json` `screens` arrays. Never blindly overwrite them.
- Do not push to GitHub `main` unless local verification is complete and the user requested deployment.
- Do not revert user changes. If existing changes affect the task, work with them or ask.

## Code Integrity
- Preserve function declarations, class definitions, global initialization, and module-call names such as `window.updateProperties`.
- In core engine edits, check cross-file function-name consistency before finishing.
- For SVG shapes such as diamonds and triangles, keep `borderColor`, SVG `stroke`, and 1.6px stroke standards synchronized.

## Verification And Reporting
- Define success criteria before editing.
- Report changed files and verification steps after finishing.
- If final verification finds a new SyntaxError, TypeError, or 404, stop and report before continuing.
