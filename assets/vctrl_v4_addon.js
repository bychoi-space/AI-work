/**
 * vctrl_v4_addon.js
 * Bridges V4 Table & Shape editing into the main viewer system.
 */

(function() {
    console.log("%c [V4 ADDON LOADED] ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    const iframe = document.getElementById('main-iframe');
    
    // Inject V4 CSS into the iframe whenever it loads
    iframe.addEventListener('load', () => {
        injectV4Dependencies();
    });

    function injectV4Dependencies() {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) return;

        // Calculate root path relative to the viewer.html
        // For file:// protocol, we use the current location's base path
        const viewerPath = window.location.pathname;
        const rootPath = viewerPath.substring(0, viewerPath.lastIndexOf('/') + 1);

        // 1. Add V4 styles to iframe
        if (!doc.getElementById('v4-style-block')) {
            const link = doc.createElement('link');
            link.id = 'v4-style-block';
            link.rel = 'stylesheet';
            link.href = rootPath + 'enhanced_v4/style_v4.css';
            doc.head.appendChild(link);
        }

        // 2. Add Core Interaction Script to iframe
        if (!doc.getElementById('v4-core-script')) {
            const script = doc.createElement('script');
            script.id = 'v4-core-script';
            script.src = rootPath + 'assets/vctrl_v4_iframe.js'; 
            doc.body.appendChild(script);
        }
    }

    // Insert V4 Component
    window.insertV4ComponentById = function(id) {
        const lib = window.V4_COMPONENT_LIBRARY;
        if (!lib) {
            console.error("[V4] Component Library not found.");
            return;
        }

        const item = (lib.atoms || []).find(i => i.id === id) || 
                     (lib.molecules || []).find(i => i.id === id) || 
                     (lib.organisms || []).find(i => i.id === id);

        if (!item) {
            console.error("[V4] Component not found in library:", id);
            return;
        }
        insertV4Component(item);
    };

    function insertV4Component(item) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const comp = iframeDoc.createElement('div');
        const id = 'v4-comp-' + Date.now();
        comp.id = id;
        comp.className = 'lf-component';
        comp.style.position = 'absolute';
        comp.style.top = '100px';
        comp.style.left = '100px';
        comp.style.zIndex = '1000';

        // Set initial size for shapes
        if (item.category === 'Shapes') {
            comp.style.width = item.id === 'v4-shape-rect' ? '240px' : (item.id === 'v4-shape-circle' ? '180px' : '200px');
            comp.style.height = item.id === 'v4-shape-rect' ? '140px' : (item.id === 'v4-shape-circle' ? '180px' : '180px');
        }

        comp.innerHTML = `
            <div class="lf-drag-handle">
                <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
            </div>
            ${item.html}
            <div class="lf-resizer"></div>
            <div class="lf-delete-trigger">×</div>
        `;

        iframeDoc.body.appendChild(comp);
        
        // Auto-apply defaults
        const table = comp.querySelector('table');
        const shape = comp.querySelector('.v4-shape');
        if (table) {
            table.style.background = document.getElementById('table-bg-color').value;
            table.style.color = document.getElementById('table-text-color').value;
            table.style.borderColor = document.getElementById('table-border-color').value;
            table.querySelectorAll('th').forEach(th => {
                th.style.background = document.getElementById('table-header-color').value;
                th.style.color = document.getElementById('table-header-text-color').value;
            });
        } else if (shape) {
            shape.style.background = document.getElementById('shape-bg-color').value;
            shape.style.borderColor = document.getElementById('shape-border-color').value;
            const editCell = shape.querySelector('.v4-editable-cell');
            if (editCell) {
                editCell.style.color = document.getElementById('shape-text-color').value;
                editCell.style.fontSize = document.getElementById('shape-font-size').value + 'px';
            }
        }

        // Selection Logic
        iframeDoc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
        comp.classList.add('selected');

        // Post message to parent (self) to activate inspector
        window.postMessage({ 
            type: 'LF_COMP_SELECTED', 
            id: id,
            isTable: !!table,
            isShape: !!shape
        }, '*');

        if (window.markAsDirty) window.markAsDirty();
    }

    // Event Handling (Delegation)
    window.addEventListener('message', e => {
        const data = e.data;
        const tableInspector = document.getElementById('table-inspector-section');
        const shapeInspector = document.getElementById('shape-inspector-section');
        const textInspector = document.getElementById('text-editor-section');

        if (data.type === 'LF_COMP_SELECTED') {
            if (data.isTable) {
                tableInspector.style.display = 'block';
                shapeInspector.style.display = 'none';
                textInspector.style.display = 'none';
            } else if (data.isShape) {
                shapeInspector.style.display = 'block';
                tableInspector.style.display = 'none';
                textInspector.style.display = 'none';
            }
        } else if (data.type === 'LF_DESELECT') {
            if (tableInspector) tableInspector.style.display = 'none';
            if (shapeInspector) shapeInspector.style.display = 'none';
            if (textInspector) textInspector.style.display = 'none';
        } else if (data.type === 'LF_DIRTY') {
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    // Inspector Control Bindings
    // (We use a simplified version of the bindings from vctrl_v4.js)
    
    // Table Bindings
    const bindInput = (id, callback) => {
        const el = document.getElementById(id);
        if (el) el.oninput = callback;
    };

    bindInput('table-font-size', function() {
        const val = this.value;
        document.getElementById('txt-font-size').innerText = val;
        const selected = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (selected) {
            selected.querySelectorAll('td, th').forEach(c => c.style.fontSize = val + 'px');
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    bindInput('table-bg-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (selected) {
            selected.style.background = this.value;
            if (window.markAsDirty) window.markAsDirty();
        }
    });
    
    // ... Repeat for other table controls ...
    bindInput('table-text-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (selected) {
            selected.style.color = this.value;
            selected.querySelectorAll('td').forEach(td => td.style.color = this.value);
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    bindInput('table-header-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (selected) {
            selected.querySelectorAll('th').forEach(th => th.style.background = this.value);
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    bindInput('table-header-text-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (selected) {
            selected.querySelectorAll('th').forEach(th => th.style.color = this.value);
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    bindInput('table-border-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (selected) {
            selected.style.borderColor = this.value;
            selected.querySelectorAll('td, th').forEach(c => c.style.borderColor = this.value);
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    // Shape Bindings
    bindInput('shape-font-size', function() {
        document.getElementById('txt-shape-font-size').innerText = this.value;
        const selected = iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
        if (selected) {
            const editCell = selected.querySelector('.v4-editable-cell');
            if (editCell) editCell.style.fontSize = this.value + 'px';
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    bindInput('shape-bg-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
        if (selected) {
            selected.style.background = this.value;
            if (selected.classList.contains('v4-shape-triangle')) selected.style.backgroundColor = this.value;
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    bindInput('shape-text-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
        if (selected) {
            const editCell = selected.querySelector('.v4-editable-cell');
            if (editCell) editCell.style.color = this.value;
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    bindInput('shape-border-color', function() {
        const selected = iframe.contentDocument.querySelector('.lf-component.selected .v4-shape');
        if (selected) {
            selected.style.borderColor = this.value;
            if (window.markAsDirty) window.markAsDirty();
        }
    });

    // Table Actions
    const handleAction = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };

    handleAction('btn-add-row', () => {
        const table = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (!table) return;
        const tbody = table.querySelector('tbody') || table;
        const lastRow = tbody.querySelector('tr:last-child') || table.querySelector('tr:last-child');
        if (!lastRow) return;
        const newRow = lastRow.cloneNode(true);
        newRow.querySelectorAll('td, th').forEach(c => {
            c.innerText = "-";
            c.style.fontSize = document.getElementById('table-font-size').value + 'px';
        });
        tbody.appendChild(newRow);
        if (window.markAsDirty) window.markAsDirty();
    });

    handleAction('btn-del-row', () => {
        const table = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (!table) return;
        const rows = table.querySelectorAll('tr');
        if (rows.length > 1) rows[rows.length - 1].remove();
        if (window.markAsDirty) window.markAsDirty();
    });

    handleAction('btn-add-col', () => {
        const table = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (!table) return;
        table.querySelectorAll('tr').forEach(tr => {
            const lastCell = tr.querySelector('td:last-child') || tr.querySelector('th:last-child');
            if (lastCell) {
                const newCell = lastCell.cloneNode(true);
                newCell.innerText = "-";
                tr.appendChild(newCell);
            }
        });
        if (window.markAsDirty) window.markAsDirty();
    });

    handleAction('btn-del-col', () => {
        const table = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (!table) return;
        table.querySelectorAll('tr').forEach(tr => {
            const cells = tr.querySelectorAll('td, th');
            if (cells.length > 1) cells[cells.length - 1].remove();
        });
        if (window.markAsDirty) window.markAsDirty();
    });

    handleAction('btn-toggle-header-mode', () => {
        const table = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (!table) return;
        const isVertical = table.classList.toggle('header-vertical');
        
        if (isVertical) {
            // Convert top headers to td
            table.querySelectorAll('thead th').forEach(th => {
                const td = document.createElement('td');
                td.className = "v4-editable-cell";
                td.contentEditable = "true";
                td.innerHTML = th.innerHTML;
                th.parentElement.replaceChild(td, th);
            });
            // Convert first column to th
            table.querySelectorAll('tr').forEach(tr => {
                const firstTd = tr.querySelector('td');
                if (firstTd) {
                    const th = document.createElement('th');
                    th.className = "v4-editable-cell";
                    th.contentEditable = "true";
                    th.innerHTML = firstTd.innerHTML;
                    th.style.background = document.getElementById('table-header-color').value;
                    th.style.color = document.getElementById('table-header-text-color').value;
                    tr.replaceChild(th, firstTd);
                }
            });
        } else {
            // Revert logic (simplified)
            table.querySelectorAll('th').forEach(th => {
                const td = document.createElement('td');
                td.className = "v4-editable-cell";
                td.contentEditable = "true";
                td.innerHTML = th.innerHTML;
                th.parentElement.replaceChild(td, th);
            });
            // Try to restore thead
            const firstRow = table.querySelector('tr');
            if (firstRow) {
                firstRow.querySelectorAll('td').forEach(td => {
                    const th = document.createElement('th');
                    th.className = "v4-editable-cell";
                    th.contentEditable = "true";
                    th.innerHTML = td.innerHTML;
                    th.style.background = document.getElementById('table-header-color').value;
                    th.style.color = document.getElementById('table-header-text-color').value;
                    td.parentElement.replaceChild(th, td);
                });
            }
        }
        if (window.markAsDirty) window.markAsDirty();
    });

    handleAction('btn-clear-header', () => {
        const table = iframe.contentDocument.querySelector('.lf-component.selected table');
        if (!table) return;
        table.querySelectorAll('th').forEach(th => {
            const td = document.createElement('td');
            td.className = "v4-editable-cell";
            td.contentEditable = "true";
            td.innerHTML = th.innerHTML;
            th.parentElement.replaceChild(td, th);
        });
        const thead = table.querySelector('thead');
        if (thead) thead.remove();
        if (window.markAsDirty) window.markAsDirty();
    });

})();
