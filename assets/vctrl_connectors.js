/**
 * vctrl_connectors.js - Dedicated Connector Engine for V4 (TRUE FINAL VERSION)
 * Responsibility: Zero-lag dragging, Sidebar Sync, Deselection, and State Persistence.
 */

window.ConnectorEngine = (function() {
    console.log("%c [CONNECTOR ENGINE] Finalizing with Zero-Lag Dragging... ", "background: #3b82f6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

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
        };

        // High-Persistence Window Handlers (Zero-Lag)
        window.addEventListener('mousemove', onGlobalMouseMove);
        window.addEventListener('mouseup', onGlobalMouseUp);
        window.addEventListener('keydown', handleKeyDown);

        // Global Canvas Click Listener for Deselection
        const workspace = document.getElementById('workspace-view');
        if (workspace) {
            workspace.addEventListener('mousedown', (e) => {
                if (e.target.closest('.sidebar')) return;
                clearSelection();
            });
        }

        if (window.MessageHub) {
            window.MessageHub.subscribe('LF_SNAP_RESPONSE', syncAnchoredPositions);
            window.MessageHub.subscribe('LF_SNAP_END', syncAnchoredPositions);
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
            window.MessageHub.subscribe('LF_CONNECTOR_HANDLE_MOVE', (data) => {
                onIframeMouseMove(data);
            });
            window.MessageHub.subscribe('LF_CONNECTOR_HANDLE_UP', onGlobalMouseUp);
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
    }

    function redrawAll() {
        const iframe = window.DOM?.iframe;
        if (window.MessageHub && iframe?.contentWindow) {
            MessageHub.send(iframe.contentWindow, 'LF_RENDER_CONNECTORS', {
                connectors: window.state.connectors || [],
                selectedIds: selectedConnectorIds
            });
        }
    }

    function onIframeMouseMove(data) {
        if (!isDragging || !dragPoint) return;
        const iframe = window.DOM.iframe;
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
            const iframe = window.DOM.iframe;
            const rect = iframe.getBoundingClientRect();
            const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
            
            // Calculate coordinates relative to the iframe content
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;

            const conn = window.state.connectors.find(c => c.id === dragPoint.connId);
            if (conn) {
                const pt = conn[dragPoint.pointType];
                pt.x = x; pt.y = y;
                pt.targetId = null; pt.side = null;
                
                // Optimized Fast Snap
                let bestSnap = null;
                let minDist = 20; 

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
                }

                redrawAll();
            }
        });
    }

    function onGlobalMouseUp() {
        if (isDragging) {
            isDragging = false;
            dragPoint = null;
            snapTargets = [];
            document.body.style.cursor = '';
            if (window.markAsDirty) window.markAsDirty();
            redrawAll();
        }
    }

    function collectSnapTargets() {
        const iframe = window.DOM.iframe;
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const host = iframeDoc.querySelector('.mobile-content') || iframeDoc.querySelector('.page') || iframeDoc.body;
        const hostRect = host.getBoundingClientRect();
        const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
        
        snapTargets = [];
        iframeDoc.querySelectorAll('.lf-component').forEach(comp => {
            if (dragPoint && comp.id === dragPoint.connId) return;
            
            const r = comp.getBoundingClientRect();
            const sides = [
                { side: 'left',   cX: r.left,           cY: r.top + r.height/2, sX: (r.left - hostRect.left)/scale, sY: (r.top + r.height/2 - hostRect.top)/scale },
                { side: 'right',  cX: r.right,          cY: r.top + r.height/2, sX: (r.right - hostRect.left)/scale, sY: (r.top + r.height/2 - hostRect.top)/scale },
                { side: 'top',    cX: r.left + r.width/2, cY: r.top,           sX: (r.left + r.width/2 - hostRect.left)/scale, sY: (r.top - hostRect.top)/scale },
                { side: 'bottom', cX: r.left + r.width/2, cY: r.bottom,        sX: (r.left + r.width/2 - hostRect.left)/scale, sY: (r.bottom - hostRect.top)/scale }
            ];
            sides.forEach(s => snapTargets.push({ id: comp.id, ...s }));
        });
    }

    function spawnLine(type = 'straight') {
        const id = 'conn_' + Date.now();
        const iframe = window.DOM.iframe;
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
                if (window.switchSidebarTab) window.switchSidebarTab('editor');

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
            }
        }
        if (shapeEditor) shapeEditor.style.display = 'none';

        if (window.MessageHub) {
            window.MessageHub.send(window, 'LF_COMP_SELECTED', { id: lastId, isConnector: true });
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
        const iframe = window.DOM.iframe;
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const host = iframeDoc.querySelector('.mobile-content') || iframeDoc.querySelector('.page') || iframeDoc.body;
        const hostRect = host.getBoundingClientRect();
        const scale = window.state.transform.scale || 1;

        window.state.connectors.forEach(conn => {
            ['start', 'end'].forEach(type => {
                const pt = conn[type];
                if (pt.targetId) {
                    const targetEl = iframeDoc.getElementById(pt.targetId);
                    if (targetEl) {
                        const r = targetEl.getBoundingClientRect();
                        if (pt.side === 'left') { pt.x = (r.left - hostRect.left) / scale; pt.y = (r.top + r.height/2 - hostRect.top) / scale; }
                        else if (pt.side === 'right') { pt.x = (r.right - hostRect.left) / scale; pt.y = (r.top + r.height/2 - hostRect.top) / scale; }
                        else if (pt.side === 'top') { pt.x = (r.left + r.width/2 - hostRect.left) / scale; pt.y = (r.top - hostRect.top) / scale; }
                        else if (pt.side === 'bottom') { pt.x = (r.left + r.width/2 - hostRect.left) / scale; pt.y = (r.bottom - hostRect.top) / scale; }
                    }
                }
            });
        });
        redrawAll();
    }

    function deleteSelectedLine() {
        if (selectedConnectorIds.length === 0) return;
        window.state.connectors = window.state.connectors.filter(c => !selectedConnectorIds.includes(c.id));
        selectedConnectorIds = [];
        const lineEditor = document.getElementById('line-editor-section');
        if (lineEditor) lineEditor.style.display = 'none';
        redrawAll();
        if (window.markAsDirty) window.markAsDirty();
    }

    function handleKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedConnectorIds.length > 0) {
                deleteSelectedLine();
            }
        }
    }

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);

    return {
        init, redrawAll, spawnLine, clearSelection, syncAnchoredPositions,
        selectConnector, setSelectedIds,
        getSelectedIds: () => selectedConnectorIds,
        deleteSelected: deleteSelectedLine,
        updateSelectedStyle: window.updateSelectedStyle
    };
})();
