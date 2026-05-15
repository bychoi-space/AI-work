/**
 * vctrl_v4_iframe.js
 * Handle component interaction (drag, resize, select) INSIDE the iframe.
 * Optimized for 'file://' protocol security constraints.
 */

(function() {
    let isDragging = false;
    let isResizing = false;
    let activeEl = null;
    let startX, startY, startW, startH, startTop, startLeft, startRect;

    const _rgb2hex = (rgb) => {
        if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
        const parts = rgb.match(/\d+/g);
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

    const _getIframeCompStyles = (c) => {
        const shape = c.querySelector('.v4-shape');
        const table = c.querySelector('table');
        const icon = c.querySelector('.lf-icon') || c.querySelector('img');
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
            isPin: isPin,
            pinIndex: isPin ? parseInt(c.id.replace('v4-pin-', '')) : -1,
            w: c.offsetWidth, h: c.offsetHeight,
            currentStyles: {
                bg: _rgb2hex(shape ? getShapeColor("backgroundColor") : (table ? _getVal(table, "backgroundColor") : (isPin ? _getVal(c, "backgroundColor") : ""))),
                border: _rgb2hex(shape ? getShapeColor("borderColor") : (table ? _getVal(table, "borderColor") : (isPin ? _getVal(c, "borderColor") : (icon ? _getVal(icon.parentElement || icon, "borderColor") : "")))),
                text: _rgb2hex(textCell ? _getVal(textCell, "color") : ""),
                fontSize: parseInt(_getVal(textCell, "fontSize")) || 14,
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

    function notifyParent(data) {
        window.parent.postMessage(data, '*');
    }

    function markDirty() {
        notifyParent({ type: 'LF_DIRTY' });
    }

    function init() {
        if (window.V4UndoManager) window.V4UndoManager.init();

        document.addEventListener('mousedown', e => {
            const handle = e.target.closest('.lf-drag-handle');
            const resizer = e.target.closest('.lf-resizer');
            const deleteBtn = e.target.closest('.lf-delete-trigger');
            const comp = e.target.closest('.lf-component');

            if (deleteBtn && comp) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                // Sync deletion for pins
                if (comp.classList.contains('text-marker')) {
                    const idx = parseInt(comp.id.replace('v4-pin-', ''));
                    notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                }

                comp.remove();
                markDirty();
                return;
            }

            if (comp) {
                if (!e.shiftKey) {
                    document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                }
                comp.classList.toggle('selected');
                
                const isPin = comp.classList.contains('text-marker');
                notifyParent({ 
                    type: 'LF_COMP_SELECTED', 
                    id: comp.id,
                    shiftKey: e.shiftKey,
                    isTable: !!comp.querySelector('table'),
                    isShape: comp.querySelector('.v4-shape') !== null,
                    isIcon: !!comp.querySelector('.lf-icon') || !!comp.querySelector('img'),
                    isPin: isPin,
                    pinIndex: isPin ? parseInt(comp.id.replace('v4-pin-', '')) : -1,
                    currentStyles: _getIframeCompStyles(comp)
                });
            } else {
                if (!e.shiftKey) {
                    document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                    notifyParent({ type: 'LF_DESELECT' });
                }
            }

            if (resizer) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                isResizing = true;
                activeEl = resizer.parentElement;
                startX = e.clientX; startY = e.clientY;
                startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
                e.preventDefault();
            } else if (handle || comp) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                isDragging = true;
                activeEl = comp;
                startX = e.clientX; startY = e.clientY;
                startTop = parseInt(activeEl.style.top) || 0;
                startLeft = parseInt(activeEl.style.left) || 0;
                startRect = activeEl.getBoundingClientRect();
                notifyParent({ type: 'LF_SNAP_START' });
                if (handle) e.preventDefault();
            }
        });

        document.addEventListener('mousemove', e => {
            if (isDragging && activeEl) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const requestX = startRect.left + dx;
                const requestY = startRect.top + dy;
                notifyParent({ 
                    type: 'LF_SNAP_REQUEST', 
                    x: requestX, 
                    y: requestY, 
                    w: activeEl.offsetWidth, 
                    h: activeEl.offsetHeight 
                });
                markDirty();
            } else if (isResizing && activeEl) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                activeEl.style.width = (startW + dx) + 'px';
                activeEl.style.height = (startH + dy) + 'px';
                markDirty();
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging && activeEl) {
                notifyParent({ type: 'LF_SNAP_END' });
                
                const host = document.querySelector('.page') || document.querySelector('.artboard') || document.querySelector('#canvas') || document.body;
                const hostRect = host.getBoundingClientRect();
                const scale = window.parent.state.transform.scale || 1;

                // Sync position for pins (text markers) - unified px
                const syncPin = (el) => {
                    if (!el.classList.contains('text-marker')) return;
                    const idx = parseInt(el.id.replace('v4-pin-', ''));
                    notifyParent({
                        type: 'LF_UPDATE_PIN_POS',
                        index: idx,
                        x: parseFloat(el.style.left) || 0,
                        y: parseFloat(el.style.top) || 0,
                        standardized: true
                    });
                };

                // Sync position for connectors
                const syncConnector = (el) => {
                    if (!el.classList.contains('connector-line')) return;
                    const id = el.id;
                    const r = el.getBoundingClientRect();
                    
                    const conn = window.parent.state.connectors.find(c => c.id === id);
                    if (conn) {
                        const baseWidth = parseFloat(conn.style.strokeWidth || 1.6);
                        const headLength = Math.max(12, baseWidth * 4.5);
                        const padding = headLength + 5;

                        // The SVG's top-left (r.left, r.top) is host-relative (minX, minY)
                        const hostRelMinX = (r.left - hostRect.left) / scale;
                        const hostRelMinY = (r.top - hostRect.top) / scale;

                        // Original relative positions inside the SVG
                        const oldMinX = Math.min(conn.start.x, conn.end.x) - padding;
                        const oldMinY = Math.min(conn.start.y, conn.end.y) - padding;
                        
                        const dx = hostRelMinX - oldMinX;
                        const dy = hostRelMinY - oldMinY;

                        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                            notifyParent({
                                type: 'LF_UPDATE_CONNECTOR_POS',
                                id: id,
                                start: { x: conn.start.x + dx, y: conn.start.y + dy },
                                end: { x: conn.end.x + dx, y: conn.end.y + dy }
                            });
                        }
                    }
                };

                if (activeEl.classList.contains('text-marker')) {
                    syncPin(activeEl);
                } else if (activeEl.classList.contains('lf-group')) {
                    // If a group was moved, sync all pins inside it
                    activeEl.querySelectorAll('.text-marker').forEach(syncPin);
                    // Also sync connectors if any are inside (though they usually aren't yet)
                    activeEl.querySelectorAll('.connector-line').forEach(syncConnector);
                }
            }
            isDragging = false;
            isResizing = false;
            activeEl = null;
        });

        document.addEventListener('input', e => {
            if (e.target.classList.contains('v4-editable-cell')) {
                // For text edits, we usually save state on focus (mousedown), 
                // but we mark dirty here.
                markDirty();
            }
        });

        window.addEventListener('message', e => {
            const data = e.data;
            if (!data) return;

            if (data.type === 'LF_SNAP_RESPONSE' && activeEl && isDragging) {
                const currentRect = activeEl.getBoundingClientRect();
                const snapDx = data.x - currentRect.left;
                const snapDy = data.y - currentRect.top;
                if (Math.abs(snapDx) > 0.05 || Math.abs(snapDy) > 0.05) {
                    // Unified handling: all components use px, scale correction only
                    const scale = window.parent.state.transform.scale || 1;
                    activeEl.style.left = (parseFloat(activeEl.style.left) || 0) + (snapDx / scale) + 'px';
                    activeEl.style.top = (parseFloat(activeEl.style.top) || 0) + (snapDy / scale) + 'px';
                }
            }
            else if (data.type === 'LF_REQUEST_SAVE_CONTENT') {
                const clone = document.documentElement.cloneNode(true);
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
                const html = "<!DOCTYPE html>\n" + clone.outerHTML;
                notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: html });
            }
            else if (data.type === 'LF_RENDER_CONNECTORS') {
                const host = document.querySelector('.page') || 
                           document.querySelector('.artboard') || 
                           document.querySelector('#canvas') || 
                           document.body;
                
                if (window.parent.state && window.parent.state.debugMode) {
                    console.log("[Iframe] Rendering Connectors. Host:", host.tagName, (host.className || host.id), "Count:", data.connectors?.length);
                }

                document.querySelectorAll('.connector-line').forEach(el => el.remove());
                
                const connectors = data.connectors || [];
                const selectedIds = data.selectedIds || [];
                
                connectors.forEach(conn => {
                    const isSelected = selectedIds.includes(conn.id);
                    const baseWidth = parseFloat(conn.style.strokeWidth || 1.6);
                    const width = isSelected ? (baseWidth + 1) : baseWidth;
                    const color = isSelected ? '#3b82f6' : (conn.style.stroke || '#475569');
                    
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
                        if (c.type === 'straight') return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
                        const midX = (s.x + e.x) / 2;
                        return `M ${s.x} ${s.y} H ${midX} V ${e.y} H ${e.x}`;
                    };
                    const d = calculatePathData(conn, rStart, rEnd);

                    const startMId = `m-start-${conn.id}`;
                    const endMId = `m-end-${conn.id}`;

                    svg.innerHTML = `
                        <defs>
                            <marker id="${startMId}" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}" />
                            </marker>
                            <marker id="${endMId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}" />
                            </marker>
                        </defs>
                        <path d="${d}" stroke="transparent" stroke-width="20" fill="none" style="cursor:pointer; pointer-events:auto;" class="connector-hit-area" />
                        <path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" 
                              marker-start="${conn.style.markerStart ? `url(#${startMId})` : ''}"
                              marker-end="${conn.style.markerEnd ? `url(#${endMId})` : ''}"
                              style="pointer-events:none;" 
                              ${conn.style.dashArray ? `stroke-dasharray="${conn.style.dashArray}"` : ''} />
                    `;

                    // Handle hit area click
                    const hitArea = svg.querySelector('.connector-hit-area');
                    if (hitArea) {
                        hitArea.onmousedown = (e) => {
                            e.stopPropagation();
                            notifyParent({ type: 'LF_CONNECTOR_CLICKED', id: conn.id, shiftKey: e.shiftKey });
                        };
                    }

                    // Handles (Inside SVG but clickable)
                    if (isSelected) {
                        ['start', 'end'].forEach(type => {
                            const pt = rel(conn[type]);
                            const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                            handle.setAttribute("cx", pt.x);
                            handle.setAttribute("cy", pt.y);
                            handle.setAttribute("r", 6);
                            handle.setAttribute("fill", "#3b82f6");
                            handle.setAttribute("stroke", "#fff");
                            handle.setAttribute("stroke-width", "2");
                            handle.style.cursor = 'crosshair';
                            handle.style.pointerEvents = 'auto';
                            handle.onmousedown = (e) => {
                                e.stopPropagation();
                                notifyParent({ type: 'LF_CONNECTOR_HANDLE_DOWN', id: conn.id, pointType: type });
                            };
                            svg.appendChild(handle);
                        });
                    }

                    host.appendChild(svg);
                });
            }
            else if (data.type === 'LF_INSERT_COMPONENT') {
                const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
                const isMobileHost = host.classList.contains('mobile-content');
                const vh = isMobileHost ? host.clientHeight : window.innerHeight;
                const vw = isMobileHost ? host.clientWidth : window.innerWidth;
                const sY = isMobileHost ? host.scrollTop : window.scrollY;
                const sX = isMobileHost ? host.scrollLeft : window.scrollX;
                const compW = (data.style && data.style.width && data.style.width !== '100%') ? parseInt(data.style.width) || 200 : (data.style && data.style.width === '100%' ? vw : 200);
                const compH = (data.style && data.style.height && data.style.height !== 'auto') ? parseInt(data.style.height) || 100 : 100;
                const centerTop = Math.max(isMobileHost ? 56 : 0, sY + (vh - compH) / 2);
                const centerLeft = Math.max(isMobileHost ? 16 : 0, sX + (vw - compW) / 2);

                if (window.V4UndoManager) window.V4UndoManager.saveState();
                const div = document.createElement('div');
                div.id = data.id || ('v4-comp-' + Date.now());
                div.className = 'lf-component' + (data.isGroup ? ' lf-group' : '');
                div.style.position = 'absolute';
                div.style.top = centerTop + 'px';
                div.style.left = centerLeft + 'px';
                div.style.zIndex = '1000';
                
                if (data.style) Object.assign(div.style, data.style);
                if (isMobileHost) {
                    div.style.top = centerTop + 'px';
                    div.style.left = data.style && data.style.width === '100%' ? '0px' : centerLeft + 'px';
                    if (data.style && data.style.width === '100%') div.style.width = '100%';
                }
                
                div.innerHTML = `
                    <div class="lf-drag-handle">
                        <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
                    </div>
                    ${data.html}
                    <div class="lf-resizer"></div>
                    <div class="lf-delete-trigger">×</div>
                `;

                // Legacy Compatibility: Detect old-style molecule with absolute coordinates
                const children = Array.from(div.children).filter(c => c.classList.contains('lf-component') || c.classList.contains('lf-group'));
                if (children.length === 1) {
                    const inner = children[0];
                    const l = parseInt(inner.style.left) || 0;
                    const t = parseInt(inner.style.top) || 0;
                    if (l !== 0 || t !== 0) {
                        inner.style.left = '0px';
                        inner.style.top = '0px';
                        if (inner.style.width) div.style.width = inner.style.width;
                        if (inner.style.height) div.style.height = inner.style.height;
                    }
                }

                host.appendChild(div);
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                div.classList.add('selected');
                
                notifyParent({ 
                    type: 'LF_COMP_SELECTED', 
                    id: div.id, 
                    isTable: !!div.querySelector('table'), 
                    isShape: !!div.querySelector('.v4-shape'),
                    isIcon: !!div.querySelector('.lf-icon') || !!div.querySelector('img'),
                    isGroup: !!data.isGroup
                });
                markDirty();
            }
            else if (data.type === 'LF_IMPORT_PINS') {
                const host = document.querySelector('.mobile-content') || document.querySelector('.page') || document.body;
                const hw = host.clientWidth || 375;
                const hh = host.clientHeight || 812;

                data.pins.forEach((pin, idx) => {
                    let div = document.getElementById('v4-pin-' + idx);
                    if (!div) {
                        div = document.createElement('div');
                        div.id = 'v4-pin-' + idx;
                        div.className = 'lf-component text-marker';
                        host.appendChild(div);
                    }
                    
                    div.style.position = 'absolute';
                    div.style.zIndex = '1000';
                    div.style.color = pin.color || '#000000';
                    
                    div.innerHTML = `
                        <div class="lf-drag-handle">
                            <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
                        </div>
                        <div class="lf-delete-trigger">×</div>
                        <div class="v4-editable-cell" contenteditable="true" style="outline:none;">${pin.html || pin.text || ''}</div>
                    `;

                    if (div.parentElement === host) {
                        if (pin.standardized) {
                            div.style.left = pin.x + 'px';
                            div.style.top = pin.y + 'px';
                        } else {
                            // Legacy % -> px (direct conversion, no center offset)
                            div.style.left = ((pin.x / 100) * hw) + 'px';
                            div.style.top = ((pin.y / 100) * hh) + 'px';
                        }
                    }
                });
            }
            else if (data.type === 'LF_UPDATE_STYLE') {
                const selected = document.querySelector('.lf-component.selected');
                if (!selected) return;
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                const target = data.selector ? selected.querySelector(data.selector) : selected;
                if (!target) return;

                // Color to Filter mapping for img-based icons
                if (target.tagName === 'IMG' && data.style && data.style.color) {
                    const color = data.style.color.toLowerCase();
                    if (color === '#000000' || color === 'black') {
                        target.style.filter = 'brightness(0)';
                    } else if (color === '#ffffff' || color === 'white') {
                        target.style.filter = 'brightness(0) invert(1)';
                    } else {
                        target.style.filter = 'none';
                    }
                    delete data.style.color; // Don't apply text color to img
                }

                if (data.style) Object.assign(target.style, data.style);
                if (data.subSelector && data.subStyle) {
                    target.querySelectorAll(data.subSelector).forEach(el => Object.assign(el.style, data.subStyle));
                }
                markDirty();
            }
            else if (data.type === 'LF_DELETE_SELECTED') {
                const selected = document.querySelector('.lf-component.selected');
                if (selected) { 
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    selected.remove(); 
                    markDirty(); 
                }
            }
            else if (data.type === 'LF_DESELECT_ALL') {
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            }
            else if (data.type === 'LF_REQUEST_SNAP_TARGETS') {
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
            }
        });
    }

    init();
})();
