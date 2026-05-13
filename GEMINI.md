# LF Editor Studio Antigravity/Gemini 지침 어댑터

이 파일은 Antigravity/Gemini 작업에서도 Codex용 지침 체계를 같은 기준으로 참조하기 위한 얇은 어댑터입니다. 공통 원칙과 세부 규칙은 아래 파일에서 가져옵니다.

## 해석 규칙
- Codex 전용 `$skill-name` 문법은 Gemini의 자동 호출 개념이 아니므로, 아래에서 import되는 각 `SKILL.md`를 작업별 세부 규칙 섹션으로 해석한다.
- `SKILL.md`의 `---` frontmatter는 skill 식별 메타데이터로만 보고, 실제 작업 규칙은 본문을 따른다.
- 규칙이 충돌하면 더 구체적인 imported skill 규칙이 루트 `AGENTS.md`보다 우선한다.
- 아래 `@` import 경로는 중복 복사를 피하기 위한 단일 출처이다. 규칙을 바꿀 때는 원본 파일을 수정한다.

## 공통 지침
@./AGENTS.md

## 세부 작업 규칙
@./.agents/skills/lf-editor-engine/SKILL.md

@./.agents/skills/lf-editor-ui-components/SKILL.md

@./.agents/skills/lf-editor-browser-verification/SKILL.md

@./.agents/skills/lf-editor-flowchart/SKILL.md

@./.agents/skills/lf-editor-safety-process/SKILL.md
