window.v4ObjectTextScript = `
(function() {
    console.log("[V4 Object Text] Module initialized.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_STYLE'] = (d) => {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
        const isText = s.classList.contains('text-marker') || s.classList.contains('v4-text-box') || s.classList.contains('v4-text-shape');
        if (!isText) {
            // Let dispatcher fallback handle non-text components
            return;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        let t = s.querySelector('.v4-editable-cell') || s;
        if (d.style) {
            if (d.style.width !== undefined || d.style.height !== undefined) {
                s.setAttribute('data-resized', 'true');
            }
            if (d.style.html !== undefined) {
                t.innerHTML = d.style.html;
            }
            
            if (d.style.width !== undefined) {
                s.style.width = d.style.width;
            }
            if (d.style.height !== undefined) {
                s.style.height = d.style.height;
            }

            const styleToAssign = { ...d.style };
            delete styleToAssign.width;
            delete styleToAssign.height;
            Object.assign(t.style, styleToAssign);
        }
        
        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }
    };
})();
`;
