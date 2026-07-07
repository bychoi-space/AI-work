window.v4TableScript = `
(function() {
    // Table Selection Engine
    const TableSelection = {
        isDragging: false,
        isDraggingCandidate: false,
        startRow: -1,
        startCol: -1,
        activeTable: null,

        bindEvents(table) {
            if (table.dataset.tableSelectionBound) return;
            table.dataset.tableSelectionBound = "true";

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
                this.startRow = cell.parentElement.rowIndex;
                this.startCol = cell.cellIndex;

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

                if (this.isDraggingCandidate && this.activeTable === table) {
                    const currentRow = cell.parentElement.rowIndex;
                    const currentCol = cell.cellIndex;
                    if (currentRow !== this.startRow || currentCol !== this.startCol) {
                        if (document.activeElement && document.activeElement.isContentEditable) {
                            document.activeElement.blur();
                        }
                        this.isDragging = true;
                        this.isDraggingCandidate = false;
                        window.getSelection()?.removeAllRanges();
                        TableSelection.clearSelection(table);
                        const startCell = table.rows[this.startRow]?.cells[this.startCol];
                        if (startCell) startCell.classList.add('selected-cell');
                    }
                }

                if (!this.isDragging || this.activeTable !== table) return;

                const currentRow = cell.parentElement.rowIndex;
                const currentCol = cell.cellIndex;

                const minRow = Math.min(this.startRow, currentRow);
                const maxRow = Math.max(this.startRow, currentRow);
                const minCol = Math.min(this.startCol, currentCol);
                const maxCol = Math.max(this.startCol, currentCol);

                Array.from(table.rows).forEach((row, rIdx) => {
                    Array.from(row.cells).forEach((colCell, cIdx) => {
                        const inRange = rIdx >= minRow && rIdx <= maxRow && cIdx >= minCol && cIdx <= maxCol;
                        if (inRange) {
                            colCell.classList.add('selected-cell');
                        } else {
                            colCell.classList.remove('selected-cell');
                        }
                    });
                });
                this.notifySelectionChanged();
            }, true);
        },

        clearSelection(table) {
            const targetTable = table || document;
            targetTable.querySelectorAll('.selected-cell').forEach(c => {
                c.classList.remove('selected-cell');
            });
            this.notifySelectionChanged();
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

    // Table Style & Dimension Modifier
    const TableManager = {
        updateSelectedCellsStyle(style) {
            const selected = document.querySelectorAll('.selected-cell');
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
                });
            });

            if (window.markDirty) window.markDirty();
            TableSelection.notifySelectionChanged();
        },

        updateSelectedColumnWidth(width) {
            const selected = document.querySelectorAll('.selected-cell');
            if (selected.length === 0) return;
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const tables = new Set();
            const colIndicesByTable = new Map();

            selected.forEach(cell => {
                const table = cell.closest('table');
                if (!table) return;
                tables.add(table);

                if (!colIndicesByTable.has(table)) {
                    colIndicesByTable.set(table, new Set());
                }
                colIndicesByTable.get(table).add(cell.cellIndex);
            });

            tables.forEach(table => {
                const cols = colIndicesByTable.get(table);
                Array.from(table.rows).forEach(row => {
                    cols.forEach(colIndex => {
                        const cell = row.cells[colIndex];
                        if (cell) {
                            cell.style.setProperty('width', width + 'px', 'important');
                        }
                    });
                });
            });

            if (window.markDirty) window.markDirty();
            TableSelection.notifySelectionChanged();
        },

        updateSelectedRowHeight(height) {
            const selected = document.querySelectorAll('.selected-cell');
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
            });

            if (window.markDirty) window.markDirty();
            TableSelection.notifySelectionChanged();
        }
    };

    // Export to window
    window.TableSelection = TableSelection;
    window.TableManager = TableManager;
})();
`;
