/**
 * vctrl_v4.js - Premium Viewer Engine (V4)
 * Ported from V3 with enhanced component support.
 */
console.log("%c [VANILLA ENGINE V4 LOADED] ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

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
    screens: [],
    get isReadOnly() { return ghConfig.isReadOnly; },
    hasUnsavedChanges: false,
    isEditing: false,
    editingIndex: -1
};

let quillEditor = null;

function initQuillEditor() {
    if (quillEditor) return;
    const container = document.getElementById('editor-container');
    if (!container) return;

    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '64px'];
    Quill.register(Size, true);

    const Align = Quill.import('attributors/style/align');
    Quill.register(Align, true);

    quillEditor = new Quill('#editor-container', {
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

    quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1) return;
        const html = quillEditor.root.innerHTML;
        const marker = document.querySelector(`.text-marker[data-index="${state.editingIndex}"]`);
        if (marker) marker.innerHTML = (html === '<p><br></p>') ? "" : html;
    });
}

function markAsDirty() {
    state.hasUnsavedChanges = true;
    const btn = document.getElementById('btn-global-save');
    if (btn) btn.style.boxShadow = "0 0 20px rgba(99, 102, 241, 0.6)";
}

function markAsClean() {
    state.hasUnsavedChanges = false;
    const btn = document.getElementById('btn-global-save');
    if (btn) btn.style.boxShadow = "";
}

const get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {} }, innerText: '', innerHTML: '', onclick: null };

