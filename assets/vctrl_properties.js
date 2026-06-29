/**
 * vctrl_properties.js - Universal Property Editor Controller
 * Responsibility: Synchronizing component dimensions across all inspector sections.
 * V203_ASPECT_RATIO_LOCK: Added "Preserve Aspect Ratio" lock for image shapes.
 */

(function() {
    console.log("%c [VCTRL PROPERTIES] Initializing Universal Property Controller (V203)... ", "background: #8b5cf6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    let activeCompId = null;
    let activeImageRatio = null; // w/h ratio for image shapes (null = not an image)

    // 1. Message Listeners
    if (window.MessageHub) {
        MessageHub.subscribe('LF_COMP_SELECTED', (data) => {
            activeCompId = data.id;
            updateAllInputs(data.w, data.h);

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

})();
