/**
 * viewer.js - UI Viewer Logic
 * Handles canvas interaction, screen switching, metadata management, and pins.
 */

/**
 * vctrl.js - Core Viewer Engine (Vanilla V3)
 * [VANILLA ENGINE V3 LOADED]
 */
console.log("%c [VANILLA ENGINE V3 LOADED] ", "background: #00e5ff; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;");
const state = {
    currentProject: null,
    activeFile: null,
    projectMetadata: null,
    tool: 'select',
    transform: { x: 0, y: 0, scale: 1 },
    isDragging: false,
    draggingPinIndex: null,
    dragLayerRect: null,
    startX: 0, startY: 0,
    screens: [], /* Current ordered screens */
    get isReadOnly() { return ghConfig.isReadOnly; },
    hasUnsavedChanges: false,
    isEditing: false,
    editingIndex: -1
};

let quillEditor = null; // Global Quill instance

function initQuillEditor() {
    if (quillEditor) return;
    const container = document.getElementById('editor-container');
    if (!container) {
        console.error("[Quill] 에디터 컨테이너(#editor-container)를 찾을 수 없습니다.");
        return;
    }

    // 0. Register Attributors for Inline Styles (Portability)
    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '64px'];
    Quill.register(Size, true);

    const Align = Quill.import('attributors/style/align');
    Quill.register(Align, true);

    // 1. Initialize Quill
    quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: [
                [{ 'size': ['12px', '14px', false, '18px', '20px', '24px', '30px', '36px', '48px', '64px'] }],
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    });


    // 2. Real-time Live Preview (Sidebar -> Canvas)
    quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1) return;
        
        const html = quillEditor.root.innerHTML;
        const index = state.editingIndex;
        
        // Immediate sync to the marker element for "WOW" effect
        const marker = document.querySelector(`.text-marker[data-index="${index}"]`);
        if (marker) {
            marker.innerHTML = (html === '<p><br></p>') ? "" : html;
            // The markers will now inherit inline styles for size/align/color from Quill
        }
    });

    console.log("[Quill] 에디터 초기화 완료 (인라인 스타일 모드).");
}



// State Change Helpers
window.markAsDirty = function() {
    if (state.hasUnsavedChanges) return;
    state.hasUnsavedChanges = true;
    console.log("[Status] Unsaved changes detected.");
    if (DOM.btnGlobalSave) {
        DOM.btnGlobalSave.style.boxShadow = "0 0 20px rgba(0, 229, 255, 0.6)";
    }
};

function markAsClean() {
    state.hasUnsavedChanges = false;
    if (DOM.btnGlobalSave) {
        DOM.btnGlobalSave.style.boxShadow = "";
    }
}

// Exit Protection Logic
window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for browser level exit
    }
});

/**
 * Custom Modal Navigation Guard
 * Returns true if navigation is safe, false if cancelled
 */
async function checkUnsavedChanges() {
    if (!state.hasUnsavedChanges) return true;
    const confirmed = await Notification.confirm(
        "저장되지 않은 수정사항이 있습니다. 무시하고 이동하시겠습니까?", 
        "알림", 
        "warning"
    );
    if (confirmed) {
        markAsClean(); // Clear flag so next move is safe
        return true;
    }
    return false;
}

// Safe DOM Retrieval Helper to prevent crashes if IDs are missing
const get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };

const DOM = {
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
    bottomUpdated: document.getElementById('bottom-updated')?.querySelector('span') || { innerText: '' },
    pinsLayer: get('pins-layer'),
    
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
    btnSubmitEdit: get('btn-edit-screen-submit'),
    
    // Component Tracking

    // Forms
    newScreenName: get('new-screen-name'),
    templateList: get('template-list'),
    
    // Sidebar Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    sidebarToolBtns: document.querySelectorAll('.sidebar-tool-btn'),

    // Edit Screen Modal DOM
    editScreenModal: get('edit-screen-modal'),
    editScreenTitle: get('edit-screen-title'),
    editScreenType: get('edit-screen-type'),
    editScreenDefaultTab: get('edit-screen-default-tab'),
    editScreenDesc: get('edit-screen-desc'),
    editScreenFilename: get('edit-screen-filename'),
    btnCancelEdit: get('btn-edit-screen-cancel'),
    
    // Description
    btnAddDescription: get('btn-add-description'),

    // Auth
    authModal: get('auth-modal'),
    tokenInput: get('modal-gh-token'),
    authStatus: get('modal-auth-status'),
    btnAuthSubmit: get('btn-modal-auth-submit'),
    btnAuthClose: get('btn-modal-auth-cancel'),
    btnShowAuth: get('btn-show-auth'),
    
    // Properties Sidebar Additions
    textPropSection: get('text-properties-section'),
    textColorPicker: get('text-color-picker'),
    colorPresets: document.querySelectorAll('.color-preset')
};

const context = {
    selectedTemplate: null
};

/**
 * Environment & Auth
 */
function checkEnvironment() {
    if (window.location.protocol === 'file:') {
        const today = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('hide_env_warning') === today) return;

        const banner = document.createElement('div');
        banner.className = 'env-banner';
        banner.innerHTML = `
            <span class="material-icons-outlined" style="color: #f87171;">warning</span>
            <div class="env-banner-text">
                <b>주의:</b> 브라우저 보안 정책으로 인해 로컬 파일 실행 시 프로젝트 생성이 제한될 수 있습니다. (Live Server 권장)
            </div>
            <button class="btn-close-banner">오늘 하루 보지 않기</button>
        `;
        document.body.appendChild(banner);
        
        setTimeout(() => banner.classList.add('active'), 100);

        banner.querySelector('.btn-close-banner').onclick = () => {
            localStorage.setItem('hide_env_warning', today);
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 500);
        };
    }
}

function showAuthModal() {
    if (DOM.authModal) DOM.authModal.classList.add('active');
}
function hideAuthModal() {
    if (DOM.authModal) DOM.authModal.classList.remove('active');
    if (DOM.authStatus) DOM.authStatus.innerText = "";
}
async function handleAuthSubmit() {
    const token = DOM.tokenInput.value.trim();
    if (!token) {
        DOM.authStatus.innerText = "토큰을 입력해주세요.";
        DOM.authStatus.style.color = "#f87171";
        return;
    }

    const success = await verifyAndSaveToken(token, (msg, color) => {
        DOM.authStatus.innerText = msg;
        DOM.authStatus.style.color = color;
    });

    if (success) {
        setTimeout(() => {
            hideAuthModal();
            location.reload(); 
        }, 1000);
    }
}

/**
 * Initialization
 */

function showLoading(text = "Loading Screen") {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        const txt = overlay.querySelector('.loading-text');
        if (txt) txt.innerText = text;
        overlay.classList.remove('fade-out');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('fade-out');
    setTimeout(centerView, 600);
}

/**
 * UI Rendering
 */
