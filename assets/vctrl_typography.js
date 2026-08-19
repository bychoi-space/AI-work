/**
 * vctrl_typography.js - Central Typography & Design Tokens Module (SSOT)
 * Responsibility: Unified typography constants, CSS custom properties injection,
 * and global style normalization for all LF Editor library objects (Shapes, Atoms, Molecules).
 */

(function() {
    console.log("[VCTRL TYPOGRAPHY] Initializing unified typography module...");

    // 1. Single Source of Truth (SSOT) Constants
    window.V4_TYPOGRAPHY = {
        COLOR: '#0f172a',
        FONT_SIZE: '12px',
        FONT_WEIGHT: '400',
        FONT_FAMILY: 'inherit',
        PLACEHOLDER_COLOR: '#94a3b8',
        MUTED_COLOR: '#64748b',
        
        // CSS Style String Helper for inline injection
        getBaseStyle: function() {
            return 'color: ' + this.COLOR + '; font-size: ' + this.FONT_SIZE + '; font-weight: ' + this.FONT_WEIGHT + '; font-family: ' + this.FONT_FAMILY + ';';
        }
    };

    // 2. Inject CSS Custom Properties to Parent Window Document
    function injectParentVariables() {
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--v4-text-color', window.V4_TYPOGRAPHY.COLOR);
        rootStyle.setProperty('--v4-font-size', window.V4_TYPOGRAPHY.FONT_SIZE);
        rootStyle.setProperty('--v4-font-weight', window.V4_TYPOGRAPHY.FONT_WEIGHT);
        rootStyle.setProperty('--v4-font-family', window.V4_TYPOGRAPHY.FONT_FAMILY);
        rootStyle.setProperty('--v4-placeholder-color', window.V4_TYPOGRAPHY.PLACEHOLDER_COLOR);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectParentVariables);
    } else {
        injectParentVariables();
    }

    // 3. Iframe-Side Injection Script (Compiled via vctrl_core.js)
    window.v4TypographyScript = `
    (function() {
        console.log("[V4 Typography] Iframe typography token engine active.");
        window.V4_TYPOGRAPHY = window.V4_TYPOGRAPHY || {
            COLOR: '#0f172a',
            FONT_SIZE: '12px',
            FONT_WEIGHT: '400',
            FONT_FAMILY: 'inherit',
            PLACEHOLDER_COLOR: '#94a3b8'
        };

        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--v4-text-color', window.V4_TYPOGRAPHY.COLOR);
        rootStyle.setProperty('--v4-font-size', window.V4_TYPOGRAPHY.FONT_SIZE);
        rootStyle.setProperty('--v4-font-weight', window.V4_TYPOGRAPHY.FONT_WEIGHT);
        rootStyle.setProperty('--v4-font-family', window.V4_TYPOGRAPHY.FONT_FAMILY);
        rootStyle.setProperty('--v4-placeholder-color', window.V4_TYPOGRAPHY.PLACEHOLDER_COLOR);

        // Inject default typography rules tag if not exists
        if (!document.getElementById('v4-typography-rules')) {
            const styleTag = document.createElement('style');
            styleTag.id = 'v4-typography-rules';
            styleTag.textContent = [
                ':root {',
                '  --v4-text-color: #0f172a;',
                '  --v4-font-size: 12px;',
                '  --v4-font-weight: 400;',
                '  --v4-font-family: inherit;',
                '  --v4-placeholder-color: #94a3b8;',
                '}',
                '.v4-editable-cell, .v4-shape, .v4-shape-rect, .v4-shape-circle, .v4-shape-triangle, .v4-shape-diamond, .v4-shape-arrow, .v4-shape-pattern-grid, .v4-shape-wave, .text-marker, .v4-text-box, .v4-text-shape {',
                '  color: var(--v4-text-color, #0f172a);',
                '  font-size: var(--v4-font-size, 12px);',
                '  font-weight: var(--v4-font-weight, 400);',
                '  font-family: var(--v4-font-family, inherit);',
                '}',
                '.v4-premium-table th, .v4-premium-table td, .v4-grid-container td.v4-grid-cell, .v4-grid-container th.v4-grid-cell {',
                '  font-size: 12px !important;',
                '  font-weight: 400 !important;',
                '  color: var(--v4-text-color, #0f172a) !important;',
                '  font-family: inherit !important;',
                '}',
                '.v4-checkbox-text, .v4-radio-text {',
                '  font-size: 12px !important;',
                '  font-weight: 400 !important;',
                '  color: var(--v4-text-color, #0f172a) !important;',
                '  font-family: inherit !important;',
                '}',
                '.v4-dp-preset-btn {',
                '  font-size: 12px !important;',
                '  font-weight: 400 !important;',
                '  font-family: inherit !important;',
                '}',
                '.v4-alert-desc-badge, .v4-alert-title, .v4-alert-message, .v4-alert-btn {',
                '  font-size: 12px !important;',
                '  font-weight: 400 !important;',
                '  font-family: inherit !important;',
                '}',
                '.v4-admin-group-header, .v4-admin-label-cell {',
                '  font-size: 12px !important;',
                '  font-weight: 400 !important;',
                '  font-family: inherit !important;',
                '}',
                '.v4-popup-title, .v4-stepper-value, .v4-stepper-action, .v4-stepper-dec, .v4-stepper-inc, .v4-textbox-counter, .v4-textarea-counter {',
                '  font-size: 12px !important;',
                '  font-weight: 400 !important;',
                '  font-family: inherit !important;',
                '}'
            ].join('\\n');
            document.head.appendChild(styleTag);
        }
    })();
    `;
})();
