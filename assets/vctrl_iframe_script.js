// --- Core Constants for V4 Injection ---
window.v4Styles = `
:root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg-dark: #0f172a; --v4-panel-bg: rgba(30, 41, 59, 0.7); --v4-border: rgba(255, 255, 255, 0.15); --v4-text-main: #ffffff; --v4-text-dim: #94a3b8; }
.lf-component { 
    position: absolute; cursor: pointer; transition: outline 0.2s; 
    box-sizing: border-box; z-index: 100;
    transform: none !important; /* Kill legacy centering drift */
}
.lf-component.selected { outline: 2px solid #6366f1; z-index: 10001 !important; }
.lf-component .lf-component .lf-drag-handle, 
.lf-component .lf-component .lf-resizer, 
.lf-component .lf-component .lf-delete-trigger,
.lf-in-group .lf-drag-handle,
.lf-in-group .lf-resizer,
.lf-in-group .lf-delete-trigger { display: none !important; }
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
img.lf-icon { width: 100%; height: 100%; padding: 8px; box-sizing: border-box; object-fit: contain; }
.v4-shape-rect { border-radius: 8px; }
.v4-shape-circle { border-radius: 50%; }
.v4-shape-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); border: none !important; }
.v4-shape-diamond { border: none !important; }
.v4-shape-pattern-grid { 
    background-color: #ffffff !important; 
    background-image: 
        linear-gradient(45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)), 
        linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)) !important; 
    background-size: 12px 12px !important; 
    border-radius: 0 !important; 
}
/* Reset background for new SVG/Custom atoms to prevent sprite leakage */
svg.lf-icon, div.v4-checkbox.lf-icon, div.v4-radio.lf-icon { background-image: none !important; }
.lf-icon[class*="lf-icon-"] { background-image: url("https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png") !important; }

/* Text Marker Integration - Unified px Top-Left (same as shapes/atoms) */
.text-marker { 
    position: absolute; padding: 2px 6px; border-radius: 4px; 
    border: 1.6px solid transparent; font-size: 14px; line-height: 1.2; 
    white-space: normal; cursor: grab; pointer-events: auto; z-index: 1000; 
    transition: box-shadow 0.2s, border-color 0.2s, background 0.2s, outline 0.2s;
    min-width: unset; min-height: unset; background: transparent; 
    box-shadow: none; box-sizing: border-box;
    color: #1e293b; text-align: left;
    width: fit-content !important;
}
.text-marker .v4-editable-cell { padding: 2px 4px; display: block; text-align: left; }
.text-marker .v4-editable-cell p { margin: 0; padding: 0; }
.text-marker:hover { border-color: var(--v4-primary); background: transparent; box-shadow: none; }
.text-marker.selected { border-color: var(--v4-primary); outline: 2px solid var(--v4-primary); box-shadow: none; z-index: 10001; }

body { position: relative !important; min-height: 100vh; margin: 0; padding: 0; }
/* Force disable transitions during drag for maximum smoothness */
.lf-component.dragging-now, .lf-component.dragging-now * { 
    transition: none !important; 
    pointer-events: none !important;
}
`;

window.v4UndoScript = `
window.V4UndoManager = (function() {
    const MAX_HISTORY = 10;
    let undoStack = [];
    let currentConnectors = []; // Locally synced connectors for secure undo
    
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
            try {
                const html = getCleanHTML();
                const connectors = JSON.parse(JSON.stringify(currentConnectors));
                const currentState = JSON.stringify({ html, connectors });
                if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentState) return;
                undoStack.push(currentState);
                if (undoStack.length > MAX_HISTORY) undoStack.shift();
                console.log("[V4 Undo] State Saved (HTML + " + connectors.length + " Connectors)");
            } catch (e) { console.warn("[V4 Undo] Save failed:", e); }
        },
        undo: function() {
            try {
                if (undoStack.length === 0) return;
                const prevState = JSON.parse(undoStack.pop());
                const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
                host.innerHTML = prevState.html;
                if (prevState.connectors) {
                    currentConnectors = prevState.connectors;
                    notifyParent({ type: 'LF_RESTORE_CONNECTORS', connectors: prevState.connectors });
                }
                if (typeof window.initHandles === 'function') window.initHandles();
                markDirty();
                console.log("[V4 Undo] Undo Performed");
            } catch (e) { console.warn("[V4 Undo] Undo failed:", e); }
        },
        init: function() {
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    this.undo();
                }
            });
            // Handle cross-origin safe sync
            window.addEventListener('message', (e) => {
                if (e.data && e.data.type === 'LF_SYNC_CONNECTORS') {
                    currentConnectors = e.data.connectors || [];
                } else if (e.data && e.data.type === 'LF_SAVE_UNDO') {
                    this.saveState();
                }
            });
        }
    };
})();
if (window.V4UndoManager) window.V4UndoManager.init();
`;

