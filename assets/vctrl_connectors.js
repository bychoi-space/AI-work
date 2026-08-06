/**
 * vctrl_connectors.js - Dedicated Connector Engine for V4 (TRUE FINAL VERSION)
 * Responsibility: Zero-lag dragging, Sidebar Sync, Deselection, and State Persistence.
 */

window.ConnectorEngine = (function() {
    console.log("%c [CONNECTOR ENGINE] Finalizing with Zero-Lag Dragging (V116_LINE_PERSIST_FIX)... ", "background: #3b82f6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    let isDrawing = false;
    let selectedConnectorIds = [];
    let isDragging = false;
    let dragPoint = null; // { connId, pointType: 'start'|'end' }
    let rafId = null;
    let snapTargets = [];

    function init() {
        // Function must be defined before init calls it via listeners
        window.updateSelectedStyle = function(style) {
            selectedConnectorIds.forEach(id => {
                const conn = window.state.connectors.find(c => c.id === id);
                if (conn) {
                    if (!conn.style) conn.style = {};
                    Object.assign(conn.style, style);
                }
            });
            redrawAll();
            if (window.markAsDirty) window.markAsDirty();
            const iframe = window.DOM?.iframe;
            if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                MessageHub.send(iframe.contentWindow, 'LF_SYNC_CONNECTORS', { connectors: window.state.connectors });
            }
        };

        // High-Persistence Window Handlers (Zero-Lag)
        window.addEventListener('mousemove', onGlobalMouseMove);
        window.addEventListener('mouseup', onGlobalMouseUp);
        window.addEventListener('keydown', handleKeyDown);

        // Global Canvas Click Listener for Deselection
        const workspace = document.getElementById('workspace-view');
        if (workspace) {
            workspace.addEventListener('mousedown', (e) => {
                if (e.target.closest('.sidebar') || e.target.closest('#floating-inspector-card')) return;
                clearSelection();
            });
        }

        if (window.MessageHub) {
            window.MessageHub.subscribe('LF_SNAP_REQUEST', syncAnchoredPositions);
            window.MessageHub.subscribe('LF_SNAP_RESPONSE', syncAnchoredPositions);
            window.MessageHub.subscribe('LF_SNAP_END', syncAnchoredPositions);
            window.MessageHub.subscribe('LF_COMP_RESIZED', syncAnchoredPositions);
            window.MessageHub.subscribe('LF_DESELECT', clearSelection); 
            
            // Forward selection from iframe
            window.MessageHub.subscribe('LF_CONNECTOR_CLICKED', (data) => {
                selectConnector(data.id, data.shiftKey);
            });
            
            // Handle handle drag from iframe
            window.MessageHub.subscribe('LF_CONNECTOR_HANDLE_DOWN', (data) => {
                isDragging = true;
                dragPoint = { connId: data.id, pointType: data.pointType };
                collectSnapTargets();
                document.body.style.cursor = 'crosshair';
            });

            // Handle connector position update from iframe (Group move)
            window.MessageHub.subscribe('LF_UPDATE_CONNECTOR_POS', (data) => {
                const conn = window.state.connectors.find(c => c.id === data.id);
                if (conn) {
                    conn.start.x = data.start.x;
                    conn.start.y = data.start.y;
                    conn.end.x = data.end.x;
                    conn.end.y = data.end.y;
                }
            });
            window.MessageHub.subscribe('LF_SHIFT_CONNECTOR_POS', (data) => {
                const conn = window.state.connectors.find(c => c.id === data.id);
                if (conn) {
                    conn.start.x += data.dx;
                    conn.start.y += data.dy;
                    conn.end.x += data.dx;
                    conn.end.y += data.dy;
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                    const iframe = window.DOM?.iframe;
                    if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                        MessageHub.send(iframe.contentWindow, 'LF_SYNC_CONNECTORS', { connectors: window.state.connectors });
                    }
                }
            });
            window.MessageHub.subscribe('LF_CONNECTOR_HANDLE_MOVE', (data) => {
                onIframeMouseMove(data);
            });
            window.MessageHub.subscribe('LF_CONNECTOR_HANDLE_UP', onGlobalMouseUp);
            window.MessageHub.subscribe('LF_DELETE_CONNECTOR', (data) => {
                if (data.id) {
                    window.state.connectors = window.state.connectors.filter(c => c.id !== data.id);
                    if (window.state.activeFile && window.state.activeFile.meta) {
                        window.state.activeFile.meta.connectors = window.state.connectors;
                    }
                    selectedConnectorIds = selectedConnectorIds.filter(id => id !== data.id);
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                }
            });
            window.MessageHub.subscribe('LF_CREATE_CONNECTOR', (data) => {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                const id = 'conn_' + Date.now();
                const newConnector = {
                    id,
                    type: 'elbow',
                    start: { targetId: data.startId, side: data.startSide, x: 0, y: 0 },
                    end: { targetId: data.endId, side: data.endSide, x: 0, y: 0 },
                    style: { stroke: '#475569', strokeWidth: 1.6 }
                };
                if (!window.state.connectors) window.state.connectors = [];
                window.state.connectors.push(newConnector);
                
                syncAnchoredPositions();
                selectConnector(id);
                if (window.markAsDirty) window.markAsDirty();
            });
            window.MessageHub.subscribe('LF_SYNC_CONNECTORS', (data) => {
                window.state.connectors = data.connectors || [];
                if (window.state.activeFile && window.state.activeFile.meta) {
                    window.state.activeFile.meta.connectors = window.state.connectors;
                }
                if (window.markAsDirty) window.markAsDirty();
            });
        }

        // Line Editor Event Listeners
        document.getElementById('line-stroke-color')?.addEventListener('input', (e) => window.updateSelectedStyle({ stroke: e.target.value }));
        document.getElementById('line-stroke-width')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 1.6;
            const display = document.getElementById('txt-line-stroke-width');
            if (display) display.innerText = val.toFixed(1);
            window.updateSelectedStyle({ strokeWidth: val });
        });
        document.getElementById('line-marker-start')?.addEventListener('change', (e) => window.updateSelectedStyle({ markerStart: e.target.value }));
        document.getElementById('line-marker-end')?.addEventListener('change', (e) => window.updateSelectedStyle({ markerEnd: e.target.value }));
        document.getElementById('line-dash-array')?.addEventListener('change', (e) => window.updateSelectedStyle({ dashArray: e.target.value }));
        document.getElementById('prop-line-width')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            if (selectedConnectorIds.length > 0) {
                const conn = window.state.connectors.find(c => c.id === selectedConnectorIds[0]);
                if (conn) {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const sign = conn.end.x >= conn.start.x ? 1 : -1;
                    conn.end.x = conn.start.x + sign * val;
                    conn.end.targetId = null; conn.end.side = null;
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                    const iframe = window.DOM?.iframe;
                    if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                        MessageHub.send(iframe.contentWindow, 'LF_SYNC_CONNECTORS', { connectors: window.state.connectors });
                    }
                }
            }
        });
        document.getElementById('prop-line-height')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            if (selectedConnectorIds.length > 0) {
                const conn = window.state.connectors.find(c => c.id === selectedConnectorIds[0]);
                if (conn) {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const sign = conn.end.y >= conn.start.y ? 1 : -1;
                    conn.end.y = conn.start.y + sign * val;
                    conn.end.targetId = null; conn.end.side = null;
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                    const iframe = window.DOM?.iframe;
                    if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                        MessageHub.send(iframe.contentWindow, 'LF_SYNC_CONNECTORS', { connectors: window.state.connectors });
                    }
                }
            }
        });
    }

    function redrawAll() {
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (window.MessageHub && iframe?.contentWindow) {
            MessageHub.send(iframe.contentWindow, 'LF_RENDER_CONNECTORS', {
                connectors: window.state.connectors || [],
                selectedIds: selectedConnectorIds
            });
        }
    }

    function onIframeMouseMove(data) {
        if (!isDragging || !dragPoint) return;
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const rect = iframe.getBoundingClientRect();
        const syntheticEvent = {
            clientX: data.clientX + rect.left,
            clientY: data.clientY + rect.top
        };
        onGlobalMouseMove(syntheticEvent);
    }

    function onGlobalMouseMove(e) {
        if (!isDragging || !dragPoint) return;
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            if (!isDragging || !dragPoint) return;
            const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
            if (!iframe) return;
            const rect = iframe.getBoundingClientRect();
            const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
            
            // Calculate coordinates relative to the iframe content
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;

            // Dynamically calculate proximity to elements to toggle .near-connector inside iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeRect = iframe.getBoundingClientRect();
            iframeDoc.querySelectorAll('.lf-component').forEach(comp => {
                if (comp.id === dragPoint.connId) return;
                const r = comp.getBoundingClientRect();
                const left = r.left + iframeRect.left;
                const right = r.right + iframeRect.left;
                const top = r.top + iframeRect.top;
                const bottom = r.bottom + iframeRect.top;
                
                const dx = Math.max(left - e.clientX, 0, e.clientX - right);
                const dy = Math.max(top - e.clientY, 0, e.clientY - bottom);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    comp.classList.add('near-connector');
                } else {
                    comp.classList.remove('near-connector');
                }
            });

            const conn = window.state.connectors.find(c => c.id === dragPoint.connId);
            if (conn) {
                const pt = conn[dragPoint.pointType];
                pt.x = x; pt.y = y;
                pt.targetId = null; pt.side = null;
                
                // Reset previously highlighted port
                if (window.lastHighlightedPort) {
                    window.lastHighlightedPort.style.transform = '';
                    window.lastHighlightedPort.style.background = '#00e5ff';
                    window.lastHighlightedPort = null;
                }

                // Optimized Fast Snap
                let bestSnap = null;
                let minDist = 30; // Snap threshold (30px)

                snapTargets.forEach(target => {
                    const dist = Math.sqrt(Math.pow(e.clientX - target.cX, 2) + Math.pow(e.clientY - target.cY, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        bestSnap = target;
                    }
                });

                if (bestSnap) {
                    pt.targetId = bestSnap.id;
                    pt.side = bestSnap.side;
                    pt.x = bestSnap.sX;
                    pt.y = bestSnap.sY;

                    // Dynamically highlight snapped port inside iframe
                    const targetEl = iframeDoc.getElementById(bestSnap.id);
                    if (targetEl) {
                        const portEl = targetEl.querySelector(`.lf-connector-port.port-${bestSnap.side}`);
                        if (portEl) {
                            portEl.style.transform = 'scale(1.8)';
                            portEl.style.background = '#fb7185';
                            window.lastHighlightedPort = portEl;
                        }
                    }
                }

                redrawAll();

                // Real-time properties sync
                const propLineWidth = document.getElementById('prop-line-width');
                const propLineHeight = document.getElementById('prop-line-height');
                if (propLineWidth) propLineWidth.value = Math.round(Math.abs(conn.end.x - conn.start.x));
                if (propLineHeight) propLineHeight.value = Math.round(Math.abs(conn.end.y - conn.start.y));
            }
        });
    }

    function onGlobalMouseUp() {
        if (window.lastHighlightedPort) {
            window.lastHighlightedPort.style.transform = '';
            window.lastHighlightedPort.style.background = '#00e5ff';
            window.lastHighlightedPort = null;
        }

        const iframe = window.DOM?.iframe;
        if (iframe) {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.querySelectorAll('.lf-component').forEach(comp => {
                comp.classList.remove('near-connector');
            });
        }

        if (isDragging) {
            isDragging = false;
            dragPoint = null;
            snapTargets = [];
            document.body.style.cursor = '';
            if (window.markAsDirty) window.markAsDirty();
            redrawAll();
            if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                MessageHub.send(iframe.contentWindow, 'LF_SYNC_CONNECTORS', { connectors: window.state.connectors });
            }
        }
    }

    function collectSnapTargets() {
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeRect = iframe.getBoundingClientRect();
        
        snapTargets = [];
        iframeDoc.querySelectorAll('.lf-component').forEach(comp => {
            if (dragPoint && comp.id === dragPoint.connId) return;
            
            // Physical bounding rect for client mouse comparison
            const r = comp.getBoundingClientRect();

            // Unscaled logical coordinates from inline style rules
            const left = parseFloat(comp.style.left) || 0;
            const top = parseFloat(comp.style.top) || 0;
            const width = comp.offsetWidth;
            const height = comp.offsetHeight;

            const sides = [
                { side: 'left',   cX: r.left + iframeRect.left,             cY: r.top + r.height/2 + iframeRect.top, sX: left,             sY: top + height/2 },
                { side: 'right',  cX: r.right + iframeRect.left,            cY: r.top + r.height/2 + iframeRect.top, sX: left + width,     sY: top + height/2 },
                { side: 'top',    cX: r.left + r.width/2 + iframeRect.left,   cY: r.top + iframeRect.top,             sX: left + width/2,     sY: top },
                { side: 'bottom', cX: r.left + r.width/2 + iframeRect.left,   cY: r.bottom + iframeRect.top,          sX: left + width/2,     sY: top + height }
            ];
            sides.forEach(s => snapTargets.push({ id: comp.id, ...s }));
        });
    }

    function spawnLine(type = 'straight') {
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        const id = 'conn_' + Date.now();
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const rect = iframe.getBoundingClientRect();
        const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
        const cx = (window.innerWidth / 2 - rect.left) / scale;
        const cy = (window.innerHeight / 2 - rect.top) / scale;

        const newLine = {
            id, type,
            start: { x: cx - 50, y: cy, targetId: null, side: null },
            end: { x: cx + 50, y: cy, targetId: null, side: null },
            style: { stroke: '#475569', strokeWidth: 1.6 }
        };

        if (!window.state.connectors) window.state.connectors = [];
        window.state.connectors.push(newLine);
        
        redrawAll();
        selectConnector(id);
        if (window.markAsDirty) window.markAsDirty();
    }

    function selectConnector(id, isMulti = false) {
        if (isMulti) {
            if (selectedConnectorIds.includes(id)) selectedConnectorIds = selectedConnectorIds.filter(x => x !== id);
            else selectedConnectorIds.push(id);
        } else {
            selectedConnectorIds = [id];
        }
        onSelectionChange(id);
    }

    function setSelectedIds(ids) {
        selectedConnectorIds = Array.isArray(ids) ? [...ids] : [];
        if (selectedConnectorIds.length > 0) {
            onSelectionChange(selectedConnectorIds[selectedConnectorIds.length - 1]);
        } else {
            clearSelection();
        }
        redrawAll();
    }

    function onSelectionChange(lastId) {
        const lineEditor = document.getElementById('line-editor-section');
        const shapeEditor = document.getElementById('shape-inspector-section');
        if (lineEditor) {
            lineEditor.style.display = 'block';
            const conn = window.state.connectors.find(c => c.id === lastId);
            if (conn) {
                const colorInput = document.getElementById('line-stroke-color');
                const widthInput = document.getElementById('line-stroke-width');
                const widthDisplay = document.getElementById('txt-line-stroke-width');
                const startMarker = document.getElementById('line-marker-start');
                const endMarker = document.getElementById('line-marker-end');
                const dashArray = document.getElementById('line-dash-array');

                if (colorInput) colorInput.value = conn.style.stroke || '#475569';
                if (widthInput) widthInput.value = conn.style.strokeWidth || 1.6;
                if (widthDisplay) widthDisplay.innerText = (conn.style.strokeWidth || 1.6).toFixed(1);
                if (startMarker) startMarker.value = conn.style.markerStart || '';
                if (endMarker) endMarker.value = conn.style.markerEnd || '';
                if (dashArray) dashArray.value = conn.style.dashArray || '';
                const propLineWidth = document.getElementById('prop-line-width');
                const propLineHeight = document.getElementById('prop-line-height');
                if (propLineWidth) propLineWidth.value = Math.round(Math.abs(conn.end.x - conn.start.x));
                if (propLineHeight) propLineHeight.value = Math.round(Math.abs(conn.end.y - conn.start.y));
            }
        }
        if (shapeEditor) shapeEditor.style.display = 'none';

        if (window.MessageHub) {
            const conn = window.state.connectors.find(c => c.id === lastId);
            const x = conn ? Math.min(conn.start.x, conn.end.x) : 0;
            const w = conn ? Math.abs(conn.end.x - conn.start.x) : 0;
            window.MessageHub.send(window, 'LF_COMP_SELECTED', { id: lastId, isConnector: true, x: x, w: w });
        }
        redrawAll();
    }

    function clearSelection() {
        if (selectedConnectorIds.length === 0) return;
        selectedConnectorIds = [];
        const lineEditor = document.getElementById('line-editor-section');
        if (lineEditor) lineEditor.style.display = 'none';
        redrawAll();
    }

    function syncAnchoredPositions() {
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !window.state?.connectors) return;

        window.state.connectors.forEach(conn => {
            ['start', 'end'].forEach(type => {
                const pt = conn[type];
                if (pt && pt.targetId) {
                    const targetEl = iframeDoc.getElementById(pt.targetId);
                    if (targetEl) {
                        const left = parseFloat(targetEl.style.left) || 0;
                        const top = parseFloat(targetEl.style.top) || 0;
                        const width = targetEl.offsetWidth;
                        const height = targetEl.offsetHeight;

                        if (pt.side === 'left') { pt.x = left; pt.y = top + height/2; }
                        else if (pt.side === 'right') { pt.x = left + width; pt.y = top + height/2; }
                        else if (pt.side === 'top') { pt.x = left + width/2; pt.y = top; }
                        else if (pt.side === 'bottom') { pt.x = left + width/2; pt.y = top + height; }
                    } else {
                        pt.targetId = null;
                        pt.side = null;
                    }
                }
            });
        });
        redrawAll();
    }

    function deleteSelectedLine() {
        if (selectedConnectorIds.length === 0) return;
        window.state.connectors = window.state.connectors.filter(c => !selectedConnectorIds.includes(c.id));
        if (window.state.activeFile && window.state.activeFile.meta) {
            window.state.activeFile.meta.connectors = window.state.connectors;
        }
        selectedConnectorIds = [];
        const lineEditor = document.getElementById('line-editor-section');
        if (lineEditor) lineEditor.style.display = 'none';
        redrawAll();
        if (window.markAsDirty) window.markAsDirty();
    }

    function handleKeyDown(e) {
        const activeEl = document.activeElement;
        const isInput = activeEl && (
            activeEl.tagName === 'INPUT' || 
            activeEl.tagName === 'SELECT' || 
            activeEl.tagName === 'TEXTAREA' || 
            activeEl.isContentEditable
        );
        if (isInput) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedConnectorIds.length > 0) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                deleteSelectedLine();
            }
        }
    }

    function shiftConnectors(connIds, dx, dy) {
        if (!Array.isArray(connIds) || connIds.length === 0 || (!dx && !dy)) return;
        if (!window.state || !Array.isArray(window.state.connectors)) return;
        let changed = false;
        connIds.forEach(id => {
            const conn = window.state.connectors.find(c => c && c.id === id);
            if (conn && conn.start && conn.end) {
                conn.start.x += dx;
                conn.start.y += dy;
                conn.end.x += dx;
                conn.end.y += dy;
                conn.start.targetId = null; conn.start.side = null;
                conn.end.targetId = null; conn.end.side = null;
                changed = true;
            }
        });
        if (changed) {
            if (window.state.activeFile && window.state.activeFile.meta) {
                window.state.activeFile.meta.connectors = window.state.connectors;
            }
            redrawAll();
            if (window.markAsDirty) window.markAsDirty();
        }
    }

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);

    return {
        init, redrawAll, spawnLine, clearSelection, syncAnchoredPositions,
        selectConnector, setSelectedIds, shiftConnectors,
        getSelectedIds: () => selectedConnectorIds,
        deleteSelected: deleteSelectedLine,
        updateSelectedStyle: window.updateSelectedStyle
    };
})();
