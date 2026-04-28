/**
 * vctrl_v4_iframe.js
 * Handle component interaction (drag, resize, select) INSIDE the iframe.
 * Optimized for 'file://' protocol security constraints.
 */

(function() {
    let isDragging = false;
    let isResizing = false;
    let activeEl = null;
    let startX, startY, startW, startH, startTop, startLeft;

    function notifyParent(data) {
        window.parent.postMessage(data, '*');
    }

    function markDirty() {
        notifyParent({ type: 'LF_DIRTY' });
    }

    function init() {
        document.addEventListener('mousedown', e => {
            const handle = e.target.closest('.lf-drag-handle');
            const resizer = e.target.closest('.lf-resizer');
            const deleteBtn = e.target.closest('.lf-delete-trigger');
            const comp = e.target.closest('.lf-component');

            if (deleteBtn && comp) {
                comp.remove();
                markDirty();
                return;
            }

            if (comp) {
                // Deselect others
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                comp.classList.add('selected');
                
                // Notify parent
                notifyParent({ 
                    type: 'LF_COMP_SELECTED', 
                    id: comp.id,
                    isTable: !!comp.querySelector('table'),
                    isShape: comp.querySelector('.v4-shape') !== null
                });
            } else {
                // Deselect all internal components
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                notifyParent({ type: 'LF_DESELECT' });
            }

            if (handle) {
                isDragging = true;
                activeEl = handle.parentElement;
                startX = e.clientX; startY = e.clientY;
                startTop = parseInt(activeEl.style.top) || 0;
                startLeft = parseInt(activeEl.style.left) || 0;
                e.preventDefault();
            } else if (resizer) {
                isResizing = true;
                activeEl = resizer.parentElement;
                startX = e.clientX; startY = e.clientY;
                startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', e => {
            if (isDragging && activeEl) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                activeEl.style.top = (startTop + dy) + 'px';
                activeEl.style.left = (startLeft + dx) + 'px';
                markDirty();
            } else if (isResizing && activeEl) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                activeEl.style.width = (startW + dx) + 'px';
                activeEl.style.height = (startH + dy) + 'px';
                markDirty();
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
            activeEl = null;
        });

        // Handle text editing changes
        document.addEventListener('input', e => {
            if (e.target.classList.contains('v4-editable-cell')) {
                markDirty();
            }
        });

        // Safe Message Listeners (Bypass file:// security)
        window.addEventListener('message', e => {
            const data = e.data;
            if (!data) return;

            // 1. Save Request
            if (data.type === 'LF_REQUEST_SAVE_CONTENT') {
                const clone = document.documentElement.cloneNode(true);
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
                const html = "<!DOCTYPE html>\n" + clone.outerHTML;
                notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: html });
            }

            // 2. Component Insertion Request
            else if (data.type === 'LF_INSERT_COMPONENT') {
                const div = document.createElement('div');
                div.id = data.id || ('v4-comp-' + Date.now());
                div.className = 'lf-component';
                div.style.position = 'absolute';
                div.style.top = '100px';
                div.style.left = '100px';
                div.style.zIndex = '1000';
                if (data.style) Object.assign(div.style, data.style);
                
                div.innerHTML = `
                    <div class="lf-drag-handle">
                        <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
                    </div>
                    ${data.html}
                    <div class="lf-resizer"></div>
                    <div class="lf-delete-trigger">×</div>
                `;
                document.body.appendChild(div);
                
                // Select new component
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
                div.classList.add('selected');
                
                notifyParent({ 
                    type: 'LF_COMP_SELECTED', 
                    id: div.id, 
                    isTable: !!div.querySelector('table'), 
                    isShape: !!div.querySelector('.v4-shape') 
                });
                markDirty();
            }

            // 3. Style Update Request
            else if (data.type === 'LF_UPDATE_STYLE') {
                const selected = document.querySelector('.lf-component.selected');
                if (!selected) return;
                
                const target = data.selector ? selected.querySelector(data.selector) : selected;
                if (!target) return;

                if (data.style) {
                    Object.assign(target.style, data.style);
                }
                if (data.subSelector && data.subStyle) {
                    target.querySelectorAll(data.subSelector).forEach(el => Object.assign(el.style, data.subStyle));
                }
                markDirty();
            }

            // 4. Table Action Request
            else if (data.type === 'LF_TABLE_ACTION') {
                const selected = document.querySelector('.lf-component.selected table');
                if (!selected) return;
                
                if (data.action === 'ADD_ROW') {
                    const tbody = selected.querySelector('tbody') || selected;
                    const lastRow = selected.querySelector('tr:last-child');
                    if (lastRow) {
                        const newRow = lastRow.cloneNode(true);
                        newRow.querySelectorAll('td, th').forEach(c => {
                            c.innerText = "-";
                            if (data.fontSize) c.style.fontSize = data.fontSize + 'px';
                        });
                        tbody.appendChild(newRow);
                    }
                } else if (data.action === 'DEL_ROW') {
                    const rows = selected.querySelectorAll('tr');
                    if (rows.length > 1) rows[rows.length - 1].remove();
                } else if (data.action === 'ADD_COL') {
                    selected.querySelectorAll('tr').forEach(tr => {
                        const lastCell = tr.querySelector('td:last-child') || tr.querySelector('th:last-child');
                        if (lastCell) {
                            const newCell = lastCell.cloneNode(true);
                            newCell.innerText = "-";
                            tr.appendChild(newCell);
                        }
                    });
                } else if (data.action === 'DEL_COL') {
                    selected.querySelectorAll('tr').forEach(tr => {
                        const cells = tr.querySelectorAll('td, th');
                        if (cells.length > 1) cells[cells.length - 1].remove();
                    });
                } else if (data.action === 'LAYOUT_H' || data.action === 'LAYOUT_V') {
                    const isHorizontal = !!selected.querySelector('thead');
                    if ((data.action === 'LAYOUT_H' && isHorizontal) || (data.action === 'LAYOUT_V' && !isHorizontal)) return;
                    
                    let matrix = [];
                    selected.querySelectorAll('tr').forEach((tr, r) => {
                        tr.querySelectorAll('th, td').forEach((cell, c) => {
                            if (!matrix[c]) matrix[c] = [];
                            matrix[c][r] = cell.innerHTML;
                        });
                    });
                    
                    selected.innerHTML = '';
                    if (data.action === 'LAYOUT_H') {
                        let thead = document.createElement('thead');
                        let tbody = document.createElement('tbody');
                        matrix.forEach((row, r) => {
                            let tr = document.createElement('tr');
                            row.forEach(html => {
                                let cell = document.createElement(r === 0 ? 'th' : 'td');
                                cell.className = 'v4-editable-cell';
                                cell.setAttribute('contenteditable', 'true');
                                cell.innerHTML = html;
                                tr.appendChild(cell);
                            });
                            (r === 0 ? thead : tbody).appendChild(tr);
                        });
                        selected.appendChild(thead);
                        selected.appendChild(tbody);
                    } else {
                        let tbody = document.createElement('tbody');
                        matrix.forEach(row => {
                            let tr = document.createElement('tr');
                            row.forEach((html, c) => {
                                let cell = document.createElement(c === 0 ? 'th' : 'td');
                                cell.className = 'v4-editable-cell';
                                cell.setAttribute('contenteditable', 'true');
                                cell.innerHTML = html;
                                tr.appendChild(cell);
                            });
                            tbody.appendChild(tr);
                        });
                        selected.appendChild(tbody);
                    }
                }
                markDirty();
            }

            // 5. Delete Selected Component
            else if (data.type === 'LF_DELETE_SELECTED') {
                const selected = document.querySelector('.lf-component.selected');
                if (selected) {
                    selected.remove();
                    markDirty();
                }
            }

            // 6. Cleanup Request
            else if (data.type === 'LF_DESELECT_ALL') {
                document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            }
        });
    }

    init();
})();
