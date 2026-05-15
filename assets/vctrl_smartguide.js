/**
 * vctrl_smartguide.js
 * Independent module for Smart Guide (Snapping) System.
 * Handles calculation, target discovery (async), and guide rendering.
 */

(function() {
    console.log("%c [SMART GUIDE] Module Loaded ", "background: #ff4757; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    window.SmartGuide = {
        targets: [],
        threshold: 10,
        activeLines: { x: null, y: null },

        /**
         * Collects snapping targets from canvas and requests from iframe.
         */
        findSnapTargets() {
            const DOM = window.DOM;
            if (!DOM || !DOM.iframe) return;

            this.targets = [];
            const cw = parseInt(DOM.iframe.style.width) || 1440;
            const ch = parseInt(DOM.iframe.style.height) || 900;

            // 1. Canvas Center & Edges
            this.targets.push({ x: 0, label: 'Canvas', part: 'Left', type: 'h' });
            this.targets.push({ x: cw / 2, label: 'Canvas', part: 'Center', type: 'h' });
            this.targets.push({ x: cw, label: 'Canvas', part: 'Right', type: 'h' });
            this.targets.push({ y: 0, label: 'Canvas', part: 'Top', type: 'v' });
            this.targets.push({ y: ch / 2, label: 'Canvas', part: 'Middle', type: 'v' });
            this.targets.push({ y: ch, label: 'Canvas', part: 'Bottom', type: 'v' });

            // 2. Local Pins & Text Markers (Parent Layer)
            if (DOM.pinsLayer) {
                const pins = DOM.pinsLayer.querySelectorAll('.pin-marker, .text-marker');
                pins.forEach(p => {
                    if (p.classList.contains('dragging-now')) return;
                    const l = p.style.left || '';
                    const t = p.style.top || '';
                    const x = l.includes('%') ? (parseFloat(l) / 100) * cw : parseFloat(l) || 0;
                    const y = t.includes('%') ? (parseFloat(t) / 100) * ch : parseFloat(t) || 0;
                    const name = p.classList.contains('text-marker') ? 'Text' : `Pin ${p.innerText}`;
                    this.targets.push({ x, label: name, part: 'Center', type: 'h' });
                    this.targets.push({ y, label: name, part: 'Center', type: 'v' });
                });
            }

            // 3. Request Component Targets from Iframe (Asynchronous)
            if (DOM.iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REQUEST_SNAP_TARGETS');
            }

            console.log(`[SmartGuide] Local targets collected: ${this.targets.length}`);
        },

        /**
         * Merges targets received from Iframe.
         */
        handleIframeTargets(data) {
            if (!data || !data.targets) return;
            
            // Add iframe targets to the list (Merge with unique label/type/line signature)
            const iframeTargets = data.targets.map(t => ({
                ...t,
                source: 'iframe'
            }));

            // Filter out existing iframe targets to avoid duplication
            const otherTargets = this.targets.filter(t => t.source !== 'iframe');
            this.targets = [...otherTargets, ...iframeTargets];
            console.log(`[SmartGuide] Total targets synchronized: ${this.targets.length}`);
        },

        /**
         * Core snapping calculation logic.
         */
        calculateSnap(x, y, w = 0, h = 0) {
            let snappedX = x, snappedY = y;
            let snapXData = null, snapYData = null;
            const thresh = this.threshold;

            // X-axis Points to check (Left, Center, Right)
            const pointsX = [
                { val: x, part: 'Left' },
                { val: x + w / 2, part: 'Center' },
                { val: x + w, part: 'Right' }
            ];

            for (const t of this.targets) {
                if (t.x === undefined) continue;
                for (const p of pointsX) {
                    if (Math.abs(p.val - t.x) < thresh) {
                        snappedX = x + (t.x - p.val);
                        snapXData = { line: t.x, label: t.label, part: t.part, selfPart: p.part };
                        break;
                    }
                }
                if (snapXData) break;
            }

            // Y-axis Points to check (Top, Middle, Bottom)
            const pointsY = [
                { val: y, part: 'Top' },
                { val: y + h / 2, part: 'Middle' },
                { val: y + h, part: 'Bottom' }
            ];

            for (const t of this.targets) {
                if (t.y === undefined) continue;
                for (const p of pointsY) {
                    if (Math.abs(p.val - t.y) < thresh) {
                        snappedY = y + (t.y - p.val);
                        snapYData = { line: t.y, label: t.label, part: t.part, selfPart: p.part };
                        break;
                    }
                }
                if (snapYData) break;
            }

            return { x: snappedX, y: snappedY, snapXData, snapYData };
        },

        /**
         * Renders guide lines and labels on the SVG layer.
         */
        drawGuides(data) {
            const DOM = window.DOM;
            if (!DOM || !DOM.guideLayer) return;

            let html = '';
            const labelStyle = `fill: #ff4757; font-size: 11px; font-weight: 600; font-family: 'Inter', sans-serif;`;
            const rectStyle = `fill: rgba(31, 35, 41, 0.9); stroke: #ff4757; stroke-width: 0.5; rx: 4;`;

            if (data.snapXData) {
                const { line, label, part, selfPart } = data.snapXData;
                html += `<line x1="${line}" y1="0" x2="${line}" y2="100%" stroke="#ff4757" stroke-width="1.5" stroke-dasharray="4,3" />`;
                
                const labelText = `${label} ${part} ↔ ${selfPart}`;
                const textWidth = labelText.length * 6.5 + 12;
                html += `
                    <g transform="translate(${line + 8}, 40)">
                        <rect x="0" y="0" width="${textWidth}" height="22" style="${rectStyle}" />
                        <text x="6" y="15" style="${labelStyle}">${labelText}</text>
                    </g>`;
            }

            if (data.snapYData) {
                const { line, label, part, selfPart } = data.snapYData;
                html += `<line x1="0" y1="${line}" x2="100%" y2="${line}" stroke="#ff4757" stroke-width="1.5" stroke-dasharray="4,3" />`;
                
                const labelText = `${label} ${part} ↔ ${selfPart}`;
                const textWidth = labelText.length * 6.5 + 12;
                html += `
                    <g transform="translate(40, ${line - 32})">
                        <rect x="0" y="0" width="${textWidth}" height="22" style="${rectStyle}" />
                        <text x="6" y="15" style="${labelStyle}">${labelText}</text>
                    </g>`;
            }

            DOM.guideLayer.innerHTML = html;
        },

        /**
         * Clears all guide lines from the SVG layer.
         */
        clearGuides() {
            const DOM = window.DOM;
            if (DOM && DOM.guideLayer) {
                DOM.guideLayer.innerHTML = '';
            }
        }
    };

    // Register MessageHub handlers if available
    if (window.MessageHub) {
        window.MessageHub.register('LF_SNAP_TARGETS_RESPONSE', (data) => {
            window.SmartGuide.handleIframeTargets(data);
        });
    }

})();
