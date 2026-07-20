window.v4ObjectConnectorScript = `
(function() {
    console.log("[V4 Object Connector] Module initialized.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    let tempSvg = null;

    window.drawTempLine = (x1, y1, x2, y2) => {
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
    };

    window.removeTempLine = () => {
        if (tempSvg) {
            tempSvg.remove();
            tempSvg = null;
        }
    };


    window.updateAnchoredConnectorsLocal = (movedId) => {
        const movedEl = document.getElementById(movedId);
        const movedIds = [movedId];
        if (movedEl && movedEl.classList.contains('lf-group')) {
            movedEl.querySelectorAll('.lf-component').forEach(child => {
                if (child.id) movedIds.push(child.id);
            });
        }
        
        const connectors = window.parent?.state?.connectors || [];
        connectors.forEach(conn => {
            if (movedIds.includes(conn.start.targetId) || movedIds.includes(conn.end.targetId)) {
                const svg = document.getElementById(conn.id);
                if (svg) {
                    ['start', 'end'].forEach(type => {
                        const pt = conn[type];
                        if (pt.targetId) {
                            const targetEl = document.getElementById(pt.targetId);
                            if (targetEl) {
                                let left = parseFloat(targetEl.style.left) || 0;
                                let top = parseFloat(targetEl.style.top) || 0;
                                
                                let parent = targetEl.parentElement;
                                while (parent && parent !== document.body && parent !== document.documentElement) {
                                    if (parent.style.position === 'absolute' || parent.classList.contains('lf-group')) {
                                        left += parseFloat(parent.style.left) || 0;
                                        top += parseFloat(parent.style.top) || 0;
                                    }
                                    parent = parent.parentElement;
                                }

                                const width = targetEl.offsetWidth;
                                const height = targetEl.offsetHeight;

                                if (pt.side === 'left') { pt.x = left; pt.y = top + height/2; }
                                else if (pt.side === 'right') { pt.x = left + width; pt.y = top + height/2; }
                                else if (pt.side === 'top') { pt.x = left + width/2; pt.y = top; }
                                else if (pt.side === 'bottom') { pt.x = left + width/2; pt.y = top + height; }
                            }
                        }
                    });
                    
                    const sX = conn.start.x;
                    const sY = conn.start.y;
                    const eX = conn.end.x;
                    const eY = conn.end.y;
                    
                    const headLength = Math.max(12, parseFloat(conn.style.strokeWidth || 1.6) * 4.5);
                    const padding = headLength + 10;
                    const minX = Math.min(sX, eX) - padding;
                    const minY = Math.min(sY, eY) - padding;
                    const w = Math.max(sX, eX) + padding - minX;
                    const h = Math.max(sY, eY) + padding - minY;
                    
                    svg.style.left = minX + 'px';
                    svg.style.top = minY + 'px';
                    svg.style.width = w + 'px';
                    svg.style.height = h + 'px';
                    svg.setAttribute('width', w);
                    svg.setAttribute('height', h);
                    
                    const rStart = { x: sX - minX, y: sY - minY };
                    const rEnd = { x: eX - minX, y: eY - minY };
                    
                    const pathData = window.calculatePathData(conn, rStart, rEnd);
                    const paths = svg.querySelectorAll('path');
                    if (paths.length === 2) {
                        paths[0].setAttribute('d', pathData);
                        paths[1].setAttribute('d', pathData);
                    }
                    
                    const circles = svg.querySelectorAll('circle');
                    if (circles.length === 2) {
                        circles[0].setAttribute('cx', rStart.x);
                        circles[0].setAttribute('cy', rStart.y);
                        circles[1].setAttribute('cx', rEnd.x);
                        circles[1].setAttribute('cy', rEnd.y);
                    }
                }
            }
        });
    };
})();
`;