function renderScreenList(screens, activeName) {
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
                <button class="screen-edit-btn" title="속성 편집">
                    <span class="material-icons-outlined" style="font-size:16px;">edit</span>
                </button>
                <button class="screen-delete-btn" title="화면 삭제">
                    <span class="material-icons-outlined" style="font-size:16px;">delete</span>
                </button>
            </div>
        `;
        
        if (s.name === activeName) {
            item.classList.add('active');
            activeItem = item;
        }

        item.onclick = async (e) => {
            if (e.target.closest('.screen-delete-btn')) {
                handleDeleteScreen(s.name, s.sha);
                return;
            }
            if (e.target.closest('.screen-edit-btn')) {
                handleEditScreen(s.name);
                return;
            }
            
            // App-level navigation guard
            if (!(await checkUnsavedChanges())) return;
            
            const url = `viewer.html?project=${state.currentProject}&file=${s.name}`;
            history.pushState(null, '', url);
            loadScreen(s.name);
            updateActiveScreenInUI(s.name);
        };
        // Reordering logic
        item.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', index);
            item.classList.add('dragging');
        };
        item.ondragend = () => {
            item.classList.remove('dragging');
            document.querySelectorAll('.screen-item').forEach(i => i.classList.remove('drag-over'));
        };
        item.ondragover = (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        };
        item.ondragleave = () => item.classList.remove('drag-over');
        item.ondrop = async (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(item.dataset.index);
            if (fromIndex !== toIndex) {
                const [movedItem] = state.screens.splice(fromIndex, 1);
                state.screens.splice(toIndex, 0, movedItem);
                
                // Update persistent order
                state.projectMetadata.screenOrder = state.screens.map(s => s.name);
                await saveProjectMetadata(state.currentProject, state.projectMetadata);
                
                renderScreenList(state.screens, state.activeFile?.name);
            }
        };

        DOM.screensList.appendChild(item);
    });

    if (activeItem) {
        setTimeout(() => activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 800);
    }
}

function updateActiveScreenInUI(activeName) {
    document.querySelectorAll('.screen-item').forEach(item => {
        const name = item.querySelector('.screen-name').title;
        item.classList.toggle('active', name === activeName);
        if (name === activeName) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

function getCategoryBadge(type) {
    if (!type || type === 'default') return '<span class="screen-badge badge-default">ETC</span>';
    const categories = {
        'cover': { label: 'COVER', class: 'badge-cover' },
        'architecture': { label: 'ARCH', class: 'badge-architecture' },
        'plan': { label: 'PLAN', class: 'badge-plan' },
        'ui': { label: 'UI', class: 'badge-ui' },
        'admin-nbos': { label: 'NBOS', class: 'badge-admin-nbos' },
        'admin-onesphere': { label: '1SPH', class: 'badge-admin-onesphere' }
    };
    const cat = categories[type] || { label: 'ETC', class: 'badge-default' };
    return `<span class="screen-badge ${cat.class}">${cat.label}</span>`;
}

/**
 * Screen Content Management
 */
async function loadScreen(fileName) {
    if (state.isEditing) {
        closeActiveEditor(true);
    }
    showLoading("Loading: " + fileName);
    DOM.placeholder.style.display = 'none';
    
    const content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) {
        hideLoading();
        DOM.placeholder.style.display = 'flex';
        DOM.placeholderTxt.innerText = "파일을 불러오지 못했습니다.";
        return;
    }

    // [V4 INJECTION] Inline dependencies directly into HTML string to bypass all file:// security
    let finalContent = content;
    
    // We fetch the contents from our internal knowledge (just updated)
    const v4Styles = `
/* V4 Premium Styles (Inlined) */
:root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg-dark: #0a0b10; --v4-panel-bg: rgba(23, 25, 35, 0.7); --v4-border: rgba(255, 255, 255, 0.08); --v4-text-main: #f8fafc; --v4-text-dim: #94a3b8; }
.lf-component { position: absolute; cursor: pointer; transition: outline 0.2s; }
.lf-component.selected { outline: 2px solid #6366f1; z-index: 1001; }
.lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; opacity: 0; transition: all 0.2s; border: 2px solid #fff; z-index: 10; }
.lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; top: -16px; left: -16px; }
.lf-resizer { position: absolute; bottom: -5px; right: -5px; width: 12px; height: 12px; background: #6366f1; cursor: nwse-resize; border-radius: 50%; border: 2px solid #fff; opacity: 0; transition: 0.2s; z-index: 10; }
.lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
.lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 10001; font-size: 14px; font-weight: bold; }
.lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
.v4-premium-table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--v4-border); font-family: 'Inter', sans-serif; }
.v4-premium-table th { background: #4f46e5; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 16px; text-align: left; }
.v4-premium-table td { padding: 16px; font-size: 14px; color: #1a1c1e !important; border-bottom: 1px solid rgba(0, 0, 0, 0.05); }
.v4-editable-cell:focus { outline: 2px solid #6366f1; background: rgba(99, 102, 241, 0.05) !important; }
.v4-shape { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border: 2px solid transparent; transition: all 0.3s; overflow: hidden; }
.lf-icon { background-image: url("https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png"); background-size: 200px 160px; width: 40px; height: 40px; display: inline-block; background-repeat: no-repeat; pointer-events: none; }
.lf-icon-home { background-position: -80px 0; }
.lf-icon-category { background-position: 0 0; }
.lf-icon-my { background-position: -120px 0; }
.lf-icon-heart { background-position: -160px 0; }
.lf-icon-search { background-position: -80px -40px; }
.lf-icon-cart { background-position: -120px -40px; }
.lf-icon-brand { background-position: -40px 0; }
.lf-icon-bell { background-position: -40px -40px; }
.v4-shape-rect { border-radius: 8px; }
.v4-shape-circle { border-radius: 50%; }
.v4-shape-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
`;

    const v4Script = `
(function() {
    let isDragging = false, isResizing = false, activeEl = null;
    let startX, startY, startW, startH, startTop, startLeft;
    function notifyParent(data) { window.parent.postMessage(data, '*'); }
    function markDirty() { notifyParent({ type: 'LF_DIRTY' }); }
    function updateHandles(c) {
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
    }
    document.addEventListener('mouseover', e => {
        const c = e.target.closest('.lf-component');
        if (c) updateHandles(c);
    });
    document.addEventListener('mousedown', e => {
        const h = e.target.closest('.lf-drag-handle'), r = e.target.closest('.lf-resizer'), d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        if (d && c) { c.remove(); markDirty(); return; }
        if (c) {
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
            updateHandles(c);
            notifyParent({ type: 'LF_COMP_SELECTED', id: c.id, isTable: !!c.querySelector('table'), isShape: !!c.querySelector('.v4-shape'), isIcon: !!c.querySelector('.lf-icon') });
        } else {
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            notifyParent({ type: 'LF_DESELECT' });
        }
        if (h) { isDragging = true; activeEl = h.parentElement; startX = e.clientX; startY = e.clientY; startTop = parseInt(activeEl.style.top) || 0; startLeft = parseInt(activeEl.style.left) || 0; e.preventDefault(); }
        else if (r) { isResizing = true; activeEl = r.parentElement; startX = e.clientX; startY = e.clientY; startW = activeEl.offsetWidth; startH = activeEl.offsetHeight; e.preventDefault(); }
    });
    document.addEventListener('mousemove', e => {
        if (isDragging && activeEl) { 
            activeEl.style.top = (startTop + e.clientY - startY) + 'px'; 
            activeEl.style.left = (startLeft + e.clientX - startX) + 'px'; 
            updateHandles(activeEl);
            markDirty(); 
        }
        else if (isResizing && activeEl) { 
            activeEl.style.width = (startW + e.clientX - startX) + 'px'; 
            activeEl.style.height = (startH + e.clientY - startY) + 'px'; 
            updateHandles(activeEl);
            markDirty(); 
        }
    });
    document.addEventListener('mouseup', () => { isDragging = false; isResizing = false; activeEl = null; });
    document.addEventListener('input', e => { if (e.target.classList.contains('v4-editable-cell')) markDirty(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const selected = document.querySelector('.lf-component.selected');
            if (selected) { selected.remove(); markDirty(); notifyParent({ type: 'LF_DESELECT' }); }
        }
    });
    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;
        if (d.type === 'LF_REQUEST_SAVE_CONTENT') {
            const c = document.documentElement.cloneNode(true);
            c.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
            c.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
            notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: "<!DOCTYPE html>\\n" + c.outerHTML });
        } else if (d.type === 'LF_INSERT_COMPONENT') {
            const vh = window.innerHeight, vw = window.innerWidth, sY = window.scrollY, sX = window.scrollX;
            const compW = (d.style && d.style.width && d.style.width !== '100%') ? parseInt(d.style.width) || 200 : (d.style && d.style.width === '100%' ? vw : 200);
            const compH = (d.style && d.style.height && d.style.height !== 'auto') ? parseInt(d.style.height) || 100 : 100;
            const centerTop = Math.max(0, sY + (vh - compH) / 2);
            const centerLeft = Math.max(0, sX + (vw - compW) / 2);
            const v = document.createElement('div'); v.id = d.id || ('v4-comp-' + Date.now()); v.className = 'lf-component'; v.style.position = 'absolute'; v.style.top = centerTop + 'px'; v.style.left = centerLeft + 'px'; v.style.zIndex = '1000';
            if (d.style) Object.assign(v.style, d.style);
            v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + d.html + '<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div>';
            document.body.appendChild(v);
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected')); v.classList.add('selected');
            notifyParent({ type: 'LF_COMP_SELECTED', id: v.id, isTable: !!v.querySelector('table'), isShape: !!v.querySelector('.v4-shape'), isIcon: !!v.querySelector('.lf-icon') });
            markDirty();
        } else if (d.type === 'LF_UPDATE_STYLE') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const t = d.selector ? s.querySelector(d.selector) : s; if (!t) return;
            if (d.style) Object.assign(t.style, d.style);
            if (d.subSelector && d.subStyle) t.querySelectorAll(d.subSelector).forEach(el => Object.assign(el.style, d.subStyle));
            markDirty();
        } else if (d.type === 'LF_TABLE_ACTION') {
            const t = document.querySelector('.lf-component.selected table'); if (!t) return;
            if (d.action === 'ADD_ROW') {
                const b = t.querySelector('tbody') || t, l = t.querySelector('tr:last-child');
                if (l) { const n = l.cloneNode(true); n.querySelectorAll('td, th').forEach(x => { x.innerText = "-"; if (d.fontSize) x.style.fontSize = d.fontSize + 'px'; }); b.appendChild(n); }
            } else if (d.action === 'DEL_ROW') { const r = t.querySelectorAll('tr'); if (r.length > 1) r[r.length - 1].remove(); }
            else if (d.action === 'ADD_COL') { t.querySelectorAll('tr').forEach(tr => { const x = tr.querySelector('td:last-child') || tr.querySelector('th:last-child'); if (x) { const n = x.cloneNode(true); n.innerText = "-"; tr.appendChild(n); } }); }
            else if (d.action === 'DEL_COL') { t.querySelectorAll('tr').forEach(tr => { const x = tr.querySelectorAll('td, th'); if (x.length > 1) x[x.length - 1].remove(); }); }
            markDirty();
        } else if (d.type === 'LF_DELETE_SELECTED') {
            const s = document.querySelector('.lf-component.selected'); if (s) { s.remove(); markDirty(); }
        } else if (d.type === 'LF_DESELECT_ALL') {
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
        }
    });
})();
`;

    // 1. Inject Styles
    if (!finalContent.includes('style_v4.css') && !finalContent.includes('/* V4 Premium Styles (Inlined) */')) {
        const styleBlock = `<style id="v4-inlined-style">\n${v4Styles}\n</style>`;
        finalContent = finalContent.replace('</head>', `${styleBlock}\n</head>`);
    }
    // 2. Inject Script
    if (!finalContent.includes('vctrl_v4_iframe.js') && !finalContent.includes('LF_SAVE_CONTENT_RESPONSE')) {
        const scriptBlock = `<script id="v4-inlined-script">\n${v4Script}\n</script>`;
        finalContent = finalContent.replace('</body>', `${scriptBlock}\n</body>`);
    }

    // Auto-update JIRA IDENTIFIER for Cover Template
    if (finalContent.includes('cover-jira-id')) {
        const jiraValue = state.projectMetadata.jira || '-';
        finalContent = finalContent.replace(
            /(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, 
            `$1${jiraValue}$2`
        );
    }

    // Using srcdoc as a safer alternative to blob URLs for local HTML content
    DOM.iframe.srcdoc = finalContent;
    DOM.iframe.style.display = 'block';

    // Fail-safe: dismissal of loading overlay
    const loadTimeout = setTimeout(() => {
        hideLoading();
    }, 3000);

    DOM.iframe.onload = () => {
        clearTimeout(loadTimeout);
        hideLoading();
        DOM.iframe.onload = null;
    };

    let scMeta = (state.projectMetadata.screens || {})[fileName] || {};
    if (!scMeta.description) scMeta.description = [];
    else if (typeof scMeta.description === 'string') {
        scMeta.description = scMeta.description.trim() ? [{ text: scMeta.description, x: 0, y: 0 }] : [];
    }

    state.activeFile = { 
        name: fileName, 
        size: (content.length / 1024).toFixed(1) + ' KB',
        meta: scMeta
    };
    
    DOM.fileName.innerText = state.projectMetadata.title || state.currentProject;
    
    renderDescriptionList();
    updateProperties(); 
    
    // Switch to default tab if specified
    if (scMeta.defaultTab === 'description') {
        switchSidebarTab('description');
    } else {
        switchSidebarTab('editor'); // default
    }
    
    setTimeout(() => centerView(), 150);
}

/**
 * Metadata & Screen Editing
 */
async function handleEditScreen(fileName) {
    if (state.isReadOnly) return showAuthModal();
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
            title: newTitle,
            type: newType,
            defaultTab: newDefaultTab,
            description: newDesc,
            updatedAt: new Date().toISOString()
        };
        
        const success = await saveProjectMetadata(state.currentProject, state.projectMetadata);
        if (success) {
            DOM.editScreenModal.classList.remove('active');
            location.reload(); 
        } else {
            await Notification.alert("메타데이터 저장에 실패했습니다.", "오류", "error");
            DOM.btnSubmitEdit.disabled = false;
            DOM.btnSubmitEdit.innerText = "변경사항 저장";
        }
    };
}

async function handleDeleteScreen(fileName, sha) {
    if (state.isReadOnly) return showAuthModal();
    const confirmed = await Notification.confirm(`'${fileName}' 화면을 정말 삭제하시겠습니까?`, "화면 삭제");
    if (confirmed) {
        showLoading("화면 삭제 처리 중...");
        let targetSha = sha;
        if (!targetSha) {
            const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${ghConfig.dataDir}${state.currentProject}/${fileName}`;
            const res = await fetch(url, { headers: { 'Authorization': `token ${ghConfig.token}` }});
            if (res.ok) {
                const data = await res.json();
                targetSha = data.sha;
            }
        }
        if (!targetSha) return await Notification.alert("파일 정보를 가져오지 못했습니다.", "삭제 실패", "error");

        const success = await deleteFileFromGitHub(`${state.currentProject}/${fileName}`, targetSha, false, msg => DOM.placeholderTxt.innerText = msg);
        if (success) {
            if (state.projectMetadata.screens) delete state.projectMetadata.screens[fileName];
            if (state.projectMetadata.screenOrder) {
                state.projectMetadata.screenOrder = state.projectMetadata.screenOrder.filter(name => name !== fileName);
            }
            await saveProjectMetadata(state.currentProject, state.projectMetadata);
            
            showLoading("데이터 삭제 최종 동기화 중...");
            setTimeout(() => {
                window.location.href = `viewer.html?project=${state.currentProject}`;
            }, 2000);
        } else {
            await Notification.alert("파일 삭제에 실패했습니다.", "오류", "error");
        }
    }
}

