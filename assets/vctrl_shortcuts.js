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
        console.log("[Clipboard Debug] copySelectedObjects running. Selected elements count:", selected.length);
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
            // Clean up 'selected' and 'dragging-now' classes safely without regex escape issues
            const cleanClasses = el.className.split(' ')
                .map(c => c.trim())
                .filter(c => c && c !== 'selected' && c !== 'dragging-now')
                .join(' ');

            // Collect all custom data attributes and id for synchronization
            const attrs = {};
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('data-') || attr.name === 'id') {
                    attrs[attr.name] = attr.value;
                }
            });

            clipboardData.push({
                html: el.innerHTML,
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
        v4Clipboard = clipboardData;
        notifyParent({
            type: 'LF_SAVE_CLIPBOARD',
            clipboard: clipboardData
        });
        console.log("[Clipboard Debug] Copied " + clipboardData.length + " object(s). Notifying parent with LF_SAVE_CLIPBOARD.");
    };

    window.pasteCopiedObjectsFromData = (clipboardData) => {
        console.log("[Clipboard Debug] pasteCopiedObjectsFromData running. Items to paste:", clipboardData ? clipboardData.length : 0);
        if (!clipboardData || clipboardData.length === 0) {
            console.log("[Clipboard Debug] Clipboard is empty.");
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

            // Restore all cloned data attributes to the new container
            if (item.attributes) {
                Object.keys(item.attributes).forEach(attrName => {
                    if (attrName !== 'id') { // Skip binding the old parent container ID
                        v.setAttribute(attrName, item.attributes[attrName]);
                    }
                });
            }

            // Regenerate IDs of all nested child components to prevent duplicate ID issues
            const idMap = {};
            const childrenWithId = v.querySelectorAll('[id]');
            childrenWithId.forEach(child => {
                const oldId = child.id;
                let prefix = 'v4-comp-';
                if (child.classList.contains('pin-marker') || oldId.startsWith('v4-pin-')) {
                    prefix = 'v4-pin-';
                }
                const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000000) + Math.floor(Math.random() * 1000);
                const newChildId = prefix + uniqueSuffix;
                child.id = newChildId;
                idMap[oldId] = newChildId;
            });

            // If this is a group component, remap children IDs inside its metadata attributes
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
        console.log("[Clipboard Debug] Pasted " + clipboardData.length + " object(s) successfully.");
    };

    window.pasteCopiedObjects = () => {
        console.log("[Clipboard Debug] pasteCopiedObjects calling LF_REQUEST_CLIPBOARD to parent.");
        notifyParent({ type: 'LF_REQUEST_CLIPBOARD' });
    };

    function isInputActive(target) {
        if (!target) return false;
        return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
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
            e.preventDefault();
            const selected = document.querySelectorAll('.lf-component.selected');
            const activeElement = document.activeElement;
            const isEditing = isInputActive(activeElement);

            if (selected.length > 0) {
                if (isEditing) {
                    console.log("[VCTRL SHORTCUTS] Blurring iframe text editing.");
                    activeElement.blur();
                }
                console.log("[VCTRL SHORTCUTS] Focusing parent Quill editor.");
                notifyParent({ type: 'LF_FOCUS_PARENT_QUILL' });
            }
            return;
        }

        const isS = e.key === 's' || e.key === 'S' || e.code === 'KeyS';
        const isC = e.key === 'c' || e.key === 'C' || e.code === 'KeyC';
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
