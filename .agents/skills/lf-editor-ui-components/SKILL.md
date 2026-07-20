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
  5. **오브젝트 프로퍼티 플로팅 카드 (Object Properties Floating Card) 및 다중 선택**:
     - **플로팅 연동**: 선택 활성화 시 `#floating-inspector-card`가 노출되며, 현재 활성화된 속성 편집 섹션(예: `text-editor-section`) 및 툴바(`#selection-actions-bar`)가 `#floating-inspector-body` 내부로 동적으로 이동(`appendChild`)되어야 합니다.
     - **DOM 복원 SSOT**: 선택 해제나 상태 변경 시, 동적 이동된 요소들의 상태 유실 및 파괴를 방지하기 위해 반드시 원래의 부모 컨테이너(`#tab-editor` 및 `#v4-shapes-body`)로 환원(`restorePropertiesSections()`)한 뒤 갱신해야 합니다.
     - **오작동 방지**: 캔버스 드래그 및 줌 마우스 이벤트 등에서 플로팅 카드 내 클릭을 예외 처리(`e.target.closest('#floating-inspector-card')`)하여 편집 제어 도중 영역이 접히는 오작동을 차단합니다.
     - **선택별 버튼 분기 제어**:
       - **단일 컴포넌트(비그룹)**: `GROUP`, `UNGROUP`, `ADD TO MOLECULES` 3종 버튼 모두 미노출 (`display: none !important`).
       - **단일 그룹**: `UNGROUP`, `ADD TO MOLECULES` 노출, `GROUP` 미노출.
       - **다중 선택(2개 이상)**: `GROUP` 및 정렬 도구 노출, `UNGROUP`, `ADD TO MOLECULES` 미노출.