/**
 * Project Properties Bar
 */
function updateProperties() {
    const pm = state.projectMetadata || { title: state.currentProject || '', assignee: '', period: '', jira: '' };
    if (!DOM.metadataPanel) return;

    DOM.metadataPanel.innerHTML = `
        <div class="v4-meta-grid">
            <div class="v4-meta-item">
                <label>PROJECT TITLE</label>
                <input type="text" id="viewer-meta-title" value="${pm.title || ''}" placeholder="프로젝트 제목">
            </div>
            <div class="v4-meta-item">
                <label>ASSIGNEE</label>
                <input type="text" id="viewer-meta-assignee" value="${pm.assignee || ''}" placeholder="담당자">
            </div>
            <div class="v4-meta-item">
                <label>DEVELOPER</label>
                <input type="text" id="viewer-meta-developer" value="${pm.developer || ''}" placeholder="개발자">
            </div>
            <div class="v4-meta-item">
                <label>PERIOD</label>
                <input type="text" id="viewer-meta-period" value="${pm.period || ''}" placeholder="사업 기간">
            </div>
            <div class="v4-meta-item" style="position: relative;">
                <label>JIRA / LINKS</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="text" id="viewer-meta-jira" value="${pm.jira || ''}" placeholder="예) LFML-123456" style="flex: 1;">
                    <a id="btn-jira-link"
                       href="${pm.jira ? 'https://jira.lfcorp.com/browse/' + pm.jira.trim() : '#'}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="btn-jira-shortcut"
                       style="display: ${pm.jira && pm.jira.trim() ? 'flex' : 'none'};"
                       title="JIRA 바로가기: ${pm.jira || ''}">
                        <span class="material-icons-outlined" style="font-size:13px;">open_in_new</span>
                        바로가기
                    </a>
                </div>
            </div>
        </div>
        <div class="v4-meta-actions">
            <div class="v4-meta-updated" id="meta-bar-updated">
                <span class="material-icons-outlined" style="font-size:14px; opacity:0.5;">history</span>
                <span id="meta-updated-txt">최종 업데이트: -</span>
            </div>
            <button id="btn-global-save" class="btn-primary" style="height:30px; padding:0 14px; font-size:12px; gap:6px; white-space:nowrap;">
                <span class="material-icons-outlined" style="font-size:15px;">save</span>
                전체 저장
            </button>
        </div>
    `;


    // Re-attach global save listener (element is re-created on every render)
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) btnSave.onclick = handleGlobalSave;
    // Update DOM reference
    DOM.btnGlobalSave = btnSave || DOM.btnGlobalSave;

    // Metadata Input Listeners
    if (!state.isReadOnly) {
        DOM.metadataPanel.querySelectorAll('input').forEach(input => {
            input.oninput = () => markAsDirty();
        });
    }

    // JIRA 바로가기 버튼 실시간 업데이트
    const jiraInput = document.getElementById('viewer-meta-jira');
    const jiraBtn   = document.getElementById('btn-jira-link');
    if (jiraInput && jiraBtn) {
        jiraInput.addEventListener('input', () => {
            const val = jiraInput.value.trim();
            if (val) {
                jiraBtn.href = 'https://jira.lfcorp.com/browse/' + val;
                jiraBtn.title = 'JIRA 바로가기: ' + val;
                jiraBtn.style.display = 'flex';
            } else {
                jiraBtn.style.display = 'none';
            }
        });
    }


    const periodInput = document.getElementById('viewer-meta-period');
    if (!state.isReadOnly && periodInput) {
        flatpickr(periodInput, {
            mode: "range", locale: "ko", dateFormat: "Y.m.d",
            defaultDate: pm.period ? pm.period.split(' ~ ') : null,
            onChange: (selectedDates) => {
                if (selectedDates.length === 2) {
                    const days = ['일', '월', '화', '수', '목', '금', '토'];
                    const format = d => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}(${days[d.getDay()]})`;
                    periodInput.value = `${format(selectedDates[0])} ~ ${format(selectedDates[1])}`;
                    markAsDirty();
                }
            }
        });
    }

    if (state.activeFile) {
        renderDescriptionList();
        const m = state.activeFile.meta || {};
        const updatedTxt = document.getElementById('meta-updated-txt');
        if (updatedTxt) {
            updatedTxt.innerText = m.updatedAt ? `최종 업데이트: ${new Date(m.updatedAt).toLocaleString()}` : '최종 업데이트: -';
        }
    }
}


/**
 * Descriptions & Pins
 */
function renderDescriptionList() {
    if (!state.activeFile) return;
    const list = state.activeFile.meta.description;
    DOM.descriptionList.innerHTML = '';
    DOM.pinsLayer.innerHTML = '';

    list.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'desc-row';
        row.draggable = !state.isReadOnly;
        row.dataset.index = index;
        row.innerHTML = `
            <div class="desc-index">${index + 1}</div>
            <textarea class="desc-input" rows="1" placeholder="설명을 입력하세요..." ${state.isReadOnly ? 'disabled' : ''}>${item.text || ''}</textarea>
            <div class="desc-actions">
                <button class="desc-btn desc-btn-del" data-index="${index}" title="삭제"><span class="material-icons-outlined">remove_circle_outline</span></button>
            </div>
        `;

        const pin = document.createElement('div');
        if (item.type === 'text') {
            pin.className = 'text-marker';
            pin.innerHTML = `
                <div class="lf-drag-handle">
                    <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
                </div>
                ${item.html || item.text || ''}
            `;
            const markerColor = item.color || "#000000";
            pin.style.setProperty('color', markerColor, 'important');
            
            if (state.isEditing && state.editingIndex === index) {
                pin.classList.add('editing-active');
            }
        } else {
            pin.className = 'pin-marker';
            pin.innerText = index + 1;
        }
        pin.dataset.index = index;
        
        const highlight = (active) => { pin.classList.toggle('highlight', active); row.classList.toggle('highlight', active); };
        pin.onmouseenter = () => highlight(true);
        pin.onmouseleave = () => highlight(false);
        row.onmouseenter = () => highlight(true);
        row.onmouseleave = () => highlight(false);

        // Delete Button on Marker
        if (!state.isReadOnly) {
            const delBtn = document.createElement('div');
            delBtn.className = 'marker-delete-btn';
            delBtn.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 11px;">X</span>';
            delBtn.title = "삭제";
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteAnnotation(index);
            };
            pin.appendChild(delBtn);
        }

        DOM.descriptionList.appendChild(row);
        DOM.pinsLayer.appendChild(pin);
        
        // Initial Position via Vanilla (centered) - MUST BE IN DOM FIRST
        pin.style.left = (item.x || 0) + "%";
        pin.style.top = (item.y || 0) + "%";
        pin.style.cursor = 'grab';

        // Robust Custom Click Handling
        let lastClickTime = 0;
        const doubleClickThreshold = 450; 

        // Block propagation for ALL click-related events to protect pinsLayer
        const stopProps = (e) => e.stopPropagation();
        pin.addEventListener('click', stopProps);
        pin.addEventListener('dblclick', stopProps);

        const handleActivation = (e) => {
            if (state.isReadOnly) return false;
            if (e.target.closest('.marker-delete-btn')) return false;
            
            // Activation will now happen on MouseUp if not moved
            return false;
        };

        // Listen on MouseDown to catch it early and handle Drag
        pin.addEventListener('mousedown', (e) => {
            if (state.isReadOnly) return;
            if (e.target.closest('.marker-delete-btn')) return;
            
            const handle = e.target.closest('.lf-drag-handle');
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            let moved = false;
            const initialItemX = item.x || 0;
            const initialItemY = item.y || 0;
            const r = DOM.pinsLayer.getBoundingClientRect();

            const onMouseMove = (moveEvent) => {
                // Unify: Only drag if handle is clicked (for text markers)
                if (item.type === 'text' && !handle) return;

                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    if (!moved) {
                        if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                        document.body.style.cursor = 'grabbing';
                        pin.style.cursor = 'grabbing';
                        pin.style.transition = 'none'; 
                        pin.style.zIndex = '1001'; 
                        pin.classList.add('active', 'dragging-now');
                        highlight(true);
                    }
                    moved = true;
                }
                
                if (moved) {
                    item.x = Math.max(0, Math.min(initialItemX + (dx / r.width) * 100, 100));
                    item.y = Math.max(0, Math.min(initialItemY + (dy / r.height) * 100, 100));
                    pin.style.left = item.x + "%";
                    pin.style.top = item.y + "%";
                }
            };

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                
                if (moved) {
                    if (DOM.iframe) DOM.iframe.style.pointerEvents = (state.tool === 'hand') ? 'none' : 'auto';
                    document.body.style.cursor = '';
                    pin.style.cursor = 'grab';
                    pin.style.transition = ''; 
                    pin.style.zIndex = '100';
                    pin.classList.remove('active', 'dragging-now');
                    highlight(false);
                    markAsDirty();
                } else {
                    // It was a simple click
                    if (item.type === 'text') {
                        // Activate Editor for text markers
                        spawnTextEditor(item.x, item.y, index);
                    } else {
                        // For pin markers, focus the corresponding textarea
                        const rowInput = document.querySelector(`.desc-row[data-index="${index}"] .desc-input`);
                        if (rowInput) {
                            switchSidebarTab('description');
                            rowInput.focus();
                        }
                    }
                }
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // Touch support
        pin.ontouchstart = (e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;
            const initialItemX = item.x || 0;
            const initialItemY = item.y || 0;
            const r = DOM.pinsLayer.getBoundingClientRect();
            highlight(true);

            const onTouchMove = (moveEvent) => {
                const t = moveEvent.touches[0];
                const dx = t.clientX - startX;
                const dy = t.clientY - startY;
                item.x = Math.max(0, Math.min(initialItemX + (dx / r.width) * 100, 100));
                item.y = Math.max(0, Math.min(initialItemY + (dy / r.height) * 100, 100));
                pin.style.left = item.x + "%";
                pin.style.top = item.y + "%";
            };

            const onTouchEnd = () => {
                window.removeEventListener('touchmove', onTouchMove);
                window.removeEventListener('touchend', onTouchEnd);
                highlight(false);
            };

            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
        };

        const input = row.querySelector('.desc-input');
        input.oninput = () => { 
            item.text = input.value; 
            autoResize(input); 
            markAsDirty();
        };
        const autoResize = (el) => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
        
        row.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', index);
            row.classList.add('dragging-row');
        };
        row.ondragend = () => document.querySelectorAll('.desc-row').forEach(r => r.classList.remove('drag-over', 'dragging-row'));
        row.ondragover = (e) => { e.preventDefault(); row.classList.add('drag-over'); };
        row.ondragleave = () => row.classList.remove('drag-over');
        row.ondrop = (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(row.dataset.index);
            if (fromIndex !== toIndex) {
                const [movedItem] = list.splice(fromIndex, 1);
                list.splice(toIndex, 0, movedItem);
                renderDescriptionList();
            }
        };
        
        autoResize(input);

        row.querySelector('.desc-btn-del').onclick = async () => {
            if (state.isReadOnly) return showAuthModal();
            if (await Notification.confirm("이 설명을 삭제하시겠습니까?", "설명 삭제")) {
                list.splice(index, 1);
                markAsDirty();
                renderDescriptionList();
            }
        };
    });
}

async function getIframeHTML() {
    // If running on file:// protocol, avoid direct access entirely to prevent security warnings
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (!isFileProtocol) {
        try {
            if (DOM.iframe && DOM.iframe.contentDocument) {
                const doc = DOM.iframe.contentDocument;
                const clone = doc.documentElement.cloneNode(true);
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
                return "<!DOCTYPE html>\n" + clone.outerHTML;
            }
        } catch (e) {
            console.warn("[Security] Direct iframe access failed, switching to message fallback.");
        }
    }

    // Fallback: Request via postMessage (Safe for file:// and cross-origin)
    console.log("[Save] Requesting content via postMessage...");
    return new Promise((resolve) => {
        const handler = (e) => {
            if (e.data.type === 'LF_SAVE_CONTENT_RESPONSE') {
                window.removeEventListener('message', handler);
                console.log("[Save] Content received via postMessage.");
                resolve(e.data.html);
            }
        };
        window.addEventListener('message', handler);
        if (DOM.iframe && DOM.iframe.contentWindow) {
            DOM.iframe.contentWindow.postMessage({ type: 'LF_REQUEST_SAVE_CONTENT' }, '*');
        } else {
            window.removeEventListener('message', handler);
            resolve(null);
        }
        // Timeout
        setTimeout(() => {
            window.removeEventListener('message', handler);
            console.warn("[Save] PostMessage content request timed out.");
            resolve(null);
        }, 2500);
    });
}

/**
 * Global Save
 */
async function handleGlobalSave() {
    try {
        if (state.isReadOnly) return showAuthModal();
        
        // Ensure any active text editor is synced before saving
        if (state.isEditing && typeof closeActiveEditor === 'function') {
            closeActiveEditor(true);
        }
        
        const btn = DOM.btnGlobalSave;
        if (!btn) return;

        // --- Loading bar UI ---
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.innerHTML = `
            <span class="material-icons-outlined" style="font-size:15px;">save</span>
            저장 중...
            <span id="save-loading-bar" style="
                position:absolute; left:0; bottom:0; height:3px;
                width:0%; background:rgba(255,255,255,0.9);
                border-radius:0 0 8px 8px;
                transition:width 2.5s cubic-bezier(0.4,0,0.2,1);
            "></span>
        `;
        // Trigger animation on next frame
        requestAnimationFrame(() => {
            const bar = document.getElementById('save-loading-bar');
            if (bar) bar.style.width = '90%';
        });

        const projectMeta = {
            title: document.getElementById('viewer-meta-title')?.value || '',
            assignee: document.getElementById('viewer-meta-assignee')?.value || '',
            developer: document.getElementById('viewer-meta-developer')?.value || '',
            period: document.getElementById('viewer-meta-period')?.value || '',
            jira: document.getElementById('viewer-meta-jira')?.value || ''
        };

        // Get current HTML from iframe
        let htmlContent = await getIframeHTML();
        
        // Auto-update JIRA IDENTIFIER for Cover Template before saving
        if (htmlContent && htmlContent.includes('cover-jira-id')) {
            const jiraValue = projectMeta.jira || '-';
            htmlContent = htmlContent.replace(
                /(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, 
                `$1${jiraValue}$2`
            );
            
            // Try to update UI directly if not blocked by CORS
            try {
                const iframeDoc = DOM.iframe.contentDocument || DOM.iframe.contentWindow.document;
                const jiraCell = iframeDoc.getElementById('cover-jira-id');
                if (jiraCell) jiraCell.innerText = jiraValue;
            } catch (e) { /* Ignore CORS error in file:// */ }
        }

        const activeFileName = state.activeFile ? state.activeFile.name : null;

        const success = await updateScreenMetadata(state.currentProject, activeFileName, { 
            projectMeta, 
            htmlContent,
            description: state.activeFile ? state.activeFile.meta.description : []
        }, () => {}); // status handled below

        // Complete the loading bar
        const bar = document.getElementById('save-loading-bar');
        if (bar) { bar.style.transition = 'width 0.3s ease'; bar.style.width = '100%'; }

        await new Promise(r => setTimeout(r, 350)); // let bar fill

        if (success) {
            markAsClean();
            Object.assign(state.projectMetadata, projectMeta);
            if (projectMeta.title) DOM.fileName.innerText = projectMeta.title;
            console.log("[Save] Global save successful.");

            // Success state
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">check_circle</span> 저장 완료`;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.position = '';
                btn.style.overflow = '';
                btn.disabled = false;
            }, 1800);
        } else {
            throw new Error("GitHub API 반영에 실패했습니다.");
        }
    } catch (err) {
        console.error("[Save Error]", err);
        const btn = DOM.btnGlobalSave;
        if (btn) {
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">error</span> 저장 실패`;
            btn.style.background = '#ef4444';
            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">save</span> 전체 저장`;
                btn.style.background = '';
                btn.style.position = '';
                btn.style.overflow = '';
            }, 2500);
        }
        Notification.alert('저장 중 오류가 발생했습니다: ' + err.message, '오류', 'error');
    }
}

