---
name: lf-editor-engine
description: Use when editing LF Editor engine files, vctrl_core.js, vctrl_inspector.js, vctrl_grouping.js, vctrl_v3.js, MessageHub, SmartGuide, iframe scripts, DOM registries, init functions, listener wiring, selection, grouping, canvas, zoom, pan, annotations, or module boundaries.
---

# LF Editor Engine

## Core Boundaries
- Keep the engine modular. Add a dedicated JS file for a large new feature instead of swelling an existing file.
- `vctrl_core.js` owns global `state`, `MessageHub`, GitHub API load/save, inline `v4Script`, and SmartGuide calculation flow.
- `vctrl_grouping.js` owns marquee selection, `selectedIds`, group move/delete/grouping behavior, and selected class sync.
- `vctrl_inspector.js` owns sidebar tabs, metadata UI, screen list rendering, Quill initialization, and the central `DOM` registry.
- `vctrl_v3.js` owns annotation pin render/create flows, zoom/pan, device viewport changes, and utility behavior.

## Communication
- In `file://` contexts, do not access iframe `contentDocument` directly. Use `MessageHub`/`postMessage`.
- Normalize action names sent through `MessageHub` so case, hyphen, and underscore variants are accepted.
- **MessageHub Publish Collision**: `MessageHub.publish(type, data)` 호출 시 `data` 객체 내부에 `type` 프로퍼티가 포함되지 않도록 주의하라. `publish` 함수는 `{ type, ...data }` 형태로 객체를 병합하므로, `data.type`이 첫 번째 인자인 `type`을 덮어씌워 구독자가 메시지를 수신하지 못하게 된다.
- Inline CSS/JS dependencies needed by `srcdoc` iframe flows to avoid security blocking.
- When changing `v4Script` in `vctrl_core.js`, keep escaped inline strings syntactically valid and ensure the internal logic remains consistent with the editor's expected behavior.
- **Iframe State Initialization**: iframe 컨텍스트에서는 부모 창의 전역 변수(예: `window.state`)가 자동으로 공유되지 않는다. iframe 내부에 주입되는 스크립트(예: `v4UndoScript`)에서 상태를 참조하거나 저장할 때는 반드시 참조 전 초기화 여부(예: `if (!window.state) window.state = {};`)를 확인하여 `TypeError`에 의한 기능 중단(Regression)을 방지하라.

## Interaction Integrity
- Keep marker drag and click-to-edit separate.
- For `.v4-editable-cell`, bypass drag logic on click and call `.focus()` immediately.
- Keep component `id`, `selectedIds`, and `.selected` class state synchronized across core and grouping logic.
- **SmartGuide Anchor Compensation**: For `.text-marker`, all objects are now Top-Left oriented. When calculating `calculateSnap()` bounding boxes, coordinates are relative to the component's top-left corner without the legacy center-offset transform.
- **Cross-Boundary Coordinates (Viewport-Absolute)**: When performing multi-selection grouping, nudging, or alignment, **ALWAYS** use `getBoundingClientRect()` to calculate targets in viewport space. All objects now use `px` units, simplifying coordinate reconciliation.
- **Group-Aware State Sync**: When a group containing components is moved, the engine must immediately recalculate their **host-relative** pixel coordinates and update the parent `state` via `LF_UPDATE_PIN_POS`. This ensures position integrity across refreshes.
- **MessageHub Nudge/Align/Undo**: Use MessageHub (`LF_NUDGE`, `LF_ALIGN_COMPONENTS`, `LF_SAVE_UNDO`) to synchronize keyboard movements and alignments from the parent window to the iframe components seamlessly.
- **Keyboard Nudge Forwarding**: 사용자가 컴포넌트를 클릭하면 포커스가 iframe 내부로 이동하여 부모 창의 키보드 이벤트가 동작하지 않을 수 있다. 따라서 iframe 내부(`vctrl_core.js`의 `v4Script`)에도 화살표 키 리스너를 배치하여, iframe 내 요소가 선택된 경우 직접 이동시키고, 그렇지 않은 경우 `LF_NUDGE` 메시지를 통해 부모 창(커넥터, 텍스트 마커 등)에 이벤트를 전달해야 한다.

