---
name: lf-editor-engine
description: Use when editing LF Editor engine files, vctrl_core.js, vctrl_inspector.js, vctrl_grouping.js, vctrl_v3.js, MessageHub, SmartGuide, iframe scripts, DOM registries, init functions, listener wiring, selection, grouping, canvas, zoom, pan, annotations, or module boundaries.
---

# LF Editor Engine

## Core Boundaries & Architecture
- Keep the engine modular. Add a dedicated JS file for a large new feature instead of swelling an existing file.
- `vctrl_core.js` owns global `state`, `MessageHub`, GitHub API load/save, dynamic script compilation for iframe `srcdoc`, and SmartGuide calculation flow.
- `vctrl_connectors.js` owns connector spawning (`spawnLine`), 30px magnetic port snapping (`collectSnapTargets`), port highlighting, real-time anchoring (`syncAnchoredPositions`), and connector inspector routing.
- `vctrl_iframe_ports.js` owns iframe-side port detection and port-drag connector initiation.
- `vctrl_grouping.js` owns marquee selection, `selectedIds`, group move/delete/grouping behavior, and selected class sync.
- `vctrl_inspector.js` owns sidebar tabs, metadata UI, screen list rendering, Quill initialization, floating card routing, and the central `DOM` registry.
- `vctrl_v3.js` owns annotation pins (legacy render), Canvas Interaction (`adjustZoom`, `centerView`, `updateTransform`), Fullscreen, and Global Space-key Panning logic (integrated with `vctrl_core.js` iframe event propagation).


