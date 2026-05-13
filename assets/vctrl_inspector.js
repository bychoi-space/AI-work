/**
 * vctrl_inspector.js - UI & Inspector Controller
 * Responsibility: DOM management, sidebar tabs, metadata UI, and component properties.
 */

console.log("%c [VCTRL INSPECTOR] Initializing UI Controller... ", "background: #10b981; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 1. Central DOM Registry
window.get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };

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
    pinsLayer: get('pins-layer'),
    guideLayer: get('guide-layer'),
    
    // Buttons
    btnSelect: get('btn-select'),
    btnHand: get('btn-hand'),
    btnText: get('btn-text'),
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
    textPropSection: get('text-properties-section'),
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
    // Alignment (RESTORED)
    alignBar: get('selection-align-bar'),
    btnAlignLeft: get('btn-align-left'),
    btnAlignCenter: get('btn-align-center'),
    btnAlignRight: get('btn-align-right'),
    btnAlignTop: get('btn-align-top'),
    btnAlignMiddle: get('btn-align-middle'),
    btnAlignBottom: get('btn-align-bottom')
};

// 2. UI Rendering Functions
window.updateProperties = function() {
    const pm = state.projectMetadata || {};
    if (!DOM.metadataPanel) return;

    // Use established V4 Meta Grid layout
    DOM.metadataPanel.innerHTML = `
        <div class="v4-meta-grid">
            <div class="v4-meta-item"><label>PROJECT TITLE</label><input type="text" id="viewer-meta-title" value="${pm.title || ''}" placeholder="프로젝트 제목"></div>
            <div class="v4-meta-item"><label>ASSIGNEE</label><input type="text" id="viewer-meta-assignee" value="${pm.assignee || ''}" placeholder="담당자"></div>
            <div class="v4-meta-item"><label>DEVELOPER</label><input type="text" id="viewer-meta-developer" value="${pm.developer || ''}" placeholder="개발자"></div>
            <div class="v4-meta-item"><label>PERIOD</label><input type="text" id="viewer-meta-period" value="${pm.period || ''}" placeholder="사업 기간"></div>
            <div class="v4-meta-item" style="position: relative;">
                <label>JIRA / LINKS</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="text" id="viewer-meta-jira" value="${pm.jira || ''}" placeholder="예) LFML-123456" style="flex: 1;">
                    <a id="btn-jira-link" href="${(pm.jira && typeof pm.jira === 'string') ? 'https://jira.lfcorp.com/browse/' + pm.jira.trim() : '#'}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="display: ${(pm.jira && typeof pm.jira === 'string' && pm.jira.trim()) ? 'flex' : 'none'};">바로가기</a>
                </div>
            </div>
        </div>
        <div class="v4-meta-actions">
            <div class="v4-meta-updated" id="meta-bar-updated"><span class="material-icons-outlined" style="font-size:14px; opacity:0.5;">history</span><span id="meta-updated-txt">최종 업데이트: -</span></div>
            <button id="btn-global-save" class="btn-accent">전체 저장</button>
        </div>
    `;

    // Re-bind save listener
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) btnSave.onclick = window.handleGlobalSave;

    // Real-time JIRA link update
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
};