/**
 * Canvas Operations
 */
function centerView() {
    if (!DOM.canvas || !DOM.iframe) return;
    const iw = parseInt(DOM.iframe.style.width) || 1440, ih = parseInt(DOM.iframe.style.height) || 900;
    const cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    let s = Math.min((cw * 0.99) / iw, (ch * 0.99) / ih, 1);
    if (s > 1.0) s = 1.0;
    state.transform = { x: (cw - (iw * s)) / 2, y: (ch - (ih * s)) / 2, scale: s };
    updateTransform();
}

function updateTransform() {
    DOM.stage.style.transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
    DOM.zoomTxt.innerText = Math.round(state.transform.scale * 100) + '%';
}

function adjustZoom(delta) {
    state.transform.scale = Math.max(0.1, Math.min(state.transform.scale + delta, 3));
    updateTransform();
}

function setDeviceViewport(type, w, h) {
    document.querySelectorAll('.tools .device-btn').forEach(btn => btn.classList.remove('active'));
    if(type === 'mobile') document.querySelector('.tools .tool-btn[onclick*="mobile"]').classList.add('active');
    else if(type === 'tablet') document.querySelector('.tools .tool-btn[onclick*="tablet"]').classList.add('active');
    else document.getElementById('btn-desktop').classList.add('active');

    if (DOM.artboardWrapper) { DOM.artboardWrapper.style.width = w + 'px'; DOM.artboardWrapper.style.height = h + 'px'; }
    DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px';
    setTimeout(() => centerView(), 100);
}

