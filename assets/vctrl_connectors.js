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

    const svgLayer = document.getElementById('connector-layer');

    function init() {
        if (!svgLayer) return;

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

        // Rule 38: Layer setup
        svgLayer.style.zIndex = '10001';
        svgLayer.style.pointerEvents = 'none';

        // Add Marker Definitions for Arrows
        if (!svgLayer.querySelector('defs')) {
            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            defs.innerHTML = `
                <marker id="arrow-end" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
                <marker id="arrow-start" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                    <polygon points="10 0, 0 3.5, 10 7" fill="#3b82f6" />
                </marker>
                <marker id="arrow-end-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                </marker>
                <marker id="arrow-start-gray" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                    <polygon points="10 0, 0 3.5, 10 7" fill="#475569" />
                </marker>
            `;
            svgLayer.appendChild(defs);
        }

        redrawAll();

        // High-Persistence Window Handlers (Zero-Lag)
        svgLayer.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', onGlobalMouseMove);
        window.addEventListener('mouseup', onGlobalMouseUp);
        window.addEventListener('keydown', handleKeyDown);

        // Global Canvas Click Listener for Deselection
        const workspace = document.getElementById('workspace-view');
        if (workspace) {
            workspace.addEventListener('mousedown', (e) => {
                // Rule: Don't deselect if clicking on the connector layer itself or the property sidebars
                if (e.target.closest('#connector-layer') || e.target.closest('.sidebar')) return;
                clearSelection();
            });
        }

        if (window.MessageHub) {
            window.MessageHub.subscribe('LF_SNAP_RESPONSE', syncAnchoredPositions);
            window.MessageHub.subscribe('LF_SNAP_END', syncAnchoredPositions);
            window.MessageHub.subscribe('LF_DESELECT', clearSelection); // From Iframe
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
        if (!svgLayer) return;
        svgLayer.innerHTML = '';

        if (!window.state || !window.state.connectors) return;
        (window.state.connectors || []).forEach(conn => renderConnector(conn));
    }

    function renderConnector(conn) {
        const isSelected = selectedConnectorIds.includes(conn.id);
        const color = isSelected ? '#3b82f6' : (conn.style.stroke || '#475569');
        const width = isSelected ? (parseFloat(conn.style.strokeWidth || 1.6) + 1) : (conn.style.strokeWidth || 1.6);

        // 1. Invisible Hit Area (Thicker target for clicking)
        const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "path");
        hitArea.setAttribute("d", calculatePathData(conn));
        hitArea.setAttribute("stroke", "transparent");
        hitArea.setAttribute("stroke-width", "15");
        hitArea.setAttribute("fill", "rgba(0,0,0,0)"); // Ensure interior is clickable
        hitArea.style.cursor = 'pointer';
        hitArea.style.pointerEvents = 'auto'; // Rule 38: Explicitly set to auto
        hitArea.onmousedown = (e) => {
            e.stopPropagation();
            selectConnector(conn.id, e.shiftKey);
        };
        svgLayer.appendChild(hitArea);

        // 2. Visible Path
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", calculatePathData(conn));
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", width);
        path.setAttribute("fill", "none");
        path.setAttribute("class", "v4-connector-line" + (isSelected ? " selected" : ""));
        path.style.color = color; // Crucial for markers to inherit stroke color via currentColor
        path.style.pointerEvents = 'none';

        // Apply Styles: Dash
        if (conn.style && conn.style.dashArray) {
            path.setAttribute("stroke-dasharray", conn.style.dashArray);
        }

        svgLayer.appendChild(path);

        // 3. Arrow Heads (Direct Rendering)
        if (conn.style && (conn.style.markerStart || conn.style.markerEnd)) {
            const dx = conn.end.x - conn.start.x;
            const dy = conn.end.y - conn.start.y;
            const angle = Math.atan2(dy, dx);
            const headLength = Math.max(12, width * 4.5);
            
            const renderArrowHead = (pt, ang) => {
                const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                const p1 = { x: pt.x, y: pt.y };
                const p2 = { x: pt.x - headLength * Math.cos(ang - Math.PI / 6), y: pt.y - headLength * Math.sin(ang - Math.PI / 6) };
                const p3 = { x: pt.x - headLength * Math.cos(ang + Math.PI / 6), y: pt.y - headLength * Math.sin(ang + Math.PI / 6) };
                head.setAttribute("points", `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`);
                head.setAttribute("fill", color);
                head.style.pointerEvents = 'none';
                svgLayer.appendChild(head);
            };

            if (conn.style.markerStart) renderArrowHead(conn.start, angle + Math.PI);
            if (conn.style.markerEnd) renderArrowHead(conn.end, angle);
        }

        if (isSelected) {
            renderHandle(conn, 'start');
            renderHandle(conn, 'end');
        }
    }

    function renderHandle(conn, type) {
        const point = conn[type];
        
        // Handle Hit Area (Larger invisible circle for better grabbing)
        const hitCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        hitCircle.setAttribute("cx", point.x);
        hitCircle.setAttribute("cy", point.y);
        hitCircle.setAttribute("r", 12);
        hitCircle.setAttribute("fill", "transparent");
        hitCircle.style.cursor = 'crosshair';
        hitCircle.style.pointerEvents = 'auto'; // Rule 38: Explicitly set to auto
        hitCircle.onmousedown = (e) => {
            e.stopPropagation();
            isDragging = true;
            dragPoint = { connId: conn.id, pointType: type };
            collectSnapTargets();
            svgLayer.style.pointerEvents = 'all';
            document.body.style.cursor = 'crosshair';
        };
        svgLayer.appendChild(hitCircle);

        // Visible Handle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", 6);
        circle.setAttribute("fill", "#3b82f6");
        circle.setAttribute("stroke", "#fff");
        circle.setAttribute("stroke-width", "2");
        circle.style.pointerEvents = 'none';
        svgLayer.appendChild(circle);
    }

    function calculatePathData(conn) {
        const { start, end, type } = conn;
        if (type === 'straight') return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        const midX = (start.x + end.x) / 2;
        return `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`;
    }

    function handleMouseDown(e) {
        if (e.target === svgLayer) clearSelection();
    }

    // Sync with global selection state
    if (window.MessageHub) {
        MessageHub.subscribe('LF_DESELECT', () => clearSelection());
        MessageHub.subscribe('LF_COMP_SELECTED', (data) => {
            // Rule 39: Ignore messages from connectors to prevent self-deselection loop
            if (data && data.isConnector) return;
            clearSelection();
        });
    }

    let snapTargets = [];

    function onGlobalMouseMove(e) {
        if (!isDragging || !dragPoint) return;
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            if (!isDragging || !dragPoint) return;
            const rect = svgLayer.getBoundingClientRect();
            const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
            
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;

            const conn = window.state.connectors.find(c => c.id === dragPoint.connId);
            if (conn) {
                const pt = conn[dragPoint.pointType];
                pt.x = x; pt.y = y;
                pt.targetId = null; pt.side = null;
                
                // Optimized Fast Snap (Using Cached Targets)
                let bestSnap = null;
                let minDist = 20; // Snap threshold

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
            svgLayer.style.pointerEvents = 'none';
            document.body.style.cursor = '';
            if (window.markAsDirty) window.markAsDirty();
        }
    }

    function collectSnapTargets() {
        const iframe = document.getElementById('main-iframe');
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeRect = iframe.getBoundingClientRect();
        const svgRect = svgLayer.getBoundingClientRect();
        const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
        
        snapTargets = [];
        iframeDoc.querySelectorAll('.lf-component').forEach(comp => {
            const r = comp.getBoundingClientRect();
            // cX, cY are in client (screen) coordinates to match e.clientX/Y
            // sX, sY are in SVG (scaled) coordinates to save to state
            const sides = [
                { side: 'left',   cX: iframeRect.left + r.left,           cY: iframeRect.top + r.top + r.height/2, sX: (iframeRect.left + r.left - svgRect.left)/scale, sY: (iframeRect.top + r.top + r.height/2 - svgRect.top)/scale },
                { side: 'right',  cX: iframeRect.left + r.right,          cY: iframeRect.top + r.top + r.height/2, sX: (iframeRect.left + r.right - svgRect.left)/scale, sY: (iframeRect.top + r.top + r.height/2 - svgRect.top)/scale },
                { side: 'top',    cX: iframeRect.left + r.left + r.width/2, cY: iframeRect.top + r.top,           sX: (iframeRect.left + r.left + r.width/2 - svgRect.left)/scale, sY: (iframeRect.top + r.top - svgRect.top)/scale },
                { side: 'bottom', cX: iframeRect.left + r.left + r.width/2, cY: iframeRect.top + r.bottom,        sX: (iframeRect.left + r.left + r.width/2 - svgRect.left)/scale, sY: (iframeRect.top + r.bottom - svgRect.top)/scale }
            ];
            sides.forEach(s => snapTargets.push({ id: comp.id, ...s }));
        });
    }

    // In renderHandle hitCircle.onmousedown:
    // ...
    // isDragging = true;
    // collectSnapTargets();
    // ...

    function spawnLine(type = 'straight') {
        const id = 'conn_' + Date.now();
        const rect = svgLayer.getBoundingClientRect();
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
                // Rule 30: Ensure editor tab is visible on selection
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
        const iframe = document.getElementById('main-iframe');
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const svgRect = svgLayer.getBoundingClientRect();
        const scale = window.state.transform.scale || 1;

        window.state.connectors.forEach(conn => {
            ['start', 'end'].forEach(type => {
                const pt = conn[type];
                if (pt.targetId) {
                    const targetEl = iframeDoc.getElementById(pt.targetId);
                    if (targetEl) {
                        const r = targetEl.getBoundingClientRect();
                        if (pt.side === 'left') { pt.x = (r.left - svgRect.left) / scale; pt.y = (r.top + r.height/2 - svgRect.top) / scale; }
                        else if (pt.side === 'right') { pt.x = (r.right - svgRect.left) / scale; pt.y = (r.top + r.height/2 - svgRect.top) / scale; }
                        else if (pt.side === 'top') { pt.x = (r.left + r.width/2 - svgRect.left) / scale; pt.y = (r.top - svgRect.top) / scale; }
                        else if (pt.side === 'bottom') { pt.x = (r.left + r.width/2 - svgRect.left) / scale; pt.y = (r.bottom - svgRect.top) / scale; }
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
