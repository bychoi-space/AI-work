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

    function notifyParent(data) {
        window.parent.postMessage(data, '*');
    }

    function markDirty() {
        notifyParent({ type: 'LF_DIRTY' });
    }

    function init() {
        document.addEventListener('mousedown', e => {
            const handle = e.target.closest('.lf-drag-handle');
            const resizer = e.target.closest('.lf-resizer');
            const deleteBtn = e.target.closest('.lf-delete-trigger');
            const comp = e.target.closest('.lf-component');

            if (deleteBtn && comp) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                comp.remove();
                markDirty();
                return;
            }

            if (comp) {
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                comp.classList.add('selected');
                notifyParent({ 
                    type: 'LF_COMP_SELECTED', 
                    id: comp.id,
                    isTable: !!comp.querySelector('table'),
                    isShape: comp.querySelector('.v4-shape') !== null,
                    isIcon: !!comp.querySelector('.lf-icon')
                });
            } else {
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                notifyParent({ type: 'LF_DESELECT' });
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
            if (isDragging) notifyParent({ type: 'LF_SNAP_END' });
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
                if (Math.abs(snapDx) > 0.1 || Math.abs(snapDy) > 0.1) {
                    activeEl.style.left = (parseInt(activeEl.style.left || 0) + snapDx) + 'px';
                    activeEl.style.top = (parseInt(activeEl.style.top || 0) + snapDy) + 'px';
                }
            }
            else if (data.type === 'LF_REQUEST_SAVE_CONTENT') {
                const clone = document.documentElement.cloneNode(true);
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
                const html = "<!DOCTYPE html>\n" + clone.outerHTML;
                notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: html });
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
                    isIcon: !!div.querySelector('.lf-icon'),
                    isGroup: !!data.isGroup
                });
                markDirty();
            }
            else if (data.type === 'LF_UPDATE_STYLE') {
                const selected = document.querySelector('.lf-component.selected');
                if (!selected) return;
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                const target = data.selector ? selected.querySelector(data.selector) : selected;
                if (!target) return;
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
