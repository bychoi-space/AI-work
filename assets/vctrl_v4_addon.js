/**
 * vctrl_v4_addon.js
 * Bridges V4 Table & Shape editing into the main viewer system.
 * Optimized for 'file://' protocol security by using postMessage instead of direct DOM access.
 */

(function() {
    console.log("%c [V4 ADDON LOADED] ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    const iframe = document.getElementById('main-iframe');
    
    function notifyIframe(data) {
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(data, '*');
        }
    }

    // 1. Component Insertion
    window.insertV4ComponentById = function(id, customIdx) {
        const lib = window.V4_COMPONENT_LIBRARY;
        if (!lib) return console.error("[V4] Component Library not found.");

        const curState = window.state || window.parent.state || {};
        const customMols = curState.globalComponents || ((curState.projectMetadata && curState.projectMetadata.molecules) ? curState.projectMetadata.molecules : []);
        
        const item = (lib.atoms || []).find(i => i.id === id) || 
                     (lib.molecules || []).find(i => i.id === id) || 
                     (lib.organisms || []).find(i => i.id === id) ||
                     customMols.find(i => i.id === id);

        if (!item) return console.error("[V4] Component not found:", id);

        const style = { 
            width: item.width || '200px', 
            height: item.height || '200px' 
        };
        if (item.category === 'Atoms' || item.id === 'v4-shape-badge') {
            const isIcon = item.id.includes('icon') || item.html.includes('<img');
            if (item.id === 'v4-atom-textbox') {
                style.width = '150px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-textarea') {
                style.width = '150px';
                style.height = '60px';
            } else {
                style.width = isIcon ? '40px' : '120px';
                style.height = '40px';
            }
        }
        if (item.id === 'v4-search-bar' || item.id === 'v4-premium-gnb') {
            style.width = '100%';
            style.height = 'auto';
        }
        if (item.id === 'v4-tool-text') {
            style.width = 'fit-content';
            style.height = 'auto';
        }

        const isTextTool = item.id === 'v4-tool-text';
        
        // Separate description pins (customIdx present) from pure textboxes (no customIdx)
        const isDescriptionPin = isTextTool && (customIdx !== undefined);
        const targetId = isTextTool 
            ? (isDescriptionPin ? ('v4-pin-' + customIdx) : ('v4-text-' + Date.now()))
            : ('v4-comp-' + Date.now());


        notifyIframe({
            type: 'LF_INSERT_COMPONENT',
            id: targetId,
            html: item.html,
            style: style,
            className: isDescriptionPin ? 'pin-marker' : (isTextTool ? 'text-marker' : ''),
            isGroup: !!item.isGroup
        });
    };

    // Dependencies are now pre-injected via vctrl_v3.js loadScreen() for security compliance.

    // 2. Inspector Controls (Safe Style Updates)
    const bindStyleUpdate = (inputId, message) => {
        const el = document.getElementById(inputId);
        if (el) {
            el.addEventListener('input', function() {
                const data = typeof message === 'function' ? message(this.value) : { ...message, style: { [message.prop]: this.value } };
                notifyIframe(data);
                if (document.getElementById('txt-' + inputId)) {
                    document.getElementById('txt-' + inputId).innerText = this.value;
                }
            });
        }
    };

    function _rgb2hex(rgb) {
        if (!rgb) return '#ffffff';
        if (rgb.startsWith('#')) return rgb;
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
        if (!match) return '#ffffff';
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return '#' + r + g + b;
    }

    function hexToRgba(hex, opacity) {
        if (!hex) return 'rgba(30, 41, 59, 1)';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const a = (opacity / 100).toFixed(2);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }

    // Table Style Bindings
    bindStyleUpdate('table-font-size', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'table',
        subSelector: 'td, th',
        subStyle: { fontSize: val + 'px' }
    }));
    bindStyleUpdate('table-border-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'table',
        style: { borderColor: val },
        subSelector: 'td, th',
        subStyle: { borderColor: val }
    }));

    // Cell Style & Dimension Direct Actions
    const bindCellColorInput = (id, prop) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                const style = {};
                style[prop] = this.value;
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style });
            });
        }
    };

    bindCellColorInput('cell-bg-color', 'backgroundColor');
    bindCellColorInput('cell-text-color', 'color');

    // Cell Background Transparency Button
    const btnCellBgNone = document.getElementById('btn-cell-bg-none');
    if (btnCellBgNone) {
        btnCellBgNone.onclick = () => {
            const wrapper = document.getElementById('cell-bg-wrapper');
            if (wrapper) wrapper.classList.add('transparent-active');
            notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { backgroundColor: 'transparent' } });
        };
    }

    const cellBgColorEl = document.getElementById('cell-bg-color');
    if (cellBgColorEl) {
        cellBgColorEl.addEventListener('input', () => {
            const wrapper = document.getElementById('cell-bg-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
        });
    }

    // Cell Width Slider
    const cellColWidthEl = document.getElementById('cell-col-width');
    if (cellColWidthEl) {
        cellColWidthEl.addEventListener('input', function() {
            notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', width: parseInt(this.value) });
            const txt = document.getElementById('txt-cell-col-width');
            if (txt) txt.innerText = this.value;
        });
    }

    // Cell Height Slider
    const cellRowHeightEl = document.getElementById('cell-row-height');
    if (cellRowHeightEl) {
        cellRowHeightEl.addEventListener('input', function() {
            notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', height: parseInt(this.value) });
            const txt = document.getElementById('txt-cell-row-height');
            if (txt) txt.innerText = this.value;
        });
    }

    // Shape Style Bindings
    bindStyleUpdate('shape-font-size', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: '.v4-shape .v4-editable-cell',
        style: { fontSize: val + 'px' }
    }));
    const shapeBgColorEl = document.getElementById('shape-bg-color');
    if (shapeBgColorEl) {
        shapeBgColorEl.addEventListener('input', function() {
            const colorHex = this.value;
            const opacitySlider = document.getElementById('shape-bg-opacity');
            let opacityVal = opacitySlider ? parseInt(opacitySlider.value) : 100;
            
            // 만약 불투명도가 0인 상태(투명)에서 색상을 다시 조작하면 불투명도를 100으로 자동 복구
            if (opacityVal === 0 && opacitySlider) {
                opacityVal = 100;
                opacitySlider.value = 100;
                const txt = document.getElementById('txt-shape-bg-opacity');
                if (txt) txt.innerText = 100;
            }
            
            const rgbaColor = hexToRgba(colorHex, opacityVal);
            
            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                selector: '.v4-shape',
                style: { background: rgbaColor, backgroundColor: rgbaColor }
            });
            
            const wrapper = document.getElementById('shape-bg-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
        });
    }

    const shapeBgOpacityEl = document.getElementById('shape-bg-opacity');
    if (shapeBgOpacityEl) {
        shapeBgOpacityEl.addEventListener('input', function() {
            const opacityVal = this.value;
            const txt = document.getElementById('txt-shape-bg-opacity');
            if (txt) txt.innerText = opacityVal;
            
            const colorPicker = document.getElementById('shape-bg-color');
            const colorHex = colorPicker ? colorPicker.value : '#1e293b';
            const rgbaColor = hexToRgba(colorHex, opacityVal);
            
            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                selector: '.v4-shape',
                style: { background: rgbaColor, backgroundColor: rgbaColor }
            });
            
            const wrapper = document.getElementById('shape-bg-wrapper');
            if (wrapper) {
                if (parseInt(opacityVal) === 0) {
                    wrapper.classList.add('transparent-active');
                } else {
                    wrapper.classList.remove('transparent-active');
                }
            }
        });
    }
    bindStyleUpdate('shape-text-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: '.v4-shape .v4-editable-cell',
        style: { color: val }
    }));
    bindStyleUpdate('shape-border-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: '.v4-shape',
        style: { borderColor: val }
    }));

    // Corner Radius Slider
    bindStyleUpdate('shape-border-radius', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: '.v4-shape',
        style: { borderRadius: val + 'px' }
    }));

    // Corner Style Toggle Buttons (Sharp / Round)
    const _syncCornerBtns = (radiusVal) => {
        const btnSharp = document.getElementById('btn-shape-corner-sharp');
        const btnRound = document.getElementById('btn-shape-corner-round');
        const isSharp = parseInt(radiusVal) === 0;
        if (btnSharp) {
            btnSharp.style.background = isSharp ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnSharp.style.borderColor = isSharp ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnSharp.style.color = isSharp ? '#00e5ff' : '#94a3b8';
        }
        if (btnRound) {
            btnRound.style.background = !isSharp ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnRound.style.borderColor = !isSharp ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnRound.style.color = !isSharp ? '#00e5ff' : '#94a3b8';
        }
    };

    const _applyCornerRadius = (val) => {
        const slider = document.getElementById('shape-border-radius');
        const txt = document.getElementById('txt-shape-border-radius');
        if (slider) slider.value = val;
        if (txt) txt.innerText = val;
        _syncCornerBtns(val);
        notifyIframe({
            type: 'LF_UPDATE_STYLE',
            selector: '.v4-shape',
            style: { borderRadius: val + 'px' }
        });
    };

    const btnSharp = document.getElementById('btn-shape-corner-sharp');
    if (btnSharp) {
        btnSharp.onclick = () => _applyCornerRadius(0);
    }

    const btnRound = document.getElementById('btn-shape-corner-round');
    if (btnRound) {
        btnRound.onclick = () => _applyCornerRadius(8);
    }

    // Also sync button states when slider changes
    const radiusSlider = document.getElementById('shape-border-radius');
    if (radiusSlider) {
        radiusSlider.addEventListener('input', function() {
            _syncCornerBtns(this.value);
        });
    }

    // Text Align Presets Sync
    const _syncAlignBtns = (alignVal) => {
        const btnLeft = document.getElementById('btn-shape-align-left');
        const btnCenter = document.getElementById('btn-shape-align-center');
        const btnRight = document.getElementById('btn-shape-align-right');
        
        const align = alignVal || 'center';
        
        if (btnLeft) {
            btnLeft.style.background = align === 'left' ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnLeft.style.borderColor = align === 'left' ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnLeft.style.color = align === 'left' ? '#00e5ff' : '#94a3b8';
        }
        if (btnCenter) {
            btnCenter.style.background = align === 'center' ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnCenter.style.borderColor = align === 'center' ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnCenter.style.color = align === 'center' ? '#00e5ff' : '#94a3b8';
        }
        if (btnRight) {
            btnRight.style.background = align === 'right' ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnRight.style.borderColor = align === 'right' ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnRight.style.color = align === 'right' ? '#00e5ff' : '#94a3b8';
        }
    };

    const _applyTextAlign = (align) => {
        _syncAlignBtns(align);
        const jc = align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center');
        
        notifyIframe({
            type: 'LF_UPDATE_STYLE',
            selector: '.v4-shape .v4-shape-text-content',
            style: {
                justifyContent: jc,
                textAlign: align
            }
        });
    };

    const btnAlignLeft = document.getElementById('btn-shape-align-left');
    if (btnAlignLeft) btnAlignLeft.onclick = () => _applyTextAlign('left');

    const btnAlignCenter = document.getElementById('btn-shape-align-center');
    if (btnAlignCenter) btnAlignCenter.onclick = () => _applyTextAlign('center');

    const btnAlignRight = document.getElementById('btn-shape-align-right');
    if (btnAlignRight) btnAlignRight.onclick = () => _applyTextAlign('right');

    // Text Marker Bindings
    bindStyleUpdate('text-color-picker', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: '.v4-editable-cell',
        style: { color: val }
    }));

    // Icon Editor Bindings
    bindStyleUpdate('icon-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'img, .lf-icon',
        style: { color: val }
    }));

    // Universal Transparency Logic
    const transparencyConfig = [
        { btn: 'btn-shape-bg-none', wrapper: 'shape-bg-wrapper', selector: '.v4-shape', style: { background: 'transparent', backgroundColor: 'transparent' } },
        { btn: 'btn-shape-border-none', wrapper: 'shape-border-wrapper', selector: '.v4-shape', style: { borderColor: 'transparent' } },
        { btn: 'btn-table-border-none', wrapper: 'table-border-wrapper', selector: '.v4-table', style: { borderColor: 'transparent' } },
        { btn: 'btn-icon-border-none', wrapper: 'icon-border-wrapper', selector: '.lf-icon', style: { borderColor: 'transparent' } }
    ];

    transparencyConfig.forEach(conf => {
        const btn = document.getElementById(conf.btn);
        if (btn) {
            btn.onclick = () => {
                const wrapper = document.getElementById(conf.wrapper);
                if (wrapper) wrapper.classList.add('transparent-active');
                
                // shape-bg-opacity sync if shape bg is none
                if (conf.btn === 'btn-shape-bg-none') {
                    const slider = document.getElementById('shape-bg-opacity');
                    const txt = document.getElementById('txt-shape-bg-opacity');
                    if (slider) slider.value = 0;
                    if (txt) txt.innerText = 0;
                }

                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    selector: conf.selector,
                    style: conf.style
                });
            };
        }
    });

    // Reset transparency when color is picked (Global)
    const colorIds = [
        { id: 'shape-bg-color', wrapper: 'shape-bg-wrapper' },
        { id: 'shape-border-color', wrapper: 'shape-border-wrapper' },
        { id: 'table-border-color', wrapper: 'table-border-wrapper' },
        { id: 'icon-border-color', wrapper: 'icon-border-wrapper' }
    ];

    colorIds.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.addEventListener('input', () => {
                const wrapper = document.getElementById(item.wrapper);
                if (wrapper) wrapper.classList.remove('transparent-active');
            });
        }
    });

    // 3. Table Actions
    const bindAction = (btnId, action) => {
        const el = document.getElementById(btnId);
        if (el) {
            el.onclick = () => {
                const fontSize = document.getElementById('table-font-size')?.value;
                notifyIframe({ type: 'LF_TABLE_ACTION', action, fontSize });
            };
        }
    };

    bindAction('btn-add-row', 'ADD_ROW');
    bindAction('btn-del-row', 'DEL_ROW');
    bindAction('btn-add-col', 'ADD_COL');
    bindAction('btn-del-col', 'DEL_COL');
    bindAction('btn-layout-h', 'LAYOUT_H');
    bindAction('btn-layout-v', 'LAYOUT_V');

    window.addEventListener('message', e => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'LF_COMP_SELECTED') {
            // UI Sync with current styles (Visibility is now managed by vctrl_inspector.js)
            if (data.currentStyles) {
                const s = data.currentStyles;
                
                // Sync Color Pickers
                const syncColor = (id, wrapperId, color, isTransparent) => {
                    const picker = document.getElementById(id);
                    const wrapper = document.getElementById(wrapperId);
                    if (picker && color) picker.value = color;
                    if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
                };

                syncColor('shape-bg-color', 'shape-bg-wrapper', s.bg, s.isBgTransparent);
                syncColor('shape-border-color', 'shape-border-wrapper', s.border, s.isBorderTransparent);
                syncColor('shape-text-color', '', s.text, false);
                
                // Sync Shape Opacity
                if (data.isShape && s.bgOpacity !== undefined) {
                    const slider = document.getElementById('shape-bg-opacity');
                    const txt = document.getElementById('txt-shape-bg-opacity');
                    if (slider) slider.value = s.bgOpacity;
                    if (txt) txt.innerText = s.bgOpacity;
                }
                
                syncColor('table-border-color', 'table-border-wrapper', s.border, s.isBorderTransparent);

                syncColor('icon-color', 'icon-color-wrapper', s.iconColor, false);
                
                // Sync Text Marker Color Picker
                if (data.isPin) {
                    syncColor('text-color-picker', '', s.text, false);
                }

                // Sync Other Inputs
                const fontSizeInput = document.getElementById(data.isTable ? 'table-font-size' : 'shape-font-size');
                if (fontSizeInput) {
                    fontSizeInput.value = data.currentStyles.fontSize;
                    const txt = document.getElementById('txt-' + fontSizeInput.id);
                    if (txt) txt.innerText = data.currentStyles.fontSize;
                }

                // Sync Corner Radius (Shape only)
                if (data.isShape && data.currentStyles.borderRadius !== undefined) {
                    const radiusVal = data.currentStyles.borderRadius;
                    const slider = document.getElementById('shape-border-radius');
                    const txt = document.getElementById('txt-shape-border-radius');
                    if (slider) slider.value = radiusVal;
                    if (txt) txt.innerText = radiusVal;
                    _syncCornerBtns(radiusVal);
                }

                // Sync Text Align (Shape only)
                if (data.isShape && data.currentStyles.textAlign !== undefined) {
                    _syncAlignBtns(data.currentStyles.textAlign);
                }

                // Sync Checkbox / Radio BG & Border colors
                if (data.isCheckbox || data.isRadio) {
                    syncColor('atom-bg-color', 'atom-bg-wrapper', s.bg, s.isBgTransparent);
                    syncColor('atom-border-color', 'atom-border-wrapper', s.border, s.isBorderTransparent);
                }

                // Sync Textbox / Textarea BG & Border colors and Properties
                if (data.isTextbox || data.isTextarea) {
                    syncColor('input-bg-color', 'input-bg-wrapper', s.bg, s.isBgTransparent);
                    syncColor('input-border-color', 'input-border-wrapper', s.border, s.isBorderTransparent);
                    
                    const phInput = document.getElementById('prop-input-placeholder');
                    if (phInput && data.placeholderText !== undefined) {
                        phInput.value = data.placeholderText;
                    }
                    const mlInput = document.getElementById('prop-input-maxlength');
                    const mlTxt = document.getElementById('txt-input-maxlength');
                    if (mlInput && data.maxLength !== undefined) {
                        mlInput.value = data.maxLength;
                        if (mlTxt) mlTxt.innerText = data.maxLength;
                    }
                    
                    const activeY = document.getElementById('btn-input-counter-y');
                    const activeN = document.getElementById('btn-input-counter-n');
                    const highlightActive = (btn, isActive) => {
                        if (!btn) return;
                        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
                        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
                        btn.style.fontWeight = isActive ? 'bold' : 'normal';
                    };
                    if (activeY && activeN && data.showCounter !== undefined) {
                        highlightActive(activeY, data.showCounter === true);
                        highlightActive(activeN, data.showCounter === false);
                    }
                }

            }
        } 
        else if (data.type === 'LF_CELL_SELECTED') {
            if (data.cellData) {
                const cd = data.cellData;
                
                // Sync Cell Background
                const bgPicker = document.getElementById('cell-bg-color');
                const bgWrapper = document.getElementById('cell-bg-wrapper');
                const isBgTransparent = cd.backgroundColor === 'transparent' || cd.backgroundColor === 'rgba(0, 0, 0, 0)' || cd.backgroundColor === '';
                if (bgPicker) {
                    if (isBgTransparent) {
                        bgPicker.value = '#ffffff'; // Default visible color when active again
                    } else {
                        bgPicker.value = _rgb2hex(cd.backgroundColor);
                    }
                }
                if (bgWrapper) bgWrapper.classList.toggle('transparent-active', isBgTransparent);

                // Sync Cell Text Color
                const textPicker = document.getElementById('cell-text-color');
                if (textPicker && cd.color) {
                    textPicker.value = _rgb2hex(cd.color);
                }

                // Sync Width Slider
                const widthInput = document.getElementById('cell-col-width');
                if (widthInput && cd.width) {
                    widthInput.value = cd.width;
                    const txt = document.getElementById('txt-cell-col-width');
                    if (txt) txt.innerText = cd.width;
                }

                // Sync Height Slider
                const heightInput = document.getElementById('cell-row-height');
                if (heightInput && cd.height) {
                    heightInput.value = cd.height;
                    const txt = document.getElementById('txt-cell-row-height');
                    if (txt) txt.innerText = cd.height;
                }
            }
        }
        else if (data.type === 'LF_DESELECT' || data.type === 'LF_COMP_DESELECTED') {
            // Deselection UI sync is handled by vctrl_inspector.js
        }
        else if (data.type === 'LF_DIRTY') {
            if (typeof window.markAsDirty === 'function') {
                window.markAsDirty();
            }
        }
        else if (data.type === 'LF_TRIGGER_SAVE') {
            if (typeof window.handleGlobalSave === 'function') {
                window.handleGlobalSave();
            }
        }
    });

    // Checkbox / Radio Button Option Actions
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
        
        // Color Pickers
        const bgColor = document.getElementById('atom-bg-color');
        const borderCol = document.getElementById('atom-border-color');
        
        if (bgColor) {
            bgColor.oninput = () => {
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { backgroundColor: bgColor.value, background: bgColor.value }
                });
            };
        }
        const btnBgNone = document.getElementById('btn-atom-bg-none');
        if (btnBgNone) {
            btnBgNone.onclick = () => {
                const wrapper = document.getElementById('atom-bg-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { backgroundColor: 'transparent', background: 'transparent' }
                });
            };
        }
        
        if (borderCol) {
            borderCol.oninput = () => {
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { borderColor: borderCol.value }
                });
            };
        }
        const btnBorderNone = document.getElementById('btn-atom-border-none');
        if (btnBorderNone) {
            btnBorderNone.onclick = () => {
                const wrapper = document.getElementById('atom-border-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { borderColor: 'transparent' }
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

        // Color Pickers
        const bgColor = document.getElementById('input-bg-color');
        const borderCol = document.getElementById('input-border-color');

        if (bgColor) {
            bgColor.oninput = () => {
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { backgroundColor: bgColor.value, background: bgColor.value }
                });
            };
        }
        const btnBgNone = document.getElementById('btn-input-bg-none');
        if (btnBgNone) {
            btnBgNone.onclick = () => {
                const wrapper = document.getElementById('input-bg-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { backgroundColor: 'transparent', background: 'transparent' }
                });
            };
        }

        if (borderCol) {
            borderCol.oninput = () => {
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { borderColor: borderCol.value }
                });
            };
        }
        const btnBorderNone = document.getElementById('btn-input-border-none');
        if (btnBorderNone) {
            btnBorderNone.onclick = () => {
                const wrapper = document.getElementById('input-border-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    style: { borderColor: 'transparent' }
                });
            };
        }
    };
    initTextboxTextareaEvents();

    window.closeAllV4Inspectors = function() {
        const tableSect = document.getElementById('table-inspector-section');
        const shapeSect = document.getElementById('shape-inspector-section');
        const actions = document.getElementById('comp-actions-section');
        if (tableSect) tableSect.style.display = 'none';
        if (shapeSect) shapeSect.style.display = 'none';
        if (actions) actions.style.display = 'none';
        notifyIframe({ type: 'LF_DESELECT_ALL' });
    };

})();
