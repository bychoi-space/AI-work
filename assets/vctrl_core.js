/**
 * vctrl_core.js - Central Orchestrator for LF Editor Studio
 * Responsibility: State management, Message routing, Save/Load orchestration.
 */

console.log("%c [VCTRL CORE] Initializing Engine... ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 1. Global State Management (SSOT)
window.state = {
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
    get isReadOnly() { return (window.ghConfig && window.ghConfig.isReadOnly) || false; },
    hasUnsavedChanges: false,
    isEditing: false,
    editingIndex: -1
};

// --- Core Constants for V4 Injection ---
const v4Styles = `
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
    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;
        if (d.type === 'LF_REQUEST_SAVE_CONTENT') {
            const c = document.documentElement.cloneNode(true);
            c.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
            c.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
            notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: "<!DOCTYPE html>\\n" + c.outerHTML });
        } else if (d.type === 'LF_INSERT_COMPONENT') {
            const host = document.querySelector('.mobile-content') || document.body;
            const isMobileHost = host !== document.body;
            const vh = isMobileHost ? host.clientHeight : window.innerHeight;
            const vw = isMobileHost ? host.clientWidth : window.innerWidth;
            const sY = isMobileHost ? host.scrollTop : window.scrollY;
            const sX = isMobileHost ? host.scrollLeft : window.scrollX;
            const compW = (d.style && d.style.width && d.style.width !== '100%') ? parseInt(d.style.width) || 200 : (d.style && d.style.width === '100%' ? vw : 200);
            const compH = (d.style && d.style.height && d.style.height !== 'auto') ? parseInt(d.style.height) || 100 : 100;
            const centerTop = Math.max(isMobileHost ? 56 : 0, sY + (vh - compH) / 2);
            const centerLeft = Math.max(isMobileHost ? 16 : 0, sX + (vw - compW) / 2);
            const v = document.createElement('div'); v.id = d.id || ('v4-comp-' + Date.now()); v.className = 'lf-component'; v.style.position = 'absolute'; v.style.top = centerTop + 'px'; v.style.left = centerLeft + 'px'; v.style.zIndex = '1000';
            if (d.style) Object.assign(v.style, d.style);
            if (isMobileHost) {
                v.style.top = centerTop + 'px';
                v.style.left = d.style && d.style.width === '100%' ? '0px' : centerLeft + 'px';
                if (d.style && d.style.width === '100%') v.style.width = '100%';
            }
            v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + d.html + '<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div>';
            host.appendChild(v);
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected')); v.classList.add('selected');
            notifyParent({ type: 'LF_COMP_SELECTED', id: v.id, isTable: !!v.querySelector('table'), isShape: !!v.querySelector('.v4-shape'), isIcon: !!v.querySelector('.lf-icon') });
            markDirty();
        } else if (d.type === 'LF_UPDATE_STYLE') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            const t = d.selector ? s.querySelector(d.selector) : s; if (!t) return;
            if (d.style) Object.assign(t.style, d.style);
            markDirty();
        } else if (d.type === 'LF_DELETE_SELECTED') {
            const s = document.querySelector('.lf-component.selected'); if (s) { s.remove(); markDirty(); }
        } else if (d.type === 'LF_DESELECT_ALL') {
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
        }
    });
})();
`;

// --- Core Logic ---
window.loadScreen = async function(fileName) {
    if (state.isEditing && typeof window.closeActiveEditor === 'function') {
        window.closeActiveEditor(true);
    }
    
    if (typeof window.showLoading === 'function') window.showLoading("Loading: " + fileName);
    if (DOM.placeholder) DOM.placeholder.style.display = 'none';
    
    const content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        if (DOM.placeholder) DOM.placeholder.style.display = 'flex';
        if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "파일을 불러오지 못했습니다.";
        return;
    }

    let finalContent = content;
    
    // Inject Styles
    if (!finalContent.includes('style_v4.css') && !finalContent.includes('/* V4 Premium Styles (Inlined) */')) {
        const styleBlock = `<style id="v4-inlined-style">\n${v4Styles}\n</style>`;
        finalContent = finalContent.replace('</head>', `${styleBlock}\n</head>`);
    }
    // Inject Script
    if (!finalContent.includes('vctrl_v4_iframe.js') && !finalContent.includes('LF_SAVE_CONTENT_RESPONSE')) {
        const scriptBlock = `<script id="v4-inlined-script">\n${v4Script}\n</script>`;
        finalContent = finalContent.replace('</body>', `${scriptBlock}\n</body>`);
    }

    // Auto-update JIRA IDENTIFIER for Cover Template
    if (finalContent.includes('cover-jira-id')) {
        const jiraValue = state.projectMetadata.jira || '-';
        finalContent = finalContent.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, `$1${jiraValue}$2`);
    }

    if (DOM.iframe) {
        DOM.iframe.srcdoc = finalContent;
        DOM.iframe.style.display = 'block';
    }

    const loadTimeout = setTimeout(() => {
        if (typeof window.hideLoading === 'function') window.hideLoading();
    }, 3000);

    DOM.iframe.onload = () => {
        clearTimeout(loadTimeout);
        if (typeof window.hideLoading === 'function') window.hideLoading();
        DOM.iframe.onload = null;
    };

    let scMeta = (state.projectMetadata.screens || {})[fileName] || {};
    if (!scMeta.description) scMeta.description = [];

    state.activeFile = { 
        name: fileName, 
        size: (content.length / 1024).toFixed(1) + ' KB',
        meta: scMeta
    };
    
    if (DOM.fileName) DOM.fileName.innerText = state.projectMetadata.title || state.currentProject;
    
    if (typeof window.renderDescriptionList === 'function') window.renderDescriptionList();
    if (typeof window.updateProperties === 'function') window.updateProperties(); 
    
    if (scMeta.defaultTab === 'description') {
        if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab('description');
    } else {
        if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab('editor'); 
    }
    
    setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 150);
};

