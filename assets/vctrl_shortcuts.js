/**
 * assets/vctrl_shortcuts.js
 * Keyboard Shortcuts & Clipboard sync module for LF Editor Studio (Iframe Side).
 */

window.v4ShortcutsScript = `
(function() {
    let v4Clipboard = [];
    let isArrowMoving = false;

    const notifyParent = (data) => { window.parent.postMessage(data, '*'); };
    const markDirty = () => { notifyParent({ type: 'LF_DIRTY' }); };

    window.reorderAllPins = () => {
        const pins = document.querySelectorAll('.text-marker, .pin-marker');
        pins.forEach((pin, idx) => {
            pin.id = 'v4-pin-' + idx;
            const badge = pin.querySelector('.pin-number-badge');
            if (badge) {
                badge.innerText = idx + 1;
            }
        });
        if (window.parent && window.parent.state && window.parent.state.activeFile) {
            const descList = window.parent.state.activeFile.meta.description || [];
            const remainingPins = document.querySelectorAll('.text-marker, .pin-marker');
            if (descList.length > remainingPins.length) {
                descList.splice(remainingPins.length);
            }
            remainingPins.forEach((pin, idx) => {
                const isPinType = pin.classList.contains('pin-marker');
                if (!descList[idx]) {
                    descList[idx] = {};
                }
                descList[idx].x = parseFloat(pin.style.left) || 0;
                descList[idx].y = parseFloat(pin.style.top) || 0;
                descList[idx].standardized = true;
                if (isPinType) {
                    descList[idx].type = 'pin';
                } else {
                    const editable = pin.querySelector('.v4-editable-cell');
                    const textContent = editable ? editable.innerText.trim() : "Edit Text";
                    const htmlContent = editable ? editable.innerHTML : pin.innerHTML;
                    descList[idx].type = 'text';
                    descList[idx].text = textContent;
                    descList[idx].html = htmlContent;
                }
            });
            if (typeof window.parent.renderDescriptionList === 'function') {
                window.parent.renderDescriptionList();
            }
        }
    };

    window.copySelectedObjects = () => {
        const selected = document.querySelectorAll('.lf-component.selected');
        if (selected.length === 0) return;
        const topLevelSelected = Array.from(selected).filter(el => {
            let parent = el.parentElement;
            while (parent && parent !== document.body) {
                if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) {
                    return false;
                }
                parent = parent.parentElement;
            }
            return true;
        });
        const clipboardData = [];
        topLevelSelected.forEach(el => {
            clipboardData.push({
                html: el.innerHTML,
                className: el.className.replace(/\\bselected\\b/g, '').replace(/\\bdragging-now\\b/g, '').trim(),
                styleCssText: el.style.cssText,
                left: parseFloat(el.style.left) || 0,
                top: parseFloat(el.style.top) || 0,
                isGroup: el.classList.contains('lf-group'),
                isPinMarker: el.classList.contains('pin-marker'),
                isTextMarker: el.classList.contains('text-marker')
            });
        });
        v4Clipboard = clipboardData;
        try {
            if (window.top) {
                window.top.__lf_global_clipboard__ = clipboardData;
            }
        } catch (err) {
            console.error("[V4 Iframe] Failed to save clipboard to window.top:", err);
        }
        console.log("[V4 Iframe] Copied " + clipboardData.length + " object(s) to window.top global clipboard.");
    };

    window.pasteCopiedObjects = () => {
        let clipboardData = v4Clipboard;
        try {
            if (window.top && window.top.__lf_global_clipboard__) {
                clipboardData = window.top.__lf_global_clipboard__;
            }
        } catch (err) {
            console.warn("[V4 Iframe] Failed to load clipboard from window.top:", err);
        }
        
        if (!clipboardData || clipboardData.length === 0) {
            console.log("[V4 Iframe] Clipboard is empty.");
            return;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        document.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
        const host = document.body;
        const newSelectedIds = [];
        const offset = 15;
        clipboardData.forEach(item => {
            const v = document.createElement('div');
            const newId = item.isPinMarker ? ('v4-pin-' + Date.now() + Math.floor(Math.random() * 1000)) : ('v4-comp-' + Date.now() + Math.floor(Math.random() * 1000));
            v.id = newId;
            v.className = item.className + ' selected';
            v.style.cssText = item.styleCssText;
            v.style.left = (item.left + offset) + 'px';
            v.style.top = (item.top + offset) + 'px';
            v.innerHTML = item.html;
            v.querySelectorAll('.lf-component').forEach(child => child.classList.remove('selected'));
            v.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
            host.appendChild(v);
            newSelectedIds.push(newId);
        });
        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        } else if (typeof window.initHandles === 'function') {
            window.initHandles();
        }
        const hasPin = clipboardData.some(item => item.isPinMarker || item.isTextMarker);
        if (hasPin) {
            window.reorderAllPins();
        }
        if (newSelectedIds.length > 0) {
            const firstNewEl = document.getElementById(newSelectedIds[0]);
            if (firstNewEl && typeof window._getCompStyles === 'function') {
                notifyParent({
                    type: "LF_COMP_SELECTED",
                    ...window._getCompStyles(firstNewEl)
                });
            }
        }
        markDirty();
        console.log("[V4 Iframe] Pasted " + clipboardData.length + " object(s) from clipboard.");
    };

    document.addEventListener('keydown', e => {
        const isS = e.key.toLowerCase() === 's' || e.code === 'KeyS';
        const isC = e.key.toLowerCase() === 'c' || e.code === 'KeyC';
        const isV = e.key.toLowerCase() === 'v' || e.code === 'KeyV';
        const isG = e.key.toLowerCase() === 'g' || e.code === 'KeyG';

        if ((e.ctrlKey || e.metaKey) && isS) {
            e.preventDefault();
            notifyParent({ type: 'LF_TRIGGER_SAVE' });
            return;
        }
        if ((e.ctrlKey || e.metaKey) && isC) {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInput) {
                e.preventDefault();
                window.copySelectedObjects();
                return;
            }
        }
        if ((e.ctrlKey || e.metaKey) && isV) {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInput) {
                e.preventDefault();
                window.pasteCopiedObjects();
                return;
            }
        }
        if ((e.ctrlKey || e.metaKey) && isG) {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInput) {
                e.preventDefault();
                notifyParent({
                    type: 'LF_SHORTCUT_TRIGGERED',
                    shortcut: e.shiftKey ? 'ungroup' : 'group'
                });
            }
        }
        else if (e.code === 'Space') {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInput) {
                e.preventDefault();
                notifyParent({ type: 'LF_SPACE_DOWN' });
            }
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInput) {
                const selected = document.querySelectorAll('.lf-component.selected');
                if (selected.length > 0) {
                    e.preventDefault();
                    if (window.V4UndoManager && !isArrowMoving) {
                        window.V4UndoManager.saveState();
                        isArrowMoving = true;
                        notifyParent({ type: 'LF_SNAP_START' });
                    }
                    const step = e.shiftKey ? 10 : 1;
                    let dx = 0, dy = 0;
                    if (e.code === 'ArrowUp') dy = -step;
                    if (e.code === 'ArrowDown') dy = step;
                    if (e.code === 'ArrowLeft') dx = -step;
                    if (e.code === 'ArrowRight') dx = step;

                    const activeEl = selected[0];

                    selected.forEach(c => {
                        const l = parseFloat(c.style.left) || 0;
                        const t = parseFloat(c.style.top) || 0;
                        c.style.left = (l + dx) + 'px';
                        c.style.top = (t + dy) + 'px';
                        if (typeof window.updateHandles === 'function') window.updateHandles(c);
                        
                        if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                            const idx = parseInt(c.id.replace('v4-pin-', ''));
                            notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: l + dx, y: t + dy });
                        }
                        
                        if (c.classList.contains('connector-line')) {
                            notifyParent({ type: 'LF_SHIFT_CONNECTOR_POS', id: c.id, dx: dx, dy: dy });
                        }
                        
                        if (c.classList.contains('lf-group')) {
                            c.querySelectorAll('.text-marker, .pin-marker').forEach(child => {
                                const idx = parseInt(child.id.replace('v4-pin-', ''));
                                const childRect = child.getBoundingClientRect();
                                const hostRect = document.body.getBoundingClientRect();
                                const scale = (window.parent?.state?.transform?.scale) || 1;
                                const absX = (childRect.left - hostRect.left) / scale;
                                const absY = (childRect.top - hostRect.top) / scale;
                                notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: absX, y: absY });
                            });
                        }
                    });
                    
                    if (activeEl) {
                        const logicalX = parseFloat(activeEl.style.left) || 0;
                        const logicalY = parseFloat(activeEl.style.top) || 0;
                        
                        notifyParent({ 
                            type: 'LF_SNAP_REQUEST', 
                            x: logicalX, 
                            y: logicalY, 
                            w: activeEl.offsetWidth, 
                            h: activeEl.offsetHeight,
                            isArrowKey: true,
                            activeId: activeEl.id
                        });
                    }
                }
            }
        } else if (e.code === 'Delete' || e.code === 'Backspace') {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInput) {
                const selected = document.querySelectorAll('.lf-component.selected');
                if (selected.length > 0) {
                    e.preventDefault();
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    
                    selected.forEach(c => {
                        if (c.classList.contains('connector-line')) {
                            notifyParent({ type: 'LF_DELETE_CONNECTOR', id: c.id });
                        } else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                            const idx = parseInt(c.id.replace('v4-pin-', ''));
                            notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                            c.remove();
                        } else {
                            c.remove();
                        }
                    });
                    
                    notifyParent({ type: 'LF_DESELECT' });
                    markDirty();
                }
            }
        }
    });

    document.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            notifyParent({ type: 'LF_SPACE_UP' });
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            isArrowMoving = false;
            notifyParent({ type: 'LF_SNAP_END' });
        }
    });

    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;
        if (d.type === 'LF_SHORTCUT_KEY_PROXY') {
            const isCtrl = !!d.ctrlKey || !!d.metaKey;
            const keyChar = (d.key || "").toLowerCase();
            const isC = keyChar === 'c' || d.code === 'KeyC';
            const isV = keyChar === 'v' || d.code === 'KeyV';
            if (isCtrl && !d.isKeyUp) {
                if (isC) {
                    window.copySelectedObjects();
                    return;
                }
                if (isV) {
                    window.pasteCopiedObjects();
                    return;
                }
            }

            let eventType = 'keydown';
            if (d.code === 'Space') eventType = 'keyup';
            else if (d.isKeyUp) eventType = 'keyup';

            const event = new KeyboardEvent(eventType, {
                code: d.code,
                key: d.key,
                shiftKey: !!d.shiftKey,
                ctrlKey: !!d.ctrlKey,
                metaKey: !!d.metaKey,
                bubbles: true
            });
            document.dispatchEvent(event);
        }
    });
})();
`;
