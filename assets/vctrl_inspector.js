/**
 * vctrl_inspector.js - UI & Inspector Controller
 * Responsibility: DOM management, sidebar tabs, metadata UI, and component properties.
 */

console.log("%c [VCTRL INSPECTOR] Initializing UI Controller... ", "background: #10b981; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 1. Central DOM Registry
window.get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {}, toggle:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };

window.DOM = {
    iframe: get('main-iframe'),
    artboardWrapper: get('artboard-wrapper'),
    placeholder: get('placeholder'),
    placeholderTxt: get('placeholder-txt'),
    canvas: get('canvas'),
    stage: get('stage'),
    zoomTxt: get('zoom-txt'),
    fileName: get('file-name-display'),
    btnBack: get('btn-back'),
    
    // Panels
    metadataPanel: get('top-metadata-panel'),
    screensList: get('screens-list'),
    descriptionList: get('description-list'),
    sidebarLeft: get('sidebar-left'),
    sidebarRight: get('sidebar-right'),
    
    // Bottom Bar
    // Bottom Bar
    pinsLayer: get('pins-layer'),
    guideLayer: get('guide-layer'),
    
    // Buttons
    btnToggleLeft: get('btn-toggle-left'),
    btnToggleRight: get('btn-toggle-right'),
    btnGlobalSave: get('btn-global-save'),
    btnFullscreen: get('btn-fullscreen-toggle'),
    btnFullscreenExit: get('btn-fullscreen-exit'),
    
    // Screen Management
    btnAddScreen: get('btn-add-screen'),
    addScreenUpload: get('add-screen-upload'),
    addScreenModal: get('add-screen-modal'),
    btnCancelAdd: get('btn-add-screen-cancel'),
    btnSubmitAdd: get('btn-add-screen-submit'),
    
    // Templates
    newScreenName: get('new-screen-name'),
    templateList: get('template-list'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    sidebarToolBtns: document.querySelectorAll('.sidebar-tool-btn'),

    // Modals
    editScreenModal: get('edit-screen-modal'),
    editScreenTitle: get('edit-screen-title'),
    editScreenType: get('edit-screen-type'),
    editScreenDefaultTab: get('edit-screen-default-tab'),
    editScreenDesc: get('edit-screen-desc'),
    editScreenFilename: get('edit-screen-filename'),
    btnCancelEdit: get('btn-edit-screen-cancel'),
    btnSubmitEdit: get('btn-edit-screen-submit'),
    
    // Description
    btnAddDescription: get('btn-add-description'),

    // Properties Sidebar Additions
    textPropSection: get('text-editor-section'),
    tablePropSection: get('table-inspector-section'),
    shapePropSection: get('shape-inspector-section'),
    linePropSection: get('line-editor-section'),
    iconPropSection: get('icon-inspector-section'),
    checkboxRadioPropSection: get('checkbox-radio-inspector-section'),
    textboxTextareaPropSection: get('textbox-textarea-inspector-section'),
    stepperPropSection: get('stepper-inspector-section'),
    selectboxPropSection: get('selectbox-inspector-section'),
    fileuploadPropSection: get('fileupload-inspector-section'),
    alertPropSection: get('alert-inspector-section'),
    buttonPropSection: get('button-inspector-section'),
    datePickerPropSection: get('datepicker-inspector-section'),
    textColorPicker: get('text-color-picker'),
    colorPresets: document.querySelectorAll('.color-preset'),

    // Selection Actions
    selectionBar: get('selection-actions-bar'),
    selectionCount: get('selection-count'),
    selectionNumber: get('selection-number'),
    selectionLabel: get('selection-label'),
    btnGroup: get('btn-group-action'),
    btnUngroup: get('btn-ungroup-action'),
    btnAddToMolecules: get('btn-add-molecules-action'),
    // Alignment
    alignBar: get('selection-align-bar'),
    btnAlignLeft: get('btn-align-left'),
    btnAlignCenter: get('btn-align-center'),
    btnAlignRight: get('btn-align-right'),
    btnAlignTop: get('btn-align-top'),
    btnAlignMiddle: get('btn-align-middle'),
    btnAlignBottom: get('btn-align-bottom')
};

// --- 2. Sidebar & Tab Management (Unified & Clean) ---
window.toggleSidebar = function(side, forceOpen = null) {
    console.log(`[Inspector] toggleSidebar(${side}, forceOpen: ${forceOpen})`);
    const sidebar = side === 'left' ? DOM.sidebarLeft : DOM.sidebarRight;
    if (!sidebar || !sidebar.classList) return;
    
    const isCollapsed = sidebar.classList.contains('collapsed');
    const shouldOpen = forceOpen !== null ? forceOpen : isCollapsed;
    
    sidebar.classList.toggle('collapsed', !shouldOpen);
    console.log(`[Inspector] Sidebar ${side} is now ${shouldOpen ? 'OPEN' : 'COLLAPSED'}`);
    
    const btn = side === 'left' ? DOM.btnToggleLeft : DOM.btnToggleRight;
    if (btn) {
        const icon = btn.querySelector('.material-icons-outlined');
        if (icon) {
            if (side === 'left') icon.innerText = shouldOpen ? 'chevron_left' : 'chevron_right';
            else icon.innerText = shouldOpen ? 'chevron_right' : 'chevron_left';
        }
    }
};

window.switchSidebarTab = function(tabName) {
    console.log(`[Inspector] switchSidebarTab START: ${tabName}`);
    console.trace(); // Trace who is calling this!
    const btns = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    
    if (btns.length === 0) console.warn("[Inspector] No .tab-btn elements found!");
    if (panes.length === 0) console.warn("[Inspector] No .tab-pane elements found!");

    btns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    panes.forEach(pane => {
        const isActive = pane.id === `tab-${tabName}`;
        pane.classList.toggle('active', isActive);
        pane.style.setProperty('display', isActive ? 'flex' : 'none', 'important');
        if (isActive) console.log(`[Inspector] Pane activated: ${pane.id}`);
    });
    
    // Ensure sidebar is open when switching tabs
    window.toggleSidebar('right', true);
    
    if (tabName === 'description' && typeof window.autoResizeDescriptionInputs === 'function') {
        setTimeout(window.autoResizeDescriptionInputs, 50);
    }
    
    console.log(`[Inspector] switchSidebarTab END: ${tabName}`);
};

// --- 3. UI Rendering Functions ---
window.updateProperties = function(compStyles) {
    const pm = state.projectMetadata || {};
    if (!DOM.metadataPanel) return;

    // 1. Update Top Metadata Bar
    if (!DOM.metadataPanel.innerHTML.includes('v4-meta-horizontal')) {
        DOM.metadataPanel.innerHTML = `
            <div class="v4-meta-horizontal">
                <div class="v4-meta-item" style="flex: 0 0 180px;">
                    <label>PROJECT TITLE</label>
                    <input type="text" id="viewer-meta-title" value="${pm.title || ''}" placeholder="프로젝트 제목">
                </div>
                <div class="v4-meta-item" style="flex: 0 0 80px;">
                    <label>ASSIGNEE</label>
                    <input type="text" id="viewer-meta-assignee" value="${pm.assignee || ''}" placeholder="담당자">
                </div>
                <div class="v4-meta-item" style="flex: 0 0 80px;">
                    <label>DEVELOPER</label>
                    <input type="text" id="viewer-meta-developer" value="${pm.developer || ''}" placeholder="개발자">
                </div>
                <div class="v4-meta-item" style="flex: 0 0 200px;">
                    <label>PERIOD</label>
                    <input type="text" id="viewer-meta-period" value="${pm.period || ''}" placeholder="사업 기간">
                </div>
                <div class="v4-meta-item" style="flex: 0 0 220px; position: relative;">
                    <label>JIRA / LINKS</label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="text" id="viewer-meta-jira" value="${pm.jira || ''}" placeholder="예) LFML-123456" style="flex: 1;">
                        <a id="btn-jira-link" href="${(pm.jira && typeof pm.jira === 'string') ? 'https://jira.lfcorp.com/browse/' + pm.jira.trim() : '#'}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="display: ${(pm.jira && typeof pm.jira === 'string' && pm.jira.trim()) ? 'flex' : 'none'}; height: 22px; padding: 0 8px; font-size: 11px;">바로가기</a>
                    </div>
                </div>
            </div>
        `;
        const btnSave = document.getElementById('btn-global-save');
        const jiraInput = document.getElementById('viewer-meta-jira');
        const jiraBtn = document.getElementById('btn-jira-link');
        if (jiraInput && jiraBtn) {
            jiraInput.oninput = () => {
                const val = jiraInput.value.trim();
                jiraBtn.style.display = val ? 'flex' : 'none';
                jiraBtn.href = val ? 'https://jira.lfcorp.com/browse/' + val : '#';
                markAsDirty();
            };
        }
    } else {
        const titleIn = document.getElementById('viewer-meta-title'); if (titleIn) titleIn.value = pm.title || '';
        const jiraIn = document.getElementById('viewer-meta-jira'); if (jiraIn) jiraIn.value = pm.jira || '';
    }

    // 1-1. Update Sidebar Footer (Last Updated)
    const updatedTxt = document.getElementById('meta-updated-txt');
    if (updatedTxt) {
        updatedTxt.innerText = pm.updated ? `최종 업데이트: ${pm.updated}` : '최종 업데이트: -';
    }

    // 2. Update Sidebar Panels based on selected component
    if (compStyles) {
        console.log("[Inspector] Received styles:", compStyles);
        
        // Force Tab Switch
        window.switchSidebarTab('editor');

        state.isEditing = true;
        state.editingIndex = (compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1) ? compStyles.pinIndex : compStyles.id;
        let type = 'comp';
        if (compStyles.isPin) type = 'pin';
        else if (compStyles.isTable) type = 'table';
        else if (compStyles.isShape) type = 'shape';
        else if (compStyles.isConnector) type = 'line';
        else if (compStyles.isTextbox) type = 'textbox';
        else if (compStyles.isTextarea) type = 'textarea';
        else if (compStyles.isStepper) type = 'stepper';
        else if (compStyles.isSelectbox) type = 'selectbox';
        else if (compStyles.isFileUpload) type = 'fileupload';
        else if (compStyles.isAlert) type = 'alert';
        else if (compStyles.isButton) type = 'button';
        else if (compStyles.isDatePicker) type = 'datepicker';
        else if (compStyles.isIcon) type = 'icon';
        state.editingType = type;

        // Hide all sections first
        if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
        if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'none';
        if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
        if (DOM.linePropSection) DOM.linePropSection.style.display = 'none';
        if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'none';
        if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'none';
        if (DOM.textboxTextareaPropSection) DOM.textboxTextareaPropSection.style.display = 'none';
        if (DOM.stepperPropSection) DOM.stepperPropSection.style.display = 'none';
        if (DOM.selectboxPropSection) DOM.selectboxPropSection.style.display = 'none';
        if (DOM.fileuploadPropSection) DOM.fileuploadPropSection.style.display = 'none';
        if (DOM.alertPropSection) DOM.alertPropSection.style.display = 'none';
        if (DOM.buttonPropSection) DOM.buttonPropSection.style.display = 'none';
        if (DOM.datePickerPropSection) DOM.datePickerPropSection.style.display = 'none';

        // Show relevant section
        if (state.editingType === 'pin') {
            if (DOM.textPropSection) DOM.textPropSection.style.display = 'block';
        }

        if (state.editingType === 'shape') {
            if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'block';
            // Shape도 CONTENT EDITOR 공유 사용
            if (DOM.textPropSection) DOM.textPropSection.style.display = 'block';
        } else if (state.editingType === 'table') {
            if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'block';
        } else if (state.editingType === 'line') {
            if (DOM.linePropSection) DOM.linePropSection.style.display = 'block';
        } else if (state.editingType === 'icon') {
            if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'block';
            if (compStyles.isCheckbox || compStyles.isRadio) {
                if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'block';
                _syncCheckboxRadioProps(compStyles);
            }
        } else if (state.editingType === 'textbox' || state.editingType === 'textarea') {
            if (DOM.textboxTextareaPropSection) DOM.textboxTextareaPropSection.style.display = 'block';
            _syncTextboxTextareaProps(compStyles);
        } else if (state.editingType === 'stepper') {
            if (DOM.stepperPropSection) DOM.stepperPropSection.style.display = 'block';
            _syncStepperProps(compStyles);
        } else if (state.editingType === 'selectbox') {
            if (DOM.selectboxPropSection) DOM.selectboxPropSection.style.display = 'block';
            _syncSelectboxProps(compStyles);
        } else if (state.editingType === 'fileupload') {
            if (DOM.fileuploadPropSection) DOM.fileuploadPropSection.style.display = 'block';
            _syncFileuploadProps(compStyles);
        } else if (state.editingType === 'alert') {
            if (DOM.alertPropSection) DOM.alertPropSection.style.display = 'block';
            _syncAlertProps(compStyles);
        } else if (state.editingType === 'button') {
            if (DOM.buttonPropSection) DOM.buttonPropSection.style.display = 'block';
            _syncButtonProps(compStyles);
        } else if (state.editingType === 'datepicker') {
            if (DOM.datePickerPropSection) DOM.datePickerPropSection.style.display = 'block';
            _syncDatePickerProps(compStyles);
        }

        // CONTENT EDITOR 헤더 레이블 동적 변경
        const editorLabel = document.getElementById('content-editor-label');
        if (editorLabel) {
            editorLabel.innerText = state.editingType === 'shape' ? 'SHAPE TEXT' : 'CONTENT EDITOR';
        }

        // Load content to Quill
        if (state.editingType === 'pin' && compStyles.html !== undefined && window.quillEditor) {
            setTimeout(() => {
                window.quillEditor.root.innerHTML = compStyles.html;
                console.log("[Inspector] Loaded HTML to Quill:", compStyles.html);
            }, 50);
        } else if (state.editingType === 'shape' && window.quillEditor) {
            // shape 내부 텍스트를 Quill에 로드 (wrapper div 벗겨내기)
            const rawHtml = compStyles.html || '';
            const parser = new DOMParser();
            const parsed = parser.parseFromString(rawHtml, 'text/html');
            const textContent = parsed.querySelector('.v4-shape-text-content') || parsed.querySelector('.v4-shape-text-overlay');
            const cleanHtml = textContent ? textContent.innerHTML : rawHtml;

            // 초기 로드 중에는 text-change → LF_UPDATE_SHAPE_TEXT 루프를 방지
            state._isLoadingShapeContent = true;
            setTimeout(() => {
                window.quillEditor.root.innerHTML = cleanHtml;
                console.log("[Inspector] Loaded Shape HTML to Quill:", cleanHtml);
                // 다음 틱에 가드 해제 (text-change가 먼저 발사된 후 해제)
                requestAnimationFrame(() => {
                    state._isLoadingShapeContent = false;
                });
            }, 50);
        }

        // Sync Property Controls
        const s = compStyles.currentStyles || {};
        if (DOM.textColorPicker) DOM.textColorPicker.value = s.text || "#000000";

    } else {
        state.isEditing = false;
        state.editingIndex = -1;
        if (DOM.selectionBar) DOM.selectionBar.style.display = 'none';
        // Hide all sections when nothing selected
        if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
        if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'none';
        if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
        if (DOM.linePropSection) DOM.linePropSection.style.display = 'none';
        if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'none';
        if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'none';
        if (DOM.textboxTextareaPropSection) DOM.textboxTextareaPropSection.style.display = 'none';
        if (DOM.stepperPropSection) DOM.stepperPropSection.style.display = 'none';
        if (DOM.selectboxPropSection) DOM.selectboxPropSection.style.display = 'none';
        if (DOM.fileuploadPropSection) DOM.fileuploadPropSection.style.display = 'none';
        if (DOM.alertPropSection) DOM.alertPropSection.style.display = 'none';
        if (DOM.buttonPropSection) DOM.buttonPropSection.style.display = 'none';
        if (DOM.datePickerPropSection) DOM.datePickerPropSection.style.display = 'none';
    }
};

function _syncStepperProps(comp) {
    const activeY = document.getElementById('btn-stepper-btn-y');
    const activeN = document.getElementById('btn-stepper-btn-n');
    const disabledY = document.getElementById('btn-stepper-disabled-y');
    const disabledN = document.getElementById('btn-stepper-disabled-n');
    
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    if (activeY && activeN) {
        highlightActive(activeY, comp.btnEnabled === true);
        highlightActive(activeN, comp.btnEnabled === false);
    }
    if (disabledY && disabledN) {
        highlightActive(disabledY, comp.disabled === true);
        highlightActive(disabledN, comp.disabled === false);
    }
    
    const minInput = document.getElementById('prop-stepper-min');
    if (minInput && comp.minVal !== undefined) {
        minInput.value = comp.minVal;
    }
    
    const maxInput = document.getElementById('prop-stepper-max');
    if (maxInput && comp.maxVal !== undefined) {
        maxInput.value = comp.maxVal;
    }
    
    const btnTextInput = document.getElementById('prop-stepper-btn-text');
    if (btnTextInput && comp.btnText !== undefined) {
        btnTextInput.value = comp.btnText;
    }
}

function _syncSelectboxProps(comp) {
    const activeY = document.getElementById('btn-selectbox-dropdown-y');
    const activeN = document.getElementById('btn-selectbox-dropdown-n');
    
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    const isDropdown = comp.selectboxDropdownActive === true;

    if (activeY && activeN) {
        highlightActive(activeY, isDropdown);
        highlightActive(activeN, !isDropdown);
    }

    const defaultControls = document.getElementById('selectbox-default-controls');
    const dropdownControls = document.getElementById('selectbox-dropdown-controls');
    if (defaultControls) defaultControls.style.display = isDropdown ? 'none' : 'block';
    if (dropdownControls) dropdownControls.style.display = isDropdown ? 'block' : 'none';

    const defaultTextInput = document.getElementById('prop-selectbox-default-text');
    if (defaultTextInput && comp.selectboxDefaultText !== undefined) {
        defaultTextInput.value = comp.selectboxDefaultText;
    }

    const options = comp.selectboxOptions || [];
    const countInput = document.getElementById('prop-selectbox-option-count');
    if (countInput) {
        countInput.value = options.length;
    }

    const inputsContainer = document.getElementById('selectbox-options-inputs-container');
    if (inputsContainer) {
        inputsContainer.innerHTML = options.map((optText, idx) => {
            return `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 10px; color: #94a3b8; width: 45px; flex-shrink: 0;">Item ${idx + 1}</span>
                <input type="text" class="selectbox-option-input" data-index="${idx}" value="${optText}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; outline: none; font-family: inherit;">
            </div>`;
        }).join('');
    }
}

function _syncFileuploadProps(comp) {
    const activeY = document.getElementById('btn-fileupload-selected-y');
    const activeN = document.getElementById('btn-fileupload-selected-n');
    
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    const isSelected = comp.fileSelected === true;

    if (activeY && activeN) {
        highlightActive(activeY, isSelected);
        highlightActive(activeN, !isSelected);
    }

    const nameControls = document.getElementById('fileupload-name-controls');
    const placeholderControls = document.getElementById('fileupload-placeholder-controls');
    if (nameControls) nameControls.style.display = isSelected ? 'block' : 'none';
    if (placeholderControls) placeholderControls.style.display = isSelected ? 'none' : 'block';

    const nameInput = document.getElementById('prop-fileupload-file-name');
    if (nameInput && comp.fileName !== undefined) {
        nameInput.value = comp.fileName;
    }

    const placeholderInput = document.getElementById('prop-fileupload-placeholder');
    if (placeholderInput && comp.filePlaceholder !== undefined) {
        placeholderInput.value = comp.filePlaceholder;
    }

    const btnTextInput = document.getElementById('prop-fileupload-btn-text');
    if (btnTextInput && comp.fileButtonText !== undefined) {
        btnTextInput.value = comp.fileButtonText;
    }
}

function _syncAlertProps(comp) {
    const msgText = document.getElementById('prop-alert-message');
    if (msgText && comp.alertMessage !== undefined) {
        msgText.value = comp.alertMessage;
    }
    
    const count = comp.alertBtnCount || 1;
    for (let i = 1; i <= 3; i++) {
        const btn = document.getElementById('btn-alert-count-' + i);
        if (btn) {
            const isActive = count === i;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        }
    }
    
    const btn1 = document.getElementById('prop-alert-btn-1');
    if (btn1 && comp.alertBtnText1 !== undefined) btn1.value = comp.alertBtnText1;
    const style1 = comp.alertBtnStyle1 || 'normal';
    const sel1 = document.getElementById('prop-alert-btn-style-1');
    if (sel1) sel1.value = style1;
    
    const btn2 = document.getElementById('prop-alert-btn-2');
    if (btn2 && comp.alertBtnText2 !== undefined) btn2.value = comp.alertBtnText2;
    const style2 = comp.alertBtnStyle2 || 'normal';
    const sel2 = document.getElementById('prop-alert-btn-style-2');
    if (sel2) sel2.value = style2;
    const btn2Container = document.getElementById('prop-alert-btn-2-container');
    if (btn2Container) btn2Container.style.display = count >= 2 ? 'flex' : 'none';
    
    const btn3 = document.getElementById('prop-alert-btn-3');
    if (btn3 && comp.alertBtnText3 !== undefined) btn3.value = comp.alertBtnText3;
    const style3 = comp.alertBtnStyle3 || 'normal';
    const sel3 = document.getElementById('prop-alert-btn-style-3');
    if (sel3) sel3.value = style3;
    const btn3Container = document.getElementById('prop-alert-btn-3-container');
    if (btn3Container) btn3Container.style.display = count >= 3 ? 'flex' : 'none';
}

function _syncButtonProps(comp) {
    const txtInput = document.getElementById('prop-button-text');
    if (txtInput && comp.buttonText !== undefined) {
        txtInput.value = comp.buttonText;
    }
    
    const selStyle = document.getElementById('prop-button-style');
    if (selStyle && comp.buttonStyle !== undefined) {
        selStyle.value = comp.buttonStyle;
        const customColorsDiv = document.getElementById('prop-button-custom-colors');
        if (customColorsDiv) {
            customColorsDiv.style.display = (comp.buttonStyle === 'custom') ? 'block' : 'none';
        }
    }
    
    const radiusSlider = document.getElementById('prop-button-border-radius');
    const radiusTxt = document.getElementById('txt-button-border-radius');
    if (radiusSlider && comp.buttonRadius !== undefined) {
        const r = parseInt(comp.buttonRadius) || 0;
        radiusSlider.value = r;
        if (radiusTxt) radiusTxt.innerText = r;
    }

    if (comp.buttonStyle === 'custom' && comp.currentStyles) {
        const s = comp.currentStyles;
        const syncColorLocal = (id, wrapperId, color, isTransparent) => {
            const picker = document.getElementById(id);
            const wrapper = document.getElementById(wrapperId);
            if (picker && color) picker.value = color;
            if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
        };
        syncColorLocal('prop-button-bg-color', 'button-bg-wrapper', s.bg, s.isBgTransparent);
        syncColorLocal('prop-button-border-color', 'button-border-wrapper', s.border, s.isBorderTransparent);
        syncColorLocal('prop-button-text-color', 'button-text-wrapper', s.text, false);
    }
}

function _syncTextboxTextareaProps(comp) {
    const activeY = document.getElementById('btn-input-counter-y');
    const activeN = document.getElementById('btn-input-counter-n');
    
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    if (activeY && activeN) {
        highlightActive(activeY, comp.showCounter === true);
        highlightActive(activeN, comp.showCounter === false);
    }
    
    const phInput = document.getElementById('prop-input-placeholder');
    if (phInput && comp.placeholderText !== undefined) {
        phInput.value = comp.placeholderText;
    }
    
    const mlInput = document.getElementById('prop-input-maxlength');
    const mlTxt = document.getElementById('txt-input-maxlength');
    if (mlInput && comp.maxLength !== undefined) {
        mlInput.value = comp.maxLength;
        if (mlTxt) mlTxt.innerText = comp.maxLength;
    }
    
    const s = comp.currentStyles || {};
    const syncColor = (id, wrapperId, color, isTransparent) => {
        const picker = document.getElementById(id);
        const wrapper = document.getElementById(wrapperId);
        if (picker && color) picker.value = color;
        if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
    };
    syncColor('input-bg-color', 'input-bg-wrapper', s.bg, s.isBgTransparent);
    syncColor('input-border-color', 'input-border-wrapper', s.border, s.isBorderTransparent);

    // Sync Font Size & Font Family
    const fsInput = document.getElementById('prop-input-fontsize');
    if (fsInput && s.fontSize !== undefined) {
        fsInput.value = s.fontSize;
    }
    const ffInput = document.getElementById('prop-input-fontfamily');
    if (ffInput && s.fontFamily !== undefined) {
        const normalizedFont = s.fontFamily.replace(/['"]/g, '');
        let matched = false;
        for (let i = 0; i < ffInput.options.length; i++) {
            const optVal = ffInput.options[i].value.replace(/['"]/g, '');
            if (optVal === normalizedFont) {
                ffInput.selectedIndex = i;
                matched = true;
                break;
            }
        }
        if (!matched) {
            ffInput.value = 'inherit';
        }
    }
}

function _syncCheckboxRadioProps(comp) {
    const activeY = document.getElementById('btn-atom-active-y');
    const activeN = document.getElementById('btn-atom-active-n');
    const textY = document.getElementById('btn-atom-text-y');
    const textN = document.getElementById('btn-atom-text-n');
    
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    if (activeY && activeN) {
        highlightActive(activeY, comp.checked === true);
        highlightActive(activeN, comp.checked === false);
    }
    if (textY && textN) {
        highlightActive(textY, comp.textEnabled === true);
        highlightActive(textN, comp.textEnabled === false);
    }
    
    const s = comp.currentStyles || {};
    const syncColor = (id, wrapperId, color, isTransparent) => {
        const picker = document.getElementById(id);
        const wrapper = document.getElementById(wrapperId);
        if (picker && color) picker.value = color;
        if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
    };
    syncColor('atom-bg-color', 'atom-bg-wrapper', s.bg, s.isBgTransparent);
    syncColor('atom-border-color', 'atom-border-wrapper', s.border, s.isBorderTransparent);
}

function _syncDatePickerProps(comp) {
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    // Sync presets show/hide toggle
    const presetsY = document.getElementById('btn-dp-presets-y');
    const presetsN = document.getElementById('btn-dp-presets-n');
    const showPresets = comp.dpShowPresets !== false;
    highlightActive(presetsY, showPresets);
    highlightActive(presetsN, !showPresets);

    // Sync show end date toggle
    const showEndY = document.getElementById('btn-dp-show-end-y');
    const showEndN = document.getElementById('btn-dp-show-end-n');
    const showEndDate = comp.dpShowEndDate !== false;
    highlightActive(showEndY, showEndDate);
    highlightActive(showEndN, !showEndDate);

    // Sync default preset buttons
    const presetKeys = ['none', '1D', '1W', '1M', '6M', 'all'];
    const currentPreset = comp.dpDefaultPreset || 'none';
    presetKeys.forEach(key => {
        const btn = document.getElementById('btn-dp-default-' + key);
        highlightActive(btn, key === currentPreset);
    });

    // Sync date inputs
    const startInput = document.getElementById('prop-dp-start-date');
    const endInput = document.getElementById('prop-dp-end-date');
    if (startInput && comp.dpStartDate !== undefined) startInput.value = comp.dpStartDate;
    if (endInput && comp.dpEndDate !== undefined) endInput.value = comp.dpEndDate;
}

window.renderScreenList = function(screens, activeName) {
    DOM.screensList.innerHTML = '';
    let activeItem = null;
    
    screens.forEach((s, index) => {
        const item = document.createElement('div');
        item.className = 'screen-item';
        item.draggable = !state.isReadOnly;
        item.dataset.index = index;
        
        const scMeta = (state.projectMetadata.screens || {})[s.name] || {};
        const badgeHtml = getCategoryBadge(scMeta.type);
        const displayTitle = scMeta.title || s.name;

        item.innerHTML = `
            <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                ${badgeHtml}
                <span class="screen-name" title="${s.name}">${displayTitle}</span>
            </div>
            <div class="screen-actions" style="display:flex; gap:4px;">
                <button class="screen-edit-btn" title="속성 편집"><span class="material-icons-outlined" style="font-size:16px;">edit</span></button>
                <button class="screen-delete-btn" title="화면 삭제"><span class="material-icons-outlined" style="font-size:16px;">delete</span></button>
            </div>
        `;
        
        if (s.name === activeName) {
            item.classList.add('active');
            activeItem = item;
        }

        item.onclick = async (e) => {
            if (e.target.closest('.screen-delete-btn')) {
                if (typeof window.handleDeleteScreen === 'function') window.handleDeleteScreen(s.name, s.sha);
                return;
            }
            if (e.target.closest('.screen-edit-btn')) {
                if (typeof window.handleEditScreen === 'function') window.handleEditScreen(s.name);
                return;
            }
            if (typeof window.checkUnsavedChanges === 'function' && !(await window.checkUnsavedChanges())) return;
            const url = `viewer.html?project=${state.currentProject}&file=${s.name}`;
            history.pushState(null, '', url);
            if (typeof window.loadScreen === 'function') window.loadScreen(s.name);
            updateActiveScreenInUI(s.name);
        };

        item.ondragstart = (e) => { e.dataTransfer.setData('text/plain', index); item.classList.add('dragging'); };
        item.ondragend = () => { item.classList.remove('dragging'); document.querySelectorAll('.screen-item').forEach(i => i.classList.remove('drag-over')); };
        item.ondragover = (e) => { e.preventDefault(); item.classList.add('drag-over'); };
        item.ondragleave = () => item.classList.remove('drag-over');
        item.ondrop = async (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(item.dataset.index);
            if (fromIndex !== toIndex) {
                const [movedItem] = state.screens.splice(fromIndex, 1);
                state.screens.splice(toIndex, 0, movedItem);
                state.projectMetadata.screenOrder = state.screens.map(s => s.name);
                if (typeof window.saveProjectMetadata === 'function') await window.saveProjectMetadata(state.currentProject, state.projectMetadata);
                renderScreenList(state.screens, state.activeFile?.name);
            }
        };

        DOM.screensList.appendChild(item);
    });

    if (activeItem) {
        setTimeout(() => activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 800);
    }
};

window.updateActiveScreenInUI = function(activeName) {
    document.querySelectorAll('.screen-item').forEach(item => {
        const name = item.querySelector('.screen-name').title;
        item.classList.toggle('active', name === activeName);
        if (name === activeName) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
};

function getCategoryBadge(type) {
    if (!type || type === 'default') return '<span class="screen-badge badge-default">ETC</span>';
    const categories = {
        'cover': { label: 'COVER', class: 'badge-cover' },
        'architecture': { label: 'ARCH', class: 'badge-architecture' },
        'plan': { label: 'PLAN', class: 'badge-plan' },
        'ui': { label: 'UI', class: 'badge-ui' },
        'mobile-ui': { label: 'MOBILE', class: 'badge-mobile-ui' },
        'admin-nbos': { label: 'NBOS', class: 'badge-admin-nbos' },
        'admin-onesphere': { label: '1SPH', class: 'badge-admin-onesphere' }
    };
    const cat = categories[type] || { label: 'ETC', class: 'badge-default' };
    return `<span class="screen-badge ${cat.class}">${cat.label}</span>`;
}

// --- 4. Library & Editor ---
window.renderV4Shapes = function() {
    console.log("[Inspector] Rendering V4 Shapes dynamically...");
    const container = document.getElementById('v4-shapes-container');
    if (!container || !window.V4_COMPONENT_LIBRARY) {
        console.warn("[Inspector] #v4-shapes-container or V4_COMPONENT_LIBRARY not found!");
        return 0;
    }

    const molecules = window.V4_COMPONENT_LIBRARY.molecules || [];
    const shapes = molecules.filter(item => item.category === 'Shapes');

    const query = (window.editorSearchQuery || '').toLowerCase().trim();
    const filteredShapes = query ? shapes.filter(item => item.name.toLowerCase().includes(query)) : shapes;

    container.innerHTML = filteredShapes.map(item => {
        let onclickAttr = '';
        let classList = 'component-item v4-card';
        let dataAttrs = '';
        let titleAttr = item.name;

        // 1) 툴 카드인 경우 (Text 툴)
        if (item.isTool) {
            classList += ' sidebar-tool-btn';
            dataAttrs = `data-tool="${item.toolName}"`;
            titleAttr = `${item.name} 추가`;
            onclickAttr = `onclick="if (typeof window.handleTextboxCreation === 'function') window.handleTextboxCreation();"`;
        } 
        // 2) 클릭 액션이 명시된 경우 (선그리기 등)
        else if (item.onclick) {
            onclickAttr = `onclick="${item.onclick}"`;
            titleAttr = item.name;
        } 
        // 3) 일반 V4 컴포넌트 추가인 경우
        else {
            onclickAttr = `onclick="insertV4ComponentById('${item.id}')"`;
            titleAttr = item.name;
        }

        // 아이콘 HTML 빌드
        let iconHtml = '';
        if (item.iconType === 'svg') {
            iconHtml = item.iconSvg;
        } else if (item.icon) {
            const styleStr = item.iconStyle ? `style="${item.iconStyle} font-size: 18px; color: ${item.iconColor || 'var(--text-secondary)'};"` : `style="font-size: 18px; color: ${item.iconColor || 'var(--text-secondary)'};"`;
            iconHtml = `<span class="material-icons-outlined" ${styleStr}>${item.icon}</span>`;
        } else {
            iconHtml = `<span class="material-icons-outlined" style="font-size: 18px; color: var(--text-secondary);">extension</span>`;
        }

        const cardStyle = item.cardStyle ? item.cardStyle : '';

        return `
            <div class="${classList}" ${onclickAttr} ${dataAttrs} title="${titleAttr}" style="${cardStyle} border-radius: 8px; padding: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; box-sizing: border-box;">
                ${iconHtml}
                <span style="font-size: 10px; font-weight: 600; color: var(--text-secondary);">${item.name}</span>
            </div>
        `;
    }).join('');

    return filteredShapes.length;
};

window.renderAtomicLibrary = function() {
    const query = (window.editorSearchQuery || '').toLowerCase().trim();

    // 1. Shapes 렌더링 및 매치 카운트 획득
    let shapesCount = 0;
    if (typeof window.renderV4Shapes === 'function') {
        shapesCount = window.renderV4Shapes();
    }

    // 2. Custom Components (Molecules) 필터링 및 렌더링
    const customComps = window.state.globalComponents || [];
    const filteredCustomComps = query ? customComps.filter(m => m.name.toLowerCase().includes(query)) : customComps;

    const compHeader = document.getElementById('molecules-header-text');
    if (compHeader) {
        compHeader.innerHTML = `COMPONENTS <b style="color:var(--accent); margin-left: 4px;">(${filteredCustomComps.length})</b>`;
    }

    const molContainer = document.getElementById('custom-molecules-container');
    if (molContainer) {
        molContainer.innerHTML = filteredCustomComps.map(m => `
            <div class="v4-component-item">
                <div class="v4-component-name-wrap" onclick="insertV4ComponentById('${m.id}')">
                    <span class="material-icons-outlined" style="font-size:14px; margin-right:8px; color:var(--accent); flex-shrink:0;">category</span>
                    <span class="v4-component-name" title="${m.name}">${m.name}</span>
                </div>
                <div class="v4-comp-actions">
                    <button class="v4-comp-btn v4-comp-edit-btn" onclick="renameComponent('${m.id}', event)" title="이름 수정"><span class="material-icons-outlined" style="font-size:14px;">edit</span></button>
                    <button class="v4-comp-btn v4-comp-delete-btn" onclick="deleteMolecule('${m.id}', event)" title="삭제"><span class="material-icons-outlined" style="font-size:14px;">close</span></button>
                </div>
            </div>
        `).join('');
    }

    // 3. Static Atomic Library 필터링
    let atomicCount = 0;
    const atomicContainer = document.getElementById('atomic-library-container');
    if (atomicContainer) {
        const cards = atomicContainer.querySelectorAll('.component-item');
        cards.forEach(card => {
            const nameSpan = card.querySelector('span');
            const nameText = nameSpan ? nameSpan.innerText : '';
            const isMatch = nameText.toLowerCase().includes(query);
            card.style.setProperty('display', isMatch ? 'flex' : 'none', 'important');
            if (isMatch) atomicCount++;
        });
    }

    // 4. Section Visibility 조절
    const shapesHeader = document.getElementById('v4-shapes-header');
    const shapesBody = document.getElementById('v4-shapes-body');
    if (shapesHeader && shapesBody) {
        const hasShapes = shapesCount > 0;
        shapesHeader.style.setProperty('display', hasShapes ? 'flex' : 'none', 'important');
        shapesBody.style.setProperty('display', hasShapes ? 'block' : 'none', 'important');
    }

    const atomicHeader = document.getElementById('atomic-library-header');
    const atomicBody = document.getElementById('atomic-library-body');
    if (atomicHeader && atomicBody) {
        const hasAtomic = atomicCount > 0;
        atomicHeader.style.setProperty('display', hasAtomic ? 'flex' : 'none', 'important');
        atomicBody.style.setProperty('display', hasAtomic ? 'block' : 'none', 'important');
    }

    const moleculesHeader = document.getElementById('molecules-header');
    const moleculesBody = document.getElementById('molecules-body');
    if (moleculesHeader && moleculesBody) {
        const hasMolecules = filteredCustomComps.length > 0;
        moleculesHeader.style.setProperty('display', hasMolecules ? 'flex' : 'none', 'important');
        moleculesBody.style.setProperty('display', hasMolecules ? 'block' : 'none', 'important');
    }

    // 5. Empty State 처리
    const totalMatch = shapesCount + atomicCount + filteredCustomComps.length;
    const emptyState = document.getElementById('sidebar-search-empty');
    if (emptyState) {
        emptyState.style.setProperty('display', totalMatch === 0 ? 'flex' : 'none', 'important');
    }

    // Legacy unused code
    if (!window.V4_COMPONENT_LIBRARY) return;
    const lib = window.V4_COMPONENT_LIBRARY;
    const atomsPane = document.getElementById('pane-atoms');
    if (atomsPane) {
        const allComponents = [...(lib.atoms || []), ...(lib.molecules || []), ...(lib.organisms || [])];
        atomsPane.innerHTML = allComponents.map(item => `
            <div class="library-item" onclick="insertV4ComponentById('${item.id}')">
                <div class="item-preview">${item.previewHtml || '<span class="material-icons-outlined">extension</span>'}</div>
                <div class="item-name">${item.name}</div>
            </div>
        `).join('');
    }

    const iconsPane = document.getElementById('pane-icons');
    if (iconsPane) {
        const icons = ['Home', 'Category', 'My', 'Heart', 'Search', 'Cart', 'Brand', 'Back', 'Bell', 'Share', 'Party'];
        iconsPane.innerHTML = icons.map(i => `
            <div class="library-item" onclick="insertAtomicComponent('icon', '${i}')" style="flex: 0 0 calc(25% - 8px); height:60px;">
                <div class="item-preview"><div class="lf-icon lf-icon-${i.toLowerCase()}" style="background-image:none !important; transform: scale(0.6);"></div></div>
                <div class="item-name" style="font-size:9px;">${i}</div>
            </div>
        `).join('');
    }
};

window.initQuillEditor = function() {
    if (window.quillEditor) return;
    const container = document.getElementById('editor-container');
    if (!container) return;

    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '64px'];
    Quill.register(Size, true);
    const Align = Quill.import('attributors/style/align');
    Quill.register(Align, true);

    window.quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: [[{ 'size': Size.whitelist }], ['bold', 'italic', 'underline'], [{ 'color': [] }, { 'background': [] }], ['clean']]
        }
    });

    window.quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1) return;
        const html = window.quillEditor.root.innerHTML;
        if (state.editingType === 'pin') {
            // Update description array (legacy compat)
            const list = state.activeFile?.meta?.description;
            if (list && list[state.editingIndex]) {
                list[state.editingIndex].html = html;
                list[state.editingIndex].text = window.quillEditor.getText().trim();
            }
            // Also sync to iframe DOM directly
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                const compId = state.editingIndex;
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                    id: compId,
                    html: html
                });
            }
            markAsDirty();
        } else if (state.editingType === 'shape') {
            // 초기 로드 중 발사된 text-change는 무시 (루프 방지)
            if (state._isLoadingShapeContent) return;
            // Shape 텍스트 업데이트: 선택된 shape 내부 innerHTML 교체
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_SHAPE_TEXT', { html: html });
                markAsDirty();
            }
        } else {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_STYLE', { selector: '.v4-editable-cell', style: { html: html } });
                markAsDirty();
            }
        }
    });
};

