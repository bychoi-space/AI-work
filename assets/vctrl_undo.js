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
            const html = getCleanHTML();
            let connectors = [];
            
            // Capture parent connector state if available
            if (window.parent && window.parent.state && window.parent.state.connectors) {
                connectors = JSON.parse(JSON.stringify(window.parent.state.connectors));
            }
            
            const currentState = JSON.stringify({ html, connectors });
            
            // Prevent duplicate states
            if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentState) {
                return;
            }

            undoStack.push(currentState);
            if (undoStack.length > MAX_HISTORY) {
                undoStack.shift();
            }
            console.log("[UndoManager] State Saved (HTML + Connectors). Stack size:", undoStack.length);
        },

        undo: function() {
            if (undoStack.length === 0) {
                console.warn("[UndoManager] Nothing to undo.");
                return;
            }

            const prevStateStr = undoStack.pop();
            const prevState = JSON.parse(prevStateStr);
            const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
            
            // 1. Restore HTML
            host.innerHTML = prevState.html;
            
            // 2. Restore Connectors in parent
            if (window.parent && window.parent.state && prevState.connectors) {
                window.parent.state.connectors = prevState.connectors;
                if (window.parent.ConnectorEngine) {
                    window.parent.ConnectorEngine.redrawAll();
                }
            }
            
            // 3. Re-initialize engine handles and listeners
            if (typeof window.initHandles === 'function') {
                window.initHandles();
            }
            markDirty();

            // 4. Symmetric Reverse Synchronization: 
            // Update parent metadata to perfectly match the restored DOM pins.
            if (window.parent && window.parent.state && window.parent.state.activeFile) {
                const descList = window.parent.state.activeFile.meta.description || [];
                const remainingPins = document.querySelectorAll('.text-marker');
                
                // Keep only the matching number of pins in description array
                if (descList.length > remainingPins.length) {
                    descList.splice(remainingPins.length);
                }
                
                remainingPins.forEach((pin, idx) => {
                    // Update index ID to keep them contiguous and sorted
                    pin.id = 'v4-pin-' + idx;
                    
                    const editable = pin.querySelector('.v4-editable-cell');
                    const textContent = editable ? editable.innerText.trim() : "Edit Text";
                    const htmlContent = editable ? editable.innerHTML : pin.innerHTML;
                    
                    if (!descList[idx]) {
                        descList[idx] = {};
                    }
                    
                    descList[idx].text = textContent;
                    descList[idx].html = htmlContent;
                    descList[idx].x = parseFloat(pin.style.left) || 0;
                    descList[idx].y = parseFloat(pin.style.top) || 0;
                    descList[idx].standardized = true;
                });
                
                // Re-render parent description sidebar to stay perfectly aligned
                if (typeof window.parent.renderDescriptionList === 'function') {
                    window.parent.renderDescriptionList();
                }
            }

            console.log("[UndoManager] Undo performed (HTML + Connectors). Remaining stack:", undoStack.length);
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
