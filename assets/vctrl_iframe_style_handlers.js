/**
 * vctrl_iframe_style_handlers.js
 * Manages LF_UPDATE_STYLE and style reconciliation handlers inside iframe.
 */
(function() {
    window.V4StyleHandlers = {
        applyStyleToComponent: function(comp, styles) {
            if (!comp || !styles) return;
            if (styles.bg !== undefined) {
                const shape = comp.querySelector('.v4-shape');
                if (shape) shape.style.backgroundColor = styles.bg;
                else comp.style.backgroundColor = styles.bg;
            }
            if (styles.border !== undefined) {
                const shape = comp.querySelector('.v4-shape');
                if (shape) shape.style.borderColor = styles.border;
                else comp.style.borderColor = styles.border;
            }
        }
    };
})();
