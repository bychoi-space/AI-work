/**
 * assets/vctrl_v4_atom_listeners.js
 * Event bindings and handlers for individual atom elements in LF Editor Studio.
 */

(function() {
    console.log("[V4 Addon Atoms] Binding atomic control settings...");
    
    const notifyIframe = (data) => {
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, data.type, data);
        }
    };

    const initCheckboxRadioEvents = () => {
        const notifyIframe = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };
        
        const activeY = document.getElementById('btn-atom-active-y');
        const activeN = document.getElementById('btn-atom-active-n');
        const textY = document.getElementById('btn-atom-text-y');
        const textN = document.getElementById('btn-atom-text-n');
        
        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        if (activeY) {
            activeY.onclick = () => {
                highlightActive(activeY, true);
                highlightActive(activeN, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_STATE', checked: true });
            };
        }
        if (activeN) {
            activeN.onclick = () => {
                highlightActive(activeN, true);
                highlightActive(activeY, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_STATE', checked: false });
            };
        }
        
        if (textY) {
            textY.onclick = () => {
                highlightActive(textY, true);
                highlightActive(textN, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_TEXT_ENABLED', enabled: true });
            };
        }
        if (textN) {
            textN.onclick = () => {
                highlightActive(textN, true);
                highlightActive(textY, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_TEXT_ENABLED', enabled: false });
            };
        }

        const labelTextInp = document.getElementById('prop-atom-text-content');
        if (labelTextInp) {
            labelTextInp.oninput = function() {
                notifyIframe({
                    type: 'LF_UPDATE_ATOM_LABEL_TEXT',
                    text: this.value
                });
            };
        }
    };
    initCheckboxRadioEvents();

    // Textbox / Textarea Inspector Events
    const initTextboxTextareaEvents = () => {
        const notifyIframe = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const phInput = document.getElementById('prop-input-placeholder');
        if (phInput) {
            phInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', placeholderText: phInput.value });
            };
        }

        const mlInput = document.getElementById('prop-input-maxlength');
        if (mlInput) {
            mlInput.oninput = () => {
                let val = parseInt(mlInput.value);
                if (isNaN(val) || val < 1) val = 1;
                const txt = document.getElementById('txt-input-maxlength');
                if (txt) txt.innerText = val;
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', maxLength: val });
            };
        }

        const counterY = document.getElementById('btn-input-counter-y');
        const counterN = document.getElementById('btn-input-counter-n');
        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        if (counterY) {
            counterY.onclick = () => {
                highlightActive(counterY, true);
                highlightActive(counterN, false);
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', showCounter: true });
            };
        }
        if (counterN) {
            counterN.onclick = () => {
                highlightActive(counterN, true);
                highlightActive(counterY, false);
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', showCounter: false });
            };
        }

        // Font Size & Font Family Controls
        const fsInput = document.getElementById('prop-input-fontsize');
        if (fsInput) {
            fsInput.oninput = () => {
                let val = parseInt(fsInput.value);
                if (isNaN(val) || val < 1) val = 12;
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', fontSize: val });
            };
        }

        const ffInput = document.getElementById('prop-input-fontfamily');
        if (ffInput) {
            ffInput.onchange = () => {
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', fontFamily: ffInput.value });
            };
        }
    };
    initTextboxTextareaEvents();

    // Search Bar Inspector Events
    const initSearchBarEvents = () => {
        const notifyIframe = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const phInput = document.getElementById('prop-searchbar-placeholder');
        if (phInput) {
            phInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_SEARCHBAR_PROPERTIES', placeholderText: phInput.value });
            };
        }

        const fsInput = document.getElementById('prop-searchbar-fontsize');
        if (fsInput) {
            fsInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_SEARCHBAR_PROPERTIES', fontSize: parseInt(fsInput.value) });
            };
        }
    };
    initSearchBarEvents();

    // Stepper Inspector Events
    const initStepperEvents = () => {
        const notifyIframe = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const minInput = document.getElementById('prop-stepper-min');
        if (minInput) {
            minInput.oninput = () => {
                let val = parseInt(minInput.value);
                if (isNaN(val)) val = 1;
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', minVal: val });
            };
        }

        const maxInput = document.getElementById('prop-stepper-max');
        if (maxInput) {
            maxInput.oninput = () => {
                let val = parseInt(maxInput.value);
                if (isNaN(val)) val = 99;
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', maxVal: val });
            };
        }

        const btnText = document.getElementById('prop-stepper-btn-text');
        if (btnText) {
            btnText.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnText: btnText.value });
            };
        }

        const activeY = document.getElementById('btn-stepper-btn-y');
        const activeN = document.getElementById('btn-stepper-btn-n');
        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        if (activeY) {
            activeY.onclick = () => {
                highlightActive(activeY, true);
                highlightActive(activeN, false);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnEnabled: true });
            };
        }
        if (activeN) {
            activeN.onclick = () => {
                highlightActive(activeN, true);
                highlightActive(activeY, false);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnEnabled: false });
            };
        }

        const disabledY = document.getElementById('btn-stepper-disabled-y');
        const disabledN = document.getElementById('btn-stepper-disabled-n');
        
        if (disabledY) {
            disabledY.onclick = () => {
                highlightActive(disabledY, true);
                highlightActive(disabledN, false);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', disabled: true });
            };
        }
        if (disabledN) {
            disabledN.onclick = () => {
                highlightActive(disabledN, true);
                highlightActive(disabledY, false);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', disabled: false });
            };
        }
    };
    initStepperEvents();
 
    // Selectbox Inspector Events
    const initSelectboxEvents = () => {
        const notifyIframe = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const activeY = document.getElementById('btn-selectbox-dropdown-y');
        const activeN = document.getElementById('btn-selectbox-dropdown-n');
        
        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        if (activeY) {
            activeY.onclick = () => {
                highlightActive(activeY, true);
                highlightActive(activeN, false);
                
                const defCtrls = document.getElementById('selectbox-default-controls');
                const dropCtrls = document.getElementById('selectbox-dropdown-controls');
                if (defCtrls) defCtrls.style.display = 'none';
                if (dropCtrls) dropCtrls.style.display = 'block';
                
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', dropdownActive: true });
            };
        }
        if (activeN) {
            activeN.onclick = () => {
                highlightActive(activeN, true);
                highlightActive(activeY, false);
                
                const defCtrls = document.getElementById('selectbox-default-controls');
                const dropCtrls = document.getElementById('selectbox-dropdown-controls');
                if (defCtrls) defCtrls.style.display = 'block';
                if (dropCtrls) dropCtrls.style.display = 'none';
                
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', dropdownActive: false });
            };
        }

        const defaultTextInput = document.getElementById('prop-selectbox-default-text');
        if (defaultTextInput) {
            defaultTextInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', defaultText: defaultTextInput.value });
            };
        }

        const countInput = document.getElementById('prop-selectbox-option-count');
        if (countInput) {
            countInput.oninput = () => {
                let count = parseInt(countInput.value);
                if (isNaN(count) || count < 1) count = 1;
                if (count > 10) count = 10;
                
                const currentInputs = document.querySelectorAll('.selectbox-option-input');
                let currentOptions = Array.from(currentInputs).map(inp => inp.value);
                
                if (currentOptions.length < count) {
                    while (currentOptions.length < count) {
                        currentOptions.push(`Option ${currentOptions.length + 1}`);
                    }
                } else if (currentOptions.length > count) {
                    currentOptions = currentOptions.slice(0, count);
                }
                
                const inputsContainer = document.getElementById('selectbox-options-inputs-container');
                if (inputsContainer) {
                    inputsContainer.innerHTML = currentOptions.map((optText, idx) => {
                        return `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 10px; color: #94a3b8; width: 45px; flex-shrink: 0;">Item ${idx + 1}</span>
                            <input type="text" class="selectbox-option-input" data-index="${idx}" value="${optText}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; outline: none; font-family: inherit;">
                        </div>`;
                    }).join('');
                }
                
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', options: currentOptions });
            };
        }

        const container = document.getElementById('selectbox-options-inputs-container');
        if (container) {
            container.addEventListener('input', (e) => {
                if (e.target.classList.contains('selectbox-option-input')) {
                    const optionInputs = document.querySelectorAll('.selectbox-option-input');
                    const options = Array.from(optionInputs).map(inp => inp.value);
                    notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', options: options });
                }
            });
        }
    };
    initSelectboxEvents();

    // File Upload Inspector Events
    const initFileuploadEvents = () => {
        const notifyIframe = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const activeY = document.getElementById('btn-fileupload-selected-y');
        const activeN = document.getElementById('btn-fileupload-selected-n');
        
        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        if (activeY) {
            activeY.onclick = () => {
                highlightActive(activeY, true);
                highlightActive(activeN, false);
                
                const nameCtrls = document.getElementById('fileupload-name-controls');
                const placeholderCtrls = document.getElementById('fileupload-placeholder-controls');
                if (nameCtrls) nameCtrls.style.display = 'block';
                if (placeholderCtrls) placeholderCtrls.style.display = 'none';
                
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileSelected: true });
            };
        }
        if (activeN) {
            activeN.onclick = () => {
                highlightActive(activeN, true);
                highlightActive(activeY, false);
                
                const nameCtrls = document.getElementById('fileupload-name-controls');
                const placeholderCtrls = document.getElementById('fileupload-placeholder-controls');
                if (nameCtrls) nameCtrls.style.display = 'none';
                if (placeholderCtrls) placeholderCtrls.style.display = 'block';
                
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileSelected: false });
            };
        }

        const nameInput = document.getElementById('prop-fileupload-file-name');
        if (nameInput) {
            nameInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileName: nameInput.value });
            };
        }

        const placeholderInput = document.getElementById('prop-fileupload-placeholder');
        if (placeholderInput) {
            placeholderInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', filePlaceholder: placeholderInput.value });
            };
        }

        const btnTextInput = document.getElementById('prop-fileupload-btn-text');
        if (btnTextInput) {
            btnTextInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileButtonText: btnTextInput.value });
            };
        }
    };
    initFileuploadEvents();

        // Alert Inspector Events
        const initAlertEvents = () => {
            const notifyIframe = (data) => {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    MessageHub.send(iframe.contentWindow, data.type, data);
                }
            };

            const highlightActive = (btn, isActive) => {
                if (!btn) return;
                btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
                btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
                btn.style.fontWeight = isActive ? 'bold' : 'normal';
            };

            const descY = document.getElementById('btn-alert-desc-y');
            const descN = document.getElementById('btn-alert-desc-n');
            if (descY) {
                descY.onclick = () => {
                    highlightActive(descY, true);
                    highlightActive(descN, false);
                    notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', showDesc: true });
                };
            }
            if (descN) {
                descN.onclick = () => {
                    highlightActive(descN, true);
                    highlightActive(descY, false);
                    notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', showDesc: false });
                };
            }
            const descInput = document.getElementById('prop-alert-desc');
            if (descInput) {
                descInput.oninput = () => {
                    notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', descText: descInput.value });
                };
            }

            const msgInput = document.getElementById('prop-alert-message');
            if (msgInput) {
                msgInput.oninput = () => {
                    notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', messageText: msgInput.value });
                };
            }

        const countBtns = [1, 2, 3];
        countBtns.forEach(c => {
            const btn = document.getElementById('btn-alert-count-' + c);
            if (btn) {
                btn.onclick = () => {
                    // Update active styles
                    countBtns.forEach(idx => {
                        const b = document.getElementById('btn-alert-count-' + idx);
                        if (b) {
                            const isActive = idx === c;
                            b.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                            b.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
                            b.style.color = isActive ? '#00e5ff' : '#94a3b8';
                            b.style.fontWeight = isActive ? 'bold' : 'normal';
                        }
                    });
                    
                    // Show/hide containers
                    const btn2Container = document.getElementById('prop-alert-btn-2-container');
                    if (btn2Container) btn2Container.style.display = c >= 2 ? 'flex' : 'none';
                    const btn3Container = document.getElementById('prop-alert-btn-3-container');
                    if (btn3Container) btn3Container.style.display = c >= 3 ? 'flex' : 'none';
                    
                    notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnCount: c });
                };
            }
        });

        const btn1Input = document.getElementById('prop-alert-btn-1');
        if (btn1Input) {
            btn1Input.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnText1: btn1Input.value });
            };
        }
        const btn1Style = document.getElementById('prop-alert-btn-style-1');
        if (btn1Style) {
            btn1Style.onchange = () => {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnStyle1: btn1Style.value });
            };
        }

        const btn2Input = document.getElementById('prop-alert-btn-2');
        if (btn2Input) {
            btn2Input.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnText2: btn2Input.value });
            };
        }
        const btn2Style = document.getElementById('prop-alert-btn-style-2');
        if (btn2Style) {
            btn2Style.onchange = () => {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnStyle2: btn2Style.value });
            };
        }

        const btn3Input = document.getElementById('prop-alert-btn-3');
        if (btn3Input) {
            btn3Input.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnText3: btn3Input.value });
            };
        }
        const btn3Style = document.getElementById('prop-alert-btn-style-3');
        if (btn3Style) {
            btn3Style.onchange = () => {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnStyle3: btn3Style.value });
            };
        }
    };
    initAlertEvents();

    // Button Inspector Events
    const initButtonEvents = () => {
        const notifyIframe = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const textInput = document.getElementById('prop-button-text');
        if (textInput) {
            textInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonText: textInput.value });
            };
        }

        const styleSelect = document.getElementById('prop-button-style');
        if (styleSelect) {
            styleSelect.onchange = () => {
                const isCustom = styleSelect.value === 'custom';
                const customColorsDiv = document.getElementById('prop-button-custom-colors');
                if (customColorsDiv) customColorsDiv.style.display = isCustom ? 'block' : 'none';
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonStyle: styleSelect.value });
            };
        }

        const radiusSlider = document.getElementById('prop-button-border-radius');
        if (radiusSlider) {
            radiusSlider.oninput = () => {
                const val = radiusSlider.value;
                const txt = document.getElementById('txt-button-border-radius');
                if (txt) txt.innerText = val;
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonRadius: val });
            };
        }
    };
    initButtonEvents();

    // Layer Ordering Actions (Bring Front / Send Back)
    const btnBringFront = document.getElementById('btn-bring-front-action');
    if (btnBringFront) {
        btnBringFront.onclick = () => {
            notifyIframe({ type: 'LF_BRING_FRONT' });
        };
    }
    const btnSendBack = document.getElementById('btn-send-back-action');
    if (btnSendBack) {
        btnSendBack.onclick = () => {
            notifyIframe({ type: 'LF_SEND_BACK' });
        };
    }

    window.closeAllV4Inspectors = function() {
        const tableSect = document.getElementById('table-inspector-section');
        const shapeSect = document.getElementById('shape-inspector-section');
        const actions = document.getElementById('comp-actions-section');
        const fileuploadSect = document.getElementById('fileupload-inspector-section');
        const alertSect = document.getElementById('alert-inspector-section');
        const buttonSect = document.getElementById('button-inspector-section');
        if (tableSect) tableSect.style.display = 'none';
        if (shapeSect) shapeSect.style.display = 'none';
        if (actions) actions.style.display = 'none';
        if (fileuploadSect) fileuploadSect.style.display = 'none';
        if (alertSect) alertSect.style.display = 'none';
        if (buttonSect) buttonSect.style.display = 'none';
        notifyIframe({ type: 'LF_DESELECT_ALL' });
    };

    // Date Picker Inspector Events
    const initDatePickerEvents = () => {
        const notifyIframeDp = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        // Show Presets Toggle
        const presetsY = document.getElementById('btn-dp-presets-y');
        const presetsN = document.getElementById('btn-dp-presets-n');
        if (presetsY) {
            presetsY.onclick = () => {
                highlightActive(presetsY, true);
                highlightActive(presetsN, false);
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', showPresets: true });
            };
        }
        if (presetsN) {
            presetsN.onclick = () => {
                highlightActive(presetsN, true);
                highlightActive(presetsY, false);
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', showPresets: false });
            };
        }

        // Show End Date Toggle
        const showEndY = document.getElementById('btn-dp-show-end-y');
        const showEndN = document.getElementById('btn-dp-show-end-n');
        if (showEndY) {
            showEndY.onclick = () => {
                highlightActive(showEndY, true);
                highlightActive(showEndN, false);
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', showEndDate: true });
            };
        }
        if (showEndN) {
            showEndN.onclick = () => {
                highlightActive(showEndN, true);
                highlightActive(showEndY, false);
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', showEndDate: false });
            };
        }

        // Default Preset Buttons
        const presetKeys = ['none', '1D', '1W', '1M', '6M', 'all'];
        presetKeys.forEach(key => {
            const btn = document.getElementById('btn-dp-default-' + key);
            if (btn) {
                btn.onclick = () => {
                    presetKeys.forEach(k => {
                        const b = document.getElementById('btn-dp-default-' + k);
                        highlightActive(b, k === key);
                    });
                    notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', defaultPreset: key });
                };
            }
        });

        // Mode Selector Buttons
        const modeSimpleBtn = document.getElementById('btn-dp-mode-simple');
        const modeDetailedBtn = document.getElementById('btn-dp-mode-detailed');
        const timeInputsWrapper = document.getElementById('dp-time-inputs-wrapper');
        const presetsToggleWrapper = document.getElementById('dp-presets-toggle-wrapper');
        const showEndToggleWrapper = document.getElementById('dp-show-end-toggle-wrapper');
        const defaultPresetWrapper = document.getElementById('dp-default-preset-wrapper');
        
        if (modeSimpleBtn) {
            modeSimpleBtn.onclick = () => {
                highlightActive(modeSimpleBtn, true);
                highlightActive(modeDetailedBtn, false);
                if (timeInputsWrapper) timeInputsWrapper.style.display = 'none';
                if (presetsToggleWrapper) presetsToggleWrapper.style.display = 'block';
                if (showEndToggleWrapper) showEndToggleWrapper.style.display = 'block';
                if (defaultPresetWrapper) defaultPresetWrapper.style.display = 'block';
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', mode: 'simple' });
            };
        }
        if (modeDetailedBtn) {
            modeDetailedBtn.onclick = () => {
                highlightActive(modeDetailedBtn, true);
                highlightActive(modeSimpleBtn, false);
                if (timeInputsWrapper) timeInputsWrapper.style.display = 'block';
                if (presetsToggleWrapper) presetsToggleWrapper.style.display = 'none';
                if (showEndToggleWrapper) showEndToggleWrapper.style.display = 'none';
                if (defaultPresetWrapper) defaultPresetWrapper.style.display = 'none';
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', mode: 'detailed' });
            };
        }

        // Auto-slash formatter for YYYY/MM/DD
        const formatSlashDate = (value) => {
            let val = value.replace(/[^0-9]/g, '');
            let formatted = '';
            if (val.length > 0) {
                formatted += val.substring(0, 4);
                if (val.length > 4) {
                    formatted += '/' + val.substring(4, 6);
                    if (val.length > 6) {
                        formatted += '/' + val.substring(6, 8);
                    }
                }
            }
            return formatted;
        };

        // Auto-colon formatter for HH:MM:SS
        const formatColonTime = (value) => {
            let val = value.replace(/[^0-9]/g, '');
            let formatted = '';
            if (val.length > 0) {
                formatted += val.substring(0, 2);
                if (val.length > 2) {
                    formatted += ':' + val.substring(2, 4);
                    if (val.length > 4) {
                        formatted += ':' + val.substring(4, 6);
                    }
                }
            }
            return formatted;
        };

        // Start/End Date Direct Input
        const startInput = document.getElementById('prop-dp-start-date');
        if (startInput) {
            startInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatSlashDate(this.value);
                }
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', startDate: this.value });
            });
        }
        const endInput = document.getElementById('prop-dp-end-date');
        if (endInput) {
            endInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatSlashDate(this.value);
                }
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', endDate: this.value });
            });
        }

        // Start/End Time Direct Input
        const startTimeInput = document.getElementById('prop-dp-start-time');
        if (startTimeInput) {
            startTimeInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatColonTime(this.value);
                }
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', startTime: this.value });
            });
        }
        const endTimeInput = document.getElementById('prop-dp-end-time');
        if (endTimeInput) {
            endTimeInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatColonTime(this.value);
                }
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', endTime: this.value });
            });
        }
    };
    initDatePickerEvents();

    window.syncAccordionSubItemInputs = (texts) => {
        const container = document.getElementById('accordion-sub-items-container');
        if (!container) return;
        container.innerHTML = '';
        
        // Find which one is active in the iframe
        let activeIndex = -1;
        const iframe = document.getElementById('main-iframe');
        const activeId = window.state?.editingIndex;
        if (iframe && iframe.contentWindow && activeId) {
            const activeEl = iframe.contentWindow.document.getElementById(activeId);
            if (activeEl) {
                const accordionContainer = activeEl.querySelector('.v4-accordion-container') || activeEl;
                try {
                    const hStr = accordionContainer.getAttribute('data-hierarchy');
                    if (hStr) {
                        const parsed = JSON.parse(hStr);
                        if (Array.isArray(parsed)) {
                            activeIndex = parsed.findIndex(item => item.active);
                        }
                    }
                } catch (e) {}
            }
        }
        
        texts.forEach((text, index) => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; align-items:center; gap:4px; margin-bottom: 8px; width: 100%; box-sizing: border-box;';
            div.innerHTML = `
                <input type="radio" name="sidebar-accordion-active" class="sidebar-accordion-radio" ${index === activeIndex ? 'checked' : ''} style="accent-color: #00e5ff; cursor: pointer; flex-shrink: 0;">
                <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size: 9px; color: #94a3b8; display: block;">SUB ITEM ${index + 1} NAME</label>
                    <input type="text" class="v4-prop-input accordion-sub-input" data-index="${index}" value="${text || ''}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; outline: none; box-sizing: border-box;">
                </div>
            `;
            container.appendChild(div);
            
            const radio = div.querySelector('.sidebar-accordion-radio');
            const input = div.querySelector('.accordion-sub-input');
            
            const updateAll = () => {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    const allDivs = Array.from(container.querySelectorAll('.accordion-sub-input'));
                    const allRadios = Array.from(container.querySelectorAll('.sidebar-accordion-radio'));
                    const updatedHierarchy = allDivs.map((inp, idx) => ({
                        text: inp.value,
                        active: allRadios[idx].checked
                    }));
                    window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ACCORDION_PROPERTIES', {
                        subTexts: updatedHierarchy.map(h => h.text),
                        hierarchy: updatedHierarchy
                    });
                }
            };

            radio.onchange = () => {
                container.querySelectorAll('.sidebar-accordion-radio').forEach(r => {
                    if (r !== radio) r.checked = false;
                });
                updateAll();
            };
            input.oninput = () => {
                updateAll();
            };
        });
    };

    window.syncAccordionHierarchyInputs = (hierarchy) => {
        const container = document.getElementById('accordion-hierarchy-container');
        if (!container) return;
        container.innerHTML = '';
        
        const notifyAccordion = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ACCORDION_PROPERTIES', data);
            }
        };

        const updateHierarchy = () => {
            notifyAccordion({ hierarchy: hierarchy });
        };

        if (!Array.isArray(hierarchy) || hierarchy.length === 0) {
            container.innerHTML = '<p style="font-size: 10px; color: #64748b; text-align: center; margin: 20px 0;">1티어 항목을 추가해주세요.</p>';
            return;
        }

        hierarchy.forEach((t1, t1Idx) => {
            // 1Tier Wrapper
            const t1Div = document.createElement('div');
            t1Div.style.cssText = 'background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;';
            
            // 1Tier Header Row
            const t1Header = document.createElement('div');
            t1Header.style.cssText = 'display: flex; align-items: center; gap: 4px; width: 100%; box-sizing: border-box;';
            t1Header.innerHTML = `
                <span style="font-size: 10px; font-weight: bold; color: #00e5ff; flex-shrink: 0; min-width: 32px;">1티어</span>
                <input type="text" class="tier1-input" value="${t1.text || ''}" style="flex: 1; min-width: 0; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; outline: none;">
                <div style="display: flex; gap: 2px; flex-shrink: 0;">
                    <button class="v4-inspector-btn primary btn-add-t2" style="height: 20px; width: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; border-radius: 4px; padding: 0;" title="2티어 추가">+</button>
                    <button class="v4-inspector-btn danger btn-del-t1" style="height: 20px; width: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; border-radius: 4px; padding: 0;" title="삭제">&times;</button>
                </div>
            `;
            t1Div.appendChild(t1Header);

            const t1Input = t1Header.querySelector('.tier1-input');
            t1Input.oninput = () => { t1.text = t1Input.value; updateHierarchy(); };

            t1Header.querySelector('.btn-add-t2').onclick = () => {
                if (!t1.children) t1.children = [];
                t1.children.push({ text: `2Tier Subcategory ${t1Idx + 1}.${t1.children.length + 1}`, active: false });
                window.syncAccordionHierarchyInputs(hierarchy);
                updateHierarchy();
            };

            t1Header.querySelector('.btn-del-t1').onclick = () => {
                hierarchy.splice(t1Idx, 1);
                window.syncAccordionHierarchyInputs(hierarchy);
                updateHierarchy();
            };

            // 2Tier List Container
            if (t1.children && t1.children.length > 0) {
                const t2List = document.createElement('div');
                t2List.style.cssText = 'display: flex; flex-direction: column; gap: 8px; padding-left: 10px; border-left: 1px dashed rgba(255,255,255,0.1);';
                
                t1.children.forEach((t2, t2Idx) => {
                    const t2Div = document.createElement('div');
                    t2Div.style.cssText = 'display: flex; align-items: center; gap: 4px; width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.02); border-radius: 6px; padding: 6px; box-sizing: border-box;';
                    t2Div.innerHTML = `
                        <input type="radio" name="sidebar-accordion-active" class="sidebar-accordion-radio" ${t2.active ? 'checked' : ''} style="accent-color: #00e5ff; cursor: pointer; flex-shrink: 0;">
                        <span style="font-size: 10px; color: #818cf8; flex-shrink: 0; min-width: 32px;">2티어</span>
                        <input type="text" class="tier2-input" value="${t2.text || ''}" style="flex: 1; min-width: 0; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; outline: none;">
                        <button class="v4-inspector-btn danger btn-del-t2" style="height: 20px; width: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; border-radius: 4px; padding: 0;" title="삭제">&times;</button>
                    `;
                    t2List.appendChild(t2Div);

                    const t2Radio = t2Div.querySelector('.sidebar-accordion-radio');
                    const t2Input = t2Div.querySelector('.tier2-input');
                    
                    t2Radio.onchange = () => {
                        // Uncheck all other radios in the sidebar
                        const allRadios = document.querySelectorAll('.sidebar-accordion-radio');
                        allRadios.forEach(r => {
                            if (r !== t2Radio) r.checked = false;
                        });
                        
                        // Set active status in hierarchy array
                        hierarchy.forEach(cat => {
                            if (cat.children) {
                                cat.children.forEach(item => {
                                    item.active = (item === t2);
                                });
                            }
                        });
                        updateHierarchy();
                    };

                    t2Input.oninput = () => {
                        t2.text = t2Input.value;
                        updateHierarchy();
                    };

                    t2Div.querySelector('.btn-del-t2').onclick = () => {
                        t1.children.splice(t2Idx, 1);
                        window.syncAccordionHierarchyInputs(hierarchy);
                        updateHierarchy();
                    };
                });
                t1Div.appendChild(t2List);
            }
            container.appendChild(t1Div);
        });
    };

    const initAccordionEvents = () => {
        const headerTextInp = document.getElementById('prop-accordion-header-text');
        const subCountInp = document.getElementById('prop-accordion-sub-count');
        const bgColorInp = document.getElementById('accordion-bg-color');
        const bgNoneBtn = document.getElementById('btn-accordion-bg-none');
        const borderColorInp = document.getElementById('accordion-border-color');
        const borderNoneBtn = document.getElementById('btn-accordion-border-none');

        const notifyAccordion = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ACCORDION_PROPERTIES', data);
            }
        };

        const expandY = document.getElementById('btn-accordion-expand-y');
        const expandN = document.getElementById('btn-accordion-expand-n');
        
        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        if (expandY) {
            expandY.onclick = () => {
                highlightActive(expandY, true);
                highlightActive(expandN, false);
                notifyAccordion({ expanded: true });
            };
        }
        if (expandN) {
            expandN.onclick = () => {
                highlightActive(expandN, true);
                highlightActive(expandY, false);
                notifyAccordion({ expanded: false });
            };
        }

        const widthInp = document.getElementById('prop-accordion-width');
        if (widthInp) {
            widthInp.oninput = () => {
                const val = parseInt(widthInp.value);
                if (!isNaN(val)) {
                    notifyAccordion({ width: val });
                }
            };
        }

        const heightInp = document.getElementById('prop-accordion-height');
        if (heightInp) {
            heightInp.oninput = () => {
                const val = parseInt(heightInp.value);
                if (!isNaN(val)) {
                    notifyAccordion({ itemHeight: val });
                }
            };
        }

        if (headerTextInp) {
            headerTextInp.oninput = () => {
                notifyAccordion({ headerText: headerTextInp.value });
            };
        }

        if (subCountInp) {
            subCountInp.oninput = () => {
                const val = parseInt(subCountInp.value) || 0;
                const container = document.getElementById('accordion-sub-items-container');
                const allInputs = container ? Array.from(container.querySelectorAll('.accordion-sub-input')) : [];
                let currentTexts = allInputs.map(inp => inp.value);
                
                while (currentTexts.length < val) {
                    currentTexts.push(`Sub Item ${currentTexts.length + 1}`);
                }
                currentTexts = currentTexts.slice(0, val);
                
                if (typeof window.syncAccordionSubItemInputs === 'function') {
                    window.syncAccordionSubItemInputs(currentTexts);
                }
                
                notifyAccordion({ subCount: val, subTexts: currentTexts, hierarchy: currentTexts.map(t => ({ text: t })) });
            };
        }

        // Depth Type Toggle Buttons
        const depth1Btn = document.getElementById('btn-accordion-depth-1');
        const depth2Btn = document.getElementById('btn-accordion-depth-2');
        const settings1D = document.getElementById('accordion-1depth-settings');
        const settings2D = document.getElementById('accordion-2depth-settings');
        const addTier1Btn = document.getElementById('btn-accordion-add-tier1');

        const switchDepthMode = (depth) => {
            highlightActive(depth1Btn, depth === '1depth');
            highlightActive(depth2Btn, depth === '2depth');
            if (settings1D) settings1D.style.display = depth === '1depth' ? 'block' : 'none';
            if (settings2D) settings2D.style.display = depth === '2depth' ? 'block' : 'none';
            
            // Get current hierarchy to sync
            let currentHierarchy = [];
            const container = document.getElementById('accordion-hierarchy-container');
            // Try to retrieve existing from active file or iframe
            const curState = window.state || {};
            const activeId = curState.editingIndex;
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && activeId) {
                const activeEl = iframe.contentWindow.document.getElementById(activeId);
                if (activeEl) {
                    const accordionContainer = activeEl.querySelector('.v4-accordion-container') || activeEl;
                    try {
                        const hStr = accordionContainer.getAttribute('data-hierarchy');
                        if (hStr) currentHierarchy = JSON.parse(hStr);
                    } catch (e) {}
                }
            }

            if (currentHierarchy.length === 0) {
                // Fallback to 1-depth sub-texts
                const subInputs = Array.from(document.querySelectorAll('.accordion-sub-input'));
                if (subInputs.length > 0) {
                    currentHierarchy = subInputs.map(inp => ({ text: inp.value }));
                } else {
                    currentHierarchy = [{ text: "1Tier Category 1", children: [] }];
                }
            }

            if (depth === '2depth') {
                window.syncAccordionHierarchyInputs(currentHierarchy);
            }
            notifyAccordion({ depthType: depth, hierarchy: currentHierarchy });
        };

        if (depth1Btn) {
            depth1Btn.onclick = () => switchDepthMode('1depth');
        }
        if (depth2Btn) {
            depth2Btn.onclick = () => switchDepthMode('2depth');
        }
        if (addTier1Btn) {
            addTier1Btn.onclick = () => {
                let currentHierarchy = [];
                const container = document.getElementById('accordion-hierarchy-container');
                // Read current input values
                const tier1Groups = container.querySelectorAll('.v4-accordion-tier1-group');
                // Instead of scraping, we can maintain it via state or re-read from iframe
                const iframe = document.getElementById('main-iframe');
                const activeId = window.state?.editingIndex;
                if (iframe && iframe.contentWindow && activeId) {
                    const activeEl = iframe.contentWindow.document.getElementById(activeId);
                    if (activeEl) {
                        const accordionContainer = activeEl.querySelector('.v4-accordion-container') || activeEl;
                        try {
                            const hStr = accordionContainer.getAttribute('data-hierarchy');
                            if (hStr) currentHierarchy = JSON.parse(hStr);
                        } catch (e) {}
                    }
                }
                currentHierarchy.push({ text: `1Tier Category ${currentHierarchy.length + 1}`, children: [] });
                window.syncAccordionHierarchyInputs(currentHierarchy);
                notifyAccordion({ hierarchy: currentHierarchy });
            };
        }

        if (bgColorInp) {
            bgColorInp.onchange = () => {
                const wrapper = document.getElementById('accordion-bg-wrapper');
                if (wrapper) wrapper.classList.remove('transparent-active');
                notifyAccordion({ bg: bgColorInp.value });
            };
        }

        if (bgNoneBtn) {
            bgNoneBtn.onclick = () => {
                const wrapper = document.getElementById('accordion-bg-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyAccordion({ bg: 'transparent' });
            };
        }

        if (borderColorInp) {
            borderColorInp.onchange = () => {
                const wrapper = document.getElementById('accordion-border-wrapper');
                if (wrapper) wrapper.classList.remove('transparent-active');
                notifyAccordion({ border: borderColorInp.value });
            };
        }

        if (borderNoneBtn) {
            borderNoneBtn.onclick = () => {
                const wrapper = document.getElementById('accordion-border-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyAccordion({ border: 'transparent' });
            };
        }
    };
    initAccordionEvents();

    window.syncGridHeaderInputs = (columns, headers) => {
        const container = document.getElementById('grid-columns-container');
        if (!container) return;
        container.innerHTML = '';
        
        let colsList = [];
        if (Array.isArray(columns) && columns.length > 0) {
            colsList = columns;
        } else if (Array.isArray(headers) && headers.length > 0) {
            colsList = headers.map((h, i) => {
                let type = 'text';
                const lower = (h || '').toLowerCase();
                if (i === 0 && (h === '' || lower.includes('check') || h.includes('선택'))) type = 'checkbox';
                else if (h === '번호') type = 'number';
                else if (h === '방송상태' || h === '상태') type = 'status';
                else if (h === '등록/수정자' || h === '등록자' || h === '수정자') type = 'author';
                else if (h.includes('일시') || h.includes('일자')) type = 'datetime';
                return {
                    name: h,
                    type: type,
                    width: type === 'checkbox' ? '50px' : (type === 'number' ? '100px' : (type === 'text' ? '200px' : (type === 'status' ? '120px' : (type === 'author' ? '120px' : '150px'))))
                };
            });
        } else {
            colsList = [
                { name: "", type: "checkbox", width: "50px" },
                { name: "번호", type: "number", width: "100px" },
                { name: "라이브 방송명", type: "text", width: "200px" },
                { name: "방송상태", type: "status", width: "120px" },
                { name: "등록/수정자", type: "author", width: "120px" }
            ];
        }

        const colCountInp = document.getElementById('prop-grid-col-count');
        if (colCountInp) {
            colCountInp.value = colsList.length;
        }

        colsList.forEach((col, index) => {
            const isCheckbox = (col.type === 'checkbox');
            const parsedW = parseInt(col.width);
            const numericWidth = isNaN(parsedW) ? (isCheckbox ? 50 : (col.type === 'text' ? 200 : 100)) : parsedW;
            
            const showStatusOptions = (col.type === 'status');
            const statusOptionsHtml = showStatusOptions ? `
                <div style="display:flex; flex-direction:column; gap:2px; grid-column: span 3; margin-top: 4px;">
                    <label style="font-size: 8px; color: #94a3b8;">상태 옵션 설정 (쉼표로 구분)</label>
                    <input type="text" class="v4-prop-input grid-col-options-input" data-index="${index}" value="${col.options || '방송중, 방송예정, 방송종료'}" placeholder="예: 진행중, 완료, 대기" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px;">
                </div>
            ` : '';

            const div = document.createElement('div');
            div.style.cssText = 'display:flex; flex-direction:column; gap:6px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label style="font-size: 10px; color: #00e5ff; font-weight: bold;">COLUMN ${index + 1}</label>
                    <div style="display: flex; gap: 4px;">
                        <button class="v4-inspector-btn btn-move-col-up" data-index="${index}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="위로 이동" ${index === 0 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▲</button>
                        <button class="v4-inspector-btn btn-move-col-down" data-index="${index}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="아래로 이동" ${index === colsList.length - 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▼</button>
                        <button class="v4-inspector-btn btn-delete-col" data-index="${index}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; cursor: pointer;" title="삭제" ${colsList.length <= 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>&times;</button>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns: 1.2fr 1fr 0.8fr; gap:6px;">
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <label style="font-size: 8px; color: #94a3b8;">항목타입</label>
                        <select class="v4-prop-input grid-col-type-select" data-index="${index}" style="width:100%; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 4px; border-radius: 4px; font-size: 10px; outline:none; height:24px;">
                            <option value="checkbox" ${col.type === 'checkbox' ? 'selected' : ''}>체크박스 항목</option>
                            <option value="number" ${col.type === 'number' ? 'selected' : ''}>번호 항목</option>
                            <option value="text" ${col.type === 'text' ? 'selected' : ''}>텍스트 항목</option>
                            <option value="status" ${col.type === 'status' ? 'selected' : ''}>상태 항목</option>
                            <option value="author" ${col.type === 'author' ? 'selected' : ''}>등록/수정자 항목</option>
                            <option value="datetime" ${col.type === 'datetime' ? 'selected' : ''}>등록/수정일시 항목</option>
                        </select>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <label style="font-size: 8px; color: #94a3b8;">항목명</label>
                        <input type="text" class="v4-prop-input grid-col-name-input" data-index="${index}" value="${isCheckbox ? '' : (col.name || '')}" ${isCheckbox ? 'disabled' : ''} style="width:100%; background: ${isCheckbox ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)'}; border: 1px solid ${isCheckbox ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}; color: ${isCheckbox ? '#64748b' : '#fff'}; padding: 4px 6px; border-radius: 4px; font-size: 11px;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <label style="font-size: 8px; color: #94a3b8;">가로크기(px)</label>
                        <input type="number" min="10" max="1000" class="v4-prop-input grid-col-width-input" data-index="${index}" value="${numericWidth}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px;">
                    </div>
                    ${statusOptionsHtml}
                </div>
            `;
            container.appendChild(div);

            const nameInp = div.querySelector('.grid-col-name-input');
            const typeSel = div.querySelector('.grid-col-type-select');
            const widthInp = div.querySelector('.grid-col-width-input');
            const optionsInp = div.querySelector('.grid-col-options-input');
            const btnUp = div.querySelector('.btn-move-col-up');
            const btnDown = div.querySelector('.btn-move-col-down');

            const getCurrentColsFromInputs = () => {
                const nameInputs = Array.from(container.querySelectorAll('.grid-col-name-input'));
                return nameInputs.map((inp) => {
                    const idx = inp.getAttribute('data-index');
                    const tSel = container.querySelector(`.grid-col-type-select[data-index="${idx}"]`);
                    const wInp = container.querySelector(`.grid-col-width-input[data-index="${idx}"]`);
                    const oInp = container.querySelector(`.grid-col-options-input[data-index="${idx}"]`);
                    const t = tSel ? tSel.value : 'text';
                    const wVal = wInp ? (parseInt(wInp.value) || 100) : 100;
                    const oVal = oInp ? oInp.value : '';
                    return {
                        name: t === 'checkbox' ? '' : inp.value,
                        type: t,
                        width: wVal + 'px',
                        options: oVal
                    };
                });
            };

            const triggerColUpdateWithCols = (cols) => {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_GRID_PROPERTIES', {
                        columns: cols
                    });
                }
            };

            if (btnUp && index > 0) {
                btnUp.onclick = () => {
                    const currentCols = getCurrentColsFromInputs();
                    const temp = currentCols[index];
                    currentCols[index] = currentCols[index - 1];
                    currentCols[index - 1] = temp;
                    window.syncGridHeaderInputs(currentCols);
                    triggerColUpdateWithCols(currentCols);
                };
            }

            if (btnDown && index < colsList.length - 1) {
                btnDown.onclick = () => {
                    const currentCols = getCurrentColsFromInputs();
                    const temp = currentCols[index];
                    currentCols[index] = currentCols[index + 1];
                    currentCols[index + 1] = temp;
                    window.syncGridHeaderInputs(currentCols);
                    triggerColUpdateWithCols(currentCols);
                };
            }

            const btnDelete = div.querySelector('.btn-delete-col');
            if (btnDelete) {
                btnDelete.onclick = () => {
                    const currentCols = getCurrentColsFromInputs();
                    if (currentCols.length <= 1) return;
                    currentCols.splice(index, 1);
                    window.syncGridHeaderInputs(currentCols);
                    triggerColUpdateWithCols(currentCols);
                    
                    const colCountInp = document.getElementById('prop-grid-col-count');
                    if (colCountInp) {
                        colCountInp.value = currentCols.length;
                    }
                };
            }

            const triggerColUpdate = () => {
                const currentCols = getCurrentColsFromInputs();
                triggerColUpdateWithCols(currentCols);
            };

            nameInp.oninput = triggerColUpdate;
            widthInp.oninput = triggerColUpdate;
            if (optionsInp) {
                optionsInp.oninput = triggerColUpdate;
            }
            
            typeSel.onchange = () => {
                const t = typeSel.value;
                const defaultW = t === 'checkbox' ? 50 : (t === 'number' ? 100 : (t === 'text' ? 200 : (t === 'status' ? 120 : (t === 'author' ? 120 : 150))));
                widthInp.value = defaultW;
                
                if (t === 'checkbox') {
                    nameInp.value = '';
                    nameInp.disabled = true;
                    nameInp.style.background = 'rgba(0,0,0,0.15)';
                    nameInp.style.borderColor = 'rgba(255,255,255,0.05)';
                    nameInp.style.color = '#64748b';
                } else {
                    nameInp.disabled = false;
                    nameInp.style.background = 'rgba(0,0,0,0.3)';
                    nameInp.style.borderColor = 'rgba(255,255,255,0.1)';
                    nameInp.style.color = '#fff';
                }
                
                // Trigger update and redraw inputs immediately to show/hide status options config input
                const updatedCols = getCurrentColsFromInputs();
                triggerColUpdateWithCols(updatedCols);
                
                if (typeof syncGridHeaderInputs === 'function') {
                    syncGridHeaderInputs(updatedCols, []);
                }
            };
        });
    };

    const initGridEvents = () => {
        const rowCountInp = document.getElementById('prop-grid-row-count');
        const bgColorInp = document.getElementById('grid-bg-color');
        const bgNoneBtn = document.getElementById('btn-grid-bg-none');
        const borderColorInp = document.getElementById('grid-border-color');
        const borderNoneBtn = document.getElementById('btn-grid-border-none');
        const paginationY = document.getElementById('btn-grid-pagination-y');
        const paginationN = document.getElementById('btn-grid-pagination-n');

        const colMinusBtn = document.getElementById('btn-grid-col-minus');
        const colPlusBtn = document.getElementById('btn-grid-col-plus');
        const colAddBtn = document.getElementById('btn-grid-add-col');

        const notifyGrid = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_GRID_PROPERTIES', data);
            }
        };

        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        if (colMinusBtn) {
            colMinusBtn.onclick = () => {
                const container = document.getElementById('grid-columns-container');
                if (!container) return;
                const nameInputs = Array.from(container.querySelectorAll('.grid-col-name-input'));
                if (nameInputs.length <= 1) return;
                
                const updatedCols = nameInputs.slice(0, -1).map((inp) => {
                    const idx = inp.getAttribute('data-index');
                    const typeSel = container.querySelector(`.grid-col-type-select[data-index="${idx}"]`);
                    const widthInp = container.querySelector(`.grid-col-width-input[data-index="${idx}"]`);
                    const optionsInp = container.querySelector(`.grid-col-options-input[data-index="${idx}"]`);
                    const t = typeSel ? typeSel.value : 'text';
                    const wVal = widthInp ? (parseInt(widthInp.value) || 100) : 100;
                    const oVal = optionsInp ? optionsInp.value : '';
                    return { name: inp.value, type: t, width: wVal + 'px', options: oVal };
                });
                notifyGrid({ columns: updatedCols });
                if (typeof syncGridHeaderInputs === 'function') {
                    syncGridHeaderInputs(updatedCols, []);
                }
                const colCountInp = document.getElementById('prop-grid-col-count');
                if (colCountInp) {
                    colCountInp.value = updatedCols.length;
                }
            };
        }

        if (colAddBtn) {
            colAddBtn.onclick = () => {
                const container = document.getElementById('grid-columns-container');
                if (!container) return;
                const nameInputs = Array.from(container.querySelectorAll('.grid-col-name-input'));
                if (nameInputs.length >= 10) return;
                
                const updatedCols = nameInputs.map((inp) => {
                    const idx = inp.getAttribute('data-index');
                    const typeSel = container.querySelector(`.grid-col-type-select[data-index="${idx}"]`);
                    const widthInp = container.querySelector(`.grid-col-width-input[data-index="${idx}"]`);
                    const optionsInp = container.querySelector(`.grid-col-options-input[data-index="${idx}"]`);
                    const t = typeSel ? typeSel.value : 'text';
                    const wVal = widthInp ? (parseInt(widthInp.value) || 100) : 100;
                    const oVal = optionsInp ? optionsInp.value : '';
                    return { name: inp.value, type: t, width: wVal + 'px', options: oVal };
                });
                updatedCols.push({
                    name: '새 항목',
                    type: 'text',
                    width: '200px'
                });
                notifyGrid({ columns: updatedCols });
                if (typeof syncGridHeaderInputs === 'function') {
                    syncGridHeaderInputs(updatedCols, []);
                }
                const colCountInp = document.getElementById('prop-grid-col-count');
                if (colCountInp) {
                    colCountInp.value = updatedCols.length;
                }
            };
        }

        if (colPlusBtn) {
            colPlusBtn.onclick = () => {
                const container = document.getElementById('grid-columns-container');
                if (!container) return;
                const nameInputs = Array.from(container.querySelectorAll('.grid-col-name-input'));
                if (nameInputs.length >= 10) return;
                
                const updatedCols = nameInputs.map((inp) => {
                    const idx = inp.getAttribute('data-index');
                    const typeSel = container.querySelector(`.grid-col-type-select[data-index="${idx}"]`);
                    const widthInp = container.querySelector(`.grid-col-width-input[data-index="${idx}"]`);
                    const optionsInp = container.querySelector(`.grid-col-options-input[data-index="${idx}"]`);
                    const t = typeSel ? typeSel.value : 'text';
                    const wVal = widthInp ? (parseInt(widthInp.value) || 100) : 100;
                    const oVal = optionsInp ? optionsInp.value : '';
                    return { name: inp.value, type: t, width: wVal + 'px', options: oVal };
                });
                updatedCols.push({
                    name: '새 항목',
                    type: 'text',
                    width: '200px'
                });
                notifyGrid({ columns: updatedCols });
                if (typeof syncGridHeaderInputs === 'function') {
                    syncGridHeaderInputs(updatedCols, []);
                }
                const colCountInp = document.getElementById('prop-grid-col-count');
                if (colCountInp) {
                    colCountInp.value = updatedCols.length;
                }
            };
        }

        if (paginationY) {
            paginationY.onclick = () => {
                highlightActive(paginationY, true);
                highlightActive(paginationN, false);
                notifyGrid({ pagination: true });
            };
        }
        if (paginationN) {
            paginationN.onclick = () => {
                highlightActive(paginationN, true);
                highlightActive(paginationY, false);
                notifyGrid({ pagination: false });
            };
        }

        if (rowCountInp) {
            rowCountInp.oninput = () => {
                const val = parseInt(rowCountInp.value) || 5;
                notifyGrid({ rowCount: val });
            };
        }

        const rowHeightInp = document.getElementById('prop-grid-row-height');
        if (rowHeightInp) {
            rowHeightInp.oninput = () => {
                const val = parseInt(rowHeightInp.value) || 50;
                notifyGrid({ rowHeight: val });
            };
        }

        if (bgColorInp) {
            bgColorInp.onchange = () => {
                const wrapper = document.getElementById('grid-bg-wrapper');
                if (wrapper) wrapper.classList.remove('transparent-active');
                notifyGrid({ bg: bgColorInp.value });
            };
        }

        if (bgNoneBtn) {
            bgNoneBtn.onclick = () => {
                const wrapper = document.getElementById('grid-bg-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyGrid({ bg: 'transparent' });
            };
        }

        if (borderColorInp) {
            borderColorInp.onchange = () => {
                const wrapper = document.getElementById('grid-border-wrapper');
                if (wrapper) wrapper.classList.remove('transparent-active');
                notifyGrid({ border: borderColorInp.value });
            };
        }

        if (borderNoneBtn) {
            borderNoneBtn.onclick = () => {
                const wrapper = document.getElementById('grid-border-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyGrid({ border: 'transparent' });
            };
        }
    };
    initGridEvents();

    const initAdminSettingsEvents = () => {
        const rowCountSelect = document.getElementById('prop-admin-row-count');
        if (rowCountSelect) {
            rowCountSelect.onchange = () => {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    const val = parseInt(rowCountSelect.value) || 3;
                    window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                        rowCount: val
                    });
                    
                    // Re-sync inspector UI to match the new row count
                    const activeId = window.state?.editingIndex;
                    if (activeId) {
                        const activeEl = iframe.contentWindow.document.getElementById(activeId);
                        if (activeEl) {
                            const container = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                            // Pre-fill labels/cols/type for newly visible rows if empty
                            for (let i = 1; i <= val; i++) {
                                if (!container.getAttribute(`data-row${i}-label`)) {
                                    container.setAttribute(`data-row${i}-label`, `항목 ${i}`);
                                    container.setAttribute(`data-row${i}-cols`, '1');
                                    container.setAttribute(`data-row${i}-type`, 'textbox');
                                }
                            }
                            // Trigger sync again
                            const compStyles = window.state.activeFile.components?.find(c => c.id === activeId) || {};
                            const syncData = {
                                id: activeId,
                                editingType: 'admin-settings',
                                adminRowCount: val
                            };
                            for (let i = 1; i <= 10; i++) {
                                syncData[`adminRow${i}Label`] = container.getAttribute(`data-row${i}-label`) || '';
                                syncData[`adminRow${i}Cols`] = parseInt(container.getAttribute(`data-row${i}-cols`)) || 1;
                                syncData[`adminRow${i}Type`] = container.getAttribute(`data-row${i}-type`) || 'textbox';
                            }
                            window._syncAdminSettingsProps(syncData);
                        }
                    }
                }
            };
        }

        // Initialize Group Title Configuration Event Listeners
        const enableChk = document.getElementById('prop-admin-group-header-enable');
        const titleInp = document.getElementById('prop-admin-group-header-title');
        const bgInp = document.getElementById('prop-admin-group-header-bg');
        const colorInp = document.getElementById('prop-admin-group-header-color');
        const configSub = document.getElementById('admin-group-header-config-sub');
        const bgNoneBtn = document.getElementById('btn-admin-group-header-bg-none');

        const updateGroupHeader = (isBgNone = false) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                const bgWrapper = document.getElementById('admin-group-header-bg-wrapper');
                let finalBg = bgInp.value;
                
                if (isBgNone) {
                    finalBg = 'transparent';
                    if (bgWrapper) bgWrapper.classList.add('transparent-active');
                } else {
                    if (bgWrapper) bgWrapper.classList.remove('transparent-active');
                }

                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                    showGroupHeader: enableChk.checked,
                    groupHeaderTitle: titleInp.value,
                    groupHeaderBg: finalBg,
                    groupHeaderColor: colorInp.value
                });
                if (configSub) configSub.style.display = enableChk.checked ? 'flex' : 'none';
            }
        };

        if (enableChk) {
            enableChk.onchange = () => updateGroupHeader(false);
        }
        if (titleInp) {
            titleInp.oninput = () => updateGroupHeader(false);
        }
        if (bgInp) {
            bgInp.oninput = () => updateGroupHeader(false);
        }
        if (colorInp) {
            colorInp.oninput = () => updateGroupHeader(false);
        }
        if (bgNoneBtn) {
            bgNoneBtn.onclick = () => updateGroupHeader(true);
        }
    };
    const initToggleEvents = () => {
        const notifyIframeToggle = (data) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, data.type, data);
            }
        };

        const highlightActive = (btn, isActive) => {
            if (!btn) return;
            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        };

        const btnOn = document.getElementById('btn-toggle-on');
        const btnOff = document.getElementById('btn-toggle-off');
        if (btnOn) {
            btnOn.onclick = () => {
                highlightActive(btnOn, true);
                highlightActive(btnOff, false);
                notifyIframeToggle({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: true });
            };
        }
        if (btnOff) {
            btnOff.onclick = () => {
                highlightActive(btnOff, true);
                highlightActive(btnOn, false);
                notifyIframeToggle({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: false });
            };
        }

        const colorInput = document.getElementById('prop-toggle-color');
        if (colorInput) {
            colorInput.oninput = function() {
                notifyIframeToggle({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', color: this.value });
            };
        }
    };
    initToggleEvents();

    initAdminSettingsEvents();

    // Parent-side paste event listener for handling pasted image files when parent has focus

    // Export initialization triggers to window
    window.initCheckboxRadioEvents = initCheckboxRadioEvents;
    window.initTextboxTextareaEvents = initTextboxTextareaEvents;
    window.initSearchbarEvents = initSearchBarEvents;
    window.initStepperEvents = initStepperEvents;
    window.initSelectboxEvents = initSelectboxEvents;
    window.initFileuploadEvents = initFileuploadEvents;
    window.initAlertEvents = initAlertEvents;
    window.initButtonEvents = initButtonEvents;
    window.initDatePickerEvents = initDatePickerEvents;
    window.initAccordionEvents = initAccordionEvents;
    window.initGridEvents = initGridEvents;
    window.initAdminSettingsEvents = initAdminSettingsEvents;
    window.initToggleEvents = initToggleEvents;
})();
