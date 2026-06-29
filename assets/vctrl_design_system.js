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

            if (container.dataset.eventsBound === "true") {
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
            container.dataset.eventsBound = "true";
            
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

            if (container.dataset.eventsBound === "true") return;
            container.dataset.eventsBound = "true";
            
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
            if (container.dataset.eventsBound === "true") return;
            container.dataset.eventsBound = "true";

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

    window.enforceDesignSystem = () => {
        if (typeof window.initHandles === 'function') window.initHandles();
        bindStepperEvents();
        bindFileuploadEvents();
        bindAccordionEvents();
        
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

        document.querySelectorAll('.lf-component').forEach(c => {
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
                    const targetH = '40px';
                    if (c.style.width !== targetW) c.style.width = targetW;
                    if (c.style.height !== targetH) c.style.height = targetH;
                }
                
                if (btnContainer.style.width !== '100%') btnContainer.style.width = '100%';
                if (btnContainer.style.height !== '100%') btnContainer.style.height = '100%';
                
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(c => {
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
            if (sep) {
                const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                if (sep.style.display !== targetDisplay) sep.style.display = targetDisplay;
            }
            if (groups && groups.length > 1) {
                const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                if (groups[1].style.display !== targetDisplay) groups[1].style.display = targetDisplay;
            }

            const startEl = dp.querySelector('.v4-dp-start');
            const endEl = dp.querySelector('.v4-dp-end');
            const storedStart = dp.getAttribute('data-start-date') || '';
            const storedEnd = dp.getAttribute('data-end-date') || '';
            const defaultPreset = dp.getAttribute('data-default-preset') || 'none';

            if (startEl && storedStart && startEl.innerText !== storedStart) startEl.innerText = storedStart;
            if (endEl && storedEnd && endEl.innerText !== storedEnd) endEl.innerText = storedEnd;

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

            if (input.dataset.eventsBound === "true") {
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
            input.dataset.eventsBound = "true";
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
            if (s.classList.contains('v4-shape-diamond') || s.classList.contains('v4-shape-triangle')) {
                s.style.setProperty('border-width', '0px', 'important');
                return;
            }
            if (s.style.borderWidth !== '1.6px') s.style.setProperty('border-width', '1.6px', 'important');
        });
        document.querySelectorAll('table.v4-premium-table').forEach(t => {
            if (t.style.borderWidth !== '1.6px') t.style.setProperty('border-width', '1.6px', 'important');
            if (window.TableSelection) window.TableSelection.bindEvents(t);
        });
        document.querySelectorAll('.v4-grid-container').forEach(grid => {
            const footer = grid.querySelector('.v4-grid-footer');
            if (footer) {
                const showPagination = grid.getAttribute('data-pagination') !== 'false';
                const targetDisplay = showPagination ? 'flex' : 'none';
                if (footer.style.display !== targetDisplay) footer.style.display = targetDisplay;
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

    if (typeof window.enforceDesignSystem === 'function') {
        window.enforceDesignSystem();
        const observer = new MutationObserver(() => window.enforceDesignSystem());
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
        setTimeout(() => window.enforceDesignSystem(), 500);
    }
})();
`;
