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

        const item = (lib.atoms || []).find(i => i.id === id) || 
                     (lib.molecules || []).find(i => i.id === id) || 
                     (lib.organisms || []).find(i => i.id === id);

        if (!item) return console.error("[V4] Component not found:", id);

        const style = {};
        if (item.category === 'Shapes') {
            style.width = item.id === 'v4-shape-rect' ? '240px' : (item.id === 'v4-shape-circle' ? '180px' : '200px');
            style.height = item.id === 'v4-shape-rect' ? '140px' : (item.id === 'v4-shape-circle' ? '180px' : '180px');
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
            el.oninput = function() {
                const data = typeof message === 'function' ? message(this.value) : { ...message, style: { [message.prop]: this.value } };
                notifyIframe(data);
                if (document.getElementById('txt-' + inputId)) {
                    document.getElementById('txt-' + inputId).innerText = this.value;
                }
            };
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
            
            if (tableSect) tableSect.style.display = data.isTable ? 'block' : 'none';
            if (shapeSect) shapeSect.style.display = data.isShape ? 'block' : 'none';
        } 
        else if (data.type === 'LF_DESELECT' || data.type === 'LF_COMP_DESELECTED') {
            const actions = document.getElementById('comp-actions-section');
            const tableSect = document.getElementById('table-inspector-section');
            const shapeSect = document.getElementById('shape-inspector-section');
            
            if (actions) actions.style.display = 'none';
            if (tableSect) tableSect.style.display = 'none';
            if (shapeSect) shapeSect.style.display = 'none';
        }
        else if (data.type === 'LF_DIRTY') {
            // Use global markAsDirty from vctrl_v3.js
            if (typeof window.markAsDirty === 'function') {
                window.markAsDirty();
            } else {
                console.log("[V4 Addon] Manual dirty mark (markAsDirty not global)");
            }
        }
    });

    // 5. Global Cleanup
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