## Connector and Cross-Window Interaction Principles
- **Iframe Occlusion Protection**: 부모 창에서 드래그 인터랙션(커넥터 핸들 등)이 발생할 때, 마우스가 iframe 위로 올라가면 이벤트가 끊길 수 있다. `mousedown` 시 iframe에 `pointer-events: none`을 설정하고 `mouseup` 시 `auto`로 복구하여 끊김 없는 드래그를 보장하라.
- **Iframe Coordinate Normalization**: 부모 창에서 iframe 내부 요소의 위치를 계산할 때, `getBoundingClientRect()` 결과에 iframe 자체의 `left`, `top` 오프셋을 반드시 더해주어야 부모 창 기준의 정확한 절대 좌표를 얻을 수 있다.
- **Scale/Zoom Compensation**: 에디터가 줌(Scale) 상태일 때 마우스 이동 거리(`e.clientX - rect.left`)를 그대로 사용하면 안 된다. 반드시 현재의 스케일 값(`window.state.transform.scale`)으로 나누어 가상 캔버스 좌표로 보정하라.
- **교차 창 좌표계 화해 (Coordinate Reconciliation)**: 
  - **iframe 내부**: `getBoundingClientRect()`는 iframe 뷰포트 기준의 **논리 좌표(Unscaled)**를 반환한다.
  - **부모 창**: `getBoundingClientRect()`는 **물리적 스크린 좌표(Scaled)**를 반환한다.
  - **통합 로직**: 다중 선택(Marquee) 및 교차 검사 시, 반드시 공통 부모(예: `#pins-layer`)를 기준점(Origin)으로 삼아 모든 좌표를 가상 1440x900 공간으로 변환(Normalize)한 뒤 연산하라.
- **Performance Optimization (rAF)**: 커넥터 재그리기와 같이 연산량이 많은 실시간 업데이트는 `requestAnimationFrame`을 사용하여 브라우저 주사율에 최적화하라.
- **Selection Protection**: iframe 내부 클릭 시 발생하는 `LF_DESELECT`와 같은 전역 선택 해제 메시지가 현재 진행 중인 부모 창의 인터랙션(커넥터 드래그 등)을 강제로 중단시키지 않도록 방어 로직을 구축하라.
- **Z-Index Layering**: 커넥터 레이어와 같이 마우스 이벤트를 직접 받아야 하는 SVG 레이어는 iframe보다 높은 `z-index`(예: 10001)를 가져야 하며, 내부의 핸들/히트박스에는 `pointer-events: auto`를 명시적으로 부여해야 한다.
- **Selection Loop Protection**: `LF_COMP_SELECTED` 메시지를 구독하여 기존 선택을 해제(clearSelection)하는 로직을 작성할 때, 현재 내가 선택한 컴포넌트(예: `isConnector: true`)에 대한 메시지까지 처리하여 자기 자신을 해제하지 않도록 메시지 데이터를 필터링하라.

## 🏗️ Unified Object Architecture (Established)
- **Terminology**: Text Boxes, Shapes, Atoms, and Lines are collectively referred to as **'모든 오브젝트' (All Objects)**.
- **Component Standards**: Wrap every **'모든 오브젝트' (All Objects)** in `.lf-component` so drag and drop remains available.
- **Unified Coordinate System**: Every object uses absolute pixels (**px**) for positioning. This eliminates cross-unit complexity and ensures pixel-perfect alignment.
- **Persistence**: The primary **Source of Truth** is the HTML DOM snapshot saved during the 'Save All' process. Text markers maintain a secondary `description` list in `metadata.json` for legacy compatibility, but visual rendering and editing are driven by the DOM.
