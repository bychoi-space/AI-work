/**
 * assets/vctrl_iframe_ports.js
 * Mouse drag, port connections and connector rendering logic for LF Editor Studio (Iframe Side).
 */

window.v4PortConnectorScript = `
(function() {
    let isDrawingConnector = false;
    let startComponentId = null;
    let startPortSide = null;
    let connDragStartX = 0, connDragStartY = 0;
    let hoveredPort = null;
    let tempSvg = null;
    
    const notifyParent = (data) => { if (window.parent) window.parent.postMessage(data, '*'); };
    const markDirty = () => { notifyParent({ type: 'LF_DIRTY' }); };

    function drawTempLine(x1, y1, x2, y2) {
        if (!tempSvg) {
            tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            tempSvg.style.cssText = 'position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; z-index:10005; overflow:visible;';
            tempSvg.innerHTML = '<path stroke="#00e5ff" stroke-width="2" stroke-dasharray="4,4" fill="none" />';
            document.body.appendChild(tempSvg);
        }
        const path = tempSvg.querySelector('path');
        const midX = (x1 + x2) / 2;
        const pathData = 'M ' + x1 + ' ' + y1 + ' H ' + midX + ' V ' + y2 + ' H ' + x2;
        path.setAttribute('d', pathData);
    }

    function removeTempLine() {
        if (tempSvg) {
            tempSvg.remove();
            tempSvg = null;
        }
    }

    window.V4PortConnectorEngine = {
        get isDrawingConnector() { return isDrawingConnector; },
        set isDrawingConnector(v) { isDrawingConnector = v; },
        
        startConnectorDragFromPort: function(comp, side, e) {
            isDrawingConnector = true;
            document.body.classList.add('drawing-line-active');
            startComponentId = comp.id;
            startPortSide = side;
            
            const compLeft = parseFloat(comp.style.left) || 0;
            const compTop = parseFloat(comp.style.top) || 0;
            const compWidth = comp.offsetWidth;
            const compHeight = comp.offsetHeight;
            
            if (side === 'top') { connDragStartX = compLeft + compWidth / 2; connDragStartY = compTop; }
            else if (side === 'bottom') { connDragStartX = compLeft + compWidth / 2; connDragStartY = compTop + compHeight; }
            else if (side === 'left') { connDragStartX = compLeft; connDragStartY = compTop + compHeight / 2; }
            else if (side === 'right') { connDragStartX = compLeft + compWidth; connDragStartY = compTop + compHeight / 2; }
        },
        
        handleMouseMove: function(e) {
            if (!isDrawingConnector) return;
            const rect = document.body.getBoundingClientRect();
            const scale = (window.parent?.state?.transform?.scale) || 1;
            const logicalX = (e.clientX - rect.left) / scale;
            const logicalY = (e.clientY - rect.top) / scale;
            
            drawTempLine(connDragStartX, connDragStartY, logicalX, logicalY);
            
            // Toggle near-connector class based on distance inside iframe
            document.querySelectorAll('.lf-component').forEach(comp => {
                if (comp.id === startComponentId) return;
                const r = comp.getBoundingClientRect();
                const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
                const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) comp.classList.add('near-connector');
                else comp.classList.remove('near-connector');
            });

            const targetPort = e.target.closest('.lf-connector-port');
            if (targetPort && targetPort.parentElement.id !== startComponentId) {
                if (hoveredPort && hoveredPort !== targetPort) {
                    hoveredPort.style.transform = '';
                    hoveredPort.style.background = '#00e5ff';
                }
                hoveredPort = targetPort;
                hoveredPort.style.transform = 'scale(1.8)';
                hoveredPort.style.background = '#fb7185';
            } else {
                if (hoveredPort) {
                    hoveredPort.style.transform = '';
                    hoveredPort.style.background = '#00e5ff';
                    hoveredPort = null;
                }
            }
        },
        
        handleMouseUp: function() {
            if (!isDrawingConnector) return;
            isDrawingConnector = false;
            document.body.classList.remove('drawing-line-active');
            document.querySelectorAll('.lf-component').forEach(comp => comp.classList.remove('near-connector'));
            removeTempLine();
            if (hoveredPort) {
                const targetComponentId = hoveredPort.parentElement.id;
                const targetPortSide = hoveredPort.getAttribute('data-side');
                hoveredPort.style.transform = '';
                hoveredPort.style.background = '#00e5ff';
                hoveredPort = null;
                
                notifyParent({
                    type: 'LF_CREATE_CONNECTOR',
                    startId: startComponentId,
                    startSide: startPortSide,
                    endId: targetComponentId,
                    endSide: targetPortSide
                });
            }
        }
    };
})();
`;
