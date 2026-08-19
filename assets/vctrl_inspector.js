/**
 * vctrl_inspector.js - UI & Inspector Controller
 * Responsibility: DOM management, sidebar tabs, metadata UI, and component properties.
 */

console.log("%c [VCTRL INSPECTOR] Initializing UI Controller... ", "background: #10b981; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 1. Central DOM Registry
window.get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {}, toggle:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };


window.rebindInspectorDOM = function() {
    console.log("[VCTRL INSPECTOR] Rebinding dynamic UI components selectors...");
    const get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {}, toggle:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };
    
    DOM.textPropSection = get('text-editor-section');
    DOM.tablePropSection = get('table-inspector-section');
    DOM.shapePropSection = get('shape-inspector-section');
    DOM.linePropSection = get('line-editor-section');
    DOM.iconPropSection = get('icon-inspector-section');
    DOM.checkboxRadioPropSection = get('checkbox-radio-inspector-section');
    DOM.textboxTextareaPropSection = get('textbox-textarea-inspector-section');
    DOM.searchbarPropSection = get('searchbar-inspector-section');
    DOM.stepperPropSection = get('stepper-inspector-section');
    DOM.selectboxPropSection = get('selectbox-inspector-section');
    DOM.fileuploadPropSection = get('fileupload-inspector-section');
    DOM.alertPropSection = get('alert-inspector-section');
    DOM.buttonPropSection = get('button-inspector-section');
    DOM.datepickerPropSection = get('datepicker-inspector-section');
    DOM.datePickerPropSection = get('datepicker-inspector-section');
    DOM.togglePropSection = get('toggle-inspector-section');
    DOM.accordionPropSection = get('accordion-inspector-section');
    DOM.gridPropSection = get('grid-inspector-section');
    DOM.adminSettingsPropSection = get('admin-settings-inspector-section');

    DOM.textColorPicker = get('text-color-picker');
    DOM.selectionBar = get('selection-actions-bar');
    DOM.selectionCount = get('selection-count');
    DOM.selectionNumber = get('selection-number');
    DOM.selectionLabel = get('selection-label');
    DOM.btnGroup = get('btn-group-action');
    DOM.btnUngroup = get('btn-ungroup-action');
    DOM.btnAddToMolecules = get('btn-add-molecules-action');
};

window.restorePropertiesSections = function() {
    const storage = document.getElementById('inspector-panels-storage');
    if (!storage) return;

    const activeEl = document.activeElement;

    const sections = [
        DOM.shapePropSection, DOM.textPropSection, DOM.tablePropSection,
        DOM.linePropSection, DOM.iconPropSection, DOM.checkboxRadioPropSection,
        DOM.textboxTextareaPropSection, DOM.searchbarPropSection, DOM.stepperPropSection, DOM.selectboxPropSection,
        DOM.fileuploadPropSection, DOM.alertPropSection, DOM.buttonPropSection,
        DOM.datePickerPropSection, DOM.togglePropSection, DOM.accordionPropSection, DOM.gridPropSection,
        DOM.adminSettingsPropSection
    ];

    sections.forEach(sec => {
        if (sec && sec instanceof Node) {
            if (activeEl && sec.contains(activeEl)) {
                return;
            }
            sec.style.display = 'none';
            storage.appendChild(sec);
        }
    });
};

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
    searchbarPropSection: get('searchbar-inspector-section'),
    stepperPropSection: get('stepper-inspector-section'),
    selectboxPropSection: get('selectbox-inspector-section'),
    fileuploadPropSection: get('fileupload-inspector-section'),
    alertPropSection: get('alert-inspector-section'),
    buttonPropSection: get('button-inspector-section'),
    datepickerPropSection: get('datepicker-inspector-section'),
    datePickerPropSection: get('datepicker-inspector-section'),
    togglePropSection: get('toggle-inspector-section'),
    accordionPropSection: get('accordion-inspector-section'),
    gridPropSection: get('grid-inspector-section'),
    adminSettingsPropSection: get('admin-settings-inspector-section'),
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
    btnAlignBottom: get('btn-align-bottom'),
    btnAlignDistributeH: get('btn-align-distribute-h'),
    btnAlignDistributeV: get('btn-align-distribute-v')
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
    const targetPane = document.getElementById(`tab-${tabName}`);
    const sidebarRight = document.getElementById('sidebar-right');
    const isSidebarOpen = sidebarRight && !sidebarRight.classList.contains('collapsed');
    
    // If target tab is already active and sidebar is open, exit early to avoid reflow/focus interruption
    if (targetPane && targetPane.classList.contains('active') && isSidebarOpen) {
        return;
    }

    console.log(`[Inspector] switchSidebarTab START: ${tabName}`);
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
    const activeEl = document.activeElement;
    const isTypingInInspector = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable ||
        activeEl.closest('#floating-inspector-card') !== null ||
        activeEl.closest('#sidebar-right') !== null ||
        activeEl.closest('#tab-editor') !== null ||
        activeEl.closest('#v4-shapes-body') !== null ||
        activeEl.classList.contains('v4-prop-input') ||
        activeEl.classList.contains('admin-col-label-input') ||
        activeEl.classList.contains('grid-col-name-input') ||
        activeEl.classList.contains('accordion-sub-input')
    );
    
    if (isTypingInInspector) {
        return;
    }
    
    window.restorePropertiesSections();
    const pm = state.projectMetadata || {};
    if (!DOM.metadataPanel) return;

