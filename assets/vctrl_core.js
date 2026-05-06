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
:root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg-dark: #0f172a; --v4-panel-bg: rgba(30, 41, 59, 0.7); --v4-border: rgba(255, 255, 255, 0.15); --v4-text-main: #ffffff; --v4-text-dim: #94a3b8; }
.lf-component { position: absolute; cursor: pointer; transition: outline 0.2s; box-sizing: border-box; z-index: 100; }
.lf-component.selected { outline: 2px solid #6366f1; z-index: 10001 !important; }
.lf-component .lf-component .lf-drag-handle, 
.lf-component .lf-component .lf-resizer, 
.lf-component .lf-component .lf-delete-trigger { display: none !important; }
.lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; opacity: 0; transition: all 0.2s; border: 2px solid #fff; z-index: 10002; }
.lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; top: -16px; left: -16px; }
.lf-resizer { position: absolute; bottom: -5px; right: -5px; width: 12px; height: 12px; background: #6366f1; cursor: nwse-resize; border-radius: 50%; border: 2px solid #fff; opacity: 0; transition: 0.2s; z-index: 10002; }
.lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
.lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 10002; font-size: 14px; font-weight: bold; }
.lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
.v4-premium-table { table-layout: fixed; border-collapse: collapse; overflow: hidden; border-radius: 8px; border: 1.6px solid #475569 !important; font-family: 'Inter', sans-serif; }
.v4-premium-table th { padding: 14px 16px; text-align: left; border-bottom: 1.6px solid #475569 !important; font-weight: 700; white-space: nowrap; }
.v4-premium-table td { padding: 14px 16px; border-bottom: 1.6px solid #cbd5e1 !important; }
.v4-premium-table tr:last-child td { border-bottom: none !important; }
.v4-shape { position: relative; border-width: 1.6px !important; border-style: solid !important; border-color: #475569; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #e2e8f0; color: #0f172a; }
.v4-editable-cell:focus { outline: 2px solid #6366f1; background: rgba(99, 102, 241, 0.05) !important; }
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
.v4-logo-img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; display: block; }
.v4-shape-rect { border-radius: 8px; }
.v4-shape-circle { border-radius: 50%; }
.v4-shape-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); border: none !important; }
.v4-shape-diamond { border: none !important; }
/* Reset background for new SVG/Custom atoms to prevent sprite leakage */
svg.lf-icon, div.v4-checkbox.lf-icon, div.v4-radio.lf-icon { background-image: none !important; }
.lf-icon[class*="lf-icon-"] { background-image: url("https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png") !important; }
`;

const v4UndoScript = `
window.V4UndoManager = (function() {
    const MAX_HISTORY = 5;
    let undoStack = [];
    function notifyParent(data) { if (window.parent) window.parent.postMessage(data, '*'); }
    function markDirty() { notifyParent({ type: 'LF_DIRTY' }); }
    function getCleanHTML() {
        const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
        const clone = host.cloneNode(true);
        clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
        clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
        return clone.innerHTML;
    }
    return {
        saveState: function() {
            const currentState = getCleanHTML();
            if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentState) return;
            undoStack.push(currentState);
            if (undoStack.length > MAX_HISTORY) undoStack.shift();
        },
        undo: function() {
            if (undoStack.length === 0) return;
            const prevState = undoStack.pop();
            const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
            host.innerHTML = prevState;
            if (typeof window.initHandles === 'function') window.initHandles();
            markDirty();
        },
        init: function() {
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    this.undo();
                }
            });
        }
    };
})();
if (window.V4UndoManager) window.V4UndoManager.init();
`;

const v4Script = `
(function() {
    let isDragging = false, isResizing = false, activeEl = null;
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

    const _getCompStyles = (c) => {
        const shape = c.querySelector('.v4-shape');
        const table = c.querySelector('table');
        const icon = c.querySelector('.lf-icon');
        const textCell = c.querySelector('.v4-editable-cell');
        
        const getShapeColor = (prop) => {
            if (!shape) return "";
            if (shape.classList.contains('v4-shape-diamond') || shape.classList.contains('v4-shape-triangle')) {
                const svg = shape.querySelector('polygon, path, rect, circle');
                if (svg) return prop === 'backgroundColor' ? svg.style.fill : svg.style.stroke;
            }
            return _getVal(shape, prop === 'backgroundColor' ? 'backgroundColor' : 'borderColor');
        };

        return {
            id: c.id,
            isTable: !!table,
            isShape: !!shape,
            isIcon: !!icon,
            isGroup: c.classList.contains('lf-group'),
            w: c.offsetWidth,
            h: c.offsetHeight,
            currentStyles: {
                bg: _rgb2hex(shape ? getShapeColor("backgroundColor") : (table ? _getVal(table, "backgroundColor") : "")),
                border: _rgb2hex(shape ? getShapeColor("borderColor") : (table ? _getVal(table, "borderColor") : (icon ? _getVal(icon.parentElement, "borderColor") : ""))),
                text: _rgb2hex(textCell ? _getVal(textCell, "color") : ""),
                fontSize: parseInt(_getVal(textCell, "fontSize")) || 14,
                tableHeader: _rgb2hex(table ? _getVal(table.querySelector("th"), "backgroundColor") : ""),
                tableHeaderText: _rgb2hex(table ? _getVal(table.querySelector("th"), "color") : ""),
                isBgTransparent: (() => {
                    const c = shape ? getShapeColor("backgroundColor") : (table ? _getVal(table, "backgroundColor") : "");
                    return !c || c === "transparent" || c === "none" || c.includes("rgba(0, 0, 0, 0)");
                })(),
                isBorderTransparent: (() => {
                    const c = shape ? getShapeColor("borderColor") : (table ? _getVal(table, "borderColor") : "");
                    return !c || c === "transparent" || c === "none" || c.includes("rgba(0, 0, 0, 0)");
                })()
            }
        };
    };

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
    let isMarquee = false;
    document.addEventListener('mousedown', e => {
        let h = e.target.closest('.lf-drag-handle'), r = e.target.closest('.lf-resizer'), d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        
        // If clicking inside a component, find the top-most component (for grouping)
        if (c && !h && !r && !d) {
            let parent = c.parentElement.closest('.lf-component');
            while (parent) {
                c = parent;
                parent = c.parentElement.closest('.lf-component');
            }
        }

        if (d && c) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            c.remove(); 
            markDirty(); 
            notifyParent({ type: 'LF_DESELECT' });
            return; 
        }
        if (c) {
            isMarquee = false;
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
            updateHandles(c);
            notifyParent({ 
                type: "LF_COMP_SELECTED", 
                ..._getCompStyles(c)
            });
        } else {
            isMarquee = true;
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            notifyParent({ 
                type: 'LF_MARQUEE_START', 
                x: e.clientX, 
                y: e.clientY,
                shiftKey: e.shiftKey
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
        else if (h || (c && !e.target.closest('.v4-editable-cell'))) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            isDragging = true; activeEl = c; 
            startX = e.clientX; startY = e.clientY; 
            startTop = parseInt(activeEl.style.top) || 0; startLeft = parseInt(activeEl.style.left) || 0; 
            startRect = activeEl.getBoundingClientRect();
            notifyParent({ type: 'LF_SNAP_START' });
            if (h) e.preventDefault(); 
        } else if (e.target.closest('.v4-editable-cell')) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            e.target.closest('.v4-editable-cell').focus();
        }
    });
    let rafId = null;
    document.addEventListener('mousemove', e => {
        if (isMarquee) {
            notifyParent({ type: 'LF_MARQUEE_MOVE', x: e.clientX, y: e.clientY });
            return;
        }
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (isDragging && activeEl) { 
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const requestX = startRect.left + dx;
                const requestY = startRect.top + dy;
                
                // Track delta for multi-move
                const deltaX = dx; 
                const deltaY = dy;

                notifyParent({ type: 'LF_SNAP_REQUEST', x: requestX, y: requestY, w: activeEl.offsetWidth, h: activeEl.offsetHeight });
                markDirty(); 
            }
            else if (isResizing && activeEl) { 
                const nw = Math.max(10, startW + e.clientX - startX);
                const nh = Math.max(10, startH + e.clientY - startY);
                activeEl.style.width = nw + 'px'; 
                activeEl.style.height = nh + 'px'; 
                updateHandles(activeEl);
                markDirty(); 
                notifyParent({ type: 'LF_COMP_RESIZED', w: nw, h: nh });
            }
        });
    });
    document.addEventListener('mouseup', () => { 
        if (isMarquee) {
            isMarquee = false;
            notifyParent({ type: 'LF_MARQUEE_END' });
        }
        if (isDragging) notifyParent({ type: 'LF_SNAP_END' });
        isDragging = false; isResizing = false; activeEl = null; 
    });
    document.addEventListener('input', e => { if (e.target.classList.contains('v4-editable-cell')) markDirty(); });
    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;
        if (d.type === 'LF_SNAP_RESPONSE' && activeEl && isDragging) {
            const currentRect = activeEl.getBoundingClientRect();
            const snapDx = d.x - currentRect.left;
            const snapDy = d.y - currentRect.top;
            if (Math.abs(snapDx) > 0.1 || Math.abs(snapDy) > 0.1) {
                const comps = document.querySelectorAll('.lf-component.selected');
                comps.forEach(c => {
                    c.style.left = (parseInt(c.style.left || 0) + snapDx) + 'px';
                    c.style.top = (parseInt(c.style.top || 0) + snapDy) + 'px';
                    updateHandles(c);
                });
            }
        }
        else if (d.type === 'LF_REQUEST_SAVE_CONTENT') {
            const c = document.documentElement.cloneNode(true);
            c.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
            c.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
            notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: "<!DOCTYPE html>\\n" + c.outerHTML });
        } else if (d.type === 'LF_INSERT_COMPONENT') {
            const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
            const isMobileHost = host.classList.contains('mobile-content');
            const vh = isMobileHost ? host.clientHeight : window.innerHeight;
            const vw = isMobileHost ? host.clientWidth : window.innerWidth;
            const sY = isMobileHost ? host.scrollTop : window.scrollY;
            const sX = isMobileHost ? host.scrollLeft : window.scrollX;
            const compW = (d.style && d.style.width && d.style.width !== '100%') ? parseInt(d.style.width) || 200 : (d.style && d.style.width === '100%' ? vw : 200);
            const compH = (d.style && d.style.height && d.style.height !== 'auto') ? parseInt(d.style.height) || 100 : 100;
            const centerTop = Math.max(isMobileHost ? 56 : 0, sY + (vh - compH) / 2);
            const centerLeft = Math.max(isMobileHost ? 16 : 0, sX + (vw - compW) / 2);
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const v = document.createElement('div'); 
            v.id = d.id || ('v4-comp-' + Date.now()); 
            v.className = 'lf-component' + (d.isGroup ? ' lf-group' : ''); 
            v.style.position = 'absolute'; 
            v.style.top = centerTop + 'px'; 
            v.style.left = centerLeft + 'px'; 
            v.style.zIndex = '1000';
            
            if (d.style) Object.assign(v.style, d.style);
            if (isMobileHost) {
                v.style.top = centerTop + 'px';
                v.style.left = d.style && d.style.width === '100%' ? '0px' : centerLeft + 'px';
                if (d.style && d.style.width === '100%') v.style.width = '100%';
            }
            
            v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + d.html + '<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div>';
            
            // Legacy Compatibility: Detect old-style molecule with absolute coordinates
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
            markDirty();
        } else if (d.type === 'LF_INSERT_COMPONENTS') {
            const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
            const comps = d.components || [];
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            
            comps.forEach(c => {
                const v = document.createElement('div');
                v.id = c.id || ('v4-comp-' + Date.now());
                v.className = 'lf-component selected';
                v.style.position = 'absolute';
                if (c.style) Object.assign(v.style, c.style);
                v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + c.html + '<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div>';
                host.appendChild(v);
                updateHandles(v);
            });
            markDirty();
        } else if (d.type === 'LF_SELECT_ID') {
            const el = document.getElementById(d.id);
            if (el) {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
                updateHandles(el);
            }
        } else if (d.type === 'LF_UPDATE_STYLE') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const t = d.selector ? s.querySelector(d.selector) : s; if (!t) return;
            
            if (d.style) {
                Object.assign(t.style, d.style);
                
                // SVG Sync: If the element contains an SVG, sync stroke/fill
                const svgShape = t.querySelector('path, polygon, rect, circle');
                if (svgShape) {
                    if (d.style.backgroundColor || d.style.background) {
                        svgShape.style.fill = d.style.backgroundColor || d.style.background;
                        // For non-rectangular shapes, container must stay transparent to avoid square fill leakage
                        if (t.classList.contains('v4-shape-diamond') || t.classList.contains('v4-shape-triangle')) {
                            t.style.backgroundColor = 'transparent';
                        }
                    }
                    if (d.style.borderColor) {
                        svgShape.style.stroke = d.style.borderColor;
                        svgShape.style.strokeWidth = "1.6";
                    }
                }
            }
            
            if (d.subSelector && d.subStyle) {
                t.querySelectorAll(d.subSelector).forEach(sub => Object.assign(sub.style, d.subStyle));
            }
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
        } else if (d.type === 'LF_REQUEST_SNAP_TARGETS') {
            const targets = [];
            document.querySelectorAll('.lf-component:not(.selected)').forEach(c => {
                const r = c.getBoundingClientRect();
                const name = c.id.replace('v4-comp-', 'Comp ');
                targets.push({ x: r.left, label: name, part: 'Left', type: 'h' });
                targets.push({ x: r.left + r.width / 2, label: name, part: 'Center', type: 'h' });
                targets.push({ x: r.right, label: name, part: 'Right', type: 'h' });
                targets.push({ y: r.top, label: name, part: 'Top', type: 'v' });
                targets.push({ y: r.top + r.height / 2, label: name, part: 'Middle', type: 'v' });
                targets.push({ y: r.bottom, label: name, part: 'Bottom', type: 'v' });
            });

            // Add Inner Screens as Snap Targets (Focus on actual UI area)
            document.querySelectorAll('.mobile-frame').forEach((f, idx) => {
                const content = f.querySelector('.mobile-content');
                if (content) {
                    const sr = content.getBoundingClientRect();
                    const sName = 'UI Area ' + (idx + 1);
                    const bezel = 8; // Inset shadow bezel width
                    targets.push({ x: sr.left + bezel, label: sName, part: 'Left', type: 'h' });
                    targets.push({ x: sr.right - bezel, label: sName, part: 'Right', type: 'h' });
                    targets.push({ y: sr.top + bezel, label: sName, part: 'Top', type: 'v' });
                    targets.push({ y: sr.bottom - bezel, label: sName, part: 'Bottom', type: 'v' });
                    // Center/Middle remain the same
                    targets.push({ x: sr.left + sr.width / 2, label: sName, part: 'Center', type: 'h' });
                    targets.push({ y: sr.top + sr.height / 2, label: sName, part: 'Middle', type: 'v' });
                }
            });

            notifyParent({ type: 'LF_SNAP_TARGETS_RESPONSE', targets });
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
        }
    });

    const initHandles = () => {
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
                d.innerText = '×';
                c.appendChild(d);
            }
        });
    };

    // 🛡️ High-Persistence Border Standardization (Standardizes 1.6px everywhere)
    const enforceDesignSystem = () => {
        initHandles();
        document.querySelectorAll('.v4-shape').forEach(s => {
            if (s.classList.contains('v4-shape-diamond') || s.classList.contains('v4-shape-triangle')) {
                s.style.setProperty('border-width', '0px', 'important');
                return;
            }
            if (s.style.borderWidth !== '1.6px') s.style.setProperty('border-width', '1.6px', 'important');
        });
        document.querySelectorAll('table.v4-premium-table').forEach(t => {
            if (t.style.borderWidth !== '1.6px') t.style.setProperty('border-width', '1.6px', 'important');
        });
        document.querySelectorAll('polygon, path, rect, circle').forEach(svg => {
            if (svg.getAttribute('stroke-width') !== '1.6') svg.setAttribute('stroke-width', '1.6');
            if (svg.style.strokeWidth !== '1.6') svg.style.strokeWidth = '1.6';
            if (svg.style.vectorEffect !== 'non-scaling-stroke') svg.style.vectorEffect = 'non-scaling-stroke';
        });
    };

    // Run immediately and setup observer for dynamic changes
    enforceDesignSystem();
    const observer = new MutationObserver(enforceDesignSystem);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    
    // Safety fallback for slow loads
    setTimeout(enforceDesignSystem, 500);
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
    
    // Inject/Update Styles
    const styleBlock = `<style id="v4-inlined-style">\n${v4Styles}\n</style>`;
    if (finalContent.includes('id="v4-inlined-style"')) {
        finalContent = finalContent.replace(/<style id="v4-inlined-style">[\s\S]*?<\/style>/i, styleBlock);
    } else if (!finalContent.includes('style_v4.css')) {
        finalContent = finalContent.replace('</head>', `${styleBlock}\n</head>`);
    }

    // Inject/Update Script
    const scriptBlock = `<script id="v4-inlined-script">\n${v4UndoScript}\n${v4Script}\n</script>`;
    if (finalContent.includes('id="v4-inlined-script"')) {
        finalContent = finalContent.replace(/<script id="v4-inlined-script">[\s\S]*?<\/script>/i, scriptBlock);
    } else if (!finalContent.includes('vctrl_v4_iframe.js')) {
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
            window.parent.postMessage({ type: 'LF_DESELECT' }, '*');
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
            window.parent.postMessage({ type: 'LF_COMP_SELECTED', id: activeEl.id, isTable: !!activeEl.querySelector('table'), isShape: !!activeEl.querySelector('.v4-shape'), isIcon: !!activeEl.querySelector('.lf-icon') }, '*');
            e.preventDefault(); e.stopPropagation();
        } else if (comp) {
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            comp.classList.add('selected');
            window.postMessage({ type: 'LF_COMP_SELECTED', id: comp.id, isTable: !!comp.querySelector('table'), isShape: !!comp.querySelector('.v4-shape'), isIcon: !!comp.querySelector('.lf-icon') || !!comp.querySelector('svg') }, '*');
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
    let defaultStyle = { width: '120px', height: '100px' };

    if (name === 'LF Logo') {
        contentHtml = `<img src="https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png" class="v4-logo-img">`;
        defaultStyle = { width: '140px', height: '40px' };
    } else if (name === 'Primary Button') {
        contentHtml = `<div style="background:#00e5ff; color:#000; border:none; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:bold; font-size:14px; box-shadow:0 4px 15px rgba(0,229,255,0.3); pointer-events:none;">BUTTON</div>`;
        defaultStyle = { width: '120px', height: '36px' };
    } else if (name === 'LF Discount') {
        contentHtml = `<div style="color:#E02020; font-size:24px; font-weight:800; font-family:sans-serif; text-align:center; pointer-events:none; line-height:1.2;">20%</div>`;
        defaultStyle = { width: '60px', height: '30px' };
    } else if (type === 'icon') {
        if (name === 'Arrow Left') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
        } else if (name === 'Arrow Right') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        } else if (name === 'Arrow Up') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
        } else if (name === 'Arrow Down') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        } else if (name === 'Close X') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else if (name === 'Check Box') {
            contentHtml = `<div class="v4-checkbox lf-icon" style="width:100%; height:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); border-radius:6px; display:flex; align-items:center; justify-content:center; position:relative;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%;"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
        } else if (name === 'Radio Button') {
            contentHtml = `<div class="v4-radio lf-icon" style="width:100%; height:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center;"><div style="width:45%; height:45%; background:#ffffff; border-radius:50%;"></div></div>`;
        } else {
            const iconClass = name.toLowerCase().split(' ')[0];
            contentHtml = `<div class="lf-icon lf-icon-${iconClass}" style="filter: brightness(0);"></div>`;
        }
        defaultStyle = { width: '40px', height: '40px' };
    }

    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
        if (DOM.iframe && DOM.iframe.contentWindow) {
            MessageHub.send(DOM.iframe.contentWindow, 'LF_INSERT_COMPONENT', { id, html: contentHtml, style: defaultStyle });
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
        Object.assign(comp.style, defaultStyle);
        comp.innerHTML = `${contentHtml}<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div><div class="lf-drag-handle">::</div>`;
        host.appendChild(comp);
        if (typeof enforceDesignSystem === 'function') enforceDesignSystem();
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
        
        const btn = document.getElementById('btn-global-save');
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
            
            btn.style.setProperty('background', 'linear-gradient(135deg, #22c55e, #16a34a)', 'important');
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">check_circle</span> 저장 완료`;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.removeProperty('background');
                btn.style.position = '';
                btn.style.overflow = '';
                btn.disabled = false;
            }, 1800);
        } else {
            throw new Error("GitHub API 반영에 실패했습니다.");
        }
    } catch (err) {
        console.error("[Save Error]", err);
        const btn = document.getElementById('btn-global-save');
        if (btn) {
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">error</span> 저장 실패`;
            btn.style.setProperty('background', '#ef4444', 'important');
            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">save</span> 전체 저장`;
                btn.style.removeProperty('background');
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
    
    // Support multiple subscribers for the same message type
    subscribe(type, callback) {
        if (!this.handlers[type]) this.handlers[type] = [];
        this.handlers[type].push(callback);
    },

    register(type, callback) {
        console.warn(`[MessageHub] register() is deprecated. Use subscribe() instead.`);
        this.subscribe(type, callback);
    },

    init() {
        window.addEventListener('message', (e) => {
            const data = e.data;
            if (!data || !data.type) return;
            
            if (window.DEBUG_MODE) {
                console.log(`%c[MessageHub] IN: ${data.type}`, "color: #10b981;", data);
            }

            // Internal engine hooks
            if (data.type === 'LF_SNAP_START') {
                if (window.SmartGuide) window.SmartGuide.findSnapTargets();
            } else if (data.type === 'LF_SNAP_REQUEST') {
                const DOM = window.DOM;
                if (window.SmartGuide && DOM && DOM.iframe && DOM.iframe.contentWindow) {
                    const snap = window.SmartGuide.calculateSnap(data.x, data.y, data.w, data.h);
                    window.SmartGuide.drawGuides(snap);
                    MessageHub.send(DOM.iframe.contentWindow, 'LF_SNAP_RESPONSE', snap);
                }
            } else if (data.type === 'LF_SNAP_END') {
                if (window.SmartGuide) window.SmartGuide.clearGuides();
            }

            // Call all registered subscribers
            if (this.handlers[data.type]) {
                this.handlers[data.type].forEach(callback => {
                    try {
                        callback(data);
                    } catch (err) {
                        console.error(`[MessageHub] Error in handler for "${data.type}":`, err);
                    }
                });
            }
        });
        console.log("[MessageHub] Central message listener active (V2 Modular).");
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
    
    // UI Feedback
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

// 5. Navigation Protection
window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});


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
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest('#btn-global-save')) {
                handleGlobalSave();
            }
        });
        
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

        // 🟢 RESTORED: Sidebar Tool Buttons (Text, etc.)
        if (DOM.sidebarToolBtns) {
            DOM.sidebarToolBtns.forEach(btn => {
                btn.onclick = () => {
                    const tool = btn.dataset.tool;
                    if (tool === 'text') {
                        if (typeof window.handleTextCreation === 'function') window.handleTextCreation();
                    } else if (typeof window.setTool === 'function') {
                        window.setTool(tool);
                    }
                };
            });
        }
        
        // 🟢 RESTORED: Top Bar Tool Buttons
        if (DOM.btnSelect) DOM.btnSelect.onclick = () => window.setTool?.('select');
        if (DOM.btnHand) DOM.btnHand.onclick = () => window.setTool?.('hand');

        // 🟢 RESTORED: Add Screen Modal Logic
        if (DOM.btnAddScreen) {
            DOM.btnAddScreen.onclick = () => {
                if (state.isReadOnly) return window.showAuthModal?.();
                if (DOM.addScreenModal) DOM.addScreenModal.classList.add('active');
            };
        }
        if (DOM.btnCancelAdd) {
            DOM.btnCancelAdd.onclick = () => {
                if (DOM.addScreenModal) DOM.addScreenModal.classList.remove('active');
            };
        }
        
        // Template Selection Logic
        document.querySelectorAll('.template-card').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                if (DOM.newScreenName) {
                    const defaultName = card.dataset.defaultName || "new_screen";
                    DOM.newScreenName.value = defaultName + "_" + Math.floor(Math.random() * 1000);
                }
            };
        });

        if (DOM.btnSubmitAdd) {
            DOM.btnSubmitAdd.onclick = async () => {
                const selectedCard = document.querySelector('.template-card.selected');
                if (!selectedCard) return window.Notification?.alert("템플릿을 선택해주세요.", "알림", "warning");
                
                const screenName = DOM.newScreenName?.value?.trim();
                if (!screenName) return window.Notification?.alert("화면 이름을 입력해주세요.", "알림", "warning");

                DOM.btnSubmitAdd.disabled = true;
                DOM.btnSubmitAdd.innerText = "생성 중...";

                const template = selectedCard.dataset.template;
                const success = await createScreenFromTemplate(state.currentProject, screenName, template, {
                    PROJECT_TITLE: state.projectMetadata.title,
                    SCREEN_NAME: screenName
                }, msg => { if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = msg; });

                if (success) {
                    location.reload();
                } else {
                    window.Notification?.alert("화면 생성에 실패했습니다.", "오류", "error");
                    DOM.btnSubmitAdd.disabled = false;
                    DOM.btnSubmitAdd.innerText = "화면 생성하기";
                }
            };
        }

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
