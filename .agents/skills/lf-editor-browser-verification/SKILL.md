---
name: lf-editor-browser-verification
description: Use when verifying LF Editor in a browser, opening viewer.html, checking file protocol URLs, preserving project and file query parameters, inspecting console errors, testing screen add, save all, sidebar toggle, cache refresh, or post-change UI behavior.
---

# LF Editor Browser Verification

## URL Rules
- Verify with `file:///` absolute paths only. Do not use `localhost` or `127.0.0.1`.
- Use URLs shaped like `file:///C:/ai-work/viewer.html?project=p_x028c&file=00_Cover_7528.html`.
- Keep both `project` and `file` query parameters when validating screen loading.

## Verification Targets
- After engine, UI, rollback, large CSS, or design-system changes, verify at least:
  - screen add (`+`)
  - save all
  - sidebar toggle
  - absence of new console errors
- After engine file changes, perform a hard refresh (`Ctrl+Shift+R`) or equivalent cache-busting reload before judging behavior.

## Error Policy
- Treat new `SyntaxError`, `TypeError`, and 404s as blocking verification failures.
- If verification fails, stop and report the exact error, touched files, and the likely rollback or fix path.
- Do not claim browser verification if only static inspection was performed.
