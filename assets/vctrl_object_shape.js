window.v4ObjectShapeScript = `
(function() {
    console.log("[V4 Object Shape] Module initialized.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_STYLE'] = (d) => {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
        const shape = s.querySelector('.v4-shape');
        if (!shape) {
            // If the selected component is not a shape, let the legacy fallback inside dispatcher handle it!
            return;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        let t = d.selector ? s.querySelector(d.selector) : shape;
        if (!t) return;

        if (d.style) {
            if (d.style.width !== undefined || d.style.height !== undefined) {
                s.setAttribute('data-resized', 'true');
            }
            
            // Prevent structure destruction: Update innerHTML of shape-text-content/editable-cell instead of .v4-shape
            if (d.style.html !== undefined) {
                const targetCell = t.querySelector('.v4-shape-text-content') || t.querySelector('.v4-shape-text-overlay') || t.querySelector('.v4-editable-cell') || t;
                if (targetCell !== t) {
                    targetCell.innerHTML = d.style.html;
                } else {
                    t.innerHTML = d.style.html;
                }
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
            
            const svgShape = t.querySelector('path, polygon, rect, circle') || t.closest('.v4-shape')?.querySelector('path, polygon, rect, circle');
            if (svgShape) {
                if (d.style.backgroundColor || d.style.background) {
                    svgShape.style.fill = d.style.backgroundColor || d.style.background;
                    if (t.classList.contains('v4-shape-diamond') || t.classList.contains('v4-shape-triangle') || t.classList.contains('v4-shape-wave') || t.classList.contains('v4-shape-arrow')) {
                        t.style.backgroundColor = 'transparent';
                    }
                }
                if (d.style.borderColor) {
                    svgShape.style.stroke = d.style.borderColor;
                }
                if (d.style.borderWidth) {
                    svgShape.style.strokeWidth = d.style.borderWidth;
                }
            }
        }
        
        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }
    };
})();
`;
