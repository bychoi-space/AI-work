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
    let currentConnectors = [];
    
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
            } catch (e) { console.warn("[V4 Undo] Save failed:", e); }
        },
        undo: function() {
            try {
                if (undoStack.length === 0) return;
                const prevState = JSON.parse(undoStack.pop());
                const currentScripts = Array.from(document.body.querySelectorAll('script'));
                const temp = document.createElement('div');
                temp.innerHTML = prevState.html;
                temp.querySelectorAll('script').forEach(el => el.remove());
                document.body.innerHTML = '';
                while (temp.firstChild) {
                    document.body.appendChild(temp.firstChild);
                }
                currentScripts.forEach(script => {
                    document.body.appendChild(script);
                });
                if (prevState.connectors) {
                    currentConnectors = prevState.connectors;
                    if (typeof notifyParent === 'function') notifyParent({ type: 'LF_RESTORE_CONNECTORS', connectors: prevState.connectors });
                }
                if (typeof window.initHandles === 'function') window.initHandles();
                if (typeof window.markDirty === 'function') window.markDirty();
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