window.injectIframeInteractions = function(doc) {
    const style = doc.createElement('style');
    style.textContent = `
        .lf-component { position: absolute !important; box-sizing: border-box !important; user-select: none; }
        .lf-component:hover { outline: 2px solid #00e5ff !important; cursor: pointer !important; }
        .lf-component.selected { outline: 2px solid #00e5ff !important; z-index: 9999 !important; }
        .lf-resizer { width: 12px; height: 12px; background: #00e5ff; border: 2px solid #fff; position: absolute; right: -6px; bottom: -6px; cursor: nwse-resize !important; display: none; border-radius: 2px; z-index: 10000; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
        .lf-delete-trigger { display: none; position: absolute; top: -10px; right: -10px; width: 22px; height: 22px; background: #ef4444; color: #fff; border-radius: 50%; cursor: pointer; align-items: center; justify-content: center; border: 2px solid #fff; z-index: 10001; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer, .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: #6366f1; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; border: 2px solid #fff; z-index: 10001; font-size: 12px; font-weight: 700; }
    `;
    doc.head.appendChild(style);

    let isMoving = false, isResizing = false, activeEl = null, startX, startY, startW, startH, startTop, startLeft;

    doc.addEventListener('mousedown', e => {
        if (state.tool !== 'select') return;
        const deleteBtn = e.target.closest('.lf-delete-trigger');
        const resizer = e.target.closest('.lf-resizer');
        const dragHandle = e.target.closest('.lf-drag-handle');
        const comp = e.target.closest('.lf-component');

        if (deleteBtn && comp) {
            comp.remove(); markAsDirty();
            window.postMessage({ type: 'LF_DESELECT' }, '*');
            e.preventDefault(); e.stopPropagation();
            return;
        }
        if (resizer) {
            isResizing = true; activeEl = resizer.parentElement;
            startX = e.clientX; startY = e.clientY; startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
            e.preventDefault(); e.stopPropagation();
        } else if (dragHandle) {
            isMoving = true; activeEl = dragHandle.closest('.lf-component');
            startX = e.clientX; startY = e.clientY; startTop = activeEl.offsetTop; startLeft = activeEl.offsetLeft;
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            activeEl.classList.add('selected');
            window.postMessage({ type: 'LF_COMP_SELECTED', id: activeEl.id, isTable: !!activeEl.querySelector('table'), isShape: !!activeEl.querySelector('.v4-shape'), isIcon: !!activeEl.querySelector('.lf-icon') }, '*');
            e.preventDefault(); e.stopPropagation();
        } else if (comp) {
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            comp.classList.add('selected');
            window.postMessage({ type: 'LF_COMP_SELECTED', id: comp.id, isTable: !!comp.querySelector('table'), isShape: !!comp.querySelector('.v4-shape'), isIcon: !!comp.querySelector('.lf-icon') }, '*');
        } else {
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            window.postMessage({ type: 'LF_DESELECT' }, '*');
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

    doc.addEventListener('mouseup', () => { if (activeEl) markAsDirty(); isMoving = false; isResizing = false; activeEl = null; });
};

window.insertAtomicComponent = function(type, name) {
    if (state.isReadOnly) return window.showAuthModal?.();
    if (!state.activeFile) return window.Notification?.alert("Please select a screen first.", "Notice", "warning");
    
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

    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
        if (DOM.iframe && DOM.iframe.contentWindow) {
            MessageHub.send(DOM.iframe.contentWindow, 'LF_INSERT_COMPONENT', { id, html: contentHtml, style: { width: '120px', height: '100px' } });
        }
        return;
    }

    const iframeDoc = DOM.iframe.contentDocument || DOM.iframe.contentWindow.document;
    if (!iframeDoc) return;
    injectIframeInteractions(iframeDoc);
    const host = iframeDoc.querySelector('.mobile-content') || iframeDoc.body;
    
    if (contentHtml) {
        const comp = iframeDoc.createElement('div');
        comp.id = id; comp.className = 'lf-component';
        comp.style.width = '120px'; comp.style.height = '100px';
        comp.innerHTML = `${contentHtml}<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div><div class="lf-drag-handle">::</div>`;
        host.appendChild(comp);
        markAsDirty();
    }
};

window.getCascadedPosition = function(startX = 50, startY = 50) {
    let x = startX, y = startY;
    const step = 3;
    const list = state.activeFile?.meta.description || [];
    let isOccupied = true;
    let attempts = 0;
    while (isOccupied && attempts < 15) {
        isOccupied = list.some(item => item.type === 'text' && Math.abs(item.x - x) < 1 && Math.abs(item.y - y) < 1);
        if (isOccupied) { x += step; y += step; attempts++; if (x > 95 || y > 95) { x = startX; y = startY; break; } }
    }
    return { x, y };
};

window.handleTextCreation = function() {
    if (state.isReadOnly) return window.showAuthModal?.();
    if (!state.activeFile) return window.Notification?.alert("스크린을 선택해주세요.", "알림", "warning");
    const { x, y } = getCascadedPosition(50, 50);
    const newIdx = state.activeFile.meta.description.length;
    state.activeFile.meta.description.push({ html: "", text: "", x, y, type: 'text', color: "#000000" });
    markAsDirty();
    if (typeof window.renderDescriptionList === 'function') window.renderDescriptionList();
    setTimeout(() => { if (typeof window.spawnTextEditor === 'function') window.spawnTextEditor(x, y, newIdx); }, 50);
};

window.getIframeHTML = async function() {
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

    return new Promise((resolve) => {
        const handler = (e) => {
            if (e.data.type === 'LF_SAVE_CONTENT_RESPONSE') {
                window.removeEventListener('message', handler);
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
        setTimeout(() => {
            window.removeEventListener('message', handler);
            resolve(null);
        }, 2500);
    });
};

window.handleGlobalSave = async function() {
    try {
        if (state.isReadOnly) return window.showAuthModal?.();
        
        if (state.isEditing && typeof window.closeActiveEditor === 'function') {
            window.closeActiveEditor(true);
        }
        
        const btn = DOM.btnGlobalSave;
        if (!btn) return;

        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">save</span> 저장 중...<span id="save-loading-bar" style="position:absolute; left:0; bottom:0; height:3px; width:0%; background:rgba(255,255,255,0.9); border-radius:0 0 8px 8px; transition:width 2.5s cubic-bezier(0.4,0,0.2,1);"></span>`;
        
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

        let htmlContent = await getIframeHTML();
        
        if (htmlContent && htmlContent.includes('cover-jira-id')) {
            const jiraValue = projectMeta.jira || '-';
            htmlContent = htmlContent.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, `$1${jiraValue}$2`);
        }

        const activeFileName = state.activeFile ? state.activeFile.name : null;

        const success = await updateScreenMetadata(state.currentProject, activeFileName, { 
            projectMeta, 
            htmlContent,
            description: state.activeFile ? state.activeFile.meta.description : []
        }, () => {});

        const bar = document.getElementById('save-loading-bar');
        if (bar) { bar.style.transition = 'width 0.3s ease'; bar.style.width = '100%'; }

        await new Promise(r => setTimeout(r, 350));

        if (success) {
            markAsClean();
            Object.assign(state.projectMetadata, projectMeta);
            if (projectMeta.title && DOM.fileName) DOM.fileName.innerText = projectMeta.title;
            
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
        if (window.Notification) window.Notification.alert('저장 중 오류가 발생했습니다: ' + err.message, '오류', 'error');
    }
};

// --- State Management ---
window.MessageHub = {
    handlers: {},
    
    register(type, callback) {
        if (this.handlers[type]) {
            console.warn(`[MessageHub] Handler for "${type}" is being overwritten.`);
        }
        this.handlers[type] = callback;
    },

    init() {
        window.addEventListener('message', (e) => {
            const data = e.data;
            if (!data || !data.type) return;
            
            if (window.DEBUG_MODE) {
                console.log(`%c[MessageHub] IN: ${data.type}`, "color: #10b981;", data);
            }

            if (this.handlers[data.type]) {
                try {
                    this.handlers[data.type](data);
                } catch (err) {
                    console.error(`[MessageHub] Error in handler for "${data.type}":`, err);
                }
            }
        });
        console.log("[MessageHub] Central message listener active.");
    },

    send(targetWindow, type, data = {}) {
        if (!targetWindow || !targetWindow.postMessage) {
            console.error("[MessageHub] Invalid target for postMessage.");
            return;
        }
        if (window.DEBUG_MODE) {
            console.log(`%c[MessageHub] OUT: ${type}`, "color: #3b82f6;", data);
        }
        targetWindow.postMessage({ type, ...data }, '*');
    }
};

// 3. Central Event Helpers
window.markAsDirty = function() {
    if (state.hasUnsavedChanges) return;
    state.hasUnsavedChanges = true;
    console.log("[Status] Unsaved changes detected.");
    
    // UI Feedback (Will be managed by vctrl_inspector eventually)
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) {
        btnSave.style.boxShadow = "0 0 20px rgba(0, 229, 255, 0.6)";
    }
};

window.markAsClean = function() {
    state.hasUnsavedChanges = false;
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) {
        btnSave.style.boxShadow = "";
    }
};

// 5. Navigation Protection
window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

window.checkUnsavedChanges = async function() {
    if (!state.hasUnsavedChanges) return true;
    const confirmed = await Notification.confirm(
        "저장되지 않은 수정사항이 있습니다. 무시하고 이동하시겠습니까?", 
        "알림", 
        "warning"
    );
    if (confirmed) {
        markAsClean();
        return true;
    }
    return false;
};

// 6. Initial Bootstrap
window.checkEnvironment = function() {
    if (window.location.protocol === 'file:') {
        console.warn("[ENV] Running on file:// protocol. Direct iframe DOM access is blocked. Using MessageHub.");
    }
};

window.init = async function() {
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

        if (typeof renderScreenList === 'function') renderScreenList(state.screens, fileName);
        if (typeof renderAtomicLibrary === 'function') renderAtomicLibrary();
        if (typeof initQuillEditor === 'function') initQuillEditor();

        if (fileName) {
            await loadScreen(fileName);
        } else {
            if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "프로젝트 스크린을 추가해주세요.";
            if (DOM.btnAddScreen) DOM.btnAddScreen.classList.add('pulse-attention');
        }

        // --- ATTACH GLOBAL LISTENERS ---
        console.log("[INIT] Attaching global listeners...");
        if (DOM.btnGlobalSave) DOM.btnGlobalSave.onclick = handleGlobalSave;
        
        if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => {
            const collapsed = DOM.sidebarLeft.classList.toggle('collapsed');
            DOM.btnToggleLeft.querySelector('span').innerText = collapsed ? 'chevron_right' : 'chevron_left';
            setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 400);
        };
        if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => {
            const collapsed = DOM.sidebarRight.classList.toggle('collapsed');
            DOM.btnToggleRight.querySelector('span').innerText = collapsed ? 'chevron_left' : 'chevron_right';
            setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 400);
        };

        if (DOM.btnFullscreen) DOM.btnFullscreen.onclick = () => { if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(); };
        if (DOM.btnFullscreenExit) DOM.btnFullscreenExit.onclick = () => { if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true); };

        DOM.tabBtns.forEach(btn => {
            btn.onclick = () => { if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab(btn.dataset.tab); };
        });

        // Shortcuts
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleGlobalSave(); }
            if (e.key === 'Escape') {
                if (document.body.classList.contains('fullscreen-mode')) {
                    if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true);
                    return;
                }
                if (DOM.addScreenModal) DOM.addScreenModal.classList.remove('active');
                if (DOM.editScreenModal) DOM.editScreenModal.classList.remove('active');
                if (typeof window.hideAuthModal === 'function') window.hideAuthModal();
            }
        });

    } catch (err) {
        console.error("Initialization failed:", err);
    }
};

window.DEBUG_MODE = true;
MessageHub.init();
document.addEventListener('DOMContentLoaded', () => {
    window.init();
});
