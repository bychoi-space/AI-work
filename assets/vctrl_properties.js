/**
 * vctrl_properties.js - Universal Property Editor Controller
 * Responsibility: Synchronizing component dimensions across all inspector sections.
 * V203_ASPECT_RATIO_LOCK: Added "Preserve Aspect Ratio" lock for image shapes.
 */

(function() {
    console.log("%c [VCTRL PROPERTIES] Initializing Universal Property Controller (V203)... ", "background: #8b5cf6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    let activeCompId = null;
    let activeImageRatio = null; // w/h ratio for image shapes (null = not an image)

    const UNIFIED_LABELS = {
        background: '배경색 (BG)',
        borderColor: '테두리색 (Border)',
        color: '글자색 (Text)',
        width: '가로 크기 (Width)',
        height: '세로 크기 (Height)'
    };

    function initLabels() {
        document.querySelectorAll('.v4-color-label, .v4-unified-label').forEach(label => {
            const prop = label.dataset.prop;
            if (UNIFIED_LABELS[prop]) {
                label.textContent = UNIFIED_LABELS[prop];
            }
        });
    }
    
    // Run immediately or on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLabels);
    } else {
        initLabels();
    }

    // 1. Message Listeners
    if (window.MessageHub) {
        MessageHub.subscribe('LF_COMP_SELECTED', (data) => {
            activeCompId = data.id;
            updateAllInputs(data.w, data.h);
            syncAllColors(data.currentStyles || {});

            // Show/hide Preserve Aspect Ratio row depending on whether this is an image
            const ratioRow = document.getElementById('shape-aspect-ratio-row');
            const chk = document.getElementById('chk-preserve-aspect-ratio');
            if (data.isImage) {
                // Store current w/h ratio as the lock ratio
                activeImageRatio = (data.h && data.h > 0) ? (data.w / data.h) : (data.imageRatio || null);
                if (ratioRow) ratioRow.style.display = 'flex';
            } else {
                activeImageRatio = null;
                if (ratioRow) ratioRow.style.display = 'none';
                if (chk) chk.checked = false;
            }
        });

        MessageHub.subscribe('LF_COMP_RESIZED', (data) => {
            updateAllInputs(data.w, data.h);
            // Update ratio when component is resized externally
            if (activeImageRatio !== null && data.w && data.h && data.h > 0) {
                activeImageRatio = data.w / data.h;
            }
        });

        MessageHub.subscribe('LF_DESELECT', () => {
            activeCompId = null;
            activeImageRatio = null;
            updateAllInputs(0, 0);
            syncAllColors({});

            // Hide ratio row on deselect
            const ratioRow = document.getElementById('shape-aspect-ratio-row');
            const chk = document.getElementById('chk-preserve-aspect-ratio');
            if (ratioRow) ratioRow.style.display = 'none';
            if (chk) chk.checked = false;
        });
    }

    function updateAllInputs(w, h) {
        const inputs = document.querySelectorAll('.v4-prop-input');
        inputs.forEach(input => {
            const prop = input.dataset.prop;
            if (prop === 'width') input.value = Math.round(w);
            if (prop === 'height') input.value = Math.round(h);
        });
    }

    function syncAllColors(s) {
        const colorInputs = document.querySelectorAll('.v4-color-input');
        colorInputs.forEach(input => {
            const prop = input.dataset.prop;
            const wrapper = input.closest('.v4-color-wrapper');
            
            let val = '';
            let isTransparent = false;
            
            if (prop === 'background') {
                val = s.bg || '#ffffff';
                isTransparent = s.isBgTransparent || false;
            } else if (prop === 'borderColor') {
                val = s.border || '#cccccc';
                isTransparent = s.isBorderTransparent || false;
            } else if (prop === 'color') {
                val = s.text || '#1f2937';
                isTransparent = false;
            }
            
            if (val.startsWith('rgb')) {
                val = rgbToHex(val);
            }
            
            input.value = val;
            if (wrapper) {
                wrapper.classList.toggle('transparent-active', isTransparent);
            }
        });
    }

    function rgbToHex(rgb) {
        if (!rgb) return '#ffffff';
        if (rgb.startsWith('#')) return rgb;
        const matches = rgb.match(/\d+/g);
        if (!matches || matches.length < 3) return '#ffffff';
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // 2. Event Delegation for Input Fields
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('v4-prop-input')) {
            applyDimension(e.target.dataset.prop, e.target.value);
        }
    });

    document.addEventListener('wheel', (e) => {
        if (e.target.classList.contains('v4-prop-input')) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const delta = e.deltaY < 0 ? step : -step;
            e.target.value = Math.max(1, parseInt(e.target.value || 0) + delta);
            applyDimension(e.target.dataset.prop, e.target.value);
        }
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('v4-prop-input')) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                const delta = e.key === 'ArrowUp' ? step : -step;
                e.target.value = Math.max(1, parseInt(e.target.value || 0) + delta);
                applyDimension(e.target.dataset.prop, e.target.value);
            }
        }
    });

    function applyDimension(type, value) {
        const val = parseInt(value) || 0;
        if (val < 1) return;

        if (!activeCompId || !window.DOM || !window.DOM.iframe || !window.DOM.iframe.contentWindow) return;

        const chk = document.getElementById('chk-preserve-aspect-ratio');
        const shouldLock = chk && chk.checked && activeImageRatio !== null;

        const style = {};
        style[type] = val + 'px';

        if (shouldLock) {
            // Compute the other dimension proportionally
            if (type === 'width') {
                const computedH = Math.max(1, Math.round(val / activeImageRatio));
                style['height'] = computedH + 'px';
                // Sync height inputs
                document.querySelectorAll('.v4-prop-input[data-prop="height"]').forEach(el => {
                    el.value = computedH;
                });
            } else if (type === 'height') {
                const computedW = Math.max(1, Math.round(val * activeImageRatio));
                style['width'] = computedW + 'px';
                // Sync width inputs
                document.querySelectorAll('.v4-prop-input[data-prop="width"]').forEach(el => {
                    el.value = computedW;
                });
            }
        }

        MessageHub.send(window.DOM.iframe.contentWindow, 'LF_UPDATE_STYLE', {
            style: style
        });

        // Sync other inputs of the same property (exclude active element)
        const inputs = document.querySelectorAll(`.v4-prop-input[data-prop="${type}"]`);
        inputs.forEach(input => {
            if (input !== document.activeElement) input.value = val;
        });

        if (window.markAsDirty) window.markAsDirty();
    }

    // 3. Event Delegation for Color Inputs
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('v4-color-input')) {
            const prop = e.target.dataset.prop;
            const value = e.target.value;
            const wrapper = e.target.closest('.v4-color-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
            applyStyle(prop, value);
        }
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.v4-color-none-btn');
        if (btn) {
            const prop = btn.dataset.prop;
            const group = btn.closest('.prop-group');
            if (group) {
                const wrapper = group.querySelector('.v4-color-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
            }
            applyStyle(prop, 'transparent');
        }
    });

    function applyStyle(prop, value) {
        if (!activeCompId || !window.DOM || !window.DOM.iframe || !window.DOM.iframe.contentWindow) return;
        
        const style = {};
        if (prop === 'background') {
            style['background'] = value;
            style['backgroundColor'] = value;
        } else {
            style[prop] = value;
        }
        
        MessageHub.send(window.DOM.iframe.contentWindow, 'LF_UPDATE_STYLE', {
            style: style
        });
        
        if (window.markAsDirty) window.markAsDirty();
    }

})();