function setTool(t) {
    state.tool = t;
    DOM.btnSelect.classList.toggle('active', t === 'select');
    DOM.btnHand.classList.toggle('active', t === 'hand');
    if (DOM.btnText) DOM.btnText.classList.toggle('active', t === 'text');
    DOM.canvas.classList.toggle('hand-active', t === 'hand');

    // Sidebar tool sync
    DOM.sidebarToolBtns?.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === t);
    });
    
    // Toggle pointer-events to allow clicking on the artboard for pins
    DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
    if (DOM.pinsLayer) {
        DOM.pinsLayer.style.pointerEvents = (t === 'select') ? 'auto' : 'none';
    }
}

/**
 * Event Listeners
 */

// Canvas-click to add pins has been removed per user request.
// Use Sidebar buttons [Text Creation] or [Add Description] to create annotations.
DOM.pinsLayer.onclick = (e) => {
    // We only prevent default/bubbling here to keep context clean
    if (e.target !== DOM.pinsLayer) return;

    // 1. Close Text Editor (Legacy)
    if (state.isEditing) {
        closeActiveEditor(true);
    }

    // 2. Hide V4 Inspectors & Clear V4 Selections
    if (window.closeAllV4Inspectors) {
        window.closeAllV4Inspectors();
    } else {
        const tableSect = document.getElementById('table-inspector-section');
        const shapeSect = document.getElementById('shape-inspector-section');
        if (tableSect) tableSect.style.display = 'none';
        if (shapeSect) shapeSect.style.display = 'none';
        
        // Post message to iframe for internal cleanup
        DOM.iframe.contentWindow.postMessage({ type: 'LF_DESELECT_ALL' }, '*');
    }

    // 3. Sync UI State
    state.isEditing = false;
    state.editingIndex = -1;
    renderDescriptionList();
};

function getCascadedPosition(startX = 50, startY = 50) {
    let x = startX, y = startY;
    const step = 3; // 3% offset as suggested
    const list = state.activeFile?.meta.description || [];
    
    let isOccupied = true;
    let attempts = 0;
    while (isOccupied && attempts < 15) {
        isOccupied = list.some(item => 
            item.type === 'text' && Math.abs(item.x - x) < 1 && Math.abs(item.y - y) < 1
        );
        if (isOccupied) {
            x += step;
            y += step;
            attempts++;
            if (x > 95 || y > 95) { x = startX; y = startY; break; }
        }
    }
    return { x, y };
}

function handleTextCreation() {
    if (state.isReadOnly) return showAuthModal();
    if (!state.activeFile) return Notification.alert("스크린을 선택해주세요.", "알림", "warning");

    const { x, y } = getCascadedPosition(50, 50);
    
    // 1. Push immediate empty data to enable real-time sync
    const newIdx = state.activeFile.meta.description.length;
    state.activeFile.meta.description.push({
        html: "",
        text: "",
        x, y,
        type: 'text',
        color: "#000000"
    });

    // 2. Refresh UI to show the empty marker
    markAsDirty();
    renderDescriptionList();

    // 3. Open editor for this new marker
    setTimeout(() => {
        spawnTextEditor(x, y, newIdx);
    }, 50);
}

/**
 * Global Editor Controller
 */
function closeActiveEditor(save = true) {
    if (!state.isEditing) return;
    
    const editorSection = document.getElementById('text-editor-section');
    const emptyMsg = document.querySelector('.empty-inspector');
    
    const htmlContent = quillEditor ? quillEditor.root.innerHTML : "";
    const plainText = quillEditor ? quillEditor.getText().trim() : "";
    const finalColor = quillEditor ? normalizeToHex(quillEditor.root.style.color || "#000000") : "#000000";

    if (save && quillEditor) {
        if (state.editingIndex !== -1 && state.activeFile && state.activeFile.meta.description[state.editingIndex]) {
            state.activeFile.meta.description[state.editingIndex].html = htmlContent;
            state.activeFile.meta.description[state.editingIndex].text = plainText;
            state.activeFile.meta.description[state.editingIndex].color = finalColor;
            
            if (!plainText && (htmlContent === "" || htmlContent === "<p><br></p>")) {
                state.activeFile.meta.description.splice(state.editingIndex, 1);
            }
            markAsDirty();
        }
    } else if (!save && state.editingIndex !== -1 && state.activeFile) {
        const item = state.activeFile.meta.description[state.editingIndex];
        if (item && !item.text && (!item.html || item.html === "<p><br></p>")) {
            state.activeFile.meta.description.splice(state.editingIndex, 1);
        }
    }

    state.isEditing = false;
    state.editingIndex = -1;
    if (editorSection) editorSection.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'flex';
    renderDescriptionList();
}

function spawnTextEditor(x, y, existingIndex = -1) {
    // 1. Continuous Editing: If another is open, save it first
    if (state.isEditing) {
        closeActiveEditor(true);
    }
    
    // 2. Hide other V4 inspectors to avoid UI clutter
    if (window.closeAllV4Inspectors) window.closeAllV4Inspectors();

    state.isEditing = true;
    state.editingIndex = existingIndex;

    // 3. Side-effects
    initQuillEditor();
    switchSidebarTab('editor');
    const editorSection = document.getElementById('text-editor-section');
    if (editorSection) {
        editorSection.style.display = 'block';
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) editorContainer.style.display = 'block';
    }

    const emptyMsg = document.querySelector('.empty-inspector');
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    // 2. Visual Highlight
    const markers = document.querySelectorAll('.text-marker');
    markers.forEach(m => m.classList.remove('editing-active'));
    if (existingIndex !== -1) {
        const activeMarker = document.querySelector(`.text-marker[data-index="${existingIndex}"]`);
        if (activeMarker) activeMarker.classList.add('editing-active');
    }

    // 3. Load content into Quill
    if (quillEditor) {
        const item = (existingIndex !== -1 && state.activeFile) ? state.activeFile.meta.description[existingIndex] : null;
        const initialHtml = item ? (item.html || item.text || "") : "";
        quillEditor.root.innerHTML = initialHtml;
        quillEditor.focus();
    }

    // 4. Action Button Handlers
    const btnApply = document.getElementById('btn-editor-apply');
    const btnDelete = document.getElementById('btn-editor-delete');

    if (btnApply) {
        btnApply.onclick = (e) => {
            e.stopPropagation();
            closeActiveEditor(true);
        };
    }

    if (btnDelete) {
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            deleteAnnotation(state.editingIndex);
            closeActiveEditor(false); 
        };
    }

    const handleGlobalClick = (e) => {
        if (!state.isEditing) return;
        if (e.target.closest('#text-editor-section') || 
            e.target.closest('.text-marker') || 
            e.target.closest('.sidebar-right') ||
            e.target.closest('.ql-tooltip')) return;
        
        closeActiveEditor(true);
        window.removeEventListener('mousedown', handleGlobalClick);
    };
    
    setTimeout(() => {
        window.addEventListener('mousedown', handleGlobalClick);
    }, 400);
}

