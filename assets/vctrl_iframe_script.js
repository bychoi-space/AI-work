// --- Core Constants for V4 Injection ---
window.v4Styles = `
:root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg-dark: #0f172a; --v4-panel-bg: rgba(30, 41, 59, 0.7); --v4-border: rgba(255, 255, 255, 0.15); --v4-text-main: #ffffff; --v4-text-dim: #94a3b8; }
body, .lf-component { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
.v4-editable-cell, [contenteditable="true"] { -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; user-select: text; }
.lf-component { 
    position: absolute; cursor: pointer; transition: outline 0.2s; 
    box-sizing: border-box; z-index: 100;
    transform: none !important; /* Kill legacy centering drift */
}
.lf-component.selected { outline: 2px solid #6366f1; }
.lf-component.lf-group.selected { outline: 2px solid #10b981 !important; }
.lf-component.lf-group.selected > .lf-drag-handle { background: #10b981 !important; }
.lf-component.lf-group.selected > .lf-resizer { background: #10b981 !important; }
.lf-component .lf-component .lf-drag-handle, 
.lf-component .lf-component .lf-resizer, 
.lf-component .lf-component .lf-delete-trigger,
.lf-in-group .lf-drag-handle,
.lf-in-group .lf-resizer,
.lf-in-group .lf-delete-trigger { display: none !important; }
.lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; opacity: 0; transition: all 0.2s; border: 2px solid #fff; z-index: 10002; }
.lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; top: -16px; left: -16px; }
.lf-resizer { position: absolute; bottom: -5px; right: -5px; width: 12px; height: 12px; background: #6366f1; cursor: nwse-resize; border-radius: 50%; border: 2px solid #fff; opacity: 0; transition: 0.2s; z-index: 10002; }
.lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
.lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none !important; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 10002; font-size: 14px; font-weight: bold; }
.lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: none !important; }
.v4-premium-table { table-layout: fixed; border-collapse: collapse; overflow: hidden; border-radius: 8px; border: 1.6px solid #475569 !important; font-family: 'Inter', sans-serif; }
.v4-premium-table th { padding: 14px 16px; text-align: left; border-bottom: 1.6px solid #475569 !important; font-weight: 700; white-space: nowrap; }
.v4-premium-table td { padding: 14px 16px; border-bottom: 1.6px solid #cbd5e1 !important; }
.v4-premium-table tr:last-child td { border-bottom: none !important; }
.v4-shape { position: relative; border-width: 1.6px !important; border-style: solid !important; border-color: rgb(200, 200, 200); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgb(255, 255, 255); color: #0f172a; }
.v4-editable-cell:focus { outline: 2px solid #6366f1; background: rgba(99, 102, 241, 0.05) !important; }
.selected-cell {
    outline: 1.6px dashed #6366f1 !important;
    outline-offset: -1.6px !important;
    background-color: rgba(99, 102, 241, 0.08) !important;
}
.lf-icon { 
    background-image: url("https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png"); 
    background-size: 500% 400%; 
    width: 100%; height: 100%; 
    display: inline-block; 
    background-repeat: no-repeat; 
    pointer-events: none; 
}
.lf-icon-home { background-position: 50% 0%; }
.lf-icon-category { background-position: 0% 0%; }
.lf-icon-my { background-position: 75% 0%; }
.lf-icon-heart { background-position: 100% 0%; }
.lf-icon-search { background-position: 50% 33.33%; }
.lf-icon-cart { background-position: 75% 33.33%; }
.lf-icon-brand { background-position: 25% 0%; }
.lf-icon-bell { background-position: 25% 33.33%; }
.lf-icon-back { background-position: 0% 33.33%; }
.lf-cust-gift, .lf-cust-1to1, .lf-cust-chatbot, .lf-cust-faq, .lf-cust-truck {
    background-image: url("https://img.lfmall.co.kr/file/WAS/apps/2023/mfront/customer/icon_customer_my_btn.png") !important;
    background-size: 300% 200% !important;
}
.lf-cust-gift { background-position: 0% 0% !important; }
.lf-cust-1to1 { background-position: 50% 0% !important; }
.lf-cust-chatbot { background-position: 100% 0% !important; }
.lf-cust-faq { background-position: 0% 100% !important; }
.lf-cust-truck { background-position: 50% 100% !important; }
.lf-rv-write, .lf-rv-my {
    background-image: url("https://img.lfmall.co.kr/file/WAS/apps/2021/front/review_new/m/icon_rv_mp.png") !important;
    background-size: 200% 100% !important;
}
.lf-rv-write { background-position: 0% 0% !important; }
.lf-rv-my { background-position: 100% 0% !important; }
.v4-logo-img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; display: block; }
img.lf-icon { width: 100%; height: 100%; padding: 8px; box-sizing: border-box; object-fit: contain; }
.v4-shape-rect { border-radius: 8px; }
.v4-shape-circle { border-radius: 50%; }
.v4-shape-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); border: none !important; }
.v4-shape-diamond { border: none !important; }
.v4-shape-wave { border: none !important; }
.v4-shape-pattern-grid { 
    background-color: #ffffff !important; 
    background-image: 
        linear-gradient(45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)), 
        linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)) !important; 
    background-size: 12px 12px !important; 
    border-radius: 0 !important; 
}
/* Reset background for new SVG/Custom atoms to prevent sprite leakage */
svg.lf-icon, div.v4-checkbox.lf-icon, div.v4-radio.lf-icon { background-image: none !important; }
.lf-icon[class*="lf-icon-"] { background-image: url("https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png") !important; }
.v4-stepper-container[data-disabled="true"] { pointer-events: none !important; }
.v4-stepper-container[data-disabled="true"] .v4-stepper-control { background-color: #e5e7eb !important; border-color: #9ca3af !important; }
.v4-stepper-container[data-disabled="true"] .v4-stepper-value { color: #9ca3af !important; }
.v4-stepper-container[data-disabled="true"] .v4-stepper-dec, .v4-stepper-container[data-disabled="true"] .v4-stepper-inc { background-color: #e5e7eb !important; color: #9ca3af !important; }
.v4-stepper-container[data-disabled="true"] .v4-stepper-action { background-color: #e5e7eb !important; border-color: #9ca3af !important; color: #9ca3af !important; box-shadow: none !important; }
.v4-selectbox-container[data-dropdown-active="true"] .v4-selectbox-header { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }
.v4-selectbox-container[data-dropdown-active="true"] svg { transform: rotate(180deg); }
.v4-selectbox-option:hover { background-color: #f3f4f6 !important; cursor: pointer; }
.v4-selectbox-option:last-child { border-bottom: none !important; }
.v4-fileupload-container[data-selected="true"] .v4-fileupload-delete { display: block !important; }
.v4-fileupload-delete:hover { color: #ef4444 !important; }
.v4-fileupload-button:hover { background-color: #f9fafb !important; border-color: #babcbe !important; }

/* Text Marker Integration - Unified px Top-Left (same as shapes/atoms) */
.text-marker, .v4-text-box { 
    position: absolute; padding: 2px 6px; border-radius: 4px; 
    border: 1.6px solid transparent; font-size: 14px; line-height: 1.2; 
    white-space: normal; cursor: grab; pointer-events: auto; z-index: 100; 
    transition: box-shadow 0.2s, border-color 0.2s, background 0.2s, outline 0.2s;
    min-width: unset; min-height: unset; background: transparent; 
    box-shadow: none; box-sizing: border-box;
    color: #1e293b; text-align: left;
    width: fit-content !important;
}
.text-marker .v4-editable-cell, .v4-text-box .v4-editable-cell { padding: 2px 4px; display: block; text-align: left; }
.text-marker .v4-editable-cell p, .v4-text-box .v4-editable-cell p { margin: 0; padding: 0; }
.text-marker:hover, .v4-text-box:hover { border-color: var(--v4-primary); background: transparent; box-shadow: none; }
.text-marker.selected, .v4-text-box.selected { border-color: var(--v4-primary); outline: 2px solid var(--v4-primary); box-shadow: none; z-index: 10001; }

/* Premium Pin Marker Styling */
.pin-marker {
    position: absolute !important;
    width: 28px !important;
    height: 28px !important;
    background: #fb7185 !important; /* Rose accent matching --accent-data */
    color: #000000 !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 2px solid #ffffff !important;
    box-shadow: 0 4px 12px rgba(251, 113, 133, 0.4) !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 800 !important;
    font-size: 13px !important;
    z-index: 1000 !important;
    cursor: grab !important;
    box-sizing: border-box !important;
}
.pin-marker.selected {
    outline: 2px solid #6366f1 !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3) !important;
}
.pin-marker:hover {
    box-shadow: 0 6px 16px rgba(251, 113, 133, 0.6) !important;
    background: #fda4af !important; /* Lighter rose color on hover */
}
.pin-marker .lf-drag-handle {
    top: -14px !important;
    left: -14px !important;
}
.pin-marker .lf-delete-trigger {
    top: -14px !important;
    right: -14px !important;
}

body { position: relative !important; min-height: 100vh; margin: 0; padding: 0; }
/* Force disable transitions during drag for maximum smoothness */
.lf-component.dragging-now, .lf-component.dragging-now * { 
    transition: none !important; 
    pointer-events: none !important;
}

/* Checkbox / Radio Checked & Text Toggle styling */
.v4-checkbox-container[data-checked="false"] svg { display: none !important; }
.v4-radio-container[data-checked="false"] .v4-radio-dot { display: none !important; }
.v4-checkbox-container[data-text-enabled="false"] .v4-checkbox-text { display: none !important; }
.v4-radio-container[data-text-enabled="false"] .v4-radio-text { display: none !important; }
.v4-checkbox-text, .v4-radio-text { color: #000000 !important; font-size: 12px !important; }
.v4-checkbox-container[data-text-enabled="false"], 
.v4-radio-container[data-text-enabled="false"] {
    width: 100% !important;
    height: 100% !important;
}
.v4-checkbox-container[data-text-enabled="false"] .v4-checkbox,
.v4-radio-container[data-text-enabled="false"] .v4-radio {
    width: 100% !important;
    height: 100% !important;
}
.v4-alert-btn.style-primary { background: #4f46e5 !important; border-color: #4f46e5 !important; color: #ffffff !important; }
.v4-alert-btn.style-normal { background: #ffffff !important; border-color: #cbd5e1 !important; color: #1f2937 !important; }
.v4-alert-btn.style-negative { background: #e2e8f0 !important; border-color: #cbd5e1 !important; color: #475569 !important; }
.v4-custom-btn {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18) !important;
    transition: all 0.2s ease !important;
}
.v4-custom-btn:hover {
    filter: brightness(0.95);
    transform: translateY(-1.2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
}
.v4-custom-btn:active {
    transform: translateY(0.8px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15) !important;
}
.v4-custom-btn.style-primary { background: #4f46e5 !important; border-color: #4f46e5 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35) !important; }
.v4-custom-btn.style-primary:hover { box-shadow: 0 6px 18px rgba(79, 70, 229, 0.5) !important; }
.v4-custom-btn.style-normal { background: #ffffff !important; border-color: #cbd5e1 !important; color: #1f2937 !important; }
.v4-custom-btn.style-negative { background: #e2e8f0 !important; border-color: #cbd5e1 !important; color: #475569 !important; }
`;

