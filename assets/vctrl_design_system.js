/**
 * assets/vctrl_design_system.js
 * Design System & Styling enforcement module for LF Editor Studio (Iframe Side).
 */

window.v4DesignSystemScript = `
(function() {
    const notifyParent = (data) => { window.parent.postMessage(data, '*'); };
    const markDirty = () => { notifyParent({ type: 'LF_DIRTY' }); };

    const resizeAtomToFitText = (s) => {
        if (!s) return;
        // Skip resizing if the atom component is already grouped inside an 'lf-group' to prevent layout breakages.
        if (s.closest && s.closest('.lf-group')) {
            return;
        }
        const container = s.querySelector('.v4-checkbox-container, .v4-radio-container');
        if (!container) return;
        
        const boxEl = container.querySelector('.v4-checkbox, .v4-radio');
        if (!boxEl) return;

        const textEnabled = container.getAttribute('data-text-enabled') !== 'false';
        if (textEnabled) {
            const textEl = container.querySelector('.v4-checkbox-text, .v4-radio-text');
            if (textEl) {
                const boxW = parseFloat(boxEl.style.width) || 24;
                const boxH = parseFloat(boxEl.style.height) || 24;
                const textWidth = textEl.scrollWidth || 35;
                const totalWidth = boxW + 8 + textWidth + 8;
                s.style.width = totalWidth + 'px';
                s.style.height = Math.max(32, boxH + 8) + 'px';
            }
        } else {
            if (s.getAttribute('data-resized') === 'true') {
                const parentW = parseFloat(s.style.width) || s.offsetWidth;
                const parentH = parseFloat(s.style.height) || s.offsetHeight;
                boxEl.style.width = parentW + 'px';
                boxEl.style.height = parentH + 'px';
            } else {
                const boxW = parseFloat(boxEl.style.width) || 24;
                const boxH = parseFloat(boxEl.style.height) || 24;
                s.style.width = boxW + 'px';
                s.style.height = boxH + 'px';
            }
        }
        if (typeof window.updateHandles === 'function') window.updateHandles(s);
    };

    const bindStepperEvents = () => {
        document.querySelectorAll('.v4-stepper-container').forEach(container => {
            const min = parseInt(container.getAttribute('data-min')) || 1;
            const max = parseInt(container.getAttribute('data-max')) || 99;
            const cur = parseInt(container.getAttribute('data-val')) || min;

            const decBtn = container.querySelector('.v4-stepper-dec');
            const incBtn = container.querySelector('.v4-stepper-inc');
            const valEl = container.querySelector('.v4-stepper-value');

            if (container._eventsBound) {
                const isDisabled = container.getAttribute('data-disabled') === 'true';
                if (isDisabled) {
                    if (decBtn) {
                        decBtn.style.backgroundColor = '';
                        decBtn.style.color = '';
                        decBtn.style.cursor = 'not-allowed';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = '';
                        incBtn.style.color = '';
                        incBtn.style.cursor = 'not-allowed';
                    }
                } else {
                    if (decBtn) {
                        decBtn.style.backgroundColor = cur === min ? '#f3f4f6' : '#ffffff';
                        decBtn.style.color = cur === min ? '#9ca3af' : '#374151';
                        decBtn.style.cursor = cur === min ? 'not-allowed' : 'pointer';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = cur === max ? '#f3f4f6' : '#ffffff';
                        incBtn.style.color = cur === max ? '#9ca3af' : '#374151';
                        incBtn.style.cursor = cur === max ? 'not-allowed' : 'pointer';
                    }
                }
                return;
            }
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');
            
            const updateVal = (newVal) => {
                const currentMin = parseInt(container.getAttribute('data-min')) || 1;
                const currentMax = parseInt(container.getAttribute('data-max')) || 99;
                let val = Math.max(currentMin, Math.min(currentMax, newVal));
                container.setAttribute('data-val', val);
                if (valEl) valEl.innerText = val;
                
                const isDisabled = container.getAttribute('data-disabled') === 'true';
                if (isDisabled) {
                    if (decBtn) {
                        decBtn.style.backgroundColor = '';
                        decBtn.style.color = '';
                        decBtn.style.cursor = 'not-allowed';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = '';
                        incBtn.style.color = '';
                        incBtn.style.cursor = 'not-allowed';
                    }
                } else {
                    if (decBtn) {
                        decBtn.style.backgroundColor = val === currentMin ? '#f3f4f6' : '#ffffff';
                        decBtn.style.color = val === currentMin ? '#9ca3af' : '#374151';
                        decBtn.style.cursor = val === currentMin ? 'not-allowed' : 'pointer';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = val === currentMax ? '#f3f4f6' : '#ffffff';
                        incBtn.style.color = val === currentMax ? '#9ca3af' : '#374151';
                        incBtn.style.cursor = val === currentMax ? 'not-allowed' : 'pointer';
                    }
                }
            };
            
            if (decBtn) {
                decBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (container.getAttribute('data-disabled') === 'true') return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const currentVal = parseInt(container.getAttribute('data-val')) || 1;
                    updateVal(currentVal - 1);
                    markDirty();
                };
            }
            if (incBtn) {
                incBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (container.getAttribute('data-disabled') === 'true') return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const currentVal = parseInt(container.getAttribute('data-val')) || 1;
                    updateVal(currentVal + 1);
                    markDirty();
                };
            }
            
            updateVal(cur);
        });
    };

    const bindFileuploadEvents = () => {
        document.querySelectorAll('.v4-fileupload-container').forEach(container => {
            const delBtn = container.querySelector('.v4-fileupload-delete');
            const txt = container.querySelector('.v4-fileupload-textbox');
            const isSel = container.getAttribute('data-selected') === 'true';
            const fName = container.getAttribute('data-file-name') || '';
            const placeholder = container.getAttribute('data-placeholder') || '선택된 파일 없음';
            
            if (txt) {
                const targetText = isSel ? fName : placeholder;
                if (txt.innerText !== targetText) {
                    txt.innerText = targetText;
                }
                const targetColor = isSel ? 'rgb(55, 65, 81)' : 'rgb(156, 163, 175)';
                const hexColor = isSel ? '#374151' : '#9ca3af';
                if (txt.style.color !== hexColor && txt.style.color !== targetColor) {
                    txt.style.color = hexColor;
                }
            }

            if (container._eventsBound) return;
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');
            
            if (delBtn) {
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    
                    container.setAttribute('data-selected', 'false');
                    if (txt) {
                        txt.innerText = container.getAttribute('data-placeholder') || '선택된 파일 없음';
                        txt.style.color = '#9ca3af';
                    }
                    
                    markDirty();
                    
                    if (typeof window._getCompStyles === 'function') {
                        notifyParent({
                            type: 'LF_COMP_SELECTED',
                            ...window._getCompStyles(container.closest('.lf-component'))
                        });
                    }
                };
            }
        });
    };

    const bindAccordionEvents = () => {
        document.querySelectorAll('.v4-accordion-container').forEach(container => {
            const header = container.querySelector('.v4-accordion-header');
            if (!header) return;
            if (container._eventsBound) return;
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');

            header.onclick = (e) => {
                e.stopPropagation();
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                const expanded = container.getAttribute('data-expanded') === 'true';
                container.setAttribute('data-expanded', expanded ? 'false' : 'true');
                
                if (typeof window.enforceDesignSystem === 'function') {
                    window.enforceDesignSystem();
                }
                markDirty();
            };
        });
    };

    const bindToggleEvents = () => {
        document.querySelectorAll('.v4-toggle-container').forEach(container => {
            const handle = container.querySelector('.v4-toggle-handle');
            if (container._eventsBound) {
                const isChecked = container.getAttribute('data-checked') === 'true';
                const toggleColor = container.getAttribute('data-color') || '#3b82f6';
                if (handle) {
                    if (isChecked) {
                        container.style.setProperty('background-color', toggleColor, 'important');
                        container.style.setProperty('border-color', toggleColor, 'important');
                        const trackW = container.offsetWidth || 80;
                        const trackH = container.offsetHeight || 30;
                        const trans = trackW - trackH;
                        handle.style.transform = 'translateX(' + trans + 'px)';
                    } else {
                        container.style.setProperty('background-color', 'rgb(203, 213, 225)', 'important');
                        container.style.setProperty('border-color', 'rgb(200, 200, 200)', 'important');
                        handle.style.transform = 'translateX(0)';
                    }
                }
                return;
            }
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');

            container.onclick = (e) => {
                e.stopPropagation();
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                const isChecked = container.getAttribute('data-checked') === 'true';
                container.setAttribute('data-checked', isChecked ? 'false' : 'true');
                
                bindToggleEvents();
                markDirty();
                
                if (typeof window._getCompStyles === 'function') {
                    notifyParent({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(container.closest('.lf-component'))
                    });
                }
            };

            const isChecked = container.getAttribute('data-checked') === 'true';
            const toggleColor = container.getAttribute('data-color') || '#3b82f6';
            if (handle) {
                if (isChecked) {
                    container.style.setProperty('background-color', toggleColor, 'important');
                    container.style.setProperty('border-color', toggleColor, 'important');
                    const trackW = container.offsetWidth || 80;
                    const trackH = container.offsetHeight || 30;
                    const trans = trackW - trackH;
                    handle.style.transform = 'translateX(' + trans + 'px)';
                } else {
                    container.style.setProperty('background-color', 'rgb(203, 213, 225)', 'important');
                    container.style.setProperty('border-color', 'rgb(200, 200, 200)', 'important');
                    handle.style.transform = 'translateX(0)';
                }
            }
        });
    };


    const resizeToFitText = (c, isShapeText) => {
        if (!c) return;
        const cell = c.querySelector('.v4-editable-cell') || c.querySelector('.v4-shape-text-content') || c.querySelector('.v4-shape-text-overlay');
        if (!cell) return;



        // Zero-Drift Measurement: Temporarily hide active UI handles before offsetWidth/height query
        const handle = c.querySelector(':scope > .lf-drag-handle');
        const resizer = c.querySelector(':scope > .lf-resizer');
        const delTrigger = c.querySelector(':scope > .lf-delete-trigger');
        
        const origHandleDisplay = handle ? handle.style.display : '';
        const origResizerDisplay = resizer ? resizer.style.display : '';
        const origDelDisplay = delTrigger ? delTrigger.style.display : '';
        
        if (handle) handle.style.setProperty('display', 'none', 'important');
        if (resizer) resizer.style.setProperty('display', 'none', 'important');
        if (delTrigger) delTrigger.style.setProperty('display', 'none', 'important');

        const origW = c.style.width;
        const origH = c.style.height;

        const targetPadding = isShapeText ? '0px' : '4px';
        if (cell.style.padding !== targetPadding) {
            cell.style.setProperty('padding', targetPadding, 'important');
        }

        if (c.style.minWidth !== 'unset') c.style.setProperty('min-width', 'unset', 'important');
        if (c.style.minHeight !== 'unset') c.style.setProperty('min-height', 'unset', 'important');

        let fontTarget = cell;
        const cellFontSize = window.getComputedStyle(cell).fontSize;
        const subEls = cell.querySelectorAll('span, font, strong, p');
        for (let i = 0; i < subEls.length; i++) {
            const subFs = window.getComputedStyle(subEls[i]).fontSize;
            if (subFs && subFs !== cellFontSize) {
                fontTarget = subEls[i];
                break;
            }
        }
        if (fontTarget === cell && subEls.length > 0) {
            fontTarget = subEls[0];
        }
        const compStyle = window.getComputedStyle(fontTarget);
        
        const measureSpan = document.createElement('span');
        measureSpan.style.visibility = 'hidden';
        measureSpan.style.position = 'absolute';
        measureSpan.style.whiteSpace = 'pre-wrap';
        measureSpan.style.fontFamily = compStyle.fontFamily;
        measureSpan.style.fontSize = compStyle.fontSize;
        measureSpan.style.fontWeight = compStyle.fontWeight;
        measureSpan.style.lineHeight = '1';
        measureSpan.style.letterSpacing = compStyle.letterSpacing;
        
        // Extract text containing only user-typed hard newlines
        let rawText = '';
        const paragraphs = cell.querySelectorAll('p');
        if (paragraphs.length > 0) {
            rawText = Array.from(paragraphs).map(p => p.textContent).join('\n');
        } else {
            const temp = document.createElement('div');
            temp.innerHTML = cell.innerHTML;
            temp.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
            rawText = temp.textContent || '';
        }

        const lf = String.fromCharCode(10);
        const cleanText = rawText
            .split(lf)
            .map(line => line.replace(/^[\s\u200B\u00A0\uFEFF]+|[\s\u200B\u00A0\uFEFF]+$/g, '').replace(/\u200B/g, ''))
            .join(lf);
        const firstLine = cleanText.split(lf)[0] || 'T';
        measureSpan.innerText = firstLine;
        document.body.appendChild(measureSpan);
        const singleLineH = measureSpan.offsetHeight;
        document.body.removeChild(measureSpan);

        measureSpan.innerText = cleanText;
        document.body.appendChild(measureSpan);
        const textW = measureSpan.offsetWidth;
        const textH = measureSpan.offsetHeight;
        document.body.removeChild(measureSpan);
        
        const isRealTextComp = c.classList.contains('v4-text-box') || c.classList.contains('v4-text-shape') || c.classList.contains('text-marker') || c.classList.contains('pin-marker');

        let paddingW = isShapeText ? 16 : 8;
        let paddingH = isShapeText ? 16 : 8;

        let targetW = textW + paddingW;
        let targetH = textH + paddingH;

        if (isRealTextComp || isShapeText) {
            const normalizedText = rawText.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
            const lineCount = normalizedText.split('\\n').length;
            
            if (lineCount === 1) {
                targetW = textW + (isRealTextComp && !isShapeText ? 10 : paddingW);
                targetH = textH + (isRealTextComp && !isShapeText ? 10 : paddingH);
            } else {
                const fsPx = parseFloat(compStyle.fontSize) || 14;
                targetW = textW + (isRealTextComp && !isShapeText ? 10 : paddingW);
                targetH = fsPx * 1.15 * lineCount + (isRealTextComp && !isShapeText ? 10 : paddingH);
            }
        }

        // Zero-Offset Calibration: Micro-adjust small text rendering to bypass subpixel dropping.
        const fsPx = parseFloat(compStyle.fontSize) || 14;
        let adjustY = '0px';
        if (fsPx <= 11) {
            adjustY = '-0.6px';
        }
        c.style.setProperty('--v4-text-adjust-y', adjustY);

        if (isRealTextComp || isShapeText) {
            if (isShapeText && !isRealTextComp) {
                // Text Shapes must preserve their manual/default dimensions, and only expand (Math.max) 
                // when the text dimensions actually exceed the container boundaries. 
                // Enforce minimum 36px height to prevent flat collapse.
                const currentW = parseFloat(origW) || c.offsetWidth || 120;
                const currentH = parseFloat(origH) || c.offsetHeight || 36;
                
                const newW = Math.max(currentW, targetW) + 'px';
                const newH = Math.max(currentH, targetH, 36) + 'px';
                if (origW !== newW) c.style.width = newW;
                if (origH !== newH) c.style.height = newH;
            } else {
                const finalW = targetW + 'px';
                const finalH = targetH + 'px';
                if (origW !== finalW) c.style.width = finalW;
                if (origH !== finalH) c.style.height = finalH;
            }
        }

        const shape = c.querySelector('.v4-shape');
        if (shape) {
            if (shape.style.width !== '100%') shape.style.width = '100%';
            if (shape.style.height !== '100%') shape.style.height = '100%';
        }
        if (cell.style.width !== '100%') cell.style.width = '100%';
        if (cell.style.height !== '100%') cell.style.height = '100%';

        // Restore UI handle styles to correct layout visibility
        if (handle) handle.style.display = origHandleDisplay;
        if (delTrigger) delTrigger.style.display = origDelDisplay;
        
        if (resizer) {
            const targetDisplay = isRealTextComp ? (isShapeText ? 'block' : 'none') : (origResizerDisplay || 'block');
            if (resizer.style.display !== targetDisplay) {
                resizer.style.setProperty('display', targetDisplay, 'important');
            }
        }
    };

    window.enforceDesignSystem = () => {
        if (typeof window.initHandles === 'function') {
            try { window.initHandles(); } catch(e) { console.error("Error in initHandles:", e); }
        }
        
        try {
            document.querySelectorAll('.lf-component').forEach(c => {
                const shapeText = c.querySelector('.v4-shape-text');
                const hasText = c.querySelector('.v4-shape-text-content') || c.querySelector('.v4-shape-text-overlay') || c.querySelector('.v4-editable-cell') || (shapeText && shapeText.querySelector('p'));
                if (shapeText && hasText) {
                    let textContainer = shapeText.querySelector('.v4-shape-text-content') || shapeText.querySelector('.v4-shape-text-overlay') || shapeText.querySelector('.v4-editable-cell');
                    if (!textContainer) {
                        const pElements = Array.from(shapeText.querySelectorAll('p, span, font'));
                        const container = document.createElement('div');
                        container.className = 'v4-shape-text-content';
                        container.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0px; box-sizing: border-box; overflow: hidden;';
                        pElements.forEach(p => container.appendChild(p));
                        if (container.childNodes.length === 0) {
                            container.innerHTML = '<p><br></p>';
                        }
                        shapeText.appendChild(container);
                        textContainer = container;
                    }
                    
                    // Trigger auto-resize & shrink
                    resizeToFitText(c, true);
                }
            });
            document.querySelectorAll('.text-marker, .v4-text-box, .v4-text-shape').forEach(c => {
                if (c.querySelector('.v4-shape')) return; // Exclude Shape components from text marker auto-sizing loop
                const cell = c.querySelector('.v4-editable-cell') || c;
                const isFocused = cell && (document.activeElement === cell || cell.contains(document.activeElement));
                const isDefault = cell && (cell.innerText === 'Edit Text' || cell.innerText === 'Text' || cell.innerText === 'Enter Premium Text');
                const isSelected = c.classList.contains('selected');
                if (isFocused || isDefault || isSelected) {
                    resizeToFitText(c, false);
                }
            });
        } catch(e) {
            console.error("[DesignSystem] Error in early resizeToFitText:", e);
        }

        try { bindStepperEvents(); } catch(e) { console.error("Error in bindStepperEvents:", e); }
        try { bindFileuploadEvents(); } catch(e) { console.error("Error in bindFileuploadEvents:", e); }
        try { bindAccordionEvents(); } catch(e) { console.error("Error in bindAccordionEvents:", e); }
        try { bindToggleEvents(); } catch(e) { console.error("Error in bindToggleEvents:", e); }

        try {
            document.querySelectorAll('.v4-admin-group-header').forEach(header => {
                const container = header.closest('.v4-admin-settings-container');
                if (container) {
                    const bgCol = container.getAttribute('data-group-header-bg') || '#73829c';
                    const textCol = container.getAttribute('data-group-header-color') || '#ffffff';
                    
                    if (header.style.height !== '50px') header.style.height = '50px';
                    if (header.style.display !== 'flex') header.style.display = 'flex';
                    if (header.style.alignItems !== 'center') header.style.alignItems = 'center';
                    if (header.style.padding !== '0px 16px') header.style.padding = '0 16px';
                    if (header.style.fontSize !== '14px') header.style.fontSize = '14px';
                    if (header.style.fontWeight !== '700') header.style.fontWeight = '700';
                    if (header.style.boxSizing !== 'border-box') header.style.boxSizing = 'border-box';
                    if (header.style.width !== '100%') header.style.width = '100%';
                    if (header.style.outline !== 'none') header.style.outline = 'none';
                    if (header.style.borderBottom !== '1.6px solid rgb(226, 232, 240)') header.style.borderBottom = '1.6px solid rgb(226, 232, 240)';
                    if (header.style.flexShrink !== '0') header.style.flexShrink = '0';
                    
                    if (header.getAttribute('data-enforced-bg') !== bgCol) {
                        header.style.backgroundColor = bgCol;
                        header.setAttribute('data-enforced-bg', bgCol);
                    }
                    if (header.getAttribute('data-enforced-color') !== textCol) {
                        header.style.color = textCol;
                        header.setAttribute('data-enforced-color', textCol);
                    }
                    
                    if (!header.dataset.inputBound) {
                        header.dataset.inputBound = 'true';
                        header.oninput = (e) => {
                            container.setAttribute('data-group-header-title', e.target.innerText);
                            markDirty();
                        };
                    }
                }
            });

            document.querySelectorAll('.v4-admin-settings-container').forEach(container => {
                const table = container.querySelector('.v4-admin-settings-table');
                if (table) {
                    if (table.style.flex !== '1 1 0%' && table.style.flex !== '1') table.style.flex = '1';
                    if (table.style.height !== 'auto') table.style.height = 'auto';
                }
                const comp = container.closest('.lf-component');
                if (comp) {
                    const hasGroupHeader = container.getAttribute('data-show-group-header') === 'true';
                    const headerHeight = hasGroupHeader ? 50 : 0;
                    const totalRows = parseInt(container.getAttribute('data-row-count')) || 1;
                    const globalRowHeight = parseInt(container.getAttribute('data-row-height')) || 50;
                    
                    let expectedHeight = headerHeight;
                    for (let i = 1; i <= totalRows; i++) {
                        const specificHeight = parseInt(container.getAttribute('data-row' + i + '-height')) || globalRowHeight;
                        expectedHeight += specificHeight;
                    }
                    
                    const currentHeight = parseInt(comp.style.height) || 0;
                    if (currentHeight !== expectedHeight) {
                        comp.style.height = expectedHeight + 'px';
                        if (typeof window.updateHandles === 'function') window.updateHandles(comp);
                    }
                }
            });
        } catch(e) { console.error("Error in admin settings enforceDesignSystem:", e); }
        
        const seenIds = new Set();
        document.querySelectorAll('.lf-component').forEach((c, idx) => {
            if (!c.id) {
                const isPin = c.classList.contains('pin-marker') || c.classList.contains('text-marker');
                c.id = (isPin ? 'v4-pin-' : 'v4-comp-') + Date.now() + '-' + idx;
            }
            if (seenIds.has(c.id)) {
                const isPin = c.classList.contains('pin-marker') || c.classList.contains('text-marker');
                const oldId = c.id;
                c.id = (isPin ? 'v4-pin-' : 'v4-comp-') + Date.now() + '-dedup-' + Math.floor(Math.random() * 1000) + '-' + idx;
                console.log("[V4 Self-healing] Deduplicated ID from: " + oldId + " to: " + c.id);
            }
            seenIds.add(c.id);
        });
        
        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.querySelector('.v4-checkbox-container') || c.querySelector('.v4-radio-container')) {
                resizeAtomToFitText(c);
            }
        });

        // === Atom Dimension Normalization ===
        // Atom components let internal CSS (flexbox, content) determine their size,
        // so the outer .lf-component wrapper may have no explicit style.width/height.
        // Grouping and other coordinate operations use style values as SSOT,
        // so we write offsetWidth/offsetHeight into the wrapper once at load time.
        const ATOM_SELECTORS = [
            '.v4-checkbox-container', '.v4-radio-container',
            '.v4-textbox-container', '.v4-textarea-container',
            '.v4-searchbar-container', '.v4-stepper-container',
            '.v4-selectbox-container', '.v4-fileupload-container',
            '.v4-alert-container', '.v4-btn-container',
            '.v4-datepicker-container', '.v4-accordion-container',
            '.v4-grid-container', '.v4-admin-settings-container',
            '.v4-toggle-container'
        ].join(', ');

        document.querySelectorAll('.lf-component').forEach(c => {
            // Skip group wrappers (their size is calculated separately)
            if (c.classList.contains('lf-group')) return;
            // Skip if the component is inside a group
            if (c.closest && c.closest('.lf-group')) return;
            // Skip if the outer wrapper already has explicit dimensions (preserve SSOT)
            if (c.style.width && c.style.height) return;
            // Only normalize atom components
            if (!c.querySelector(ATOM_SELECTORS)) return;

            const w = c.offsetWidth;
            const h = c.offsetHeight;
            if (w > 0 && !c.style.width) c.style.width = w + 'px';
            if (h > 0 && !c.style.height) c.style.height = h + 'px';
        });
        // ====================================


        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const accordion = c.querySelector('.v4-accordion-container');
            if (accordion) {
                const expanded = accordion.getAttribute('data-expanded') === 'true';
                const header = accordion.querySelector('.v4-accordion-header');
                const body = accordion.querySelector('.v4-accordion-body');
                const chevron = accordion.querySelector('.v4-accordion-chevron');
                
                const itemHeight = parseInt(accordion.getAttribute('data-item-height'));
                if (itemHeight) {
                    if (header) {
                        header.style.height = itemHeight + 'px';
                    }
                    accordion.querySelectorAll('.v4-accordion-item').forEach(item => {
                        item.style.setProperty('height', itemHeight + 'px', 'important');
                        item.style.setProperty('line-height', itemHeight + 'px', 'important');
                        item.style.setProperty('display', 'flex', 'important');
                        item.style.setProperty('align-items', 'center', 'important');
                        item.style.setProperty('box-sizing', 'border-box', 'important');
                        item.style.setProperty('padding-top', '0', 'important');
                        item.style.setProperty('padding-bottom', '0', 'important');
                    });
                }
                
                if (body) {
                    body.style.display = expanded ? 'flex' : 'none';
                }
                if (chevron) {
                    chevron.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
                }
                
                if (c.getAttribute('data-resized') !== 'true') {
                    const headerHeight = header ? header.offsetHeight || 36 : 36;
                    let totalHeight = headerHeight;
                    if (expanded && body) {
                        const origDisplay = body.style.display;
                        body.style.display = 'flex';
                        totalHeight += body.offsetHeight || 0;
                        body.style.display = origDisplay;
                    }
                    c.style.height = totalHeight + 'px';
                }
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const stepper = c.querySelector('.v4-stepper-container');
            if (stepper) {
                const btnEnabled = stepper.getAttribute('data-btn-enabled') !== 'false';
                const targetW = btnEnabled ? '154px' : '100px';
                const targetH = '30px';
                
                if (c.style.width !== targetW) c.style.width = targetW;
                if (c.style.height !== targetH) c.style.height = targetH;
                
                if (stepper.style.width !== '100%') stepper.style.width = '100%';
                if (stepper.style.height !== '100%') stepper.style.height = '100%';
                
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const selectbox = c.querySelector('.v4-selectbox-container');
            if (selectbox) {
                const dropdownActive = selectbox.getAttribute('data-dropdown-active') === 'true';
                const optionsRaw = selectbox.getAttribute('data-options') || "";
                const optionsArr = optionsRaw.split(',').map(s => s.trim()).filter(Boolean);
                
                const targetW = '150px';
                const targetH = dropdownActive ? (30 + (optionsArr.length * 30)) + 'px' : '30px';
                
                if (c.style.width !== targetW) c.style.width = targetW;
                if (c.style.height !== targetH) c.style.height = targetH;
                
                if (selectbox.style.width !== '100%') selectbox.style.width = '100%';
                if (selectbox.style.height !== '100%') selectbox.style.height = '100%';
                
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const fileupload = c.querySelector('.v4-fileupload-container');
            if (fileupload) {
                const targetW = '300px';
                const targetH = '30px';
                
                if (c.style.width !== targetW) c.style.width = targetW;
                if (c.style.height !== targetH) c.style.height = targetH;
                
                if (fileupload.style.width !== '100%') fileupload.style.width = '100%';
                if (fileupload.style.height !== '100%') fileupload.style.height = '100%';
                
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const alert = c.querySelector('.v4-alert-container');
            if (alert) {
                const btn1 = alert.querySelector('.v4-alert-btn-1');
                const btn2 = alert.querySelector('.v4-alert-btn-2');
                const btn3 = alert.querySelector('.v4-alert-btn-3');
                if (btn1) {
                    const style1 = alert.getAttribute('data-btn-style-1') || 'normal';
                    const targetClass = 'v4-alert-btn v4-alert-btn-1 style-' + style1;
                    if (btn1.className !== targetClass) btn1.className = targetClass;
                }
                if (btn2) {
                    const style2 = alert.getAttribute('data-btn-style-2') || 'normal';
                    const targetClass = 'v4-alert-btn v4-alert-btn-2 style-' + style2;
                    if (btn2.className !== targetClass) btn2.className = targetClass;
                }
                if (btn3) {
                    const style3 = alert.getAttribute('data-btn-style-3') || 'normal';
                    const targetClass = 'v4-alert-btn v4-alert-btn-3 style-' + style3;
                    if (btn3.className !== targetClass) btn3.className = targetClass;
                }

                if (c.getAttribute('data-resized') !== 'true') {
                    const header = alert.querySelector('.v4-alert-header');
                    const msgEl = alert.querySelector('.v4-alert-message');
                    const buttonsEl = alert.querySelector('.v4-alert-buttons');
                    
                    const showDesc = alert.getAttribute('data-show-desc') === 'true';
                    const descWrapper = alert.querySelector('.v4-alert-desc-wrapper');
                    let descH = 0;
                    if (descWrapper) {
                        if (showDesc) {
                            descWrapper.style.display = 'flex';
                            descH = descWrapper.offsetHeight || 27;
                            descH += 8;
                        } else {
                            descWrapper.style.display = 'none';
                        }
                    }
                    
                    const headerH = header ? header.offsetHeight : 32;
                    const msgH = msgEl ? msgEl.scrollHeight : 21;
                    const msgMargin = msgEl ? 14 : 0;
                    const buttonsH = buttonsEl ? buttonsEl.offsetHeight : 28;
                    const paddingH = 32;
                    
                    const targetH = headerH + paddingH + msgH + msgMargin + buttonsH + 2 + descH;
                    const finalHeight = Math.max(120, targetH) + 'px';
                    
                    if (c.style.height !== finalHeight) c.style.height = finalHeight;
                    if (alert.style.height !== '100%') alert.style.height = '100%';
                    if (alert.style.width !== '100%') alert.style.width = '100%';
                } else {
                    if (alert.style.width !== '100%') alert.style.width = '100%';
                    if (alert.style.height !== '100%') alert.style.height = '100%';
                }
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const toggle = c.querySelector('.v4-toggle-container');
            if (toggle) {
                if (c.getAttribute('data-resized') !== 'true') {
                    if (c.style.width !== '40px') c.style.width = '40px';
                    if (c.style.height !== '20px') c.style.height = '20px';
                }
                if (toggle.style.width !== '100%') toggle.style.width = '100%';
                if (toggle.style.height !== '100%') toggle.style.height = '100%';
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const btnContainer = c.querySelector('.v4-btn-container');
            if (btnContainer) {
                const btn = btnContainer.querySelector('.v4-custom-btn');
                if (btn) {
                    const style = btnContainer.getAttribute('data-btn-style') || 'normal';
                    const text = btnContainer.getAttribute('data-text') || '버튼';
                    const radius = btnContainer.getAttribute('data-btn-radius') || '6';
                    
                    const targetClass = 'v4-custom-btn style-' + style;
                    const targetRadius = radius + 'px';
                    
                    if (btn.className !== targetClass) btn.className = targetClass;
                    if (btn.style.borderRadius !== targetRadius) btn.style.borderRadius = targetRadius;
                    if (btn.innerText !== text) btn.innerText = text;

                    if (style !== 'custom') {
                        if (btn.style.backgroundColor !== '') btn.style.backgroundColor = '';
                        if (btn.style.borderColor !== '') btn.style.borderColor = '';
                        if (btn.style.color !== '') btn.style.color = '';
                    }

                    if (btn.style.borderWidth !== '1.6px') btn.style.setProperty('border-width', '1.6px', 'important');
                    if (btn.style.borderStyle !== 'solid') btn.style.setProperty('border-style', 'solid', 'important');
                }
                
                if (c.getAttribute('data-resized') !== 'true') {
                    const targetW = '80px';
                    const targetH = '30px';
                    if (c.style.width !== targetW) c.style.width = targetW;
                    if (c.style.height !== targetH) c.style.height = targetH;
                }
                
                if (btnContainer.style.width !== '100%') btnContainer.style.width = '100%';
                if (btnContainer.style.height !== '100%') btnContainer.style.height = '100%';
                
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const dp = c.querySelector('.v4-datepicker-container');
            if (!dp) return;

            const _fmtDate = (dt) => {
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, '0');
                const d2 = String(dt.getDate()).padStart(2, '0');
                return y + '/' + m + '/' + d2;
            };

            const showPresets = dp.getAttribute('data-show-presets') !== 'false';
            const presetsDiv = dp.querySelector('.v4-dp-presets');
            if (presetsDiv) {
                const targetDisplay = showPresets ? 'inline-flex' : 'none';
                if (presetsDiv.style.display !== targetDisplay) presetsDiv.style.display = targetDisplay;
            }

            const showEndDate = dp.getAttribute('data-show-end-date') !== 'false';
            const sep = dp.querySelector('.v4-dp-separator');
            const groups = dp.querySelectorAll('.v4-dp-input-group');
            const mode = dp.getAttribute('data-mode') || 'simple';
            
            if (mode !== 'detailed') {
                if (sep) {
                    const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                    if (sep.style.display !== targetDisplay) sep.style.display = targetDisplay;
                }
                if (groups && groups.length > 1) {
                    const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                    if (groups[1].style.display !== targetDisplay) groups[1].style.display = targetDisplay;
                }
            }

            const startEl = dp.querySelector('.v4-dp-start');
            const endEl = dp.querySelector('.v4-dp-end');
            const startTimeEl = dp.querySelector('.v4-dp-start-time');
            const endTimeEl = dp.querySelector('.v4-dp-end-time');
            
            const storedStart = dp.getAttribute('data-start-date') || '';
            const storedEnd = dp.getAttribute('data-end-date') || '';
            const storedStartTime = dp.getAttribute('data-start-time') || '10:00:00';
            const storedEndTime = dp.getAttribute('data-end-time') || '12:00:00';
            
            const defaultPreset = dp.getAttribute('data-default-preset') || 'none';

            if (startEl && storedStart && startEl.innerText !== storedStart) startEl.innerText = storedStart;
            if (endEl && storedEnd && endEl.innerText !== storedEnd) endEl.innerText = storedEnd;
            if (startTimeEl && storedStartTime && startTimeEl.innerText !== storedStartTime) startTimeEl.innerText = storedStartTime;
            if (endTimeEl && storedEndTime && endTimeEl.innerText !== storedEndTime) endTimeEl.innerText = storedEndTime;

            if (startEl && !startEl.innerText && defaultPreset && defaultPreset !== 'none') {
                const today = new Date();
                let startDt = null;
                let endDt = today;
                if (defaultPreset === '1D') { startDt = new Date(today); startDt.setDate(today.getDate() - 1); }
                else if (defaultPreset === '1W') { startDt = new Date(today); startDt.setDate(today.getDate() - 7); }
                else if (defaultPreset === '1M') { startDt = new Date(today); startDt.setMonth(today.getMonth() - 1); }
                else if (defaultPreset === '6M') { startDt = new Date(today); startDt.setMonth(today.getMonth() - 6); }
                if (startDt) {
                    const s = _fmtDate(startDt);
                    const e = endDt ? _fmtDate(endDt) : '';
                    if (startEl.innerText !== s) startEl.innerText = s;
                    if (endEl && endEl.innerText !== e) endEl.innerText = e;
                }
            }

            dp.querySelectorAll('.v4-dp-preset-btn').forEach(btn => {
                const isActive = btn.getAttribute('data-preset') === defaultPreset;
                const targetBg = isActive ? '#1d4ed8' : '#ffffff';
                const targetBc = isActive ? '#1d4ed8' : '#cccccc';
                const targetColor = isActive ? '#ffffff' : '#374151';
                const targetFw = isActive ? '700' : '600';
                if (btn.style.background !== targetBg) btn.style.background = targetBg;
                if (btn.style.borderColor !== targetBc) btn.style.borderColor = targetBc;
                if (btn.style.color !== targetColor) btn.style.color = targetColor;
                if (btn.style.fontWeight !== targetFw) btn.style.fontWeight = targetFw;
            });

            if (dp.style.width !== '100%') dp.style.width = '100%';
            if (dp.style.height !== '100%') dp.style.height = '100%';
            if (c.style.height !== '30px') c.style.height = '30px';

            // Dynamically adjust component wrapper width to match the inner content size
            const fieldsEl = dp.querySelector('.v4-dp-fields');
            const presetsEl = dp.querySelector('.v4-dp-presets');
            let contentW = 0;
            if (fieldsEl) {
                contentW += fieldsEl.offsetWidth || (showEndDate ? 266 : 126);
            }
            if (showPresets && presetsEl) {
                contentW += 8; // gap
                contentW += presetsEl.offsetWidth || 204;
            }
            if (contentW > 0) {
                const targetW = (contentW + 4) + 'px'; // add minor border/rounding padding
                if (c.style.width !== targetW) {
                    c.style.width = targetW;
                }
            }

            if (typeof window.updateHandles === 'function') window.updateHandles(c);
        });

        document.querySelectorAll('.v4-textbox-container, .v4-textarea-container').forEach(container => {
            const isTextarea = container.classList.contains('v4-textarea-container');
            const input = container.querySelector(isTextarea ? '.v4-textarea-input' : '.v4-textbox-input');
            const placeholder = container.querySelector(isTextarea ? '.v4-textarea-placeholder' : '.v4-textbox-placeholder');
            const counter = container.querySelector(isTextarea ? '.v4-textarea-counter' : '.v4-textbox-counter');
            
            if (!input) return;

            const restoreFonts = () => {
                const fs = container.getAttribute('data-fontsize');
                const ff = container.getAttribute('data-fontfamily');
                if (fs) {
                    const fsVal = fs + 'px';
                    if (input.style.fontSize !== fsVal) input.style.fontSize = fsVal;
                    if (placeholder && placeholder.style.fontSize !== fsVal) placeholder.style.fontSize = fsVal;
                }
                if (ff) {
                    if (input.style.fontFamily !== ff) input.style.fontFamily = ff;
                    if (placeholder && placeholder.style.fontFamily !== ff) placeholder.style.fontFamily = ff;
                    if (counter && counter.style.fontFamily !== ff) counter.style.fontFamily = ff;
                }
            };

            if (input._eventsBound) {
                const max = parseInt(container.getAttribute('data-maxlength')) || 100;
                const showCounter = container.getAttribute('data-show-counter') !== 'false';
                const text = input.innerText || "";
                if (counter) {
                    const currentLen = Math.min(text.length, max);
                    const newText = currentLen + '/' + max;
                    const newDisplay = showCounter ? 'block' : 'none';
                    if (counter.textContent !== newText) counter.textContent = newText;
                    if (counter.style.display !== newDisplay) counter.style.display = newDisplay;
                }
                restoreFonts();
                return;
            }
            input._eventsBound = true;
            input.removeAttribute('data-events-bound');
            restoreFonts();
            
            const getMaxLength = () => parseInt(container.getAttribute('data-maxlength')) || 100;
            const getShowCounter = () => container.getAttribute('data-show-counter') !== 'false';
            
            const updateUI = () => {
                const text = input.innerText || "";
                if (placeholder) {
                    const phDisplay = text.length === 0 ? 'block' : 'none';
                    if (placeholder.style.display !== phDisplay) placeholder.style.display = phDisplay;
                }
                
                const max = getMaxLength();
                if (text.length > max) {
                    const selection = window.getSelection();
                    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                    const offset = range ? range.startOffset : 0;
                    
                    input.innerText = text.substring(0, max);
                    
                    if (range && input.firstChild) {
                        try {
                            const newRange = document.createRange();
                            newRange.setStart(input.firstChild, Math.min(offset, max));
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        } catch(e) {}
                    }
                }
                
                if (counter) {
                    const currentLen = Math.min(input.innerText.length, max);
                    const newCounterText = currentLen + '/' + max;
                    const newCounterDisplay = getShowCounter() ? 'block' : 'none';
                    if (counter.textContent !== newCounterText) counter.textContent = newCounterText;
                    if (counter.style.display !== newCounterDisplay) counter.style.display = newCounterDisplay;
                }
                
                const newColor = text.length === 0 ? '#a3a3a3' : '#374151';
                if (input.style.color !== newColor) input.style.color = newColor;
            };
            
            input.addEventListener('input', () => {
                updateUI();
                markDirty();
            });
            input.addEventListener('focus', () => {
                if (placeholder) placeholder.style.display = 'none';
            });
            input.addEventListener('blur', () => {
                updateUI();
            });
            
            updateUI();
        });
        
        document.querySelectorAll('.lf-component').forEach(c => {
            if (c.parentElement !== document.body) return;
            const lStr = c.style.left || "";
            const tStr = c.style.top || "";
            
            if (lStr.includes('%')) {
                const val = parseFloat(lStr);
                const px = (val / 100) * 1440;
                c.style.left = px + 'px';
                console.log("[V4 Migration] Migrated " + c.id + " left: " + lStr + " -> " + c.style.left);
            }
            if (tStr.includes('%')) {
                const val = parseFloat(tStr);
                const px = (val / 100) * 900;
                c.style.top = px + 'px';
                console.log("[V4 Migration] Migrated " + c.id + " top: " + tStr + " -> " + c.style.top);
            }
        });

        document.querySelectorAll('.lf-component img').forEach(img => {
            const parent = img.parentElement;
            if (!parent) return;
            
            const isLogo = img.classList.contains('v4-logo-img');
            const isShare = img.src && img.src.includes('iconShare');
            const isIcon = img.classList.contains('lf-icon');
            
            if (isLogo || isShare || isIcon) {
                const div = document.createElement('div');
                div.className = img.className;
                if (!div.classList.contains('lf-icon')) {
                    div.classList.add('lf-icon');
                }
                
                const origSrc = img.getAttribute('data-original-src') || img.src;
                div.setAttribute('data-original-src', origSrc);
                
                const origBg = img.getAttribute('data-original-bg');
                if (origBg) div.setAttribute('data-original-bg', origBg);
                
                div.style.cssText = img.style.cssText;
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.pointerEvents = 'none';
                
                if (!isLogo) {
                    div.style.setProperty('padding', '8px', 'important');
                    div.style.setProperty('box-sizing', 'border-box', 'important');
                    div.style.setProperty('background-origin', 'content-box', 'important');
                    div.style.setProperty('background-clip', 'content-box', 'important');
                    div.style.setProperty('mask-origin', 'content-box', 'important');
                    div.style.setProperty('webkit-mask-origin', 'content-box', 'important');
                    div.style.setProperty('mask-clip', 'content-box', 'important');
                    div.style.setProperty('webkit-mask-clip', 'content-box', 'important');
                }
                
                const isColored = img.style.backgroundColor || img.getAttribute('data-original-bg');
                if (isColored) {
                    const color = img.style.backgroundColor || '';
                    div.style.setProperty('background-color', color, 'important');
                    div.style.setProperty('background-image', 'none', 'important');
                    
                    const bgUrl = 'url("' + origSrc + '")';
                    div.setAttribute('data-original-bg', bgUrl);
                    div.style.setProperty('webkit-mask-image', bgUrl, 'important');
                    div.style.setProperty('webkit-mask-position', 'center', 'important');
                    div.style.setProperty('webkit-mask-size', 'contain', 'important');
                    div.style.setProperty('webkit-mask-repeat', 'no-repeat', 'important');
                    
                    div.style.setProperty('mask-image', bgUrl, 'important');
                    div.style.setProperty('mask-position', 'center', 'important');
                    div.style.setProperty('mask-size', 'contain', 'important');
                    div.style.setProperty('mask-repeat', 'no-repeat', 'important');
                } else {
                    div.style.setProperty('background-image', 'url("' + origSrc + '")', 'important');
                    div.style.setProperty('background-size', 'contain', 'important');
                    div.style.setProperty('background-position', 'center', 'important');
                    div.style.setProperty('background-repeat', 'no-repeat', 'important');
                }
                
                parent.replaceChild(div, img);
                console.log("[V4 Migration] Migrated image icon/logo to div element:", origSrc);
            }
        });



        document.querySelectorAll('.v4-shape').forEach(s => {
            if (s.classList.contains('v4-shape-diamond') || s.classList.contains('v4-shape-triangle') || s.classList.contains('v4-shape-arrow')) {
                s.style.setProperty('border-width', '0px', 'important');
                return;
            }
            if (s.style.borderWidth !== '1.6px') s.style.setProperty('border-width', '1.6px', 'important');
        });
        document.querySelectorAll('table.v4-premium-table, table.v4-table, .v4-grid-container table').forEach(t => {
            if (t.style.borderWidth !== '1.6px') t.style.setProperty('border-width', '1.6px', 'important');
            
            t.querySelectorAll('td, th').forEach(cell => {
                const isCheckbox = cell.classList.contains('v4-grid-check-col') || 
                                 cell.querySelector('input[type="checkbox"]') || 
                                 cell.getAttribute('data-type') === 'checkbox';
                if (!isCheckbox) {
                    const nestedEditable = cell.querySelector('.v4-editable-cell, [contenteditable="true"]');
                    if (nestedEditable) {
                        const text = nestedEditable.innerText || nestedEditable.innerHTML || '';
                        nestedEditable.remove();
                        cell.innerHTML = text;
                    }
                    const target = cell;

                    if (!target.classList.contains('v4-editable-cell')) {
                        target.classList.add('v4-editable-cell');
                    }
                    if (target.getAttribute('contenteditable') !== 'true') {
                        target.setAttribute('contenteditable', 'true');
                    }
                    if (!target._eventsBound) {
                        target._eventsBound = true;
                        target.removeAttribute('data-events-bound');
                        
                        const selectParentComponent = () => {
                            const comp = target.closest('.lf-component');
                            if (comp && !comp.classList.contains('selected')) {
                                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                                comp.classList.add('selected');
                                if (window.updateHandles) window.updateHandles(comp);
                                
                                notifyParent({
                                    type: "LF_COMP_SELECTED",
                                    shiftKey: false,
                                    ...window._getCompStyles(comp)
                                });
                            }
                        };

                        target.addEventListener('mousedown', function(e) {
                            selectParentComponent();
                        });
                        target.addEventListener('click', function(e) {
                            e.stopPropagation();
                            selectParentComponent();
                        });
                        target.addEventListener('input', function() {
                            if (window.markDirty) window.markDirty();
                            const thCell = target.tagName === 'TH' ? target : target.closest('th');
                            if (thCell) {
                                try {
                                    const gridContainer = thCell.closest('.v4-grid-container');
                                    if (gridContainer) {
                                        const cols = JSON.parse(gridContainer.getAttribute('data-columns') || '[]');
                                        const idx = Array.from(thCell.parentElement.children).indexOf(thCell);
                                        if (cols[idx]) {
                                            cols[idx].name = thCell.innerText.replace(' ⇅', '').trim();
                                            gridContainer.setAttribute('data-columns', JSON.stringify(cols));
                                        }
                                    }
                                } catch(err) {}
                            }
                        });
                    }
                }
            });
            if (window.TableSelection) window.TableSelection.bindEvents(t);
        });
        document.querySelectorAll('.v4-grid-container').forEach(grid => {
            const showPagination = grid.getAttribute('data-pagination') !== 'false';
            const footer = grid.querySelector('.v4-grid-footer');
            if (footer) {
                const targetDisplay = showPagination ? 'flex' : 'none';
                if (footer.style.display !== targetDisplay) footer.style.display = targetDisplay;
            }
            const wrapper = grid.querySelector('.v4-grid-table-wrapper');
            if (wrapper) {
                const targetHeight = showPagination ? 'calc(100% - 36px)' : '100%';
                if (wrapper.style.height !== targetHeight) wrapper.style.height = targetHeight;
            }
            if (grid.style.borderWidth !== '1.6px') grid.style.setProperty('border-width', '1.6px', 'important');
        });
        document.querySelectorAll('polygon, path, rect, circle').forEach(svg => {
            if (svg.closest('.connector-line')) return;
            if (svg.getAttribute('stroke-width') !== '1.6') svg.setAttribute('stroke-width', '1.6');
            if (svg.style.strokeWidth !== '1.6') svg.style.strokeWidth = '1.6';
            if (svg.style.vectorEffect !== 'non-scaling-stroke') svg.style.vectorEffect = 'non-scaling-stroke';
        });

        // Clean z-index rules from .lf-component.selected stylesheets inside the iframe
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const sheet = document.styleSheets[i];
                const rules = sheet.cssRules || sheet.rules;
                if (rules) {
                    for (let j = rules.length - 1; j >= 0; j--) {
                        const rule = rules[j];
                        if (rule.selectorText && rule.selectorText.includes('.lf-component.selected')) {
                            rule.style.removeProperty('z-index');
                        }
                    }
                }
            } catch (e) {
                // Ignore security errors for external stylesheets
            }
        }
    };

    let dsObserver = null;
    let enforceQueued = false;
    const runEnforceSafe = () => {
        if (enforceQueued) return;
        enforceQueued = true;
        window.requestAnimationFrame(() => {
            if (dsObserver) dsObserver.disconnect();
            try {
                window.enforceDesignSystem();
            } catch(e) {
                console.error("[DesignSystem] enforceDesignSystem error:", e);
            }
            if (dsObserver) {
                dsObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
            }
            enforceQueued = false;
        });
    };

    window.suspendDesignSystem = () => {
        if (dsObserver) {
            dsObserver.disconnect();
            console.log("[DesignSystem] Suspended MutationObserver during batch DOM transformations.");
        }
    };

    window.resumeDesignSystem = () => {
        if (dsObserver) {
            runEnforceSafe();
            console.log("[DesignSystem] Resumed MutationObserver.");
        }
    };

    if (typeof window.enforceDesignSystem === 'function') {
        dsObserver = new MutationObserver(runEnforceSafe);
        runEnforceSafe();
        setTimeout(runEnforceSafe, 500);
    }
})();
`;