function deleteAnnotation(index) {
    if (state.isReadOnly || !state.activeFile) return;
    state.activeFile.meta.description.splice(index, 1);
    markAsDirty();
    renderDescriptionList();
}

/**
 * Text Property Sidebar Helpers
 */
function showTextProperties(index) {
    if (!DOM.textPropSection) return;
    DOM.textPropSection.style.display = 'block';
    
    // Switch to editor tab automatically
    switchSidebarTab('editor');
}

function hideTextProperties() {
    if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
}

function updateActiveTextAnnotationColor(color) {
    const hex = normalizeToHex(color);
    
    // 1. Update Quill Selection if editor is active
    if (state.isEditing && quillEditor) {
        // Apply color to current selection or the whole editor if nothing selected
        const range = quillEditor.getSelection();
        if (range && range.length > 0) {
            quillEditor.format('color', hex);
        } else {
            // Apply to editor root for better feedback when nothing is selected
            quillEditor.root.style.color = hex;
        }
    }

    // 2. Sync picker and presets UI
    if (DOM.textColorPicker) DOM.textColorPicker.value = hex;
    updatePresetActive(hex);
}

function updatePresetActive(color) {
    const hex = normalizeToHex(color);
    DOM.colorPresets?.forEach(btn => {
        const btnHex = normalizeToHex(btn.dataset.color);
        btn.classList.toggle('active', btnHex.toLowerCase() === hex.toLowerCase());
    });
}

function normalizeToHex(color) {
    if (!color) return "#000000";
    if (color.startsWith('#')) return color;
    
    // Mapping for common preset names
    const colorMap = {
        'black': '#000000',
        'white': '#ffffff',
        'red': '#ef4444',
        'blue': '#3b82f6',
        'green': '#22c55e',
        'yellow': '#eab308'
    };
    if (colorMap[color.toLowerCase()]) return colorMap[color.toLowerCase()];

    // Convert rgb(r, g, b) to #rrggbb
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return color;
    
    const r = parseInt(rgb[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgb[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgb[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}


function toggleSidebar(side, force) {
    const sidebar = side === 'left' ? DOM.sidebarLeft : DOM.sidebarRight;
    const handle = side === 'left' ? DOM.btnToggleLeft : DOM.btnToggleRight;
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const targetCollapsed = force !== undefined ? !force : !isCurrentlyCollapsed;

    sidebar.classList.toggle('collapsed', targetCollapsed);
    
    const icon = handle?.querySelector('span');
    if (icon) {
        if (side === 'left') icon.innerText = targetCollapsed ? 'chevron_right' : 'chevron_left';
        else icon.innerText = targetCollapsed ? 'chevron_left' : 'chevron_right';
    }
    
    setTimeout(centerView, 300);
}

function toggleFullscreen(forceExit) {
    const isActive = document.body.classList.contains('fullscreen-mode');
    const shouldExit = forceExit === true || (forceExit === undefined && isActive);

    if (shouldExit) {
        document.body.classList.remove('fullscreen-mode');
        if (DOM.btnFullscreen) {
            DOM.btnFullscreen.querySelector('span').innerText = 'fullscreen';
            DOM.btnFullscreen.title = '전체보기 (F)';
        }
    } else {
        document.body.classList.add('fullscreen-mode');
        if (DOM.btnFullscreen) {
            DOM.btnFullscreen.querySelector('span').innerText = 'fullscreen_exit';
            DOM.btnFullscreen.title = '전체보기 취소 (F)';
        }
    }
    setTimeout(centerView, 350);
}

function switchSidebarTab(tabName) {
    DOM.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    DOM.tabPanes.forEach(pane => {
        const isActive = pane.id === `tab-${tabName}`;
        pane.style.display = isActive ? 'flex' : 'none';
        pane.classList.toggle('active', isActive);
    });
    
    // Auto-open sidebar if switching tab
    if (DOM.sidebarRight?.classList.contains('collapsed')) {
        toggleSidebar('right', true);
    }
}

function toggleInspector() {
    // Inspector is now a tab in the right sidebar
    switchSidebarTab('properties');
}

if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => toggleSidebar('left');
if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => toggleSidebar('right');

// Add Tab Button Listeners
DOM.tabBtns.forEach(btn => {
    btn.onclick = () => switchSidebarTab(btn.dataset.tab);
});

// Add Sidebar Tool Listeners
DOM.sidebarToolBtns?.forEach(btn => {
    btn.onclick = () => {
        if (btn.dataset.tool === 'text') {
            handleTextCreation();
        } else {
            setTool(btn.dataset.tool);
        }
    };
});



if (DOM.btnAddDescription) DOM.btnAddDescription.onclick = () => { 
    if (state.isReadOnly) return showAuthModal(); 
    if (!state.activeFile) return Notification.alert("스크린을 선택해주세요.", "알림", "warning"); 
    
    const { x, y } = getCascadedPosition(50, 50);
    state.activeFile.meta.description.push({ text: '', x, y, type: 'pin' }); 
    markAsDirty(); 
    renderDescriptionList(); 
    setTimeout(() => {
        const inputs = DOM.descriptionList?.querySelectorAll('.desc-input');
        if (inputs && inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    }, 50); 
};

if (DOM.btnAddScreen) DOM.btnAddScreen.onclick = () => { 
    if (state.isReadOnly) return showAuthModal(); 
    DOM.addScreenModal?.classList.add('active'); 
    if (DOM.newScreenName) DOM.newScreenName.value = ""; 
    context.selectedTemplate = null; 
    DOM.templateList?.querySelectorAll('.template-card').forEach(c => c.classList.remove('active')); 
};
if (DOM.btnCancelAdd) DOM.btnCancelAdd.onclick = () => DOM.addScreenModal?.classList.remove('active');

// Mouse Drag-to-Scroll (Swipe) for Template Selection
if (DOM.templateList) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let moved = false;

    DOM.templateList.addEventListener('mousedown', (e) => {
        isDown = true;
        moved = false;
        DOM.templateList.classList.add('active'); // CSS matches .template-grid.active or similar
        startX = e.pageX - DOM.templateList.offsetLeft;
        scrollLeft = DOM.templateList.scrollLeft;
    });

    DOM.templateList.addEventListener('mouseleave', () => {
        isDown = false;
    });

    DOM.templateList.addEventListener('mouseup', () => {
        isDown = false;
    });

    DOM.templateList.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - DOM.templateList.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        if (Math.abs(walk) > 5) moved = true;
        DOM.templateList.scrollLeft = scrollLeft - walk;
    });

    // Event Delegation for Template Selection with drag protection
    DOM.templateList.addEventListener('click', (e) => {
        if (moved) return; // Prevent selection if it was a drag

        const card = e.target.closest('.template-card');
        if (!card) return;
        
        DOM.templateList.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        context.selectedTemplate = card.dataset.template;
        
        if (DOM.newScreenName && !DOM.newScreenName.value.trim()) {
            DOM.newScreenName.value = card.dataset.defaultName + "_" + new Date().getTime().toString().slice(-4);
        }
    });
}
if (DOM.btnUploadLocal) DOM.btnUploadLocal.onclick = () => DOM.addScreenUpload?.click();
DOM.addScreenUpload.onchange = async (e) => {
    if (state.isReadOnly) return showAuthModal();
    const files = Array.from(e.target.files).filter(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
    if (files.length === 0) return;
    DOM.addScreenModal.classList.remove('active');
    DOM.placeholder.style.display = 'flex'; DOM.placeholderTxt.innerText = "화면 추가 중...";
    for (const file of files) {
        const content = await file.text();
        if (await uploadToProject(state.currentProject, file.name, content, msg => DOM.placeholderTxt.innerText = msg)) {
            state.projectMetadata.screens = state.projectMetadata.screens || {};
            state.projectMetadata.screens[file.name] = { updatedAt: new Date().toISOString() };
            await saveProjectMetadata(state.currentProject, state.projectMetadata);
        }
    }
    location.reload();
};

DOM.btnSubmitAdd.onclick = async () => {
    const screenName = DOM.newScreenName.value.trim();
    if (!screenName || !context.selectedTemplate) return await Notification.alert("입력을 확인해주세요.", "알림", "warning");
    
    const activeCard = document.querySelector('.template-card.active');
    if (activeCard) activeCard.classList.add('generating');
    
    DOM.btnSubmitAdd.innerText = "생성 중..."; 
    DOM.btnSubmitAdd.disabled = true;

    const injectData = {
        PROJECT_NAME: state.projectMetadata.title || state.currentProject,
        SCREEN_NAME: screenName,
        AUTHOR: state.projectMetadata.assignee || '담당자 미정',
        DATE: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, ''),
        VERSION: '1.0',
        JIRA: state.projectMetadata.jira || '-',
        SCREEN_PATH: `https://m.lfmall.co.kr/app/${screenName.replace('.html','')}`
    };

    if (await createScreenFromTemplate(state.currentProject, screenName, context.selectedTemplate, injectData, msg => DOM.placeholderTxt.innerText = msg)) {
        showLoading("새 화면 최종 동기화 중...");
        setTimeout(() => location.reload(), 2000);
    } else { 
        DOM.btnSubmitAdd.innerText = "화면 생성하기"; 
        DOM.btnSubmitAdd.disabled = false; 
        if (activeCard) activeCard.classList.remove('generating'); 
    }
};

if (DOM.btnBack) {
    DOM.btnBack.onclick = async (e) => {
        e.preventDefault();
        if (await checkUnsavedChanges()) {
            window.location.href = 'index.html';
        }
    };
}

if (DOM.btnCancelEdit) DOM.btnCancelEdit.onclick = () => DOM.editScreenModal?.classList.remove('active');

// Sidebar Tool Buttons Binding
DOM.sidebarToolBtns?.forEach(btn => {
    btn.onclick = () => {
        const tool = btn.dataset.tool;
        if (tool === 'text') {
            handleTextCreation();
        } else if (tool) {
            setTool(tool);
        }
    };
});
if (DOM.btnShowAuth) DOM.btnShowAuth.onclick = showAuthModal;
if (DOM.btnAuthSubmit) DOM.btnAuthSubmit.onclick = handleAuthSubmit;
if (DOM.btnAuthClose) DOM.btnAuthClose.onclick = hideAuthModal;
if (DOM.tokenInput) DOM.tokenInput.onkeyup = (e) => { if(e.key==='Enter') handleAuthSubmit(); };
if (DOM.btnCancelEdit) DOM.btnCancelEdit.onclick = () => DOM.editScreenModal?.classList.remove('active');

window.addEventListener('keydown', async e => {
    // 1. Input Protection: Ignore shortcuts when typing in inputs or contenteditable (Quill)
    if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    if(e.key === 'Escape') {
        if (await checkUnsavedChanges()) {
            window.location.href = 'index.html';
        }
    }
    
    // Global Shortcuts
    if(e.code === 'Space' && state.tool !== 'hand') { DOM.canvas.classList.add('hand-active'); DOM.iframe.style.pointerEvents = 'none'; }
    if(e.code === 'KeyV') setTool('select');
    if(e.code === 'KeyH') setTool('hand');
    if(e.code === 'KeyT') handleTextCreation();
    
    // Sidebar & Tab Shortcuts
    if(e.code === 'KeyL') toggleSidebar('left');
    if(e.code === 'KeyR') toggleSidebar('right');
    if(e.code === 'KeyF') toggleFullscreen();
    if(e.code === 'KeyE') switchSidebarTab('editor');
    if(e.code === 'KeyD') switchSidebarTab('description');
});

window.addEventListener('keyup', e => { if(e.code === 'Space' && state.tool !== 'hand') { DOM.canvas.classList.remove('hand-active'); DOM.iframe.style.pointerEvents = 'auto'; }});

// Auto re-center on browser/monitor resize (debounced 300ms)
let _resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
        centerView();
    }, 300);
});

