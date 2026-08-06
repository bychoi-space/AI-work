/**
 * assets/vctrl_shortcuts.js
 * Keyboard Shortcuts & Clipboard sync module for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4ShortcutsScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4ShortcutsScript = `
(function() {
    let v4Clipboard = [];
    let isArrowMoving = false;
    let isPastingLocked = false;

    window.reorderAllPins = () => {
        const pins = document.querySelectorAll('.text-marker, .pin-marker');
        pins.forEach((pin, idx) => {
            pin.id = 'v4-pin-' + idx;
            const badge = pin.querySelector('.pin-number-badge');
            if (badge) {
                badge.innerText = idx + 1;
            }
        });
        try {
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
        } catch (e) {
            console.warn("[V4 Shortcuts] Parent window access guarded under file:// protocol:", e);
        }
    };

    window.copySelectedObjects = () => {
        const selected = document.querySelectorAll('.lf-component.selected');
        const selectedConnIds = (window.parent && window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.getSelectedIds === 'function')
            ? window.parent.ConnectorEngine.getSelectedIds()
            : [];
        console.log("[Clipboard Debug] copySelectedObjects running. Selected elements:", selected.length, "connectors:", selectedConnIds.length);
        if (selected.length === 0 && selectedConnIds.length === 0) return;

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
        const copiedConnectorIds = new Set(selectedConnIds);

        topLevelSelected.forEach(el => {
            const cleanClasses = el.className.split(' ')
                .map(c => c.trim())
                .filter(c => c && c !== 'selected' && c !== 'dragging-now')
                .join(' ');

            const attrs = {};
            Array.from(el.attributes).forEach(attr => {
                const name = attr.name;
                if (name === 'data-source-id' || name === 'data-target-id') return;
                if (name.startsWith('data-') || name === 'id') {
                    attrs[name] = attr.value;
                }
            });

            if (el.classList.contains('lf-group')) {
                const connIdsStr = el.getAttribute('data-connectors');
                if (connIdsStr) {
                    try {
                        const connIds = JSON.parse(connIdsStr);
                        if (Array.isArray(connIds)) {
                            connIds.forEach(id => copiedConnectorIds.add(id));
                        }
                    } catch(e) {}
                }
            }

            const clone = el.cloneNode(true);
            clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(h => h.remove());

            clipboardData.push({
                html: clone.innerHTML,
                className: cleanClasses,
                styleCssText: el.style.cssText,
                left: parseFloat(el.style.left) || 0,
                top: parseFloat(el.style.top) || 0,
                isGroup: el.classList.contains('lf-group'),
                isPinMarker: el.classList.contains('pin-marker'),
                isTextMarker: el.classList.contains('text-marker'),
                attributes: attrs
            });
        });

        if (window.parent && window.parent.state && Array.isArray(window.parent.state.connectors)) {
            copiedConnectorIds.forEach(connId => {
                const conn = window.parent.state.connectors.find(c => c && c.id === connId);
                if (conn && conn.start && conn.end) {
                    clipboardData.push({
                        isConnector: true,
                        connId: conn.id,
                        connType: conn.type || 'straight',
                        start: JSON.parse(JSON.stringify(conn.start)),
                        end: JSON.parse(JSON.stringify(conn.end)),
                        style: conn.style ? JSON.parse(JSON.stringify(conn.style)) : { stroke: '#475569', strokeWidth: 1.6 }
                    });
                }
            });
        }

        v4Clipboard = clipboardData;
        notifyParent({
            type: 'LF_SAVE_CLIPBOARD',
            clipboard: clipboardData
        });
        console.log("[Clipboard Debug] Copied " + clipboardData.length + " item(s). Notifying parent with LF_SAVE_CLIPBOARD.");
    };

    window.cutSelectedObjects = () => {
        const selected = document.querySelectorAll('.lf-component.selected');
        const selectedConnIds = (window.parent && window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.getSelectedIds === 'function')
            ? window.parent.ConnectorEngine.getSelectedIds()
            : [];
        console.log("[Clipboard Debug] cutSelectedObjects running. Selected elements:", selected.length, "connectors:", selectedConnIds.length);
        if (selected.length === 0 && selectedConnIds.length === 0) return;

        window.copySelectedObjects();

        if (Array.isArray(v4Clipboard)) {
            v4Clipboard.forEach(item => item.isCut = true);
        }
        if (window.top && Array.isArray(window.top.__lf_global_clipboard__)) {
            window.top.__lf_global_clipboard__.forEach(item => item.isCut = true);
        }
        notifyParent({
            type: 'LF_SAVE_CLIPBOARD',
            clipboard: v4Clipboard
        });

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

        if (selectedConnIds.length > 0) {
            selectedConnIds.forEach(id => {
                notifyParent({ type: 'LF_DELETE_CONNECTOR', id: id });
            });
        }

        notifyParent({ type: 'LF_DESELECT' });
        markDirty();
        console.log("[Clipboard Debug] Cut operation complete.");
    };

    window.pasteCopiedObjectsFromData = (clipboardData) => {
        console.log("[Clipboard Debug] pasteCopiedObjectsFromData running. Items to paste:", clipboardData ? clipboardData.length : 0);
        if (!clipboardData || clipboardData.length === 0) {
            console.log("[Clipboard Debug] Clipboard is empty.");
            return;
        }

        try {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            document.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
            const host = document.body;
            const newSelectedIds = [];
            const selectedIdsIsGroupMap = {};
            const isCutOperation = clipboardData.some(item => item.isCut === true);
            const offset = isCutOperation ? 0 : 15;

            clipboardData.forEach(item => { item.isCut = false; });
            if (Array.isArray(v4Clipboard)) v4Clipboard.forEach(item => { item.isCut = false; });
            if (window.top && Array.isArray(window.top.__lf_global_clipboard__)) {
                window.top.__lf_global_clipboard__.forEach(item => { item.isCut = false; });
            }
            notifyParent({
                type: 'LF_SAVE_CLIPBOARD',
                clipboard: clipboardData
            });

            const nowStamp = Date.now();

            const componentItems = clipboardData.filter(item => !item.isConnector);
            const connectorItems = clipboardData.filter(item => item.isConnector);
            const idMap = {};

            componentItems.forEach((item, idx) => {
                const v = document.createElement('div');
                const randSuffix = Math.floor(Math.random() * 1000000) + '_' + idx;
                const newId = item.isPinMarker ? ('v4-pin-' + nowStamp + '_' + randSuffix) : ('v4-comp-' + nowStamp + '_' + randSuffix);
                v.id = newId;
                v.className = item.className + ' selected';
                v.style.cssText = item.styleCssText;
                v.style.left = (item.left + offset) + 'px';
                v.style.top = (item.top + offset) + 'px';
                v.innerHTML = item.html;

                if (item.attributes && item.attributes.id) {
                    idMap[item.attributes.id] = newId;
                }

                if (item.isGroup) {
                    selectedIdsIsGroupMap[newId] = true;
                }

                if (item.attributes) {
                    Object.keys(item.attributes).forEach(attrName => {
                        if (attrName !== 'id' && attrName !== 'data-connectors' && attrName !== 'data-source-id' && attrName !== 'data-target-id') {
                            v.setAttribute(attrName, item.attributes[attrName]);
                        }
                    });
                }
                v.removeAttribute('data-source-id');
                v.removeAttribute('data-target-id');

                const childrenWithId = v.querySelectorAll('[id]');
                childrenWithId.forEach((child, cIdx) => {
                    const oldId = child.id;
                    let prefix = 'v4-comp-';
                    if (child.classList.contains('pin-marker') || oldId.startsWith('v4-pin-')) {
                        prefix = 'v4-pin-';
                    }
                    const uniqueSuffix = nowStamp + '_' + Math.floor(Math.random() * 1000000) + '_' + cIdx;
                    const newChildId = prefix + uniqueSuffix;
                    child.id = newChildId;
                    idMap[oldId] = newChildId;
                });

                if (item.isGroup) {
                    const rawChildren = v.getAttribute('data-children');
                    if (rawChildren) {
                        try {
                            const childIds = JSON.parse(rawChildren);
                            const newChildIds = childIds.map(oldId => idMap[oldId] || oldId);
                            v.setAttribute('data-children', JSON.stringify(newChildIds));
                        } catch (e) {
                            console.warn("[Clipboard] Failed to remap data-children inside cloned group:", e);
                        }
                    }
                }

                v.querySelectorAll('.lf-component').forEach(child => child.classList.remove('selected'));
                v.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
                host.appendChild(v);
                newSelectedIds.push(newId);
            });

            // Paste connectors
            const pastedConnIds = [];
            if (connectorItems.length > 0 && window.parent && window.parent.state) {
                if (!Array.isArray(window.parent.state.connectors)) {
                    window.parent.state.connectors = [];
                }
                connectorItems.forEach((cItem, cIdx) => {
                    const newConnId = 'conn_' + nowStamp + '_' + Math.floor(Math.random() * 1000000) + '_' + cIdx;
                    const newStart = { ...cItem.start, x: (cItem.start.x || 0) + offset, y: (cItem.start.y || 0) + offset };
                    const newEnd = { ...cItem.end, x: (cItem.end.x || 0) + offset, y: (cItem.end.y || 0) + offset };

                    if (newStart.targetId && idMap[newStart.targetId]) newStart.targetId = idMap[newStart.targetId];
                    else { newStart.targetId = null; newStart.side = null; }

                    if (newEnd.targetId && idMap[newEnd.targetId]) newEnd.targetId = idMap[newEnd.targetId];
                    else { newEnd.targetId = null; newEnd.side = null; }

                    const newConn = {
                        id: newConnId,
                        type: cItem.connType || 'straight',
                        start: newStart,
                        end: newEnd,
                        style: cItem.style ? { ...cItem.style } : { stroke: '#475569', strokeWidth: 1.6 }
                    };
                    window.parent.state.connectors.push(newConn);
                    pastedConnIds.push(newConnId);
                    newSelectedIds.push(newConnId);
                });

                if (window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.redrawAll === 'function') {
                    window.parent.ConnectorEngine.redrawAll();
                }
                if (window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.setSelectedIds === 'function') {
                    window.parent.ConnectorEngine.setSelectedIds(pastedConnIds);
                }
                notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent.state.connectors });
            }

            if (typeof window.enforceDesignSystem === 'function') {
                try { window.enforceDesignSystem(); } catch(dsErr) { console.warn("[Clipboard] enforceDesignSystem error:", dsErr); }
            } else if (typeof window.initHandles === 'function') {
                try { window.initHandles(); } catch(ihErr) { console.warn("[Clipboard] initHandles error:", ihErr); }
            }

            const hasPin = clipboardData.some(item => item.isPinMarker || item.isTextMarker);
            if (hasPin && typeof window.reorderAllPins === 'function') {
                try { window.reorderAllPins(); } catch(pinErr) { console.warn("[Clipboard] reorderAllPins error:", pinErr); }
            }

            if (newSelectedIds.length > 0) {
                const firstNewEl = document.getElementById(newSelectedIds[0]);
                const firstStyles = (firstNewEl && typeof window._getCompStyles === 'function') ? window._getCompStyles(firstNewEl) : {};
                notifyParent({
                    type: "LF_PASTE_COMPLETED",
                    ids: newSelectedIds,
                    selectedIdsIsGroupMap: selectedIdsIsGroupMap,
                    firstCompStyles: firstStyles
                });
            }
            if (typeof window.markDirty === 'function') window.markDirty();
            else if (typeof markDirty === 'function') markDirty();
            else notifyParent({ type: 'LF_DIRTY' });

            try { window.focus(); } catch(e) {}
            console.log("[Clipboard Debug] Pasted " + clipboardData.length + " item(s) successfully.");
        } catch(err) {
            console.error("[Clipboard Error] Exception in pasteCopiedObjectsFromData:", err);
        }
    };

    window.pasteCopiedObjects = () => {
        if (isPastingLocked) {
            console.log("[Clipboard Debug] Paste call throttled to prevent duplicate execution.");
            return;
        }
        isPastingLocked = true;
        setTimeout(() => { isPastingLocked = false; }, 400);
        console.log("[Clipboard Debug] pasteCopiedObjects calling LF_REQUEST_CLIPBOARD to parent.");
        notifyParent({ type: 'LF_REQUEST_CLIPBOARD' });
    };

    function isInputActive(target) {
        if (!target) return false;
        return target.isContentEditable || 
               ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
               !!(target.closest && target.closest('.v4-editable-cell, .ql-editor, [contenteditable="true"]'));
    }

    document.addEventListener('keydown', e => {
        if (e.altKey && ['1','2','3','4','5','6'].includes(e.key)) {
            e.preventDefault();
            const typeMap = {
                '1': 'left',
                '2': 'center',
                '3': 'right',
                '4': 'top',
                '5': 'middle',
                '6': 'bottom'
            };
            notifyParent({
                type: 'LF_SHORTCUT_ALIGN',
                alignType: typeMap[e.key]
            });
            return;
        }

        if (e.key === 'F2' || e.code === 'F2') {
            if (e.isComposing) return;
            e.preventDefault();
            const activeElement = document.activeElement;
            const isEditing = isInputActive(activeElement);

            if (isEditing) {
                console.log("[VCTRL SHORTCUTS] Exiting inline text editing mode via F2.");
                if (activeElement && typeof activeElement.blur === 'function') activeElement.blur();
            } else {
                const selected = document.querySelectorAll('.lf-component.selected');
                if (selected.length > 0) {
                    const targetComp = selected[0];
                    const editable = targetComp.querySelector('.v4-editable-cell, [contenteditable="true"]') ||
                                     targetComp.querySelector('.v4-shape-text-content, .v4-shape-text-overlay, .v4-text-shape-content');
                    if (editable) {
                        console.log("[VCTRL SHORTCUTS] Entering inline text editing mode via F2.");
                        if (typeof window.focusEditableCell === 'function') {
                            window.focusEditableCell(editable);
                        } else {
                            try {
                                window.focus();
                                if (window.top && window.top !== window) {
                                    const iframe = window.top.document.getElementById('main-iframe');
                                    if (iframe && iframe.contentWindow) iframe.contentWindow.focus();
                                }
                            } catch(err) {}
                            editable.setAttribute('contenteditable', 'true');
                            editable.focus();
                        }
                    } else {
                        console.log("[VCTRL SHORTCUTS] No inline editable element found, focusing parent Quill.");
                        notifyParent({ type: 'LF_FOCUS_PARENT_QUILL' });
                    }
                }
            }
            return;
        }

        const isS = e.key === 's' || e.key === 'S' || e.code === 'KeyS';
        const isC = e.key === 'c' || e.key === 'C' || e.code === 'KeyC';
        const isX = e.key === 'x' || e.key === 'X' || e.code === 'KeyX';
        const isV = e.key === 'v' || e.key === 'V' || e.code === 'KeyV';
        const isG = e.key === 'g' || e.key === 'G' || e.code === 'KeyG';
        const inInput = isInputActive(e.target);

        if ((e.ctrlKey || e.metaKey) && isS) {
            e.preventDefault();
            notifyParent({ type: 'LF_TRIGGER_SAVE' });
            return;
        }
        if ((e.ctrlKey || e.metaKey) && isC && !inInput) {
            e.preventDefault();
            window.copySelectedObjects();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && isX && !inInput) {
            e.preventDefault();
            window.cutSelectedObjects();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && isV && !inInput) {
            e.preventDefault();
            window.pasteCopiedObjects();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && isG && !inInput) {
            e.preventDefault();
            notifyParent({
                type: 'LF_SHORTCUT_TRIGGERED',
                shortcut: e.shiftKey ? 'ungroup' : 'group'
            });
        }
        else if (e.code === 'Space' && !inInput) {
            e.preventDefault();
            notifyParent({ type: 'LF_SPACE_DOWN' });
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && !inInput) {
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
                        const connIdsStr = c.getAttribute('data-connectors');
                        const connIds = connIdsStr ? JSON.parse(connIdsStr) : [];
                        connIds.forEach(connId => {
                            notifyParent({ type: 'LF_SHIFT_CONNECTOR_POS', id: connId, dx: dx, dy: dy });
                        });
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
        } else if ((e.code === 'Delete' || e.code === 'Backspace') && !inInput) {
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
    });
    document.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            notifyParent({ type: 'LF_SPACE_UP' });
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            isArrowMoving = false;
            notifyParent({ type: 'LF_SNAP_END' });
        }
    });

    document.addEventListener('paste', e => {
        const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
        if (isInput) return; // Allow default text paste in inputs

        const items = (e.clipboardData || window.clipboardData).items;
        let hasImage = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                console.log("[Clipboard Debug] Image detected in paste event.");
                hasImage = true;
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(evt) {
                    notifyParent({
                        type: 'LF_INSERT_IMAGE_COMP',
                        base64: evt.target.result
                    });
                };
                reader.readAsDataURL(file);
                e.preventDefault();
                break;
            }
        }
        if (!hasImage) {
            console.log("[Clipboard Debug] No image in paste event, requesting copied components from parent.");
            e.preventDefault();
            window.pasteCopiedObjects();
        }
    });

    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;
        if (d.type === 'LF_RESPONSE_CLIPBOARD') {
            console.log("[Clipboard Debug] Iframe received LF_RESPONSE_CLIPBOARD with items:", d.clipboard);
            window.pasteCopiedObjectsFromData(d.clipboard);
            return;
        }
        if (d.type === 'LF_SHORTCUT_KEY_PROXY') {
            const isCtrl = !!d.ctrlKey || !!d.metaKey;
            const keyChar = (d.key || "").toLowerCase();
            const isC = keyChar === 'c' || d.code === 'KeyC';
            const isX = keyChar === 'x' || d.code === 'KeyX';
            const isV = keyChar === 'v' || d.code === 'KeyV';
            if (isCtrl && !d.isKeyUp) {
                if (isC) {
                    window.copySelectedObjects();
                    return;
                }
                if (isX) {
                    window.cutSelectedObjects();
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
