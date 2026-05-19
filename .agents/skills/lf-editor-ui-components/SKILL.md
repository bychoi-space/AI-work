---
name: lf-editor-ui-components
description: Use when editing V4 components, .lf-icon SVG atoms, premium buttons, modals, popups, editable cells, lf-component wrappers, delete triggers, Molecules save/load UI, typography, canvas sizing, 1.6px borders, visual component styling, or LF Editor design-system rules.
---

# LF Editor UI Components

- **Global Screen Layer**: 모든 오브젝트는 iframe 내부의 **`document.body`**에 직접 위치한다. 특정 템플릿 영역(`.mobile-content` 등)에 종속되지 않음으로써 스크린 어디서든 자유로운 배치와 그룹화가 가능하다.
- **Common Object Protocol (4원칙)**: 모든 객체(텍스트, 도형, 선, 아톰 등)는 예외 없이 다음 4가지 동작을 보장해야 한다.
  1. 드래그(Marquee) 및 Shift+Click을 통한 **다중 선택, 그룹화(Ctrl+G), 해제** 보장
  2. 선택 상태에서 **화살표 키(`ArrowUp` 등)를 이용한 픽셀 단위 그룹 이동** 보장
  3. `Delete` 또는 `Backspace` 키보드 입력을 통한 **즉각 삭제** 보장
  4. 객체의 이동, 생성, 삭제, 그룹화 등 모든 상태 변경 전 **`V4UndoManager.saveState()` 호출을 통한 Ctrl+Z (Undo) 보장**
- **Unified Marker Structure**: Text markers must include a `.lf-drag-handle` (drag handle), `.lf-delete-trigger` (delete), and `.v4-editable-cell` (content) inside their `.lf-component` wrapper. All markers are aligned to their **Top-Left** corner (0, 0) and use **px** units for consistent coordinate mapping with shapes and atoms.
- **Zero-Drift Measurement**: 크기 측정(`offsetWidth/Height`) 시에는 반드시 UI 핸들(.lf-drag-handle 등)을 일시적으로 숨겨서, 핸들 여백이 논리적인 객체 크기를 왜곡하지 않도록 처리해야 한다.
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
- **아톰 이미지/아이콘 표준 및 채색 가이드 (Definitive Atom Image & Masking Unification)**:
  - **1. Replaced Element (<img>) 사용 절대 금지**: 브라우저 그래픽 최적화 특성상 `<img>` 태그에 `-webkit-mask-image`를 주입하고 `src`를 투명화하여 `background-color`를 주입하는 동적 조색 기법은 엘리먼트 증발을 초래합니다. 따라서 신규 이미지 기반 아톰은 절대 `<img>` 태그로 작성해서는 안 되며, **`<div>` 엘리먼트와 `background-image` 스타일 조합**으로 설계해야 합니다.
  - **2. <img>-to-<div> 자동 실시간 마이그레이션**: 스크린 로딩 및 DOM 감시(`enforceDesignSystem()`) 시 레거시 스크린 내의 구형 `<img>` 기반 아톰/로고는 스타일과 클래스를 100% 보존한 채 표준 `<div>`로 실시간 치환되도록 설계해야 합니다.
  - **3. 여백(Padding) 및 마스크 영역 정합 표준**: 여백이 내장된 스프라이트 기반 아이콘들과의 시각적 크기/균형 조화를 위해, 꽉 차게 잘린 신규 이미지 아톰(예: Share 등) 및 커스텀 아톰에는 반드시 **`padding: 8px !important;`** 및 **`box-sizing: border-box !important;`**를 적용해야 합니다. 여백 안쪽으로 마스크와 배경, 채색 영역이 완벽히 수축 안착하도록 **`background-origin/clip: content-box`**와 **`mask-origin/clip: content-box`** (및 `-webkit-` 프리픽스) 스타일 속성을 생성 템플릿(`vctrl_core.js`) 및 스타일 업데이트 핸들러(`LF_UPDATE_STYLE` in `vctrl_iframe_script.js`) 양쪽에 모두 누락 없이 강제 적용 및 보존해야 합니다.
  - **4. 인라인 brightness 필터 금지**: 생성 템플릿에 `filter: brightness(0)`와 같은 하드코딩 필터 주입을 배제해야 하며, 스타일 업데이트 시 `t.style.filter = 'none'`을 우선 처리하여 채색 렌더러가 온전한 원색을 왜곡 없이 표현할 수 있게 보장합니다.

## Text And Layout
- Use font sizes within the project scale: 18-20px for main titles, 15-16px for section/table headers, 14-15px for body/table cells, 13px for labels/help text, and 12px for tiny markers/tags.
- Apply `white-space: nowrap;` to dates and short labels that must stay on one line.
- In polygon/shape text, calculate padding and `line-height` so text remains centered.
- **양측 여백 및 테이블 크기 균형 가이드 (Balanced Layout Breathing Room)**:
  - 열(Column) 개수가 줄어들거나 증가하더라도 테이블을 캔버스 크기에 꽉 채우기 위해 개별 열의 가로폭을 과도하게 늘려서 화면 끝단에 닿아 우측 여백이 잘리는 답답한 배치를 만들어서는 안 된다.
  - 컨텐츠 양에 맞게 각 열의 가로폭을 최적의 픽셀(예: 날짜 열 `140px` ~ `160px`)로 차분히 줄이고, 테이블 전체 가로폭(`comp-main-table`의 `width` 값) 역시 컴팩트하게 축소하여 좌측 여백(`40px`)과 우측 여백이 조화롭고 대칭적인 여백미를 갖추도록 균형 있게 정비해야 한다.

## Molecules
- When saving grouped elements to Molecules, store the container `innerHTML` only and save `width`, `height`, and `isGroup` as metadata.
- **Global Host Restoration**: 컴포넌트 삽입 시 호스트는 항상 `document.body`가 되어야 하며, 줌 배율을 고려하여 삽입 위치를 보정해야 한다.
- When loading Molecules, restore wrapper dimensions from metadata.
- For legacy HTML with absolute coordinates inside inserted content, reset internal coordinates to `0, 0`.
