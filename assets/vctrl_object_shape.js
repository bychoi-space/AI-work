window.v4ObjectShapeScript = `
(function() {
    console.log("[V4 Object Shape] Module initialized.");
    window.v4ObjectShape = window.v4ObjectShape || {};

    window.v4ObjectShape.handleUpdateStyle = (d) => {
        const s = document.querySelector('.lf-component.selected'); if (!s) return false;
        const shape = s.querySelector('.v4-shape');
        if (!shape) {
            // If the selected component is not a shape, let the legacy fallback inside dispatcher handle it!
            return false;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        // Find all matching elements using querySelectorAll since selector can have comma-separated targets
        const targets = d.selector ? s.querySelectorAll(d.selector) : [shape];
        if (targets.length === 0) return false;

        targets.forEach(t => {
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

                if (d.style.patternType !== undefined && t.classList.contains('v4-shape-pattern-grid')) {
                    console.log("[ObjectShape] Received patternType:", d.style.patternType, "Updating element:", t);
                    t.setAttribute('data-pattern-type', d.style.patternType);
                }

                // Assign styles with override for text alignment to beat CSS !important
                for (const [key, val] of Object.entries(d.style)) {
                    if (key === 'width' || key === 'height' || key === 'html' || key === 'patternType') continue;
                    
                    if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent' || key === 'borderRadius') {
                        const cssKey = key === 'textAlign' ? 'text-align' : (key === 'alignItems' ? 'align-items' : (key === 'justifyContent' ? 'justify-content' : 'border-radius'));
                        t.style.setProperty(cssKey, val, 'important');
                        
                        if (key === 'textAlign') {
                            // Apply padding offset for left/right alignment (10px) to prevent sticking to borders
                            const padLeft = val === 'left' ? '10px' : '0px';
                            const padRight = val === 'right' ? '10px' : '0px';
                            t.style.setProperty('padding-left', padLeft, 'important');
                            t.style.setProperty('padding-right', padRight, 'important');
                            
                            // Propagate alignment to children (p, span, ql-editor, ql-editor p) to keep absolute consistency
                            t.querySelectorAll('p, span, .ql-editor, .ql-editor p').forEach(child => {
                                child.style.setProperty(cssKey, val, 'important');
                                child.style.setProperty('padding-left', padLeft, 'important');
                                child.style.setProperty('padding-right', padRight, 'important');
                                const flexAlign = val === 'left' ? 'flex-start' : (val === 'right' ? 'flex-end' : 'center');
                                child.style.setProperty('align-items', flexAlign, 'important');
                                child.style.setProperty('justify-content', flexAlign, 'important');
                            });
                        }
                    } else {
                        t.style[key] = val;
                    }
                }
                
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
        });
        
        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }
        return true;
    };
})();
`;