DOM.canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const s = state.transform.scale, ns = Math.max(0.1, Math.min(s * (1 + (e.deltaY > 0 ? -0.1 : 0.1)), 20));
    const r = DOM.canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    state.transform.x = mx - (mx - state.transform.x) * (ns / s);
    state.transform.y = my - (my - state.transform.y) * (ns / s);
    state.transform.scale = ns; updateTransform();
}, {passive: false});

DOM.canvas.addEventListener('mousedown', e => { if(state.tool === 'hand' || e.button === 1 || DOM.canvas.classList.contains('hand-active')) { state.isDragging = true; state.startX = e.clientX - state.transform.x; state.startY = e.clientY - state.transform.y; e.preventDefault(); }});
window.addEventListener('mousemove', e => {
    if (state.isDragging) { state.transform.x = e.clientX - state.startX; state.transform.y = e.clientY - state.startY; updateTransform(); }
});
window.addEventListener('mouseup', () => { 
    state.isDragging = false; 
});

/**
 * Tab Switching & Atomic Components
 */
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = pane.id === `tab-${tabId}` ? 'flex' : 'none';
        pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });
}

function injectIframeInteractions(doc) {
    const style = doc.createElement('style');
    style.textContent = `
        .lf-component {
            position: absolute !important;
            box-sizing: border-box !important;
            user-select: none;
        }
        .lf-component:hover {
            outline: 2px solid #00e5ff !important;
            cursor: move !important;
        }
        .lf-component.selected {
            outline: 2px solid #00e5ff !important;
            z-index: 9999 !important;
        }
        .lf-resizer {
            width: 12px; height: 12px;
            background: #00e5ff;
            border: 2px solid #fff;
            position: absolute;
            right: -6px; bottom: -6px;
            cursor: nwse-resize !important;
            display: none;
            border-radius: 2px;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .lf-delete-trigger {
            display: none;
            position: absolute;
            top: -10px; right: -10px;
            width: 22px; height: 22px;
            background: #ef4444;
            color: #fff;
            border-radius: 50%;
            cursor: pointer;
            align-items: center; justify-content: center;
            border: 2px solid #fff;
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer,
        .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger {
            display: flex;
        }
        .lf-icon {
            background-image: url("https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png");
            background-size: 200px 160px;
            width: 40px; height: 40px;
            display: block;
            background-repeat: no-repeat;
        }
        .lf-icon-home     { background-position: -80px 0; }
        .lf-icon-category { background-position: 0 0; }
        .lf-icon-my       { background-position: -120px 0; }
        .lf-icon-heart    { background-position: -160px 0; }
        .lf-icon-search   { background-position: -80px -40px; }
        .lf-icon-cart     { background-position: -120px -40px; }
        .lf-icon-brand    { background-position: -40px 0; }
        .lf-icon-back     { background-position: 0 -40px; }
        .lf-icon-bell     { background-position: -40px -40px; }
        .lf-icon-share    { background-position: -160px -40px; }
        .lf-icon-party    { background-position: 0 -120px; }
    `;
    doc.head.appendChild(style);

    let isMoving = false, isResizing = false;
    let activeEl = null, startX, startY, startW, startH, startTop, startLeft;

    doc.addEventListener('mousedown', e => {
        if (state.tool !== 'select') return;
        const deleteBtn = e.target.closest('.lf-delete-trigger');
        const resizer = e.target.closest('.lf-resizer');
        const comp = e.target.closest('.lf-component');

        if (deleteBtn) {
            comp.remove();
            markAsDirty();
            window.postMessage({ type: 'LF_COMP_DESELECTED' }, '*');
            e.preventDefault(); e.stopPropagation();
            return;
        }
        if (resizer) {
            isResizing = true; activeEl = resizer.parentElement;
            startX = e.clientX; startY = e.clientY;
            startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
            e.preventDefault(); e.stopPropagation();
        } else if (comp) {
            isMoving = true; activeEl = comp;
            startX = e.clientX; startY = e.clientY;
            startTop = activeEl.offsetTop; startLeft = activeEl.offsetLeft;
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            activeEl.classList.add('selected');
            window.postMessage({ type: 'LF_COMP_SELECTED', id: activeEl.id, isTable: !!activeEl.querySelector('table'), isShape: !!activeEl.querySelector('.v4-shape'), isIcon: !!activeEl.querySelector('.lf-icon') }, '*');
            e.preventDefault(); e.stopPropagation();
        } else {
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            window.postMessage({ type: 'LF_COMP_DESELECTED' }, '*');
        }
    });

    doc.addEventListener('mousemove', e => {
        if (!activeEl) return;
        if (isResizing) {
            activeEl.style.width = `${startW + (e.clientX - startX)}px`;
            activeEl.style.height = `${startH + (e.clientY - startY)}px`;
        } else if (isMoving) {
            activeEl.style.top = `${startTop + (e.clientY - startY)}px`;
            activeEl.style.left = `${startLeft + (e.clientX - startX)}px`;
        }
    });

    doc.addEventListener('mouseup', () => {
        if (activeEl) markAsDirty();
        isMoving = false; isResizing = false; activeEl = null;
    });

    doc.addEventListener('keydown', e => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selected = doc.querySelector('.lf-component.selected');
            if (selected) {
                selected.remove(); markAsDirty();
                window.postMessage({ type: 'LF_COMP_DESELECTED' }, '*');
            }
        }
    });
}

