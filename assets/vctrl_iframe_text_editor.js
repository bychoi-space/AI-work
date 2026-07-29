/**
 * vctrl_iframe_text_editor.js
 * Manages F2 key toggles, contenteditable focus/blur, caret operations, 
 * double-click text editing, and text mutation handlers inside iframe.
 */
(function() {
    // Global helper for focus swapping and placing caret at text end
    window.focusEditableCell = function(el) {
        if (!el) return;
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        el.setAttribute('contenteditable', 'true');
        try {
            window.focus();
            if (window.top && window.top !== window) {
                const iframe = window.top.document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow) iframe.contentWindow.focus();
            }
        } catch(err) {}
        el.focus();
        try {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } catch(err) {}
    };

    // Double click to enter text editing mode
    document.addEventListener('dblclick', function(e) {
        const editable = e.target.closest('.v4-editable-cell');
        if (editable) {
            window.focusEditableCell(editable);
        }
    });

    // Handle text change mutations inside contenteditable
    document.addEventListener('input', function(e) {
        if (e.target.classList && e.target.classList.contains('v4-editable-cell')) {
            if (typeof window.markDirty === 'function') window.markDirty();
        }
    });
})();

