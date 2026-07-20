/**
 * assets/vctrl_undo.js
 * Undo & Redo management module for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4UndoScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4UndoScript = `
window.V4UndoManager = (function() {
    const MAX_HISTORY = 10;
    let undoStack = [];
    let currentConnectors = []; // Locally synced connectors for secure undo
    
    
    function getCleanHTML() {
        const host = document.body;
        const clone = host.cloneNode(true);
        clone.querySelectorAll('script').forEach(el => el.remove());
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
                
                // Keep scripts from current body intact to prevent losing closures/context
                const currentScripts = Array.from(document.body.querySelectorAll('script'));
                
                // Create temporary container to parse restored body innerHTML
                const temp = document.createElement('div');
                temp.innerHTML = prevState.html;
                temp.querySelectorAll('script').forEach(el => el.remove());
                
                // Clear body
                document.body.innerHTML = '';
                
                // Restore new layout elements
                while (temp.firstChild) {
                    document.body.appendChild(temp.firstChild);
                }
                
                // Restore original script elements safely
                currentScripts.forEach(script => {
                    document.body.appendChild(script);
                });

                if (prevState.connectors) {
                    currentConnectors = prevState.connectors;
                    notifyParent({ type: 'LF_RESTORE_CONNECTORS', connectors: prevState.connectors });
                }
                
                if (window.parent && window.parent.state && window.parent.state.activeFile) {
                    const descList = window.parent.state.activeFile.meta.description || [];
                    const remainingPins = document.querySelectorAll('.text-marker, .pin-marker');
                    
                    if (descList.length > remainingPins.length) {
                        descList.splice(remainingPins.length);
                    }
                    
                    remainingPins.forEach((pin, idx) => {
                        pin.id = 'v4-pin-' + idx;
                        const isPinType = pin.classList.contains('pin-marker');
                        
                        if (!descList[idx]) {
                            descList[idx] = {};
                        }
                        
                        if (isPinType) {
                            // Circular Pin: Only sync coordinates, preserve type and text from parent state
                            descList[idx].x = parseFloat(pin.style.left) || 0;
                            descList[idx].y = parseFloat(pin.style.top) || 0;
                            descList[idx].type = 'pin';
                            descList[idx].standardized = true;
                        } else {
                            // Inline Text Component: Sync full content and style
                            const editable = pin.querySelector('.v4-editable-cell');
                            const textContent = editable ? editable.innerText.trim() : "Edit Text";
                            const htmlContent = editable ? editable.innerHTML : pin.innerHTML;
                            
                            descList[idx].text = textContent;
                            descList[idx].html = htmlContent;
                            descList[idx].x = parseFloat(pin.style.left) || 0;
                            descList[idx].y = parseFloat(pin.style.top) || 0;
                            descList[idx].type = 'text';
                            descList[idx].standardized = true;
                        }
                    });
                    
                    if (typeof window.parent.renderDescriptionList === 'function') {
                        window.parent.renderDescriptionList();
                    }
                }

                if (typeof window.initHandles === 'function') window.initHandles();
                markDirty();
                console.log("[V4 Undo] Undo Performed");
            } catch (e) { console.warn("[V4 Undo] Undo failed:", e); }
        },
        init: function() {
            document.addEventListener('keydown', (e) => {
                if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    window.V4UndoManager.undo();
                }
            });
            // Handle cross-origin safe sync
            window.addEventListener('message', (e) => {
                if (e.data && e.data.type === 'LF_SYNC_CONNECTORS') {
                    currentConnectors = e.data.connectors || [];
                } else if (e.data && e.data.type === 'LF_SAVE_UNDO') {
                    window.V4UndoManager.saveState();
                } else if (e.data && e.data.type === 'LF_TRIGGER_UNDO') {
                    window.V4UndoManager.undo();
                }
            });
        }
    };
})();
if (window.V4UndoManager) window.V4UndoManager.init();
`;