// Project Metadata UI Manager Namespace
const ProjectMetadataManager = {
    renderBar(pm) {
        DOM.metadataPanel.innerHTML = `
            <div class="v4-meta-horizontal">
                <input type="hidden" id="viewer-meta-title" value="${pm.title || ''}">
                <div class="v4-meta-item" style="flex: 0 0 80px;">
                    <label>ASSIGNEE</label>
                    <input type="text" id="viewer-meta-assignee" value="${pm.assignee || ''}" placeholder="담당자" autocomplete="off">
                </div>
                <div class="v4-meta-item" style="flex: 0 0 80px;">
                    <label>DEVELOPER</label>
                    <input type="text" id="viewer-meta-developer" value="${pm.developer || ''}" placeholder="개발자" autocomplete="off">
                </div>
                <div class="v4-meta-item" style="flex: 0 0 200px;">
                    <label>PERIOD</label>
                    <input type="text" id="viewer-meta-period" value="${pm.period || ''}" placeholder="사업 기간" autocomplete="off">
                </div>
                <div class="v4-meta-item" style="flex: 0 0 220px; position: relative;">
                    <label>JIRA / LINKS</label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="text" id="viewer-meta-jira" value="${pm.jira || ''}" placeholder="예) LFML-123456" style="flex: 1;" autocomplete="off">
                        <a id="btn-jira-link" href="${(pm.jira && typeof pm.jira === 'string') ? 'https://jira.lfcorp.com/browse/' + pm.jira.trim() : '#'}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="display: ${(pm.jira && typeof pm.jira === 'string' && pm.jira.trim()) ? 'flex' : 'none'}; height: 22px; padding: 0 8px; font-size: 11px;">바로가기</a>
                    </div>
                </div>
            </div>
        `;
        this.bindEvents();
    },
    bindEvents() {
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
    },
    updateFields(pm) {
        const titleIn = document.getElementById('viewer-meta-title'); if (titleIn) titleIn.value = pm.title || '';
        const jiraIn = document.getElementById('viewer-meta-jira'); if (jiraIn) jiraIn.value = pm.jira || '';
    }
};

    // 1. Update Top Metadata Bar
    if (!DOM.metadataPanel.innerHTML.includes('v4-meta-horizontal')) {
        ProjectMetadataManager.renderBar(pm);
    } else {
        ProjectMetadataManager.updateFields(pm);
    }

    // 1-1. Update Sidebar Footer (Last Updated)
    const updatedTxt = document.getElementById('meta-updated-txt');
    if (updatedTxt) {
        updatedTxt.innerText = pm.updated ? `최종 업데이트: ${pm.updated}` : '최종 업데이트: -';
    }

    // 2. Update Sidebar Panels based on selected component
    const hasSelection = (window.state && window.state.selectedIds && window.state.selectedIds.length > 0);
    if (compStyles || hasSelection) {

        const floatingInspector = document.getElementById('floating-inspector-card');
        if (floatingInspector) {
            floatingInspector.style.setProperty('display', 'flex', 'important');
            floatingInspector.style.bottom = '24px';
            floatingInspector.style.top = 'auto';
            if (compStyles && typeof compStyles.x === 'number' && typeof compStyles.w === 'number') {
                const compCenter = compStyles.x + (compStyles.w / 2);
                if (compCenter >= 720) {
                    floatingInspector.style.left = '24px';
                    floatingInspector.style.right = 'auto';
                } else {
                    floatingInspector.style.right = '24px';
                    floatingInspector.style.left = 'auto';
                }
            } else {
                floatingInspector.style.right = '24px';
                floatingInspector.style.left = 'auto';
            }
        }

        // Hide all sections first & return active sections to storage
        window.restorePropertiesSections();
        const activeEl = document.activeElement;
        const isTypingInAdminProps = activeEl && (activeEl.classList.contains('admin-col-label-input') || activeEl.classList.contains('admin-row-height-input') || activeEl.id === 'prop-admin-group-header-title' || activeEl.id === 'prop-admin-label-width-slider' || activeEl.id === 'prop-admin-label-width-number');
        const isTyping = activeEl && (
            activeEl.tagName === 'INPUT' || 
            activeEl.tagName === 'TEXTAREA' || 
            activeEl.isContentEditable || 
            isTypingInAdminProps ||
            activeEl.classList.contains('grid-col-width-input') ||
            activeEl.classList.contains('grid-col-name-input')
        );

        const arrowGroupInit = document.getElementById('shape-arrow-direction-group');
        if (arrowGroupInit) arrowGroupInit.style.display = 'none';
        if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
        if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'none';
        if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
        if (DOM.linePropSection) DOM.linePropSection.style.display = 'none';
        if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'none';
        if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'none';
        if (DOM.textboxTextareaPropSection) DOM.textboxTextareaPropSection.style.display = 'none';
        if (DOM.searchbarPropSection) DOM.searchbarPropSection.style.display = 'none';
        if (DOM.stepperPropSection) DOM.stepperPropSection.style.display = 'none';
        if (DOM.selectboxPropSection) DOM.selectboxPropSection.style.display = 'none';
        if (DOM.fileuploadPropSection) DOM.fileuploadPropSection.style.display = 'none';
        if (DOM.alertPropSection) DOM.alertPropSection.style.display = 'none';
        if (DOM.buttonPropSection) DOM.buttonPropSection.style.display = 'none';
        if (DOM.datePickerPropSection) DOM.datePickerPropSection.style.display = 'none';
        if (DOM.togglePropSection) DOM.togglePropSection.style.display = 'none';
        if (DOM.adminSettingsPropSection && !isTypingInAdminProps) DOM.adminSettingsPropSection.style.display = 'none';

        if (compStyles) {
            state.isEditing = true;
            state.editingIndex = (compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1) ? compStyles.pinIndex : compStyles.id;
            let type = 'comp';
            if (compStyles.isGroup) type = 'group';
            else if (compStyles.isPin && compStyles.pinIndex !== -1) type = 'pin';
            else if (compStyles.isGrid) type = 'grid';
            else if (compStyles.isTable) type = 'table';
            else if (compStyles.isShape || compStyles.isPin) type = 'shape';
            else if (compStyles.isConnector) type = 'line';
            else if (compStyles.isTextbox) type = 'textbox';
            else if (compStyles.isTextarea) type = 'textarea';
            else if (compStyles.isSearchBar) type = 'searchbar';
            else if (compStyles.isStepper) type = 'stepper';
            else if (compStyles.isSelectbox) type = 'selectbox';
            else if (compStyles.isFileUpload) type = 'fileupload';
            else if (compStyles.isAlert) type = 'alert';
            else if (compStyles.isButton) type = 'button';
            else if (compStyles.isDatePicker) type = 'datepicker';
            else if (compStyles.isToggle) type = 'toggle';
            else if (compStyles.isAccordion) type = 'accordion';
            else if (compStyles.isAdminSettings) type = 'admin-settings';
            else if (compStyles.isIcon) type = 'icon';
            state.editingType = type;

            // Show relevant section
            if (state.editingType === 'pin' || state.editingType === 'shape') {
                if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'block';
                // Shape 및 Pin (텍스트 마커) 모두 CONTENT EDITOR 공유 사용 (단, 이미지 도형인 경우 텍스트 편집기 표시 제외)
                if (DOM.textPropSection && !compStyles.isImage) {
                    DOM.textPropSection.style.display = 'block';
                }

                // Pattern Type group vs BG Color/Opacity groups
                const patternGroup = document.getElementById('shape-pattern-type-group');
                const bgColorGroup = document.getElementById('shape-bg-color-group');
                const bgOpacityGroup = document.getElementById('shape-bg-opacity-group');
                const isPattern = (compStyles.shapeType === 'pattern');
                
                if (patternGroup) {
                    patternGroup.style.display = isPattern ? 'block' : 'none';
                    if (isPattern && compStyles.patternType) {
                        if (typeof window._syncPatternVisualBtns === 'function') {
                            window._syncPatternVisualBtns(compStyles.patternType);
                        }
                    }
                }
                if (bgColorGroup) {
                    bgColorGroup.style.display = isPattern ? 'none' : 'grid';
                }
                if (bgOpacityGroup) {
                    bgOpacityGroup.style.display = isPattern ? 'none' : 'block';
                }

                // Show/hide Arrow/Triangle direction config group & Corner style group (Rect only)
                const arrowGroup = document.getElementById('shape-arrow-direction-group');
                const cornerGroup = document.getElementById('shape-corner-style-group');
                const isRect = (compStyles.shapeType === 'rect' || compStyles.id === 'v4-shape-rect');
                const isArrow = (compStyles.shapeType === 'arrow' || compStyles.id === 'v4-shape-arrow');
                const isTriangle = (compStyles.shapeType === 'triangle' || compStyles.id === 'v4-shape-triangle');
                const isArrowOrTriangle = isArrow || isTriangle;

                if (cornerGroup) {
                    cornerGroup.style.display = isRect ? 'block' : 'none';
                }
                if (arrowGroup) {
                    if (isArrowOrTriangle) {
                        arrowGroup.style.display = 'block';
                        const currentDir = compStyles.direction || compStyles.arrowDir || 'right';
                        if (typeof window._syncArrowDirBtns === 'function') {
                            window._syncArrowDirBtns(currentDir);
                        }
                    } else {
                        arrowGroup.style.display = 'none';
                    }
                }
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
            } else if (state.editingType === 'searchbar') {
                if (DOM.searchbarPropSection) DOM.searchbarPropSection.style.display = 'block';
                _syncSearchBarProps(compStyles);
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
            } else if (state.editingType === 'accordion') {
                if (DOM.accordionPropSection) DOM.accordionPropSection.style.display = 'block';
                _syncAccordionProps(compStyles);
            } else if (state.editingType === 'grid') {
                if (DOM.gridPropSection) DOM.gridPropSection.style.display = 'block';
                const activeEl = document.activeElement;
                const isTypingInGrid = activeEl && (activeEl.closest('#grid-inspector-section') || activeEl.classList.contains('grid-col-width-input') || activeEl.classList.contains('grid-col-name-input') || activeEl.classList.contains('grid-col-type-select'));
                if (!isTypingInGrid) {
                    _syncGridProps(compStyles);
                }
                if (typeof window.initGridEvents === 'function') {
                    window.initGridEvents();
                }
            } else if (state.editingType === 'admin-settings') {
                if (DOM.adminSettingsPropSection) DOM.adminSettingsPropSection.style.display = 'block';
                // Focus guard: Do not rebuild the inputs if the user is actively typing in one of them
                const activeEl = document.activeElement;
                const isTypingInAdminProps = activeEl && (activeEl.closest('#admin-settings-inspector-section') || activeEl.classList.contains('admin-col-label-input') || activeEl.classList.contains('admin-row-height-input') || activeEl.id === 'prop-admin-group-header-title' || activeEl.id === 'prop-admin-label-width-slider' || activeEl.id === 'prop-admin-label-width-number');
                if (!isTypingInAdminProps) {
                    _syncAdminSettingsProps(compStyles);
                }
            } else if (compStyles && (compStyles.isCheckbox || compStyles.isRadio)) {
                // Focus guard: Do not rebuild checkbox/radio properties if typing in label text input
                const activeEl = document.activeElement;
                const isTypingCheckboxLabel = activeEl && activeEl.id === 'prop-atom-text-content';
                if (!isTypingCheckboxLabel) {
                    if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'block';
                    _syncCheckboxRadioProps(compStyles);
                }
            } else if (state.editingType === 'toggle') {
                if (DOM.togglePropSection) DOM.togglePropSection.style.display = 'block';
                _syncToggleProps(compStyles);
            }

            // Sync Property Controls
            const s = (compStyles && compStyles.currentStyles) || {};
            if (DOM.textColorPicker) DOM.textColorPicker.value = s.text || "#000000";
            if (compStyles.isIcon || s.iconColor) {
                const iconColorInput = document.getElementById('icon-color');
                if (iconColorInput && s.iconColor) {
                    iconColorInput.value = s.iconColor;
                }
            }

            // Sync Shape BG & Border Color Pickers
            if (compStyles.isShape || state.editingType === 'shape') {
                const shapeBgInput = document.getElementById('shape-bg-color');
                const shapeBorderInput = document.getElementById('shape-border-color');
                if (shapeBgInput) {
                    const validBg = (s.bg && s.bg !== 'transparent') ? s.bg : '#ffffff';
                    shapeBgInput.value = validBg;
                    const wrapper = document.getElementById('shape-bg-wrapper');
                    if (wrapper) {
                        if (s.bg === 'transparent' || s.bgOpacity === 0) wrapper.classList.add('transparent-active');
                        else wrapper.classList.remove('transparent-active');
                    }
                }
                if (shapeBorderInput) {
                    const validBorder = (s.border && s.border !== 'transparent') ? s.border : '#c8c8c8';
                    shapeBorderInput.value = validBorder;
                    const wrapper = document.getElementById('shape-border-wrapper');
                    if (wrapper) {
                        if (s.border === 'transparent') wrapper.classList.add('transparent-active');
                        else wrapper.classList.remove('transparent-active');
                    }
                }
            }

            // 1. Sync Shape Opacity
            if (compStyles.isShape || state.editingType === 'shape') {
                const opacityVal = (s.bgOpacity !== undefined) ? s.bgOpacity : 100;
                const slider = document.getElementById('shape-bg-opacity');
                const txt = document.getElementById('txt-shape-bg-opacity');
                if (slider) slider.value = opacityVal;
                if (txt) txt.innerText = opacityVal;
                const wrapper = document.getElementById('shape-bg-wrapper');
                if (wrapper) {
                    if (s.bg === 'transparent' || opacityVal === 0) wrapper.classList.add('transparent-active');
                    else wrapper.classList.remove('transparent-active');
                }
            }

            // 2. Sync Other Inputs (Font Size)
            const fontSizeInput = document.getElementById(compStyles.isTable ? 'table-font-size' : 'shape-font-size');
            if (fontSizeInput && s.fontSize !== undefined) {
                fontSizeInput.value = s.fontSize;
                const txt = document.getElementById('txt-' + fontSizeInput.id);
                if (txt) txt.innerText = s.fontSize;
            }

            // 3. Sync Corner Radius (Rect Shape only)
            const isRectShape = (compStyles.isShape || state.editingType === 'shape') && (compStyles.shapeType === 'rect' || compStyles.id === 'v4-shape-rect' || !compStyles.shapeType);
            if (isRectShape && s.borderRadius !== undefined) {
                const radiusVal = s.borderRadius;
                const slider = document.getElementById('shape-border-radius');
                const txt = document.getElementById('txt-shape-border-radius');
                if (slider) slider.value = radiusVal;
                if (txt) txt.innerText = radiusVal;
                if (typeof window._syncCornerBtns === 'function') {
                    window._syncCornerBtns(radiusVal);
                }
            }

            // 4. Sync Text Align & Vertical Align
            if (s.textAlign !== undefined && typeof window._syncAlignBtns === 'function') {
                window._syncAlignBtns(s.textAlign);
            }
            if (s.justifyContent !== undefined && typeof window._syncVAlignBtns === 'function') {
                window._syncVAlignBtns(s.justifyContent);
            }

            // 5. Sync Textbox / Textarea Properties
            if (compStyles.isTextbox || compStyles.isTextarea) {
                const phInput = document.getElementById('prop-input-placeholder');
                if (phInput && compStyles.placeholderText !== undefined) {
                    phInput.value = compStyles.placeholderText;
                }
            }

            // 6. Sync Search Bar Properties
            if (compStyles.isSearchBar) {
                const phInput = document.getElementById('prop-searchbar-placeholder');
                if (phInput && compStyles.searchbarPlaceholder !== undefined) {
                    phInput.value = compStyles.searchbarPlaceholder;
                }
                const mlInput = document.getElementById('prop-input-maxlength');
                const mlTxt = document.getElementById('txt-input-maxlength');
                if (mlInput && compStyles.maxLength !== undefined) {
                    mlInput.value = compStyles.maxLength;
                    if (mlTxt) mlTxt.innerText = compStyles.maxLength;
                }
                const activeY = document.getElementById('btn-input-counter-y');
                const activeN = document.getElementById('btn-input-counter-n');
                if (activeY && activeN && compStyles.showCounter !== undefined && typeof window.highlightActive === 'function') {
                    window.highlightActive(activeY, compStyles.showCounter === true);
                    window.highlightActive(activeN, compStyles.showCounter === false);
                }
            }

            // 7. Sync Alert Properties
            if (compStyles.isAlert) {
                const activeDescY = document.getElementById('btn-alert-desc-y');
                const activeDescN = document.getElementById('btn-alert-desc-n');
                const descInput = document.getElementById('prop-alert-desc');
                if (activeDescY && activeDescN && compStyles.alertShowDesc !== undefined && typeof window.highlightActive === 'function') {
                    window.highlightActive(activeDescY, compStyles.alertShowDesc === true);
                    window.highlightActive(activeDescN, compStyles.alertShowDesc === false);
                }
                if (descInput && compStyles.alertDesc !== undefined) {
                    descInput.value = compStyles.alertDesc;
                }
                const msgInput = document.getElementById('prop-alert-message');
                if (msgInput && compStyles.alertMessage !== undefined) {
                    msgInput.value = compStyles.alertMessage;
                }
                const count = compStyles.alertBtnCount || 1;
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
                if (btn1 && compStyles.alertBtnText1 !== undefined) btn1.value = compStyles.alertBtnText1;
                const sel1 = document.getElementById('prop-alert-btn-style-1');
                if (sel1 && compStyles.alertBtnStyle1 !== undefined) sel1.value = compStyles.alertBtnStyle1;
                const btn2 = document.getElementById('prop-alert-btn-2');
                if (btn2 && compStyles.alertBtnText2 !== undefined) btn2.value = compStyles.alertBtnText2;
                const sel2 = document.getElementById('prop-alert-btn-style-2');
                if (sel2 && compStyles.alertBtnStyle2 !== undefined) sel2.value = compStyles.alertBtnStyle2;
                const btn2Container = document.getElementById('prop-alert-btn-2-container');
                if (btn2Container) btn2Container.style.display = count >= 2 ? 'flex' : 'none';
                const btn3 = document.getElementById('prop-alert-btn-3');
                if (btn3 && compStyles.alertBtnText3 !== undefined) btn3.value = compStyles.alertBtnText3;
                const sel3 = document.getElementById('prop-alert-btn-style-3');
                if (sel3 && compStyles.alertBtnStyle3 !== undefined) sel3.value = compStyles.alertBtnStyle3;
                const btn3Container = document.getElementById('prop-alert-btn-3-container');
                if (btn3Container) btn3Container.style.display = count >= 3 ? 'flex' : 'none';
            }

            // 8. Sync Button Properties
            if (compStyles.isButton) {
                const txtInput = document.getElementById('prop-button-text');
                if (txtInput && compStyles.buttonText !== undefined) {
                    txtInput.value = compStyles.buttonText;
                }
                const selStyle = document.getElementById('prop-button-style');
                if (selStyle && compStyles.buttonStyle !== undefined) {
                    selStyle.value = compStyles.buttonStyle;
                    const customColorsDiv = document.getElementById('prop-button-custom-colors');
                    if (customColorsDiv) {
                        customColorsDiv.style.display = (compStyles.buttonStyle === 'custom') ? 'block' : 'none';
                    }
                }
                const radiusSlider = document.getElementById('prop-button-border-radius');
                const radiusTxt = document.getElementById('txt-button-border-radius');
                if (radiusSlider && compStyles.buttonRadius !== undefined) {
                    radiusSlider.value = compStyles.buttonRadius;
                    if (radiusTxt) radiusTxt.innerText = compStyles.buttonRadius;
                }
            }
        } else {
            // Case: Multi-selection without compStyles
            state.isEditing = true;
            state.editingType = 'multi';
        }

        // Show/Hide buttons inside selection-actions-bar based on selection count and type
        const btnGroup = document.getElementById('btn-group-action');
        const btnUngroup = document.getElementById('btn-ungroup-action');
        const btnAddToMolecules = document.getElementById('btn-add-molecules-action');
        const alignBar = document.getElementById('selection-align-bar');
        
        const selIds = (window.state && window.state.selectedIds) ? window.state.selectedIds : [];
        const isSingleGroup = selIds.length === 1 && compStyles && compStyles.isGroup;

        if (btnGroup) btnGroup.style.setProperty('display', (selIds.length > 1) ? 'flex' : 'none', 'important');
        if (btnUngroup) btnUngroup.style.setProperty('display', isSingleGroup ? 'flex' : 'none', 'important');
        if (btnAddToMolecules) btnAddToMolecules.style.setProperty('display', isSingleGroup ? 'flex' : 'none', 'important');
        if (alignBar) alignBar.style.setProperty('display', (selIds.length > 1) ? 'block' : 'none', 'important');


        // CONTENT EDITOR 헤더 레이블 동적 변경 (통합 레이블 제공)
        const editorLabel = document.getElementById('content-editor-label');
        if (editorLabel) {
            editorLabel.innerText = 'CONTENT EDITOR';
        }

        // Load content to Quill
        if (compStyles && state.editingType === 'pin' && compStyles.html !== undefined && window.quillEditor) {
            let cleanHtml = compStyles.html || '';
            const hasExplicitFontSize = cleanHtml.includes('font-size') || cleanHtml.includes('fontSize');
            if (!hasExplicitFontSize && compStyles.currentStyles && compStyles.currentStyles.fontSize) {
                const fs = compStyles.currentStyles.fontSize;
                const fsPx = typeof fs === 'number' ? fs + 'px' : (fs.endsWith('px') ? fs : fs + 'px');
                cleanHtml = `<span style="font-size: ${fsPx};">${cleanHtml}</span>`;
            }
            const wasQuillFocused = document.activeElement === window.quillEditor.root;
            setTimeout(() => {
                window.quillEditor.clipboard.dangerouslyPasteHTML(cleanHtml, 'silent');
                if (wasQuillFocused) {
                    window.quillEditor.setSelection(0, 0);
                } else {
                    window.quillEditor.blur();
                    window.quillEditor.setSelection(null);
                    const iframe = document.getElementById('main-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.focus();
                    }
                }
            }, 50);
        } else if (state.editingType === 'shape' && window.quillEditor) {
                // shape 내부 텍스트를 Quill에 로드 (wrapper div 벗겨내기)
                const rawHtml = compStyles.html || '';
                const parser = new DOMParser();
                const parsed = parser.parseFromString(rawHtml, 'text/html');
                const textContent = parsed.querySelector('.v4-shape-text-content') || parsed.querySelector('.v4-shape-text-overlay') || parsed.querySelector('.v4-editable-cell');
                let cleanHtml = textContent ? textContent.innerHTML : rawHtml;

                // 만약 텍스트에 명시적인 font-size 스타일이 없다면, 컴포넌트의 기본 폰트 크기를 적용하여 Quill에 전달
                const hasExplicitFontSize = cleanHtml.includes('font-size') || cleanHtml.includes('fontSize');
                if (!hasExplicitFontSize && compStyles.currentStyles && compStyles.currentStyles.fontSize) {
                    const fs = compStyles.currentStyles.fontSize;
                    const fsPx = typeof fs === 'number' ? fs + 'px' : (fs.endsWith('px') ? fs : fs + 'px');
                    cleanHtml = `<span style="font-size: ${fsPx};">${cleanHtml}</span>`;
                }

                // 초기 로드 중에는 text-change → LF_UPDATE_SHAPE_TEXT 루프를 방지
                state._isLoadingShapeContent = true;
                setTimeout(() => {
                    // Prevent Quill focus hijacking
                    const wasQuillFocused = document.activeElement === window.quillEditor.root;
                    
                    window.quillEditor.clipboard.dangerouslyPasteHTML(cleanHtml, 'silent');
                    
                    if (wasQuillFocused) {
                        window.quillEditor.setSelection(0, 0);
                    } else {
                        // Clear Quill selection/focus and restore focus back to the iframe
                        window.quillEditor.blur();
                        window.quillEditor.setSelection(null);
                        const iframe = document.getElementById('main-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.focus();
                        }
                    }
                    
                    // 다음 틱에 가드 해제 (text-change가 먼저 발사된 후 해제)
                    requestAnimationFrame(() => {
                        state._isLoadingShapeContent = false;
                    });
                }, 50);
            }

        // Dynamically move active panels into floating inspector card body
        const floatingBody = document.getElementById('floating-inspector-body');
        if (floatingBody) {
            const selectionBar = document.getElementById('selection-actions-bar');
            if (selectionBar) {
                if (selectionBar.parentElement !== floatingBody) {
                    floatingBody.insertBefore(selectionBar, floatingBody.firstChild);
                }
                selectionBar.style.setProperty('display', 'flex', 'important');
            }
            const sections = [
                DOM.shapePropSection, DOM.textPropSection, DOM.tablePropSection,
                DOM.linePropSection, DOM.iconPropSection, DOM.checkboxRadioPropSection,
                DOM.textboxTextareaPropSection, DOM.searchbarPropSection, DOM.stepperPropSection, DOM.selectboxPropSection,
                DOM.fileuploadPropSection, DOM.alertPropSection, DOM.buttonPropSection,
                DOM.datePickerPropSection, DOM.togglePropSection, DOM.accordionPropSection, DOM.gridPropSection,
                DOM.adminSettingsPropSection
            ];
            sections.forEach(sec => {
                if (sec && sec.style.display === 'block') {
                    if (sec instanceof Node) {
                        floatingBody.appendChild(sec);
                    } else {
                        console.warn("[VCTRL INSPECTOR] Skipped appendChild: sec is not a valid DOM Node", sec);
                    }
                }
            });
            if (typeof _syncAtomDisabledProps === 'function' && state.selectedComponent) {
                _syncAtomDisabledProps(state.selectedComponent);
            }
        }
    } else {
        window.restorePropertiesSections();
        const floatingInspector = document.getElementById('floating-inspector-card');
        if (floatingInspector) {
            floatingInspector.style.setProperty('display', 'none', 'important');
            floatingInspector.style.right = '24px';
            floatingInspector.style.left = 'auto';
            floatingInspector.style.bottom = '24px';
            floatingInspector.style.top = 'auto';
        }
        state.isEditing = false;
        state.editingIndex = -1;
        if (DOM.selectionBar) DOM.selectionBar.style.display = 'none';
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
        highlightActive(disabledY, comp.disabled === true || comp.disabled === 'true');
        highlightActive(disabledN, comp.disabled === false || comp.disabled === 'false');
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

    _syncAtomDisabledProps(comp);
}