window.switchSidebarTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    document.querySelectorAll('.tab-pane').forEach(pane => {
        const isActive = pane.id === `tab-${tabName}`;
        pane.style.display = isActive ? 'flex' : 'none';
        pane.classList.toggle('active', isActive);
    });
    
    if (DOM.sidebarRight?.classList.contains('collapsed')) {
        window.toggleSidebar?.('right', true);
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

        // Reordering logic (Standard HTML5 Drag & Drop)
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

window.handleEditScreen = async function(fileName) {
    if (state.isReadOnly) return window.showAuthModal?.();
    const meta = (state.projectMetadata.screens || {})[fileName] || {};
    DOM.editScreenFilename.innerText = fileName;
    DOM.editScreenTitle.value = meta.title || "";
    DOM.editScreenType.value = meta.type || "default";
    DOM.editScreenDefaultTab.value = meta.defaultTab || "editor";
    DOM.editScreenDesc.value = meta.description || "";
    DOM.editScreenModal.classList.add('active');
    
    DOM.btnSubmitEdit.onclick = async () => {
        const newTitle = DOM.editScreenTitle.value.trim();
        const newType = DOM.editScreenType.value;
        const newDefaultTab = DOM.editScreenDefaultTab.value;
        const newDesc = DOM.editScreenDesc.value.trim();
        
        DOM.btnSubmitEdit.disabled = true;
        DOM.btnSubmitEdit.innerText = "저장 중...";
        
        if (!state.projectMetadata.screens) state.projectMetadata.screens = {};
        state.projectMetadata.screens[fileName] = {
            ...state.projectMetadata.screens[fileName],
            title: newTitle, type: newType, defaultTab: newDefaultTab,
            description: newDesc, updatedAt: new Date().toISOString()
        };
        
        const success = await saveProjectMetadata(state.currentProject, state.projectMetadata);
        if (success) {
            DOM.editScreenModal.classList.remove('active');
            location.reload(); 
        } else {
            if (window.Notification) window.Notification.alert("메타데이터 저장에 실패했습니다.", "오류", "error");
            DOM.btnSubmitEdit.disabled = false;
            DOM.btnSubmitEdit.innerText = "변경사항 저장";
        }
    };
};

window.handleDeleteScreen = async function(fileName, sha) {
    if (state.isReadOnly) return window.showAuthModal?.();
    const confirmed = await Notification.confirm(`'${fileName}' 화면을 정말 삭제하시겠습니까?`, "화면 삭제");
    if (confirmed) {
        if (typeof window.showLoading === 'function') window.showLoading("화면 삭제 처리 중...");
        let targetSha = sha;
        if (!targetSha) {
            const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${ghConfig.dataDir}${state.currentProject}/${fileName}`;
            const res = await fetch(url, { headers: { 'Authorization': `token ${ghConfig.token}` }});
            if (res.ok) { const data = await res.json(); targetSha = data.sha; }
        }
        if (!targetSha) return window.Notification?.alert("파일 정보를 가져오지 못했습니다.", "삭제 실패", "error");

        const success = await deleteFileFromGitHub(`${state.currentProject}/${fileName}`, targetSha, false, msg => DOM.placeholderTxt.innerText = msg);
        if (success) {
            if (state.projectMetadata.screens) delete state.projectMetadata.screens[fileName];
            if (state.projectMetadata.screenOrder) {
                state.projectMetadata.screenOrder = state.projectMetadata.screenOrder.filter(name => name !== fileName);
            }
            await saveProjectMetadata(state.currentProject, state.projectMetadata);
            setTimeout(() => { window.location.href = `viewer.html?project=${state.currentProject}`; }, 2000);
        } else {
            if (window.Notification) window.Notification.alert("파일 삭제에 실패했습니다.", "오류", "error");
        }
    }
};

window.renderAtomicLibrary = function() {
    // 1. Render Custom Components (formerly Molecules)
    const customComps = window.state.projectMetadata?.molecules || [];
    const compHeader = document.getElementById('molecules-header-text');
    if (compHeader) {
        compHeader.innerHTML = `COMPONENTS <b style="color:var(--accent); margin-left: 4px;">(${customComps.length})</b>`;
    }

    const molContainer = document.getElementById('custom-molecules-container');
    if (molContainer) {
        const customHtml = customComps.map(m => `
            <div class="v4-component-item">
                <div class="v4-component-name-wrap" onclick="insertV4ComponentById('${m.id}')">
                    <span class="material-icons-outlined" style="font-size:14px; margin-right:8px; color:var(--accent); flex-shrink:0;">category</span>
                    <span class="v4-component-name" title="${m.name}">${m.name}</span>
                </div>
                <div class="v4-comp-actions">
                    <button class="v4-comp-btn v4-comp-edit-btn" onclick="renameComponent('${m.id}', event)" title="이름 수정">
                        <span class="material-icons-outlined" style="font-size: 14px;">edit</span>
                    </button>
                    <button class="v4-comp-btn v4-comp-delete-btn" onclick="deleteMolecule('${m.id}', event)" title="삭제">
                        <span class="material-icons-outlined" style="font-size: 14px;">close</span>
                    </button>
                </div>
            </div>
        `).join('');
        molContainer.innerHTML = customHtml;
    }

    // 2. Render Other Library Parts (Dependent on static lib)
    const panes = {
        'atoms': document.getElementById('pane-atoms'),
        'icons': document.getElementById('pane-icons')
    };
    if (!panes.atoms || !window.V4_COMPONENT_LIBRARY) return;

    const lib = window.V4_COMPONENT_LIBRARY;
    const allComponents = [...(lib.atoms || []), ...(lib.molecules || []), ...(lib.organisms || [])];

    panes.atoms.innerHTML = allComponents.map(item => `
        <div class="library-item" onclick="insertV4ComponentById('${item.id}')">
            <div class="item-preview">${item.previewHtml || '<span class="material-icons-outlined">extension</span>'}</div>
            <div class="item-name">${item.name}</div>
        </div>
    `).join('');

    const icons = ['Home', 'Category', 'My', 'Heart', 'Search', 'Cart', 'Brand', 'Back', 'Bell', 'Share', 'Party'];
    if (panes.icons) {
        panes.icons.innerHTML = icons.map(i => `
            <div class="library-item" onclick="insertAtomicComponent('icon', '${i}')" style="flex: 0 0 calc(25% - 8px); height:60px;">
                <div class="item-preview"><div class="lf-icon lf-icon-${i.toLowerCase()}" style="transform: scale(0.6);"></div></div>
                <div class="item-name" style="font-size:9px;">${i}</div>
            </div>
        `).join('');
    }
};

window.initQuillEditor = function() {
    if (window.quillEditor) return;
    const container = document.getElementById('editor-container');
    if (!container) return;

    // Register Attributors for Inline Styles
    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '64px'];
    Quill.register(Size, true);

    const Align = Quill.import('attributors/style/align');
    Quill.register(Align, true);

    window.quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: [
                [{ 'size': Size.whitelist }],
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    });

    window.quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1) return;
        const html = window.quillEditor.root.innerHTML;
        const marker = document.querySelector(`.text-marker[data-index="${state.editingIndex}"]`);
        if (marker) marker.innerHTML = (html === '<p><br></p>') ? "" : html;
    });
};

window.showLoading = function(text = "Loading Screen") {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        const txt = overlay.querySelector('.loading-text');
        if (txt) txt.innerText = text;
        overlay.classList.remove('fade-out');
    }
};

window.hideLoading = function() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('fade-out');
    setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 600);
};

window.showAuthModal = function() { if (DOM.authModal) DOM.authModal.classList.add('active'); };
window.hideAuthModal = function() {
    if (DOM.authModal) DOM.authModal.classList.remove('active');
    if (DOM.authStatus) DOM.authStatus.innerText = "";
};

window.handleAuthSubmit = async function() {
    const token = DOM.tokenInput?.value?.trim();
    if (!token) {
        if (DOM.authStatus) {
            DOM.authStatus.innerText = "토큰을 입력해주세요.";
            DOM.authStatus.style.color = "#f87171";
        }
        return;
    }
    const success = await verifyAndSaveToken(token, (msg, color) => {
        if (DOM.authStatus) {
            DOM.authStatus.innerText = msg;
            DOM.authStatus.style.color = color;
        }
    });
    if (success) {
        setTimeout(() => { hideAuthModal(); location.reload(); }, 1000);
    }
};

console.log("[VCTRL INSPECTOR] UI Controller loaded successfully.");
