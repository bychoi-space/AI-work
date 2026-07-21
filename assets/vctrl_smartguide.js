/**
 * vctrl_smartguide.js
 * Independent module for Smart Guide (Snapping) System.
 * Handles calculation, target discovery (async), and guide rendering.
 */

(function() {
    console.log("%c [SMART GUIDE] Module Loaded ", "background: #ff4757; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    window.SmartGuide = {
        targets: [],
        spacingTargets: [], // Spacing용 컴포넌트 전체 Bounding Box
        threshold: 5,
        spacingThreshold: 50, // 50px 간격 임계값
        activeLines: { x: null, y: null },
        clearTimer: null,

        /**
         * Collects snapping targets and spacing targets from canvas and requests from iframe.
         */
        findSnapTargets() {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            const DOM = window.DOM;
            // Clean up any residual guide lines immediately when re-warm/discovery happens without drawing
            if (DOM && DOM.guideLayer) {
                DOM.guideLayer.innerHTML = '';
            }
            if (!DOM || !DOM.iframe) return;

            const cw = parseInt(DOM.iframe.style.width) || 1440;
            const ch = parseInt(DOM.iframe.style.height) || 900;

            // 기존 targets 중 iframe이 아닌 로컬(Canvas, Pin 등) 요소만 리셋하고, 비동기 응답 도착 전까지 iframe targets는 보존하여 레이턴시 해결
            const otherTargets = this.targets.filter(t => t.source === 'iframe');
            this.targets = [...otherTargets];

            // 1. Canvas Center & Edges (for snapping)
            this.targets.push({ x: 0, label: 'Canvas', part: 'Left', type: 'h' });
            this.targets.push({ x: cw / 2, label: 'Canvas', part: 'Center', type: 'h' });
            this.targets.push({ x: cw, label: 'Canvas', part: 'Right', type: 'h' });
            this.targets.push({ y: 0, label: 'Canvas', part: 'Top', type: 'v' });
            this.targets.push({ y: ch / 2, label: 'Canvas', part: 'Middle', type: 'v' });
            this.targets.push({ y: ch, label: 'Canvas', part: 'Bottom', type: 'v' });

            // 1-2. 가상의 Bounding Box로 캔버스 테두리 스페이싱 타겟 정의 (기존 iframe spacingTargets 보존)
            const otherSpacing = this.spacingTargets.filter(t => t.source === 'iframe');
            this.spacingTargets = [
                ...otherSpacing,
                { id: 'canvas-left', label: 'Canvas', left: -1, top: 0, right: 0, bottom: ch, width: 1, height: ch },
                { id: 'canvas-right', label: 'Canvas', left: cw, top: 0, right: cw + 1, bottom: ch, width: 1, height: ch },
                { id: 'canvas-top', label: 'Canvas', left: 0, top: -1, right: cw, bottom: 0, width: cw, height: 1 },
                { id: 'canvas-bottom', label: 'Canvas', left: 0, top: ch, right: cw, bottom: ch + 1, width: cw, height: 1 }
            ];

            // 2. Local Pins & Text Markers (Parent Layer)
            if (DOM.pinsLayer) {
                const pins = DOM.pinsLayer.querySelectorAll('.pin-marker, .text-marker');
                pins.forEach((p, idx) => {
                    if (p.classList.contains('dragging-now')) return;
                    const l = p.style.left || '';
                    const t = p.style.top || '';
                    const x = l.includes('%') ? (parseFloat(l) / 100) * cw : parseFloat(l) || 0;
                    const y = t.includes('%') ? (parseFloat(t) / 100) * ch : parseFloat(t) || 0;
                    const name = p.classList.contains('text-marker') ? 'Text' : `Pin ${p.innerText}`;
                    
                    // Snapping targets
                    this.targets.push({ x, label: name, part: 'Center', type: 'h' });
                    this.targets.push({ y, label: name, part: 'Center', type: 'v' });

                    // Spacing targets
                    this.spacingTargets.push({
                        id: `pin-local-${idx}`,
                        label: name,
                        left: x,
                        top: y,
                        width: 32, // Pin 기준 크기
                        height: 32,
                        right: x + 32,
                        bottom: y + 32
                    });
                });
            }

            // 3. Request Component Targets from Iframe (Asynchronous)
            if (DOM.iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REQUEST_SNAP_TARGETS');
            }

            if (window.DEBUG_MODE) {
                console.log(`[SmartGuide] Local targets collected: snap=${this.targets.length}, spacing=${this.spacingTargets.length}`);
            }
        },

        /**
         * Merges targets received from Iframe.
         */
        handleIframeTargets(data) {
            if (!data) return;
            
            // 1. Snapping targets merge
            if (data.targets) {
                const iframeTargets = data.targets.map(t => ({
                    ...t,
                    source: 'iframe'
                }));
                const otherTargets = this.targets.filter(t => t.source !== 'iframe');
                this.targets = [...otherTargets, ...iframeTargets];
            }

            // 2. Spacing targets merge
            if (data.rects) {
                const iframeSpacing = data.rects.map(r => ({
                    ...r,
                    source: 'iframe'
                }));
                const otherSpacing = this.spacingTargets.filter(t => t.source !== 'iframe');
                this.spacingTargets = [...otherSpacing, ...iframeSpacing];
            }
            
            if (window.DEBUG_MODE) {
                console.log(`[SmartGuide] Total targets synchronized: snap=${this.targets.length}, spacing=${this.spacingTargets.length}`);
            }
        },

        /**
         * Spacing calculation logic (Within 50px threshold to closest targets)
         */
        calculateSpacing(x, y, w, h, thresh, activeId = null) {
            // isArrowKey mode: thresh passed as Infinity to show nearest regardless of distance
            // Default mode: use spacingThreshold (50px)
            if (thresh === undefined) thresh = this.spacingThreshold;
            const active = {
                left: x,
                top: y,
                right: x + w,
                bottom: y + h,
                width: w,
                height: h,
                centerX: x + w / 2,
                centerY: y + h / 2
            };

            let leftMatch = null;
            let rightMatch = null;
            let topMatch = null;
            let bottomMatch = null;

            this.spacingTargets.forEach(t => {
                // Skip the active moving element itself to prevent zero-distance errors
                if (activeId && t.id === activeId) return;

                // In arrow key mode, skip virtual canvas boxes – only show real component distances
                if (thresh === Infinity && t.source === 'canvas') return;

                // [Bug Fix 3] Add 20px buffer to overlap checks.
                // Previously, objects had to strictly share Y/X range to trigger spacing guides.
                // With a buffer, objects nearby but slightly offset in size also show guides (Figma-style).
                const overlapBuffer = 20;

                // Left Spacing (Target on the left of active)
                if (t.right <= active.left) {
                    const overlapY = !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
                    if (overlapY) {
                        const dist = Math.round(active.left - t.right);
                        if (dist >= 0 && dist <= thresh) {
                            if (!leftMatch || dist < leftMatch.dist) {
                                leftMatch = { target: t, dist: dist };
                            }
                        }
                    }
                }
                // Right Spacing (Target on the right of active)
                if (t.left >= active.right) {
                    const overlapY = !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
                    if (overlapY) {
                        const dist = Math.round(t.left - active.right);
                        if (dist >= 0 && dist <= thresh) {
                            if (!rightMatch || dist < rightMatch.dist) {
                                rightMatch = { target: t, dist: dist };
                            }
                        }
                    }
                }
                // Top Spacing (Target above active)
                if (t.bottom <= active.top) {
                    const overlapX = !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
                    if (overlapX) {
                        const dist = Math.round(active.top - t.bottom);
                        if (dist >= 0 && dist <= thresh) {
                            if (!topMatch || dist < topMatch.dist) {
                                topMatch = { target: t, dist: dist };
                            }
                        }
                    }
                }
                // Bottom Spacing (Target below active)
                if (t.top >= active.bottom) {
                    const overlapX = !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
                    if (overlapX) {
                        const dist = Math.round(t.top - active.bottom);
                        if (dist >= 0 && dist <= thresh) {
                            if (!bottomMatch || dist < bottomMatch.dist) {
                                bottomMatch = { target: t, dist: dist };
                            }
                        }
                    }
                }
            });

            return { leftMatch, rightMatch, topMatch, bottomMatch, active };
        },

        /**
         * Core snapping calculation logic.
         * @param {boolean} isArrowKey - Arrow-key mode: show nearest component distance without threshold
         * @param {string|null} activeId - The ID of the currently moving active element
         */
        calculateSnap(x, y, w = 0, h = 0, isArrowKey = false, activeId = null) {
            let snappedX = x, snappedY = y;
            let snapXData = null, snapYData = null;
            const thresh = this.threshold;

            // Arrow key mode: skip alignment snapping (distracting for 1px moves)
            if (!isArrowKey) {
                // Prioritize targets: Put Row and Col targets first so they snap first
                const sortedTargets = [...this.targets].sort((a, b) => {
                    const aIsRowCol = a.label && (a.label.includes('Row ') || a.label.includes('Col '));
                    const bIsRowCol = b.label && (b.label.includes('Row ') || b.label.includes('Col '));
                    if (aIsRowCol && !bIsRowCol) return -1;
                    if (!aIsRowCol && bIsRowCol) return 1;
                    return 0;
                });

                // X-axis Points to check (Left, Center, Right)
                const pointsX = [
                    { val: x, part: 'Left' },
                    { val: x + w / 2, part: 'Center' },
                    { val: x + w, part: 'Right' }
                ];

                for (const t of sortedTargets) {
                    // Skip targets belonging to the active moving element itself
                    if (activeId && t.id === activeId) continue;
                    
                    if (t.x === undefined) continue;
                    // Apply distance-based filtering (reduced to 150px radius for cleaner dragging, except Canvas)
                    if (t.label !== 'Canvas' && !(t.label && t.label.includes('UI Area'))) {
                        const activeCenterX = x + w / 2;
                        const isRowCol = t.label && (t.label.includes('Row ') || t.label.includes('Col '));
                        const maxRadius = isRowCol ? 250 : 150; // Allow slightly wider radius for query items
                        if (Math.abs(t.x - activeCenterX) > maxRadius) continue;
                    }
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

                for (const t of sortedTargets) {
                    // Skip targets belonging to the active moving element itself
                    if (activeId && t.id === activeId) continue;

                    if (t.y === undefined) continue;
                    // Apply distance-based filtering
                    if (t.label !== 'Canvas' && !(t.label && t.label.includes('UI Area'))) {
                        const activeCenterY = y + h / 2;
                        const isRowCol = t.label && (t.label.includes('Row ') || t.label.includes('Col '));
                        const maxRadius = isRowCol ? 250 : 150;
                        if (Math.abs(t.y - activeCenterY) > maxRadius) continue;
                    }
                    for (const p of pointsY) {
                        if (Math.abs(p.val - t.y) < thresh) {
                            snappedY = y + (t.y - p.val);
                            snapYData = { line: t.y, label: t.label, part: t.part, selfPart: p.part };
                            break;
                        }
                    }
                    if (snapYData) break;
                }
            }

            // Arrow key mode: unlimited spacing threshold, real components only (no canvas virtual boxes)
            // Normal mode: 50px threshold
            const spacingThresh = isArrowKey ? Infinity : undefined;
            const spacing = this.calculateSpacing(snappedX, snappedY, w, h, spacingThresh, activeId);

            return { x: snappedX, y: snappedY, snapXData, snapYData, spacing };
        },

        /**
         * Renders guide lines and labels on the SVG layer.
         */
        drawGuides(data) {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
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

            const htmlList = [html];
            if (data.spacing) {
                this.drawSpacingGuides(data.spacing, htmlList);
            }

            DOM.guideLayer.innerHTML = htmlList.join('');
        },

        /**
         * Renders Figma-style Spacing visual helpers.
         */
        drawSpacingGuides(spacing, htmlList) {
            if (!spacing) return;
            const { leftMatch, rightMatch, topMatch, bottomMatch, active } = spacing;
            
            const lineCol = "#ec4899";
            const badgeBg = "#ec4899";
            const textCol = "#ffffff";
            
            const drawHorizontalSpacing = (match, side) => {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist <= 0) return;
                
                const x1 = side === 'left' ? target.right : active.right;
                const x2 = side === 'left' ? active.left : target.left;
                
                let y = active.centerY;
                if (y < target.top) y = target.top + 6;
                if (y > target.bottom) y = target.bottom - 6;
                
                // Connection line
                htmlList.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${lineCol}" stroke-width="1.2" />`);
                
                // Edge ticks
                htmlList.push(`<line x1="${x1}" y1="${y - 4}" x2="${x1}" y2="${y + 4}" stroke="${lineCol}" stroke-width="1.2" />`);
                htmlList.push(`<line x1="${x2}" y1="${y - 4}" x2="${x2}" y2="${y + 4}" stroke="${lineCol}" stroke-width="1.2" />`);
                
                // Measurement badge
                const cx = (x1 + x2) / 2;
                const label = `${dist}`;
                const textWidth = label.length * 6.5 + 8;
                const rectX = cx - textWidth / 2;
                const rectY = y - 8;
                
                htmlList.push(`
                    <g>
                        <rect x="${rectX}" y="${rectY}" width="${textWidth}" height="16" rx="3" fill="${badgeBg}" />
                        <text x="${cx}" y="${y + 4.5}" fill="${textCol}" font-size="9px" font-weight="700" text-anchor="middle" font-family="'Inter', sans-serif">${label}</text>
                    </g>
                `);
            };

            const drawVerticalSpacing = (match, side) => {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist <= 0) return;
                
                const y1 = side === 'top' ? target.bottom : active.bottom;
                const y2 = side === 'top' ? active.top : target.top;
                
                let x = active.centerX;
                if (x < target.left) x = target.left + 6;
                if (x > target.right) x = target.right - 6;
                
                // Connection line
                htmlList.push(`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${lineCol}" stroke-width="1.2" />`);
                
                // Edge ticks
                htmlList.push(`<line x1="${x - 4}" y1="${y1}" x2="${x + 4}" y2="${y1}" stroke="${lineCol}" stroke-width="1.2" />`);
                htmlList.push(`<line x1="${x - 4}" y1="${y2}" x2="${x + 4}" y2="${y2}" stroke="${lineCol}" stroke-width="1.2" />`);
                
                // Measurement badge
                const cy = (y1 + y2) / 2;
                const label = `${dist}`;
                const textWidth = label.length * 6.5 + 8;
                const rectX = x - textWidth / 2;
                const rectY = cy - 8;
                
                htmlList.push(`
                    <g>
                        <rect x="${rectX}" y="${rectY}" width="${textWidth}" height="16" rx="3" fill="${badgeBg}" />
                        <text x="${x}" y="${cy + 4.5}" fill="${textCol}" font-size="9px" font-weight="700" text-anchor="middle" font-family="'Inter', sans-serif">${label}</text>
                    </g>
                `);
            };

            drawHorizontalSpacing(leftMatch, 'left');
            drawHorizontalSpacing(rightMatch, 'right');
            drawVerticalSpacing(topMatch, 'top');
            drawVerticalSpacing(bottomMatch, 'bottom');
        },

        /**
         * Clears all guide lines from the SVG layer.
         * @param {boolean} [forceImmediate=false] If true, clears DOM instantly without delay timer.
         */
        clearGuides(forceImmediate = false) {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            const DOM = window.DOM;
            if (forceImmediate) {
                if (DOM && DOM.guideLayer) {
                    DOM.guideLayer.innerHTML = '';
                }
                return;
            }
            this.clearTimer = setTimeout(() => {
                if (DOM && DOM.guideLayer) {
                    DOM.guideLayer.innerHTML = '';
                }
                this.clearTimer = null;
            }, 250); // 250ms 쾌적한 가이드라인 소멸 피드백
        }
    };

    // Register MessageHub handlers if available
    if (window.MessageHub) {
        window.MessageHub.register('LF_SNAP_TARGETS_RESPONSE', (data) => {
            window.SmartGuide.handleIframeTargets(data);
        });
    }

})();
