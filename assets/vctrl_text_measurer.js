window.v4TextMeasurerScript = `
(function() {
    console.log("[V4 Text Measurer] Module initialized.");
    

    const resizeAtomToFitText = (s) => {
        if (!s) return;
        // Skip resizing if the atom component is already grouped inside an 'lf-group' to prevent layout breakages.
        if (s.closest && s.closest('.lf-group')) {
            return;
        }
        const container = s.querySelector('.v4-checkbox-container, .v4-radio-container');
        if (!container) return;
        
        const boxEl = container.querySelector('.v4-checkbox, .v4-radio');
        if (!boxEl) return;

        const textEnabled = container.getAttribute('data-text-enabled') !== 'false';
        if (textEnabled) {
            const textEl = container.querySelector('.v4-checkbox-text, .v4-radio-text');
            if (textEl) {
                const boxW = parseFloat(boxEl.style.width) || 20;
                const boxH = parseFloat(boxEl.style.height) || 20;
                const textWidth = textEl.scrollWidth || 35;
                const totalWidth = boxW + 8 + textWidth + 8;
                s.style.width = totalWidth + 'px';
                s.style.height = Math.max(30, boxH + 6) + 'px';
            }
        } else {
            if (s.getAttribute('data-resized') === 'true') {
                const parentW = parseFloat(s.style.width) || s.offsetWidth;
                const parentH = parseFloat(s.style.height) || s.offsetHeight;
                boxEl.style.width = parentW + 'px';
                boxEl.style.height = parentH + 'px';
            } else {
                const boxW = parseFloat(boxEl.style.width) || 20;
                const boxH = parseFloat(boxEl.style.height) || 20;
                s.style.width = boxW + 'px';
                s.style.height = boxH + 'px';
            }
        }
        if (typeof window.updateHandles === 'function') window.updateHandles(s);
    };

    const resizeToFitText = (c, isShapeText) => {
        if (!c) return;
        const cell = c.querySelector('.v4-editable-cell') || c.querySelector('.v4-shape-text-content') || c.querySelector('.v4-shape-text-overlay');
        if (!cell) return;

        // Zero-Drift Measurement: Temporarily hide active UI handles before offsetWidth/height query
        const handle = c.querySelector(':scope > .lf-drag-handle');
        const resizer = c.querySelector(':scope > .lf-resizer');
        const delTrigger = c.querySelector(':scope > .lf-delete-trigger');
        
        const origHandleDisplay = handle ? handle.style.display : '';
        const origResizerDisplay = resizer ? resizer.style.display : '';
        const origDelDisplay = delTrigger ? delTrigger.style.display : '';
        
        if (handle) handle.style.setProperty('display', 'none', 'important');
        if (resizer) resizer.style.setProperty('display', 'none', 'important');
        if (delTrigger) delTrigger.style.setProperty('display', 'none', 'important');

        const origW = c.style.width;
        const origH = c.style.height;

        const targetPadding = isShapeText ? '0px' : '4px';
        if (cell.style.padding !== targetPadding) {
            cell.style.setProperty('padding', targetPadding, 'important');
        }

        if (c.style.minWidth !== 'unset') c.style.setProperty('min-width', 'unset', 'important');
        if (c.style.minHeight !== 'unset') c.style.setProperty('min-height', 'unset', 'important');

        let fontTarget = cell;
        const cellFontSize = window.getComputedStyle(cell).fontSize;
        const subEls = cell.querySelectorAll('span, font, strong, p');
        for (let i = 0; i < subEls.length; i++) {
            const subFs = window.getComputedStyle(subEls[i]).fontSize;
            if (subFs && subFs !== cellFontSize) {
                fontTarget = subEls[i];
                break;
            }
        }
        if (fontTarget === cell && subEls.length > 0) {
            fontTarget = subEls[0];
        }
        const compStyle = window.getComputedStyle(fontTarget);
        
        let hasBold = cell.querySelector('strong, b') || false;
        if (!hasBold) {
            const allEls = cell.querySelectorAll('*');
            for (let i = 0; i < allEls.length; i++) {
                const fw = window.getComputedStyle(allEls[i]).fontWeight;
                if (fw === 'bold' || fw === '700' || parseInt(fw) >= 700) {
                    hasBold = true;
                    break;
                }
            }
        }
        if (!hasBold) {
            const cellFw = window.getComputedStyle(cell).fontWeight;
            if (cellFw === 'bold' || cellFw === '700' || parseInt(cellFw) >= 700) {
                hasBold = true;
            }
        }

        // Create an invisible measurement container that retains full HTML innerHTML formatting (strong, b, span, etc.)
        const measureContainer = document.createElement('div');
        measureContainer.style.visibility = 'hidden';
        measureContainer.style.position = 'absolute';
        measureContainer.style.top = '-9999px';
        measureContainer.style.left = '-9999px';
        measureContainer.style.whiteSpace = 'nowrap';
        measureContainer.style.width = 'max-content';
        measureContainer.style.fontFamily = compStyle.fontFamily;
        measureContainer.style.fontSize = compStyle.fontSize;
        measureContainer.style.lineHeight = '1';
        measureContainer.style.letterSpacing = compStyle.letterSpacing;
        measureContainer.style.padding = '0';
        measureContainer.style.margin = '0';
        document.body.appendChild(measureContainer);

        // Extract text containing only user-typed hard newlines
        let rawText = '';
        const paragraphs = cell.querySelectorAll('p');
        let maxLineW = 0;
        
        if (paragraphs.length > 0) {
            paragraphs.forEach(p => {
                measureContainer.innerHTML = p.innerHTML || p.textContent || '&nbsp;';
                const w = Math.ceil(measureContainer.scrollWidth || measureContainer.offsetWidth);
                if (w > maxLineW) maxLineW = w;
            });
            rawText = Array.from(paragraphs).map(p => p.textContent).join('\\n');
        } else {
            const temp = document.createElement('div');
            temp.innerHTML = (cell.innerHTML || '').replace(/<br\\s*\\/?>/gi, '\\n');
            rawText = temp.textContent || '';

            const linesHtml = (cell.innerHTML || '').split(/<br\\s*\\/?>/gi);
            linesHtml.forEach(lineHtml => {
                measureContainer.innerHTML = lineHtml || '&nbsp;';
                const w = Math.ceil(measureContainer.scrollWidth || measureContainer.offsetWidth);
                if (w > maxLineW) maxLineW = w;
            });
        }

        measureContainer.innerText = 'T';
        const singleLineH = Math.ceil(measureContainer.offsetHeight || (parseFloat(compStyle.fontSize) * 1.2));
        
        const textW = maxLineW;
        const normalizedText = rawText.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
        const lineCount = Math.max(1, normalizedText.split('\\n').length);
        const textH = singleLineH * lineCount;
        
        document.body.removeChild(measureContainer);
        
        const isRealTextComp = c.classList.contains('v4-text-box') || c.classList.contains('v4-text-shape') || c.classList.contains('text-marker') || c.classList.contains('pin-marker');

        // Expanded safe padding buffer (22px~26px) to eliminate last-character wrapping when BOLD is applied
        let paddingW = isShapeText ? 24 : 22;
        let paddingH = isShapeText ? 16 : 10;

        let targetW = textW + paddingW;
        let targetH = textH + paddingH;

        if (isRealTextComp || isShapeText) {
            if (lineCount === 1) {
                targetW = textW + (isRealTextComp && !isShapeText ? 22 : paddingW);
                targetH = textH + (isRealTextComp && !isShapeText ? 8 : paddingH);
            } else {
                const fsPx = parseFloat(compStyle.fontSize) || 14;
                targetW = textW + (isRealTextComp && !isShapeText ? 22 : paddingW);
                targetH = fsPx * 1.2 * lineCount + (isRealTextComp && !isShapeText ? 8 : paddingH);
            }
        }

        // Zero-Offset Calibration: Micro-adjust small text rendering to bypass subpixel dropping.
        const fsPx = parseFloat(compStyle.fontSize) || 14;
        let adjustY = '0px';
        if (fsPx <= 11) {
            adjustY = '-0.6px';
        }
        c.style.setProperty('--v4-text-adjust-y', adjustY);

        if (isRealTextComp || isShapeText) {
            if (isShapeText && !isRealTextComp) {
                const currentW = parseFloat(origW) || c.offsetWidth || 120;
                const currentH = parseFloat(origH) || c.offsetHeight || 36;
                
                const newW = Math.max(currentW, targetW) + 'px';
                const newH = Math.max(currentH, targetH, 36) + 'px';
                if (origW !== newW) c.style.width = newW;
                if (origH !== newH) c.style.height = newH;
            } else {
                const finalW = targetW + 'px';
                const finalH = targetH + 'px';
                if (origW !== finalW) c.style.width = finalW;
                if (origH !== finalH) c.style.height = finalH;
            }
        }

        const shape = c.querySelector('.v4-shape');
        if (shape) {
            if (shape.style.width !== '100%') shape.style.width = '100%';
            if (shape.style.height !== '100%') shape.style.height = '100%';
        }
        if (cell.style.width !== '100%') cell.style.width = '100%';
        if (cell.style.height !== '100%') cell.style.height = '100%';

        // Restore UI handle styles to correct layout visibility
        if (handle) handle.style.display = origHandleDisplay;
        if (delTrigger) delTrigger.style.display = origDelDisplay;
        
        if (resizer) {
            const targetDisplay = isRealTextComp ? (isShapeText ? 'block' : 'none') : (origResizerDisplay || 'block');
            if (resizer.style.display !== targetDisplay) {
                resizer.style.setProperty('display', targetDisplay, 'important');
            }
        }
    };

    // Attach to global window object
    window.resizeAtomToFitText = resizeAtomToFitText;
    window.resizeToFitText = resizeToFitText;
})();
`;
