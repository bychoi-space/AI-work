window.v4TableScript = `
(function() {
    if (!window.notifyParent) {
        window.notifyParent = function(data) {
            if (window.parent) {
                window.parent.postMessage(data, '*');
            }
        };
    }

    // Visual Grid Mapping Helpers
    function getTableGridMap(table) {
        const grid = [];
        for (let r = 0; r < table.rows.length; r++) {
            const row = table.rows[r];
            if (!grid[r]) grid[r] = [];
            let visualCol = 0;
            for (let c = 0; c < row.cells.length; c++) {
                const cell = row.cells[c];
                while (grid[r][visualCol]) {
                    visualCol++;
                }
                const rowspan = parseInt(cell.getAttribute('rowspan')) || 1;
                const colspan = parseInt(cell.getAttribute('colspan')) || 1;
                for (let dr = 0; dr < rowspan; dr++) {
                    for (let dc = 0; dc < colspan; dc++) {
                        const nr = r + dr;
                        const nc = visualCol + dc;
                        if (!grid[nr]) grid[nr] = [];
                        grid[nr][nc] = cell;
                    }
                }
                visualCol += colspan;
            }
        }
        return grid;
    }

    function getCellBounds(table) {
        const grid = getTableGridMap(table);
        const bounds = new Map();
        for (let r = 0; r < grid.length; r++) {
            const row = grid[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
                const cell = row[c];
                if (!cell) continue;
                if (!bounds.has(cell)) {
                    bounds.set(cell, { minRow: r, maxRow: r, minCol: c, maxCol: c });
                } else {
                    const b = bounds.get(cell);
                    b.minRow = Math.min(b.minRow, r);
                    b.maxRow = Math.max(b.maxRow, r);
                    b.minCol = Math.min(b.minCol, c);
                    b.maxCol = Math.max(b.maxCol, c);
                }
            }
        }
        return bounds;
    }

    function createSplitCell(originalCell, text = '-') {
        const isTh = originalCell.tagName.toLowerCase() === 'th';
        const newCell = document.createElement(isTh ? 'th' : 'td');
        
        newCell.className = originalCell.className;
        newCell.style.cssText = originalCell.style.cssText;
        
        newCell.style.removeProperty('width');
        newCell.style.removeProperty('height');
        
        newCell.classList.remove('selected-cell');
        
        const originalEditable = originalCell.querySelector('.v4-editable-cell');
        if (originalEditable) {
            const newEditable = originalEditable.cloneNode(false);
            newEditable.contentEditable = 'true';
            newEditable.innerText = text;
            newCell.appendChild(newEditable);
        } else {
            newCell.contentEditable = originalCell.contentEditable || 'true';
            newCell.innerText = text;
        }
        
        return newCell;
    }

    // Table Selection Engine
    const TableSelection = {
        isDragging: false,
        isDraggingCandidate: false,
        startRow: -1,
        startCol: -1,
        activeTable: null,

        bindEvents(table) {
            if (table._tableSelectionBound) return;
            table._tableSelectionBound = true;
            table.removeAttribute('data-table-selection-bound');

            table.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                const cell = e.target.closest('td, th');
                if (!cell) return;

                // Blur any other active editing cells to prevent dual focus highlight
                const activeCellElement = document.activeElement?.closest('td, th');
                if (activeCellElement && activeCellElement !== cell) {
                    document.activeElement.blur();
                }

                const isEditing = e.target.isContentEditable && document.activeElement === e.target;
                
                this.activeTable = table;

                const bounds = getCellBounds(table);
                const b = bounds.get(cell);
                if (b) {
                    this.startRow = b.minRow;
                    this.startCol = b.minCol;
                } else {
                    this.startRow = cell.parentElement.rowIndex;
                    this.startCol = cell.cellIndex;
                }

                if (isEditing) {
                    this.isDraggingCandidate = true;
                    this.isDragging = false;
                    return; 
                }

                this.isDragging = true;
                this.isDraggingCandidate = false;

                if (!e.shiftKey) {
                    TableSelection.clearSelection(table);
                    cell.classList.add('selected-cell');
                } else {
                    cell.classList.toggle('selected-cell');
                }

                e.preventDefault();
                this.notifySelectionChanged();
            });

            table.addEventListener('mouseenter', (e) => {
                const cell = e.target.closest('td, th');
                if (!cell) return;

                const bounds = getCellBounds(table);
                const b = bounds.get(cell);
                if (!b) return;

                const currentRow = b.minRow;
                const currentCol = b.minCol;

                if (this.isDraggingCandidate && this.activeTable === table) {
                    if (currentRow !== this.startRow || currentCol !== this.startCol) {
                        if (document.activeElement && document.activeElement.isContentEditable) {
                            document.activeElement.blur();
                        }
                        this.isDragging = true;
                        this.isDraggingCandidate = false;
                        window.getSelection()?.removeAllRanges();
                        TableSelection.clearSelection(table);
                        const grid = getTableGridMap(table);
                        const startCell = grid[this.startRow]?.[this.startCol];
                        if (startCell) startCell.classList.add('selected-cell');
                    }
                }

                if (!this.isDragging || this.activeTable !== table) return;

                let minRow = Math.min(this.startRow, b.minRow);
                let maxRow = Math.max(this.startRow, b.maxRow);
                let minCol = Math.min(this.startCol, b.minCol);
                let maxCol = Math.max(this.startCol, b.maxCol);

                const grid = getTableGridMap(table);

                // Recursively expand selection bounds to cover overlapping merged cells
                let changed = true;
                while (changed) {
                    changed = false;
                    for (let r = 0; r < grid.length; r++) {
                        if (!grid[r]) continue;
                        for (let c = 0; c < grid[r].length; c++) {
                            const gridCell = grid[r][c];
                            if (!gridCell) continue;
                            const cellB = bounds.get(gridCell);
                            if (!cellB) continue;
                            const overlaps = !(cellB.maxRow < minRow || cellB.minRow > maxRow || cellB.maxCol < minCol || cellB.minCol > maxCol);
                            if (overlaps) {
                                if (cellB.minRow < minRow) { minRow = cellB.minRow; changed = true; }
                                if (cellB.maxRow > maxRow) { maxRow = cellB.maxRow; changed = true; }
                                if (cellB.minCol < minCol) { minCol = cellB.minCol; changed = true; }
                                if (cellB.maxCol > maxCol) { maxCol = cellB.maxCol; changed = true; }
                            }
                        }
                    }
                }

                // Clear selection silently first
                TableSelection.clearSelection(table, true);

                const selectedSet = new Set();
                for (let r = minRow; r <= maxRow; r++) {
                    if (!grid[r]) continue;
                    for (let c = minCol; c <= maxCol; c++) {
                        const gridCell = grid[r][c];
                        if (gridCell) {
                            selectedSet.add(gridCell);
                        }
                    }
                }
                selectedSet.forEach(gridCell => {
                    gridCell.classList.add('selected-cell');
                });

                this.notifySelectionChanged();
            }, true);
        },

        clearSelection(table, silent = false) {
            const targetTable = table || document;
            targetTable.querySelectorAll('.selected-cell').forEach(c => {
                c.classList.remove('selected-cell');
            });
            if (!silent) {
                this.notifySelectionChanged();
            }
        },

        notifySelectionChanged() {
            const selected = document.querySelectorAll('.selected-cell');
            if (selected.length === 0) {
                if (window.notifyParent) {
                    window.notifyParent({ type: 'LF_CELL_SELECTED', cellData: null });
                }
                return;
            }
            // Get representative cell (first selected)
            const repCell = selected[0];
            const bg = repCell.style.backgroundColor || repCell.style.background || '';
            const color = repCell.style.color || '';
            const align = repCell.style.textAlign || window.getComputedStyle(repCell).textAlign || 'center';
            
            // Measure actual dimensions
            const width = repCell.style.width ? parseInt(repCell.style.width) : repCell.offsetWidth;
            const height = repCell.parentElement.style.height ? parseInt(repCell.parentElement.style.height) : repCell.offsetHeight;

            if (window.notifyParent) {
                window.notifyParent({
                    type: 'LF_CELL_SELECTED',
                    cellData: {
                        count: selected.length,
                        backgroundColor: bg,
                        color: color,
                        textAlign: align,
                        width: width,
                        height: height
                    }
                });
            }
        }
    };

    // Global listener to end dragging
    document.addEventListener('mouseup', () => {
        TableSelection.isDragging = false;
        TableSelection.isDraggingCandidate = false;
        TableSelection.activeTable = null;
    });

    // Clear selection when clicking empty spaces inside canvas
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('table.v4-premium-table') && !e.target.closest('table.v4-table') && !e.target.closest('.v4-grid-container table') && !e.target.closest('.lf-delete-trigger') && !e.target.closest('.lf-drag-handle') && !e.target.closest('.lf-resizer')) {
            TableSelection.clearSelection();
        }
    });

    function getTargetCells() {
        let selected = Array.from(document.querySelectorAll('.selected-cell'));
        if (selected.length > 0) return selected;

        if (document.activeElement) {
            const cell = document.activeElement.closest('td, th');
            if (cell) return [cell];
        }

        const selectedComp = document.querySelector('.lf-component.selected');
        if (selectedComp) {
            const table = selectedComp.querySelector('table');
            if (table) {
                const cells = Array.from(table.querySelectorAll('td, th'));
                if (cells.length > 0) return cells;
            }
        }

        const anyTable = document.querySelector('.lf-component table, table');
        if (anyTable) {
            return Array.from(anyTable.querySelectorAll('td, th'));
        }

        return [];
    }

    // Table Style & Dimension Modifier
    const TableManager = {
        updateSelectedCellsStyle(style) {
            const selected = getTargetCells();
            if (selected.length === 0) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            selected.forEach(cell => {
                const nestedEditable = cell.querySelector('.v4-editable-cell, [contenteditable="true"]');
                const targets = nestedEditable ? [cell, nestedEditable] : [cell];

                targets.forEach(target => {
                    if (style.backgroundColor !== undefined) {
                        if (style.backgroundColor === 'none' || style.backgroundColor === 'transparent' || style.backgroundColor === '') {
                            target.style.setProperty('background-color', 'transparent', 'important');
                            target.style.setProperty('background', 'transparent', 'important');
                        } else {
                            target.style.setProperty('background-color', style.backgroundColor, 'important');
                            target.style.setProperty('background', style.backgroundColor, 'important');
                        }
                    }
                    if (style.color !== undefined) {
                        target.style.setProperty('color', style.color, 'important');
                    }
                    if (style.textAlign !== undefined) {
                        target.style.setProperty('text-align', style.textAlign, 'important');
                        target.querySelectorAll('p, span, div, .v4-shape-text-content').forEach(child => {
                            child.style.setProperty('text-align', style.textAlign, 'important');
                        });
                    }
                });
            });

            if (window.markDirty) window.markDirty();
            if (window.TableSelection && typeof window.TableSelection.notifySelectionChanged === 'function') {
                window.TableSelection.notifySelectionChanged();
            }
        },

        updateSelectedColumnWidth(width) {
            const selected = getTargetCells();
            if (selected.length === 0) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const tables = new Set();
            const colIndicesByTable = new Map();

            selected.forEach(cell => {
                const table = cell.closest('table');
                if (!table) return;
                tables.add(table);

                const bounds = getCellBounds(table);
                const b = bounds.get(cell);
                if (b) {
                    if (!colIndicesByTable.has(table)) {
                        colIndicesByTable.set(table, new Set());
                    }
                    for (let c = b.minCol; c <= b.maxCol; c++) {
                        colIndicesByTable.get(table).add(c);
                    }
                }
            });

            tables.forEach(table => {
                const cols = colIndicesByTable.get(table);
                if (!cols || cols.size === 0) return;
                
                const colgroup = table.querySelector('colgroup');
                if (colgroup) {
                    const colElements = colgroup.querySelectorAll('col');
                    cols.forEach(colIndex => {
                        if (colElements[colIndex]) {
                            colElements[colIndex].style.setProperty('width', width + 'px', 'important');
                            colElements[colIndex].setAttribute('width', width);
                        }
                    });
                }

                const bounds = getCellBounds(table);
                bounds.forEach((b, cell) => {
                    const colSpan = parseInt(cell.getAttribute('colspan')) || 1;
                    if (cols.has(b.minCol)) {
                        if (colSpan === 1) {
                            cell.style.setProperty('width', width + 'px', 'important');
                            cell.style.setProperty('min-width', width + 'px', 'important');
                            cell.style.setProperty('max-width', width + 'px', 'important');
                        }
                    }
                });
            });

            if (window.markDirty) window.markDirty();
            if (typeof window.syncTableComponentSize === 'function') {
                window.syncTableComponentSize();
            }
            if (window.TableSelection && typeof window.TableSelection.notifySelectionChanged === 'function') {
                window.TableSelection.notifySelectionChanged();
            }
        },

        updateSelectedRowHeight(height) {
            const selected = getTargetCells();
            if (selected.length === 0) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const rows = new Set();
            selected.forEach(cell => {
                const row = cell.parentElement;
                if (row && row.tagName === 'TR') {
                    rows.add(row);
                }
            });

            rows.forEach(row => {
                row.style.setProperty('height', height + 'px', 'important');
                row.style.setProperty('min-height', height + 'px', 'important');
                Array.from(row.cells).forEach(cell => {
                    cell.style.removeProperty('height');
                    cell.style.setProperty('height', height + 'px', 'important');
                    cell.style.setProperty('min-height', height + 'px', 'important');
                });
            });

            if (window.markDirty) window.markDirty();
            if (typeof window.syncTableComponentSize === 'function') {
                window.syncTableComponentSize();
            }
            if (window.TableSelection && typeof window.TableSelection.notifySelectionChanged === 'function') {
                window.TableSelection.notifySelectionChanged();
            }
        },

        updateSelectedCellsBorder(borderType, color) {
            const selected = document.querySelectorAll('.selected-cell');
            if (selected.length === 0) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            selected.forEach(cell => {
                const borderVal = borderType === 'none' ? '1.6px solid transparent' : '1.6px solid ' + color;
                
                if (borderType === 'top' || borderType === 'all' || borderType === 'none') {
                    cell.style.setProperty('border-top', borderVal, 'important');
                }
                if (borderType === 'bottom' || borderType === 'all' || borderType === 'none') {
                    cell.style.setProperty('border-bottom', borderVal, 'important');
                }
                if (borderType === 'left' || borderType === 'all' || borderType === 'none') {
                    cell.style.setProperty('border-left', borderVal, 'important');
                }
                if (borderType === 'right' || borderType === 'all' || borderType === 'none') {
                    cell.style.setProperty('border-right', borderVal, 'important');
                }
            });

            if (window.markDirty) window.markDirty();
            TableSelection.notifySelectionChanged();
        },

        mergeSelectedCells(table) {
            const selected = table.querySelectorAll('.selected-cell');
            if (selected.length < 2) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            const grid = getTableGridMap(table);
            const bounds = getCellBounds(table);
            
            let minRow = Infinity, maxRow = -Infinity;
            let minCol = Infinity, maxCol = -Infinity;
            
            selected.forEach(cell => {
                const b = bounds.get(cell);
                if (b) {
                    minRow = Math.min(minRow, b.minRow);
                    maxRow = Math.max(maxRow, b.maxRow);
                    minCol = Math.min(minCol, b.minCol);
                    maxCol = Math.max(maxCol, b.maxCol);
                }
            });
            
            const targetCell = grid[minRow]?.[minCol];
            if (!targetCell) return;
            
            let combinedText = targetCell.innerText || '';
            const seen = new Set([targetCell]);
            
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    const cell = grid[r]?.[c];
                    if (cell && !seen.has(cell)) {
                        seen.add(cell);
                        const txt = cell.innerText || '';
                        if (txt.trim() && txt.trim() !== '-') {
                            combinedText += (combinedText ? ' ' : '') + txt.trim();
                        }
                        cell.remove();
                    }
                }
            }
            
            const editable = targetCell.querySelector('.v4-editable-cell') || targetCell;
            if (editable) {
                editable.innerText = combinedText.trim() || '-';
            }
            
            const rowSpan = maxRow - minRow + 1;
            const colSpan = maxCol - minCol + 1;
            
            if (rowSpan > 1) {
                targetCell.setAttribute('rowspan', rowSpan);
            } else {
                targetCell.removeAttribute('rowspan');
            }
            
            if (colSpan > 1) {
                targetCell.setAttribute('colspan', colSpan);
            } else {
                targetCell.removeAttribute('colspan');
            }
            
            TableSelection.clearSelection(table);
            targetCell.classList.add('selected-cell');
            
            if (window.markDirty) window.markDirty();
            TableSelection.notifySelectionChanged();
        },

        splitSelectedCells(table) {
            const selected = table.querySelectorAll('.selected-cell');
            if (selected.length === 0) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            let splittedAny = false;
            const grid = getTableGridMap(table);
            const bounds = getCellBounds(table);
            
            selected.forEach(cell => {
                const rowSpan = parseInt(cell.getAttribute('rowspan')) || 1;
                const colSpan = parseInt(cell.getAttribute('colspan')) || 1;
                
                if (rowSpan > 1 || colSpan > 1) {
                    splittedAny = true;
                    const b = bounds.get(cell);
                    if (!b) return;
                    
                    cell.removeAttribute('rowspan');
                    cell.removeAttribute('colspan');
                    
                    for (let r = b.minRow; r <= b.maxRow; r++) {
                        const row = table.rows[r];
                        if (!row) continue;
                        
                        for (let c = b.minCol; c <= b.maxCol; c++) {
                            if (r === b.minRow && c === b.minCol) {
                                continue;
                            }
                            
                            const newCell = createSplitCell(cell, '-');
                            
                            let inserted = false;
                            for (let nc = c + 1; nc < grid[r].length; nc++) {
                                const nextCell = grid[r][nc];
                                if (nextCell && nextCell !== cell && nextCell.parentElement === row) {
                                    row.insertBefore(newCell, nextCell);
                                    inserted = true;
                                    break;
                                }
                            }
                            if (!inserted) {
                                row.appendChild(newCell);
                            }
                        }
                    }
                }
            });
            
            if (splittedAny) {
                if (window.markDirty) window.markDirty();
                TableSelection.clearSelection(table);
                selected.forEach(c => c.classList.add('selected-cell'));
                TableSelection.notifySelectionChanged();
            }
        },

        getTableGridMap: getTableGridMap,
        getCellBounds: getCellBounds,

        getCellVisualColumnIndex(table, cell) {
            const bounds = getCellBounds(table);
            const b = bounds.get(cell);
            return b ? b.minCol : cell.cellIndex;
        },

        deleteRow(table, rowIndex) {
            if (rowIndex < 0 || rowIndex >= table.rows.length) return;
            if (table.rows.length <= 1) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            const grid = getTableGridMap(table);
            const bounds = getCellBounds(table);
            const processed = new Set();
            
            const rowToDeconstruct = table.rows[rowIndex];
            
            for (let c = 0; c < grid[rowIndex].length; c++) {
                const cell = grid[rowIndex][c];
                if (!cell || processed.has(cell)) continue;
                processed.add(cell);
                
                const b = bounds.get(cell);
                if (!b) continue;
                
                const rowSpan = parseInt(cell.getAttribute('rowspan')) || 1;
                if (rowSpan === 1) {
                    cell.remove();
                } else {
                    const newRowSpan = rowSpan - 1;
                    if (newRowSpan > 1) {
                        cell.setAttribute('rowspan', newRowSpan);
                    } else {
                        cell.removeAttribute('rowspan');
                    }
                    
                    if (b.minRow === rowIndex) {
                        const nextRow = table.rows[rowIndex + 1];
                        if (nextRow) {
                            let inserted = false;
                            for (let nc = c + 1; nc < grid[rowIndex + 1].length; nc++) {
                                const nextCell = grid[rowIndex + 1][nc];
                                if (nextCell && nextCell.parentElement === nextRow) {
                                    nextRow.insertBefore(cell, nextCell);
                                    inserted = true;
                                    break;
                                }
                            }
                            if (!inserted) {
                                nextRow.appendChild(cell);
                            }
                        }
                    }
                }
            }
            
            rowToDeconstruct.remove();
            
            if (window.markDirty) window.markDirty();
            TableSelection.clearSelection(table);
        },

        deleteColumn(table, colIndex) {
            if (colIndex < 0) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            const grid = getTableGridMap(table);
            const bounds = getCellBounds(table);
            const processed = new Set();
            
            for (let r = 0; r < table.rows.length; r++) {
                const cell = grid[r]?.[colIndex];
                if (!cell || processed.has(cell)) continue;
                processed.add(cell);
                
                const b = bounds.get(cell);
                if (!b) continue;
                
                const colSpan = parseInt(cell.getAttribute('colspan')) || 1;
                if (colSpan === 1) {
                    cell.remove();
                } else {
                    const newColSpan = colSpan - 1;
                    if (newColSpan > 1) {
                        cell.setAttribute('colspan', newColSpan);
                    } else {
                        cell.removeAttribute('colspan');
                    }
                }
            }
            
            if (window.markDirty) window.markDirty();
            TableSelection.clearSelection(table);
        }
    };

    // Export to window
    window.TableSelection = TableSelection;
    window.TableManager = TableManager;
})();
`;