window.handleEditScreen = async function(fileName) {
    const state = window.state || {};
    const DOM = window.DOM || {};
    if (state.isReadOnly) {
        if (typeof window.showAuthModal === 'function') window.showAuthModal();
        return;
    }
    const meta = (state.projectMetadata.screens || {})[fileName] || {};
    
    if (DOM.editScreenFilename) DOM.editScreenFilename.innerText = fileName;
    if (DOM.editScreenTitle) DOM.editScreenTitle.value = meta.title || "";
    if (DOM.editScreenType) DOM.editScreenType.value = meta.type || "default";
    if (DOM.editScreenDefaultTab) DOM.editScreenDefaultTab.value = meta.defaultTab || "editor";
    if (DOM.editScreenDesc) DOM.editScreenDesc.value = meta.screenDesc || meta.description || "";
    if (DOM.editScreenModal) DOM.editScreenModal.classList.add('active');
    
    if (DOM.btnSubmitEdit) {
        DOM.btnSubmitEdit.onclick = async () => {
            const newTitle = DOM.editScreenTitle ? DOM.editScreenTitle.value.trim() : "";
            const newType = DOM.editScreenType ? DOM.editScreenType.value : "default";
            const newDefaultTab = DOM.editScreenDefaultTab ? DOM.editScreenDefaultTab.value : "editor";
            const newDesc = DOM.editScreenDesc ? DOM.editScreenDesc.value.trim() : "";
            
            DOM.btnSubmitEdit.disabled = true;
            DOM.btnSubmitEdit.innerText = "Saving...";
            
            if (!state.projectMetadata.screens) state.projectMetadata.screens = {};
            state.projectMetadata.screens[fileName] = {
                ...state.projectMetadata.screens[fileName],
                title: newTitle,
                type: newType,
                defaultTab: newDefaultTab,
                screenDesc: newDesc,
                updatedAt: new Date().toISOString()
            };
            
            if (typeof window.saveProjectMetadata === 'function') {
                const success = await window.saveProjectMetadata(state.currentProject, state.projectMetadata);
                if (success) {
                    if (DOM.editScreenModal) DOM.editScreenModal.classList.remove('active');
                    location.reload(); 
                } else {
                    alert("Failed to save project metadata. Please check authentication token.");
                    DOM.btnSubmitEdit.disabled = false;
                    DOM.btnSubmitEdit.innerText = "Save Changes";
                }
            } else {
                console.error("[Inspector] saveProjectMetadata is not defined on window.");
                DOM.btnSubmitEdit.disabled = false;
                DOM.btnSubmitEdit.innerText = "Save Changes";
            }
        };
    }
};

