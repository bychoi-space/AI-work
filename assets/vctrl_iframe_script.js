// --- Core Constants for V4 Injection ---
if (!window.v4Styles) {
    window.v4Styles = ``;
}

window.v4Script = `
(function() {
    // --- Console Log Auto-Clearing Guard inside iframe (Preserved for debugging) ---
    (function() {
        let logCount = 0;
        const originalLog = console.log;
        console.log = function(...args) {
            logCount++;
            if (logCount > 1500) {
                // console.clear(); // Keep logs preserved for debugging visibility
                originalLog("[LF Editor Iframe] Logger threshold reached, preservation active.");
                logCount = 0;
            }
            originalLog.apply(console, args);
        };
    })();

    window.syncTableComponentSize = function() {
        const s = document.querySelector('.lf-component.selected');
        if (!s) return;
        
        const table = s.querySelector('table');
        if (!table) return;
        
        const isGrid = s.classList.contains('v4-grid-container') || s.querySelector('.v4-grid-container');
        
        let newWidth, newHeight;
        if (isGrid) {
            newWidth = table.offsetWidth;
            newHeight = table.offsetHeight + 36;
        } else {
            const colgroup = table.querySelector('colgroup');
            if (colgroup && colgroup.children.length > 0) {
                let totalWidth = 0;
                Array.from(colgroup.children).forEach(col => {
                    const wStr = col.style.width || col.getAttribute('width') || '100px';
                    totalWidth += parseInt(wStr) || 100;
                });
                newWidth = totalWidth;
            } else {
                newWidth = table.offsetWidth;
            }
            
            const origHeight = table.style.height;
            table.style.height = 'auto';
            newHeight = table.offsetHeight;
            table.style.height = origHeight || '100%';
        }
        
        notifyParent({
            type: 'LF_TABLE_SIZE_CHANGED',
            compId: s.id,
            width: newWidth,
            height: newHeight
        });
    };

    let isDraggingLine = false, activeLineId = null, startLineCoords = null;



    let startX, startY, startW, startH, startTop, startLeft, startRect;


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
        const isPin = isGroup ? false : (c.classList.contains('text-marker') || c.classList.contains('pin-marker') || c.classList.contains('v4-text-box') || c.classList.contains('v4-text-shape'));
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

        // Search Bar Atom Detection
        const isSearchBar = isGroup ? false : (!!c.querySelector('.v4-searchbar-container') || c.classList.contains('v4-searchbar-container'));
        const searchbarContainer = isGroup ? null : (c.querySelector('.v4-searchbar-container') || (isSearchBar ? c : null));
        const searchbarPlaceholder = searchbarContainer ? (searchbarContainer.querySelector('.v4-searchbar-text')?.getAttribute('data-placeholder') || "원스피어 통합검색") : "원스피어 통합검색";

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
        const accordionItemHeight = accordionContainer ? parseInt(accordionContainer.getAttribute('data-item-height')) || (accordionContainer.querySelector('.v4-accordion-header') ? parseInt(accordionContainer.querySelector('.v4-accordion-header').style.height) || 36 : 36) : 36;
        const accordionDepthType = accordionContainer ? (accordionContainer.getAttribute('data-depth-type') || '1depth') : '1depth';
        const accordionHierarchy = accordionContainer ? (accordionContainer.getAttribute('data-hierarchy') || '') : '';

        // Grid UI Atom Detection
        const isGrid = isGroup ? false : (!!c.querySelector('.v4-grid-container') || c.classList.contains('v4-grid-container'));
        const gridContainer = isGroup ? null : (c.querySelector('.v4-grid-container') || (isGrid ? c : null));
        const gridHeaders = gridContainer ? Array.from(gridContainer.querySelectorAll('.v4-grid-header-row .v4-grid-cell')).slice(1).map(cell => cell.innerText.replace(' ⇅', '')) : [];
        const gridRowCount = gridContainer ? (parseInt(gridContainer.getAttribute('data-row-count')) || 0) : 0;
        const gridShowPagination = gridContainer ? gridContainer.getAttribute('data-pagination') !== 'false' : true;
        const gridRowHeight = gridContainer ? (parseInt(gridContainer.getAttribute('data-row-height')) || 50) : 50;
        
        let gridColumns = [];
        if (gridContainer) {
            const rawCols = gridContainer.getAttribute('data-columns');
            if (rawCols) {
                try {
                    gridColumns = JSON.parse(rawCols);
                } catch(e) {
                    console.error("Error parsing data-columns", e);
                }
            }
            if (!gridColumns || gridColumns.length === 0) {
                var tableCols = Array.from(gridContainer.querySelectorAll('colgroup col'));
                var tableHeaders = Array.from(gridContainer.querySelectorAll('thead th'));
                if (tableHeaders.length > 0) {
                    gridColumns = tableHeaders.map(function(cell, index) {
                        var name = cell.innerText.replace(' ⇅', '').trim();
                        var colEl = tableCols[index];
                        var width = colEl ? (colEl.style.width || colEl.getAttribute('width') || '120px') : '120px';
                        var type = 'text';
                        if (cell.classList.contains('v4-grid-check-col') || cell.querySelector('input[type="checkbox"]')) {
                            type = 'checkbox';
                        } else if (name === '번호') {
                            type = 'number';
                        } else if (name === '방송상태') {
                            type = 'status';
                        } else if (name === '등록/수정자' || name === '등록자' || name === '수정자') {
                            type = 'author';
                        } else if (name.indexOf('일시') >= 0 || name.indexOf('일자') >= 0) {
                            type = 'datetime';
                        }
                        return { name: name, type: type, width: width };
                    });
                } else {
                    const headerCells = Array.from(gridContainer.querySelectorAll('.v4-grid-header-row .v4-grid-cell'));
                    const gridTemplateCols = (gridContainer.querySelector('.v4-grid-header-row') && gridContainer.querySelector('.v4-grid-header-row').style.gridTemplateColumns || '').split(/\s+/).filter(Boolean);
                    gridColumns = headerCells.map((cell, index) => {
                        const name = cell.innerText.replace(' ⇅', '').trim();
                        const width = gridTemplateCols[index] || '120px';
                        let type = 'text';
                        if (cell.classList.contains('v4-grid-check-col') || cell.querySelector('input[type="checkbox"]')) {
                            type = 'checkbox';
                        } else if (name === '번호') {
                            type = 'number';
                        } else if (name === '방송상태') {
                            type = 'status';
                        } else if (name === '등록/수정자' || name === '등록자' || name === '수정자') {
                            type = 'author';
                        } else if (name.indexOf('일시') >= 0 || name.indexOf('일자') >= 0) {
                            type = 'datetime';
                        }
                        return { name: name, type: type, width: width };
                    });
                }
            }
        }

        // Admin Settings Atom Detection
        const isAdminSettings = isGroup ? false : (!!c.querySelector('.v4-admin-settings-container') || c.classList.contains('v4-admin-settings-container'));
        const adminSettingsContainer = isGroup ? null : (c.querySelector('.v4-admin-settings-container') || (isAdminSettings ? c : null));
        const adminRowCount = adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row-count')) || 3 : 3;
        
        const adminShowGroupHeader = adminSettingsContainer ? adminSettingsContainer.getAttribute('data-show-group-header') === 'true' : false;
        const adminGroupHeaderTitle = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-group-header-title') || '그룹명') : '그룹명';
        const adminGroupHeaderBg = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-group-header-bg') || '#73829c') : '#73829c';
        const adminGroupHeaderColor = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-group-header-color') || '#ffffff') : '#ffffff';
        const firstLabel = adminSettingsContainer ? adminSettingsContainer.querySelector('.v4-admin-label-cell') : null;
        const adminLabelWidth = firstLabel ? (parseInt(firstLabel.style.width) || parseInt(window.getComputedStyle(firstLabel).width) || 140) : 140;

        const adminRowData = {};
        for (let i = 1; i <= 10; i++) {
            adminRowData['adminRow' + i + 'Label'] = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-row' + i + '-label') || '') : '';
            adminRowData['adminRow' + i + 'Cols'] = adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row' + i + '-cols')) || 1 : 1;
            adminRowData['adminRow' + i + 'Type'] = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-row' + i + '-type') || 'textbox') : 'textbox';
            adminRowData['adminRow' + i + 'Height'] = adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row' + i + '-height')) || (adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row-height')) || 50 : 50) : 50;
        }

        // Toggle Button Detection
        const isToggle = isGroup ? false : (!!c.querySelector('.v4-toggle-container') || c.classList.contains('v4-toggle-container'));
        const toggleContainer = isGroup ? null : (c.querySelector('.v4-toggle-container') || (isToggle ? c : null));
        const toggleChecked = toggleContainer ? (toggleContainer.getAttribute('data-checked') === 'true') : false;
        const toggleColor = toggleContainer ? (toggleContainer.getAttribute('data-color') || '#3b82f6') : '#3b82f6';

        const boxEl = isGroup ? null : c.querySelector('.v4-checkbox, .v4-radio');
        const buttonEl = isGroup ? null : c.querySelector('.v4-custom-btn');
        
        const getShapeColor = (prop) => {
            if (!shape) return "";
            if (shape.classList.contains('v4-shape-diamond') || shape.classList.contains('v4-shape-triangle') || shape.classList.contains('v4-shape-wave') || shape.classList.contains('v4-shape-arrow')) {
                const svg = shape.querySelector('polygon, path, rect, circle');
                if (svg) {
                    const compStyle = window.getComputedStyle(svg);
                    const val = prop === 'backgroundColor' ? (svg.style.fill || compStyle.fill) : (svg.style.stroke || compStyle.stroke);
                    if (val && val !== 'none') return val;
                }
            }
            return _getVal(shape, prop === 'backgroundColor' ? 'backgroundColor' : 'borderColor');
        };
 
        let detectedIconColor = "";
        if (icon) {
            const poly = icon.querySelector('polyline, path, line, polygon, rect, circle');
            const dot = icon.querySelector('.v4-radio div, .v4-radio-dot');
            if (poly) {
                detectedIconColor = poly.style.stroke || poly.getAttribute('stroke') || icon.style.color || _getVal(icon, "color") || "";
            } else if (dot) {
                detectedIconColor = dot.style.backgroundColor || _getVal(dot, "backgroundColor") || "";
            } else {
                detectedIconColor = icon.style.color || icon.getAttribute('stroke') || _getVal(icon, "color") || "";
            }
        }
 
        const getCompBg = () => {
            if (shape) return getShapeColor("backgroundColor");
            if (table) return _getVal(table, "backgroundColor");
            if (isPin) return _getVal(c, "backgroundColor");
            if (boxEl) return _getVal(boxEl, "backgroundColor");
            if (buttonEl) return _getVal(buttonEl, "backgroundColor");
            if (inputContainer) return _getVal(inputContainer, "backgroundColor");
            if (searchbarContainer) return _getVal(searchbarContainer, "backgroundColor");
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
            if (searchbarContainer) return _getVal(searchbarContainer, "borderColor");
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
            shapeType: shape ? (shape.classList.contains('v4-shape-pattern-grid') ? 'pattern' : (shape.classList.contains('v4-shape-rect') ? 'rect' : (shape.classList.contains('v4-shape-circle') ? 'circle' : (shape.classList.contains('v4-shape-triangle') ? 'triangle' : (shape.classList.contains('v4-shape-diamond') ? 'diamond' : (shape.classList.contains('v4-shape-arrow') ? 'arrow' : '')))))) : '',
            arrowDir: shape ? (shape.getAttribute('data-arrow-dir') || shape.getAttribute('data-direction') || 'right') : '',
            direction: shape ? (shape.getAttribute('data-direction') || shape.getAttribute('data-arrow-dir') || 'right') : '',
            patternType: shape && shape.classList.contains('v4-shape-pattern-grid') ? (shape.getAttribute('data-pattern-type') || 'grid') : '',
            isTable: !!table && !isGrid,
            isShape: !!shape,
            isIcon: !!icon,
            isImage: isImage,
            isPin: isPin,
            isDescriptionPin: isDescriptionPin,
            isCheckbox: isCheckbox,
            isRadio: isRadio,
            checked: checked,
            textEnabled: textEnabled,
            checkboxText: container ? (container.querySelector('.v4-checkbox-text, .v4-radio-text')?.innerText || "TEXT") : "TEXT",
            isTextbox: isTextbox,
            isTextarea: isTextarea,
            placeholderText: placeholderText,
            maxLength: maxLength,
            showCounter: showCounter,
            isSearchBar: isSearchBar,
            searchbarPlaceholder: searchbarPlaceholder,
            isStepper: isStepper,
            minVal: minVal,
            maxVal: maxVal,
            val: stepperVal,
            btnEnabled: stepperBtnEnabled,
            btnText: stepperBtnText,
            disabled: (
                c.getAttribute('data-disabled') === 'true' || 
                (container && container.getAttribute('data-disabled') === 'true') ||
                (stepperContainer && stepperContainer.getAttribute('data-disabled') === 'true') ||
                (selectboxContainer && selectboxContainer.getAttribute('data-disabled') === 'true') ||
                (fileuploadContainer && fileuploadContainer.getAttribute('data-disabled') === 'true') ||
                (searchbarContainer && searchbarContainer.getAttribute('data-disabled') === 'true') ||
                (dpContainer && dpContainer.getAttribute('data-disabled') === 'true') ||
                (toggleContainer && toggleContainer.getAttribute('data-disabled') === 'true') ||
                (accordionContainer && accordionContainer.getAttribute('data-disabled') === 'true') ||
                !!c.querySelector('[data-disabled="true"]')
            ),
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
            accordionItemHeight: accordionItemHeight,
            accordionDepthType: accordionDepthType,
            accordionHierarchy: accordionHierarchy,
            isGrid: isGrid,
            gridHeaders: gridHeaders,
            gridColumns: gridColumns,
            gridRowCount: gridRowCount,
            gridShowPagination: gridShowPagination,
            gridRowHeight: gridRowHeight,
            isAdminSettings: isAdminSettings,
            adminRowCount: adminRowCount,
            adminShowGroupHeader: adminShowGroupHeader,
            adminGroupHeaderTitle: adminGroupHeaderTitle,
            adminGroupHeaderBg: adminGroupHeaderBg,
            adminGroupHeaderColor: adminGroupHeaderColor,
            adminLabelWidth: adminLabelWidth,
            ...adminRowData,
            adminRowHeight: adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row-height')) || 50 : 50,
            isToggle: isToggle,
            toggleChecked: toggleChecked,
            toggleColor: toggleColor,
            pinIndex: isPin ? parseInt(c.id.replace('v4-pin-', '')) : -1,
            html: textCell ? textCell.innerHTML : (shape ? (shape.querySelector('.v4-shape-text-content')?.innerHTML ?? shape.querySelector('.v4-shape-text-overlay')?.innerHTML ?? shape.innerHTML) : (table ? table.innerHTML : "")),
            isGroup: c.classList.contains('lf-group'),
            w: c.offsetWidth,
            h: c.offsetHeight,
            boxW: boxEl ? (parseInt(boxEl.style.width) || boxEl.offsetWidth || 20) : (c.offsetWidth || 20),
            boxH: boxEl ? (parseInt(boxEl.style.height) || boxEl.offsetHeight || 20) : (c.offsetHeight || 20),
            currentStyles: {
                bg: window.rgbToHex(getCompBg()),
                border: window.rgbToHex(getCompBorder()),
                text: window.rgbToHex(textCell ? _getVal(textCell, "color") : (buttonEl ? _getVal(buttonEl, "color") : "")),
                fontSize: parseInt(_getVal(textCell, "fontSize")) || (shape ? parseInt(_getVal(shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay'), "fontSize")) || 14 : (inputContainer ? parseInt(_getVal(inputContainer, "fontSize")) || 14 : 14)),
                fontFamily: textCell ? _getVal(textCell, "fontFamily") : (inputContainer ? _getVal(inputContainer, "fontFamily") : "inherit"),
                tableHeader: window.rgbToHex(table ? _getVal(table.querySelector("th"), "backgroundColor") : ""),
                tableHeaderText: window.rgbToHex(table ? _getVal(table.querySelector("th"), "color") : ""),
                iconColor: window.rgbToHex(detectedIconColor || "#000000"),
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
                textAlign: shape ? (_getVal(shape.querySelector('.v4-editable-cell, .v4-shape-text-content'), 'textAlign') || 'center') : (_getVal(c.querySelector('.v4-editable-cell'), 'textAlign') || 'center'),
                justifyContent: shape ? (_getVal(shape.querySelector('.v4-editable-cell, .v4-shape-text-content'), 'justifyContent') || 'center') : (_getVal(c.querySelector('.v4-editable-cell'), 'justifyContent') || 'center')
            }
        };
    };

    window.updateHandles = (c) => {
        if (!c) return;
        const t = parseInt(c.style.top) || 0;
        const l = parseInt(c.style.left) || 0;
        const drag = c.querySelector(':scope > .lf-drag-handle');
        const del = c.querySelector(':scope > .lf-delete-trigger');
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
    let isConnectorDragging = false;
    let groupChildrenStart = null;
    document.addEventListener('mousedown', e => {
        if (e.target.closest('.sidebar') || e.target.closest('.modal') || e.target.closest('.header-metadata')) return;

        let h = e.target.closest('.lf-drag-handle'), r = e.target.closest('.lf-resizer'), d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        
        if (c && !h && !r && !d) {
            if (!c.classList.contains('text-marker') && !c.classList.contains('pin-marker')) {
                let parent = c.parentElement.closest('.lf-component');
                while (parent) {
                    if (parent.classList.contains('text-marker') || parent.classList.contains('pin-marker')) break;
                    c = parent;
                    // If we've reached a group, stop here — do not bubble past the group
                    if (c.classList.contains('lf-group')) break;
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
            const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
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
            document.querySelectorAll('.lf-component:not(.connector-line)').forEach(c => {
                let absL = parseFloat(c.style.left) || 0;
                let absT = parseFloat(c.style.top) || 0;
                let isChild = false;
                
                let parent = c.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList && (parent.classList.contains('lf-component') || parent.classList.contains('lf-group'))) {
                        absL += parseFloat(parent.style.left) || 0;
                        absT += parseFloat(parent.style.top) || 0;
                        isChild = true;
                    }
                    parent = parent.parentElement;
                }

                targets.push({
                    id: c.id,
                    x: absL,
                    y: absT,
                    w: c.offsetWidth,
                    h: c.offsetHeight,
                    isGroupChild: isChild
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
            if (window.V4DragResizeEngine) {
                window.V4DragResizeEngine.startResize(e, r);
            }
        }
        else if (h || (c && !e.target.closest('td, th'))) { 
            if (window.V4DragResizeEngine) {
                window.V4DragResizeEngine.handleMouseDown(e, h, r, d, c);
            }
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
        if (isConnectorDragging) {
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_MOVE', clientX: e.clientX, clientY: e.clientY });
            return;
        }
        if (isDraggingLine && activeLineId) {
            const scale = (window.parent?.state?.transform?.scale) || 1;
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            const conn = window.parent?.state?.connectors?.find(c => c.id === activeLineId);
            if (conn && startLineCoords) {
                conn.start.x = startLineCoords.start.x + dx;
                conn.start.y = startLineCoords.start.y + dy;
                conn.end.x = startLineCoords.end.x + dx;
                conn.end.y = startLineCoords.end.y + dy;
                conn.start.targetId = null; conn.start.side = null;
                conn.end.targetId = null; conn.end.side = null;
                window.updateConnectorPathLocal(activeLineId);
            }
            return;
        }

        if (window.V4PortConnectorEngine && window.V4PortConnectorEngine.isDrawingConnector) {
            window.V4PortConnectorEngine.handleMouseMove(e);
            return;
        }

        if (isMarquee) {
            notifyParent({ type: 'LF_MARQUEE_MOVE', x: e.clientX, y: e.clientY });
            window.getSelection()?.removeAllRanges();
            return;
        }
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isResizing || window.V4DragResizeEngine.isPendingDrag)) {
                window.V4DragResizeEngine.handleMouseMove(e);
            }
        });
    });

    document.addEventListener('mouseup', () => { 
        document.querySelectorAll('.lf-component').forEach(comp => comp.classList.remove('near-connector'));
        if (isConnectorDragging) {
            isConnectorDragging = false;
            document.body.classList.remove('drawing-line-active');
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_UP' });
        }
        if (isDraggingLine) {
            isDraggingLine = false;
            startLineCoords = null;
            activeLineId = null;
            notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
            markDirty();
        }

        if (window.V4PortConnectorEngine && window.V4PortConnectorEngine.isDrawingConnector) {
            window.V4PortConnectorEngine.handleMouseUp();
        }

        if (isMarquee) {
            isMarquee = false;
            notifyParent({ type: 'LF_MARQUEE_END' });
        }
        if (window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isResizing || window.V4DragResizeEngine.isPendingDrag)) {
            window.V4DragResizeEngine.handleMouseUp();
        }
    });

    document.addEventListener('input', e => { 
        const editableCell = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editableCell) {
            markDirty();
            const comp = editableCell.closest('.lf-component');
            if (comp) {
                if (comp.querySelector('.v4-checkbox-container') || comp.querySelector('.v4-radio-container')) {
                    if (typeof window.resizeAtomToFitText === 'function') {
                        window.resizeAtomToFitText(comp);
                    } else if (typeof window.enforceDesignSystem === 'function') {
                        window.enforceDesignSystem();
                    }
                }
                // Notify parent of text changes to sync the Quill editor in real-time
                const isPin = comp.classList.contains('text-marker') || comp.classList.contains('pin-marker') || comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape');
                const isShape = !!comp.querySelector('.v4-shape');

                let targetId = comp.id;
                const pinIndexAttr = comp.getAttribute('data-pin-index');
                if (pinIndexAttr !== null) {
                    targetId = parseInt(pinIndexAttr, 10);
                } else {
                    const match = comp.id.match(/^v4-pin-(\d+)$/);
                    if (match) targetId = parseInt(match[1], 10);
                }

                notifyParent({
                    type: 'LF_PIN_TEXT_CHANGED',
                    id: targetId,
                    compId: comp.id,
                    html: editableCell.innerHTML,
                    isPin: isPin,
                    isShape: isShape
                });
            }
        } 
    }, { passive: false });

    document.addEventListener('focusout', e => {
        const editableCell = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editableCell) {
            const comp = editableCell.closest('.lf-component');
            if (comp) {
                const isPin = comp.classList.contains('text-marker') || comp.classList.contains('pin-marker') || comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape');
                const isShape = !!comp.querySelector('.v4-shape');
                let targetId = comp.id;
                const pinIndexAttr = comp.getAttribute('data-pin-index');
                if (pinIndexAttr !== null) {
                    targetId = parseInt(pinIndexAttr, 10);
                } else {
                    const match = comp.id.match(/^v4-pin-(\d+)$/);
                    if (match) targetId = parseInt(match[1], 10);
                }
                notifyParent({
                    type: 'LF_PIN_TEXT_CHANGED',
                    id: targetId,
                    compId: comp.id,
                    html: editableCell.innerHTML,
                    isPin: isPin,
                    isShape: isShape
                });
            }
        }
    });


    window.v4GlobalStyleHandler = function(d) {
        if (!d) return;
        const s = (d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); 
        if (!s) return;
        
        // Route to modular helpers first
        if (window.v4ObjectText && typeof window.v4ObjectText.handleUpdateStyle === 'function') {
            if (window.v4ObjectText.handleUpdateStyle(d)) return;
        }
        if (window.v4ObjectShape && typeof window.v4ObjectShape.handleUpdateStyle === 'function') {
            if (window.v4ObjectShape.handleUpdateStyle(d)) return;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        let t = d.selector ? s.querySelector(d.selector) : s;
        if (!t && s.classList.contains('text-marker')) {
            t = s.querySelector('.v4-editable-cell') || s;
        }
        const shape = s.querySelector('.v4-shape');
        if (shape && !d.selector) t = shape;
        const boxEl = s.querySelector('.v4-checkbox, .v4-radio');
        if (boxEl && !d.selector) t = boxEl;
        
        const inputContainer = s.querySelector('.v4-textbox-container, .v4-textarea-container');
        if (inputContainer && !d.selector) t = inputContainer;
        
        const searchbarContainer = s.querySelector('.v4-searchbar-container');
        if (searchbarContainer && !d.selector) t = searchbarContainer;
        
        const selectboxContainer = s.querySelector('.v4-selectbox-container');
        
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
                const wVal = typeof d.style.width === 'number' ? d.style.width + 'px' : d.style.width;
                if (isInnerBox) {
                    t.style.width = wVal;
                } else {
                    s.style.setProperty('width', wVal, 'important');
                    if (inputContainer) inputContainer.style.width = '100%';
                    if (alertContainer) alertContainer.style.width = '100%';
                    if (buttonContainer) buttonContainer.style.width = '100%';
                    if (selectboxContainer) {
                        s.setAttribute('data-resized', 'true');
                        selectboxContainer.style.setProperty('width', '100%', 'important');
                        const header = selectboxContainer.querySelector('.v4-selectbox-header');
                        const optionsList = selectboxContainer.querySelector('.v4-selectbox-options');
                        if (header) header.style.setProperty('width', '100%', 'important');
                        if (optionsList) optionsList.style.setProperty('width', '100%', 'important');
                    }
                }
            }
            if (d.style.height !== undefined) {
                const hVal = typeof d.style.height === 'number' ? d.style.height + 'px' : d.style.height;
                if (isInnerBox) {
                    t.style.height = hVal;
                } else {
                    s.style.height = hVal;
                    if (inputContainer) inputContainer.style.height = '100%';
                    if (alertContainer) alertContainer.style.height = '100%';
                    if (buttonContainer) buttonContainer.style.height = '100%';
                    if (selectboxContainer) {
                        selectboxContainer.style.height = '100%';
                        const header = selectboxContainer.querySelector('.v4-selectbox-header');
                        if (header) header.style.height = '100%';
                    }
                }
            }

            const styleToAssign = { ...d.style };
            if (!isInnerBox) {
                delete styleToAssign.width;
                delete styleToAssign.height;
            }
            
            const targets = d.selector ? [t] : [t, s.querySelector('.v4-shape-text-content'), s.querySelector('.v4-shape-text-overlay')].filter(Boolean);
            targets.forEach(target => {
                Object.assign(target.style, styleToAssign);
                for (const [key, val] of Object.entries(styleToAssign)) {
                    if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent' || key === 'borderRadius') {
                        const cssKey = key === 'textAlign' ? 'text-align' : (key === 'alignItems' ? 'align-items' : (key === 'justifyContent' ? 'justify-content' : 'border-radius'));
                        target.style.setProperty(cssKey, val, 'important');
                    }
                }
            });
        }
        
        if (d.subSelector && d.subStyle) {
            t.querySelectorAll(d.subSelector).forEach(sub => {
                Object.keys(d.subStyle).forEach(key => {
                    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    sub.style.setProperty(cssKey, d.subStyle[key], 'important');
                });
            });
        }
        if (typeof window.syncTableComponentSize === 'function') {
            window.syncTableComponentSize();
        }
        window.updateHandles(s);
        markDirty();

        if (typeof window._getCompStyles === 'function') {
            notifyParent({
                type: 'LF_COMP_RESIZED',
                ...window._getCompStyles(s)
            });
        }
    };

    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;

        if (d.type === 'LF_PARENT_MOUSEUP') {
            document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            return;
        }

        if (d.type && window.v4MessageHandlers && typeof window.v4MessageHandlers[d.type.toUpperCase()] === 'function') {
            try {
                window.v4MessageHandlers[d.type.toUpperCase()](d);
                return; // Intercepted and handled by modular component file!
            } catch(err) {
                console.error("[MessageDispatcher] Error running modular handler for " + d.type + ":", err);
            }
        }

        if (d.type === 'LF_SNAP_RESPONSE' && window.activeEl && window.V4DragResizeEngine && window.V4DragResizeEngine.isDragging) {
            const activeEl = window.activeEl;
            const curLeft = parseInt(activeEl.style.left) || 0;
            const curTop = parseInt(activeEl.style.top) || 0;
            const snapDx = d.x - curLeft;
            const snapDy = d.y - curTop;
            if (Math.abs(snapDx) > 0.1 || Math.abs(snapDy) > 0.1) {
                const comps = document.querySelectorAll('.lf-component.selected');
                let hasConnectorChanges = false;
                comps.forEach(c => {
                    const isConnector = c.classList.contains('connector-line');
                    const isGroup = c.classList.contains('lf-group');
                    if (isConnector) {
                        const conn = (window.parent && window.parent.state && window.parent.state.connectors)
                            ? window.parent.state.connectors.find(x => x.id === c.id)
                            : null;
                        if (conn) {
                            conn.start.x += snapDx;
                            conn.start.y += snapDy;
                            conn.end.x += snapDx;
                            conn.end.y += snapDy;
                            conn.start.targetId = null; conn.start.side = null;
                            conn.end.targetId = null; conn.end.side = null;
                            hasConnectorChanges = true;
                        }
                    } else {
                        c.style.left = (parseInt(c.style.left || 0) + snapDx) + 'px';
                        c.style.top = (parseInt(c.style.top || 0) + snapDy) + 'px';
                        window.updateHandles(c);
                        if (isGroup) {
                            const connIdsStr = c.getAttribute('data-connectors');
                            let connIds = [];
                            if (connIdsStr) {
                                try { connIds = JSON.parse(connIdsStr); } catch(e) { connIds = []; }
                            }
                            if (Array.isArray(connIds)) {
                                connIds.forEach(connId => {
                                    const conn = (window.parent && window.parent.state && Array.isArray(window.parent.state.connectors))
                                        ? window.parent.state.connectors.find(x => x && x.id === connId)
                                        : null;
                                    if (conn && conn.start && conn.end) {
                                        conn.start.x += snapDx;
                                        conn.start.y += snapDy;
                                        conn.end.x += snapDx;
                                        conn.end.y += snapDy;
                                        conn.start.targetId = null; conn.start.side = null;
                                        conn.end.targetId = null; conn.end.side = null;
                                        hasConnectorChanges = true;
                                    }
                                });
                            }
                        }
                        if (typeof window.updateAnchoredConnectorsLocal === 'function') {
                            window.updateAnchoredConnectorsLocal(c.id);
                        }
                    }
                });
                if (hasConnectorChanges) {
                    if (window.parent && window.parent.ConnectorEngine) {
                        window.parent.ConnectorEngine.redrawAll();
                    }
                    notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                }
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
                const padding = Math.max(headLength + 10, 30);
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

                const pathData = window.calculatePathData(conn, rStart, rEnd);

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
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        isDraggingLine = true;
                        activeLineId = conn.id;
                        startX = e.clientX;
                        startY = e.clientY;
                        startLineCoords = {
                            start: { x: conn.start.x, y: conn.start.y },
                            end: { x: conn.end.x, y: conn.end.y }
                        };
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
                            document.body.classList.add('drawing-line-active');
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
            const comp = (d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
            if (comp) {
                const cell = comp.querySelector('.v4-editable-cell') || (comp.classList.contains('v4-editable-cell') ? comp : null);
                if (cell) {
                    if (document.activeElement && (cell === document.activeElement || cell.contains(document.activeElement))) {
                        return; // User is actively typing inside this cell, skip innerHTML overwrite
                    }
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

            const activeCell = shape.querySelector('.v4-editable-cell') || shape.querySelector('.v4-shape-text-content') || shape.querySelector('.v4-shape-text-overlay');
            if (activeCell && document.activeElement && (activeCell === document.activeElement || activeCell.contains(document.activeElement))) {
                return; // User is actively typing inside this shape text, skip innerHTML overwrite
            }

            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const editableCell = shape.querySelector('.v4-editable-cell');
            if (editableCell) {
                editableCell.innerHTML = d.html;
            } else {
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
                        textContainer.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8px;box-sizing:border-box;overflow:hidden;';
                        shape.innerHTML = '';
                        textContainer.innerHTML = existingContent;
                        shape.appendChild(textContainer);
                    }
                    textContainer.innerHTML = d.html;
                }
            }
            markDirty();
            if (typeof window.resizeToFitText === 'function') {
                window.resizeToFitText(s);
            }
        }
        else if (d.type === 'LF_UPDATE_ARROW_DIRECTION') {
            console.log("[V4 Iframe] Received LF_UPDATE_ARROW_DIRECTION msg:", d);
            const s = document.querySelector('.lf-component.selected'); 
            console.log("[V4 Iframe] Selected component s:", s);
            if (!s) return;
            const shape = s.querySelector('.v4-shape-arrow, .v4-shape-triangle') || 
                          (s.classList.contains('v4-shape-arrow') || s.classList.contains('v4-shape-triangle') ? s : null) || 
                          s.querySelector('.v4-shape') || 
                          (s.classList.contains('v4-shape') ? s : null);
            console.log("[V4 Iframe] Found shape inside s:", shape);
            if (!shape) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const dir = d.direction || 'right';
            shape.setAttribute('data-arrow-dir', dir);
            shape.setAttribute('data-direction', dir);

            if (shape.classList.contains('v4-shape-arrow') || shape.id === 'v4-shape-arrow') {
                const comp = shape.closest('.lf-component') || shape;
                const w = parseFloat(comp.style.width) || comp.offsetWidth || 100;
                const h = parseFloat(comp.style.height) || comp.offsetHeight || 100;
                const svg = shape.querySelector('svg');
                if (svg) {
                    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
                    svg.setAttribute('preserveAspectRatio', 'none');
                }
                const path = shape.querySelector('.v4-arrow-path');
                if (path && typeof window.buildArrowPath === 'function') {
                    path.setAttribute('d', window.buildArrowPath(w, h, dir));
                }
            } else if (shape.classList.contains('v4-shape-triangle') || shape.id === 'v4-shape-triangle') {
                shape.setAttribute('data-direction', dir);
            }
            if (typeof markDirty === 'function') markDirty();
        }
        else if (d.type === 'LF_UPDATE_ATOM_STATE') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
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
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_ATOM_ICON_SIZE') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
            const boxEl = container ? container.querySelector('.v4-checkbox, .v4-radio') : s.querySelector('.v4-checkbox, .v4-radio');
            if (boxEl) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                if (d.width !== undefined && d.width !== null) {
                    const wPx = typeof d.width === 'number' ? d.width + 'px' : d.width;
                    boxEl.style.width = wPx;
                }
                if (d.height !== undefined && d.height !== null) {
                    const hPx = typeof d.height === 'number' ? d.height + 'px' : d.height;
                    boxEl.style.height = hPx;
                }
                if (typeof window.resizeAtomToFitText === 'function') {
                    window.resizeAtomToFitText(s);
                }
                if (typeof window.updateHandles === 'function') {
                    window.updateHandles(s);
                }
                markDirty();
                if (typeof window._getCompStyles === 'function' && window.parent) {
                    window.parent.postMessage({
                        type: 'LF_COMP_RESIZED',
                        id: s.id,
                        w: s.offsetWidth,
                        h: s.offsetHeight,
                        boxW: boxEl.offsetWidth,
                        boxH: boxEl.offsetHeight
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_ACCORDION_PROPERTIES') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-accordion-container') || (s.classList.contains('v4-accordion-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.width !== undefined) {
                    s.style.width = d.width + 'px';
                    if (typeof window.updateHandles === 'function') window.updateHandles(s);
                }
                
                if (d.itemHeight !== undefined) {
                    container.setAttribute('data-item-height', d.itemHeight);
                    const header = container.querySelector('.v4-accordion-header');
                    if (header) {
                        header.style.height = d.itemHeight + 'px';
                    }
                    container.querySelectorAll('.v4-accordion-item').forEach(item => {
                        item.style.setProperty('height', d.itemHeight + 'px', 'important');
                        item.style.setProperty('line-height', d.itemHeight + 'px', 'important');
                        item.style.setProperty('display', 'flex', 'important');
                        item.style.setProperty('align-items', 'center', 'important');
                        item.style.setProperty('box-sizing', 'border-box', 'important');
                        item.style.setProperty('padding-top', '0', 'important');
                        item.style.setProperty('padding-bottom', '0', 'important');
                    });
                }
                
                if (d.headerText !== undefined) {
                    const titleText = container.querySelector('.v4-accordion-title-text');
                    if (titleText && titleText.innerText !== d.headerText) {
                        titleText.innerText = d.headerText;
                    }
                }
                
                if (d.expanded !== undefined) {
                    container.setAttribute('data-expanded', d.expanded ? 'true' : 'false');
                }
                
                if (d.depthType !== undefined) {
                    container.setAttribute('data-depth-type', d.depthType);
                }
                if (d.hierarchy !== undefined) {
                    container.setAttribute('data-hierarchy', typeof d.hierarchy === 'string' ? d.hierarchy : JSON.stringify(d.hierarchy));
                }
                if (d.subCount !== undefined) {
                    container.setAttribute('data-sub-count', d.subCount);
                }
                
                // Call unified hierarchical renderer
                window.renderAccordionBody(container);
                
                if (d.bg !== undefined) {
                    container.style.backgroundColor = d.bg;
                }
                if (d.border !== undefined) {
                    container.style.borderColor = d.border;
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_GRID_PROPERTIES') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-grid-container') || (s.classList.contains('v4-grid-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                var currentCols = [];
                var rawCols = container.getAttribute('data-columns');
                if (rawCols) {
                    try {
                        currentCols = JSON.parse(rawCols);
                    } catch(e) {}
                }
                if (!currentCols || currentCols.length === 0) {
                    currentCols = [
                        { name: '', type: 'checkbox', width: '50px' },
                        { name: '번호', type: 'number', width: '100px' },
                        { name: '라이브 방송명', type: 'text', width: '1fr' },
                        { name: '방송상태', type: 'status', width: '120px' },
                        { name: '등록/수정자', type: 'author', width: '120px' }
                    ];
                }
                
                var rowCount = parseInt(container.getAttribute('data-row-count')) || 5;
                var showPagination = container.getAttribute('data-pagination') !== 'false';
                
                if (d.columns !== undefined) {
                    currentCols = d.columns;
                }
                if (d.headers !== undefined) {
                    d.headers.forEach(function(headerText, index) {
                        if (currentCols[index]) {
                            currentCols[index].name = headerText;
                        }
                    });
                }
                if (d.rowCount !== undefined) {
                    rowCount = Math.min(20, Math.max(1, parseInt(d.rowCount) || 5));
                }
                if (d.pagination !== undefined) {
                    showPagination = !!d.pagination;
                }
                if (d.bg !== undefined) {
                    container.style.backgroundColor = d.bg;
                }
                if (d.border !== undefined) {
                    container.style.borderColor = d.border;
                }
                
                if (d.rowHeight !== undefined) {
                    container.setAttribute('data-row-height', d.rowHeight);
                }
                if (window.renderGrid) {
                    window.renderGrid(container, currentCols, rowCount, showPagination, d.rowHeight);
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_ATOM_TEXT_ENABLED') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
            if (container) {
                container.setAttribute('data-text-enabled', d.enabled ? 'true' : 'false');
                s.removeAttribute('data-resized');
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                if (typeof resizeAtomToFitText === 'function') resizeAtomToFitText(s);
                markDirty();
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_ATOM_LABEL_TEXT') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
            if (container) {
                const textEl = container.querySelector('.v4-checkbox-text, .v4-radio-text');
                if (textEl) {
                    textEl.innerText = d.text;
                    if (typeof resizeAtomToFitText === 'function') resizeAtomToFitText(s);
                    markDirty();
                    
                    if (typeof window._getCompStyles === 'function') {
                        window.parent.postMessage({
                            type: 'LF_COMP_SELECTED',
                            ...window._getCompStyles(s)
                        }, '*');
                    }
                }
            }
        }
        else if (d.type === 'LF_UPDATE_ATOM_DISABLED') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-textbox-container, .v4-textarea-container, .v4-stepper-container, .v4-selectbox-container, .v4-fileupload-container, .v4-datepicker-container, .v4-toggle-container, .v4-accordion-container, .v4-checkbox-container, .v4-radio-container, .v4-searchbar-container') || s;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const disabledStr = d.disabled ? 'true' : 'false';
            s.setAttribute('data-disabled', disabledStr);
            if (container && container !== s) container.setAttribute('data-disabled', disabledStr);
        }
        else if (d.type === 'LF_UPDATE_STEPPER_PROPERTIES') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
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
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_SELECTBOX_PROPERTIES') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-selectbox-container') || (s.classList.contains('v4-selectbox-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                if (d.width !== undefined) {
                    const wVal = typeof d.width === 'number' ? d.width + 'px' : d.width;
                    s.style.width = wVal;
                    container.style.width = '100%';
                    const header = container.querySelector('.v4-selectbox-header');
                    const optionsList = container.querySelector('.v4-selectbox-options');
                    if (header) header.style.width = '100%';
                    if (optionsList) optionsList.style.width = '100%';
                }
                if (d.height !== undefined) {
                    const hVal = typeof d.height === 'number' ? d.height + 'px' : d.height;
                    s.style.height = hVal;
                    container.style.height = '100%';
                    const header = container.querySelector('.v4-selectbox-header');
                    if (header) header.style.height = '100%';
                }

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
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_FILEUPLOAD_PROPERTIES') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
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
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_ALERT_PROPERTIES') {
            const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
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
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
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
                if (d.buttonFontSize !== undefined) {
                    const fontVal = parseInt(d.buttonFontSize) || 12;
                    container.setAttribute('data-font-size', fontVal);
                    const btn = container.querySelector('.v4-custom-btn');
                    if (btn) btn.style.fontSize = fontVal + 'px';
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();
                
                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
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
                        btn.style.color = isActive ? '#ffffff' : '#0f172a';
                        btn.style.fontWeight = '400';
                        btn.style.fontSize = '12px';
                        btn.style.fontFamily = 'inherit';
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
        else if (d.type === 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-admin-settings-container') || (s.classList.contains('v4-admin-settings-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();

                // Update Row Count
                if (d.rowCount !== undefined) {
                    container.setAttribute('data-row-count', d.rowCount);
                }

                // Update Row Height
                if (d.rowHeight !== undefined) {
                    container.setAttribute('data-row-height', d.rowHeight);
                }

                // Update Label Width
                if (d.labelWidth !== undefined) {
                    container.setAttribute('data-label-width', d.labelWidth);
                }

                // Update Specific Row Configuration
                if (d.rowNum !== undefined) {
                    const rNum = d.rowNum;
                    if (d.label !== undefined) container.setAttribute('data-row' + rNum + '-label', d.label);
                    if (d.cols !== undefined) container.setAttribute('data-row' + rNum + '-cols', d.cols);
                    if (d.rowType !== undefined) container.setAttribute('data-row' + rNum + '-type', d.rowType);
                    if (d.rowSpecificHeight !== undefined) container.setAttribute('data-row' + rNum + '-height', d.rowSpecificHeight);
                }

                // Support Bulk Rows Array (Reordering / Deletion)
                if (Array.isArray(d.rows)) {
                    d.rows.forEach((rData, idx) => {
                        const rNum = idx + 1;
                        if (rData.label !== undefined) container.setAttribute('data-row' + rNum + '-label', rData.label);
                        if (rData.cols !== undefined) container.setAttribute('data-row' + rNum + '-cols', rData.cols);
                        if (rData.type !== undefined) container.setAttribute('data-row' + rNum + '-type', rData.type);
                        if (rData.height !== undefined) container.setAttribute('data-row' + rNum + '-height', rData.height);
                    });
                    // Clean up trailing unused row attributes if rows count decreased
                    for (let rNum = d.rows.length + 1; rNum <= 10; rNum++) {
                        container.removeAttribute('data-row' + rNum + '-label');
                        container.removeAttribute('data-row' + rNum + '-cols');
                        container.removeAttribute('data-row' + rNum + '-type');
                        container.removeAttribute('data-row' + rNum + '-height');
                    }
                }

                // Update Group Header Attributes
                if (d.showGroupHeader !== undefined) container.setAttribute('data-show-group-header', d.showGroupHeader ? 'true' : 'false');
                if (d.groupHeaderTitle !== undefined) container.setAttribute('data-group-header-title', d.groupHeaderTitle);
                if (d.groupHeaderBg !== undefined) container.setAttribute('data-group-header-bg', d.groupHeaderBg);
                if (d.groupHeaderColor !== undefined) container.setAttribute('data-group-header-color', d.groupHeaderColor);

                const hasGroupHeader = container.getAttribute('data-show-group-header') === 'true';
                const headerHeight = hasGroupHeader ? 40 : 0;

                // Dynamically render Group Header
                let headerEl = container.querySelector('.v4-admin-group-header');
                if (hasGroupHeader) {
                    if (!headerEl) {
                        headerEl = document.createElement('div');
                        headerEl.className = 'v4-admin-group-header';
                        container.insertBefore(headerEl, container.firstChild);
                    }
                    const titleText = container.getAttribute('data-group-header-title') || '그룹명';
                    const bgCol = container.getAttribute('data-group-header-bg') || '#73829c';
                    const textCol = container.getAttribute('data-group-header-color') || '#ffffff';
                    
                    if (headerEl.innerText !== titleText) headerEl.innerText = titleText;
                    headerEl.contentEditable = 'true';
                    headerEl.style.cssText = 'height: 40px; display: flex; align-items: center; padding: 0 16px; font-size: 12px; font-weight: 400; font-family: inherit; background: ' + bgCol + '; color: ' + textCol + '; box-sizing: border-box; width: 100%; outline: none; border-bottom: 1.6px solid rgb(226, 232, 240); flex-shrink: 0 !important;';
                    
                    if (!headerEl.dataset.inputBound) {
                        headerEl.dataset.inputBound = 'true';
                        headerEl.oninput = (e) => {
                            container.setAttribute('data-group-header-title', e.target.innerText);
                            markDirty();
                        };
                    }
                } else {
                    if (headerEl) headerEl.remove();
                }

                const totalRows = parseInt(container.getAttribute('data-row-count')) || 1;
                const globalRowHeight = parseInt(container.getAttribute('data-row-height')) || 40;
                
                // Automatically resize component height: sum of specific row heights + headerHeight
                let newHeight = headerHeight;
                for (let i = 1; i <= totalRows; i++) {
                    const specificHeight = parseInt(container.getAttribute('data-row' + i + '-height')) || globalRowHeight;
                    newHeight += specificHeight;
                }
                s.style.height = newHeight + 'px';
                if (typeof window.updateHandles === 'function') window.updateHandles(s);

                // Re-render HTML representation of the rows
                const tableDiv = container.querySelector('.v4-admin-settings-table');
                if (tableDiv) {
                    tableDiv.style.cssText = 'display: flex; flex-direction: column; width: 100%; flex: 1 !important; height: auto !important;';
                    tableDiv.innerHTML = '';
                    
                    for (let i = 1; i <= totalRows; i++) {
                        const labelAttr = container.getAttribute('data-row' + i + '-label') || ('항목 ' + i);
                        const colsAttr = parseInt(container.getAttribute('data-row' + i + '-cols')) || 1;
                        const typeAttr = container.getAttribute('data-row' + i + '-type') || 'textbox';
                        const specificHeight = parseInt(container.getAttribute('data-row' + i + '-height')) || globalRowHeight;
                        
                        const isLastRow = (i === totalRows);
                        const rowBorder = isLastRow ? 'none' : '1.6px solid rgb(226, 232, 240)';
                        
                        const rowEl = document.createElement('div');
                        rowEl.className = 'v4-admin-row';
                        rowEl.style.cssText = 'display: flex; width: 100%; border-bottom: ' + rowBorder + '; box-sizing: border-box; height: ' + specificHeight + 'px;';
                        
                        // Split labels by comma
                        const labels = labelAttr.split(',').map(l => l.trim());
                        
                        for (let c = 0; c < colsAttr; c++) {
                            const colLabel = labels[c] || (labels[0] + (c > 0 ? ' ' + (c + 1) : ''));
                            
                            const labelWidth = container.getAttribute('data-label-width') || '140';
                            
                            // Label cell
                            const labelCell = document.createElement('div');
                            labelCell.className = 'v4-admin-label-cell';
                            labelCell.style.cssText = 'width: ' + labelWidth + 'px; background: #f1f5f9; display: flex; align-items: center; padding: 0 16px; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); font-family: inherit; border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; flex-shrink: 0;';
                            labelCell.innerText = colLabel;
                            rowEl.appendChild(labelCell);
                            
                            // Content cell
                            const contentCell = document.createElement('div');
                            contentCell.className = 'v4-admin-content-cell';
                            
                            // Determine style and width of content cell based on columns
                            let cellStyle = 'flex: 1; display: flex; align-items: center; padding: 0 16px; box-sizing: border-box;';
                            if (c < colsAttr - 1) {
                                cellStyle += ' border-right: 1.6px solid rgb(226, 232, 240); flex-shrink: 0;';
                                if (colsAttr === 2) cellStyle += ' width: 30%;';
                                else if (colsAttr === 3) cellStyle += ' width: 25%;';
                                else cellStyle += ' width: 20%;';
                            }
                            contentCell.style.cssText = cellStyle;
                            
                            // Render content based on type (leaving it empty so user can place components)
                            contentCell.innerHTML = '';
                            rowEl.appendChild(contentCell);
                        }
                        tableDiv.appendChild(rowEl);
                    }
                }
                
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();

                // Notify parent about the updated selection properties
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

                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_TOGGLE_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-toggle-container') || (s.classList.contains('v4-toggle-container') ? s : null);
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();

                if (d.checked !== undefined) {
                    container.setAttribute('data-checked', d.checked ? 'true' : 'false');
                }
                if (d.color !== undefined) {
                    container.setAttribute('data-color', d.color);
                }

                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                markDirty();

                if (typeof window._getCompStyles === 'function') {
                    window.parent.postMessage({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(s)
                    }, '*');
                }
            }
        }
        else if (d.type === 'LF_UPDATE_SEARCHBAR_PROPERTIES') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const container = s.querySelector('.v4-searchbar-container');
            if (container) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                if (d.placeholderText !== undefined) {
                    const textEl = container.querySelector('.v4-searchbar-text');
                    if (textEl) {
                        textEl.setAttribute('data-placeholder', d.placeholderText);
                    }
                }
                if (d.fontSize !== undefined) {
                    const textEl = container.querySelector('.v4-searchbar-text');
                    if (textEl) {
                        textEl.style.fontSize = d.fontSize + 'px';
                    }
                    container.setAttribute('data-fontsize', d.fontSize);
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
        else if (d.type === 'LF_UPDATE_STYLE') {
            if (typeof window.v4GlobalStyleHandler === 'function') {
                window.v4GlobalStyleHandler(d);
            }
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
                const isConnector = id.startsWith('conn_');
                const el = doc.getElementById(id);
                if (el) {
                    if (isConnector) {
                        const conn = (window.parent && window.parent.state && window.parent.state.connectors) 
                            ? window.parent.state.connectors.find(c => c.id === id) 
                            : null;
                        if (conn) {
                            const absL = Math.min(conn.start.x, conn.end.x);
                            const absT = Math.min(conn.start.y, conn.end.y);
                            const w = Math.abs(conn.end.x - conn.start.x);
                            const h = Math.abs(conn.end.y - conn.start.y);
                            items.push({ id, type: 'connector', el, x: absL, y: absT, w, h, conn });
                        }
                    } else {
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
                }
            });

            allHandles.forEach((h, i) => h.style.display = handleStates[i]);
            if (items.length < 2) return;

            let minX = Math.min(...items.map(i => i.x));
            let minY = Math.min(...items.map(i => i.y));
            let maxX = Math.max(...items.map(i => i.x + i.w));
            let maxY = Math.max(...items.map(i => i.y + i.h));

            let hasConnectorChanges = false;

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

                    if (item.type === 'connector') {
                        if (item.conn) {
                            item.conn.start.x += dx;
                            item.conn.end.x += dx;
                            item.conn.start.targetId = null; item.conn.start.side = null;
                            item.conn.end.targetId = null; item.conn.end.side = null;
                            hasConnectorChanges = true;
                        }
                    } else {
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
                    }
                });
                allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                if (hasConnectorChanges) {
                    if (window.parent && window.parent.ConnectorEngine) {
                        window.parent.ConnectorEngine.redrawAll();
                    }
                    notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                }
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

                    if (item.type === 'connector') {
                        if (item.conn) {
                            item.conn.start.y += dy;
                            item.conn.end.y += dy;
                            item.conn.start.targetId = null; item.conn.start.side = null;
                            item.conn.end.targetId = null; item.conn.end.side = null;
                            hasConnectorChanges = true;
                        }
                    } else {
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
                    }
                });
                allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                if (hasConnectorChanges) {
                    if (window.parent && window.parent.ConnectorEngine) {
                        window.parent.ConnectorEngine.redrawAll();
                    }
                    notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                }
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

                if (item.type === 'connector') {
                    if (item.conn) {
                        item.conn.start.x += dx;
                        item.conn.start.y += dy;
                        item.conn.end.x += dx;
                        item.conn.end.y += dy;
                        item.conn.start.targetId = null; item.conn.start.side = null;
                        item.conn.end.targetId = null; item.conn.end.side = null;
                        hasConnectorChanges = true;
                    }
                } else {
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
                }
            });
            if (hasConnectorChanges) {
                if (window.parent && window.parent.ConnectorEngine) {
                    window.parent.ConnectorEngine.redrawAll();
                }
                notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
            }
            markDirty();
        } else if (d.type === 'LF_GROUP_SELECTED') {
            const ids = d.ids || [];
            if (ids.length < 2) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            const doc = document;
            const host = doc.body;

            const comps = ids.map(id => doc.getElementById(id)).filter(el => el && !el.classList.contains('connector-line'));
            const groupedConnectorIds = ids.filter(id => id.startsWith('conn_'));
            if (comps.length < 2 && (comps.length + groupedConnectorIds.length) < 2) return;

            // Sort comps based on their current DOM order to preserve relative layering inside the group
            comps.sort((a, b) => {
                const position = a.compareDocumentPosition(b);
                if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
                if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
                return 0;
            });

            // Suspend observer updates to prevent batch movements from triggers
            if (typeof window.suspendDesignSystem === 'function') {
                window.suspendDesignSystem();
            }

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const items = [];

            comps.forEach(c => {
                const l = parseFloat(c.style.left) || 0;
                const t = parseFloat(c.style.top) || 0;
                const w = parseFloat(c.style.width) || c.offsetWidth || 0;
                const h = parseFloat(c.style.height) || c.offsetHeight || 0;

                minX = Math.min(minX, l);
                minY = Math.min(minY, t);
                maxX = Math.max(maxX, l + w);
                maxY = Math.max(maxY, t + h);
                items.push({ el: c, l, t, w, h, type: 'comp' });
            });

            groupedConnectorIds.forEach(id => {
                const conn = (window.parent && window.parent.state && window.parent.state.connectors) 
                    ? window.parent.state.connectors.find(c => c.id === id) 
                    : null;
                if (conn) {
                    const l = Math.min(conn.start.x, conn.end.x);
                    const t = Math.min(conn.start.y, conn.end.y);
                    const w = Math.abs(conn.end.x - conn.start.x);
                    const h = Math.abs(conn.end.y - conn.start.y);

                    minX = Math.min(minX, l);
                    minY = Math.min(minY, t);
                    maxX = Math.max(maxX, l + w);
                    maxY = Math.max(maxY, t + h);
                    
                    const el = doc.getElementById(id);
                    items.push({ el, l, t, w, h, type: 'connector', conn });
                }
            });

            // 2. Hide handles for clean state AFTER gathering coordinates
            const allHandles = doc.querySelectorAll('.lf-drag-handle, .lf-resizer, .lf-delete-trigger');
            const handleStates = Array.from(allHandles).map(h => h.style.display);
            allHandles.forEach(h => h.style.display = 'none');

            const groupBaseL = minX;
            const groupBaseT = minY;
            const groupBaseW = maxX - minX;
            const groupBaseH = maxY - minY;

            const groupId = 'group-' + Date.now();
            const group = doc.createElement('div');
            group.id = groupId;
            group.className = 'lf-component lf-group selected';
            if (groupedConnectorIds.length > 0) {
                group.setAttribute('data-connectors', JSON.stringify(groupedConnectorIds));
            }
            
            // Insert the group exactly before the topmost selected component in the DOM to preserve layer depth
            const topmostComp = comps[comps.length - 1] || (items.length > 0 ? items[items.length - 1].el : null);
            if (topmostComp) {
                topmostComp.parentNode.insertBefore(group, topmostComp);
            } else {
                host.appendChild(group);
            }

            Object.assign(group.style, {
                position: 'absolute', left: groupBaseL + 'px', top: groupBaseT + 'px',
                width: groupBaseW + 'px', height: groupBaseH + 'px',
                background: 'transparent', border: 'none', zIndex: '1000'
            });

            group.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                              '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';


            items.forEach(item => {
                if (item.type === 'connector') return; // virtual, don't move into DOM
                item.el.style.left = (item.l - minX) + 'px';
                item.el.style.top = (item.t - minY) + 'px';
                item.el.style.width = item.w + 'px';
                item.el.style.height = item.h + 'px';
                item.el.classList.remove('selected');
                group.appendChild(item.el);
            });

            // 3. Restore handle states AFTER all children are successfully moved
            allHandles.forEach((h, i) => h.style.display = handleStates[i]);

            // Resume observer updates
            if (typeof window.resumeDesignSystem === 'function') {
                window.resumeDesignSystem();
            }

            // Notify parent with full group styles so Object Properties panel recognizes it as a group immediately
            notifyParent({
                type: 'LF_COMP_SELECTED',
                shiftKey: false,
                ...window._getCompStyles(group)
            });
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

            const groupedConnectorIdsStr = group.getAttribute('data-connectors');
            const groupedConnectorIds = groupedConnectorIdsStr ? JSON.parse(groupedConnectorIdsStr) : [];

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

            groupedConnectorIds.forEach(connId => {
                newIds.push(connId);
            });

            group.remove();
            notifyParent({ type: 'LF_UNGROUPED_SYNC_SELECTION', ids: newIds });
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
                    const rect = content.getBoundingClientRect();
                    const scrollX = window.scrollX || 0;
                    const scrollY = window.scrollY || 0;
                    const l = rect.left + scrollX;
                    const t = rect.top + scrollY;
                    const w = rect.width;
                    const h = rect.height;
                    
                    const sName = 'UI Area ' + (idx + 1);
                    const bezel = 0;
                    
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

                    // Divide mobile screen borders into 4 separate edge walls for proper inner spacing detection
                    rects.push({
                        id: 'mobile-frame-' + idx + '-left',
                        label: sName + ' Left',
                        left: leftVal,
                        top: topVal,
                        width: 0,
                        height: h,
                        right: leftVal,
                        bottom: bottomVal
                    });
                    rects.push({
                        id: 'mobile-frame-' + idx + '-right',
                        label: sName + ' Right',
                        left: rightVal,
                        top: topVal,
                        width: 0,
                        height: h,
                        right: rightVal,
                        bottom: bottomVal
                    });
                    rects.push({
                        id: 'mobile-frame-' + idx + '-top',
                        label: sName + ' Top',
                        left: leftVal,
                        top: topVal,
                        width: w,
                        height: 0,
                        right: rightVal,
                        bottom: topVal
                    });
                    rects.push({
                        id: 'mobile-frame-' + idx + '-bottom',
                        label: sName + ' Bottom',
                        left: leftVal,
                        top: bottomVal,
                        width: w,
                        height: 0,
                        right: rightVal,
                        bottom: bottomVal
                    });
                }
            });

            // Add snapping targets for Query Item (Admin Settings) rows & inner cells
            document.querySelectorAll('.v4-admin-settings-container').forEach(container => {
                const comp = container.closest('.lf-component');
                if (!comp || comp.classList.contains('selected')) return;

                // Get absolute bounding rect of the component relative to the document
                const compRect = comp.getBoundingClientRect();
                const scrollX = window.scrollX || 0;
                const scrollY = window.scrollY || 0;
                const compLeft = compRect.left + scrollX;
                const compTop = compRect.top + scrollY;

                container.querySelectorAll('.v4-admin-row').forEach((row, rIdx) => {
                    const rowRect = row.getBoundingClientRect();
                    const rowTop = rowRect.top + scrollY;
                    const rowHeight = rowRect.height;
                    const rowYCenter = rowTop + rowHeight / 2;

                    // Snap to the vertical center of the row
                    targets.push({ id: comp.id, y: rowYCenter, label: 'Row ' + (rIdx + 1), part: 'Middle', type: 'v' });

                    // Find content cells and calculate offset + 10px snap points
                    const contentCells = row.querySelectorAll('.v4-admin-content-cell');

                    contentCells.forEach((cell, cIdx) => {
                        const cellRect = cell.getBoundingClientRect();
                        const cellLeft = cellRect.left + scrollX;
                        const snapX = cellLeft + 10; // 10px padding from the label border

                        targets.push({ id: comp.id, x: snapX, label: 'Row ' + (rIdx + 1) + ' Col ' + (cIdx + 1) + ' Start', part: 'Left', type: 'h' });
                    });
                });
            });

            notifyParent({ type: 'LF_SNAP_TARGETS_RESPONSE', targets, rects });
        } else if (d.type === 'LF_TABLE_ACTION') {
            if (typeof window.syncTableComponentSize === 'function') {
                window.syncTableComponentSize();
            }
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            const isGrid = s.classList.contains('v4-grid-container') || s.querySelector('.v4-grid-container');
            if (isGrid) {
                const gridContainer = s.classList.contains('v4-grid-container') ? s : s.querySelector('.v4-grid-container');
                const rowCount = parseInt(gridContainer.getAttribute('data-row-count')) || 5;
                const pagination = gridContainer.getAttribute('data-pagination') !== 'false';
                const rowHeight = parseInt(gridContainer.getAttribute('data-row-height')) || 50;
                
                var currentCols = [];
                var rawCols = gridContainer.getAttribute('data-columns');
                if (rawCols) {
                    try { currentCols = JSON.parse(rawCols); } catch(e) {}
                }
                if (!currentCols || currentCols.length === 0) {
                    currentCols = [
                        { name: '', type: 'checkbox', width: '50px' },
                        { name: '번호', type: 'number', width: '100px' },
                        { name: '라이브 방송명', type: 'text', width: '200px' },
                        { name: '방송상태', type: 'status', width: '120px' },
                        { name: '등록/수정자', type: 'author', width: '120px' }
                    ];
                }
                
                const act = (d.action || "").toLowerCase();
                if (act === 'add-row' || act === 'add_row') {
                    window.renderGrid(gridContainer, currentCols, rowCount + 1, pagination, rowHeight);
                } else if (act === 'del-row' || act === 'del_row') {
                    if (rowCount > 1) {
                        window.renderGrid(gridContainer, currentCols, rowCount - 1, pagination, rowHeight);
                    }
                } else if (act === 'add-col' || act === 'add_col') {
                    if (currentCols.length < 10) {
                        currentCols.push({ name: '새 항목', type: 'text', width: '150px' });
                        window.renderGrid(gridContainer, currentCols, rowCount, pagination, rowHeight);
                    }
                } else if (act === 'del-col' || act === 'del_col') {
                    if (currentCols.length > 1) {
                        currentCols.pop();
                        window.renderGrid(gridContainer, currentCols, rowCount, pagination, rowHeight);
                    }
                }
                
                notifyParent(Object.assign({
                    type: "LF_COMP_SELECTED"
                }, window._getCompStyles(s)));
                
                markDirty();
                setTimeout(window.syncTableComponentSize, 50);
                return;
            }
            
            const table = s.querySelector('table'); if (!table) return;
            const focusedCell = table.querySelector('.v4-editable-cell:focus') || document.activeElement?.closest('td, th');
            const selectedCell = table.querySelector('.selected-cell');
            const activeCell = focusedCell ? focusedCell.closest('td, th') : (selectedCell ? selectedCell.closest('td, th') : null);
            
            const targetRow = activeCell ? activeCell.closest('tr') : null;
            const targetColIndex = activeCell ? activeCell.cellIndex : -1;
            const act = (d.action || "").toLowerCase();
            
            if (act === 'add-row' || act === 'add_row') {
                const insertIdx = targetRow ? targetRow.rowIndex + 1 : -1;
                const newRow = table.insertRow(insertIdx);
                const colCount = table.rows[0] ? table.rows[0].cells.length : 1;
                const templateRow = targetRow || table.rows[table.rows.length - 2] || table.rows[0];
                
                if (templateRow && templateRow.style.height) {
                    newRow.style.height = templateRow.style.height;
                } else {
                    newRow.style.height = '50px';
                }
                
                for (let i = 0; i < colCount; i++) {
                    const c = newRow.insertCell();
                    c.className = 'v4-editable-cell';
                    c.contentEditable = 'true';
                    c.innerText = 'Data';
                    
                    if (templateRow && templateRow.cells[i]) {
                        const tc = templateRow.cells[i];
                        c.style.cssText = tc.style.cssText;
                    } else {
                        c.style.border = '1.6px solid var(--v4-border-color, #cbd5e1)';
                        c.style.padding = '12px 6px';
                        c.style.textAlign = 'center';
                        c.style.verticalAlign = 'middle';
                    }
                }
            } else if (act === 'add-col' || act === 'add_col') {
                const insertIdx = targetColIndex !== -1 ? targetColIndex + 1 : -1;
                
                // Synchronize colgroup
                let colgroup = table.querySelector('colgroup');
                if (!colgroup) {
                    colgroup = document.createElement('colgroup');
                    const currentColsCount = table.rows[0] ? table.rows[0].cells.length : 2;
                    for (let i = 0; i < currentColsCount; i++) {
                        const col = document.createElement('col');
                        col.style.width = '100px';
                        colgroup.appendChild(col);
                    }
                    table.insertBefore(colgroup, table.firstChild);
                }
                const newCol = document.createElement('col');
                newCol.style.width = '100px';
                if (insertIdx !== -1 && colgroup.children[insertIdx]) {
                    colgroup.insertBefore(newCol, colgroup.children[insertIdx]);
                } else {
                    colgroup.appendChild(newCol);
                }

                Array.from(table.rows).forEach((r, idx) => {
                    const templateCell = (insertIdx !== -1 && r.cells[insertIdx - 1]) || 
                                         r.cells[insertIdx] || 
                                         r.cells[r.cells.length - 1];
                                         
                    const c = r.insertCell(insertIdx);
                    if (idx === 0) {
                        const th = document.createElement('th');
                        th.className = 'v4-editable-cell';
                        th.contentEditable = 'true';
                        th.innerText = 'Header';
                        
                        if (templateCell) {
                            th.style.cssText = templateCell.style.cssText;
                        } else {
                            th.style.background = 'var(--header-dark, #374151)';
                            th.style.color = '#ffffff';
                            th.style.fontWeight = '800';
                            th.style.border = '1.6px solid var(--v4-border-color, #475569)';
                            th.style.padding = '12px 6px';
                            th.style.textAlign = 'center';
                            th.style.verticalAlign = 'middle';
                        }
                        r.replaceChild(th, c);
                    } else {
                        c.className = 'v4-editable-cell';
                        c.contentEditable = 'true';
                        c.innerText = '-';
                        
                        if (templateCell) {
                            c.style.cssText = templateCell.style.cssText;
                        } else {
                            c.style.border = '1.6px solid var(--v4-border-color, #cbd5e1)';
                            c.style.padding = '12px 6px';
                            c.style.textAlign = 'center';
                            c.style.verticalAlign = 'middle';
                        }
                    }
                });
            } else if (act === 'del-row' || act === 'del_row') {
                if (window.TableManager && window.TableManager.deleteRow) {
                    const rowIndex = targetRow ? targetRow.rowIndex : table.rows.length - 1;
                    window.TableManager.deleteRow(table, rowIndex);
                } else {
                    if (table.rows.length > 1) {
                        const rowToRemove = targetRow || table.rows[table.rows.length - 1];
                        if (rowToRemove) rowToRemove.remove();
                    }
                }
            } else if (act === 'del-col' || act === 'del_col') {
                if (window.TableManager && window.TableManager.deleteColumn) {
                    let colIndex = -1;
                    if (activeCell) {
                        colIndex = window.TableManager.getCellVisualColumnIndex(table, activeCell);
                    }
                    if (colIndex === -1) {
                        const grid = window.TableManager.getTableGridMap(table);
                        colIndex = grid[0] ? grid[0].length - 1 : 0;
                    }
                    
                    const colgroup = table.querySelector('colgroup');
                    if (colgroup && colgroup.children[colIndex]) {
                        colgroup.children[colIndex].remove();
                    }
                    
                    window.TableManager.deleteColumn(table, colIndex);
                } else {
                    const colCount = table.rows[0] ? table.rows[0].cells.length : 0;
                    if (colCount > 1) {
                        const idxToRemove = targetColIndex !== -1 ? targetColIndex : colCount - 1;
                        
                        const colgroup = table.querySelector('colgroup');
                        if (colgroup && colgroup.children[idxToRemove]) {
                            colgroup.children[idxToRemove].remove();
                        }
                        
                        Array.from(table.rows).forEach(r => {
                            if (r.cells[idxToRemove]) r.cells[idxToRemove].remove();
                        });
                    }
                }
            } else if (act === 'merge_cells' || act === 'merge-cells') {
                if (window.TableManager && window.TableManager.mergeSelectedCells) {
                    window.TableManager.mergeSelectedCells(table);
                }
            } else if (act === 'split_cells' || act === 'split-cells') {
                if (window.TableManager && window.TableManager.splitSelectedCells) {
                    window.TableManager.splitSelectedCells(table);
                }
            }
            markDirty();
            setTimeout(window.syncTableComponentSize, 50);
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
                markDirty();
                setTimeout(window.syncTableComponentSize, 50);
            }
        } else if (d.type === 'LF_UPDATE_CELL_BORDER') {
            if (window.TableManager && window.TableManager.updateSelectedCellsBorder) {
                window.TableManager.updateSelectedCellsBorder(d.borderType, d.color);
            }
        }
    });

    window.updateConnectorPathLocal = (connId) => {
        const conn = window.parent?.state?.connectors?.find(c => c.id === connId);
        if (!conn) return;
        const svg = document.getElementById(conn.id);
        if (!svg) return;
        
        const headLength = Math.max(12, parseFloat(conn.style.strokeWidth || 1.6) * 4.5);
        const padding = headLength + 10;
        const minX = Math.min(conn.start.x, conn.end.x) - padding;
        const minY = Math.min(conn.start.y, conn.end.y) - padding;
        const w = Math.max(conn.start.x, conn.end.x) + padding - minX;
        const h = Math.max(conn.start.y, conn.end.y) + padding - minY;
        
        svg.style.left = minX + 'px';
        svg.style.top = minY + 'px';
        svg.style.width = w + 'px';
        svg.style.height = h + 'px';
        
        const rel = (pt) => ({ x: pt.x - minX, y: pt.y - minY });
        const rStart = rel(conn.start);
        const rEnd = rel(conn.end);
        
        const paths = svg.querySelectorAll('path');
        if (paths.length >= 2) {
            const pathData = window.calculatePathData(conn, rStart, rEnd);
            paths[0].setAttribute('d', pathData);
            paths[1].setAttribute('d', pathData);
        }
        
        const circles = svg.querySelectorAll('circle');
        if (circles.length === 2) {
            circles[0].setAttribute('cx', rStart.x);
            circles[0].setAttribute('cy', rStart.y);
            circles[1].setAttribute('cx', rEnd.x);
            circles[1].setAttribute('cy', rEnd.y);
        }
    };


    window.initHandles = () => {
        document.querySelectorAll('.lf-component').forEach(c => {
            if (!c.querySelector(':scope > .lf-drag-handle')) {
                const h = document.createElement('div');
                h.className = 'lf-drag-handle';
                h.innerHTML = '<svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>';
                c.appendChild(h);
            }
            if (!c.querySelector(':scope > .lf-resizer')) {
                const r = document.createElement('div');
                r.className = 'lf-resizer';
                c.appendChild(r);
            }
            if (!c.querySelector(':scope > .lf-delete-trigger')) {
                const d = document.createElement('div');
                d.className = 'lf-delete-trigger';
                d.innerHTML = '&times;';
                c.appendChild(d);
            }
            if (!c.classList.contains('lf-group') && !c.classList.contains('connector-line')) {
                ['top', 'bottom', 'left', 'right'].forEach(side => {
                    if (!c.querySelector(':scope > .lf-connector-port.port-' + side)) {
                        const port = document.createElement('div');
                        port.className = 'lf-connector-port port-' + side;
                        port.setAttribute('data-side', side);
                        port.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (window.V4PortConnectorEngine) {
                                window.V4PortConnectorEngine.startConnectorDragFromPort(c, side, e);
                            }
                        });
                        c.appendChild(port);
                    }
                });
            }
        });
        
        // Initialize existing grid height and rendering details on load
        document.querySelectorAll('.v4-grid-container').forEach(function(container) {
            var currentCols = [];
            try {
                currentCols = JSON.parse(container.getAttribute('data-columns') || '[]');
            } catch(e) {}
            var rowCount = parseInt(container.getAttribute('data-row-count')) || 5;
            var showPagination = container.getAttribute('data-pagination') === 'true';
            var rowHeight = parseInt(container.getAttribute('data-row-height')) || 50;
            if (window.renderGrid) {
                window.renderGrid(container, currentCols, rowCount, showPagination, rowHeight);
            }
        });
    };
    window.initHandles();

    // Fullscreen presentation proxy listeners to notify parent window
    window.addEventListener('mousemove', (e) => {
        try {
            if (window.parent && typeof window.parent.__lf_proxy_mousemove__ === 'function') {
                window.parent.__lf_proxy_mousemove__(e, window.frameElement);
            }
        } catch(err) {}
    });

    window.addEventListener('keydown', (e) => {
        try {
            if (e.key === 'Shift' && window.parent && typeof window.parent.__lf_proxy_keydown__ === 'function') {
                window.parent.__lf_proxy_keydown__(e);
            }
        } catch(err) {}
    });

    window.addEventListener('keyup', (e) => {
        try {
            if (e.key === 'Shift' && window.parent && typeof window.parent.__lf_proxy_keyup__ === 'function') {
                window.parent.__lf_proxy_keyup__(e);
            }
        } catch(err) {}
    });
})();
`;
