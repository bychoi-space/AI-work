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
     - **플로팅 연동**: 선택 활성화 시 `#floating-inspector-card`가 노출되며, 현재 활성화된 속성 편집 섹션(예: `text-editor-section`) 및 툴바(`#selection-actions-bar`)가 `#floating-inspector-body` 내부로 동적으로 이동(`appendChild`)되어야 한다.
     - **DOM 복원 SSOT**: 선택 해제나 상태 변경 시, 동적 이동된 요소들의 상태 유실 및 파괴를 방지하기 위해 반드시 독립 저장소 컨테이너(`#inspector-panels-storage`)로 환원(`restorePropertiesSections()`)한 뒤 갱신해야 한다.
     - **오작동 방지**: 캔버스 드래그 및 줌 마우스 이벤트 등에서 플로팅 카드 내 클릭을 예외 처리(`e.target.closest('#floating-inspector-card')`)하여 편집 제어 도중 영역이 접히는 오작동을 차단한다.
     - **선택별 버튼 분기 제어**:
       - **단일 컴포넌트(비그룹)**: `GROUP`, `UNGROUP`, `ADD TO MOLECULES` 3종 버튼 모두 미노출 (`display: none !important`).
       - **단일 그룹**: `UNGROUP`, `ADD TO MOLECULES` 노출, `GROUP` 미노출.
       - **다중 선택(2개 이상)**: `GROUP` 및 정렬 도구 노출, `UNGROUP`, `ADD TO MOLECULES` 미노출.
  6. **F2 키 기반 도형 선택/텍스트 편집 상태 전환 및 포커스 제어 보장**:
     - F2 키 입력 시 선택 모드(이동/삭제 가능)와 텍스트 편집 모드(`contenteditable="true"`, 캐럿 깜빡임)가 토글(Toggle)되어야 한다.
     - **포커스 스왑 제어**: 텍스트 편집 모드로 진입 시 iframe 보안 격리를 극복하기 위해 `contenteditable` 영역을 포커스하기 전 반드시 iframe 자체(`window.top`에서 iframe `.contentWindow.focus()`) 또는 iframe 내부 `window.focus()`를 먼저 호출한 뒤 대상 요소를 포커스해야 캐럿(Caret)이 정상 노출된다.
     - **Input Hijacking 방지 & IME 가드**: 사이드바/폼 입력 중 키보드 가로채기를 막기 위해 부모 keydown 이벤트의 시작 지점에서 `F2` 키 입력을 최우선 가드하고, 한글 조합 입력 중 중복 발동 방지를 위해 `isComposing` 검증을 병행해야 한다.

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

