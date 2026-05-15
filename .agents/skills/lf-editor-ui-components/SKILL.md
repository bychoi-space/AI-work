---
name: lf-editor-ui-components
description: Use when editing V4 components, .lf-icon SVG atoms, premium buttons, modals, popups, editable cells, lf-component wrappers, delete triggers, Molecules save/load UI, typography, canvas sizing, 1.6px borders, visual component styling, or LF Editor design-system rules.
---

# LF Editor UI Components

## Component Standards
- Wrap every **'모든 오브젝트' (All Objects)** in `.lf-component` so drag and drop remains available.
- **Unified Marker Structure**: Text markers must include a `.lf-drag-handle` (drag handle), `.lf-delete-trigger` (delete), and `.v4-editable-cell` (content) inside their `.lf-component` wrapper. All markers are aligned to their **Top-Left** corner (0, 0) for consistent coordinate mapping with shapes and atoms.
- Add `contenteditable="true"` and `.v4-editable-cell` to editor-linked text regions.
- Inject `.lf-delete-trigger` (`×`) whenever users must be able to delete an object.
- Keep editor canvas/page dimensions aligned to the Cover screen size, typically 1440x900.

## Icon And Atom Rules
- Include `.lf-icon` on every icon and atom component, including SVGs.
- Use inline SVG for button icons to avoid font ligature issues.
- Use `stroke-width="1.6"` for SVG atoms unless existing context requires otherwise.
- Add `background-image: none !important;` when `.lf-icon` is applied to new SVG/custom atoms to avoid sprite interference.

## V4 Border Rule
- Keep all V4 component borders at `1.6px`.
- Use CSS `!important` where inline styles can interfere.
- Preserve or add `MutationObserver` correction only when the component can be mutated live; do not add broad observers speculatively.

## Premium Button And Popup Rules
- Match the compact JIRA-link button style: pill shape, 26-28px height, 13-14px radius, centered flex alignment, `gap: 8px`, and `padding: 0`.
- Use hierarchy classes consistently: `btn-accent` for core actions, `btn-primary` for major actions, `btn-secondary` for normal actions.
- Apply the same button standard inside modals and popups.
- In sidebars or spaces under 310px wide, prefer a two-row stacked layout over crowded one-line controls.
- **Sidebar Tab Synchronization**: 컴포넌트나 선(Connector)을 선택했을 때, 우측 사이드바가 닫혀있거나 다른 탭에 있을 수 있으므로 반드시 `window.switchSidebarTab('editor')`를 호출하여 편집기가 즉시 보이도록 보장하라.
- **Dedicated Inspector Sections**: 에디터 내의 서로 다른 유형의 컴포넌트(도형, 선, 표 등)는 독립적인 `#*-inspector-section`을 가져야 한다. 각 섹션은 `display: none`으로 시작하며, `toggleInspectors` 로직을 통해 상호 배타적으로 표시되어야 UI 복잡도와 이벤트 충돌을 줄일 수 있다.
- **Color Picker Clipping**: `.v4-color-wrapper`를 사용할 때는 반드시 `overflow: hidden`과 `border-radius: 4px`를 유지해야 한다. 내부의 `input[type="color"]`는 브라우저 기본 테두리를 숨기기 위해 부모 박스보다 크게 설정되어 있으므로, 클리핑 처리가 빠지면 레이아웃이 깨지고 주변 라벨과 겹치게 된다.
- **Inspector Layout Consistency**: 속성 편집기(Inspector) 내의 컬러 선택기나 수치 입력창은 가급적 `grid-template-columns: repeat(3, 1fr)` 레이아웃을 사용하여 다른 편집기 섹션과 시각적 일관성을 유지하고 컴팩트한 디자인을 제공한다.
- **Atomic Icon Unification**: 새로운 아이콘(특히 외부 이미지 `<img>` 태그를 사용하는 경우)을 아톰 라이브러리에 추가할 때는 반드시 기존 `.lf-icon` 계열과 시각적 크기가 일치하도록 처리해야 한다. 40x40 컨테이너 내에서 이미지 그래픽 크기가 약 60~65% 수준(약 24~26px)이 되도록 `padding` 또는 `width/height` 조정을 통해 적절한 여백을 확보하여 시각적 균형을 맞춘다. 또한, 에디터 로직이 이를 아이콘으로 인식할 수 있도록 컨테이너에 반드시 `.lf-icon` 클래스를 부여해야 한다.

## Text And Layout
- Use font sizes within the project scale: 18-20px for main titles, 15-16px for section/table headers, 14-15px for body/table cells, 13px for labels/help text, and 12px for tiny markers/tags.
- Apply `white-space: nowrap;` to dates and short labels that must stay on one line.
- In polygon/shape text, calculate padding and `line-height` so text remains centered.

## Molecules
- When saving grouped elements to Molecules, store the container `innerHTML` only and save `width`, `height`, and `isGroup` as metadata.
- When loading Molecules, restore wrapper dimensions from metadata.
- For legacy HTML with absolute coordinates inside inserted content, reset internal coordinates to `0, 0`.