// --- 5. Init Events & Listeners ---
if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => window.toggleSidebar('left');
if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => window.toggleSidebar('right');
document.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => window.switchSidebarTab(btn.dataset.tab));
if (DOM.btnAddDescription) {
    DOM.btnAddDescription.onclick = () => {
        if (typeof window.handleTextCreation === 'function') window.handleTextCreation();
    };
}
if (DOM.btnCancelEdit) {
    DOM.btnCancelEdit.onclick = () => {
        if (DOM.editScreenModal) DOM.editScreenModal.classList.remove('active');
    };
}

// Revision History Rendering & Event Binding
window.renderHistoryPopup = function(history) {
    const listContainer = document.getElementById('history-popup-list');
    if (!listContainer) return;
    
    if (!history || history.length === 0) {
        listContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; color: var(--text-secondary);">
                <span class="material-icons-outlined" style="font-size: 32px; margin-bottom: 8px; opacity: 0.3;">history</span>
                <div style="font-size: 12px;">기록된 재개정 이력이 없습니다.</div>
            </div>
        `;
    } else {
        listContainer.innerHTML = history.map(item => `
            <div class="history-item-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 12px; font-size: 12px; display: flex; flex-direction: column; gap: 6px; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px; margin-bottom: 2px;">
                    <span style="font-weight: 700; color: var(--accent-nav); font-size: 11px; background: rgba(34, 211, 238, 0.1); padding: 1px 6px; border-radius: 4px;">v${item.version || '0.1'}</span>
                    <span style="color: var(--text-secondary); font-size: 10px; font-family: monospace;">${item.date}</span>
                </div>
                <div style="color: #fff; font-weight: 500; word-break: break-all; line-height: 1.4;">${item.message || '-'}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; font-size: 10px; color: var(--text-secondary); opacity: 0.85;">
                    ${item.jira ? `<span style="background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 1px 5px; border-radius: 3px; font-weight: 500;">${item.jira}</span>` : ''}
                    ${item.assignee ? `<span>담당: ${item.assignee}</span>` : ''}
                    ${item.developer ? `<span>개발: ${item.developer}</span>` : ''}
                    ${item.file ? `<span>파일: ${item.file.replace('.html', '')}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.offsetHeight; // Reflow
        modal.style.opacity = '1';
        
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                window.closeHistoryPopup();
                window.removeEventListener('keydown', closeOnEsc);
            }
        };
        window.addEventListener('keydown', closeOnEsc);
    }
};

window.closeHistoryPopup = function() {
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
};

const btnShowHistory = document.getElementById('btn-show-history');
if (btnShowHistory) {
    btnShowHistory.onclick = async () => {
        if (typeof window.showLoading === 'function') window.showLoading("Loading history...");
        try {
            const historyList = (typeof window.fetchProjectHistory === 'function')
                ? await window.fetchProjectHistory(state.currentProject)
                : [];
            if (typeof window.hideLoading === 'function') window.hideLoading();
            window.renderHistoryPopup(historyList);
        } catch (e) {
            if (typeof window.hideLoading === 'function') window.hideLoading();
            console.error("Failed to load history:", e);
            if (window.Notification) window.Notification.alert("이력을 불러오는 중 오류가 발생했습니다.", "오류", "error");
        }
    };
}

const btnCloseHistory = document.getElementById('btn-close-history');
if (btnCloseHistory) {
    btnCloseHistory.onclick = () => {
        window.closeHistoryPopup();
    };
}

const historyModal = document.getElementById('history-modal');
if (historyModal) {
    historyModal.onclick = (e) => {
        if (e.target === historyModal) {
            window.closeHistoryPopup();
        }
    };
}


window.showLoading = (text) => { const overlay = get('loading-overlay'); if (overlay) { const txt = overlay.querySelector('.loading-text'); if (txt) txt.innerText = text; overlay.classList.remove('fade-out'); } };
window.hideLoading = () => { const overlay = get('loading-overlay'); if (overlay) overlay.classList.add('fade-out'); setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 600); };
window.showAuthModal = () => { const modal = get('auth-modal'); if (modal) modal.classList.add('active'); };
window.hideAuthModal = () => { const modal = get('auth-modal'); if (modal) modal.classList.remove('active'); };

// --- 6. Search Event Handling ---
window.editorSearchQuery = '';
const searchInput = document.getElementById('sidebar-search-input');
const searchClear = document.getElementById('sidebar-search-clear');
if (searchInput) {
    searchInput.oninput = () => {
        const val = searchInput.value;
        window.editorSearchQuery = val;
        if (searchClear) {
            searchClear.style.setProperty('display', val ? 'block' : 'none', 'important');
        }
        window.renderAtomicLibrary();
    };
}
if (searchClear) {
    searchClear.onclick = () => {
        if (searchInput) {
            searchInput.value = '';
            window.editorSearchQuery = '';
            searchClear.style.setProperty('display', 'none', 'important');
            searchInput.focus();
            window.renderAtomicLibrary();
        }
    };
}

console.log("[VCTRL INSPECTOR] UI Controller fully loaded and cleaned.");
