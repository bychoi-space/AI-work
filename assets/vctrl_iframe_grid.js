/**
 * assets/vctrl_iframe_grid.js
 * Modular rendering engine for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4GridScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4GridScript = `
(function() {
    console.log("[V4 Grid] Module loaded.");
    window.renderGrid = function(container, columns, rowCount, showPagination, rowHeight) {
        if (!container) return;
        
        container.setAttribute('data-columns', JSON.stringify(columns));
        container.setAttribute('data-row-count', rowCount);
        container.setAttribute('data-pagination', showPagination ? 'true' : 'false');
        if (rowHeight !== undefined) {
            container.setAttribute('data-row-height', rowHeight);
        }
        var rowHeightVal = container.getAttribute('data-row-height') || '40px';
        if (/^\d+$/.test(String(rowHeightVal).trim())) {
            rowHeightVal = String(rowHeightVal).trim() + 'px';
        }
        
        var mockList = [
            { no: '1024', name: '[헤지스] 여름 맞이 린넨 셔츠 특가 라이브', status: '방송중', statusColor: '#10b981', statusBg: 'rgba(52,211,153,0.15)', author: '김엘에프', date: '2026-07-01 11:00:00' },
            { no: '1023', name: '[닥스] 프리미엄 실크 타이 단독 런칭 쇼', status: '방송예정', statusColor: '#d97706', statusBg: 'rgba(251,191,36,0.15)', author: '이닥스', date: '2026-06-30 18:30:20' },
            { no: '1022', name: '[라푸마] 아웃도어 바람막이 클리어런스 세일', status: '방송종료', statusColor: '#ef4444', statusBg: 'rgba(239,68,68,0.1)', author: '박라푸마', date: '2026-06-29 14:15:10' },
            { no: '1021', name: '[질스튜어트] 봄 신상 스니커즈 한정 라이브', status: '방송중', statusColor: '#10b981', statusBg: 'rgba(52,211,153,0.15)', author: '최질스', date: '2026-06-28 10:00:00' },
            { no: '1020', name: '[바네사브루노] 가을 컬렉션 룩북 공개 생방송', status: '방송예정', statusColor: '#d97706', statusBg: 'rgba(251,191,36,0.15)', author: '정바네', date: '2026-06-27 16:45:00' }
        ];

        var isMockValue = function(text, type) {
            if (!text) return true;
            var t = text.trim();
            if (type === 'number') {
                return /^\d+$/.test(t);
            }
            if (type === 'status') {
                return t.indexOf('방송중') >= 0 || t.indexOf('방송예정') >= 0 || t.indexOf('방송종료') >= 0;
            }
            if (type === 'author') {
                return ['김엘에프', '이닥스', '박라푸마', '최질스', '정바네'].indexOf(t) >= 0;
            }
            if (type === 'datetime') {
                return t.indexOf('2026-') === 0;
            }
            if (type === 'text') {
                var mocks = [
                    '[헤지스] 여름 맞이 린넨 셔츠 특가 라이브',
                    '[닥스] 프리미엄 실크 타이 단독 런칭 쇼',
                    '[라푸마] 아웃도어 바람막이 클리어런스 세일',
                    '[질스튜어트] 봄 신상 스니커즈 한정 라이브',
                    '[바네사브루노] 가을 컬렉션 룩북 공개 생방송',
                    'New', '새 항목', 'Header', 'Data'
                ];
                return mocks.indexOf(t) >= 0 || t === '';
            }
            return true;
        };

        var table = container.querySelector('table');
        if (table) {
            table.style.setProperty('height', 'auto', 'important');
            var colgroup = table.querySelector('colgroup');
            if (colgroup) {
                colgroup.innerHTML = '';
                columns.forEach(function(col) {
                    var w = col.width || '100px';
                    if (/^\d+$/.test(w.trim()) || /^\d*\.\d+$/.test(w.trim())) {
                        w = w.trim() + 'px';
                    }
                    var colEl = document.createElement('col');
                    colEl.style.width = w;
                    colgroup.appendChild(colEl);
                });
            }
            
            var colgroup = table.querySelector('colgroup');
            if (colgroup) {
                var cols = Array.from(colgroup.querySelectorAll('col'));
                while (cols.length < columns.length) {
                    var newCol = document.createElement('col');
                    colgroup.appendChild(newCol);
                    cols.push(newCol);
                }
                while (cols.length > columns.length) {
                    colgroup.removeChild(cols.pop());
                }
                columns.forEach(function(col, idx) {
                    var w = col.width;
                    if (!w) {
                        w = '100px';
                    } else {
                        w = w.trim();
                        if (/^\d+$/.test(w) || /^\d*\.\d+$/.test(w)) {
                            w = w + 'px';
                        }
                    }
                    cols[idx].style.width = w;
                });
            }

            var thead = table.querySelector('thead');
            if (thead) {
                var headerRow = thead.querySelector('tr');
                if (headerRow) {
                    headerRow.style.setProperty('height', rowHeightVal, 'important');
                    var ths = Array.from(headerRow.querySelectorAll('th'));
                    while (ths.length < columns.length) {
                        var newTh = document.createElement('th');
                        newTh.className = 'v4-grid-cell v4-editable-cell';
                        newTh.contentEditable = 'true';
                        newTh.style.display = 'table-cell';
                        newTh.style.verticalAlign = 'middle';
                        newTh.style.boxSizing = 'border-box';
                        newTh.style.fontSize = '12px';
                        newTh.style.fontWeight = '500';
                        newTh.style.color = '#334155';
                        headerRow.appendChild(newTh);
                        ths.push(newTh);
                    }
                    while (ths.length > columns.length) {
                        headerRow.removeChild(ths.pop());
                    }
                    
                    columns.forEach(function(col, idx) {
                        var th = ths[idx];
                        var bg = th.style.background || th.style.backgroundColor;
                        var color = th.style.color;
                        var fontSize = th.style.fontSize;
                        var fontFamily = th.style.fontFamily;

                        th.style.borderRight = '1.6px solid rgb(226, 232, 240)';
                        th.style.textAlign = col.type === 'checkbox' ? 'center' : 'left';
                        th.style.setProperty('padding', col.type === 'checkbox' ? '0' : '0 8px', 'important');
                        th.style.fontWeight = '500';
                        th.style.color = '#334155';
                        th.style.setProperty('height', rowHeightVal, 'important');

                        if (col.type === 'checkbox') {
                            th.className = 'v4-grid-cell v4-grid-check-col';
                            th.contentEditable = 'false';
                            th.setAttribute('data-type', 'checkbox');
                            th.innerHTML = '<input type="checkbox">';
                        } else {
                            th.className = 'v4-grid-cell v4-editable-cell';
                            th.contentEditable = 'true';
                            th.setAttribute('data-type', col.type);
                            var desiredText = (col.name || '') + ' ⇅';
                            if (th.innerText !== desiredText && th.innerText !== col.name) {
                                th.innerText = desiredText;
                            }
                            if (!th.dataset.eventsBound) {
                                th.dataset.eventsBound = 'true';
                                
                                const selectParentComponent = (e) => {
                                    const comp = th.closest('.lf-component');
                                    if (comp) {
                                        const isMulti = e ? (e.shiftKey || e.ctrlKey || e.metaKey) : false;
                                        if (isMulti) {
                                            comp.classList.toggle('selected');
                                        } else {
                                            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                                            comp.classList.add('selected');
                                        }
                                        if (window.updateHandles) window.updateHandles(comp);
                                        
                                        notifyParent({
                                            type: "LF_COMP_SELECTED",
                                            shiftKey: isMulti,
                                            ...window._getCompStyles(comp)
                                        });
                                    }
                                };

                                th.addEventListener('mousedown', function(e) {
                                    e.stopPropagation();
                                    selectParentComponent(e);
                                });
                                th.addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    selectParentComponent(e);
                                });
                                th.addEventListener('input', function() {
                                    markDirty();
                                    try {
                                        const gridContainer = th.closest('.v4-grid-container');
                                        if (gridContainer) {
                                            const cols = JSON.parse(gridContainer.getAttribute('data-columns') || '[]');
                                            if (cols[idx]) {
                                                cols[idx].name = th.innerText.replace(' ⇅', '').trim();
                                                gridContainer.setAttribute('data-columns', JSON.stringify(cols));
                                            }
                                        }
                                    } catch(err) {}
                                });
                            }
                        }

                        if (bg) th.style.setProperty('background', bg, 'important');
                        if (color) th.style.setProperty('color', color, 'important');
                        if (fontSize) th.style.setProperty('font-size', fontSize, 'important');
                        if (fontFamily) th.style.setProperty('font-family', fontFamily, 'important');
                    });
                }
            }
            
            var tbody = table.querySelector('tbody');
            if (tbody) {
                var rows = Array.from(tbody.querySelectorAll('tr'));
                while (rows.length < rowCount) {
                    var newRow = document.createElement('tr');
                    newRow.style.setProperty('height', rowHeightVal, 'important');
                    newRow.style.background = '#ffffff';
                    newRow.style.boxSizing = 'border-box';
                    tbody.appendChild(newRow);
                    rows.push(newRow);
                }
                while (rows.length > rowCount) {
                    tbody.removeChild(rows.pop());
                }
                
                rows.forEach(function(row, rIdx) {
                    row.style.borderBottom = '1.6px solid rgb(226,232,240)';
                    row.style.setProperty('height', rowHeightVal, 'important');
                    
                    var tds = Array.from(row.querySelectorAll('td'));
                    while (tds.length < columns.length) {
                        var newTd = document.createElement('td');
                        newTd.className = 'v4-grid-cell v4-editable-cell';
                        newTd.contentEditable = 'true';
                        newTd.style.display = 'table-cell';
                        newTd.style.verticalAlign = 'middle';
                        newTd.style.boxSizing = 'border-box';
                        newTd.style.fontSize = '12px';
                        row.appendChild(newTd);
                        tds.push(newTd);
                    }
                    while (tds.length > columns.length) {
                        row.removeChild(tds.pop());
                    }
                    
                    columns.forEach(function(col, cIdx) {
                        var td = tds[cIdx];
                        td.style.borderRight = '1.6px solid rgb(226,232,240)';
                        td.style.setProperty('height', rowHeightVal, 'important');
                        td.style.setProperty('padding', col.type === 'checkbox' ? '0' : '0 8px', 'important');

                        var prevType = td.getAttribute('data-type');
                        if (!prevType && (td.classList.contains('v4-grid-check-col') || td.querySelector('input[type="checkbox"]'))) {
                            prevType = 'checkbox';
                            td.setAttribute('data-type', 'checkbox');
                        }

                        if (col.type !== 'checkbox') {
                            if (!td.dataset.eventsBound) {
                                td.dataset.eventsBound = 'true';
                                
                                const selectParentComponent = (e) => {
                                    const comp = td.closest('.lf-component');
                                    if (comp) {
                                        const isMulti = e ? (e.shiftKey || e.ctrlKey || e.metaKey) : false;
                                        if (isMulti) {
                                            comp.classList.toggle('selected');
                                        } else {
                                            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                                            comp.classList.add('selected');
                                        }
                                        if (window.updateHandles) window.updateHandles(comp);
                                        
                                        notifyParent({
                                            type: "LF_COMP_SELECTED",
                                            shiftKey: isMulti,
                                            ...window._getCompStyles(comp)
                                        });
                                    }
                                };

                                td.addEventListener('mousedown', function(e) {
                                    e.stopPropagation();
                                    selectParentComponent(e);
                                });
                                td.addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    selectParentComponent(e);
                                });
                                td.addEventListener('input', function() {
                                    markDirty();
                                });
                            }
                        }

                        var currentText = td.innerText || '';
                        var shouldOverwrite = (prevType !== col.type) || td.innerHTML === '' || isMockValue(currentText, prevType);

                        if (shouldOverwrite) {
                            var bg = td.style.background || td.style.backgroundColor;
                            var color = td.style.color;
                            var fontSize = td.style.fontSize;
                            var fontFamily = td.style.fontFamily;

                            td.setAttribute('data-type', col.type);
                            if (col.type === 'checkbox') {
                                td.className = 'v4-grid-cell';
                                td.contentEditable = 'false';
                                td.style.textAlign = 'center';
                                td.style.padding = '0';
                                td.innerHTML = '<input type="checkbox">';
                            } else {
                                td.className = 'v4-grid-cell v4-editable-cell';
                                td.contentEditable = 'true';
                                td.style.textAlign = 'left';
                                td.style.padding = '0 8px';
                                
                                td.style.color = '';
                                td.style.fontWeight = '';
                                td.style.fontSize = '';
                                
                                var data = mockList[rIdx % mockList.length];
                                if (col.type === 'number') {
                                    td.innerText = (1024 - rIdx);
                                } else if (col.type === 'status') {
                                    td.innerHTML = '<span style="background:' + data.statusBg + '; color:' + data.statusColor + '; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">' + data.status + '</span>';
                                } else if (col.type === 'author') {
                                    td.innerText = data.author;
                                } else if (col.type === 'datetime') {
                                    td.innerText = data.date;
                                } else {
                                    td.innerText = data.name;
                                }
                            }

                            if (bg) td.style.setProperty('background', bg, 'important');
                            if (col.type === 'status' || col.type === 'checkbox') {
                                if (color) td.style.setProperty('color', color, 'important');
                                if (fontSize) td.style.setProperty('font-size', fontSize, 'important');
                                if (fontFamily) td.style.setProperty('font-family', fontFamily, 'important');
                            }
                        }
                    });
                });
            }
            
            var footer = container.querySelector('.v4-grid-footer');
            if (footer) {
                footer.style.display = showPagination ? 'flex' : 'none';
            }
            var wrapper = container.querySelector('.v4-grid-table-wrapper');
            if (wrapper) {
                wrapper.style.height = showPagination ? 'calc(100% - 36px)' : '100%';
            }
            
            return;
        }

        var colgroupHtml = '<colgroup>';
        columns.forEach(function(col) {
            var w = col.width;
            if (!w) {
                w = '100px';
            } else {
                w = w.trim();
                if (/^\d+$/.test(w) || /^\d*\.\d+$/.test(w)) {
                    w = w + 'px';
                }
            }
            colgroupHtml += '<col style="width:' + w + ';">';
        });
        colgroupHtml += '</colgroup>';
        
        var headerHtml = '<tr style="height:' + rowHeightVal + ' !important; background:#ffffff; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box;">';
        columns.forEach(function(col, index) {
            var borderRight = ' border-right:1.6px solid rgb(226,232,240);';
            if (col.type === 'checkbox') {
                headerHtml += '<th class="v4-grid-cell v4-grid-check-col" data-type="checkbox" style="display:table-cell; vertical-align:middle; text-align:center; height:' + rowHeightVal + ' !important;' + borderRight + ' box-sizing:border-box; padding:0; font-weight:normal;"><input type="checkbox"></th>';
            } else {
                headerHtml += '<th class="v4-grid-cell v4-editable-cell" contenteditable="true" data-type="' + col.type + '" style="display:table-cell; vertical-align:middle; text-align:left; height:' + rowHeightVal + ' !important; padding:0 8px;' + borderRight + ' box-sizing:border-box; font-size:12px; font-weight:500; color:#0f172a; user-select:none;">' + (col.name || '') + ' ⇅</th>';
            }
        });
        headerHtml += '</tr>';
        
        var bodyHtml = '';
        for (var i = 0; i < rowCount; i++) {
            var data = mockList[i % mockList.length];
            var borderBottom = '1.6px solid rgb(226,232,240)';
            
            bodyHtml += '<tr style="height:' + rowHeightVal + ' !important; border-bottom:' + borderBottom + '; box-sizing:border-box; background:#ffffff;">';
            
            columns.forEach(function(col, colIndex) {
                var borderRight = ' border-right:1.6px solid rgb(226,232,240);';
                var heightStyle = ' height:' + rowHeightVal + ' !important;';
                
                if (col.type === 'checkbox') {
                    bodyHtml += '<td class="v4-grid-cell" data-type="checkbox" style="display:table-cell; vertical-align:middle; text-align:center;' + heightStyle + borderRight + ' box-sizing:border-box; padding:0;"><input type="checkbox"></td>';
                } else if (col.type === 'number') {
                    bodyHtml += '<td class="v4-grid-cell v4-editable-cell" contenteditable="true" data-type="number" style="display:table-cell; vertical-align:middle; text-align:left;' + heightStyle + ' padding:0 8px;' + borderRight + ' box-sizing:border-box; font-size:12px; color:#0f172a; font-weight:500;">' + (1024 - i) + '</td>';
                } else if (col.type === 'status') {
                    bodyHtml += '<td class="v4-grid-cell v4-editable-cell" contenteditable="true" data-type="status" style="display:table-cell; vertical-align:middle; text-align:left;' + heightStyle + ' padding:0 8px;' + borderRight + ' box-sizing:border-box;"><span style="background:' + data.statusBg + '; color:' + data.statusColor + '; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">' + data.status + '</span></td>';
                } else if (col.type === 'author') {
                    bodyHtml += '<td class="v4-grid-cell v4-editable-cell" contenteditable="true" data-type="author" style="display:table-cell; vertical-align:middle; text-align:left;' + heightStyle + ' padding:0 8px;' + borderRight + ' box-sizing:border-box; font-size:12px; color:#0f172a; font-weight:500;">' + data.author + '</td>';
                } else if (col.type === 'datetime') {
                    bodyHtml += '<td class="v4-grid-cell v4-editable-cell" contenteditable="true" data-type="datetime" style="display:table-cell; vertical-align:middle; text-align:left;' + heightStyle + ' padding:0 8px;' + borderRight + ' box-sizing:border-box; font-size:12px; color:#0f172a; font-weight:500;">' + data.date + '</td>';
                } else {
                    bodyHtml += '<td class="v4-grid-cell v4-editable-cell" contenteditable="true" data-type="text" style="display:table-cell; vertical-align:middle; text-align:left;' + heightStyle + ' padding:0 8px;' + borderRight + ' box-sizing:border-box; font-size:12px; color:#0f172a; font-weight:500;">' + data.name + '</td>';
                }
            });
            bodyHtml += '</tr>';
        }
        
        var displayFooter = showPagination ? 'flex' : 'none';
        var tableHeight = showPagination ? 'calc(100% - 36px)' : '100%';
        
        var tableContainerHtml = '<div class="v4-grid-table-wrapper" style="width:100%; height:' + tableHeight + '; overflow:auto; box-sizing:border-box;">' +
                                 '<table style="width:100%; table-layout:fixed; border-collapse:collapse; background:#ffffff; box-sizing:border-box;">' +
                                 colgroupHtml +
                                 '<thead>' + headerHtml + '</thead>' +
                                 '<tbody style="box-sizing:border-box;">' + bodyHtml + '</tbody>' +
                                 '</table>' +
                                 '</div>';
                                 
        var footerHtml = '<div class="v4-grid-footer" style="height:36px; padding:0 12px; display:' + displayFooter + '; align-items:center; justify-content:space-between; background:#f8fafc; border-top:1.6px solid rgb(226,232,240); box-sizing:border-box; width:100%; flex-shrink:0;"><span style="font-size:11px; color:#64748b; font-family:Inter,sans-serif;">1/27</span><div class="v4-grid-pages" style="font-size:11px; color:#64748b; cursor:pointer; font-family:Inter,sans-serif;">◀ 1 2 3 4 5 ▶</div><span style="font-size:11px; color:#64748b; font-family:Inter,sans-serif;">Page Size 100</span></div>';
        
        container.innerHTML = tableContainerHtml + footerHtml;
    };
})();
`;
