/**
 * assets/vctrl_iframe_drag.js
 * Mouse drag and element resizing engine logic for LF Editor Studio (Iframe Side).
 */

window.v4DragResizeScript = `
(function() {
    let isDragging = false;
    let isResizing = false;
    let isPendingDrag = false;
    const DRAG_THRESHOLD = 4;
    let startX = 0, startY = 0, startW = 0, startH = 0, startTop = 0, startLeft = 0;
    let startRect = null;
    let groupChildrenStart = null;
    

    window.V4DragResizeEngine = {
        get isDragging() { return isDragging; },
        set isDragging(v) { isDragging = v; },
        get isResizing() { return isResizing; },
        set isResizing(v) { isResizing = v; },
        get isPendingDrag() { return isPendingDrag; },
        set isPendingDrag(v) { isPendingDrag = v; },
        
        handleMouseDown: function(e, h, r, d, c) {
            if (!c) return;
            isPendingDrag = true;
            isDragging = false;
            window.activeEl = c;
            startX = e.clientX;
            startY = e.clientY;
            startTop = parseInt(window.activeEl.style.top) || 0;
            startLeft = parseInt(window.activeEl.style.left) || 0;
            startRect = window.activeEl.getBoundingClientRect();
            if (h || e.target.closest('.v4-editable-cell')) e.preventDefault();
        },
        
        handleMouseMove: function(e) {
            if (isPendingDrag && window.activeEl) {
                const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
                if (dist >= DRAG_THRESHOLD) {
                    isPendingDrag = false;
                    isDragging = true;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    notifyParent({ type: 'LF_SNAP_START' });
                    document.querySelectorAll('.lf-component.selected').forEach(s => s.classList.add('dragging-now'));
                }
            }

            if (isDragging && window.activeEl) {
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;

                if (e.shiftKey) {
                    if (Math.abs(dx) >= Math.abs(dy)) dy = 0;
                    else dx = 0;
                }

                const scale = (window.parent?.state?.transform?.scale) || 1;
                const logicalX = startLeft + dx / scale;
                const logicalY = startTop + dy / scale;

                notifyParent({ type: 'LF_SNAP_REQUEST', x: logicalX, y: logicalY, w: window.activeEl.offsetWidth, h: window.activeEl.offsetHeight });
                markDirty();
            }
            else if (isResizing && window.activeEl) {
                const scale = (window.parent?.state?.transform?.scale) || 1;
                const nw = Math.max(10, startW + (e.clientX - startX) / scale);
                const nh = Math.max(10, startH + (e.clientY - startY) / scale);
                
                const scaleX = nw / startW;
                const scaleY = nh / startH;
                
                window.activeEl.style.width = nw + 'px';
                window.activeEl.style.height = nh + 'px';
                
                if (groupChildrenStart) {
                    groupChildrenStart.forEach(child => {
                        const newL = child.left * scaleX;
                        const newT = child.top * scaleY;
                        const newW = child.width * scaleX;
                        const newH = child.height * scaleY;
                        
                        child.el.style.left = newL + 'px';
                        child.el.style.top = newT + 'px';
                        child.el.style.width = newW + 'px';
                        child.el.style.height = newH + 'px';
                        child.el.setAttribute('data-resized', 'true');
                        
                        // Rescale inner elements inside grouped atoms
                        const innerBox = child.el.querySelector('.v4-checkbox, .v4-radio');
                        if (innerBox) {
                            const isTextEnabled = child.el.querySelector('.v4-checkbox-container, .v4-radio-container')?.getAttribute('data-text-enabled') !== 'false';
                            if (!isTextEnabled) {
                                innerBox.style.width = newW + 'px';
                                innerBox.style.height = newH + 'px';
                            }
                        }
                        const selectbox = child.el.querySelector('.v4-selectbox-header');
                        if (selectbox) selectbox.style.width = '100%';
                        const inputWrap = child.el.querySelector('.v4-textbox-container, .v4-textarea-container');
                        if (inputWrap) {
                            inputWrap.style.width = '100%';
                            inputWrap.style.height = '100%';
                        }
                        const btn = child.el.querySelector('.v4-custom-btn, .v4-btn-container');
                        if (btn) {
                            btn.style.width = '100%';
                            btn.style.height = '100%';
                        }
                        
                        window.updateHandles(child.el);
                    });
                }
                
                window.updateHandles(window.activeEl);
                markDirty();
                notifyParent({ type: 'LF_COMP_RESIZED', w: nw, h: nh });
            }
        },
        
        handleMouseUp: function() {
            if (isDragging && window.activeEl) {
                notifyParent({ type: 'LF_SNAP_END' });
                
                if (window.activeEl.classList.contains('text-marker') || window.activeEl.classList.contains('pin-marker')) {
                    const idx = parseInt(window.activeEl.id.replace('v4-pin-', ''));
                    notifyParent({
                        type: 'LF_UPDATE_PIN_POS',
                        index: idx,
                        x: parseFloat(window.activeEl.style.left) || 0,
                        y: parseFloat(window.activeEl.style.top) || 0,
                        standardized: true
                    });
                }
                if (window.activeEl.classList.contains('lf-group')) {
                    const scale = (window.parent && window.parent.state && window.parent.state.transform) ? window.parent.state.transform.scale : 1;
                    const hostRect = document.body.getBoundingClientRect();
                    window.activeEl.querySelectorAll('.text-marker, .pin-marker').forEach(child => {
                        const idx = parseInt(child.id.replace('v4-pin-', ''));
                        if (!isNaN(idx)) {
                            const childRect = child.getBoundingClientRect();
                            const absX = (childRect.left - hostRect.left) / scale;
                            const absY = (childRect.top - hostRect.top) / scale;
                            notifyParent({
                                type: 'LF_UPDATE_PIN_POS',
                                index: idx,
                                x: absX,
                                y: absY,
                                standardized: true
                            });
                        }
                    });
                }
            }
            if (isResizing && window.activeEl) {
                window.activeEl.setAttribute('data-resized', 'true');
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
            }
            document.querySelectorAll('.lf-component').forEach(s => s.classList.remove('dragging-now'));
            isPendingDrag = false;
            isDragging = false;
            isResizing = false;
            window.activeEl = null;
            groupChildrenStart = null;
        },
        
        startResize: function(e, r) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            isResizing = true;
            window.activeEl = r.parentElement;
            startX = e.clientX;
            startY = e.clientY;
            startW = window.activeEl.offsetWidth;
            startH = window.activeEl.offsetHeight;
            
            if (window.activeEl.classList.contains('lf-group')) {
                groupChildrenStart = Array.from(window.activeEl.querySelectorAll('.lf-component'))
                    .map(child => ({
                        el: child,
                        left: parseFloat(child.style.left) || 0,
                        top: parseFloat(child.style.top) || 0,
                        width: parseFloat(child.style.width) || child.offsetWidth || 0,
                        height: parseFloat(child.style.height) || child.offsetHeight || 0
                    }));
            } else {
                groupChildrenStart = null;
            }
            e.preventDefault();
        }
    };
})();
`;