window.v4Script = `
(function() {
    // --- Console Log Auto-Clearing Guard inside iframe ---
    (function() {
        let logCount = 0;
        const originalLog = console.log;
        console.log = function(...args) {
            logCount++;
            if (logCount > 150) {
                console.clear();
                originalLog("[LF Editor Iframe] Auto-cleared console logs after reaching threshold.");
                logCount = 0;
            }
            originalLog.apply(console, args);
        };
    })();

    console.log("[V4 Iframe] Script initialized (V144_SHORTCUT_SAVE_FIX)");
    let isDragging = false, isResizing = false, isConnectorDragging = false, activeEl = null;
    let startX, startY, startW, startH, startTop, startLeft, startRect;
    function notifyParent(data) { window.parent.postMessage(data, '*'); }
    function markDirty() { notifyParent({ type: 'LF_DIRTY' }); }

    // Unified Utility inside v4Script
    const _rgb2hex = (rgb) => {
        if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
        const parts = rgb.match(/\\d+/g);
        if (!parts || parts.length < 3) return "#000000";
        const r = Math.min(255, parseInt(parts[0])).toString(16).padStart(2, "0");
        const g = Math.min(255, parseInt(parts[1])).toString(16).padStart(2, "0");
        const b = Math.min(255, parseInt(parts[2])).toString(16).padStart(2, "0");
        return "#" + r + g + b;
    };

    const _getVal = (el, prop) => {
        if (!el) return "";
        return el.style[prop] || window.getComputedStyle(el)[prop] || "";
    };

    const _getAlphaPercent = (rgb) => {
        if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return 0;
        if (rgb.startsWith("rgba")) {
            const parts = rgb.match(/rgba?\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*([\\d.]+)\\s*\\)/);
            if (parts && parts[1] !== undefined) {
                return Math.round(parseFloat(parts[1]) * 100);
            }
        }
        return 100;
    };

    window._getCompStyles = (c) => {
        const isGroup = c.classList.contains('lf-group');
        const shape = isGroup ? null : c.querySelector('.v4-shape');
        const table = isGroup ? null : c.querySelector('table');
        const icon = isGroup ? null : (c.querySelector('.lf-icon') || c.querySelector('img'));
        const textCell = isGroup ? null : c.querySelector('.v4-editable-cell');
        const isPin = isGroup ? false : (c.classList.contains('text-marker') || c.classList.contains('pin-marker') || c.classList.contains('v4-text-box'));
        const isImage = isGroup ? false : (shape ? shape.classList.contains('v4-shape-image') : (c.id === 'v4-atom-image' || c.classList.contains('v4-shape-image')));
        const isDescriptionPin = isGroup ? false : c.classList.contains('pin-marker');
        
        // Checkbox / Radio Atom Detection
        const isCheckbox = isGroup ? false : (!!c.querySelector('.v4-checkbox') || c.classList.contains('v4-checkbox') || !!c.querySelector('.v4-checkbox-container') || c.classList.contains('v4-checkbox-container'));
        const isRadio = isGroup ? false : (!!c.querySelector('.v4-radio') || c.classList.contains('v4-radio') || !!c.querySelector('.v4-radio-container') || c.classList.contains('v4-radio-container'));
        const container = isGroup ? null : (c.querySelector('.v4-checkbox-container, .v4-radio-container') || (c.classList.contains('v4-checkbox-container') || c.classList.contains('v4-radio-container') ? c : null));
        const checked = container ? container.getAttribute('data-checked') !== 'false' : true;
        const textEnabled = container ? container.getAttribute('data-text-enabled') !== 'false' : false;
        
        // Textbox / Textarea Atom Detection
        const isTextbox = isGroup ? false : (!!c.querySelector('.v4-textbox-container') || c.classList.contains('v4-textbox-container'));
        const isTextarea = isGroup ? false : (!!c.querySelector('.v4-textarea-container') || c.classList.contains('v4-textarea-container'));
        const inputContainer = isGroup ? null : (c.querySelector('.v4-textbox-container, .v4-textarea-container') || (isTextbox || isTextarea ? c : null));
        const placeholderText = inputContainer ? (inputContainer.getAttribute('data-placeholder') || inputContainer.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder')?.textContent || "Placeholder") : "";
        const maxLength = inputContainer ? (parseInt(inputContainer.getAttribute('data-maxlength')) || 100) : 100;
        const showCounter = inputContainer ? (inputContainer.getAttribute('data-show-counter') !== 'false') : false;

        // Stepper Atom Detection
        const isStepper = isGroup ? false : (!!c.querySelector('.v4-stepper-container') || c.classList.contains('v4-stepper-container'));
        const stepperContainer = isGroup ? null : (c.querySelector('.v4-stepper-container') || (isStepper ? c : null));
        const minVal = stepperContainer ? parseInt(stepperContainer.getAttribute('data-min')) || 1 : 1;
        const maxVal = stepperContainer ? parseInt(stepperContainer.getAttribute('data-max')) || 99 : 99;
        const stepperVal = stepperContainer ? parseInt(stepperContainer.getAttribute('data-val')) || minVal : minVal;
        const stepperBtnEnabled = stepperContainer ? stepperContainer.getAttribute('data-btn-enabled') !== 'false' : true;
        const stepperBtnText = stepperContainer ? stepperContainer.getAttribute('data-btn-text') || "적용" : "적용";
        const stepperDisabled = stepperContainer ? stepperContainer.getAttribute('data-disabled') === 'true' : false;
        
        // Selectbox Atom Detection
        const isSelectbox = isGroup ? false : (!!c.querySelector('.v4-selectbox-container') || c.classList.contains('v4-selectbox-container'));
        const selectboxContainer = isGroup ? null : (c.querySelector('.v4-selectbox-container') || (isSelectbox ? c : null));
        const selectboxDefaultText = selectboxContainer ? (selectboxContainer.getAttribute('data-default-text') || "선택하세요") : "선택하세요";
        const selectboxDropdownActive = selectboxContainer ? selectboxContainer.getAttribute('data-dropdown-active') === 'true' : false;
        const selectboxOptionsRaw = selectboxContainer ? (selectboxContainer.getAttribute('data-options') || "Option 1,Option 2,Option 3") : "Option 1,Option 2,Option 3";
        const selectboxOptions = selectboxOptionsRaw.split(',').map(s => s.trim()).filter(Boolean);

        // File Upload Atom Detection
        const isFileUpload = isGroup ? false : (!!c.querySelector('.v4-fileupload-container') || c.classList.contains('v4-fileupload-container'));
        const fileuploadContainer = isGroup ? null : (c.querySelector('.v4-fileupload-container') || (isFileUpload ? c : null));
        const fileSelected = fileuploadContainer ? fileuploadContainer.getAttribute('data-selected') === 'true' : false;
        const fileName = fileuploadContainer ? (fileuploadContainer.getAttribute('data-file-name') || "") : "";
        const fileButtonText = fileuploadContainer ? (fileuploadContainer.getAttribute('data-button-text') || "파일첨부") : "파일첨부";
        const filePlaceholder = fileuploadContainer ? (fileuploadContainer.getAttribute('data-placeholder') || "선택된 파일 없음") : "선택된 파일 없음";

        // Alert Atom Detection
        const isAlert = isGroup ? false : (!!c.querySelector('.v4-alert-container') || c.classList.contains('v4-alert-container'));
        const alertContainer = isGroup ? null : (c.querySelector('.v4-alert-container') || (isAlert ? c : null));
        const alertMessage = alertContainer ? (alertContainer.getAttribute('data-message') || "얼럿 메시지 입력 표시") : "얼럿 메시지 입력 표시";
        const alertBtnCount = alertContainer ? parseInt(alertContainer.getAttribute('data-btn-count')) || 1 : 1;
        const alertBtnText1 = alertContainer ? (alertContainer.getAttribute('data-btn-text-1') || "확인") : "확인";
        const alertBtnText2 = alertContainer ? (alertContainer.getAttribute('data-btn-text-2') || "취소") : "취소";
        const alertBtnText3 = alertContainer ? (alertContainer.getAttribute('data-btn-text-3') || "저장") : "저장";
        const alertBtnStyle1 = alertContainer ? (alertContainer.getAttribute('data-btn-style-1') || "normal") : "normal";
        const alertBtnStyle2 = alertContainer ? (alertContainer.getAttribute('data-btn-style-2') || "normal") : "normal";
        const alertBtnStyle3 = alertContainer ? (alertContainer.getAttribute('data-btn-style-3') || "normal") : "normal";
        const alertShowDesc = alertContainer ? alertContainer.getAttribute('data-show-desc') === 'true' : false;
        const alertDesc = alertContainer ? (alertContainer.getAttribute('data-desc') || "어떤어떤 경우에 얼럿이 표시됨") : "어떤어떤 경우에 얼럿이 표시됨";

        // Button Atom Detection
        const isButton = isGroup ? false : (!!c.querySelector('.v4-btn-container') || c.classList.contains('v4-btn-container'));
        const btnContainer = isGroup ? null : (c.querySelector('.v4-btn-container') || (isButton ? c : null));
        const buttonText = btnContainer ? (btnContainer.getAttribute('data-text') || "버튼") : "버튼";
        const buttonStyle = btnContainer ? (btnContainer.getAttribute('data-btn-style') || "normal") : "normal";
        const buttonRadius = btnContainer ? (btnContainer.getAttribute('data-btn-radius') || "6") : "6";

        // Date Picker Atom Detection
        const isDatePicker = isGroup ? false : (!!c.querySelector('.v4-datepicker-container') || c.classList.contains('v4-datepicker-container'));
        const dpContainer = isGroup ? null : (c.querySelector('.v4-datepicker-container') || (isDatePicker ? c : null));
        const dpShowPresets = dpContainer ? dpContainer.getAttribute('data-show-presets') !== 'false' : true;
        const dpShowEndDate = dpContainer ? dpContainer.getAttribute('data-show-end-date') !== 'false' : true;
        const dpDefaultPreset = dpContainer ? (dpContainer.getAttribute('data-default-preset') || 'none') : 'none';
        const dpStartDate = dpContainer ? (dpContainer.getAttribute('data-start-date') || '') : '';
        const dpEndDate = dpContainer ? (dpContainer.getAttribute('data-end-date') || '') : '';

        // Accordion Atom Detection
        const isAccordion = isGroup ? false : (!!c.querySelector('.v4-accordion-container') || c.classList.contains('v4-accordion-container'));
        const accordionContainer = isGroup ? null : (c.querySelector('.v4-accordion-container') || (isAccordion ? c : null));
        const accordionHeaderText = accordionContainer ? (accordionContainer.querySelector('.v4-accordion-title-text')?.innerText || "Accordion Header") : "Accordion Header";
        const accordionSubCount = accordionContainer ? (parseInt(accordionContainer.getAttribute('data-sub-count')) || 0) : 0;
        const accordionSubTexts = accordionContainer ? Array.from(accordionContainer.querySelectorAll('.v4-accordion-item')).map(item => item.innerText) : [];
        const accordionExpanded = accordionContainer ? accordionContainer.getAttribute('data-expanded') === 'true' : false;

        // Grid UI Atom Detection
        const isGrid = isGroup ? false : (!!c.querySelector('.v4-grid-container') || c.classList.contains('v4-grid-container'));
        const gridContainer = isGroup ? null : (c.querySelector('.v4-grid-container') || (isGrid ? c : null));
        const gridHeaders = gridContainer ? Array.from(gridContainer.querySelectorAll('.v4-grid-header-row .v4-grid-cell')).slice(1).map(cell => cell.innerText.replace(' ⇅', '')) : [];
        const gridRowCount = gridContainer ? (parseInt(gridContainer.getAttribute('data-row-count')) || 0) : 0;
        const gridShowPagination = gridContainer ? gridContainer.getAttribute('data-pagination') !== 'false' : true;

        const boxEl = isGroup ? null : c.querySelector('.v4-checkbox, .v4-radio');
        const buttonEl = isGroup ? null : c.querySelector('.v4-custom-btn');
        
        const getShapeColor = (prop) => {
            if (!shape) return "";
            if (shape.classList.contains('v4-shape-diamond') || shape.classList.contains('v4-shape-triangle') || shape.classList.contains('v4-shape-wave')) {
                const svg = shape.querySelector('polygon, path, rect, circle');
                if (svg) return prop === 'backgroundColor' ? svg.style.fill : svg.style.stroke;
            }
            return _getVal(shape, prop === 'backgroundColor' ? 'backgroundColor' : 'borderColor');
        };
 
        let detectedIconColor = "";
        if (icon) {
            const poly = icon.querySelector('polyline, path, line, polygon, rect, circle');
            const dot = icon.querySelector('.v4-radio div, .v4-radio-dot');
            if (poly) {
                detectedIconColor = poly.style.stroke || poly.getAttribute('stroke') || icon.style.color || "";
            } else if (dot) {
                detectedIconColor = dot.style.backgroundColor || "";
            } else {
                detectedIconColor = icon.style.color || icon.getAttribute('stroke') || "";
            }
        }
 
        const getCompBg = () => {
            if (shape) return getShapeColor("backgroundColor");
            if (table) return _getVal(table, "backgroundColor");
            if (isPin) return _getVal(c, "backgroundColor");
            if (boxEl) return _getVal(boxEl, "backgroundColor");
            if (buttonEl) return _getVal(buttonEl, "backgroundColor");
            if (inputContainer) return _getVal(inputContainer, "backgroundColor");
            if (stepperContainer) return _getVal(stepperContainer, "backgroundColor");
            if (selectboxContainer) return _getVal(selectboxContainer.querySelector('.v4-selectbox-header'), "backgroundColor");
            if (fileuploadContainer) return _getVal(fileuploadContainer.querySelector('.v4-fileupload-textbox-wrapper'), "backgroundColor");
            if (accordionContainer) return _getVal(accordionContainer, "backgroundColor");
            if (gridContainer) return _getVal(gridContainer, "backgroundColor");
            if (alertContainer) {
                const dialog = alertContainer.querySelector('.v4-alert-dialog');
                return dialog ? _getVal(dialog, "backgroundColor") : _getVal(alertContainer, "backgroundColor");
            }
            return "";
        };

        const getCompBorder = () => {
            if (shape) return getShapeColor("borderColor");
            if (table) return _getVal(table, "borderColor");
            if (isPin) return _getVal(c, "borderColor");
            if (boxEl) return _getVal(boxEl, "borderColor");
            if (buttonEl) return _getVal(buttonEl, "borderColor");
            if (inputContainer) return _getVal(inputContainer, "borderColor");
            if (stepperContainer) return _getVal(stepperContainer, "borderColor");
            if (selectboxContainer) return _getVal(selectboxContainer.querySelector('.v4-selectbox-header'), "borderColor");
            if (fileuploadContainer) return _getVal(fileuploadContainer.querySelector('.v4-fileupload-textbox-wrapper'), "borderColor");
            if (accordionContainer) return _getVal(accordionContainer, "borderColor");
            if (gridContainer) return _getVal(gridContainer, "borderColor");
            if (alertContainer) {
                const dialog = alertContainer.querySelector('.v4-alert-dialog');
                return dialog ? _getVal(dialog, "borderColor") : _getVal(alertContainer, "borderColor");
            }
            if (icon) return _getVal(icon.parentElement, "borderColor");
            return "";
        };

        return {
            id: c.id,
            x: parseFloat(c.style.left) || 0,
            y: parseFloat(c.style.top) || 0,
            isTable: !!table,
            isShape: !!shape,
            isIcon: !!icon,
            isImage: isImage,
            isPin: isPin,
            isDescriptionPin: isDescriptionPin,
            isCheckbox: isCheckbox,
            isRadio: isRadio,
            checked: checked,
            textEnabled: textEnabled,
            isTextbox: isTextbox,
            isTextarea: isTextarea,
            placeholderText: placeholderText,
            maxLength: maxLength,
            showCounter: showCounter,
            isStepper: isStepper,
            minVal: minVal,
            maxVal: maxVal,
            val: stepperVal,
            btnEnabled: stepperBtnEnabled,
            btnText: stepperBtnText,
            disabled: stepperDisabled,
            isSelectbox: isSelectbox,
            selectboxDefaultText: selectboxDefaultText,
            selectboxDropdownActive: selectboxDropdownActive,
            selectboxOptions: selectboxOptions,
            isFileUpload: isFileUpload,
            fileSelected: fileSelected,
            fileName: fileName,
            fileButtonText: fileButtonText,
            filePlaceholder: filePlaceholder,
            isAlert: isAlert,
            alertMessage: alertMessage,
            alertBtnCount: alertBtnCount,
            alertBtnText1: alertBtnText1,
            alertBtnText2: alertBtnText2,
            alertBtnText3: alertBtnText3,
            alertBtnStyle1: alertBtnStyle1,
            alertBtnStyle2: alertBtnStyle2,
            alertBtnStyle3: alertBtnStyle3,
            alertShowDesc: alertShowDesc,
            alertDesc: alertDesc,
            isButton: isButton,
            buttonText: buttonText,
            buttonStyle: buttonStyle,
            buttonRadius: buttonRadius,
            isDatePicker: isDatePicker,
            dpShowPresets: dpShowPresets,
            dpShowEndDate: dpShowEndDate,
            dpDefaultPreset: dpDefaultPreset,
            dpStartDate: dpStartDate,
            dpEndDate: dpEndDate,
            isAccordion: isAccordion,
            accordionHeaderText: accordionHeaderText,
            accordionSubCount: accordionSubCount,
            accordionSubTexts: accordionSubTexts,
            accordionExpanded: accordionExpanded,
            isGrid: isGrid,
            gridHeaders: gridHeaders,
            gridRowCount: gridRowCount,
            gridShowPagination: gridShowPagination,
            pinIndex: isPin ? parseInt(c.id.replace('v4-pin-', '')) : -1,
            html: textCell ? textCell.innerHTML : (shape ? (shape.querySelector('.v4-shape-text-content')?.innerHTML ?? shape.querySelector('.v4-shape-text-overlay')?.innerHTML ?? shape.innerHTML) : (table ? table.innerHTML : "")),
            isGroup: c.classList.contains('lf-group'),
            w: c.offsetWidth,
            h: c.offsetHeight,
            currentStyles: {
                bg: _rgb2hex(getCompBg()),
                border: _rgb2hex(getCompBorder()),
                text: _rgb2hex(textCell ? _getVal(textCell, "color") : (buttonEl ? _getVal(buttonEl, "color") : "")),
                fontSize: parseInt(_getVal(textCell, "fontSize")) || (inputContainer ? parseInt(_getVal(inputContainer, "fontSize")) || 12 : 12),
                fontFamily: textCell ? _getVal(textCell, "fontFamily") : (inputContainer ? _getVal(inputContainer, "fontFamily") : "inherit"),
                tableHeader: _rgb2hex(table ? _getVal(table.querySelector("th"), "backgroundColor") : ""),
                tableHeaderText: _rgb2hex(table ? _getVal(table.querySelector("th"), "color") : ""),
                iconColor: _rgb2hex(detectedIconColor || "#000000"),
                borderRadius: shape ? (parseInt(_getVal(shape, "borderRadius")) || 0) : (boxEl ? (parseInt(_getVal(boxEl, "borderRadius")) || 0) : (buttonEl ? (parseInt(_getVal(buttonEl, "borderRadius")) || 0) : 0)),
                bgOpacity: _getAlphaPercent(getCompBg()),
                isBgTransparent: (() => {
                    const colorVal = getCompBg();
                    return !colorVal || colorVal === "transparent" || colorVal === "none" || colorVal.includes("rgba(0, 0, 0, 0)");
                })(),
                isBorderTransparent: (() => {
                    const colorVal = getCompBorder();
                    return !colorVal || colorVal === "transparent" || colorVal === "none" || colorVal.includes("rgba(0, 0, 0, 0)");
                })(),
                textAlign: shape ? (shape.querySelector('.v4-shape-text-content')?.style.textAlign || 'center') : 'center'
            }
        };
    };

    window.updateHandles = (c) => {
        if (!c) return;
        const t = parseInt(c.style.top) || 0;
        const l = parseInt(c.style.left) || 0;
        const drag = c.querySelector('.lf-drag-handle');
        const del = c.querySelector('.lf-delete-trigger');
        if (drag) { drag.style.top = t < 16 ? '4px' : '-16px'; drag.style.left = l < 16 ? '4px' : '-16px'; }
        if (del) { 
            del.style.top = t < 16 ? '4px' : '-12px'; 
            const rightDist = window.innerWidth - (l + c.offsetWidth);
            del.style.right = rightDist < 16 ? '4px' : '-12px'; 
        }
    };

    document.addEventListener('mouseover', e => {
        const c = e.target.closest('.lf-component');
        if (c) window.updateHandles(c);
    });

    let isMarquee = false;
    document.addEventListener('mousedown', e => {
        if (e.target.closest('.sidebar') || e.target.closest('.modal') || e.target.closest('.header-metadata')) return;

        let h = e.target.closest('.lf-drag-handle'), r = e.target.closest('.lf-resizer'), d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        
        if (c && !h && !r && !d) {
            if (!c.classList.contains('text-marker') && !c.classList.contains('pin-marker')) {
                let parent = c.parentElement.closest('.lf-component');
                while (parent) {
                    if (parent.classList.contains('text-marker') || parent.classList.contains('pin-marker')) break;
                    c = parent;
                    parent = c.parentElement.closest('.lf-component');
                }
            }
        }

        if (d && c) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            if (c.classList.contains('connector-line')) {
                notifyParent({ type: 'LF_DELETE_CONNECTOR', id: c.id });
                c.remove();
            }
            else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                const idx = parseInt(c.id.replace('v4-pin-', ''));
                notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                c.remove();
            } else {
                c.remove();
            }

            markDirty(); 
            notifyParent({ type: 'LF_DESELECT' });
            return; 
        }
        if (c) {
            isMarquee = false;
            const isMulti = e.shiftKey || e.ctrlKey;
            if (isMulti) {
                c.classList.toggle('selected');
            } else {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                c.classList.add('selected');
            }
            window.updateHandles(c);
            notifyParent({ 
                type: "LF_COMP_SELECTED", 
                shiftKey: isMulti,
                ...window._getCompStyles(c)
            });
        } else {
            isMarquee = true;
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            
            const targets = [];
            document.querySelectorAll('.lf-component').forEach(c => {
                targets.push({
                    id: c.id,
                    x: parseFloat(c.style.left) || 0,
                    y: parseFloat(c.style.top) || 0,
                    w: c.offsetWidth,
                    h: c.offsetHeight
                });
            });

            notifyParent({ 
                type: 'LF_MARQUEE_START', 
                x: e.clientX, 
                y: e.clientY,
                shiftKey: e.shiftKey,
                targets: targets
            });
            notifyParent({ type: 'LF_DESELECT' });
        }
        if (r) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            isResizing = true; 
            activeEl = r.parentElement; 
            startX = e.clientX; startY = e.clientY; 
            startW = activeEl.offsetWidth; startH = activeEl.offsetHeight; 
            e.preventDefault(); 
        }
        else if (h || c) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            isDragging = true; activeEl = c; 
            startX = e.clientX; startY = e.clientY; 
            startTop = parseInt(activeEl.style.top) || 0; startLeft = parseInt(activeEl.style.left) || 0; 
            startRect = activeEl.getBoundingClientRect();
            notifyParent({ type: 'LF_SNAP_START' });
            if (h || e.target.closest('.v4-editable-cell')) e.preventDefault(); 
            document.querySelectorAll('.lf-component.selected').forEach(s => s.classList.add('dragging-now'));
        }
    });

    // Double click to enter text editing mode (PPT-style)
    document.addEventListener('dblclick', e => {
        const editable = e.target.closest('.v4-editable-cell');
        if (editable) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            editable.focus();
        }
    });

    let rafId = null;
    document.addEventListener('mousemove', e => {
        if (isMarquee) {
            notifyParent({ type: 'LF_MARQUEE_MOVE', x: e.clientX, y: e.clientY });
            window.getSelection()?.removeAllRanges();
            return;
        }
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (isConnectorDragging) {
                notifyParent({ type: 'LF_CONNECTOR_HANDLE_MOVE', clientX: e.clientX, clientY: e.clientY });
            }
            if (isDragging && activeEl) { 
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;

                if (e.shiftKey) {
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        dy = 0;
                    } else {
                        dx = 0;
                    }
                }

                const scale = (window.parent?.state?.transform?.scale) || 1;
                const logicalX = startLeft + dx / scale;
                const logicalY = startTop + dy / scale;

                notifyParent({ type: 'LF_SNAP_REQUEST', x: logicalX, y: logicalY, w: activeEl.offsetWidth, h: activeEl.offsetHeight });
                markDirty(); 
            }
            else if (isResizing && activeEl) { 
                const nw = Math.max(10, startW + e.clientX - startX);
                const nh = Math.max(10, startH + e.clientY - startY);
                activeEl.style.width = nw + 'px'; 
                activeEl.style.height = nh + 'px'; 
                window.updateHandles(activeEl);
                markDirty(); 
                notifyParent({ type: 'LF_COMP_RESIZED', w: nw, h: nh });
            }
        });
    });

    document.addEventListener('mouseup', () => { 
        if (isConnectorDragging) {
            isConnectorDragging = false;
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_UP' });
        }
        if (isMarquee) {
            isMarquee = false;
            notifyParent({ type: 'LF_MARQUEE_END' });
        }
        if (isDragging && activeEl) {
            notifyParent({ type: 'LF_SNAP_END' });
            
            if (activeEl.classList.contains('text-marker') || activeEl.classList.contains('pin-marker')) {
                const idx = parseInt(activeEl.id.replace('v4-pin-', ''));
                notifyParent({
                    type: 'LF_UPDATE_PIN_POS',
                    index: idx,
                    x: parseFloat(activeEl.style.left) || 0,
                    y: parseFloat(activeEl.style.top) || 0,
                    standardized: true
                });
            }
            if (activeEl.classList.contains('lf-group')) {
                const scale = (window.parent && window.parent.state && window.parent.state.transform) ? window.parent.state.transform.scale : 1;
                const hostRect = document.body.getBoundingClientRect();
                activeEl.querySelectorAll('.text-marker, .pin-marker').forEach(child => {
                    const idx = parseInt(child.id.replace('v4-pin-', ''));
                    if (!isNaN(idx)) {
                        const childRect = child.getBoundingClientRect();
                        const absX = (childRect.left - hostRect.left) / scale;
                        const absY = (childRect.top - hostRect.top) / scale;
                        notifyParent({
                            type: 'LF_UPDATE_PIN_POS',
                            index: idx,
                            x: absX,
                            y: absY,
                            standardized: true
                        });
                    }
                });
            }
        }
        if (isResizing && activeEl) {
            activeEl.setAttribute('data-resized', 'true');
            if (typeof window.enforceDesignSystem === 'function') {
                window.enforceDesignSystem();
            }
        }
        document.querySelectorAll('.lf-component').forEach(s => s.classList.remove('dragging-now'));
        isDragging = false; isResizing = false; activeEl = null; 
    });

    document.addEventListener('input', e => { 
        if (e.target.classList.contains('v4-editable-cell')) {
            markDirty();
            const comp = e.target.closest('.lf-component');
            if (comp) {
                if (comp.querySelector('.v4-checkbox-container') || comp.querySelector('.v4-radio-container')) {
                    if (typeof window.resizeAtomToFitText === 'function') {
                        window.resizeAtomToFitText(comp);
                    } else if (typeof window.enforceDesignSystem === 'function') {
                        window.enforceDesignSystem();
                    }
                }
                // Notify parent of text changes to sync the Quill editor in real-time
                const isPin = comp.classList.contains('text-marker') || comp.classList.contains('pin-marker') || comp.classList.contains('v4-text-box');
                const isShape = !!comp.querySelector('.v4-shape');
                notifyParent({
                    type: 'LF_PIN_TEXT_CHANGED',
                    id: comp.id,
                    html: e.target.innerHTML,
                    isPin: isPin,
                    isShape: isShape
                });
            }
        } 
    });

    document.addEventListener('wheel', e => {
        if (e.ctrlKey) {
            e.preventDefault();
            notifyParent({
                type: 'LF_IFRAME_WHEEL_ZOOM',
                deltaY: e.deltaY,
                clientX: e.clientX,
                clientY: e.clientY
            });
        }
    }, { passive: false });

    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;

        if (d.type === 'LF_SNAP_RESPONSE' && activeEl && isDragging) {
            const curLeft = parseInt(activeEl.style.left) || 0;
            const curTop = parseInt(activeEl.style.top) || 0;
            const snapDx = d.x - curLeft;
            const snapDy = d.y - curTop;
            if (Math.abs(snapDx) > 0.1 || Math.abs(snapDy) > 0.1) {
                const comps = document.querySelectorAll('.lf-component.selected');
                comps.forEach(c => {
                    c.style.left = (parseInt(c.style.left || 0) + snapDx) + 'px';
                    c.style.top = (parseInt(c.style.top || 0) + snapDy) + 'px';
                    window.updateHandles(c);
                });
            }
        }
        else if (d.type === 'LF_IMPORT_PINS') {
            const host = document.body;
            d.pins.forEach((pin, idx) => {
                let div = document.getElementById('v4-pin-' + idx);
                if (div) return;
                
                div = document.createElement('div');
                div.id = 'v4-pin-' + idx;
                host.appendChild(div);
                
                const isPinType = (pin.type === 'pin' || pin.type === undefined);
                div.className = 'lf-component ' + (isPinType ? 'pin-marker' : 'text-marker');
                
                if (isPinType) {
                    div.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                                    '<div class="pin-number-badge" style="pointer-events:none; font-weight:800; font-size:14px; color:#000;">' + (idx + 1) + '</div>' +
                                    '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';
                    div.style.width = '28px';
                    div.style.height = '28px';
                } else {
                    div.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                                    '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:' + (pin.color || '#000') + '">' + (pin.html || pin.text || '') + '</div>' +
                                    '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';
                    div.style.width = 'fit-content';
                    div.style.height = 'auto';
                }
                div.style.zIndex = '1000';

                let xVal = parseFloat(pin.x) || 0;
                let yVal = parseFloat(pin.y) || 0;
                
                if (!pin.standardized && xVal <= 100 && yVal <= 100) {
                    xVal = xVal * 14.4;
                    yVal = yVal * 9.0;
                }

                div.style.left = xVal + 'px';
                div.style.top = yVal + 'px';
                
                window.updateHandles(div);
            });
        }
        else if (d.type === 'LF_REORDER_PINS') {
            document.querySelectorAll('.pin-marker, .text-marker').forEach(el => el.remove());
            const host = document.body;
            const pinsList = d.pins || [];
            pinsList.forEach((pin, idx) => {
                const div = document.createElement('div');
                div.id = 'v4-pin-' + idx;
                host.appendChild(div);
                
                const isPinType = (pin.type === 'pin' || pin.type === undefined);
                div.className = 'lf-component ' + (isPinType ? 'pin-marker' : 'text-marker');
                
                if (isPinType) {
                    div.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                                    '<div class="pin-number-badge" style="pointer-events:none; font-weight:800; font-size:14px; color:#000;">' + (idx + 1) + '</div>' +
                                    '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';
                    div.style.width = '28px';
                    div.style.height = '28px';
                } else {
                    div.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                                    '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:' + (pin.color || '#000') + '">' + (pin.html || pin.text || '') + '</div>' +
                                    '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';
                    div.style.width = 'fit-content';
                    div.style.height = 'auto';
                }
                div.style.zIndex = '1000';

                let xVal = parseFloat(pin.x) || 0;
                let yVal = parseFloat(pin.y) || 0;
                
                if (!pin.standardized && xVal <= 100 && yVal <= 100) {
                    xVal = xVal * 14.4;
                    yVal = yVal * 9.0;
                }

                div.style.left = xVal + 'px';
                div.style.top = yVal + 'px';
                
                window.updateHandles(div);
            });
        }
        else if (d.type === 'LF_RENDER_CONNECTORS') {
            if (window.parent && window.parent.DEBUG_MODE) {
                console.log("[V4 Iframe] LF_RENDER_CONNECTORS received:", d);
            }
            const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
            if (window.parent && window.parent.DEBUG_MODE) {
                console.log("[V4 Iframe] Host for connectors:", host);
            }
            document.querySelectorAll('.connector-line').forEach(el => el.remove());
            const connectors = d.connectors || [];
            const selectedIds = d.selectedIds || [];
            
            connectors.forEach(conn => {
                const isSelected = selectedIds.includes(conn.id);
                const baseWidth = parseFloat(conn.style.strokeWidth || 1.6);
                const width = isSelected ? (baseWidth + 1) : baseWidth;
                const color = conn.style.stroke || '#475569';
                
                const headLength = Math.max(12, baseWidth * 4.5);
                const padding = headLength + 10;
                const minX = Math.min(conn.start.x, conn.end.x) - padding;
                const minY = Math.min(conn.start.y, conn.end.y) - padding;
                const maxX = Math.max(conn.start.x, conn.end.x) + padding;
                const maxY = Math.max(conn.start.y, conn.end.y) + padding;
                const w = maxX - minX;
                const h = maxY - minY;

                if (isNaN(w) || isNaN(h)) return;

                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.id = conn.id;
                svg.setAttribute("class", "lf-component connector-line" + (isSelected ? " selected" : ""));
                Object.assign(svg.style, {
                    position: 'absolute',
                    left: minX + 'px',
                    top: minY + 'px',
                    width: w + 'px',
                    height: h + 'px',
                    pointerEvents: 'none',
                    zIndex: isSelected ? '10001' : '9999',
                    overflow: 'visible'
                });

                const rel = (pt) => ({ x: pt.x - minX, y: pt.y - minY });
                const rStart = rel(conn.start);
                const rEnd = rel(conn.end);

                const calculatePathData = (c, s, e) => {
                    if (c.type === 'straight') return 'M ' + s.x + ' ' + s.y + ' L ' + e.x + ' ' + e.y;
                    const midX = (s.x + e.x) / 2;
                    return 'M ' + s.x + ' ' + s.y + ' H ' + midX + ' V ' + e.y + ' H ' + e.x;
                };
                const pathData = calculatePathData(conn, rStart, rEnd);

                const startMId = 'm-start-' + conn.id;
                const endMId = 'm-end-' + conn.id;

                svg.innerHTML = '<defs>' +
                    '<marker id="' + startMId + '" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
                        '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + color + '" />' +
                    '</marker>' +
                    '<marker id="' + endMId + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
                        '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + color + '" />' +
                    '</marker>' +
                '</defs>' +
                '<path d="' + pathData + '" stroke="transparent" stroke-width="40" fill="none" style="cursor:pointer; pointer-events:auto;" class="connector-hit-area" />' +
                '<path d="' + pathData + '" stroke="' + color + '" stroke-width="' + width + '" fill="none" ' +
                      'marker-start="' + (conn.style.markerStart ? 'url(#' + startMId + ')' : '') + '" ' +
                      'marker-end="' + (conn.style.markerEnd ? 'url(#' + endMId + ')' : '') + '" ' +
                      'style="pointer-events:none;" ' +
                      (conn.style.dashArray ? 'stroke-dasharray="' + conn.style.dashArray + '"' : '') + ' />';

                const hitArea = svg.querySelector('.connector-hit-area');
                if (hitArea) {
                    hitArea.onmousedown = (e) => {
                        e.stopPropagation();
                        notifyParent({ type: 'LF_CONNECTOR_CLICKED', id: conn.id, shiftKey: e.shiftKey });
                    };
                }

                if (isSelected) {
                    ['start', 'end'].forEach(type => {
                        const pt = rel(conn[type]);
                        const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        handle.setAttribute("cx", pt.x); handle.setAttribute("cy", pt.y);
                        handle.setAttribute("r", 6); handle.setAttribute("fill", "#3b82f6");
                        handle.setAttribute("stroke", "#fff"); handle.setAttribute("stroke-width", "2");
                        handle.style.cursor = 'crosshair'; handle.style.pointerEvents = 'auto';
                        handle.onmousedown = (e) => {
                            e.stopPropagation();
                            isConnectorDragging = true;
                            notifyParent({ type: 'LF_CONNECTOR_HANDLE_DOWN', id: conn.id, pointType: type });
                        };
                        svg.appendChild(handle);
                    });
                }
                host.appendChild(svg);
            });
        }
        else if (d.type === 'LF_REQUEST_SAVE_CONTENT') {
            const c = document.documentElement.cloneNode(true);
            c.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
            c.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
            notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: "<!DOCTYPE html>\\n" + c.outerHTML });
        } else if (d.type === 'LF_INSERT_COMPONENT' || d.type === 'LF_INSERT_V4_COMP') {
            const host = document.body;
            const vh = window.innerHeight;
            const vw = window.innerWidth;
            const sY = window.scrollY;
            const sX = window.scrollX;
            
            const isPinMarker = d.className && d.className.includes('pin-marker');
            const compW = isPinMarker ? 28 : ((d.style && d.style.width) ? parseInt(d.style.width) || 200 : 200);
            const compH = isPinMarker ? 28 : ((d.style && d.style.height) ? parseInt(d.style.height) || 100 : 100);
            
            const centerTop = sY + (vh - compH) / 2;
            const centerLeft = sX + (vw - compW) / 2;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const v = document.createElement('div'); 
            v.id = d.id || ('v4-comp-' + Date.now()); 
            v.style.position = 'absolute'; 
            v.style.top = centerTop + 'px'; 
            v.style.left = centerLeft + 'px'; 
            v.style.zIndex = '1000';

            if (isPinMarker) {
                const idx = parseInt(d.id.replace('v4-pin-', '')) || 0;
                v.className = 'lf-component pin-marker';
                v.style.width = '28px';
                v.style.height = '28px';
                v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                              '<div class="pin-number-badge" style="pointer-events:none; font-weight:800; font-size:14px; color:#000;">' + (idx + 1) + '</div>' +
                              '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';
            } else {
                v.className = 'lf-component' + (d.isGroup ? ' lf-group' : '') + (d.className ? ' ' + d.className : ''); 
                v.style.transform = 'none';
                if (d.style) Object.assign(v.style, d.style);
                v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + d.html + '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';
            }
            
            if (window.parent.state && window.parent.state.transform) {
                const s = window.parent.state.transform.scale || 1;
                if (s < 1) {
                    const bw = parseInt(v.style.width) || 200;
                    const bh = parseInt(v.style.height) || 100;
                    if (s < 0.8 && !d.isGroup) {
                        v.style.width = Math.round(bw / s) + 'px';
                        v.style.height = Math.round(bh / s) + 'px';
                    }
                }
            }
            
            const children = Array.from(v.children).filter(c => c.classList.contains('lf-component') || c.classList.contains('lf-group'));
            if (children.length === 1) {
                const inner = children[0];
                const l = parseInt(inner.style.left) || 0;
                const t = parseInt(inner.style.top) || 0;
                if (l !== 0 || t !== 0) {
                    inner.style.left = '0px';
                    inner.style.top = '0px';
                    if (inner.style.width) v.style.width = inner.style.width;
                    if (inner.style.height) v.style.height = inner.style.height;
                }
            }
            
            host.appendChild(v);
            document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            v.classList.add('selected');
            const styles = window._getCompStyles(v);
            notifyParent({ 
                type: 'LF_COMP_SELECTED', 
                ...styles
            });
            markDirty();
        } else if (d.type === 'LF_INSERT_COMPONENTS') {
            const host = document.body;
            const comps = d.components || [];
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            comps.forEach(c => {
                const v = document.createElement('div');
                v.id = c.id || ('v4-comp-' + Date.now() + Math.random());
                v.className = 'lf-component selected' + (c.isGroup ? ' lf-group' : '') + (c.className ? ' ' + c.className : '');
                
                v.style.position = 'absolute';
                v.style.left = (parseFloat(c.x) || 0) + 'px';
                v.style.top = (parseFloat(c.y) || 0) + 'px';
                v.style.width = c.width || '200px';
                v.style.height = c.height || '100px';
                v.style.zIndex = '1000';
                v.style.transform = 'none !important';

                if (c.style) Object.assign(v.style, c.style);

                v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + (c.html || '') + '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';
                host.appendChild(v);
                window.updateHandles(v);
            });
            markDirty();
        } else if (d.type === 'LF_SELECT_ID') {
            const el = document.getElementById(d.id);
            if (el) {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
                window.updateHandles(el);
                notifyParent({
                    type: 'LF_COMP_SELECTED',
                    shiftKey: false,
                    ...window._getCompStyles(el)
                });
            }
        }
        else if (d.type === 'LF_UPDATE_PIN_CONTENT') {
            const selected = document.querySelector('.lf-component.text-marker.selected');
            if (selected) {
                const cell = selected.querySelector('.v4-editable-cell');
                if (cell) {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    cell.innerHTML = d.html;
                    markDirty();
                }
            }
        }
        else if (d.type === 'LF_UPDATE_SHAPE_TEXT') {
            const s = document.querySelector('.lf-component.selected'); 
            if (!s) return;
            const shape = s.querySelector('.v4-shape');
            if (!shape) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const isSvgShape = shape.classList.contains('v4-shape-diamond') || 
                               shape.classList.contains('v4-shape-triangle') || 
                               shape.classList.contains('v4-shape-wave');

            if (isSvgShape) {
                let textOverlay = shape.querySelector('.v4-shape-text-overlay');
                if (!textOverlay) {
                    textOverlay = document.createElement('div');
                    textOverlay.className = 'v4-shape-text-overlay';
                    textOverlay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;text-align:center;pointer-events:none;padding:4px;box-sizing:border-box;z-index:2;';
                    shape.style.position = 'relative';
                    shape.appendChild(textOverlay);
                }
                textOverlay.innerHTML = d.html;
            } else {
                let textContainer = shape.querySelector('.v4-shape-text-content');
                if (!textContainer) {
                    const existingContent = shape.innerHTML;
                    textContainer = document.createElement('div');
                    textContainer.className = 'v4-shape-text-content';
                    textContainer.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:8px;box-sizing:border-box;overflow:hidden;';
                    shape.innerHTML = '';
                    textContainer.innerHTML = existingContent;
                    shape.appendChild(textContainer);
                }
                textContainer.innerHTML = d.html;
            }
            markDirty();
        }
        else if (d.type === 'LF_UPDATE_ATOM_STATE') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
            if (container) {
                container.setAttribute('data-checked', d.checked ? 'true' : 'false');
                const inner = container.querySelector('.v4-checkbox, .v4-radio');
                if (inner) {
                    if (d.checked) {
                        inner.style.backgroundColor = 'rgb(50, 50, 50)';
                        inner.style.borderColor = 'rgb(255, 255, 255)';
                    } else {
                        inner.style.backgroundColor = 'rgb(250, 250, 250)';
                        inner.style.borderColor = 'rgb(150, 150, 150)';
                    }
                }
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_ACCORDION_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-accordion-container') || (s.classList.contains('v4-accordion-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.headerText !== undefined) {
                    const titleText = container.querySelector('.v4-accordion-title-text');
                    if (titleText && titleText.innerText !== d.headerText) {
                        titleText.innerText = d.headerText;
                    }
                }
                
                if (d.expanded !== undefined) {
                    container.setAttribute('data-expanded', d.expanded ? 'true' : 'false');
                }
                
                if (d.subCount !== undefined || d.subTexts !== undefined) {
                    const body = container.querySelector('.v4-accordion-body');
                    if (body) {
                        const targetCount = d.subCount !== undefined ? d.subCount : (parseInt(container.getAttribute('data-sub-count')) || 0);
                        container.setAttribute('data-sub-count', targetCount);
                        
                        const existingItems = Array.from(body.querySelectorAll('.v4-accordion-item'));
                        const currentTexts = d.subTexts || existingItems.map(item => item.innerText);
                        
                        body.innerHTML = '';
                        for (let i = 0; i < targetCount; i++) {
                            const itemText = currentTexts[i] !== undefined ? currentTexts[i] : "Sub Item " + (i + 1);
                            const isLast = (i === targetCount - 1);
                            
                            const itemEl = document.createElement('div');
                            itemEl.className = 'v4-accordion-item v4-editable-cell';
                            itemEl.contentEditable = 'true';
                            itemEl.style.cssText = "padding:8px 12px; font-size:12px; color:#cccccc; font-family:'Inter',sans-serif; outline:none; -webkit-user-select:text; user-select:text;";
                            if (!isLast) {
                                itemEl.style.borderBottom = '1.6px solid rgba(255,255,255,0.05)';
                            }
                            itemEl.innerText = itemText;
                            body.appendChild(itemEl);
                        }
                    }
                }
                
                if (d.bg !== undefined) {
                    container.style.backgroundColor = d.bg;
                }
                if (d.border !== undefined) {
                    container.style.borderColor = d.border;
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_GRID_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-grid-container') || (s.classList.contains('v4-grid-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.headers !== undefined) {
                    const headerCells = Array.from(container.querySelectorAll('.v4-grid-header-row .v4-grid-cell')).slice(1);
                    d.headers.forEach((headerText, index) => {
                        if (headerCells[index]) {
                            headerCells[index].innerText = headerText + ' ⇅';
                        }
                    });
                }
                
                if (d.pagination !== undefined) {
                    container.setAttribute('data-pagination', d.pagination ? 'true' : 'false');
                    const footer = container.querySelector('.v4-grid-footer');
                    if (footer) footer.style.display = d.pagination ? 'flex' : 'none';
                }
                
                if (d.rowCount !== undefined) {
                    const count = Math.min(20, Math.max(1, parseInt(d.rowCount) || 5));
                    container.setAttribute('data-row-count', count);
                    const body = container.querySelector('.v4-grid-body');
                    if (body) {
                        body.innerHTML = '';
                        const mockList = [
                            { no: '1024', name: '[헤지스] 여름 맞이 린넨 셔츠 특가 라이브', status: '방송중', statusColor: '#10b981', statusBg: 'rgba(52,211,153,0.15)', author: '김엘에프' },
                            { no: '1023', name: '[닥스] 프리미엄 실크 타이 단독 런칭 쇼', status: '방송예정', statusColor: '#d97706', statusBg: 'rgba(251,191,36,0.15)', author: '이닥스' },
                            { no: '1022', name: '[라푸마] 아웃도어 바람막이 클리어런스 세일', status: '방송종료', statusColor: '#ef4444', statusBg: 'rgba(239,68,68,0.1)', author: '박라푸마' },
                            { no: '1021', name: '[질스튜어트] 봄 신상 스니커즈 한정 라이브', status: '방송중', statusColor: '#10b981', statusBg: 'rgba(52,211,153,0.15)', author: '최질스' },
                            { no: '1020', name: '[바네사브루노] 가을 컬렉션 룩북 공개 생방송', status: '방송예정', statusColor: '#d97706', statusBg: 'rgba(251,191,36,0.15)', author: '정바네' },
                            { no: '1019', name: '[아떼] 비건 뷰티 립스틱 신제품 메이크업 라이브', status: '방송중', statusColor: '#10b981', statusBg: 'rgba(52,211,153,0.15)', author: '송아떼' },
                            { no: '1018', name: '[헤지스 골프] 기능성 필드웨어 특가전', status: '방송종료', statusColor: '#ef4444', statusBg: 'rgba(239,68,68,0.1)', author: '한골프' }
                        ];
                        for (let i = 0; i < count; i++) {
                            const data = mockList[i % mockList.length];
                            const isLast = (i === count - 1);
                            const borderBottom = isLast ? 'none' : '1.6px solid rgb(226,232,240)';
                            
                            const rowEl = document.createElement('div');
                            rowEl.className = 'v4-grid-row';
                            rowEl.style.cssText = 'display:grid; grid-template-columns:50px 100px 1fr 120px 120px; height:36px; border-bottom:' + borderBottom + '; box-sizing:border-box; background:#ffffff;';
                            rowEl.innerHTML = '<div class="v4-grid-cell" style="display:flex; align-items:center; justify-content:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;"><input type="checkbox"></div>' +
                                              '<div class="v4-grid-cell" style="display:flex; align-items:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; color:#334155;">' + data.no + '</div>' +
                                              '<div class="v4-grid-cell" style="display:flex; align-items:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; color:#0f172a; font-weight:500;">' + data.name + '</div>' +
                                              '<div class="v4-grid-cell" style="display:flex; align-items:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;"><span style="background:' + data.statusBg + '; color:' + data.statusColor + '; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">' + data.status + '</span></div>' +
                                              '<div class="v4-grid-cell" style="display:flex; align-items:center; padding:0 8px; font-size:12px; color:#64748b;">' + data.author + '</div>';
                            body.appendChild(rowEl);
                        }
                    }
                }
                
                if (d.bg !== undefined) {
                    container.style.backgroundColor = d.bg;
                }
                if (d.border !== undefined) {
                    container.style.borderColor = d.border;
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_ATOM_TEXT_ENABLED') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
            if (container) {
                container.setAttribute('data-text-enabled', d.enabled ? 'true' : 'false');
                s.removeAttribute('data-resized');
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_STEPPER_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-stepper-container') || (s.classList.contains('v4-stepper-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.minVal !== undefined) container.setAttribute('data-min', d.minVal);
                if (d.maxVal !== undefined) container.setAttribute('data-max', d.maxVal);
                if (d.disabled !== undefined) container.setAttribute('data-disabled', d.disabled ? 'true' : 'false');
                
                if (d.btnEnabled !== undefined) {
                    container.setAttribute('data-btn-enabled', d.btnEnabled ? 'true' : 'false');
                    const actBtn = container.querySelector('.v4-stepper-action');
                    if (actBtn) actBtn.style.display = d.btnEnabled ? 'inline-flex' : 'none';
                    s.style.width = d.btnEnabled ? '154px' : '100px';
                }
                if (d.btnText !== undefined) {
                    container.setAttribute('data-btn-text', d.btnText);
                    const actBtn = container.querySelector('.v4-stepper-action');
                    if (actBtn) actBtn.innerText = d.btnText;
                }
                
                const min = parseInt(container.getAttribute('data-min')) || 1;
                const max = parseInt(container.getAttribute('data-max')) || 99;
                let curVal = parseInt(container.getAttribute('data-val')) || min;
                
                if (d.minVal !== undefined) curVal = min;
                curVal = Math.max(min, Math.min(max, curVal));
                container.setAttribute('data-val', curVal);
                
                const valEl = container.querySelector('.v4-stepper-value');
                if (valEl) valEl.innerText = curVal;
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_SELECTBOX_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-selectbox-container') || (s.classList.contains('v4-selectbox-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.defaultText !== undefined) {
                    container.setAttribute('data-default-text', d.defaultText);
                    const selectedText = container.querySelector('.v4-selectbox-selected-text');
                    if (selectedText) selectedText.innerText = d.defaultText;
                }
                
                if (d.dropdownActive !== undefined) {
                    container.setAttribute('data-dropdown-active', d.dropdownActive ? 'true' : 'false');
                    const optionsList = container.querySelector('.v4-selectbox-options');
                    if (optionsList) optionsList.style.display = d.dropdownActive ? 'block' : 'none';
                }
                
                if (d.options !== undefined) {
                    const optionsArr = Array.isArray(d.options) ? d.options : d.options.split(',');
                    const cleanOptions = optionsArr.map(o => o.trim()).filter(Boolean);
                    container.setAttribute('data-options', cleanOptions.join(','));
                    
                    const optionsList = container.querySelector('.v4-selectbox-options');
                    if (optionsList) {
                        optionsList.innerHTML = cleanOptions.map((opt, idx) => {
                            const isLast = idx === cleanOptions.length - 1;
                            const borderStyle = isLast ? '' : ' border-bottom: 1.6px solid #f3f4f6;';
                            return '<div class="v4-selectbox-option" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 12px; color: #374151;' + borderStyle + ' box-sizing: border-box;">' + opt + '</div>';
                        }).join('');
                    }
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_FILEUPLOAD_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-fileupload-container') || (s.classList.contains('v4-fileupload-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.fileSelected !== undefined) container.setAttribute('data-selected', d.fileSelected ? 'true' : 'false');
                if (d.fileName !== undefined) container.setAttribute('data-file-name', d.fileName);
                if (d.fileButtonText !== undefined) {
                    container.setAttribute('data-button-text', d.fileButtonText);
                    const btn = container.querySelector('.v4-fileupload-button');
                    if (btn) btn.innerText = d.fileButtonText;
                }
                if (d.filePlaceholder !== undefined) container.setAttribute('data-placeholder', d.filePlaceholder);
                
                const isSel = container.getAttribute('data-selected') === 'true';
                const fName = container.getAttribute('data-file-name') || '';
                const placeholder = container.getAttribute('data-placeholder') || '선택된 파일 없음';
                const txt = container.querySelector('.v4-fileupload-textbox');
                if (txt) {
                    txt.innerText = isSel ? fName : placeholder;
                    txt.style.color = isSel ? '#374151' : '#9ca3af';
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_ALERT_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-alert-container') || (s.classList.contains('v4-alert-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.messageText !== undefined) {
                    container.setAttribute('data-message', d.messageText);
                    const msgEl = container.querySelector('.v4-alert-message');
                    if (msgEl) msgEl.innerHTML = d.messageText.replace(/\\n/g, '<br>');
                }
                if (d.showDesc !== undefined) {
                    container.setAttribute('data-show-desc', d.showDesc ? 'true' : 'false');
                    const descWrapper = container.querySelector('.v4-alert-desc-wrapper');
                    if (descWrapper) descWrapper.style.display = d.showDesc ? 'flex' : 'none';
                }
                if (d.descText !== undefined) {
                    container.setAttribute('data-desc', d.descText);
                    const descBadge = container.querySelector('.v4-alert-desc-badge');
                    if (descBadge) descBadge.innerText = d.descText;
                }
                if (d.btnCount !== undefined) container.setAttribute('data-btn-count', d.btnCount);
                if (d.btnText1 !== undefined) {
                    container.setAttribute('data-btn-text-1', d.btnText1);
                    const btn = container.querySelector('.v4-alert-btn-1');
                    if (btn) btn.innerText = d.btnText1;
                }
                if (d.btnText2 !== undefined) {
                    container.setAttribute('data-btn-text-2', d.btnText2);
                    const btn = container.querySelector('.v4-alert-btn-2');
                    if (btn) btn.innerText = d.btnText2;
                }
                if (d.btnText3 !== undefined) {
                    container.setAttribute('data-btn-text-3', d.btnText3);
                    const btn = container.querySelector('.v4-alert-btn-3');
                    if (btn) btn.innerText = d.btnText3;
                }
                if (d.btnStyle1 !== undefined) container.setAttribute('data-btn-style-1', d.btnStyle1);
                if (d.btnStyle2 !== undefined) container.setAttribute('data-btn-style-2', d.btnStyle2);
                if (d.btnStyle3 !== undefined) container.setAttribute('data-btn-style-3', d.btnStyle3);
                
                const count = parseInt(container.getAttribute('data-btn-count')) || 1;
                const btn1 = container.querySelector('.v4-alert-btn-1');
                const btn2 = container.querySelector('.v4-alert-btn-2');
                const btn3 = container.querySelector('.v4-alert-btn-3');
                if (btn1) {
                    btn1.style.display = count >= 1 ? 'flex' : 'none';
                    btn1.className = 'v4-alert-btn v4-alert-btn-1 style-' + (container.getAttribute('data-btn-style-1') || 'normal');
                }
                if (btn2) {
                    btn2.style.display = count >= 2 ? 'flex' : 'none';
                    btn2.className = 'v4-alert-btn v4-alert-btn-2 style-' + (container.getAttribute('data-btn-style-2') || 'normal');
                }
                if (btn3) {
                    btn3.style.display = count >= 3 ? 'flex' : 'none';
                    btn3.className = 'v4-alert-btn v4-alert-btn-3 style-' + (container.getAttribute('data-btn-style-3') || 'normal');
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_BUTTON_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-btn-container') || (s.classList.contains('v4-btn-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.buttonText !== undefined) {
                    container.setAttribute('data-text', d.buttonText);
                    const btn = container.querySelector('.v4-custom-btn');
                    if (btn) btn.innerText = d.buttonText;
                }
                if (d.buttonStyle !== undefined) {
                    container.setAttribute('data-btn-style', d.buttonStyle);
                    const btn = container.querySelector('.v4-custom-btn');
                    if (btn) btn.className = 'v4-custom-btn style-' + d.buttonStyle;
                }
                if (d.buttonRadius !== undefined) {
                    container.setAttribute('data-btn-radius', d.buttonRadius);
                    const btn = container.querySelector('.v4-custom-btn');
                    if (btn) btn.style.borderRadius = d.buttonRadius + 'px';
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_DATEPICKER') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-datepicker-container') || (s.classList.contains('v4-datepicker-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();

                const _fmt = (dt) => {
                    const y = dt.getFullYear();
                    const m = String(dt.getMonth() + 1).padStart(2, '0');
                    const dd = String(dt.getDate()).padStart(2, '0');
                    return y + '/' + m + '/' + dd;
                };

                const _applyPreset = (preset) => {
                    const today = new Date();
                    let startDt = null;
                    let endDt = today;
                    if (preset === '1D') { startDt = new Date(today); startDt.setDate(today.getDate() - 1); }
                    else if (preset === '1W') { startDt = new Date(today); startDt.setDate(today.getDate() - 7); }
                    else if (preset === '1M') { startDt = new Date(today); startDt.setMonth(today.getMonth() - 1); }
                    else if (preset === '6M') { startDt = new Date(today); startDt.setMonth(today.getMonth() - 6); }
                    else if (preset === 'all') { startDt = null; endDt = null; }
                    return { start: startDt ? _fmt(startDt) : '', end: endDt ? _fmt(endDt) : '' };
                };

                if (d.showPresets !== undefined) {
                    container.setAttribute('data-show-presets', d.showPresets ? 'true' : 'false');
                    const presetsDiv = container.querySelector('.v4-dp-presets');
                    if (presetsDiv) presetsDiv.style.display = d.showPresets ? 'inline-flex' : 'none';
                }

                if (d.showEndDate !== undefined) {
                    container.setAttribute('data-show-end-date', d.showEndDate ? 'true' : 'false');
                    const sep = container.querySelector('.v4-dp-separator');
                    const groups = container.querySelectorAll('.v4-dp-input-group');
                    if (sep) sep.style.display = d.showEndDate ? 'inline-flex' : 'none';
                    if (groups && groups.length > 1) {
                        groups[1].style.display = d.showEndDate ? 'inline-flex' : 'none';
                    }
                }

                if (d.defaultPreset !== undefined) {
                    container.setAttribute('data-default-preset', d.defaultPreset);
                    container.querySelectorAll('.v4-dp-preset-btn').forEach(btn => {
                        const isActive = btn.getAttribute('data-preset') === d.defaultPreset;
                        btn.style.background = isActive ? '#1d4ed8' : '#ffffff';
                        btn.style.borderColor = isActive ? '#1d4ed8' : '#cccccc';
                        btn.style.color = isActive ? '#ffffff' : '#374151';
                        btn.style.fontWeight = isActive ? '700' : '600';
                        if (isActive) btn.classList.add('v4-dp-preset-active');
                        else btn.classList.remove('v4-dp-preset-active');
                    });
                    if (d.defaultPreset !== 'none') {
                        const computed = _applyPreset(d.defaultPreset);
                        container.setAttribute('data-start-date', computed.start);
                        container.setAttribute('data-end-date', computed.end);
                        const startEl = container.querySelector('.v4-dp-start');
                        const endEl = container.querySelector('.v4-dp-end');
                        if (startEl && startEl.innerText !== computed.start) startEl.innerText = computed.start;
                        if (endEl && endEl.innerText !== computed.end) endEl.innerText = computed.end;
                    }
                }

                if (d.startDate !== undefined) {
                    container.setAttribute('data-start-date', d.startDate);
                    const startEl = container.querySelector('.v4-dp-start');
                    if (startEl && startEl.innerText !== d.startDate) startEl.innerText = d.startDate;
                }
                if (d.endDate !== undefined) {
                    container.setAttribute('data-end-date', d.endDate);
                    const endEl = container.querySelector('.v4-dp-end');
                    if (endEl && endEl.innerText !== d.endDate) endEl.innerText = d.endDate;
                }

                markDirty();

                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_TEXTBOX_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-textbox-container, .v4-textarea-container') || (s.classList.contains('v4-textbox-container') || s.classList.contains('v4-textarea-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.placeholderText !== undefined) {
                    const ph = container.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder');
                    if (ph) ph.textContent = d.placeholderText;
                    container.setAttribute('data-placeholder', d.placeholderText);
                }
                if (d.maxLength !== undefined) container.setAttribute('data-maxlength', d.maxLength);
                if (d.showCounter !== undefined) container.setAttribute('data-show-counter', d.showCounter ? 'true' : 'false');
                if (d.fontSize !== undefined) {
                    const input = container.querySelector('.v4-textbox-input, .v4-textarea-input');
                    const placeholder = container.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder');
                    if (input) input.style.fontSize = d.fontSize + 'px';
                    if (placeholder) placeholder.style.fontSize = d.fontSize + 'px';
                    container.setAttribute('data-fontsize', d.fontSize);
                }
                if (d.fontFamily !== undefined) {
                    const input = container.querySelector('.v4-textbox-input, .v4-textarea-input');
                    const placeholder = container.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder');
                    const counter = container.querySelector('.v4-textbox-counter, .v4-textarea-counter');
                    if (input) input.style.fontFamily = d.fontFamily;
                    if (placeholder) placeholder.style.fontFamily = d.fontFamily;
                    if (counter) counter.style.fontFamily = d.fontFamily;
                    container.setAttribute('data-fontfamily', d.fontFamily);
                }
                
                const input = container.querySelector('.v4-textbox-input, .v4-textarea-input');
                if (input) input.dataset.eventsBound = "false";
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
            }
        }
        else if (d.type === 'LF_UPDATE_STYLE') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            let t = d.selector ? s.querySelector(d.selector) : s;
            if (!t && s.classList.contains('text-marker')) {
                t = s.querySelector('.v4-editable-cell') || s;
            }
            const boxEl = s.querySelector('.v4-checkbox, .v4-radio');
            if (boxEl && !d.selector) t = boxEl;
            
            const inputContainer = s.querySelector('.v4-textbox-container, .v4-textarea-container');
            if (inputContainer && !d.selector) t = inputContainer;
            
            const alertContainer = s.querySelector('.v4-alert-container');
            const alertDialog = alertContainer ? alertContainer.querySelector('.v4-alert-dialog') : null;
            if (alertDialog && !d.selector) t = alertDialog;
            else if (alertContainer && !d.selector) t = alertContainer;
            
            const buttonContainer = s.querySelector('.v4-btn-container');
            const customBtn = s.querySelector('.v4-custom-btn');
            if (buttonContainer && customBtn && !d.selector) t = customBtn;
            if (!t) return;
            
            if (d.style) {
                if (d.style.width !== undefined || d.style.height !== undefined) {
                    s.setAttribute('data-resized', 'true');
                }
                if (d.style.html !== undefined) t.innerHTML = d.style.html;
                
                const isInnerBox = t.classList.contains('v4-checkbox') || t.classList.contains('v4-radio');
                
                if (d.style.width !== undefined) {
                    if (isInnerBox) {
                        t.style.width = d.style.width;
                    } else {
                        s.style.width = d.style.width;
                        if (inputContainer) inputContainer.style.width = '100%';
                        if (alertContainer) alertContainer.style.width = '100%';
                        if (buttonContainer) buttonContainer.style.width = '100%';
                    }
                }
                if (d.style.height !== undefined) {
                    if (isInnerBox) {
                        t.style.height = d.style.height;
                    } else {
                        s.style.height = d.style.height;
                        if (inputContainer) inputContainer.style.height = '100%';
                        if (alertContainer) alertContainer.style.height = '100%';
                        if (buttonContainer) buttonContainer.style.height = '100%';
                    }
                }

                const styleToAssign = { ...d.style };
                if (!isInnerBox) {
                    delete styleToAssign.width;
                    delete styleToAssign.height;
                }
                Object.assign(t.style, styleToAssign);
                
                const svgShape = t.querySelector('path, polygon, rect, circle');
                if (svgShape) {
                    if (d.style.backgroundColor || d.style.background) {
                        svgShape.style.fill = d.style.backgroundColor || d.style.background;
                        if (t.classList.contains('v4-shape-diamond') || t.classList.contains('v4-shape-triangle') || t.classList.contains('v4-shape-wave')) {
                            t.style.backgroundColor = 'transparent';
                        }
                    }
                    if (d.style.borderColor) {
                        svgShape.style.stroke = d.style.borderColor;
                        svgShape.style.strokeWidth = "1.6";
                    }
                }

                const isIconComp = s.querySelector('.lf-icon') || s.querySelector('img');
                if (isIconComp && d.style.color) {
                    const iconColor = d.style.color;
                    const innerSvg = t.querySelector('svg') || (t.tagName.toLowerCase() === 'svg' ? t : null);
                    if (innerSvg) {
                        innerSvg.style.color = iconColor;
                        if (innerSvg.getAttribute('stroke') && innerSvg.getAttribute('stroke') !== 'none') {
                            innerSvg.style.stroke = iconColor;
                        }
                        if (innerSvg.getAttribute('fill') && innerSvg.getAttribute('fill') !== 'none') {
                            innerSvg.style.fill = iconColor;
                        }
                        
                        if (t.classList.contains('v4-checkbox')) {
                            const checkmark = innerSvg.querySelector('polyline, path');
                            if (checkmark) checkmark.style.stroke = iconColor;
                        } else {
                            const paths = innerSvg.querySelectorAll('path, line, polyline, polygon, rect, circle');
                            paths.forEach(p => {
                                if (p.getAttribute('stroke') && p.getAttribute('stroke') !== 'none') p.style.stroke = iconColor;
                                if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') p.style.fill = iconColor;
                            });
                        }
                    }
                    
                    const innerDot = t.querySelector('.v4-radio div') || (t.classList.contains('v4-radio') ? t.querySelector('div') : null);
                    if (innerDot) {
                        innerDot.style.backgroundColor = iconColor;
                    }
                    
                    if (!innerSvg && !innerDot) {
                        t.style.filter = 'none';
                        if (t.tagName.toLowerCase() === 'img') {
                            let origSrc = t.getAttribute('data-original-src');
                            if (!origSrc) {
                                origSrc = t.src;
                                t.setAttribute('data-original-src', origSrc);
                            }
                            t.style.webkitMaskImage = 'url("' + origSrc + '")';
                            t.style.webkitMaskSize = 'contain';
                            t.style.webkitMaskPosition = 'center';
                            t.style.webkitMaskRepeat = 'no-repeat';
                            
                            t.style.maskImage = 'url("' + origSrc + '")';
                            t.style.maskSize = 'contain';
                            t.style.maskPosition = 'center';
                            t.style.maskRepeat = 'no-repeat';
                            
                            t.style.backgroundColor = iconColor;
                            t.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'/>";
                        } else {
                            const origBg = t.getAttribute('data-original-bg') || window.getComputedStyle(t).backgroundImage;
                            const origPos = t.getAttribute('data-original-pos') || window.getComputedStyle(t).backgroundPosition;
                            const origSize = t.getAttribute('data-original-size') || window.getComputedStyle(t).backgroundSize;
                            
                            if (origBg && origBg !== 'none') {
                                if (!t.getAttribute('data-original-bg')) {
                                    t.setAttribute('data-original-bg', origBg);
                                    t.setAttribute('data-original-pos', origPos);
                                    t.setAttribute('data-original-size', origSize);
                                }
                                
                                t.style.setProperty('webkit-mask-image', origBg, 'important');
                                t.style.setProperty('webkit-mask-position', origPos, 'important');
                                t.style.setProperty('webkit-mask-size', origSize, 'important');
                                t.style.setProperty('webkit-mask-repeat', 'no-repeat', 'important');
                                
                                t.style.setProperty('mask-image', origBg, 'important');
                                t.style.setProperty('mask-position', origPos, 'important');
                                t.style.setProperty('mask-size', origSize, 'important');
                                t.style.setProperty('mask-repeat', 'no-repeat', 'important');
                                
                                t.style.setProperty('background-color', iconColor, 'important');
                                t.style.setProperty('background-image', 'none', 'important');
                                
                                const computedPadding = window.getComputedStyle(t).paddingTop;
                                const hasPadding = (t.style.padding && t.style.padding !== '0px') || (computedPadding && computedPadding !== '0px' && computedPadding !== '0');
                                if (hasPadding) {
                                    t.style.setProperty('webkit-mask-origin', 'content-box', 'important');
                                    t.style.setProperty('webkit-mask-clip', 'content-box', 'important');
                                    t.style.setProperty('mask-origin', 'content-box', 'important');
                                    t.style.setProperty('mask-clip', 'content-box', 'important');
                                    t.style.setProperty('background-origin', 'content-box', 'important');
                                    t.style.setProperty('background-clip', 'content-box', 'important');
                                }
                            }
                        }
                    }
                }
            }
            
            if (d.subSelector && d.subStyle) {
                t.querySelectorAll(d.subSelector).forEach(sub => Object.assign(sub.style, d.subStyle));
            }
            window.updateHandles(s);
            markDirty();
        } else if (d.type === 'LF_DELETE_SELECTED') {
            const s = document.querySelector('.lf-component.selected'); 
            if (s) { 
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                s.remove(); 
                markDirty(); 
                notifyParent({ type: 'LF_DESELECT' });
            }
        } else if (d.type === 'LF_DESELECT_ALL') {
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
        } else if (d.type === 'LF_BRING_FRONT') {
            const selected = document.querySelectorAll('.lf-component.selected');
            const topLevelSelected = Array.from(selected).filter(el => {
                let parent = el.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) return false;
                    parent = parent.parentElement;
                }
                return true;
            });
            if (topLevelSelected.length > 0) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                const firstScript = document.body.querySelector('script');
                topLevelSelected.forEach(el => {
                    if (firstScript) {
                        document.body.insertBefore(el, firstScript);
                    } else {
                        document.body.appendChild(el);
                    }
                });
                markDirty();
                if (typeof window.reorderAllPins === 'function') window.reorderAllPins();
            }
        } else if (d.type === 'LF_SEND_BACK') {
            const selected = document.querySelectorAll('.lf-component.selected');
            const topLevelSelected = Array.from(selected).filter(el => {
                let parent = el.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) return false;
                    parent = parent.parentElement;
                }
                return true;
            });
            if (topLevelSelected.length > 0) {
                const firstUnselected = Array.from(document.body.children).find(el => {
                    return el.classList.contains('lf-component') && !el.classList.contains('selected');
                });
                if (firstUnselected) {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    topLevelSelected.forEach(el => {
                        document.body.insertBefore(el, firstUnselected);
                    });
                    markDirty();
                    if (typeof window.reorderAllPins === 'function') window.reorderAllPins();
                }
            }
        } else if (d.type === 'LF_UPDATE_MARQUEE_SELECTION') {
            const ids = d.ids || [];
            document.querySelectorAll('.lf-component').forEach(x => {
                x.classList.toggle('selected', ids.includes(x.id));
            });
        } else if (d.type === 'LF_ALIGN_SELECTED') {
            const ids = d.ids || [];
            const alignType = d.alignType || d.type;
            if (ids.length < 2) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const doc = document;
            const items = [];
            const allHandles = doc.querySelectorAll('.lf-drag-handle, .lf-resizer, .lf-delete-trigger');
            const handleStates = Array.from(allHandles).map(h => h.style.display);
            allHandles.forEach(h => h.style.display = 'none');

            const validIds = ids.filter(id => {
                if (id.startsWith('conn_')) return false;
                const el = doc.getElementById(id);
                if (!el) return false;
                
                let parent = el.parentElement;
                while (parent && parent !== doc.body) {
                    if (parent.classList.contains('lf-group') && ids.includes(parent.id)) return false;
                    parent = parent.parentElement;
                }
                return true;
            });

            validIds.forEach(id => {
                const isMarker = id.startsWith('v4-pin-');
                const el = doc.getElementById(id);
                if (el) {
                    let absL = parseFloat(el.style.left) || 0;
                    let absT = parseFloat(el.style.top) || 0;
                    
                    let parent = el.parentElement;
                    while (parent && parent !== doc.body) {
                        if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                            absL += parseFloat(parent.style.left) || 0;
                            absT += parseFloat(parent.style.top) || 0;
                        }
                        parent = parent.parentElement;
                    }

                    const w = el.offsetWidth;
                    const h = el.offsetHeight;
                    items.push({ id, type: isMarker ? 'marker' : 'comp', el, x: absL, y: absT, w, h });
                }
            });

            allHandles.forEach((h, i) => h.style.display = handleStates[i]);
            if (items.length < 2) return;

            let minX = Math.min(...items.map(i => i.x));
            let minY = Math.min(...items.map(i => i.y));
            let maxX = Math.max(...items.map(i => i.x + i.w));
            let maxY = Math.max(...items.map(i => i.y + i.h));

            if (alignType === 'distribute_h') {
                if (items.length < 3) {
                    allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                    return;
                }
                items.sort((a, b) => a.x - b.x);
                const sumW = items.reduce((sum, item) => sum + item.w, 0);
                const spanX = maxX - minX;
                const gapSize = (spanX - sumW) / (items.length - 1);
                let currentX = minX;
                items.forEach(item => {
                    const dx = currentX - item.x;
                    currentX += item.w + gapSize;
                    
                    if (dx === 0) return;
                    const newAbsX = item.x + dx;
                    let parentL = 0;
                    let parent = item.el.parentElement;
                    while (parent && parent !== doc.body) {
                        if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                            parentL += parseFloat(parent.style.left) || 0;
                        }
                        parent = parent.parentElement;
                    }
                    item.el.style.left = (newAbsX - parentL) + 'px';
                    if (item.type === 'marker') {
                        const idx = parseInt(item.id.replace('v4-pin-', ''));
                        notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: newAbsX, y: item.y });
                    }
                });
                allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                markDirty();
                return;
            }

            if (alignType === 'distribute_v') {
                if (items.length < 3) {
                    allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                    return;
                }
                items.sort((a, b) => a.y - b.y);
                const sumH = items.reduce((sum, item) => sum + item.h, 0);
                const spanY = maxY - minY;
                const gapSize = (spanY - sumH) / (items.length - 1);
                let currentY = minY;
                items.forEach(item => {
                    const dy = currentY - item.y;
                    currentY += item.h + gapSize;
                    
                    if (dy === 0) return;
                    const newAbsY = item.y + dy;
                    let parentT = 0;
                    let parent = item.el.parentElement;
                    while (parent && parent !== doc.body) {
                        if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                            parentT += parseFloat(parent.style.top) || 0;
                        }
                        parent = parent.parentElement;
                    }
                    item.el.style.top = (newAbsY - parentT) + 'px';
                    if (item.type === 'marker') {
                        const idx = parseInt(item.id.replace('v4-pin-', ''));
                        notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: item.x, y: newAbsY });
                    }
                });
                allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                markDirty();
                return;
            }

            items.forEach(item => {
                let dx = 0, dy = 0;
                switch(alignType) {
                    case 'left':   dx = minX - item.x; break;
                    case 'right':  dx = maxX - item.w - item.x; break;
                    case 'center': dx = (minX + maxX)/2 - item.w/2 - item.x; break;
                    case 'top':    dy = minY - item.y; break;
                    case 'bottom': dy = maxY - item.h - item.y; break;
                    case 'middle': dy = (minY + maxY)/2 - item.h/2 - item.y; break;
                }

                if (dx === 0 && dy === 0) return;

                const newAbsX = item.x + dx;
                const newAbsY = item.y + dy;

                let parentL = 0;
                let parentT = 0;
                let parent = item.el.parentElement;
                while (parent && parent !== doc.body) {
                    if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                        parentL += parseFloat(parent.style.left) || 0;
                        parentT += parseFloat(parent.style.top) || 0;
                    }
                    parent = parent.parentElement;
                }

                item.el.style.left = (newAbsX - parentL) + 'px';
                item.el.style.top = (newAbsY - parentT) + 'px';
                
                if (item.type === 'marker') {
                    const idx = parseInt(item.id.replace('v4-pin-', ''));
                    notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: newAbsX, y: newAbsY });
                }
            });
            markDirty();
        } else if (d.type === 'LF_GROUP_SELECTED') {
            const ids = d.ids || [];
            if (ids.length < 2) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            const doc = document;
            const host = doc.body;
            
            const allHandles = doc.querySelectorAll('.lf-drag-handle, .lf-resizer, .lf-delete-trigger');
            const handleStates = Array.from(allHandles).map(h => h.style.display);
            allHandles.forEach(h => h.style.display = 'none');

            const comps = ids.map(id => doc.getElementById(id)).filter(el => el && !el.classList.contains('connector-line'));
            if (comps.length < 2) return;

            // Sort comps based on their current DOM order to preserve relative layering inside the group
            comps.sort((a, b) => {
                const position = a.compareDocumentPosition(b);
                if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
                if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
                return 0;
            });

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const items = comps.map(c => {
                const l = parseFloat(c.style.left) || 0;
                const t = parseFloat(c.style.top) || 0;
                const w = c.offsetWidth;
                const h = c.offsetHeight;
                minX = Math.min(minX, l);
                minY = Math.min(minY, t);
                maxX = Math.max(maxX, l + w);
                maxY = Math.max(maxY, t + h);
                return { el: c, l, t, w, h };
            });

            allHandles.forEach((h, i) => h.style.display = handleStates[i]);

            const groupBaseL = minX;
            const groupBaseT = minY;
            const groupBaseW = maxX - minX;
            const groupBaseH = maxY - minY;

            const groupId = 'group-' + Date.now();
            const group = doc.createElement('div');
            group.id = groupId;
            group.className = 'lf-component lf-group selected';
            Object.assign(group.style, {
                position: 'absolute', left: groupBaseL + 'px', top: groupBaseT + 'px',
                width: groupBaseW + 'px', height: groupBaseH + 'px',
                background: 'transparent', border: 'none', zIndex: '1000'
            });

            group.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                              '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';

            // Insert the group exactly before the first selected component in the DOM
            // to preserve the overall layering position of the grouped items relative to other page elements.
            const firstComp = comps[0];
            firstComp.parentNode.insertBefore(group, firstComp);

            items.forEach(item => {
                item.el.style.left = (item.l - minX) + 'px';
                item.el.style.top = (item.t - minY) + 'px';
                item.el.style.width = item.w + 'px';
                item.el.style.height = item.h + 'px';
                item.el.classList.remove('selected');
                group.appendChild(item.el);
            });

            notifyParent({ type: 'LF_SELECT_ID', id: groupId });
            markDirty();
        } else if (d.type === 'LF_UNGROUP_SELECTED') {
            const ids = d.ids || [];
            if (ids.length < 1) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const doc = document;
            const host = doc.body;
            const group = doc.getElementById(ids[0]);
            if (!group || !group.classList.contains('lf-group')) return;

            const groupL = parseFloat(group.style.left) || 0;
            const groupT = parseFloat(group.style.top) || 0;

            const children = Array.from(group.children).filter(c => c.classList.contains('lf-component'));
            const newIds = [];

            children.forEach((c, idx) => {
                if (!c.id) c.id = 'v4-comp-ug-' + Date.now() + '-' + idx;

                const relL = parseFloat(c.style.left) || 0;
                const relT = parseFloat(c.style.top) || 0;
                const w = c.offsetWidth;
                const h = c.offsetHeight;

                const absL = groupL + relL;
                const absT = groupT + relT;

                c.style.left = absL + 'px';
                c.style.top = absT + 'px';
                c.style.width = w + 'px';
                c.style.height = h + 'px';

                const isMarker = c.classList.contains('text-marker');
                if (isMarker && c.id.startsWith('v4-pin-')) {
                    const pinIdx = parseInt(c.id.replace('v4-pin-', ''));
                    notifyParent({ type: 'LF_UPDATE_PIN_POS', index: pinIdx, x: absL, y: absT });
                }
                c.classList.add('selected');
                newIds.push(c.id);
                // Insert child back into the DOM exactly where the group container was
                group.parentNode.insertBefore(c, group);
            });

            group.remove();
            notifyParent({ type: 'LF_DESELECT' });
            markDirty();
        } else if (d.type === 'LF_EXTRACT_MOLECULE') {
            const group = document.getElementById(d.id);
            if (!group || !group.classList.contains('lf-group')) return;

            const clone = group.cloneNode(true);
            clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
            clone.removeAttribute('id');
            clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

            const moleculeData = {
                id: 'mol-' + Date.now(),
                name: d.name,
                category: 'Custom',
                width: group.style.width,
                height: group.style.height,
                isGroup: true,
                previewHtml: '<div style="font-size: 10px; font-weight: 700; color: #6366f1;">' + d.name + '</div>',
                html: clone.innerHTML
            };

            notifyParent({ type: 'LF_MOLECULE_EXTRACTED', moleculeData });
        } else if (d.type === 'LF_REQUEST_SNAP_TARGETS') {
            const targets = [];
            const rects = [];
            document.querySelectorAll('.lf-component:not(.selected)').forEach(c => {
                const l = parseFloat(c.style.left) || 0;
                const t = parseFloat(c.style.top) || 0;
                const w = c.offsetWidth;
                const h = c.offsetHeight;
                const name = c.id.replace('v4-comp-', 'Comp ');
                targets.push({ x: l, label: name, part: 'Left', type: 'h' });
                targets.push({ x: l + w / 2, label: name, part: 'Center', type: 'h' });
                targets.push({ x: l + w, label: name, part: 'Right', type: 'h' });
                targets.push({ y: t, label: name, part: 'Top', type: 'v' });
                targets.push({ y: t + h / 2, label: name, part: 'Middle', type: 'v' });
                targets.push({ y: t + h, label: name, part: 'Bottom', type: 'v' });
                
                rects.push({
                    id: c.id,
                    label: name,
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: l + w,
                    bottom: t + h
                });
            });

            document.querySelectorAll('.mobile-frame').forEach((f, idx) => {
                const content = f.querySelector('.mobile-content');
                if (content) {
                    let el = content;
                    let l = 0, t = 0;
                    while(el) {
                        l += el.offsetLeft;
                        t += el.offsetTop;
                        el = el.offsetParent;
                    }
                    const w = content.offsetWidth;
                    const h = content.offsetHeight;
                    const sName = 'UI Area ' + (idx + 1);
                    const bezel = 8;
                    
                    const leftVal = l + bezel;
                    const rightVal = l + w - bezel;
                    const topVal = t + bezel;
                    const bottomVal = t + h - bezel;
                    
                    targets.push({ x: leftVal, label: sName, part: 'Left', type: 'h' });
                    targets.push({ x: rightVal, label: sName, part: 'Right', type: 'h' });
                    targets.push({ y: topVal, label: sName, part: 'Top', type: 'v' });
                    targets.push({ y: bottomVal, label: sName, part: 'Bottom', type: 'v' });
                    targets.push({ x: l + w / 2, label: sName, part: 'Center', type: 'h' });
                    targets.push({ y: t + h / 2, label: sName, part: 'Middle', type: 'v' });

                    rects.push({
                        id: 'mobile-frame-' + idx,
                        label: sName,
                        left: leftVal,
                        top: topVal,
                        width: rightVal - leftVal,
                        height: bottomVal - topVal,
                        right: rightVal,
                        bottom: bottomVal
                    });
                }
            });

            notifyParent({ type: 'LF_SNAP_TARGETS_RESPONSE', targets, rects });
        } else if (d.type === 'LF_TABLE_ACTION') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const table = s.querySelector('table'); if (!table) return;
            const focused = table.querySelector('.v4-editable-cell:focus') || table.querySelector('td, th');
            const row = focused ? focused.closest('tr') : null;
            const cell = focused ? focused.closest('td, th') : null;
            const act = (d.action || "").toLowerCase();
            
            if (act === 'add-row' || act === 'add_row') {
                const newRow = table.insertRow(row ? row.rowIndex + 1 : -1);
                const colCount = table.rows[0].cells.length;
                for (let i = 0; i < colCount; i++) {
                    const c = newRow.insertCell();
                    c.className = 'v4-editable-cell';
                    c.contentEditable = 'true';
                    c.innerText = 'New';
                    c.style.borderBottom = '1.6px solid #cbd5e1';
                    c.style.padding = '16px';
                }
            } else if (act === 'add-col' || act === 'add_col') {
                Array.from(table.rows).forEach((r, idx) => {
                    const c = idx === 0 ? r.insertCell(-1) : r.insertCell(-1);
                    if (idx === 0) {
                        const th = document.createElement('th');
                        th.className = 'v4-editable-cell';
                        th.contentEditable = 'true';
                        th.innerText = 'Header';
                        th.style.background = '#cbd5e1';
                        th.style.borderBottom = '1.6px solid #475569';
                        th.style.padding = '16px';
                        r.replaceChild(th, c);
                    } else {
                        c.className = 'v4-editable-cell';
                        c.contentEditable = 'true';
                        c.innerText = 'Data';
                        c.style.borderBottom = '1.6px solid #cbd5e1';
                        c.style.padding = '16px';
                    }
                });
            } else if ((act === 'del-row' || act === 'del_row') && row && table.rows.length > 1) {
                row.remove();
            } else if ((act === 'del-col' || act === 'del_col') && cell) {
                const idx = cell.cellIndex;
                Array.from(table.rows).forEach(r => { if (r.cells[idx]) r.cells[idx].remove(); });
            }
            markDirty();
        } else if (d.type === 'LF_UPDATE_CELL_STYLE') {
            if (window.TableManager) {
                window.TableManager.updateSelectedCellsStyle(d.style);
            }
        } else if (d.type === 'LF_UPDATE_CELL_DIMENSION') {
            if (window.TableManager) {
                if (d.width !== undefined) {
                    window.TableManager.updateSelectedColumnWidth(d.width);
                }
                if (d.height !== undefined) {
                    window.TableManager.updateSelectedRowHeight(d.height);
                }
            }
        }
    });

    window.initHandles = () => {
        document.querySelectorAll('.lf-component').forEach(c => {
            if (!c.querySelector('.lf-drag-handle')) {
                const h = document.createElement('div');
                h.className = 'lf-drag-handle';
                h.innerHTML = '<svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>';
                c.appendChild(h);
            }
            if (!c.querySelector('.lf-resizer')) {
                const r = document.createElement('div');
                r.className = 'lf-resizer';
                c.appendChild(r);
            }
            if (!c.querySelector('.lf-delete-trigger')) {
                const d = document.createElement('div');
                d.className = 'lf-delete-trigger';
                d.innerHTML = '&times;';
                c.appendChild(d);
            }
        });
    };
    window.initHandles();
})();
`;
