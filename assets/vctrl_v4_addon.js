/**
 * vctrl_v4_addon.js
 * Bridges V4 Table & Shape editing into the main viewer system.
 * Optimized for 'file://' protocol security by using postMessage instead of direct DOM access.
 */

(function() {
    console.log("%c [V4 ADDON LOADED] ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    function notifyIframe(data) {
        const activeIframe = document.getElementById('main-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage(data, '*');
        } else {
            console.warn("[V4 Addon] notifyIframe failed: activeIframe or contentWindow not found.");
        }
    }

    // 1. Component Insertion
    window.insertV4ComponentById = function(id, customIdx) {
        if (id === 'v4-atom-image') {
            triggerImageFileUpload();
            return;
        }
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
            } else if (item.id === 'v4-atom-stepper') {
                style.width = '154px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-selectbox') {
                style.width = '150px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-fileupload') {
                style.width = '300px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-alert') {
                style.width = '250px';
                style.height = '120px';
            } else if (item.id === 'v4-atom-button') {
                style.width = '80px';
                style.height = '40px';
            } else if (item.id === 'v4-atom-datepicker') {
                style.width = '500px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-admin-settings') {
                style.width = '1180px';
                style.height = '50px';
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
            className: isDescriptionPin ? 'pin-marker' : (isTextTool ? 'v4-text-box' : ''),
            isGroup: !!item.isGroup
        });
    };

    function triggerImageFileUpload() {
        let input = document.getElementById('v4-image-file-input');
        if (!input) {
            input = document.createElement('input');
            input.id = 'v4-image-file-input';
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64 = evt.target.result;
                    const img = new Image();
                    img.onload = function() {
                        let w = img.naturalWidth || 200;
                        let h = img.naturalHeight || 200;
                        const maxBound = 300;
                        if (w > maxBound || h > maxBound) {
                            const ratio = Math.min(maxBound / w, maxBound / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                        }
                        window.insertImageComponent(base64, w + 'px', h + 'px');
                    };
                    img.src = base64;
                };
                reader.readAsDataURL(file);
                input.value = '';
            });
        }
        input.click();
    }

    window.insertImageComponent = function(base64, width, height) {
        const targetId = 'v4-img-' + Date.now();
        const html = '<div class="v4-shape v4-shape-image" style="width: 100%; height: 100%; background-image: url(\'' + base64 + '\'); background-size: contain; background-position: center; background-repeat: no-repeat; box-sizing: border-box; border: 1.6px solid transparent; background-color: transparent !important;"></div>';
        const finalW = width || '200px';
        const finalH = height || '200px';
        const style = {
            width: finalW,
            height: finalH
        };
        notifyIframe({
            type: 'LF_INSERT_COMPONENT',
            id: targetId,
            html: html,
            style: style,
            className: ''
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
        { btn: 'btn-icon-border-none', wrapper: 'icon-border-wrapper', selector: '.lf-icon', style: { borderColor: 'transparent' } },
        { btn: 'btn-button-bg-none', wrapper: 'button-bg-wrapper', selector: '', style: { background: 'transparent', backgroundColor: 'transparent' } },
        { btn: 'btn-button-border-none', wrapper: 'button-border-wrapper', selector: '', style: { borderColor: 'transparent' } }
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
        { id: 'icon-border-color', wrapper: 'icon-border-wrapper' },
        { id: 'prop-button-bg-color', wrapper: 'button-bg-wrapper' },
        { id: 'prop-button-border-color', wrapper: 'button-border-wrapper' }
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
                
                // Sync Shape Opacity
                if (data.isShape && s.bgOpacity !== undefined) {
                    const slider = document.getElementById('shape-bg-opacity');
                    const txt = document.getElementById('txt-shape-bg-opacity');
                    if (slider) slider.value = s.bgOpacity;
                    if (txt) txt.innerText = s.bgOpacity;
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
                }

                // Sync Textbox / Textarea BG & Border colors and Properties
                if (data.isTextbox || data.isTextarea) {
                    const phInput = document.getElementById('prop-input-placeholder');
                    if (phInput && data.placeholderText !== undefined) {
                        phInput.value = data.placeholderText;
                    }
                }

                // Sync Search Bar BG & Border colors and Properties
                if (data.isSearchBar) {
                    const phInput = document.getElementById('prop-searchbar-placeholder');
                    if (phInput && data.searchbarPlaceholder !== undefined) {
                        phInput.value = data.searchbarPlaceholder;
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

                // Sync Alert BG & Border colors and Properties
                if (data.isAlert) {
                    const activeDescY = document.getElementById('btn-alert-desc-y');
                    const activeDescN = document.getElementById('btn-alert-desc-n');
                    const descInput = document.getElementById('prop-alert-desc');
                    const highlightActive = (btn, isActive) => {
                        if (!btn) return;
                        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
                        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
                        btn.style.fontWeight = isActive ? 'bold' : 'normal';
                    };
                    if (activeDescY && activeDescN && data.alertShowDesc !== undefined) {
                        highlightActive(activeDescY, data.alertShowDesc === true);
                        highlightActive(activeDescN, data.alertShowDesc === false);
                    }
                    if (descInput && data.alertDesc !== undefined) {
                        descInput.value = data.alertDesc;
                    }

                    const msgInput = document.getElementById('prop-alert-message');
                    if (msgInput && data.alertMessage !== undefined) {
                        msgInput.value = data.alertMessage;
                    }
                    
                    const count = data.alertBtnCount || 1;
                    for (let i = 1; i <= 3; i++) {
                        const btn = document.getElementById('btn-alert-count-' + i);
                        if (btn) {
                            const isActive = count === i;
                            btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                            btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
                            btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
                            btn.style.fontWeight = isActive ? 'bold' : 'normal';
                        }
                    }
                    
                    const btn1 = document.getElementById('prop-alert-btn-1');
                    if (btn1 && data.alertBtnText1 !== undefined) btn1.value = data.alertBtnText1;
                    const sel1 = document.getElementById('prop-alert-btn-style-1');
                    if (sel1 && data.alertBtnStyle1 !== undefined) sel1.value = data.alertBtnStyle1;
                    
                    const btn2 = document.getElementById('prop-alert-btn-2');
                    if (btn2 && data.alertBtnText2 !== undefined) btn2.value = data.alertBtnText2;
                    const sel2 = document.getElementById('prop-alert-btn-style-2');
                    if (sel2 && data.alertBtnStyle2 !== undefined) sel2.value = data.alertBtnStyle2;
                    const btn2Container = document.getElementById('prop-alert-btn-2-container');
                    if (btn2Container) btn2Container.style.display = count >= 2 ? 'flex' : 'none';
                    
                    const btn3 = document.getElementById('prop-alert-btn-3');
                    if (btn3 && data.alertBtnText3 !== undefined) btn3.value = data.alertBtnText3;
                    const sel3 = document.getElementById('prop-alert-btn-style-3');
                    if (sel3 && data.alertBtnStyle3 !== undefined) sel3.value = data.alertBtnStyle3;
                    const btn3Container = document.getElementById('prop-alert-btn-3-container');
                    if (btn3Container) btn3Container.style.display = count >= 3 ? 'flex' : 'none';
                }

                // Sync Button BG & Border colors and Properties
                if (data.isButton) {
                    const txtInput = document.getElementById('prop-button-text');
                    if (txtInput && data.buttonText !== undefined) {
                        txtInput.value = data.buttonText;
                    }
                    const selStyle = document.getElementById('prop-button-style');
                    if (selStyle && data.buttonStyle !== undefined) {
                        selStyle.value = data.buttonStyle;
                        const customColorsDiv = document.getElementById('prop-button-custom-colors');
                        if (customColorsDiv) {
                            customColorsDiv.style.display = (data.buttonStyle === 'custom') ? 'block' : 'none';
                        }
                    }
                    const radiusSlider = document.getElementById('prop-button-border-radius');
                    const radiusTxt = document.getElementById('txt-button-border-radius');
                    if (radiusSlider && data.buttonRadius !== undefined) {
                        radiusSlider.value = data.buttonRadius;
                        if (radiusTxt) radiusTxt.innerText = data.buttonRadius;
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
        else if (data.type === 'LF_INSERT_IMAGE_COMP') {
            const base64 = data.base64;
            const img = new Image();
            img.onload = function() {
                let w = img.naturalWidth || 200;
                let h = img.naturalHeight || 200;
                const maxBound = 300;
                if (w > maxBound || h > maxBound) {
                    const ratio = Math.min(maxBound / w, maxBound / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                if (typeof window.insertImageComponent === 'function') {
                    window.insertImageComponent(base64, w + 'px', h + 'px');
                }
            };
            img.src = base64;
        }
        else if (data.type === 'LF_SAVE_CLIPBOARD') {
            console.log("[Clipboard Debug] Parent saved clipboard data from iframe:", data.clipboard);
            window.__lf_global_clipboard__ = data.clipboard;
        }
        else if (data.type === 'LF_REQUEST_CLIPBOARD') {
            console.log("[Clipboard Debug] Parent received request for clipboard. Stored data:", window.__lf_global_clipboard__);
            notifyIframe({
                type: 'LF_RESPONSE_CLIPBOARD',
                clipboard: window.__lf_global_clipboard__ || []
            });
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

        // Start/End Date Direct Input
        const startInput = document.getElementById('prop-dp-start-date');
        if (startInput) {
            startInput.addEventListener('change', function() {
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', startDate: this.value });
            });
        }
        const endInput = document.getElementById('prop-dp-end-date');
        if (endInput) {
            endInput.addEventListener('change', function() {
                notifyIframeDp({ type: 'LF_UPDATE_DATEPICKER', endDate: this.value });
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

    window.syncGridHeaderInputs = (headers) => {
        const container = document.getElementById('grid-columns-container');
        if (!container) return;
        container.innerHTML = '';
        headers.forEach((headerText, index) => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; flex-direction:column; gap:4px; margin-bottom: 8px;';
            div.innerHTML = `
                <label style="font-size: 9px; color: #94a3b8; display: block;">COLUMN ${index + 1} TITLE</label>
                <input type="text" class="v4-prop-input grid-header-input" data-index="${index}" value="${headerText || ''}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 6px 8px; border-radius: 4px; font-size: 11px;">
            `;
            container.appendChild(div);
            
            const input = div.querySelector('input');
            input.oninput = () => {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    const allInputs = Array.from(container.querySelectorAll('.grid-header-input'));
                    const updatedHeaders = allInputs.map(inp => inp.value);
                    window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_GRID_PROPERTIES', {
                        headers: updatedHeaders
                    });
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
                            // Gather attributes to sync
                            const syncData = {
                                id: activeId,
                                editingType: 'admin-settings',
                                adminRowCount: val
                            };
                            for (let i = 1; i <= 4; i++) {
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
    };
    initAdminSettingsEvents();

    // Parent-side paste event listener for handling pasted image files when parent has focus
    window.addEventListener('paste', function(e) {
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.closest('.ql-editor'));
        if (isInput) return; // Allow normal input paste

        const items = (e.clipboardData || window.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64 = evt.target.result;
                    const img = new Image();
                    img.onload = function() {
                        let w = img.naturalWidth || 200;
                        let h = img.naturalHeight || 200;
                        const maxBound = 300;
                        if (w > maxBound || h > maxBound) {
                            const ratio = Math.min(maxBound / w, maxBound / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                        }
                        window.insertImageComponent(base64, w + 'px', h + 'px');
                    };
                    img.src = base64;
                };
                reader.readAsDataURL(file);
                e.preventDefault();
                break;
            }
        }
    });

})();
