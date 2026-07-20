window.v4UIAtomsScript = `
(function() {
    console.log("[V4 UI Atoms] Module initialized.");
    

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

    // Attach to global window object
    window.bindStepperEvents = bindStepperEvents;
    window.bindFileuploadEvents = bindFileuploadEvents;
    window.bindAccordionEvents = bindAccordionEvents;
    window.bindToggleEvents = bindToggleEvents;
})();
`;
