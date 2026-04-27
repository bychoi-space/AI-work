/**
 * vctrl_v4_iframe.js
 * Handle component interaction (drag, resize, select) INSIDE the iframe.
 * Optimized for 'file://' protocol security constraints.
 */

(function() {
    let isDragging = false;
    let isResizing = false;
    let activeEl = null;
    let startX, startY, startW, startH, startTop, startLeft;

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
                comp.remove();
                markDirty();
                return;
            }

            if (comp) {
                // Deselect others
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                comp.classList.add('selected');
                
                // Notify parent
                notifyParent({ 
                    type: 'LF_COMP_SELECTED', 
                    id: comp.id,
                    isTable: !!comp.querySelector('table'),
                    isShape: comp.querySelector('.v4-shape') !== null
                });
            } else {
                // Deselect all internal components
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                notifyParent({ type: 'LF_DESELECT' });
            }

            if (handle) {
                isDragging = true;
                activeEl = handle.parentElement;
                startX = e.clientX; startY = e.clientY;
                startTop = parseInt(activeEl.style.top) || 0;
                startLeft = parseInt(activeEl.style.left) || 0;
                e.preventDefault();
            } else if (resizer) {
                isResizing = true;
                activeEl = resizer.parentElement;
                startX = e.clientX; startY = e.clientY;
                startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', e => {
            if (isDragging && activeEl) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                activeEl.style.top = (startTop + dy) + 'px';
                activeEl.style.left = (startLeft + dx) + 'px';
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
            isDragging = false;
            isResizing = false;
            activeEl = null;
        });

        // Handle text editing changes
        document.addEventListener('input', e => {
            if (e.target.classList.contains('v4-editable-cell')) {
                markDirty();
            }
        });

        // Handle content save requests from parent (bypasses file:// security)
        window.addEventListener('message', e => {
            if (e.data.type === 'LF_REQUEST_SAVE_CONTENT') {
                const clone = document.documentElement.cloneNode(true);
                // Clean up UI helpers
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
                const html = "<!DOCTYPE html>\n" + clone.outerHTML;
                notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: html });
            }
        });
    }

    init();
})();
