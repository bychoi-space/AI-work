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
        state.editingType = compStyles.isPin ? 'pin' : (compStyles.isTable ? 'table' : (compStyles.isShape ? 'shape' : (compStyles.isConnector ? 'line' : 'comp')));

        // Hide all sections first
        if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
        if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'none';
        if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
        if (DOM.linePropSection) DOM.linePropSection.style.display = 'none';

        // Show relevant section
        if (state.editingType === 'pin' || compStyles.html !== undefined) {
            if (DOM.textPropSection) DOM.textPropSection.style.display = 'block';
        } 
        
        if (state.editingType === 'shape') {
            if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'block';
        } else if (state.editingType === 'table') {
            if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'block';
        } else if (state.editingType === 'line') {
            if (DOM.linePropSection) DOM.linePropSection.style.display = 'block';
        }

        // Load content to Quill
        if (compStyles.html !== undefined && window.quillEditor) {
            setTimeout(() => {
                window.quillEditor.root.innerHTML = compStyles.html;
                console.log("[Inspector] Loaded HTML to Quill:", compStyles.html);
            }, 50);
        }

        // Sync Property Controls
        const s = compStyles.currentStyles || {};
        if (DOM.textColorPicker) DOM.textColorPicker.value = s.text || "#000000";
        
        // Show Selection Bar
        if (DOM.selectionBar) {
            DOM.selectionBar.style.display = 'flex';
            if (DOM.selectionNumber) DOM.selectionNumber.innerText = "1";
            if (DOM.selectionLabel) {
                let label = "COMPONENT";
                if (compStyles.isPin) label = "TEXT MARKER";
                else if (compStyles.isShape) label = "SHAPE";
                else if (compStyles.isTable) label = "TABLE";
                else if (compStyles.isConnector) label = "CONNECTOR";
                DOM.selectionLabel.innerText = label;
            }
        }
    } else {
        state.isEditing = false;
        state.editingIndex = -1;
        if (DOM.selectionBar) DOM.selectionBar.style.display = 'none';
        // Hide all sections when nothing selected
        if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
        if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'none';
        if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
        if (DOM.linePropSection) DOM.linePropSection.style.display = 'none';
    }
};

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
window.renderAtomicLibrary = function() {
    const customComps = window.state.globalComponents || [];
    const compHeader = document.getElementById('molecules-header-text');
    if (compHeader) compHeader.innerHTML = `COMPONENTS <b style="color:var(--accent); margin-left: 4px;">(${customComps.length})</b>`;

    const molContainer = document.getElementById('custom-molecules-container');
    if (molContainer) {
        molContainer.innerHTML = customComps.map(m => `
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
            toolbar: [[{ 'size': Size.whitelist }], ['bold', 'italic', 'underline'], [{ 'color': [] }, { 'background': [] }], [{ 'align': [] }], ['clean']]
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
            // Phase 3: Also sync to iframe DOM directly
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                const compId = state.editingIndex;
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                    id: compId,
                    html: html
                });
            }
            markAsDirty();
        } else {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_STYLE', { selector: '.v4-editable-cell', style: { html: html } });
                markAsDirty();
            }
        }
    });
};

// --- 5. Init Events & Listeners ---
if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => window.toggleSidebar('left');
if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => window.toggleSidebar('right');
document.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => window.switchSidebarTab(btn.dataset.tab));

window.showLoading = (text) => { const overlay = get('loading-overlay'); if (overlay) { const txt = overlay.querySelector('.loading-text'); if (txt) txt.innerText = text; overlay.classList.remove('fade-out'); } };
window.hideLoading = () => { const overlay = get('loading-overlay'); if (overlay) overlay.classList.add('fade-out'); setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 600); };
window.showAuthModal = () => { const modal = get('auth-modal'); if (modal) modal.classList.add('active'); };
window.hideAuthModal = () => { const modal = get('auth-modal'); if (modal) modal.classList.remove('active'); };

console.log("[VCTRL INSPECTOR] UI Controller fully loaded and cleaned.");
