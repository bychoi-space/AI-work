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
        .v4-premium-table { width: 100%; border-collapse: collapse; background: #1e293b; color: #f8fafc; font-family: 'Inter', sans-serif; border-radius: 8px; overflow: hidden; transition: all 0.2s; border: 1px solid #475569; }
        .v4-premium-table th { background: #4f46e5; padding: 12px; text-align: left; font-size: 12px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .v4-premium-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .v4-editable-cell:focus { outline: 2px solid #6366f1; background: rgba(99,102,241,0.1); }
        
        /* Drag Handle Style Injected */
        .lf-drag-handle { position: absolute; top: -28px; left: 0; width: 32px; height: 28px; background: #6366f1; color: #fff; display: none; align-items: center; justify-content: center; cursor: move !important; border-radius: 8px 8px 0 0; z-index: 10001; transition: background 0.2s; }
        .lf-drag-handle:hover { background: #4f46e5; }
        .lf-drag-handle svg { width: 16px; height: 16px; fill: currentColor; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { display: flex; }
        
        .lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 10001; font-size: 14px; font-weight: bold; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); }
        .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
    `;
    doc.head.appendChild(style);

    let isMoving = false, isResizing = false;
    let activeEl = null, startX, startY, startW, startH, startTop, startLeft;

    doc.addEventListener('mousedown', e => {
        if (state.tool !== 'select') return;
        
        const deleteBtn = e.target.closest('.lf-delete-trigger');
        const resizer = e.target.closest('.lf-resizer');
        const handle = e.target.closest('.lf-drag-handle');
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
            // Select the component even if it's an editable cell
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            comp.classList.add('selected');
            
            window.postMessage({ 
                type: 'LF_COMP_SELECTED', 
                id: comp.id,
                isTable: !!comp.querySelector('table'),
                isShape: comp.querySelector('.v4-shape') !== null
            }, '*');

            // Only start moving if it's the handle OR not an editable cell
            if (handle || !e.target.classList.contains('v4-editable-cell')) {
                isMoving = true; activeEl = comp;
                startX = e.clientX; startY = e.clientY;
                startTop = activeEl.offsetTop; startLeft = activeEl.offsetLeft;
                e.preventDefault();
            }
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
    
    // Set initial size for shapes
    if (item.category === 'Shapes') {
        comp.style.width = item.id === 'v4-shape-rect' ? '240px' : (item.id === 'v4-shape-circle' ? '180px' : '200px');
        comp.style.height = item.id === 'v4-shape-rect' ? '140px' : (item.id === 'v4-shape-circle' ? '180px' : '180px');
    }
    
    comp.innerHTML = `
        <div class="lf-drag-handle">
            <svg viewBox="0 0 24 24"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
        </div>
        ${item.html}
        <div class="lf-resizer"></div>
        <div class="lf-delete-trigger">×</div>
    `;
    iframeDoc.body.appendChild(comp);

    // Auto-apply current inspector defaults for new tables/shapes
    const table = comp.querySelector('table');
    const shape = comp.querySelector('.v4-shape');

    if (table) {
        table.style.background = document.getElementById('table-bg-color').value;
        table.style.color = document.getElementById('table-text-color').value;
        table.style.borderColor = document.getElementById('table-border-color').value;
        table.querySelectorAll('th').forEach(th => {
            th.style.background = document.getElementById('table-header-color').value;
            th.style.color = document.getElementById('table-header-text-color').value;
            th.style.borderBottomColor = document.getElementById('table-border-color').value;
        });
        table.querySelectorAll('td').forEach(td => {
            td.style.color = document.getElementById('table-text-color').value;
            td.style.borderBottomColor = document.getElementById('table-border-color').value;
            td.style.fontSize = document.getElementById('table-font-size').value + 'px';
        });
    } else if (shape) {
        shape.style.background = document.getElementById('shape-bg-color').value;
        shape.style.borderColor = document.getElementById('shape-border-color').value;
        const editCell = shape.querySelector('.v4-editable-cell');
        if (editCell) {
            editCell.style.color = document.getElementById('shape-text-color').value;
            editCell.style.fontSize = document.getElementById('shape-font-size').value + 'px';
        }
    }

    // Trigger selection message to parent to show the inspector immediately
    window.postMessage({ 
        type: 'LF_COMP_SELECTED', 
        id: comp.id,
        isTable: !!table,
        isShape: !!shape
    }, '*');

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

// Selection & Inspector Logic
window.addEventListener('message', e => {
    const data = e.data;
    if (data.type === 'LF_COMP_SELECTED') {
        if (data.isTable) {
            document.getElementById('table-inspector-section').style.display = 'block';
            document.getElementById('shape-inspector-section').style.display = 'none';
            document.getElementById('text-editor-section').style.display = 'none';
            const iframeDoc = DOM.iframe.contentDocument;
            const table = iframeDoc.getElementById(data.id).querySelector('table');
            if (table) {
                const currentFontSize = window.getComputedStyle(table.querySelector('td') || table).fontSize;
                document.getElementById('table-font-size').value = parseInt(currentFontSize);
                document.getElementById('txt-font-size').innerText = parseInt(currentFontSize);
            }
        } else if (data.isShape) {
            document.getElementById('shape-inspector-section').style.display = 'block';
            document.getElementById('table-inspector-section').style.display = 'none';
            document.getElementById('text-editor-section').style.display = 'none';
        } else {
            document.getElementById('table-inspector-section').style.display = 'none';
            document.getElementById('shape-inspector-section').style.display = 'none';
            document.getElementById('text-editor-section').style.display = 'block';
        }
    } else if (data.type === 'LF_COMP_DESELECTED') {
        document.getElementById('table-inspector-section').style.display = 'none';
        document.getElementById('shape-inspector-section').style.display = 'none';
        document.getElementById('text-editor-section').style.display = 'none';
    }
});

// Table Inspector Events
document.getElementById('table-font-size').oninput = function() {
    const val = this.value;
    document.getElementById('txt-font-size').innerText = val;
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (selected) {
        selected.querySelectorAll('td, th').forEach(cell => cell.style.fontSize = val + 'px');
        markAsDirty();
    }
};

document.getElementById('table-text-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (selected) {
        selected.style.color = this.value;
        selected.querySelectorAll('td, th').forEach(cell => cell.style.color = this.value);
        markAsDirty();
    }
};

document.getElementById('table-bg-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (selected) {
        selected.style.background = this.value;
        markAsDirty();
    }
};

document.getElementById('table-header-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (selected) {
        selected.querySelectorAll('th').forEach(th => th.style.background = this.value);
        markAsDirty();
    }
};

document.getElementById('table-header-text-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (selected) {
        selected.querySelectorAll('th').forEach(th => th.style.color = this.value);
        markAsDirty();
    }
};

document.getElementById('table-border-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (selected) {
        selected.style.borderColor = this.value;
        selected.querySelectorAll('th').forEach(th => th.style.borderBottomColor = this.value);
        selected.querySelectorAll('td').forEach(td => td.style.borderBottomColor = this.value);
        markAsDirty();
    }
};

// Row/Column Actions
document.getElementById('btn-add-row').onclick = function() {
    const table = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (!table) return;
    const tbody = table.querySelector('tbody') || table;
    const colCount = (table.querySelector('tr') || { cells: [] }).cells.length || 3;
    const tr = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
        const td = document.createElement('td');
        td.contentEditable = "true";
        td.className = "v4-editable-cell";
        td.innerText = "New Cell";
        // Apply current text color
        td.style.color = document.getElementById('table-text-color').value;
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
    markAsDirty();
};

document.getElementById('btn-del-row').onclick = function() {
    const table = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length > 0) {
        rows[rows.length - 1].remove();
        markAsDirty();
    }
};

document.getElementById('btn-add-col').onclick = function() {
    const table = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (!table) return;
    const theadRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (theadRow) {
        const th = document.createElement('th');
        th.contentEditable = "true";
        th.className = "v4-editable-cell";
        th.innerText = "Header";
        th.style.background = document.getElementById('table-header-color').value;
        th.style.color = document.getElementById('table-header-text-color').value;
        theadRow.appendChild(th);
    }
    table.querySelectorAll('tbody tr').forEach(tr => {
        const td = document.createElement('td');
        td.contentEditable = "true";
        td.className = "v4-editable-cell";
        td.innerText = "-";
        td.style.color = document.getElementById('table-text-color').value;
        tr.appendChild(td);
    });
    markAsDirty();
};

document.getElementById('btn-del-col').onclick = function() {
    const table = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (!table) return;
    table.querySelectorAll('tr').forEach(tr => {
        if (tr.cells.length > 1) {
            tr.cells[tr.cells.length - 1].remove();
        }
    });
    markAsDirty();
};

document.getElementById('btn-toggle-header-mode').onclick = function() {
    const table = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (!table) return;
    
    // Check current state: if thead has cells, it's TOP mode. If not, maybe LEFT mode.
    const thead = table.querySelector('thead');
    const hasTopHeader = thead && thead.querySelectorAll('th').length > 0;
    
    if (hasTopHeader) {
        // Switch to LEFT mode: 
        // 1. Move all th in thead to the first column of each row in tbody
        const headerCells = Array.from(thead.querySelectorAll('th'));
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        // Remove thead
        thead.remove();
        
        // Create a new th for each row or convert first td to th
        rows.forEach((tr, idx) => {
            const firstCell = tr.cells[0];
            const newTh = document.createElement('th');
            newTh.contentEditable = "true";
            newTh.className = "v4-editable-cell";
            newTh.innerHTML = firstCell.innerHTML;
            newTh.style.background = document.getElementById('table-header-color').value;
            newTh.style.color = document.getElementById('table-header-text-color').value;
            tr.replaceChild(newTh, firstCell);
        });
    } else {
        // Switch to TOP mode:
        // 1. Convert first th of each row to td
        // 2. Add a new thead with th cells
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return;
        
        const newThead = document.createElement('thead');
        const headerTr = document.createElement('tr');
        const colCount = rows[0].cells.length;
        
        for (let i = 0; i < colCount; i++) {
            const th = document.createElement('th');
            th.contentEditable = "true";
            th.className = "v4-editable-cell";
            th.innerText = "Header";
            th.style.background = document.getElementById('table-header-color').value;
            th.style.color = document.getElementById('table-header-text-color').value;
            headerTr.appendChild(th);
        }
        newThead.appendChild(headerTr);
        table.prepend(newThead);
        
        // Convert any th in tbody to td
        table.querySelectorAll('tbody th').forEach(th => {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.className = "v4-editable-cell";
            td.innerHTML = th.innerHTML;
            td.style.color = document.getElementById('table-text-color').value;
            th.parentElement.replaceChild(td, th);
        });
    }
    markAsDirty();
};

document.getElementById('btn-clear-header').onclick = function() {
    const table = DOM.iframe.contentDocument.querySelector('.lf-component.selected table');
    if (!table) return;
    
    // Remove thead if exists
    const thead = table.querySelector('thead');
    if (thead) thead.remove();
    
    // Convert all th to td
    table.querySelectorAll('th').forEach(th => {
        const td = document.createElement('td');
        td.contentEditable = "true";
        td.className = "v4-editable-cell";
        td.innerHTML = th.innerHTML;
        td.style.color = document.getElementById('table-text-color').value;
        th.parentElement.replaceChild(td, th);
    });
    markAsDirty();
};

// Shape Inspector Logic
document.getElementById('shape-font-size').oninput = function() {
    const val = this.value;
    document.getElementById('txt-shape-font-size').innerText = val;
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
    if (selected) {
        const editCell = selected.querySelector('.v4-editable-cell');
        if (editCell) editCell.style.fontSize = val + 'px';
        markAsDirty();
    }
};

document.getElementById('shape-text-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
    if (selected) {
        const editCell = selected.querySelector('.v4-editable-cell');
        if (editCell) editCell.style.color = this.value;
        markAsDirty();
    }
};

document.getElementById('shape-bg-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
    if (selected) {
        selected.style.background = this.value;
        // Special case for triangle
        if (selected.classList.contains('v4-shape-triangle')) {
            selected.style.backgroundColor = this.value;
        }
        markAsDirty();
    }
};

document.getElementById('shape-border-color').oninput = function() {
    const selected = DOM.iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
    if (selected) {
        selected.style.borderColor = this.value;
        markAsDirty();
    }
};

init();
window.centerView = centerView;
window.adjustZoom = adjustZoom;
window.setDeviceViewport = (type, w, h) => {
    DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px';
    setTimeout(centerView, 100);
};
window.insertV4ComponentById = insertV4ComponentById;
window.insertAtomicComponent = insertAtomicComponent;