function insertAtomicComponent(type, name) {
    if (ghConfig.isReadOnly) return showAuthModal();
    if (!state.activeFile) return Notification.alert("Please select a screen first.", "Notice", "warning");
    let contentHtml = '';
    const id = `lf-comp-${Date.now()}`;

    if (name === 'LF Logo') {
        contentHtml = `<img src="https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png" style="width:100%; height:auto; display:block; pointer-events:none;">`;
    } else if (name === 'Primary Button') {
        contentHtml = `<div style="background:#00e5ff; color:#000; border:none; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:bold; font-size:14px; box-shadow:0 4px 15px rgba(0,229,255,0.3); pointer-events:none;">BUTTON</div>`;
    } else if (name === 'LF Discount') {
        contentHtml = `<div style="color:#E02020; font-size:24px; font-weight:800; font-family:sans-serif; text-align:center; pointer-events:none; line-height:1.2;">20%</div>`;
    } else if (name === 'LFmall Header') {
        contentHtml = `<div style="background:#fff; width:100%; height:50px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; border-bottom: 1px solid #f2f2f2; pointer-events:none; box-sizing: border-box;"><div style="display: flex; align-items: center; width: 33%;"><div class="lf-icon lf-icon-bell" style="filter: brightness(0); transform: scale(0.65); transform-origin: left center;"></div></div><div style="display: flex; align-items: center; justify-content: center; width: 33%;"><img src="https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png" style="height: 20px;"></div><div style="display: flex; align-items: center; justify-content: flex-end; width: 33%; gap: 0px;"><div class="lf-icon lf-icon-search" style="filter: brightness(0); transform: scale(0.65); transform-origin: right center;"></div><div style="position: relative; width: 26px; height: 26px; margin-left: 8px;"><div class="lf-icon lf-icon-cart" style="filter: brightness(0); transform: scale(0.65); transform-origin: center right; position: absolute; right: 0;"></div><div style="position: absolute; top: -2px; right: -4px; background: #e60012; color: #fff; font-size: 10px; font-weight: 800; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; z-index: 2;">1</div></div></div></div>`;
    } else if (type === 'icon') {
        const iconClass = name.toLowerCase().split(' ')[0];
        contentHtml = `<div class="lf-icon lf-icon-${iconClass}" style="width:100%; height:100%; pointer-events:none; filter: brightness(0);"></div>`;
    }

    const iframeWin = DOM.iframe.contentWindow;
    const scrollY = iframeWin ? iframeWin.scrollY : 0;
    const scrollX = iframeWin ? iframeWin.scrollX : 0;
    const vh = iframeWin ? iframeWin.innerHeight : 800;
    const vw = iframeWin ? iframeWin.innerWidth : 375;
    
    const compW = name === 'LFmall Header' ? vw : (type === 'icon' ? 40 : (name === 'LF Logo' ? 60 : 120));
    const compH = name === 'LFmall Header' ? 50 : (type === 'icon' ? 40 : 100);
    
    const centerTop = Math.max(0, scrollY + (vh - compH) / 2);
    const centerLeft = Math.max(0, scrollX + (vw - compW) / 2);

    // Request insertion via message (Safe for file://)
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
        if (DOM.iframe && DOM.iframe.contentWindow) {
            DOM.iframe.contentWindow.postMessage({ 
                type: 'LF_INSERT_COMPONENT', 
                id: id, 
                html: contentHtml,
                style: {
                    top: centerTop + 'px',
                    left: centerLeft + 'px',
                    width: name === 'LFmall Header' ? '100%' : (type === 'icon' ? '40px' : (name === 'LF Logo' ? '60px' : '120px')),
                    height: name === 'LFmall Header' ? '50px' : (type === 'icon' ? '40px' : 'auto')
                }
            }, '*');
        }
        return;
    }

    const iframeDoc = DOM.iframe.contentDocument || DOM.iframe.contentWindow.document;
    if (!iframeDoc) return;
    injectIframeInteractions(iframeDoc);
    
    if (contentHtml) {
        const comp = iframeDoc.createElement('div');
        comp.id = id; comp.className = 'lf-component';
        comp.style.top = centerTop + 'px';
        comp.style.left = centerLeft + 'px';
        comp.style.width = name === 'LFmall Header' ? '100%' : (type === 'icon' ? '40px' : (name === 'LF Logo' ? '60px' : '120px'));
        comp.style.height = name === 'LFmall Header' ? '50px' : (type === 'icon' ? '40px' : 'auto');
        comp.innerHTML = `${contentHtml}<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div>`;
        iframeDoc.body.appendChild(comp);
        markAsDirty();
    }
}

// Global Delete Keyboard Handler (Parent Window)
document.addEventListener('keydown', e => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (window.location.protocol === 'file:') {
            if (DOM.iframe && DOM.iframe.contentWindow) {
                DOM.iframe.contentWindow.postMessage({ type: 'LF_DELETE_SELECTED' }, '*');
            }
            return;
        }
        const iframeDoc = DOM.iframe.contentDocument || DOM.iframe.contentWindow.document;
        if (!iframeDoc) return;
        const selected = iframeDoc.querySelector('.lf-component.selected');
        if (selected) {
            selected.remove();
            markAsDirty();
            Notification.toast("Deleted component.");
        }
    }
});

function renderAtomicLibrary() {
    const panes = {
        'atoms': document.getElementById('pane-atoms'),
        'molecules': document.getElementById('pane-molecules'),
        'organisms': document.getElementById('pane-organisms')
    };

    if (!panes.atoms) return;

    // 1. Atoms
    const atoms = [
        { name: 'LF Logo', type: 'image' },
        { name: 'Primary Button', type: 'button' },
        { name: 'LF Discount', type: 'text' },
        { name: 'LFmall Header', type: 'component' }
    ];

    panes.atoms.innerHTML = atoms.map(a => `
        <div class="library-item" onclick="insertAtomicComponent('${a.type}', '${a.name}')">
            <div class="item-preview">
                ${a.name === 'LF Logo' ? '<img src="https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png" style="width:20px; filter: brightness(0);">' : 
                  (a.name.includes('Button') ? '<div style="width:24px;height:10px;background:#000;border-radius:2px;"></div>' : 
                  '<span class="material-icons-outlined" style="font-size:18px;">extension</span>')}
            </div>
            <div class="item-name">${a.name}</div>
        </div>
    `).join('');

    // 2. Icons
    const icons = ['Home', 'Category', 'My', 'Heart', 'Search', 'Cart', 'Brand', 'Back', 'Bell', 'Share', 'Party'];
    const paneIcons = document.getElementById('pane-icons');
    if (paneIcons) {
        paneIcons.innerHTML = icons.map(i => `
            <div class="library-item" onclick="insertAtomicComponent('icon', '${i}')" style="flex: 0 0 calc(25% - 8px); height:60px;">
                <div class="item-preview">
                    <div class="lf-icon lf-icon-${i.toLowerCase()}" style="transform: scale(0.6);"></div>
                </div>
                <div class="item-name" style="font-size:9px;">${i}</div>
            </div>
        `).join('');
    }
}

async function init() {
    try {
        console.log("[INIT] Initialization started...");
        checkEnvironment();

        const params = new URLSearchParams(window.location.search);
        let project = params.get('project') || 'Default_Project';
        let fileName = params.get('file');

        state.currentProject = project;
        console.log("[INIT] Target Project:", project);

        // Fetch data
        const [contents, metadata] = await Promise.all([
            listContents(project),
            fetchProjectMetadata(project)
        ]);
        state.projectMetadata = metadata || {};
        
        const repoScreens = (contents || []).filter(i => i.type === 'file' && i.name.endsWith('.html'));
        const order = state.projectMetadata.screenOrder || [];
        const sortedScreens = repoScreens.sort((a,b) => {
            const indexA = order.indexOf(a.name);
            const indexB = order.indexOf(b.name);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        state.screens = sortedScreens;
        
        if (!fileName && state.screens.length > 0) {
            fileName = state.screens[0].name;
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('file', fileName);
            window.history.replaceState({}, '', newUrl);
        }

        renderScreenList(state.screens, fileName);
        renderAtomicLibrary();
        initQuillEditor();

        if (fileName) {
            await loadScreen(fileName);
        } else {
            DOM.placeholderTxt.innerText = "프로젝트 스크린을 추가해주세요.";
            if (DOM.btnAddScreen) DOM.btnAddScreen.classList.add('pulse-attention');
        }

        // --- ATTACH LISTENERS ---
        console.log("[INIT] Attaching event listeners...");
        
        if (DOM.btnGlobalSave) DOM.btnGlobalSave.onclick = handleGlobalSave;
        
        if (DOM.btnAddScreen) DOM.btnAddScreen.onclick = () => DOM.addScreenModal.classList.add('active');
        if (DOM.btnCancelAdd) DOM.btnCancelAdd.onclick = () => DOM.addScreenModal.classList.remove('active');
        
        if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => {
            const collapsed = DOM.sidebarLeft.classList.toggle('collapsed');
            DOM.btnToggleLeft.querySelector('span').innerText = collapsed ? 'chevron_right' : 'chevron_left';
            setTimeout(centerView, 400);
        };
        if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => {
            const collapsed = DOM.sidebarRight.classList.toggle('collapsed');
            DOM.btnToggleRight.querySelector('span').innerText = collapsed ? 'chevron_left' : 'chevron_right';
            setTimeout(centerView, 400);
        };

        // Fullscreen Toggle
        if (DOM.btnFullscreen) DOM.btnFullscreen.onclick = () => toggleFullscreen();
        if (DOM.btnFullscreenExit) DOM.btnFullscreenExit.onclick = () => toggleFullscreen(true);

        DOM.tabBtns.forEach(btn => {
            btn.onclick = () => switchTab(btn.dataset.tab);
        });

        // Shortcuts
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleGlobalSave(); }
            if (e.key === 'Escape') {
                // Fullscreen exit takes priority
                if (document.body.classList.contains('fullscreen-mode')) {
                    toggleFullscreen(true);
                    return;
                }
                DOM.addScreenModal.classList.remove('active');
                DOM.editScreenModal.classList.remove('active');
                hideAuthModal();
            }
        });

    } catch (err) {
        console.error("Initialization failed:", err);
    }
}

init();
