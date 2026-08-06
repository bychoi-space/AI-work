window.v4ObjectTextScript = `
(function() {
    console.log("[V4 Object Text] Module initialized.");
    window.v4ObjectText = window.v4ObjectText || {};

    window.v4ObjectText.handleUpdateStyle = (d) => {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return false;
        const isText = s.classList.contains('text-marker') || s.classList.contains('v4-text-box') || s.classList.contains('v4-text-shape');
        if (!isText) {
            // Let dispatcher fallback handle non-text components
            return false;
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
            
            for (const [key, val] of Object.entries(styleToAssign)) {
                if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent') {
                    const cssKey = key === 'textAlign' ? 'text-align' : (key === 'alignItems' ? 'align-items' : 'justify-content');
                    t.style.setProperty(cssKey, val, 'important');
                    t.querySelectorAll('p, span').forEach(child => {
                        child.style.setProperty(cssKey, val, 'important');
                    });
                } else {
                    t.style[key] = val;
                }
            }
        }
        
        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }
        if (typeof window.resizeToFitText === 'function') {
            window.resizeToFitText(s);
        }
        return true;
    };
})();
`;