## Line Shape Connector Visual Standard
- **Dual Path Structure**: Connector lines inside `LF_RENDER_CONNECTORS` are rendered with two SVG paths: an invisible 40px hit-area path (`stroke="transparent" stroke-width="40"`) for easy selection, and a visible path (`stroke-width="1.6"` or `baseWidth + 1` when selected).
- **Magnetic Port Highlight**: When dragging connector endpoints near a component's port (30px threshold), the target port element (`.lf-connector-port`) scales up (`transform: scale(1.8)`) and highlights with a pink background (`#fb7185`).

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
- **도형 텍스트(SHAPE Text) 여백 핏(Fit) & 렌더링 아키텍처 정밀 규격 수칙 (SSOT)**:
  - **1. 명칭 및 기획 정의**: 우측 사이드바 `SHAPE` 카테고리의 첫 번째 항목인 **`T (Text)` (도형 텍스트)**를 가리키며, `ATOMIC LIBRARY`의 첫 번째 항목인 **`Textbox` (텍스트박스 아톰)**와 엄격하게 구분한다. 내부 클래스명인 `.v4-text-box`와 상관없이 UI 상의 명칭은 반드시 **'도형 텍스트'**로 통일한다.
  - **2. 핵심 소스코드 수정 위치 (File Map)**:
    - **[assets/vctrl_text_measurer.js](file:///c:/ai-work/assets/vctrl_text_measurer.js)**: 전략/디스패처(Strategy/Dispatcher) 패턴 기반 컴포넌트 타입 분류기(`getComponentType`), 순수 오프스크린 측정 코어(`measureCellTextDimensions`), 그리고 타입별 100% 독립 전용 처리 엔진(`fitStandaloneTextShape`, `fitTextBox`, `fitShapeText`, `fitDefaultCell`)으로 텍스트 동적 테두리 피팅을 수행하는 핵심 로직 소유 파일.
    - **[assets/vctrl_iframe_styles.js](file:///c:/ai-work/assets/vctrl_iframe_styles.js)**: 셀 기본 패딩(`padding: 4px !important;`) 및 FLEX 대칭 정렬 CSS 규칙 소유 파일.
  - **3. 정밀 박스-모델 수치 및 산술 공식 (Exact Math Spec)**:
    - **기본 차감 픽셀**: `box-sizing: border-box` 스펙 상 `1.6px` 보더(양쪽 3.2px) + `4px` 셀 패딩(양쪽 8.0px) = **`11.2px` 기본 차감**.
    - **순수 도형 텍스트(`isStandaloneTextShape`) 버퍼 할당**:
      - `addedW = 12` (가로 좌 6px + 우 6px) / `addedH = 8` (세로 상 4px + 하 4px)
      - **유효 공간 산식**: `(textW + 12px) - 11.2px = textW + 0.8px` (0.8px 서브픽셀 안전지대 확보 ➔ **텍스트 1줄 유지, 절대 2줄 분리 잘림 없음**).
      - **시각적 여백**: 상(4.0px), 하(4.0px), 좌(4.4px), 우(4.4px) ➔ **글자에 딱 밀착된 사방 ~4px 1:1 완벽 정대칭 핏 완성**.
  - **4. 재발 방지를 위한 5대 절대 금기 수칙 (Strict Anti-Patterns)**:
    - **[금기 1] 템플릿 리터럴 정규식 이중 백슬래시(`\\`) 필수**: `assets/vctrl_text_measurer.js`는 전체가 `window.v4TextMeasurerScript = \`...\``로 감싸져 있으므로 내부 정규식 작성 시 반드시 `\\u200B\\u00A0`, `<\\/span>`, `<br\\s*\\/?>`처럼 이중 백슬래시를 사용해야 한다. 단일 백슬래시 사용 시 iframe script 컴파일 오류(SyntaxError)로 이벤트 핸들러가 증발하여 **오브젝트 선택 불가(클릭 불능)** 버그가 일어난다.
    - **[금기 2] `!important` 속성의 `removeProperty()` 해제 필수**: `.lf-drag-handle` 등에 `setProperty('display', 'none', 'important')` 조치 후 복원 시 반드시 `removeProperty('display')`를 호출해야 한다. 단순 `style.display = ""`는 `!important`를 지우지 못해 이동 핸들이 영구 증발(선택 불가)하는 치명적 버그가 유발된다.
    - **[금기 3] `measureContainer` Quill CSS 클래스 상속 및 `display: inline` 필수**: 측정용 `div` 생성 시 `className = 'ql-editor v4-editable-cell'`을 부여하고 `targetDoc.body`에 주입해야 하며, 내부 하위 엘리먼트는 반드시 `display: inline !important`를 유지해야 부분 텍스트 컬러/서식 변경(`span`) 시 공백 폭(Space Width) 소실로 인한 의도치 않은 자동 줄바꿈 오측정 버그를 방지할 수 있다.
    - **[금기 4] 유니코드 특수 공백 정제 (`Line 123`)**: Quill 에디터가 주입하는 `.ql-cursor` 및 `\u200B`, `\u00A0` 특수 공백은 측정 전 `sanitizeHtml` 정규식으로 100% 정제하여 무효 공백 픽셀로 인한 좌우 여백 비대화 왜곡을 차단한다.
    - **[금기 5] 거대 단일 if-else 오버라이드 금지 및 전략 패턴(Strategy Pattern) 준수**: 컴포넌트별 피팅 로직 수정 시 하나의 거대 함수에 패치식 `if-else`를 누적하지 말고, `COMP_TYPES` 디스패처를 통해 전용 피터(`fitStandaloneTextShape`, `fitTextBox`, `fitShapeText`, `fitDefaultCell`)로 100% 독립 분리하여 타 컴포넌트 사이드이펙트를 원천 차단한다.
  - **5. 도형 텍스트 우측 하단 크기 조절 버튼(.lf-resizer) 완전 미노출 규격**:
    - 도형 텍스트(`.v4-text-shape`, `.v4-text-box`, `.text-marker`)는 폰트 크기 변경에 따른 동적 자동 핏(Fit)을 따르므로 우측 하단의 수동 크기 조절 버튼(`.lf-resizer`)은 완전히 불필요하다.
    - 이를 위해 `assets/vctrl_iframe_styles.js`에 `.v4-text-shape > .lf-resizer, .v4-text-box > .lf-resizer, .text-marker > .lf-resizer { display: none !important; }` CSS 선언부 및 `vctrl_text_measurer.js` 내의 `fitResult.hideResizer` 핸들러 제어 로직을 통해 리사이저 버튼을 완전히 숨겨야 한다.
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