## Communication & Scripting Safety
- In `file://` contexts, do not access iframe `contentDocument` directly. Use `MessageHub`/`postMessage`.
- Normalize action names sent through `MessageHub` so case, hyphen, and underscore variants are accepted.
- **MessageHub Publish Collision**: `MessageHub.publish(type, data)` 호출 시 `data` 객체 내부에 `type` 프로퍼티가 포함되지 않도록 주의하라. `publish` 함수는 `{ type, ...data }` 형태로 객체를 병합하므로, `data.type`이 첫 번째 인자인 `type`을 덮어씌워 구독자가 메시지를 수신하지 못하게 된다.
- Inline CSS/JS dependencies needed by `srcdoc` iframe flows to avoid security blocking.
- **Nested Backtick Precaution**: `vctrl_core.js`의 `v4Script` 또는 인라인 주입 스크립트와 같이 백틱(`)으로 감싸진 템플릿 리터럴 내부에서 다시 백틱이나 변수 보간(`${}`)을 사용하면 구문 에러(SyntaxError)가 발생한다. 내부에서는 반드시 일반 따옴표(`"` 또는 `'`)와 덧셈 연산자(`+`)를 사용하거나 이스케이프(`\``) 처리를 해야 한다.
- **Iframe State Initialization**: iframe 컨텍스트에서는 부모 창의 전역 변수(예: `window.state`)가 자동으로 공유되지 않는다. iframe 내부에 주입되는 스크립트(예: `vctrl_undo.js`)에서 상태를 참조하거나 저장할 때는 반드시 참조 전 초기화 여부(예: `if (!window.state) window.state = {};`)를 확인하여 `TypeError`를 방지하라.
- **iframe 하위 스크립트 모듈화 및 동적 컴파일 (Modular Iframe Scripts & Dynamic Compilation)**:
  - iframe의 `srcdoc`에 주입되는 스크립트는 기능별 모듈 파일(`vctrl_undo.js`, `vctrl_design_system.js`, `vctrl_shortcuts.js`, `vctrl_iframe_drag.js`, `vctrl_iframe_grid.js`, `vctrl_iframe_accordion.js`, `vctrl_iframe_script.js` 등)로 완전 분리 관리된다.
  - `vctrl_core.js`의 `loadScreen()` 시점에 이 분리된 파일들을 동적으로 결합(Compile)하여 iframe의 `srcdoc` 내부 `<script>` 영역에 순서대로 주입한다.
  - **자동 캐시 무효화 (Auto Cache Busting)**: 빌드 시점에 결합되는 스크립트 블록 최상단에 `Date.now()` 타임스탬프 난수가 담긴 버스터 주석(`// Cache Buster Timestamp: ...`)을 함께 인라인 주입하므로, 개발자는 쿼리스트링 버전을 매번 수동 범프할 필요가 없으며 로드 시마다 캐시 무효화가 자동으로 일어난다.
- **크로스 스크린 복사/붙여넣기 (Cross-Screen Clipboard Sync)**:
  - 각 스크린 iframe은 고유한 `srcdoc` 컨텍스트(또는 `file://` sandboxed context)에서 로드되므로 격리되어 있어 `localStorage`나 iframe 간의 단순 전역 변수 공유가 불가능하다.
  - 이를 극복하고 서로 다른 스크린을 넘나들며 오브젝트 복사/붙여넣기(`Ctrl+C` / `Ctrl+V`)를 지원하기 위해 최상위 윈도우(`window.top`)의 전역 프로퍼티인 `window.top.__lf_global_clipboard__`를 클립보드 데이터의 SSOT로 정의하여 통신한다.
  - 복사 시 선택한 오브젝트 데이터(스타일, 속성, 내부 텍스트, HTML 등)를 JSON 형태로 직렬화하여 `window.top.__lf_global_clipboard__`에 저장하며, 붙여넣기 시 이를 역직렬화하여 겹침 방지 오프셋(+15px)을 더한 뒤 캔버스에 붙여넣는다.
- **MutationObserver 무한 재귀 루프 방지 (Preventing Infinite Mutation Loops)**: `enforceDesignSystem()` 등 MutationObserver가 활성화된 루프 내에서 카운터 textContent, placeholder display, 또는 폰트 크기 등의 DOM 쓰기 연산을 수행할 경우 다시 MutationObserver가 발동하여 브라우저가 정지하는 무한 재귀 상태에 빠지기 쉽다. 이를 예방하기 위해, 모든 DOM 쓰기 작업은 반드시 **현재 DOM 값과 대입하려는 신규 값을 엄격히 비교(Value Comparison Guard)**하여, 값이 변경된 경우에만 실행되도록 보호해야 한다.


## Interaction Integrity
- Keep marker drag and click-to-edit separate.
- For `.v4-editable-cell`, bypass drag logic on click and call `.focus()` immediately.
- Keep component `id`, `selectedIds`, and `.selected` class state synchronized across core and grouping logic.
- **SmartGuide Anchor Compensation**: For `.text-marker`, all objects are now Top-Left oriented. When calculating `calculateSnap()` bounding boxes, coordinates are relative to the component's top-left corner without the legacy center-offset transform.
- **데이터 기반 정밀 연산 (Pure Data / No-Measure Strategy)**: 다중 선택 그룹화, 이동, 정렬 시 브라우저의 `getBoundingClientRect()`는 줌이나 테두리에 의해 오차가 발생할 수 있으므로 가급적 지양한다. 대신 객체의 **`style.left/top` 데이터**를 직접 읽어와 산술 연산하는 방식을 우선한다.
- **Group-Aware State Sync**: 요소가 그룹화되어 계층 구조가 변경되더라도 `metadata.json`에 저장되는 데이터는 항상 **전체 스크린(body) 기준의 절대 좌표(px)**를 유지해야 한다. 그룹 내 자식 요소의 뷰포트 좌표를 실시간 역산하여 전역 데이터로 동기화(`LF_UPDATE_PIN_POS` 등)해야 한다.

- **MessageHub Nudge/Align/Undo**: Use MessageHub (`LF_NUDGE`, `LF_ALIGN_COMPONENTS`, `LF_SAVE_UNDO`) to synchronize keyboard movements and alignments from the parent window to the iframe components seamlessly.
- **Keyboard Nudge Forwarding**: 사용자가 컴포넌트를 클릭하면 포커스가 iframe 내부로 이동하여 부모 창의 키보드 이벤트가 동작하지 않을 수 있다. 따라서 iframe 내부(`vctrl_core.js`의 `v4Script`)에도 화살표 키 리스너를 배치하여, iframe 내 요소가 선택된 경우 직접 이동시키고, 그렇지 않은 경우 `LF_NUDGE` 메시지를 통해 부모 창(커넥터, 텍스트 마커 등)에 이벤트를 전달해야 한다.
- **통합 키보드 이벤트 파이프라인 (Unified Keyboard Event Pipeline)**: 기존에 분산되어 있던 부모 창과 iframe 내부의 키보드 이벤트 리스너를 단일화된 파이프라인으로 통합했다. 컴포넌트나 커넥터가 포커싱되었을 때 이벤트가 유실되거나 중복 처리되지 않도록, `vctrl_iframe_script.js` 내부의 통합 키보드 핸들러가 이벤트를 포착하고, 부모 창의 단일 리스너와 `MessageHub`를 통해 연동되어야 한다. 화살표 키 이동(Nudge), Delete/Backspace 삭제, Undo/Redo 등의 모든 인터랙션이 단일 이벤트 흐름으로 제어됨을 보장해야 한다.
- **커넥터(Lines) 실시간 좌표 동기화 (Real-Time Connector Reconciliation)**: 사용자가 컴포넌트를 드래그하거나 화살표 키로 이동시킬 때, 컴포넌트에 연결된 모든 커넥터 라인(Lines)은 `syncAnchoredPositions()` 및 MessageHub 신호(`LF_SNAP_REQUEST`, `LF_COMP_RESIZED`)를 통해 실시간으로 시작/끝 좌표를 재계산하고 부드럽게 추종하도록 연동해야 한다. 드래그가 완료되면 이동된 최종 좌표 상태가 `V4UndoManager` 및 `metadata.json`에 영구히 저장되어야 한다.
- **이벤트 핸들러 연쇄 차단 방지 (Non-Blocking Event Listener Flow)**: `mouseup` 또는 `mousemove`와 같은 전역 통합 이벤트 리스너를 수정할 때, 개별 조건문(예: `isConnectorDragging`) 처리 후 `return;`으로 조기 종료를 남용하지 말라. 조기 종료 시 하위의 `isMarquee` 상태 해제(`LF_MARQUEE_END`) 및 선택 박스(`.v4-marquee-box`) 제거 로직이 차단되어 클릭 시 캔버스에 파란색 점 잔상이 생성되거나 다중선택 드래그가 마비되는 사이드 이펙트가 발생하므로, 모든 상태 해제 연산은 독립 순차 구문으로 전개해야 한다.

## Connector and Cross-Window Interaction Principles
- **Iframe Occlusion Protection**: 부모 창에서 드래그 인터랙션(커넥터 핸들 등)이 발생할 때, 마우스가 iframe 위로 올라가면 이벤트가 끊길 수 있다. `mousedown` 시 iframe에 `pointer-events: none`을 설정하고 `mouseup` 시 `auto`로 복구하여 끊김 없는 드래그를 보장하라.
- **Iframe Coordinate Normalization**: 부모 창에서 iframe 내부 요소의 물리적 위치(예: 드래그 중인 포트 커넥터 등)를 계산할 때, `getBoundingClientRect()` 결과에 iframe 자체의 `left`, `top` 오프셋을 반드시 더해주어야 부모 창 기준의 정확한 절대 좌표를 얻을 수 있습니다. 단, 스마트 가이드의 오브젝트 간 스냅 계산 시에는 줌 오차가 없는 `style.left/top` 기반의 Pure Data 연산을 우선합니다.
- **Scale/Zoom Compensation**: 에디터가 줌(Scale) 상태일 때 마우스 이동 거리(`e.clientX - rect.left`)를 그대로 사용하면 안 된다. 반드시 현재의 스케일 값(`window.state.transform.scale`)으로 나누어 가상 캔버스 좌표로 보정하라.
- **교차 창 좌표계 화해 (Coordinate Reconciliation)**: 
  - **iframe 내부**: `style.left/top`은 `body` 기준의 **논리 좌표(Unscaled)**이며, 모든 객체의 기준점이 된다.
  - **부모 창**: `getBoundingClientRect()`는 **물리적 스크린 좌표(Scaled)**를 반환하므로, 줌 배율(`scale`)로 나누어 보정해야 한다.
  - **통합 로직**: 다중 선택(Marquee) 및 교차 검사 시, 반드시 **이프레임 바디(Global Root)**를 기준점(Origin)으로 삼아 모든 좌표를 가상 공간으로 변환(Normalize)한 뒤 연산하라.

- **Performance Optimization (rAF)**: 커넥터 재그리기와 같이 연산량이 많은 실시간 업데이트는 `requestAnimationFrame`을 사용하여 브라우저 주사율에 최적화하라.
- **Selection Protection**: iframe 내부 클릭 시 발생하는 `LF_DESELECT`와 같은 전역 선택 해제 메시지가 현재 진행 중인 부모 창의 인터랙션(커넥터 드래그 등)을 강제로 중단시키지 않도록 방어 로직을 구축하라.
- **Z-Index Layering**: 커넥터 레이어와 같이 마우스 이벤트를 직접 받아야 하는 SVG 레이어는 iframe보다 높은 `z-index`(예: 10001)를 가져야 하며, 내부의 핸들/히트박스에는 `pointer-events: auto`를 명시적으로 부여해야 한다.
- **Selection Loop Protection**: `LF_COMP_SELECTED` 메시지를 구독하여 기존 선택을 해제(clearSelection)하는 로직을 작성할 때, 현재 내가 선택한 컴포넌트(예: `isConnector: true`)에 대한 메시지까지 처리하여 자기 자신을 해제하지 않도록 메시지 데이터를 필터링하라.

## 🏗️ Unified Object Architecture (Established)
- **Terminology**: Text Boxes, Shapes, Atoms, and Lines are collectively referred to as **'모든 오브젝트' (All Objects)**.
- **Common Object Protocol (4원칙)**: 모든 객체(텍스트, 도형, 선, 아톰 등)는 예외 없이 다음 4가지 동작을 보장해야 한다.
  1. 드래그(Marquee) 및 Shift+Click을 통한 **다중 선택, 그룹화(Ctrl+G), 해제** 보장
  2. 선택 상태에서 **화살표 키(`ArrowUp` 등)를 이용한 픽셀 단위 그룹 이동** 보장
  3. `Delete` 또는 `Backspace` 키보드 입력을 통한 **즉각 삭제** 보장
  4. 객체의 이동, 생성, 삭제, 그룹화 등 모든 상태 변경 전 **`V4UndoManager.saveState()` 호출을 통한 Ctrl+Z (Undo) 보장**
- **Global Screen Layer**: 모든 오브젝트는 iframe 내부의 **`document.body`**에 직접 위치한다. 특정 템플릿 영역(`.mobile-content` 등)에 종속되지 않음으로써 스크린 어디서든 자유로운 배치와 그룹화가 가능하다.
- **Unified Coordinate System**: 모든 오브젝트는 고정 픽셀(**px**) 단위를 사용한다. 더 이상 퍼센트(%) 단위를 사용하지 않아 단위 변환 오차가 발생하지 않는다.
- **Auto-Migration Strategy**: 스크린 로드 시 `%` 좌표가 발견되면 `enforceDesignSystem`을 통해 현재 화면 크기 기준의 **절대 픽셀(`px`)**로 즉시 자동 변환한다. 이는 그룹화 엔진이 `style.left/top` 데이터를 안전하게 산술 연산하기 위한 전제 조건이다.
- **Zero-Drift Measurement**: 크기 측정(`offsetWidth/Height`) 시에는 반드시 UI 핸들(.lf-drag-handle 등)을 일시적으로 숨겨서, 핸들 여백이 논리적인 객체 크기를 왜곡하지 않도록 처리해야 한다.
- **Persistence**: 저장 시 HTML DOM 스냅샷이 주체(SSOT)가 된다. 텍스트 마커의 경우 호환성을 위해 `metadata.json`의 `description` 리스트를 유지하지만, 이 또한 항상 `body` 기준의 절대 픽셀 좌표로 동기화되어야 한다.