window.v4Script = `
(function() {
    console.log("[V4 Iframe] Script initialized (V106_CONNECTORS)");
    let isDragging = false, isResizing = false, isConnectorDragging = false, activeEl = null;
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
        const isPin = c.classList.contains('text-marker');
        
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
            isPin: isPin,
            pinIndex: isPin ? parseInt(c.id.replace('v4-pin-', '')) : -1,
            html: textCell ? textCell.innerHTML : (shape ? shape.innerHTML : (table ? table.innerHTML : "")),
            isGroup: c.classList.contains('lf-group'),
            w: c.offsetWidth,
            h: c.offsetHeight,
            currentStyles: {
                bg: _rgb2hex(shape ? getShapeColor("backgroundColor") : (table ? _getVal(table, "backgroundColor") : (isPin ? _getVal(c, "backgroundColor") : ""))),
                border: _rgb2hex(shape ? getShapeColor("borderColor") : (table ? _getVal(table, "borderColor") : (isPin ? _getVal(c, "borderColor") : (icon ? _getVal(icon.parentElement, "borderColor") : "")))),
                text: _rgb2hex(textCell ? _getVal(textCell, "color") : ""),
                fontSize: parseInt(_getVal(textCell, "fontSize")) || 14,
                tableHeader: _rgb2hex(table ? _getVal(table.querySelector("th"), "backgroundColor") : ""),
                tableHeaderText: _rgb2hex(table ? _getVal(table.querySelector("th"), "color") : ""),
                isBgTransparent: (() => {
                    const colorVal = shape ? getShapeColor("backgroundColor") : (table ? _getVal(table, "backgroundColor") : (isPin ? _getVal(c, "backgroundColor") : ""));
                    return !colorVal || colorVal === "transparent" || colorVal === "none" || colorVal.includes("rgba(0, 0, 0, 0)");
                })(),
                isBorderTransparent: (() => {
                    const colorVal = shape ? getShapeColor("borderColor") : (table ? _getVal(table, "borderColor") : (isPin ? _getVal(c, "borderColor") : ""));
                    return !colorVal || colorVal === "transparent" || colorVal === "none" || colorVal.includes("rgba(0, 0, 0, 0)");
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
        // Rule: Ignore clicks on sidebars, modals, or top panels to prevent unintended deselection/marquee
        if (e.target.closest('.sidebar') || e.target.closest('.modal') || e.target.closest('.header-metadata')) return;

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

            // Sync deletion for pins
            if (c.classList.contains('text-marker')) {
                const idx = parseInt(c.id.replace('v4-pin-', ''));
                notifyParent({ type: 'LF_DELETE_PIN', index: idx });
            }

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
            
            const targets = [];
            document.querySelectorAll('.lf-component').forEach(c => {
                targets.push({
                    id: c.id,
                    x: parseFloat(c.style.left) || 0,
                    y: parseFloat(c.style.top) || 0,
                    w: c.offsetWidth,
                    h: c.offsetHeight
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
            // Apply dragging class to all selected for smoothness
            document.querySelectorAll('.lf-component.selected').forEach(s => s.classList.add('dragging-now'));
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
            if (isConnectorDragging) {
                notifyParent({ type: 'LF_CONNECTOR_HANDLE_MOVE', clientX: e.clientX, clientY: e.clientY });
            }
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
        if (isConnectorDragging) {
            isConnectorDragging = false;
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_UP' });
        }
        if (isMarquee) {
            isMarquee = false;
            notifyParent({ type: 'LF_MARQUEE_END' });
        }
        if (isDragging && activeEl) {
            notifyParent({ type: 'LF_SNAP_END' });
            
            // Sync position for pins (text markers) - now using px directly
            if (activeEl.classList.contains('text-marker')) {
                const idx = parseInt(activeEl.id.replace('v4-pin-', ''));
                notifyParent({
                    type: 'LF_UPDATE_PIN_POS',
                    index: idx,
                    x: parseFloat(activeEl.style.left) || 0,
                    y: parseFloat(activeEl.style.top) || 0,
                    standardized: true
                });
            }
        }
        document.querySelectorAll('.lf-component').forEach(s => s.classList.remove('dragging-now'));
        isDragging = false; isResizing = false; activeEl = null; 
    });
    document.addEventListener('input', e => { if (e.target.classList.contains('v4-editable-cell')) markDirty(); });
    document.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInput) {
                e.preventDefault();
                notifyParent({ type: 'LF_SPACE_DOWN' });
            }
        }
    });
    document.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            notifyParent({ type: 'LF_SPACE_UP' });
        }
    });
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
        else if (d.type === 'LF_IMPORT_PINS') {
            const host = document.body;
            d.pins.forEach((pin, idx) => {
                let div = document.getElementById('v4-pin-' + idx);
                if (!div) {
                    div = document.createElement('div');
                    div.id = 'v4-pin-' + idx;
                    div.className = 'lf-component text-marker';
                    host.appendChild(div);
                }
                
                div.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                                '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:' + (pin.color || '#000') + '">' + (pin.html || pin.text || '') + '</div>' +
                                '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';
                
                div.style.width = 'fit-content';
                div.style.height = 'auto';
                div.style.zIndex = '1000';

                // Global absolute position relative to body
                div.style.left = (parseFloat(pin.x) || 0) + 'px';
                div.style.top = (parseFloat(pin.y) || 0) + 'px';
                
                updateHandles(div);
            });
        }
        else if (d.type === 'LF_RENDER_CONNECTORS') {
            console.log("[V4 Iframe] LF_RENDER_CONNECTORS received:", d);
            const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
            console.log("[V4 Iframe] Host for connectors:", host);
            document.querySelectorAll('.connector-line').forEach(el => el.remove());
            const connectors = d.connectors || [];
            const selectedIds = d.selectedIds || [];
            
            connectors.forEach(conn => {
                const isSelected = selectedIds.includes(conn.id);
                const baseWidth = parseFloat(conn.style.strokeWidth || 1.6);
                const width = isSelected ? (baseWidth + 1) : baseWidth;
                const color = conn.style.stroke || '#475569';
                
                const headLength = Math.max(12, baseWidth * 4.5);
                const padding = headLength + 10;
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

                const calculatePathData = (c, s, e) => {
                    if (c.type === 'straight') return 'M ' + s.x + ' ' + s.y + ' L ' + e.x + ' ' + e.y;
                    const midX = (s.x + e.x) / 2;
                    return 'M ' + s.x + ' ' + s.y + ' H ' + midX + ' V ' + e.y + ' H ' + e.x;
                };
                const pathData = calculatePathData(conn, rStart, rEnd);

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
            
            const compW = (d.style && d.style.width) ? parseInt(d.style.width) || 200 : 200;
            const compH = (d.style && d.style.height) ? parseInt(d.style.height) || 100 : 100;
            
            const centerTop = sY + (vh - compH) / 2;
            const centerLeft = sX + (vw - compW) / 2;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const v = document.createElement('div'); 
            v.id = d.id || ('v4-comp-' + Date.now()); 
            v.className = 'lf-component' + (d.isGroup ? ' lf-group' : '') + (d.className ? ' ' + d.className : ''); 
            v.style.position = 'absolute'; 
            v.style.top = centerTop + 'px'; 
            v.style.left = centerLeft + 'px'; 
            v.style.zIndex = '1000';
            v.style.transform = 'none'; // Prevent drift during grouping
            
            if (d.style) Object.assign(v.style, d.style);
            
            v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + d.html + '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';
            
            // Smart Scaling based on Parent Viewport
            if (window.parent.state && window.parent.state.transform) {
                const s = window.parent.state.transform.scale || 1;
                if (s < 1) {
                    const bw = parseInt(v.style.width) || 200;
                    const bh = parseInt(v.style.height) || 100;
                    // Auto-boost size if zoomed out to keep visually consistent, but NOT for groups which have absolute positioned children
                    if (s < 0.8 && !d.isGroup) {
                        v.style.width = Math.round(bw / s) + 'px';
                        v.style.height = Math.round(bh / s) + 'px';
                    }
                }
            }
            
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
            document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            v.classList.add('selected');
            const isPin = v.classList.contains('text-marker');
            notifyParent({ 
                type: 'LF_COMP_SELECTED', 
                id: v.id, 
                isTable: !!v.querySelector('table'), 
                isShape: !!v.querySelector('.v4-shape'),
                isIcon: !!v.querySelector('.lf-icon') || !!v.querySelector('img'),
                isPin: isPin,
                pinIndex: isPin ? parseInt(v.id.replace('v4-pin-', '')) : -1
            });
            markDirty();
        } else if (d.type === 'LF_INSERT_COMPONENTS') {
            const host = document.body;
            const comps = d.components || [];
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            
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
                v.style.transform = 'none !important'; // Critical fix for atoms

                if (c.style) Object.assign(v.style, c.style);

                v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + (c.html || '') + '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';
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
        }
        else if (d.type === 'LF_UPDATE_PIN_CONTENT') {
            const selected = document.querySelector('.lf-component.text-marker.selected');
            if (selected) {
                const cell = selected.querySelector('.v4-editable-cell');
                if (cell) {
                    cell.innerHTML = d.html;
                    markDirty();
                }
            }
        }
        else if (d.type === 'LF_UPDATE_STYLE') {
            const s = document.querySelector('.lf-component.selected'); if (!s) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            // If it's a text marker, target the editable cell for content/style updates if needed
            let t = d.selector ? s.querySelector(d.selector) : s;
            if (!t && s.classList.contains('text-marker')) {
                t = s.querySelector('.v4-editable-cell') || s;
            }
            if (!t) return;
            
            if (d.style) {
                if (d.style.html !== undefined) t.innerHTML = d.style.html;
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
        } else if (d.type === 'LF_UPDATE_MARQUEE_SELECTION') {
            const ids = d.ids || [];
            document.querySelectorAll('.lf-component').forEach(x => {
                if (ids.includes(x.id)) {
                    x.classList.add('selected');
                } else {
                    x.classList.remove('selected');
                }
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

            ids.forEach(id => {
                const isMarker = id.startsWith('v4-pin-');
                const el = doc.getElementById(id);
                if (el) {
                    const l = parseFloat(el.style.left) || 0;
                    const t = parseFloat(el.style.top) || 0;
                    const w = el.offsetWidth;
                    const h = el.offsetHeight;
                    items.push({ id, type: isMarker ? 'marker' : 'comp', el, x: l, y: t, w, h });
                }
            });

            allHandles.forEach((h, i) => h.style.display = handleStates[i]);

            if (items.length < 2) return;

            let minX = Math.min(...items.map(i => i.x));
            let minY = Math.min(...items.map(i => i.y));
            let maxX = Math.max(...items.map(i => i.x + i.w));
            let maxY = Math.max(...items.map(i => i.y + i.h));

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

                item.el.style.left = (item.x + dx) + 'px';
                item.el.style.top = (item.y + dy) + 'px';
                
                if (item.type === 'marker') {
                    const idx = parseInt(item.id.replace('v4-pin-', ''));
                    notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: item.x + dx, y: item.y + dy });
                }
            });
            markDirty();
        } else if (d.type === 'LF_GROUP_SELECTED') {
            const ids = d.ids || [];
            if (ids.length < 2) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            const doc = document;
            const host = doc.body;
            
            const allHandles = doc.querySelectorAll('.lf-drag-handle, .lf-resizer, .lf-delete-trigger');
            const handleStates = Array.from(allHandles).map(h => h.style.display);
            allHandles.forEach(h => h.style.display = 'none');

            const comps = ids.map(id => doc.getElementById(id)).filter(el => el);
            if (comps.length < 2) return;

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const items = comps.map(c => {
                const l = parseFloat(c.style.left) || 0;
                const t = parseFloat(c.style.top) || 0;
                const w = c.offsetWidth;
                const h = c.offsetHeight;
                minX = Math.min(minX, l);
                minY = Math.min(minY, t);
                maxX = Math.max(maxX, l + w);
                maxY = Math.max(maxY, t + h);
                return { el: c, l, t, w, h };
            });

            allHandles.forEach((h, i) => h.style.display = handleStates[i]);

            const groupBaseL = minX;
            const groupBaseT = minY;
            const groupBaseW = maxX - minX;
            const groupBaseH = maxY - minY;

            const groupId = 'group-' + Date.now();
            const group = doc.createElement('div');
            group.id = groupId;
            group.className = 'lf-component lf-group selected';
            Object.assign(group.style, {
                position: 'absolute', left: groupBaseL + 'px', top: groupBaseT + 'px',
                width: groupBaseW + 'px', height: groupBaseH + 'px',
                background: 'transparent', border: 'none', zIndex: '1000'
            });

            group.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' +
                              '<div class="lf-resizer"></div><div class="lf-delete-trigger">&times;</div>';

            host.appendChild(group);

            items.forEach(item => {
                item.el.style.left = (item.l - minX) + 'px';
                item.el.style.top = (item.t - minY) + 'px';
                item.el.style.width = item.w + 'px';
                item.el.style.height = item.h + 'px';
                item.el.classList.remove('selected');
                group.appendChild(item.el);
            });

            notifyParent({ type: 'LF_SELECT_ID', id: groupId });
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

            const children = Array.from(group.children).filter(c => c.classList.contains('lf-component'));
            const newIds = [];

            children.forEach((c, idx) => {
                if (!c.id) {
                    c.id = 'v4-comp-ug-' + Date.now() + '-' + idx;
                }

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
                host.appendChild(c);
            });

            group.remove();
            
            // To ensure parent updates selectedIds array, send them
            notifyParent({ type: 'LF_DESELECT' });
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
            });

            // Add Inner Screens as Snap Targets (Focus on actual UI area)
            document.querySelectorAll('.mobile-frame').forEach((f, idx) => {
                const content = f.querySelector('.mobile-content');
                if (content) {
                    let el = content;
                    let l = 0, t = 0;
                    while(el) {
                        l += el.offsetLeft;
                        t += el.offsetTop;
                        el = el.offsetParent;
                    }
                    const w = content.offsetWidth;
                    const h = content.offsetHeight;
                    const sName = 'UI Area ' + (idx + 1);
                    const bezel = 8; // Inset shadow bezel width
                    targets.push({ x: l + bezel, label: sName, part: 'Left', type: 'h' });
                    targets.push({ x: l + w - bezel, label: sName, part: 'Right', type: 'h' });
                    targets.push({ y: t + bezel, label: sName, part: 'Top', type: 'v' });
                    targets.push({ y: t + h - bezel, label: sName, part: 'Bottom', type: 'v' });
                    targets.push({ x: l + w / 2, label: sName, part: 'Center', type: 'h' });
                    targets.push({ y: t + h / 2, label: sName, part: 'Middle', type: 'v' });
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
                d.innerHTML = '&times;';
                c.appendChild(d);
            }
        });
    };

    // High-Persistence Border Standardization & Coordinate Migration
    const enforceDesignSystem = () => {
        initHandles();
        
        // --- Coordinate Migration: % to px ---
        document.querySelectorAll('.lf-component').forEach(c => {
            // Only migrate if not in a group (groups already handle their children)
            if (c.parentElement !== document.body) return;
            
            const lStr = c.style.left || "";
            const tStr = c.style.top || "";
            
            if (lStr.includes('%')) {
                const val = parseFloat(lStr);
                const px = (val / 100) * window.innerWidth;
                c.style.left = px + 'px';
                console.log("[V4 Migration] Migrated " + c.id + " left: " + lStr + " -> " + c.style.left);
            }
            if (tStr.includes('%')) {
                const val = parseFloat(tStr);
                const px = (val / 100) * window.innerHeight;
                c.style.top = px + 'px';
                console.log("[V4 Migration] Migrated " + c.id + " top: " + tStr + " -> " + c.style.top);
            }
        });

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
            if (svg.closest('.connector-line')) return;
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