- **Unified Marker Structure**: Text markers must include a `.lf-drag-handle` (drag handle), `.lf-delete-trigger` (delete), and `.v4-editable-cell` (content) inside their `.lf-component` wrapper. All markers are aligned to their **Top-Left** corner (0, 0) and use **px** units for consistent coordinate mapping with shapes and atoms.
- **Zero-Drift Measurement**: 크기 측정(`offsetWidth/Height`) 시에는 반드시 UI 핸들(.lf-drag-handle 등)을 일시적으로 숨겨서, 핸들 여백이 논리적인 객체 크기를 왜곡하지 않도록 처리해야 한다.
- Add `contenteditable="true"` and `.v4-editable-cell` to editor-linked text regions.
- Inject `.lf-delete-trigger` (`×`) whenever users must be able to delete an object.
- Keep editor canvas/page dimensions aligned to the Cover screen size, typically 1440x900.
- **사이드바 크기 변경 시 컴포넌트 래퍼 크기 연동**: Textbox/Textarea처럼 내부 컨테이너로 스타일 리디렉션이 발생하는 컴포넌트의 경우, 가로/세로 크기(`width`, `height`)는 내부 컨테이너가 아니라 **최외곽 래퍼인 `.lf-component`**에 직접 할당해야 리사이저 핀과 드래그 핸들이 어긋나지 않는다. 이때 내부 컨테이너의 가로/세로는 `100%`로 지정 및 유지되어 부모 크기 변화에 유연하게 동조되도록 해야 한다.

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
- **도형 텍스트(SHAPE Text) 명칭 및 렌더링 아키텍처 규칙**:
  - **1. 명칭 및 기획 정의 (SSOT)**:
    - 우측 사이드바 `SHAPE` 카테고리의 첫 번째 항목인 **`T (Text)` (도형 텍스트)**를 가리키며, `ATOMIC LIBRARY`의 첫 번째 항목인 **`Textbox` (텍스트박스 아톰)**와 엄격하게 구분한다. 내부 클래스명인 `.v4-text-box`와 상관없이 UI 상의 명칭은 반드시 **'도형 텍스트'**로 통일한다.
  - **2. 파일별 역할 분담 및 수정 가이드**:
    - **[assets/templates.js](file:///c:/ai-work/assets/templates.js) (뼈대 및 기본 스타일)**:
      - 도형 텍스트 최초 생성 시 삽입되는 HTML 구조 조각과 기본 CSS 정의부(예: `.v4-text-box` 및 `.text-marker` 클래스의 기본 렌더링 스타일, 마우스 selected/hover 효과)가 들어있다. 컴포넌트의 디폴트 여백 및 모양 변경 시 이 파일의 스타일 선언부를 수정해야 한다. (부모에 `display: flex`가 들어가서 하위 텍스트와 이동 핸들의 밀림을 유발하지 않도록 absolute 래퍼 형태로 유지해야 한다.)
    - **[assets/vctrl_iframe_script.js](file:///c:/ai-work/assets/vctrl_iframe_script.js) (렌더링 엔진 스타일 쉘)**:
      - iframe 캔버스 내부에 주입되는 스타일시트(`window.v4Styles`)를 통해 실시간 기하학적 정렬을 지배한다. 상하좌우 대칭 정렬을 위한 셀 패딩(`padding: 4px !important;`), 수직/수평 FLEX 정렬(`display: flex !important; align-items: center !important; justify-content: center !important;`), 줄높이 초기화(`line-height: 1 !important;`), 텍스트 치우침 보정을 위한 트랜스폼(`transform: translateY(var(--v4-text-adjust-y, 0px));`) 등의 CSS 규칙은 이 파일에서 관리한다.
    - **[assets/vctrl_design_system.js](file:///c:/ai-work/assets/vctrl_design_system.js) (크기 계산 및 영점 보정 알고리즘)**:
      - 폰트 크기 변경에 따른 동적 크기 보정 함수 `resizeToFitText()`를 소유한다. 
      - **Zero-Drift Measurement**: 크기 측정 직전 `.lf-drag-handle`, `.lf-resizer`, `.lf-delete-trigger`를 일시적으로 감춰서 측정 왜곡을 방어한다.
      - **Computed Style Lookup**: 자식 노드 중 폰트 크기 스타일이 지정된 첫 번째 요소의 computed style(`window.getComputedStyle(el).fontSize`)을 안전하게 낚아채어 오차 없이 측정한다.
      - **Zero-Offset Calibration**: `10px` 등 11px 이하의 초소형 폰트 크기에서 발생하는 브라우저 고유의 아래 처짐 현상을 소멸시키기 위해 Y축 영점 보정 변수 `--v4-text-adjust-y: -0.6px`를 동적으로 부여한다.
      - **텍스트 공백 정제**: 텍스트의 실제 가로/세로 픽셀을 측정하기 전, 유니코드 특수 공백(`\u200B`, `\u00A0` 등)과 개행을 정규식으로 완벽히 제거(`trim().replace(/\u200B/g, '')`)하여 과도한 좌우 공백 왜곡을 차단한다.
    - **[assets/vctrl_v4_addon.js](file:///c:/ai-work/assets/vctrl_v4_addon.js) (부모-자식 스타일 중계기)**:
      - 사이드바 조작에 따른 `LF_UPDATE_STYLE` 토스 핸들러를 정의한다. 폰트 크기(`shape-font-size`), 정렬(`_applyTextAlign`), 컬러(`shape-text-color`) 변경 메시지 송신 시, 도형 텍스트 영역을 포섭하도록 셀렉터 타겟에 `.v4-shape .v4-shape-text-content, .v4-shape .v4-shape-text-overlay, .v4-shape .v4-editable-cell` 3중 결합 경로가 정의되어야 한다.
    - **[assets/vctrl_core.js](file:///c:/ai-work/assets/vctrl_core.js) (자동 캐시 무력화)**:
      - 모듈 스크립트를 수정한 후 배포 시 브라우저 캐싱 문제를 해결하기 위해, `loadScreen()` 시점 주입되는 인라인 스크립트 블록 최상단에 `Date.now()` 난수가 담긴 캐시 버스터 주석(`// Cache Buster Timestamp: ...`)을 자동으로 결합하도록 빌드 흐름을 설계 및 활용해야 합니다.
- Use font sizes within the project scale: 18-20px for main titles, 15-16px for section/table headers, 14-15px for body/table cells, 13px for labels/help text, and 12px for tiny markers/tags.
- Apply `white-space: nowrap;` to dates and short labels that must stay on one line.
- In polygon/shape text, calculate padding and `line-height` so text remains centered.
- **양측 여백 및 테이블 크기 균형 가이드 (Balanced Layout Breathing Room & Exact Column Grid)**:
  - 열(Column) 개수가 줄어들거나 증가하더라도 테이블을 캔버스 크기에 꽉 채우기 위해 개별 열의 가로폭을 과도하게 늘려서 화면 끝단에 닿아 우측 여백이 잘리는 답답한 배치를 만들어서는 안 된다.
  - 컨텐츠 양에 맞게 각 열의 가로폭을 최적의 픽셀(예: 날짜 열 `140px` ~ `160px`)로 차분히 줄이고, 테이블 전체 가로폭(`comp-main-table`의 `width` 값) 역시 컴팩트하게 축소해야 한다.
  - 이때, 전체 페이지들의 일관성 있는 레이아웃 흐름을 유지하기 위해 테이블의 시작 위치는 항상 슬라이드 표준인 **`left: 40px`** (또는 프로젝트 표준인 **`left: 30px`**)로 엄격히 고정해야 하며, 임의로 테이블을 중앙 정렬하여 정렬선을 깨뜨려서는 안 된다. 여백은 오직 줄어든 테이블 너비에 따른 우측의 풍부한 여백(Breathing space)으로만 세련되게 표현되어야 한다.
  - **초정밀 열 간격 제어 규칙 (Exact Column Widths & Box-Sizing)**: 테이블의 열 개수가 많아 전체 가로폭(`width: 1380px` 등)을 가득 채워야 할 때, 브라우저가 패딩과 보더 두께를 더해 표가 컨테이너 바깥으로 삐져나가거나 짤리는 오버플로우 현상을 원천 차단해야 한다. 이를 위해 모든 테이블 셀(`th, td`)에는 반드시 **`box-sizing: border-box !important`**를 적용해야 하며, 각 열(`th`)의 `width` 합계가 메인 테이블 컨테이너의 전체 `width`를 절대 초과하지 않도록 개별 열의 가로폭을 정밀하게 나누어 제어하여(예: 8열의 경우 각 127px 등으로 균등 축소) 완벽히 맞닿는 그리드를 유지해야 한다.
- **[배송예정일 설정] 템플릿 작성 및 빌드 표준 (Shipping Notice Planning Standard)**:
  - **1. 좌측 정렬선 및 그리드 고정**: 타이틀 도형(`comp-title-shape`)과 메인 테이블(`comp-main-table`)은 반드시 전체 슬라이드 흐름 및 로고 시작점과 완벽히 일직선상에 정렬되도록 **`left: 30px`** (타이틀은 마진 보정으로 `left: 29.5px`)로 좌측 정렬을 엄격히 고정한다.
  - **2. 가로폭 규격 및 우측 여백 확보**: 날짜 개수에 무관하게 테이블 컨테이너의 가로폭은 1440px 규격 내에서 완벽한 30px 대칭 마진을 달성하도록 **`width: 1380px`**를 채우는 것을 원칙으로 한다. (날짜가 적을 때는 임의의 빈 공간을 중앙 정렬하지 않고 `width: 1120px`와 같이 축소하되, 시작 위치는 무조건 `left: 30px`로 유지하여 우측의 세련된 여백미를 살린다.)
  - **3. 요일 표기 및 주말/공휴일 하이라이트**: 날짜 칼럼 헤더는 날짜 뒤에 해당하는 요일을 괄호 형태로 표기한다. (예: `5/22 (금)`, `6/6 (토)`). 토요일, 일요일 및 공휴일 헤더는 캘린더 가독성을 직관적으로 극대화하기 위해 반드시 **`h-red`** 클래스 배경색을 입혀 붉은색으로 명확히 표현해야 한다.
  - **4. 특이 예외 케이스 감지 및 조색**: 안산 출고 여부, 택배 집하 여부 등 기본값이 `Y`인 데이터 중에서 특이 예외 상황(예: 집하/배송 불가 `N` 값, 혹은 마감 시간이 13시로 단축 조율된 케이스 등)이 발견되면, 해당 셀의 `<td>` 태그에 **`bg-peach`** 클래스(`#fee2e2 !important` 연분홍색 배경)를 강제 적용하여 특별한 주의가 필요함을 시각적으로 강력하게 소통해야 한다.
  - **5. 초정밀 열 간격 제어와 Box-Sizing의 병합**: 8일 이상의 복잡한 요일이 들어가더라도 열 간격이 테이블 컨테이너 밖으로 오버플로우되거나 짤려 보이지 않도록, 테이블의 모든 셀(`th, td`)에 반드시 **`box-sizing: border-box !important`**를 선언해야 한다. 또한, 각 열의 가로폭 지정 합계가 메인 테이블 컨테이너 너비(`1380px`)를 수학적으로 정확하게 일치하거나 미세하게 하회하도록(예: 8열의 경우 라벨 180px * 2, 날짜 127px * 8 = 1376px로 4px 여유) 칼럼별 픽셀을 정밀하게 분할 지정해야 한다.
  - **6. ISSUE 행 삽입 및 휴일/이벤트 표기**: 헤더(Header) 바로 아래이자 본문 첫 행(안산 출고 여부) 위에 **`ISSUE / 이슈`** 행을 필수로 삽입한다. 이 행의 셀들은 모두 `contenteditable="true"` 상태로 제공되어야 하며, 크리스마스, 명절, 현충일, 삼일절, 광복절, 선거일자, 대체휴무일 등 해당 날짜에 해당하는 공식 휴일이나 특이 이슈 명칭을 명확하게 텍스트로 기입해야 한다.


## Molecules
- When saving grouped elements to Molecules, store the container `innerHTML` only and save `width`, `height`, and `isGroup` as metadata.
- **Global Host Restoration**: 컴포넌트 삽입 시 호스트는 항상 `document.body`가 되어야 하며, 줌 배율을 고려하여 삽입 위치를 보정해야 한다.
- When loading Molecules, restore wrapper dimensions from metadata.
- For legacy HTML with absolute coordinates inside inserted content, reset internal coordinates to `0, 0`.

## Advanced Layout Controls & Snapping Optimization
- **SmartGuide Snapping Sensitivity**:
  - The default snapping magnetic threshold is set to **`5px`** to prevent excessive snapping stickiness and enable finer placement controls.
  - Non-canvas snapping targets must only activate when they are within a **`300px`** radius of the moving component to reduce lag. Global canvas boundaries (0, center, max width/height) remain active regardless of distance.
- **Enclosed Marquee Selection Criteria (PowerPoint Style)**:
  - Drag-select marquee requires objects and connectors to be **completely enclosed** within the marquee boundary rectangle to be selected (no simple edge intersections allowed).
  - For lines/connectors, both the start and end points must be inside the selection rectangle.
- **Default Shape Background & Borders**:
  - Default background color for `Rect`, `Circle`, `Triangle`, `Diamond`, and `Pattern` shape templates is **`rgb(255, 255, 255)`** (white).
  - Default border color is **`rgb(200, 200, 200)`** (light gray).
- **Distribute Alignments**:
  - Horizontal (`distribute_h`) and Vertical (`distribute_v`) distribution alignments require at least **3 selected objects**.
  - Distributes items evenly by computing identical distance gaps based on the outermost boundaries.
- **Group Component Selection Outline**:
  - Selected group components (`.lf-group`) display a **green outline (`#10b981`)** and green handles/resizers, differentiating them from the standard blue (`#6366f1`) single component selection border.
- **Group Component Property Hiding**:
  - For single selection of a grouped component (`.lf-group`), the OBJECT PROPERTIES floating card must hide all property editors and only show the group actions toolbar (`selection-actions-bar`) containing `[UNGROUP]`, `[ADD TO MOLECULES]`, `[BRING FRONT]`, and `[SEND BACK]`.
  - Recursive search queries inside groups during style retrieval must be bypassed to avoid false-positive sub-editor display.
- **Library English Name Unification & Dual-Language Search**:
  - All Atom, Icon, and Shape library cards displayed in the right sidebar must use English names.
  - To support Korean queries, each card must include a `data-ko` attribute containing Korean synonyms, and dynamic shape definitions must include a `koName` property. The search filtering logic must query both English titles and Korean metadata.
- **템플릿 리터럴 내 문자열 이스케이프 및 결합 표준 (Template Literal Collision Prevention)**:
  - `vctrl_iframe_script.js`와 같이 파일 전체가 큰 백틱(`` ` ``) 템플릿 문자열로 감싸진 채 부모 측 브라우저에서 동적으로 평가(eval)되는 파일의 경우, 내부 코드에서 또다시 백틱(`` ` ``)이나 변수 보간(`${}`) 구문을 사용하면 문법 충돌(SyntaxError)이 일어나 작동이 중단됩니다. 이를 방지하기 위해 내부 문자열 표현은 반드시 표준적인 따옴표(싱글/더블)와 덧셈 연산자(`"Sub Item " + (i + 1)`)를 활용해 문자열을 결합해야 합니다.
- **신규 아톰 추가 시 옵션 프로퍼티 플로팅 카드 통합 규칙 (Floating Card Registry Unification)**:
  - 신규 아톰의 설정 패널을 디자인할 때는 우측 사이드바가 아닌 옵션 프로퍼티 플로팅 카드(`Object Properties Floating Card`)에 노출되도록 `vctrl_inspector.js` 내의 `DOM` 매핑 등록, `restorePropertiesSections` 복원 대상 등록, `updateProperties`의 보이기/숨기기 처리 및 선택 해제(Deselect) 시 숨김 처리를 빠짐없이 세트로 적용하여 사이드바에 옵션 패널이 잔존하는 버그를 원천 차단해야 합니다.


