window.v4ObjectShapeScript = `
(function() {
    console.log("[V4 Object Shape] Module initialized.");
    window.v4ObjectShape = window.v4ObjectShape || {};

    window.v4ObjectShape.handleUpdateStyle = (d) => {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return false;
        const shape = s.querySelector('.v4-shape') || (s.classList.contains('v4-shape') ? s : null);
        if (!shape) {
            // If the selected component is not a shape, let the legacy fallback inside dispatcher handle it!
            return false;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        // Find all matching elements (both self and querySelectorAll)
        let targets = [];
        if (d.selector) {
            if (s.matches && s.matches(d.selector)) targets.push(s);
            targets.push(...Array.from(s.querySelectorAll(d.selector)));
        } else {
            targets = [shape];
        }
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
                    if (t !== s) t.style.width = '100%';
                }
                if (d.style.height !== undefined) {
                    s.style.height = d.style.height;
                    if (t !== s) t.style.height = '100%';
                }

                if (d.style.patternType !== undefined && t.classList.contains('v4-shape-pattern-grid')) {
                    console.log("[ObjectShape] Received patternType:", d.style.patternType, "Updating element:", t);
                    t.setAttribute('data-pattern-type', d.style.patternType);
                }

                const isSvgContainer = t.classList.contains('v4-shape-diamond') || t.classList.contains('v4-shape-triangle') || t.classList.contains('v4-shape-wave') || t.classList.contains('v4-shape-arrow');
                const svgShape = t.querySelector('path, polygon, rect, circle') || t.closest('.v4-shape')?.querySelector('path, polygon, rect, circle');

                // Assign styles with override for text alignment and background styling
                for (const [key, val] of Object.entries(d.style)) {
                    if (key === 'width' || key === 'height' || key === 'html' || key === 'patternType') continue;
                    
                    if (key === 'background' || key === 'backgroundColor') {
                        if (isSvgContainer) {
                            // SVG container shapes maintain a transparent container background so bounding box isn't rendered
                            t.style.background = 'transparent';
                            t.style.backgroundColor = 'transparent';
                        } else {
                            t.style[key] = val;
                        }
                    } else if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent' || key === 'borderRadius') {
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
                            });
                        } else if (key === 'justifyContent' || key === 'alignItems') {
                            t.querySelectorAll('p, span, .ql-editor, .ql-editor p, .v4-shape-text-content, .v4-editable-cell').forEach(child => {
                                child.style.setProperty(cssKey, val, 'important');
                            });
                        }
                    } else {
                        t.style[key] = val;
                    }
                }
                
                if (svgShape) {
                    const targetFill = d.style.backgroundColor || d.style.background;
                    if (targetFill !== undefined) {
                        svgShape.style.fill = targetFill;
                    }
                    if (isSvgContainer) {
                        t.style.background = 'transparent';
                        t.style.backgroundColor = 'transparent';
                    }
                    if (d.style.borderColor) {
                        svgShape.style.stroke = d.style.borderColor;
                    }
                    if (d.style.borderWidth) {
                        svgShape.style.strokeWidth = d.style.borderWidth;
                    } else {
                        svgShape.style.strokeWidth = '1.6';
                    }
                    svgShape.style.vectorEffect = 'non-scaling-stroke';
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
