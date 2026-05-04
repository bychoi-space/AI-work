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
    window.insertV4ComponentById = function(id) {
        const lib = window.V4_COMPONENT_LIBRARY;
        if (!lib) return console.error("[V4] Component Library not found.");

        const customMols = (window.parent.state && window.parent.state.projectMetadata && window.parent.state.projectMetadata.molecules) ? window.parent.state.projectMetadata.molecules : [];
        
        const item = (lib.atoms || []).find(i => i.id === id) || 
                     (lib.molecules || []).find(i => i.id === id) || 
                     (lib.organisms || []).find(i => i.id === id) ||
                     customMols.find(i => i.id === id);

        if (!item) return console.error("[V4] Component not found:", id);

        const style = { width: '200px', height: '200px' };
        if (item.category === 'Atoms' || item.id === 'v4-shape-badge') {
            style.width = '120px';
            style.height = '40px';
        }
        if (item.id === 'v4-search-bar' || item.id === 'v4-premium-gnb') {
            style.width = '100%';
            style.height = 'auto';
        }

        notifyIframe({
            type: 'LF_INSERT_COMPONENT',
            id: 'v4-comp-' + Date.now(),
            html: item.html,
            style: style
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

    // Table Style Bindings
    bindStyleUpdate('table-font-size', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'table',
        subSelector: 'td, th',
        subStyle: { fontSize: val + 'px' }
    }));
    bindStyleUpdate('table-bg-color', { type: 'LF_UPDATE_STYLE', selector: 'table', prop: 'background' });
    bindStyleUpdate('table-text-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'table',
        style: { color: val },
        subSelector: 'td',
        subStyle: { color: val }
    }));
    bindStyleUpdate('table-header-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'table',
        subSelector: 'th',
        subStyle: { background: val }
    }));
    bindStyleUpdate('table-header-text-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'table',
        subSelector: 'th',
        subStyle: { color: val }
    }));
    bindStyleUpdate('table-border-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: 'table',
        style: { borderColor: val },
        subSelector: 'td, th',
        subStyle: { borderColor: val }
    }));

    // Shape Style Bindings
    bindStyleUpdate('shape-font-size', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: '.v4-shape .v4-editable-cell',
        style: { fontSize: val + 'px' }
    }));
    bindStyleUpdate('shape-bg-color', (val) => ({
        type: 'LF_UPDATE_STYLE',
        selector: '.v4-shape',
        style: { background: val, backgroundColor: val }
    }));
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

    // Universal Transparency Logic
    const transparencyConfig = [
        { btn: 'btn-shape-bg-none', wrapper: 'shape-bg-wrapper', selector: '.v4-shape', style: { background: 'transparent', backgroundColor: 'transparent' } },
        { btn: 'btn-shape-border-none', wrapper: 'shape-border-wrapper', selector: '.v4-shape', style: { borderColor: 'transparent' } },
        { btn: 'btn-table-header-none', wrapper: 'table-header-wrapper', selector: '.v4-table th', style: { backgroundColor: 'transparent' } },
        { btn: 'btn-table-bg-none', wrapper: 'table-bg-wrapper', selector: '.v4-table-body td', style: { backgroundColor: 'transparent' } },
        { btn: 'btn-table-border-none', wrapper: 'table-border-wrapper', selector: '.v4-table', style: { borderColor: 'transparent' } },
        { btn: 'btn-icon-border-none', wrapper: 'icon-border-wrapper', selector: '.lf-icon', style: { borderColor: 'transparent' } }
    ];

    transparencyConfig.forEach(conf => {
        const btn = document.getElementById(conf.btn);
        if (btn) {
            btn.onclick = () => {
                const wrapper = document.getElementById(conf.wrapper);
                if (wrapper) wrapper.classList.add('transparent-active');
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
        { id: 'table-header-color', wrapper: 'table-header-wrapper' },
        { id: 'table-bg-color', wrapper: 'table-bg-wrapper' },
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

    // 4. Message Listener (Show/Hide Inspectors)
    window.addEventListener('message', e => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'LF_COMP_SELECTED') {
            // Show global actions
            const actions = document.getElementById('comp-actions-section');
            if (actions) actions.style.display = 'block';

            // Show specific inspectors
            const tableSect = document.getElementById('table-inspector-section');
            const shapeSect = document.getElementById('shape-inspector-section');
            const iconSect = document.getElementById('icon-inspector-section');
            
            if (tableSect) tableSect.style.display = (data.isTable && !data.isGroup) ? 'block' : 'none';
            if (shapeSect) shapeSect.style.display = (data.isShape && !data.isGroup) ? 'block' : 'none';
            if (iconSect) iconSect.style.display = (data.isIcon && !data.isGroup) ? 'block' : 'none';

            // Hide text editor for groups
            const textSect = document.getElementById('text-editor-section');
            if (textSect && data.isGroup) textSect.style.display = 'none';

            // UI Sync with current styles
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
                
                syncColor('table-header-color', 'table-header-wrapper', s.tableHeader, false);
                syncColor('table-header-text-color', '', s.tableHeaderText, false);
                syncColor('table-bg-color', 'table-bg-wrapper', s.bg, s.isBgTransparent);
                syncColor('table-border-color', 'table-border-wrapper', s.border, s.isBorderTransparent);
                syncColor('table-text-color', '', s.text, false);

                syncColor('icon-border-color', 'icon-border-wrapper', s.border, s.isBorderTransparent);

                // Sync Other Inputs
                const fontSizeInput = document.getElementById(data.isTable ? 'table-font-size' : 'shape-font-size');
                if (fontSizeInput) {
                    fontSizeInput.value = data.currentStyles.fontSize;
                    const txt = document.getElementById('txt-' + fontSizeInput.id);
                    if (txt) txt.innerText = data.currentStyles.fontSize;
                }
            }
        } 
        else if (data.type === 'LF_DESELECT' || data.type === 'LF_COMP_DESELECTED') {
            const actions = document.getElementById('comp-actions-section');
            const tableSect = document.getElementById('table-inspector-section');
            const shapeSect = document.getElementById('shape-inspector-section');
            const iconSect = document.getElementById('icon-inspector-section');
            
            if (actions) actions.style.display = 'none';
            if (tableSect) tableSect.style.display = 'none';
            if (shapeSect) shapeSect.style.display = 'none';
            if (iconSect) iconSect.style.display = 'none';
        }
        else if (data.type === 'LF_DIRTY') {
            if (typeof window.markAsDirty === 'function') {
                window.markAsDirty();
            }
        }
    });

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
