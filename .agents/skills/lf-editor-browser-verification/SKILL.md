---
name: lf-editor-browser-verification
description: Use when verifying LF Editor in a browser, opening viewer.html, checking file protocol URLs, preserving project and file query parameters, inspecting console errors, testing screen add, save all, sidebar toggle, cache refresh, or post-change UI behavior.
---

# LF Editor Code & System Verification Policy

> [!CAUTION]
> **[브라우저 직접 검증 금지 원칙]**
> 사용자의 작업 속도 및 리소스 보호 요청에 따라 에이전트가 브라우저 자동화 도구를 실행하여 직접 검증하는 것은 원천 금지되어 있습니다. 
> 모든 기능 검증은 **정밀 소스코드 심층 분석, 브래킷/구문 검사(`check_syntax.ps1`), 및 사용자 피드백 절차**를 통해 완료해야 합니다.

## Static Verification Standards
- **Syntax & Bracket Integrity**: `check_syntax.ps1` 또는 AST/괄호 검사를 시행하여 `SyntaxError`, `ReferenceError` 연쇄 장애를 100% 방지합니다.
- **Event Flow Non-Blocking Check**: `mouseup` / `mousemove` 리스너 내 조기 종료(`return;`) 남용으로 하위 상태 해제(`LF_MARQUEE_END`)가 차단되지 않는지 이벤트 루프를 검증합니다.
- **Module Boundary & SSOT Consistency**: `metadata.json` 스펙 및 `MessageHub` 통신 규격이 일치하는지 정적 추적합니다.

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
