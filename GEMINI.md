# bychoi workspace Antigravity/Gemini 지침 어댑터

이 파일은 Antigravity 및 Gemini 3.6 Flash 모델 환경에서 bychoi workspace용 지침 체계를 일관된 기준으로 참조하기 위한 어댑터입니다. 공통 원칙과 세부 규칙은 아래 지정된 파일에서 통합 관리됩니다.

## 📌 해석 및 적용 규칙 (Precedence Protocol)
1. **단일 진실 공급원 (SSOT)**: 공통 시스템 룰은 `@./AGENTS.md`에서만 정의하며, 각 기능별 세부 지침은 각 스킬의 `SKILL.md`에서 관리합니다.
2. **규칙 적용 순서**: 작업 특성에 맞는 세부 `SKILL.md` 지침이 루트 `AGENTS.md`보다 우선 적용되며, 두 지침이 지정되지 않은 일반 상황에서는 `AGENTS.md` 대원칙을 준수합니다.
3. **`SKILL.md` frontmatter 해석**: `---` 형식의 frontmatter (name, description)는 스킬 식별 및 자동 맥락 매칭용 메타데이터이며, 실제 에이전트 수행 지침은 본문을 엄격히 따릅니다.
4. **절대적 원본 유지**: `@` 경로를 통한 싱크 구조를 유지하여 중복 선언으로 인한 규칙 이탈을 방지합니다.

## 🌐 공통 시스템 룰
@./AGENTS.md

## 🛠️ 전문 작업별 스킬 지침
@./.agents/skills/lf-editor-engine/SKILL.md

@./.agents/skills/lf-editor-ui-components/SKILL.md

@./.agents/skills/lf-editor-browser-verification/SKILL.md

@./.agents/skills/lf-editor-flowchart/SKILL.md

@./.agents/skills/lf-editor-safety-process/SKILL.md

