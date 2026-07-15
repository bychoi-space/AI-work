/**
 * assets/vctrl_iframe_interactions.js
 * Mouse drag, resize, and marquee selection interactions for LF Editor Studio (Iframe Side).
 */

window.v4InteractionScript = `
(function() {
    console.log("[V4 Iframe Interactions] Initializing...");
    let isMarquee = false;
    let startX = 0, startY = 0, startW = 0, startH = 0, startTop = 0, startLeft = 0;
    let startRect = null, groupChildrenStart = null;
    let rafId = null;

    const notifyParent = (data) => { if (window.parent) window.parent.postMessage(data, '*'); };
    const markDirty = () => { notifyParent({ type: 'LF_DIRTY' }); };

    document.addEventListener('mousedown', e => {
        if (e.target.closest('.sidebar') || e.target.closest('.modal') || e.target.closest('.header-metadata')) return;

        let h = e.target.closest('.lf-drag-handle'), r = e.target.closest('.lf-resizer'), d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        
        if (c && !h && !r && !d) {
            if (!c.classList.contains('text-marker') && !c.classList.contains('pin-marker')) {
                let parent = c.parentElement.closest('.lf-component');
                while (parent) {
                    if (parent.classList.contains('text-marker') || parent.classList.contains('pin-marker')) break;
                    c = parent;
                    // If we've reached a group, stop here — do not bubble past the group
                    if (c.classList.contains('lf-group')) break;
                    parent = c.parentElement.closest('.lf-component');
                }
            }
        }

        if (d && c) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            if (c.classList.contains('connector-line')) {
                notifyParent({ type: 'LF_DELETE_CONNECTOR', id: c.id });
                c.remove();
            }
            else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                const idx = parseInt(c.id.replace('v4-pin-', ''));
                notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                c.remove();
            } else {
                c.remove();
            }

            markDirty(); 
            notifyParent({ type: 'LF_DESELECT' });
            return; 
        }
        if (c) {
            isMarquee = false;
            const isMulti = e.shiftKey || e.ctrlKey;
            if (isMulti) {
                c.classList.toggle('selected');
            } else {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                c.classList.add('selected');
            }
            window.updateHandles(c);
            notifyParent({ 
                type: "LF_COMP_SELECTED", 
                shiftKey: isMulti,
                ...window._getCompStyles(c)
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
            window.isResizing = true; 
            window.activeEl = r.parentElement; 
            startX = e.clientX; startY = e.clientY; 
            startW = window.activeEl.offsetWidth; startH = window.activeEl.offsetHeight; 
            
            if (window.activeEl.classList.contains('lf-group')) {
                groupChildrenStart = Array.from(window.activeEl.children)
                    .filter(child => child.classList.contains('lf-component'))
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
        else if (h || (c && !e.target.closest('td, th'))) { 
            window.isDragging = true; 
            window.isDraggingStarted = false;
            window.activeEl = c; 
            startX = e.clientX; startY = e.clientY; 
            startTop = parseInt(window.activeEl.style.top) || 0; startLeft = parseInt(window.activeEl.style.left) || 0; 
            startRect = window.activeEl.getBoundingClientRect();
            if (h || e.target.closest('.v4-editable-cell')) e.preventDefault(); 
            document.querySelectorAll('.lf-component.selected').forEach(s => s.classList.add('dragging-now'));
        }
    });

    // Double click to enter text editing mode (PPT-style)
    document.addEventListener('dblclick', e => {
        const editable = e.target.closest('.v4-editable-cell');
        if (editable) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            editable.focus();
        }
    });

    
    document.addEventListener('mousemove', e => {
        if (window.isDraggingLine && window.activeLineId) {
            const scale = (window.parent?.state?.transform?.scale) || 1;
            const dx = (e.clientX - window.startX) / scale;
            const dy = (e.clientY - window.startY) / scale;
            const conn = window.parent?.state?.connectors?.find(c => c.id === window.activeLineId);
            if (conn && window.startLineCoords) {
                conn.start.x = window.startLineCoords.start.x + dx;
                conn.start.y = window.startLineCoords.start.y + dy;
                conn.end.x = window.startLineCoords.end.x + dx;
                conn.end.y = window.startLineCoords.end.y + dy;
                conn.start.targetId = null; conn.start.side = null;
                conn.end.targetId = null; conn.end.side = null;
                window.updateConnectorPathLocal(window.activeLineId);
            }
            return;
        }

        if (window.isDrawingConnector) {
            const rect = document.body.getBoundingClientRect();
            const scale = (window.parent?.state?.transform?.scale) || 1;
            const logicalX = (e.clientX - rect.left) / scale;
            const logicalY = (e.clientY - rect.top) / scale;
            
            drawTempLine(window.connDragStartX, window.connDragStartY, logicalX, logicalY);
            
            // Toggle near-connector class based on distance inside iframe
            document.querySelectorAll('.lf-component').forEach(comp => {
                if (comp.id === window.startComponentId) return;
                const r = comp.getBoundingClientRect();
                const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
                const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    comp.classList.add('near-connector');
                } else {
                    comp.classList.remove('near-connector');
                }
            });

            const targetPort = e.target.closest('.lf-connector-port');
            if (targetPort && targetPort.parentElement.id !== window.startComponentId) {
                if (window.hoveredPort && window.hoveredPort !== targetPort) {
                    window.hoveredPort.style.transform = '';
                    window.hoveredPort.style.background = '#00e5ff';
                }
                window.hoveredPort = targetPort;
                window.hoveredPort.style.transform = 'scale(1.8)';
                window.hoveredPort.style.background = '#fb7185';
            } else {
                if (window.hoveredPort) {
                    window.hoveredPort.style.transform = '';
                    window.hoveredPort.style.background = '#00e5ff';
                    window.hoveredPort = null;
                }
            }
            return;
        }

        if (isMarquee) {
            notifyParent({ type: 'LF_MARQUEE_MOVE', x: e.clientX, y: e.clientY });
            window.getSelection()?.removeAllRanges();
            return;
        }
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (window.isConnectorDragging) {
                notifyParent({ type: 'LF_CONNECTOR_HANDLE_MOVE', clientX: e.clientX, clientY: e.clientY });
            }
            if (window.isDragging && window.activeEl) { 
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;

                // Threshold-based drag entry (Deadzone: 3px)
                const moveDist = Math.sqrt(dx * dx + dy * dy);
                if (!window.isDraggingStarted) {
                    if (moveDist < 3) {
                        return; // Ignore micro-movement
                    }
                    window.isDraggingStarted = true;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    notifyParent({ type: 'LF_SNAP_START' });
                }

                if (e.shiftKey) {
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        dy = 0;
                    } else {
                        dx = 0;
                    }
                }

                const scale = (window.parent?.state?.transform?.scale) || 1;
                const logicalX = startLeft + dx / scale;
                const logicalY = startTop + dy / scale;

                notifyParent({ type: 'LF_SNAP_REQUEST', x: logicalX, y: logicalY, w: window.activeEl.offsetWidth, h: window.activeEl.offsetHeight });
                markDirty(); 
            }
            else if (window.isResizing && window.activeEl) { 
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
                        
                        // Rescale inner elements for checkboxes / radios / other atoms
                        const innerBox = child.el.querySelector('.v4-checkbox, .v4-radio');
                        if (innerBox) {
                            const isTextEnabled = child.el.querySelector('.v4-checkbox-container, .v4-radio-container')?.getAttribute('data-text-enabled') !== 'false';
                            if (!isTextEnabled) {
                                innerBox.style.width = newW + 'px';
                                innerBox.style.height = newH + 'px';
                            }
                        }
                        
                        // Scale selectboxes, inputs, buttons inside grouped atoms
                        const selectbox = child.el.querySelector('.v4-selectbox-header');
                        if (selectbox) {
                            selectbox.style.width = '100%';
                        }
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
        });
    });

    document.addEventListener('mouseup', () => { 
        document.querySelectorAll('.lf-component').forEach(comp => comp.classList.remove('near-connector'));
        if (window.isDraggingLine) {
            window.isDraggingLine = false;
            startLineCoords = null;
            window.activeLineId = null;
            notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
            markDirty();
            return;
        }

        if (window.isDrawingConnector) {
            window.isDrawingConnector = false;
            document.body.classList.remove('drawing-line-active');
            document.querySelectorAll('.lf-component').forEach(comp => comp.classList.remove('near-connector'));
            removeTempLine();
            if (window.hoveredPort) {
                const targetComponentId = window.hoveredPort.parentElement.id;
                const targetPortSide = window.hoveredPort.getAttribute('data-side');
                window.hoveredPort.style.transform = '';
                window.hoveredPort.style.background = '#00e5ff';
                window.hoveredPort = null;
                
                notifyParent({
                    type: 'LF_CREATE_CONNECTOR',
                    startId: window.startComponentId,
                    startSide: window.startPortSide,
                    endId: targetComponentId,
                    endSide: targetPortSide
                });
            }
            return;
        }

        if (window.isConnectorDragging) {
            window.isConnectorDragging = false;
            document.body.classList.remove('drawing-line-active');
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_UP' });
        }
        if (isMarquee) {
            isMarquee = false;
            notifyParent({ type: 'LF_MARQUEE_END' });
        }
        if (window.isDragging && window.activeEl) {
            if (window.isDraggingStarted) {
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
        }
        if (window.isResizing && window.activeEl) {
            window.activeEl.setAttribute('data-resized', 'true');
            if (typeof window.enforceDesignSystem === 'function') {
                window.enforceDesignSystem();
            }
        }
        document.querySelectorAll('.lf-component').forEach(s => s.classList.remove('dragging-now'));
        window.isDragging = false; 
        window.isDraggingStarted = false;
        window.isResizing = false; 
        window.activeEl = null; 
    });
})();
`;
