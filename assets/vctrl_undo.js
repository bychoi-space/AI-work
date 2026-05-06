/**
 * vctrl_undo.js - Undo/Redo Manager for LF Editor Studio
 * Responsibility: Canvas snapshot management and Ctrl+Z restoration.
 */

window.V4UndoManager = (function() {
    const MAX_HISTORY = 5;
    let undoStack = [];

    // Notify parent that content is dirty
    function markDirty() {
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({ type: 'LF_DIRTY' }, '*');
        }
    }

    // Clean up HTML before saving (remove UI handles)
    function getCleanHTML() {
        const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
        const clone = host.cloneNode(true);
        
        // Remove UI elements that shouldn't be in the snapshot
        clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
        clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
        
        return clone.innerHTML;
    }

    return {
        saveState: function() {
            const currentState = getCleanHTML();
            
            // Prevent duplicate states (e.g. redundant focus events)
            if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentState) {
                return;
            }

            undoStack.push(currentState);
            if (undoStack.length > MAX_HISTORY) {
                undoStack.shift();
            }
            console.log("[UndoManager] State Saved. Stack size:", undoStack.length);
        },

        undo: function() {
            if (undoStack.length === 0) {
                console.warn("[UndoManager] Nothing to undo.");
                return;
            }

            const prevState = undoStack.pop();
            const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
            
            // Restore HTML
            host.innerHTML = prevState;
            
            // Re-initialize engine handles and listeners
            if (typeof window.initHandles === 'function') {
                window.initHandles();
            }
            
            markDirty();
            console.log("[UndoManager] Undo performed. Remaining stack:", undoStack.length);
        },

        init: function() {
            // Global Ctrl+Z listener
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    this.undo();
                }
            });
            console.log("[UndoManager] Initialized.");
        }
    };
})();

// Auto-initialize when loaded inside iframe
if (window.V4UndoManager) {
    window.V4UndoManager.init();
}