const DOM = {
    iframe: get('main-iframe'),
    artboardWrapper: get('artboard-wrapper'),
    placeholder: get('placeholder'),
    canvas: get('canvas'),
    stage: get('stage'),
    zoomTxt: get('zoom-txt'),
    fileName: get('file-name-display'),
    screensList: get('screens-list'),
    descriptionList: get('description-list'),
    pinsLayer: get('pins-layer'),
    btnSelect: get('btn-select'),
    btnHand: get('btn-hand'),
    btnToggleLeft: get('btn-toggle-left'),
    btnToggleRight: get('btn-toggle-right'),
    btnGlobalSave: get('btn-global-save'),
    btnAddScreen: get('btn-add-screen'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    compActionsSection: get('comp-actions-section'),
    btnCompDelete: get('btn-comp-delete')
};

async function init() {
    try {
        const params = new URLSearchParams(window.location.search);
        state.currentProject = params.get('project') || 'Default_Project';
        let fileName = params.get('file');

        const [contents, metadata] = await Promise.all([
            listContents(state.currentProject),
            fetchProjectMetadata(state.currentProject)
        ]);

        state.projectMetadata = metadata || {};
        state.screens = (contents || []).filter(i => i.type === 'file' && i.name.endsWith('.html'));
        
        renderScreenList(state.screens, fileName);
        if (!fileName && state.screens.length > 0) fileName = state.screens[0].name;
        if (fileName) await loadScreen(fileName);

        updateProperties(); // Added: Render top bar metadata
        initQuillEditor();
        centerView();
    } catch (err) { console.error(err); }
    finally { hideLoading(); }
}

async function loadScreen(fileName) {
    if (state.isEditing) closeActiveEditor(true);
    showLoading("Loading V4: " + fileName);
    
    // Hide placeholder when loading a screen
    if (DOM.placeholder) DOM.placeholder.style.display = 'none';

    const content = await fetchProjectFileContent(state.currentProject, fileName);
    DOM.iframe.srcdoc = content;
    DOM.iframe.style.display = 'block';
    DOM.iframe.onload = () => {
        hideLoading();
        injectIframeInteractions(DOM.iframe.contentDocument);
    };

    let scMeta = (state.projectMetadata.screens || {})[fileName] || { description: [] };
    state.activeFile = { name: fileName, meta: scMeta };
    DOM.fileName.innerText = state.projectMetadata.title || state.currentProject;
    renderDescriptionList();
    updateProperties(); // Added: Update top bar on screen load
}

function injectIframeInteractions(doc) {
    if (!doc) return;
    const style = doc.createElement('style');
    style.textContent = `
        .lf-component { position: absolute !important; box-sizing: border-box !important; user-select: none; }
        .lf-component:hover { outline: 2px solid #6366f1 !important; cursor: move !important; }
        .lf-component.selected { outline: 2px solid #6366f1 !important; z-index: 9999 !important; }
        .lf-resizer { width: 12px; height: 12px; background: #6366f1; border: 2px solid #fff; position: absolute; right: -6px; bottom: -6px; cursor: nwse-resize !important; display: none; border-radius: 2px; }
        .lf-delete-trigger { display: none; position: absolute; top: -10px; right: -10px; width: 22px; height: 22px; background: #ef4444; color: #fff; border-radius: 50%; cursor: pointer; align-items: center; justify-content: center; border: 2px solid #fff; z-index: 10001; font-size: 14px; font-weight: bold; }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer, .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
        
        /* Table Internal Styles */
        .v4-premium-table { width: 100%; border-collapse: collapse; background: rgba(0,0,0,0.8); color: white; font-family: 'Inter', sans-serif; border-radius: 8px; overflow: hidden; }
        .v4-premium-table th { background: rgba(99,102,241,0.2); padding: 12px; text-align: left; font-size: 12px; color: #6366f1; }
        .v4-premium-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .v4-editable-cell:focus { outline: 2px solid #6366f1; background: rgba(99,102,241,0.1); }
    `;
    doc.head.appendChild(style);

    let isMoving = false, isResizing = false;
    let activeEl = null, startX, startY, startW, startH, startTop, startLeft;

    doc.addEventListener('mousedown', e => {
        if (state.tool !== 'select') return;
        
        // If clicking an editable cell, don't start dragging
        if (e.target.classList.contains('v4-editable-cell')) return;

        const deleteBtn = e.target.closest('.lf-delete-trigger');
        const resizer = e.target.closest('.lf-resizer');
        const comp = e.target.closest('.lf-component');

        if (deleteBtn) {
            comp.remove(); markAsDirty(); e.preventDefault(); return;
        }
        if (resizer) {
            isResizing = true; activeEl = resizer.parentElement;
            startX = e.clientX; startY = e.clientY;
            startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
            e.preventDefault();
        } else if (comp) {
            isMoving = true; activeEl = comp;
            startX = e.clientX; startY = e.clientY;
            startTop = activeEl.offsetTop; startLeft = activeEl.offsetLeft;
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            activeEl.classList.add('selected');
            window.postMessage({ type: 'LF_COMP_SELECTED' }, '*');
            e.preventDefault();
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
}

function insertV4ComponentById(compId) {
    const item = window.V4_COMPONENT_LIBRARY.atoms.concat(window.V4_COMPONENT_LIBRARY.molecules).find(i => i.id === compId);
    if (!item) return;

    const iframeDoc = DOM.iframe.contentDocument || DOM.iframe.contentWindow.document;
    const id = `v4-comp-${Date.now()}`;
    const comp = iframeDoc.createElement('div');
    comp.id = id; comp.className = 'lf-component';
    comp.style.top = '100px'; comp.style.left = '100px';
    comp.innerHTML = `${item.html}<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div>`;
    iframeDoc.body.appendChild(comp);
    markAsDirty();
}

// Reuse original helpers
function centerView() {
    const iw = 1440, ih = 900;
    const cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    let s = Math.min((cw * 0.95) / iw, (ch * 0.95) / ih, 1);
    state.transform = { x: (cw - (iw * s)) / 2, y: (ch - (ih * s)) / 2, scale: s };
    updateTransform();
}
function updateTransform() {
    DOM.stage.style.transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
    DOM.zoomTxt.innerText = Math.round(state.transform.scale * 100) + '%';
}
function adjustZoom(delta) { state.transform.scale *= (1 + delta); updateTransform(); }
function showLoading(txt) { document.getElementById('loading-overlay').classList.remove('fade-out'); }
function hideLoading() { document.getElementById('loading-overlay').classList.add('fade-out'); }

// Tab/Sidebar logic
DOM.tabBtns.forEach(btn => btn.onclick = () => {
    DOM.tabBtns.forEach(b => b.classList.toggle('active', b === btn));
    DOM.tabPanes.forEach(p => p.style.display = p.id === `tab-${btn.dataset.tab}` ? 'flex' : 'none');
});

function renderScreenList(screens, activeName) {
    DOM.screensList.innerHTML = '';
    screens.forEach(s => {
        const div = document.createElement('div');
        div.className = `screen-item ${s.name === activeName ? 'active' : ''}`;
        div.innerHTML = `<span class="screen-name">${s.name}</span>`;
        div.onclick = () => {
            const url = `viewer_v4.html?project=${state.currentProject}&file=${s.name}`;
            history.pushState(null, '', url);
            loadScreen(s.name);
            document.querySelectorAll('.screen-item').forEach(i => i.classList.remove('active'));
            div.classList.add('active');
        };
        DOM.screensList.appendChild(div);
    });
}

function renderDescriptionList() {
    if (!state.activeFile) return;
    const list = state.activeFile.meta.description || [];
    DOM.pinsLayer.innerHTML = '';
    list.forEach((item, index) => {
        const pin = document.createElement('div');
        pin.className = 'text-marker';
        pin.innerHTML = item.html || item.text || '';
        pin.style.left = item.x + "%"; pin.style.top = item.y + "%";
        DOM.pinsLayer.appendChild(pin);
    });
}

function updateProperties() {
    if (!state.activeFile || !state.projectMetadata) return;
    const pm = state.projectMetadata;
    const metadataPanel = document.getElementById('top-metadata-panel');
    if (!metadataPanel) return;

    metadataPanel.innerHTML = `
        <div class="form-group-inline"><label class="form-label">프로젝트명</label><input type="text" value="${pm.title || ''}" disabled></div>
        <div class="form-group-inline"><label class="form-label">담당자</label><input type="text" value="${pm.assignee || ''}" disabled></div>
        <div class="form-group-inline"><label class="form-label">기간</label><input type="text" value="${pm.period || ''}" disabled></div>
        <div class="form-group-inline"><label class="form-label">JIRA</label><input type="text" value="${pm.jira || ''}" disabled></div>
    `;
}

// Legacy Insertion Support
function insertAtomicComponent(type, name) {
    // Basic support for legacy items
    if (name === 'LF Logo') insertV4ComponentById('lf-logo');
}

init();
window.centerView = centerView;
window.adjustZoom = adjustZoom;
window.setDeviceViewport = (type, w, h) => {
    DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px';
    setTimeout(centerView, 100);
};
window.insertV4ComponentById = insertV4ComponentById;
window.insertAtomicComponent = insertAtomicComponent;