function _syncAtomDisabledProps(comp) {
    if (!comp) return;
    const isDis = (comp.disabled === true || comp.disabled === 'true');
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    document.querySelectorAll('.btn-atom-disabled').forEach(btn => {
        const btnIsDis = btn.dataset.disabled === 'true';
        highlightActive(btn, isDis === btnIsDis);
    });
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
    if (defaultTextInput && document.activeElement !== defaultTextInput && comp.selectboxDefaultText !== undefined) {
        defaultTextInput.value = comp.selectboxDefaultText;
    }

    const options = comp.selectboxOptions || [];
    const countInput = document.getElementById('prop-selectbox-option-count');
    if (countInput) {
        countInput.value = options.length;
    }

    const inputsContainer = document.getElementById('selectbox-options-inputs-container');
    if (inputsContainer) {
        const activeEl = document.activeElement;
        const isTypingSelectboxOption = activeEl && inputsContainer.contains(activeEl);
        if (!isTypingSelectboxOption) {
            inputsContainer.innerHTML = options.map((optText, idx) => {
                return `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 10px; color: #94a3b8; width: 45px; flex-shrink: 0;">Item ${idx + 1}</span>
                    <input type="text" class="selectbox-option-input" data-index="${idx}" value="${optText}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; outline: none; font-family: inherit;">
                </div>`;
            }).join('');
        }
    }
    _syncAtomDisabledProps(comp);
    if (comp.w !== undefined && comp.h !== undefined) {
        const sec = DOM.selectboxPropSection || document.getElementById('selectbox-inspector-section');
        if (sec) {
            const wInp = sec.querySelector('.v4-prop-input[data-prop="width"]');
            const hInp = sec.querySelector('.v4-prop-input[data-prop="height"]');
            if (wInp && document.activeElement !== wInp) wInp.value = Math.round(comp.w);
            if (hInp && document.activeElement !== hInp) hInp.value = Math.round(comp.h);
        }
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
    if (nameInput && document.activeElement !== nameInput && comp.fileName !== undefined) {
        nameInput.value = comp.fileName;
    }

    const placeholderInput = document.getElementById('prop-fileupload-placeholder');
    if (placeholderInput && document.activeElement !== placeholderInput && comp.filePlaceholder !== undefined) {
        placeholderInput.value = comp.filePlaceholder;
    }

    const btnTextInput = document.getElementById('prop-fileupload-btn-text');
    if (btnTextInput && document.activeElement !== btnTextInput && comp.fileButtonText !== undefined) {
        btnTextInput.value = comp.fileButtonText;
    }
    _syncAtomDisabledProps(comp);
}

function _syncAlertProps(comp) {
    const msgText = document.getElementById('prop-alert-message');
    if (msgText && document.activeElement !== msgText && comp.alertMessage !== undefined) {
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
    if (btn1 && document.activeElement !== btn1 && comp.alertBtnText1 !== undefined) btn1.value = comp.alertBtnText1;
    const style1 = comp.alertBtnStyle1 || 'normal';
    const sel1 = document.getElementById('prop-alert-btn-style-1');
    if (sel1) sel1.value = style1;
    
    const btn2 = document.getElementById('prop-alert-btn-2');
    if (btn2 && document.activeElement !== btn2 && comp.alertBtnText2 !== undefined) btn2.value = comp.alertBtnText2;
    const style2 = comp.alertBtnStyle2 || 'normal';
    const sel2 = document.getElementById('prop-alert-btn-style-2');
    if (sel2) sel2.value = style2;
    const btn2Container = document.getElementById('prop-alert-btn-2-container');
    if (btn2Container) btn2Container.style.display = count >= 2 ? 'flex' : 'none';
    
    const btn3 = document.getElementById('prop-alert-btn-3');
    if (btn3 && document.activeElement !== btn3 && comp.alertBtnText3 !== undefined) btn3.value = comp.alertBtnText3;
    const style3 = comp.alertBtnStyle3 || 'normal';
    const sel3 = document.getElementById('prop-alert-btn-style-3');
    if (sel3) sel3.value = style3;
    const btn3Container = document.getElementById('prop-alert-btn-3-container');
    if (btn3Container) btn3Container.style.display = count >= 3 ? 'flex' : 'none';
}

function _syncButtonProps(comp) {
    const txtInput = document.getElementById('prop-button-text');
    if (txtInput && document.activeElement !== txtInput && comp.buttonText !== undefined) {
        txtInput.value = comp.buttonText;
    }
    
    const fontInput = document.getElementById('prop-button-font-size');
    if (fontInput && document.activeElement !== fontInput && comp.buttonFontSize !== undefined) {
        fontInput.value = comp.buttonFontSize;
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
    if (radiusSlider && document.activeElement !== radiusSlider && comp.buttonRadius !== undefined) {
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
    if (phInput && document.activeElement !== phInput && comp.placeholderText !== undefined) {
        phInput.value = comp.placeholderText;
    }
    
    const mlInput = document.getElementById('prop-input-maxlength');
    const mlTxt = document.getElementById('txt-input-maxlength');
    if (mlInput && document.activeElement !== mlInput && comp.maxLength !== undefined) {
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
    if (fsInput && document.activeElement !== fsInput && s.fontSize !== undefined) {
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
    _syncAtomDisabledProps(comp);
}

function _syncSearchBarProps(comp) {
    const phInput = document.getElementById('prop-searchbar-placeholder');
    if (phInput && document.activeElement !== phInput && comp.searchbarPlaceholder !== undefined) {
        phInput.value = comp.searchbarPlaceholder;
    }
    
    const s = comp.currentStyles || {};
    const fsInput = document.getElementById('prop-searchbar-fontsize');
    if (fsInput && document.activeElement !== fsInput && s.fontSize !== undefined) {
        fsInput.value = s.fontSize;
    }
    _syncAtomDisabledProps(comp);
}

function _syncAccordionProps(comp) {
    const headerTextInp = document.getElementById('prop-accordion-header-text');
    const subCountInp = document.getElementById('prop-accordion-sub-count');
    const expandY = document.getElementById('btn-accordion-expand-y');
    const expandN = document.getElementById('btn-accordion-expand-n');
    
    if (headerTextInp && document.activeElement !== headerTextInp && comp.accordionHeaderText !== undefined) {
        headerTextInp.value = comp.accordionHeaderText;
    }
    
    if (subCountInp && document.activeElement !== subCountInp && comp.accordionSubCount !== undefined) {
        subCountInp.value = comp.accordionSubCount;
    }

    const widthInp = document.getElementById('prop-accordion-width');
    if (widthInp && document.activeElement !== widthInp && comp.w !== undefined) {
        widthInp.value = comp.w;
    }

    const heightInp = document.getElementById('prop-accordion-height');
    if (heightInp && document.activeElement !== heightInp && comp.accordionItemHeight !== undefined) {
        heightInp.value = comp.accordionItemHeight;
    }
    
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    if (expandY && expandN) {
        highlightActive(expandY, comp.accordionExpanded === true);
        highlightActive(expandN, comp.accordionExpanded === false);
    }

    // Sync Depth Type Buttons & Section Visibility
    const depthType = comp.accordionDepthType || '1depth';
    const depth1Btn = document.getElementById('btn-accordion-depth-1');
    const depth2Btn = document.getElementById('btn-accordion-depth-2');
    const settings1D = document.getElementById('accordion-1depth-settings');
    const settings2D = document.getElementById('accordion-2depth-settings');

    if (depth1Btn && depth2Btn) {
        highlightActive(depth1Btn, depthType === '1depth');
        highlightActive(depth2Btn, depthType === '2depth');
    }
    if (settings1D) settings1D.style.display = depthType === '1depth' ? 'block' : 'none';
    if (settings2D) settings2D.style.display = depthType === '2depth' ? 'block' : 'none';
    
    if (depthType === '1depth') {
        if (typeof window.syncAccordionSubItemInputs === 'function') {
            window.syncAccordionSubItemInputs(comp.accordionSubTexts || []);
        }
    } else {
        if (typeof window.syncAccordionHierarchyInputs === 'function') {
            let hierarchy = [];
            try {
                if (comp.accordionHierarchy) {
                    hierarchy = typeof comp.accordionHierarchy === 'string' ? JSON.parse(comp.accordionHierarchy) : comp.accordionHierarchy;
                }
            } catch (e) {
                console.error("[Inspector] Failed to parse accordionHierarchy:", e);
            }
            window.syncAccordionHierarchyInputs(hierarchy);
        }
    }
    
    const s = comp.currentStyles || {};
    const syncColor = (id, wrapperId, color, isTransparent) => {
        const picker = document.getElementById(id);
        const wrapper = document.getElementById(wrapperId);
        if (picker && color) picker.value = color;
        if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
    };
    syncColor('accordion-bg-color', 'accordion-bg-wrapper', s.bg, s.isBgTransparent);
    syncColor('accordion-border-color', 'accordion-border-wrapper', s.border, s.isBorderTransparent);
    _syncAtomDisabledProps(comp);
}

function _syncGridProps(comp) {
    const rowCountInp = document.getElementById('prop-grid-row-count');
    const paginationY = document.getElementById('btn-grid-pagination-y');
    const paginationN = document.getElementById('btn-grid-pagination-n');
    
    if (rowCountInp && comp.gridRowCount !== undefined) {
        rowCountInp.value = comp.gridRowCount;
    }
    
    const rowHeightInp = document.getElementById('prop-grid-row-height');
    if (rowHeightInp && comp.gridRowHeight !== undefined) {
        rowHeightInp.value = comp.gridRowHeight;
    }
    
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    if (paginationY && paginationN) {
        highlightActive(paginationY, comp.gridShowPagination === true);
        highlightActive(paginationN, comp.gridShowPagination === false);
    }
    
    if (typeof window.syncGridHeaderInputs === 'function') {
        window.syncGridHeaderInputs(comp.gridColumns || [], comp.gridHeaders || []);
    }
    
    const s = comp.currentStyles || {};
    const syncColor = (id, wrapperId, color, isTransparent) => {
        const picker = document.getElementById(id);
        const wrapper = document.getElementById(wrapperId);
        if (picker && color) picker.value = color;
        if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
    };
    syncColor('grid-bg-color', 'grid-bg-wrapper', s.bg, s.isBgTransparent);
    syncColor('grid-border-color', 'grid-border-wrapper', s.border, s.isBorderTransparent);
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

    const textInp = document.getElementById('prop-atom-text-content');
    if (textInp && comp.checkboxText !== undefined) {
        if (document.activeElement !== textInp) {
            textInp.value = comp.checkboxText;
        }
    }

    const wIconInp = document.getElementById('prop-width-icon');
    const hIconInp = document.getElementById('prop-height-icon');
    if (wIconInp && document.activeElement !== wIconInp) {
        wIconInp.value = Math.round(comp.boxW !== undefined ? comp.boxW : 20);
    }
    if (hIconInp && document.activeElement !== hIconInp) {
        hIconInp.value = Math.round(comp.boxH !== undefined ? comp.boxH : 20);
    }
    _syncAtomDisabledProps(comp);
}

function _syncDatePickerProps(comp) {
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    // Sync Mode selector
    const btnModeSimple = document.getElementById('btn-dp-mode-simple');
    const btnModeDetailed = document.getElementById('btn-dp-mode-detailed');
    const mode = comp.dpMode || 'simple';
    highlightActive(btnModeSimple, mode === 'simple');
    highlightActive(btnModeDetailed, mode === 'detailed');

    const timeWrapper = document.getElementById('dp-time-inputs-wrapper');
    const presetsToggleWrapper = document.getElementById('dp-presets-toggle-wrapper');
    const showEndToggleWrapper = document.getElementById('dp-show-end-toggle-wrapper');
    const defaultPresetWrapper = document.getElementById('dp-default-preset-wrapper');

    if (timeWrapper) timeWrapper.style.display = mode === 'detailed' ? 'block' : 'none';
    if (presetsToggleWrapper) presetsToggleWrapper.style.display = mode === 'detailed' ? 'none' : 'block';
    if (showEndToggleWrapper) showEndToggleWrapper.style.display = mode === 'detailed' ? 'none' : 'block';
    if (defaultPresetWrapper) defaultPresetWrapper.style.display = mode === 'detailed' ? 'none' : 'block';

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
    if (startInput && comp.dpStartDate !== undefined) {
        if (document.activeElement !== startInput) startInput.value = comp.dpStartDate;
    }
    if (endInput && comp.dpEndDate !== undefined) {
        if (document.activeElement !== endInput) endInput.value = comp.dpEndDate;
    }

    // Sync time inputs
    const startTimeInput = document.getElementById('prop-dp-start-time');
    const endTimeInput = document.getElementById('prop-dp-end-time');
    if (startTimeInput && comp.dpStartTime !== undefined) {
        if (document.activeElement !== startTimeInput) startTimeInput.value = comp.dpStartTime || '';
    }
    if (endTimeInput && comp.dpEndTime !== undefined) {
        if (document.activeElement !== endTimeInput) endTimeInput.value = comp.dpEndTime || '';
    }
    _syncAtomDisabledProps(comp);
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
    const filteredShapes = query ? shapes.filter(item => {
        const enMatch = item.name.toLowerCase().includes(query);
        const koMatch = item.koName ? item.koName.toLowerCase().includes(query) : false;
        return enMatch || koMatch;
    }) : shapes;

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

    // 3. Static Atomic Library & Icon Library 필터링
    let atomicCount = 0;
    const atomicContainer = document.getElementById('atomic-library-container');
    if (atomicContainer) {
        const cards = atomicContainer.querySelectorAll('.component-item');
        cards.forEach(card => {
            const nameSpan = card.querySelector('span');
            const nameText = nameSpan ? nameSpan.innerText : '';
            const koText = card.getAttribute('data-ko') || '';
            const isMatch = nameText.toLowerCase().includes(query) || koText.toLowerCase().includes(query);
            card.style.setProperty('display', isMatch ? 'flex' : 'none', 'important');
            if (isMatch) atomicCount++;
        });
    }

    let iconCount = 0;
    const iconContainer = document.getElementById('icon-library-container');
    if (iconContainer) {
        const cards = iconContainer.querySelectorAll('.component-item');
        cards.forEach(card => {
            const nameSpan = card.querySelector('span');
            const nameText = nameSpan ? nameSpan.innerText : '';
            const koText = card.getAttribute('data-ko') || '';
            const isMatch = nameText.toLowerCase().includes(query) || koText.toLowerCase().includes(query);
            card.style.setProperty('display', isMatch ? 'flex' : 'none', 'important');
            if (isMatch) iconCount++;
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

    const iconHeader = document.getElementById('icon-library-header');
    const iconBody = document.getElementById('icon-library-body');
    if (iconHeader && iconBody) {
        const hasIcon = iconCount > 0;
        iconHeader.style.setProperty('display', hasIcon ? 'flex' : 'none', 'important');
        iconBody.style.setProperty('display', hasIcon ? 'block' : 'none', 'important');
    }

    const moleculesHeader = document.getElementById('molecules-header');
    const moleculesBody = document.getElementById('molecules-body');
    if (moleculesHeader && moleculesBody) {
        const hasMolecules = filteredCustomComps.length > 0;
        moleculesHeader.style.setProperty('display', hasMolecules ? 'flex' : 'none', 'important');
        moleculesBody.style.setProperty('display', hasMolecules ? 'block' : 'none', 'important');
    }

    // 5. Empty State 처리
    const totalMatch = shapesCount + atomicCount + iconCount + filteredCustomComps.length;
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
        const icons = ['Home', 'Category', 'My', 'Heart', 'Search', 'Cart', 'Brand', 'Back', 'Bell', 'Share', 'Party', 'New Window', 'Download'];
        iconsPane.innerHTML = icons.map(i => `
            <div class="library-item" onclick="insertAtomicComponent('icon', '${i}')" style="flex: 0 0 calc(25% - 8px); height:60px;">
                <div class="item-preview"><div class="lf-icon lf-icon-${i.toLowerCase().replace(' ', '-')}" style="background-image:none !important; transform: scale(0.6);"></div></div>
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
    Size.whitelist = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '64px'];
    Quill.register(Size, true);
    const Align = Quill.import('attributors/style/align');
    Quill.register(Align, true);

    // Register distinct intuitive icons for Text Color (Letter A) and Background Color (Paint Bucket / Fill)
    const icons = Quill.import('ui/icons');
    if (icons) {
        // Text Color icon: 'A' letter with color underline bar
        icons['color'] = `<svg viewBox="0 0 18 18">
            <path class="ql-stroke" d="M5,12.5 L9,3.5 L13,12.5"></path>
            <path class="ql-stroke" d="M6.5,9 L11.5,9"></path>
            <line class="ql-stroke ql-color-label" x1="2.5" y1="15.5" x2="15.5" y2="15.5" stroke-width="2.5"></line>
        </svg>`;
        
        // Background Color icon: Paint Bucket / Fill Bucket with color bar
        icons['background'] = `<svg viewBox="0 0 18 18">
            <path class="ql-stroke" d="M12.5,3 L15,5.5 L7.5,13 L4,13 L4,9.5 L11.5,2 L12.5,3 Z"></path>
            <path class="ql-fill" d="M4,9.5 L7.5,13 L4,13 Z"></path>
            <line class="ql-stroke ql-bg-label" x1="2.5" y1="15.5" x2="15.5" y2="15.5" stroke-width="2.5"></line>
        </svg>`;
    }

    window.quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: [[{ 'size': Size.whitelist }], ['bold', 'italic', 'underline'], [{ 'color': [] }, { 'background': [] }], ['clean']]
        }
    });

    // Add tooltips to Quill toolbar controls for explicit Korean label guidance
    setTimeout(() => {
        const toolbarEl = container.previousElementSibling || document.querySelector('.ql-toolbar');
        if (toolbarEl) {
            const btnSize = toolbarEl.querySelector('.ql-size .ql-picker-label');
            if (btnSize) btnSize.setAttribute('title', '글자 크기 (Font Size)');

            const btnColor = toolbarEl.querySelector('.ql-color .ql-picker-label');
            if (btnColor) btnColor.setAttribute('title', '글자 색상 (Text Color)');

            const btnBg = toolbarEl.querySelector('.ql-background .ql-picker-label');
            if (btnBg) btnBg.setAttribute('title', '배경 색상 / 형광펜 (Background Color)');

            const btnBold = toolbarEl.querySelector('.ql-bold');
            if (btnBold) btnBold.setAttribute('title', '굵게 (Bold)');

            const btnItalic = toolbarEl.querySelector('.ql-italic');
            if (btnItalic) btnItalic.setAttribute('title', '기울임 (Italic)');

            const btnUnderline = toolbarEl.querySelector('.ql-underline');
            if (btnUnderline) btnUnderline.setAttribute('title', '밑줄 (Underline)');

            const btnClean = toolbarEl.querySelector('.ql-clean');
            if (btnClean) btnClean.setAttribute('title', '서식 지우기 (Clear Formatting)');
        }
    }, 0);

    window.quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1 || state._isLoadingShapeContent) return;
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
            // Shape 텍스트 업데이트: 선택된 shape 내부 innerHTML 교체
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_SHAPE_TEXT', { html: html });
                markAsDirty();
            }
        } else {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                    id: state.editingIndex,
                    html: html
                });
                markAsDirty();
            }
        }
    });
};

// Subscribe to direct iframe text changes to sync Quill editor in real-time
if (window.MessageHub) {
    MessageHub.subscribe('LF_PIN_TEXT_CHANGED', (data) => {
        if (!window.quillEditor || !data) return;
        
        const isMatch = (state.editingIndex === data.id) ||
                        (state.editingIndex === data.compId) ||
                        (state.selectedIds && (state.selectedIds.includes(data.id) || state.selectedIds.includes(data.compId)));

        if (isMatch) {
            // Prevent feedback loop: tell the Quill change listener that we are programmatically updating the text
            state._isLoadingShapeContent = true;
            
            const rawHtml = data.html || '';
            let cleanHtml = rawHtml;
            if (data.isShape) {
                const parser = new DOMParser();
                const parsed = parser.parseFromString(rawHtml, 'text/html');
                const textContent = parsed.querySelector('.v4-shape-text-content') || parsed.querySelector('.v4-shape-text-overlay') || parsed.querySelector('.v4-editable-cell');
                cleanHtml = textContent ? textContent.innerHTML : rawHtml;
            }
            
            // Sync to description list metadata if it's a description pin
            if (state.editingType === 'pin' && typeof state.editingIndex === 'number') {
                const list = state.activeFile?.meta?.description;
                if (list && list[state.editingIndex]) {
                    list[state.editingIndex].html = cleanHtml;
                    const tmp = document.createElement('div');
                    tmp.innerHTML = cleanHtml;
                    list[state.editingIndex].text = tmp.innerText.trim();
                }
            }

            const wasQuillFocused = document.activeElement === window.quillEditor.root;
            
            window.quillEditor.clipboard.dangerouslyPasteHTML(cleanHtml, 'silent');
            
            if (wasQuillFocused) {
                window.quillEditor.setSelection(0, 0);
            }
            
            setTimeout(() => {
                state._isLoadingShapeContent = false;
            }, 100);
        }
    });
}

window.handleEditScreen = async function(fileName) {
    const state = window.state || {};
    if (state.isReadOnly) {
        if (typeof window.showAuthModal === 'function') window.showAuthModal();
        return;
    }

    // Live DOM Lookup to guarantee references even if UI block was injected asynchronously
    const editModal = document.getElementById('edit-screen-modal');
    const editFilename = document.getElementById('edit-screen-filename');
    const editTitle = document.getElementById('edit-screen-title');
    const editType = document.getElementById('edit-screen-type');
    const editDefaultTab = document.getElementById('edit-screen-default-tab');
    const editDesc = document.getElementById('edit-screen-desc');
    const btnSubmit = document.getElementById('btn-edit-screen-submit');
    const btnCancel = document.getElementById('btn-edit-screen-cancel');

    // Update window.DOM cache references if window.DOM exists
    if (window.DOM) {
        if (editModal) window.DOM.editScreenModal = editModal;
        if (editFilename) window.DOM.editScreenFilename = editFilename;
        if (editTitle) window.DOM.editScreenTitle = editTitle;
        if (editType) window.DOM.editScreenType = editType;
        if (editDefaultTab) window.DOM.editScreenDefaultTab = editDefaultTab;
        if (editDesc) window.DOM.editScreenDesc = editDesc;
        if (btnSubmit) window.DOM.btnSubmitEdit = btnSubmit;
        if (btnCancel) window.DOM.btnCancelEdit = btnCancel;
    }

    const meta = (state.projectMetadata.screens || {})[fileName] || {};
    
    if (editFilename) editFilename.innerText = fileName;
    if (editTitle) editTitle.value = meta.title || "";
    if (editType) editType.value = meta.type || "default";
    if (editDefaultTab) editDefaultTab.value = meta.defaultTab || "editor";
    if (editDesc) editDesc.value = meta.screenDesc || meta.description || "";
    if (editModal) editModal.classList.add('active');

    if (btnCancel) {
        btnCancel.onclick = () => {
            if (editModal) editModal.classList.remove('active');
        };
    }
    
    if (btnSubmit) {
        btnSubmit.onclick = async () => {
            const newTitle = editTitle ? editTitle.value.trim() : "";
            const newType = editType ? editType.value : "default";
            const newDefaultTab = editDefaultTab ? editDefaultTab.value : "editor";
            const newDesc = editDesc ? editDesc.value.trim() : "";
            
            btnSubmit.disabled = true;
            btnSubmit.innerText = "Saving...";
            
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
                    if (editModal) editModal.classList.remove('active');
                    location.reload(); 
                } else {
                    alert("Failed to save project metadata. Please check authentication token.");
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = "Save Changes";
                }
            } else {
                console.error("[Inspector] saveProjectMetadata is not defined on window.");
                btnSubmit.disabled = false;
                btnSubmit.innerText = "Save Changes";
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
        const modal = document.getElementById('edit-screen-modal') || DOM.editScreenModal;
        if (modal) modal.classList.remove('active');
    };
}

// Floating Inspector Card Minimize/Maximize Toggle
const btnFloatingMinimize = document.getElementById('btn-floating-minimize');
const floatingInspectorCard = document.getElementById('floating-inspector-card');
if (btnFloatingMinimize && floatingInspectorCard) {
    btnFloatingMinimize.onclick = (e) => {
        e.stopPropagation();
        const isMin = floatingInspectorCard.classList.toggle('minimized');
        const icon = btnFloatingMinimize.querySelector('.material-icons-outlined');
        if (icon) {
            icon.innerText = isMin ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
        }
        btnFloatingMinimize.title = isMin ? '펼치기' : '최소화';
    };
}

// Revision History Rendering & Event Binding
window.renderHistoryPopup = function(history) {
    const listContainer = document.getElementById('history-popup-list');
    if (!listContainer) return;
    
    if (!history || history.length === 0) {
        listContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px; text-align: center; color: var(--text-secondary);">
                <span class="material-icons-outlined" style="font-size: 36px; margin-bottom: 10px; opacity: 0.3;">history</span>
                <div style="font-size: 14px;">기록된 재개정 이력이 없습니다.</div>
            </div>
        `;
    } else {
        listContainer.innerHTML = history.map(item => `
            <div class="history-item-card" style="background: rgba(255, 255, 255, 0.04); border: 1.6px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; font-size: 13px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px; margin-bottom: 2px;">
                    <span style="font-weight: 700; color: #22d3ee; font-size: 12px; background: rgba(34, 211, 238, 0.15); padding: 2px 8px; border-radius: 6px; letter-spacing: 0.3px;">v${item.version || '0.1'}</span>
                    <span style="color: #94a3b8; font-size: 12px; font-family: monospace;">${item.date}</span>
                </div>
                <div style="color: #f8fafc; font-size: 15px; font-weight: 600; word-break: break-all; line-height: 1.5; margin: 2px 0;">${item.message || '-'}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; font-size: 13px; color: #94a3b8; align-items: center;">
                    ${item.jira ? `<span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${item.jira}</span>` : ''}
                    ${item.assignee ? `<span style="font-weight: 500;">담당: ${item.assignee}</span>` : ''}
                    ${item.developer ? `<span style="font-weight: 500;">개발: ${item.developer}</span>` : ''}
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

async function ensureHistoryModal() {
    let historyModal = document.getElementById('history-modal');
    if (!historyModal) {
        try {
            let html = '';
            try {
                const response = await fetch('assets/templates/history_modal.html');
                if (response.ok) {
                    html = await response.text();
                }
            } catch (fetchErr) {
                console.warn("fetch history_modal.html failed, using inline template fallback:", fetchErr);
            }

            if (!html) {
                html = `
                <div id="history-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 17, 21, 0.7); backdrop-filter: blur(8px); z-index: 10005; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
                    <div class="dialog-card" style="max-width: 560px; width: 92%; max-height: 80vh; display: flex; flex-direction: column; background: rgba(30, 41, 59, 0.95); border: 1.6px solid rgba(255, 255, 255, 0.12); border-radius: 16px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); padding: 24px; box-sizing: border-box; backdrop-filter: blur(20px);">
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 18px; flex-shrink: 0;">
                            <div style="display: flex; align-items: center; gap: 10px; color: var(--accent-nav, #22d3ee);">
                                <span class="material-icons-outlined" style="font-size: 22px;">history</span>
                                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.2px;">프로젝트 재개정 이력</h3>
                            </div>
                            <button id="btn-close-history" class="btn-secondary" style="width: 32px; height: 32px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); cursor: pointer; color: #cbd5e1; transition: all 0.2s; margin-left: auto;"><span class="material-icons-outlined" style="font-size: 18px;">close</span></button>
                        </div>
                        <div id="history-popup-list" style="flex: 1; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 12px; min-height: 140px;">
                            <!-- Dynamic history entries here -->
                        </div>
                    </div>
                </div>`;
            }
            document.body.insertAdjacentHTML('beforeend', html);
            historyModal = document.getElementById('history-modal');
        } catch (e) {
            console.error("Failed to load history modal dynamically:", e);
            return false;
        }
    }

    if (historyModal) {
        const btnCloseHistory = document.getElementById('btn-close-history');
        if (btnCloseHistory) {
            btnCloseHistory.onclick = () => {
                window.closeHistoryPopup();
            };
        }
        historyModal.onclick = (e) => {
            if (e.target === historyModal) {
                window.closeHistoryPopup();
            }
        };
        return true;
    }
    return false;
}

const btnShowHistory = document.getElementById('btn-show-history');
if (btnShowHistory) {
    btnShowHistory.onclick = async () => {
        if (typeof window.showLoading === 'function') window.showLoading("Loading history...");
        try {
            const loaded = await ensureHistoryModal();
            if (!loaded) throw new Error("Failed to initialize history modal");

            const currentProj = (typeof state !== 'undefined' && state && state.currentProject) ? state.currentProject : null;
            const historyList = (typeof window.fetchProjectHistory === 'function' && currentProj)
                ? await window.fetchProjectHistory(currentProj)
                : [];
            if (typeof window.hideLoading === 'function') window.hideLoading();
            window.renderHistoryPopup(historyList);
        } catch (e) {
            if (typeof window.hideLoading === 'function') window.hideLoading();
            console.error("Failed to load history:", e);
            if (window.Notification && typeof window.Notification.alert === 'function') {
                window.Notification.alert("이력을 불러오는 중 오류가 발생했습니다.", "오류", "error");
            } else if (typeof window.showToast === 'function') {
                window.showToast("이력을 불러오는 중 오류가 발생했습니다.", "error");
            } else {
                alert("이력을 불러오는 중 오류가 발생했습니다.");
            }
        }
    };
}


// Global function to sync Arrow/Triangle Direction Buttons UI
window._syncArrowDirBtns = (currentDir) => {
    const targetDir = currentDir || 'right';
    document.querySelectorAll('.v4-arrow-dir-btn').forEach(b => {
        const btnDir = b.dataset.dir;
        if (btnDir === targetDir) {
            b.classList.add('active');
            b.style.cssText = 'height: 28px; background: rgba(0,229,255,0.15); border: 1.6px solid rgba(0,229,255,0.4); border-radius: 6px; color: #00e5ff; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
        } else {
            b.classList.remove('active');
            b.style.cssText = 'height: 28px; background: rgba(255, 255, 255, 0.05); border: 1.6px solid rgba(255, 255, 255, 0.15); border-radius: 6px; color: #94a3b8; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
        }
    });
};


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
if (window.MessageHub) {
    MessageHub.subscribe('LF_DESELECT', () => {
        if (window.state) {
            window.state.selectedIds = [];
        }
        window.updateProperties(null);
    });
}

function _syncAdminSettingsProps(comp) {
    const rowCountText = document.getElementById('txt-admin-row-count');
    if (rowCountText && comp.adminRowCount !== undefined) {
        rowCountText.innerText = comp.adminRowCount;
    }

    const labelWidthSlider = document.getElementById('prop-admin-label-width-slider');
    const labelWidthNum = document.getElementById('prop-admin-label-width-number');
    if (labelWidthSlider && labelWidthNum) {
        if (comp.adminLabelWidth !== undefined) {
            labelWidthSlider.value = comp.adminLabelWidth;
            labelWidthNum.value = comp.adminLabelWidth;
        }
        
        const updateWidth = (val) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                    labelWidth: val
                });
            }
        };

        labelWidthSlider.oninput = (e) => {
            const val = parseInt(e.target.value) || 140;
            labelWidthNum.value = val;
            updateWidth(val);
        };

        labelWidthNum.oninput = (e) => {
            let val = parseInt(e.target.value) || 140;
            // Allow loose typing but constrain values on final update
            if (val >= 60 && val <= 300) {
                labelWidthSlider.value = val;
                updateWidth(val);
            }
        };
        
        labelWidthNum.onblur = (e) => {
            let val = parseInt(e.target.value) || 140;
            if (val < 60) val = 60;
            if (val > 300) val = 300;
            labelWidthNum.value = val;
            labelWidthSlider.value = val;
            updateWidth(val);
        };
    }

    // Sync Group Header Inputs
    const enableChk = document.getElementById('prop-admin-group-header-enable');
    const titleInp = document.getElementById('prop-admin-group-header-title');
    const bgInp = document.getElementById('prop-admin-group-header-bg');
    const colorInp = document.getElementById('prop-admin-group-header-color');
    const configSub = document.getElementById('admin-group-header-config-sub');
    const bgWrapper = document.getElementById('admin-group-header-bg-wrapper');

    if (enableChk) {
        enableChk.checked = comp.adminShowGroupHeader === true;
        if (configSub) configSub.style.display = enableChk.checked ? 'flex' : 'none';
    }
    if (titleInp && comp.adminGroupHeaderTitle !== undefined) {
        titleInp.value = comp.adminGroupHeaderTitle;
    }
    if (bgInp && comp.adminGroupHeaderBg !== undefined) {
        const isTransparent = comp.adminGroupHeaderBg === 'transparent';
        if (bgWrapper) bgWrapper.classList.toggle('transparent-active', isTransparent);
        if (!isTransparent) bgInp.value = comp.adminGroupHeaderBg;
    }
    if (colorInp && comp.adminGroupHeaderColor !== undefined) {
        colorInp.value = comp.adminGroupHeaderColor;
    }

    const container = document.getElementById('admin-rows-configuration-container');
    if (!container) return;
    const activeEl = document.activeElement;
    const isTypingInAdminContainer = activeEl && (container.contains(activeEl) || activeEl.closest('#admin-settings-inspector-section'));
    if (isTypingInAdminContainer) return;
    container.innerHTML = '';

    const rowCount = comp.adminRowCount || 1;

    const getCurrentRowsData = () => {
        const activeId = window.state?.editingIndex;
        const iframe = document.getElementById('main-iframe');
        let containerEl = null;
        if (iframe && iframe.contentWindow && activeId) {
            const activeEl = iframe.contentWindow.document.getElementById(activeId);
            if (activeEl) {
                containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
            }
        }
        const currentRows = [];
        const blocks = container.querySelectorAll('.admin-row-config-block');
        for (let r = 1; r <= rowCount; r++) {
            const rowBlock = blocks[r - 1];
            let lbl = comp[`adminRow${r}Label`] || '';
            let cCount = comp[`adminRow${r}Cols`] || 1;
            let rType = comp[`adminRow${r}Type`] || 'textbox';
            let rH = comp[`adminRow${r}Height`] || 50;

            if (containerEl) {
                lbl = containerEl.getAttribute(`data-row${r}-label`) || lbl;
                cCount = parseInt(containerEl.getAttribute(`data-row${r}-cols`)) || cCount;
                rType = containerEl.getAttribute(`data-row${r}-type`) || rType;
                rH = parseInt(containerEl.getAttribute(`data-row${r}-height`)) || rH;
            }

            if (rowBlock) {
                const labelInputs = rowBlock.querySelectorAll('.admin-col-label-input');
                if (labelInputs.length > 0) {
                    lbl = Array.from(labelInputs).map(inp => inp.value.trim()).join(', ');
                }
                const colsSel = rowBlock.querySelector('.admin-row-cols');
                if (colsSel) cCount = parseInt(colsSel.value) || 1;
                const hInp = rowBlock.querySelector('.admin-row-height-input');
                if (hInp) rH = parseInt(hInp.value) || 50;
            }

            currentRows.push({
                label: lbl || `조회 항목 ${r}`,
                cols: cCount,
                type: rType,
                height: rH
            });
        }
        return currentRows;
    };

    const applyUpdatedRows = (rowsArray) => {
        const iframe = document.getElementById('main-iframe');
        const activeId = window.state?.editingIndex;
        if (!iframe || !iframe.contentWindow || !window.MessageHub) return;

        const newRowCount = rowsArray.length;

        // 1. Update iframe container attributes directly
        if (activeId) {
            const activeEl = iframe.contentWindow.document.getElementById(activeId);
            if (activeEl) {
                const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                containerEl.setAttribute('data-row-count', newRowCount);
                for (let r = 1; r <= 10; r++) {
                    if (r <= newRowCount) {
                        const rowData = rowsArray[r - 1];
                        containerEl.setAttribute(`data-row${r}-label`, rowData.label);
                        containerEl.setAttribute(`data-row${r}-cols`, rowData.cols);
                        containerEl.setAttribute(`data-row${r}-type`, rowData.type || 'textbox');
                        containerEl.setAttribute(`data-row${r}-height`, rowData.height || 50);
                    } else {
                        containerEl.removeAttribute(`data-row${r}-label`);
                        containerEl.removeAttribute(`data-row${r}-cols`);
                        containerEl.removeAttribute(`data-row${r}-type`);
                        containerEl.removeAttribute(`data-row${r}-height`);
                    }
                }
            }
        }

        // 2. Notify iframe via MessageHub
        window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
            rowCount: newRowCount,
            rows: rowsArray
        });

        // 3. Prepare syncData for inspector refresh
        const syncData = {
            id: activeId,
            editingType: 'admin-settings',
            adminRowCount: newRowCount,
            adminLabelWidth: comp.adminLabelWidth,
            adminShowGroupHeader: comp.adminShowGroupHeader,
            adminGroupHeaderTitle: comp.adminGroupHeaderTitle,
            adminGroupHeaderBg: comp.adminGroupHeaderBg,
            adminGroupHeaderColor: comp.adminGroupHeaderColor
        };
        for (let r = 1; r <= 10; r++) {
            if (r <= newRowCount) {
                syncData[`adminRow${r}Label`] = rowsArray[r - 1].label;
                syncData[`adminRow${r}Cols`] = rowsArray[r - 1].cols;
                syncData[`adminRow${r}Type`] = rowsArray[r - 1].type || 'textbox';
                syncData[`adminRow${r}Height`] = rowsArray[r - 1].height || 50;
            }
        }

        // 4. Re-sync inspector UI
        _syncAdminSettingsProps(syncData);
    };

    for (let i = 1; i <= rowCount; i++) {
        const labelsVal = comp[`adminRow${i}Label`] || '';
        const colsVal = comp[`adminRow${i}Cols`] || 1;
        const specificHeightVal = comp[`adminRow${i}Height`] || 50;

        // Split current labels
        const labelsArr = labelsVal.split(',').map(l => l.trim());

        const rowDiv = document.createElement('div');
        rowDiv.className = 'admin-row-config-block';
        rowDiv.style.cssText = 'border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 8px;';
        
        // Start building HTML
        let htmlContent = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 10px; font-weight: bold; color: #00e5ff;">ROW ${i} CONFIG</div>
                <div style="display: flex; gap: 4px;">
                    <button class="v4-inspector-btn btn-move-row-up" data-row="${i}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="위로 이동" ${i === 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▲</button>
                    <button class="v4-inspector-btn btn-move-row-down" data-row="${i}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="아래로 이동" ${i === rowCount ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▼</button>
                    <button class="v4-inspector-btn btn-delete-row" data-row="${i}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; cursor: pointer;" title="삭제" ${rowCount <= 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>&times;</button>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div class="prop-group">
                    <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">조회 컬럼 개수</label>
                    <select class="v4-prop-input admin-row-cols" data-row="${i}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px; border-radius: 4px; font-size: 11px; height: 23px; box-sizing: border-box;">
                        <option value="1" ${colsVal === 1 ? 'selected' : ''}>1개 컬럼</option>
                        <option value="2" ${colsVal === 2 ? 'selected' : ''}>2개 컬럼</option>
                        <option value="3" ${colsVal === 3 ? 'selected' : ''}>3개 컬럼</option>
                    </select>
                </div>
                <div class="prop-group">
                    <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">행 높이 (Height px)</label>
                    <input type="number" class="v4-prop-input admin-row-height-input" data-row="${i}" value="${specificHeightVal}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; box-sizing: border-box; outline: none; font-family: inherit; height: 23px;">
                </div>
            </div>
            <div class="admin-row-labels-container" style="display: flex; flex-direction: column; gap: 8px;">
        `;

        // Render input field for each column
        for (let c = 0; c < colsVal; c++) {
            const currentLabel = labelsArr[c] || `조회 항목 ${i}${c > 0 ? ' ' + (c + 1) : ''}`;
            htmlContent += `
                <div class="prop-group">
                    <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">컬럼 ${c + 1} 항목명</label>
                    <input type="text" class="v4-prop-input admin-col-label-input" data-col-idx="${c}" value="${currentLabel}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; box-sizing: border-box;">
                </div>
            `;
        }

        htmlContent += `</div>`;
        rowDiv.innerHTML = htmlContent;
        container.appendChild(rowDiv);

        const colSelect = rowDiv.querySelector('.admin-row-cols');
        const heightInp = rowDiv.querySelector('.admin-row-height-input');
        const labelsContainer = rowDiv.querySelector('.admin-row-labels-container');
        const btnUp = rowDiv.querySelector('.btn-move-row-up');
        const btnDown = rowDiv.querySelector('.btn-move-row-down');
        const btnDelete = rowDiv.querySelector('.btn-delete-row');

        if (btnUp && i > 1) {
            btnUp.onclick = () => {
                const rows = getCurrentRowsData();
                const idx = i - 1;
                const temp = rows[idx];
                rows[idx] = rows[idx - 1];
                rows[idx - 1] = temp;
                applyUpdatedRows(rows);
            };
        }

        if (btnDown && i < rowCount) {
            btnDown.onclick = () => {
                const rows = getCurrentRowsData();
                const idx = i - 1;
                const temp = rows[idx];
                rows[idx] = rows[idx + 1];
                rows[idx + 1] = temp;
                applyUpdatedRows(rows);
            };
        }

        if (btnDelete && rowCount > 1) {
            btnDelete.onclick = () => {
                const rows = getCurrentRowsData();
                const idx = i - 1;
                rows.splice(idx, 1);
                applyUpdatedRows(rows);
            };
        }

        const getMergedLabels = () => {
            const inputs = labelsContainer.querySelectorAll('.admin-col-label-input');
            const vals = Array.from(inputs).map(inp => inp.value.trim());
            return vals.join(', ');
        };

        const updateConfig = () => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                    rowNum: i,
                    label: getMergedLabels(),
                    cols: parseInt(colSelect.value) || 1,
                    rowType: 'textbox',
                    rowSpecificHeight: parseInt(heightInp.value) || 50
                });
            }
        };

        // If Column Count changes, re-render the label inputs for this row
        colSelect.onchange = () => {
            const newColsVal = parseInt(colSelect.value) || 1;
            labelsContainer.innerHTML = '';
            let newHtml = '';
            for (let c = 0; c < newColsVal; c++) {
                const currentLabel = labelsArr[c] || `조회 항목 ${i}${c > 0 ? ' ' + (c + 1) : ''}`;
                newHtml += `
                    <div class="prop-group">
                        <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">컬럼 ${c + 1} 항목명</label>
                        <input type="text" class="v4-prop-input admin-col-label-input" data-col-idx="${c}" value="${currentLabel}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; box-sizing: border-box;">
                    </div>
                `;
            }
            labelsContainer.innerHTML = newHtml;

            // Bind input events to new inputs
            labelsContainer.querySelectorAll('.admin-col-label-input').forEach(inp => {
                inp.oninput = updateConfig;
            });

            updateConfig();
        };

        // Bind input events to height input & initial labels
        if (heightInp) heightInp.oninput = updateConfig;
        labelsContainer.querySelectorAll('.admin-col-label-input').forEach(inp => {
            inp.oninput = updateConfig;
        });
    }

    // Initialize row count +/- button click event listeners
    const btnInc = document.getElementById('btn-admin-row-inc');
    const btnDec = document.getElementById('btn-admin-row-dec');

    if (btnInc) {
        btnInc.onclick = () => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                const currentCount = parseInt(rowCountText.innerText) || 1;
                if (currentCount < 10) {
                    const newCount = currentCount + 1;
                    window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                        rowCount: newCount
                    });

                    // Trigger parent side metadata and ui sync
                    const activeId = window.state?.editingIndex;
                    if (activeId) {
                        const activeEl = iframe.contentWindow.document.getElementById(activeId);
                        if (activeEl) {
                            const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                            if (!containerEl.getAttribute(`data-row${newCount}-label`)) {
                                containerEl.setAttribute(`data-row${newCount}-label`, `조회 항목 ${newCount}`);
                                containerEl.setAttribute(`data-row${newCount}-cols`, '1');
                                containerEl.setAttribute(`data-row${newCount}-type`, 'textbox');
                            }
                            const syncData = {
                                id: activeId,
                                editingType: 'admin-settings',
                                adminRowCount: newCount
                            };
                            for (let r = 1; r <= 10; r++) {
                                syncData[`adminRow${r}Label`] = containerEl.getAttribute(`data-row${r}-label`) || '';
                                syncData[`adminRow${r}Cols`] = parseInt(containerEl.getAttribute(`data-row${r}-cols`)) || 1;
                                syncData[`adminRow${r}Type`] = containerEl.getAttribute(`data-row${r}-type`) || 'textbox';
                            }
                            _syncAdminSettingsProps(syncData);
                        }
                    }
                }
            }
        };
    }

    if (btnDec) {
        btnDec.onclick = () => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                const currentCount = parseInt(rowCountText.innerText) || 1;
                if (currentCount > 1) {
                    const newCount = currentCount - 1;
                    window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                        rowCount: newCount
                    });

                    const activeId = window.state?.editingIndex;
                    if (activeId) {
                        const activeEl = iframe.contentWindow.document.getElementById(activeId);
                        if (activeEl) {
                            const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                            const syncData = {
                                id: activeId,
                                editingType: 'admin-settings',
                                adminRowCount: newCount
                            };
                            for (let r = 1; r <= 10; r++) {
                                syncData[`adminRow${r}Label`] = containerEl.getAttribute(`data-row${r}-label`) || '';
                                syncData[`adminRow${r}Cols`] = parseInt(containerEl.getAttribute(`data-row${r}-cols`)) || 1;
                                syncData[`adminRow${r}Type`] = containerEl.getAttribute(`data-row${r}-type`) || 'textbox';
                            }
                            _syncAdminSettingsProps(syncData);
                        }
                    }
                }
            }
        };
    }
}

function _syncToggleProps(comp) {
    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    const btnOn = document.getElementById('btn-toggle-on');
    const btnOff = document.getElementById('btn-toggle-off');
    const isChecked = comp.toggleChecked === true;
    highlightActive(btnOn, isChecked);
    highlightActive(btnOff, !isChecked);

    const colorPicker = document.getElementById('prop-toggle-color');
    if (colorPicker && comp.toggleColor) {
        colorPicker.value = comp.toggleColor;
    }
    _syncAtomDisabledProps(comp);
}

console.log("[VCTRL INSPECTOR] UI Controller fully loaded and cleaned.");
