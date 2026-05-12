/**
 * vctrl_properties.js - Universal Property Editor Controller
 * Responsibility: Synchronizing component dimensions across all inspector sections.
 */

(function() {
    console.log("%c [VCTRL PROPERTIES] Initializing Universal Property Controller... ", "background: #8b5cf6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    let activeCompId = null;

    // 1. Message Listeners
    if (window.MessageHub) {
        MessageHub.subscribe('LF_COMP_SELECTED', (data) => {
            activeCompId = data.id;
            updateAllInputs(data.w, data.h);
            
            // Connector Support - Handled internally by ConnectorEngine now
        });

        MessageHub.subscribe('LF_COMP_RESIZED', (data) => {
            updateAllInputs(data.w, data.h);
        });

        MessageHub.subscribe('LF_DESELECT', () => {
            activeCompId = null;
            updateAllInputs(0, 0);
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

        // Connector Sync - Handled internally by ConnectorEngine now

        if (!activeCompId || !window.DOM || !window.DOM.iframe || !window.DOM.iframe.contentWindow) return;

        const style = {};
        style[type] = val + 'px';

        MessageHub.send(window.DOM.iframe.contentWindow, 'LF_UPDATE_STYLE', {
            style: style
        });

        // Sync other inputs of the same property
        const inputs = document.querySelectorAll(`.v4-prop-input[data-prop="${type}"]`);
        inputs.forEach(input => {
            if (input !== document.activeElement) input.value = val;
        });

        if (window.markAsDirty) window.markAsDirty();
    }

})();
