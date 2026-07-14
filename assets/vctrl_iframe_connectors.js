/**
 * assets/vctrl_iframe_connectors.js
 * Connector and line drawing module for LF Editor Studio (Iframe Side).
 */

window.v4ConnectorScript = `
(function() {
    console.log("[V4 Iframe Connectors] Initializing...");
    let tempSvg = null;
    let hoveredPort = null;
    let isDrawingConnector = false;
    let startComponentId = null;
    let startPortSide = null;
    let connDragStartX = 0, connDragStartY = 0;

    // Direct helper functions from core
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

    window.calculatePathData = (c, s, e) => {
        if (c.type === 'straight') return 'M ' + s.x + ' ' + s.y + ' L ' + e.x + ' ' + e.y;
        
        const sSide = c.start.side || 'right';
        const eSide = c.end.side || 'left';
        
        const getDirOffset = (side, amount) => {
            if (side === 'left') return { dx: -amount, dy: 0 };
            if (side === 'right') return { dx: amount, dy: 0 };
            if (side === 'top') return { dx: 0, dy: -amount };
            if (side === 'bottom') return { dx: 0, dy: amount };
            return { dx: 0, dy: 0 };
        };
        
        const offset = 20;
        const oStart = getDirOffset(sSide, offset);
        const oEnd = getDirOffset(eSide, offset);
        
        const ptStart = { x: s.x + oStart.dx, y: s.y + oStart.dy };
        const ptEnd = { x: e.x + oEnd.dx, y: e.y + oEnd.dy };
        
        let path = 'M ' + s.x + ' ' + s.y + ' L ' + ptStart.x + ' ' + ptStart.y;
        
        if (sSide === 'left' || sSide === 'right') {
            if (eSide === 'left' || eSide === 'right') {
                const midX = (ptStart.x + ptEnd.x) / 2;
                path += ' H ' + midX + ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
            } else {
                path += ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
            }
        } else {
            if (eSide === 'top' || eSide === 'bottom') {
                const midY = (ptStart.y + ptEnd.y) / 2;
                path += ' V ' + midY + ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
            } else {
                path += ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
            }
        }
        return path;
    };

    function startConnectorDragFromPort(comp, side, e) {
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
    }

    // Export functions to window for other modules
    window.drawTempLine = drawTempLine;
    window.removeTempLine = removeTempLine;
    window.calculatePathData = calculatePathData;
    window.startConnectorDragFromPort = startConnectorDragFromPort;
})();
`;
