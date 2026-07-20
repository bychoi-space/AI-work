/**
 * assets/vctrl_iframe_accordion.js
 * Modular rendering engine for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4AccordionScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4AccordionScript = `
(function() {
    console.log("[V4 Accordion] Module loaded.");
    window.renderAccordionBody = function(container) {
        const body = container.querySelector('.v4-accordion-body');
        if (!body) return;
        
        const depthType = container.getAttribute('data-depth-type') || '1depth';
        const currentItemHeight = parseInt(container.getAttribute('data-item-height')) || 36;
        const compId = container.closest('.lf-component')?.id || 'accordion';
        
        if (depthType === '1depth') {
            // Render 1-depth (flat list with radio buttons)
            const targetCount = parseInt(container.getAttribute('data-sub-count')) || 0;
            let subTexts = [];
            let activeIndex = -1;
            try {
                const hierarchyStr = container.getAttribute('data-hierarchy');
                if (hierarchyStr) {
                    const parsed = JSON.parse(hierarchyStr);
                    if (Array.isArray(parsed)) {
                        subTexts = parsed.map((item, idx) => {
                            const t = typeof item === 'string' ? item : item.text;
                            if (typeof item === 'object' && item.active) {
                                activeIndex = idx;
                            }
                            return t;
                        });
                    }
                }
            } catch (e) {}
            
            if (subTexts.length === 0) {
                subTexts = Array.from(body.querySelectorAll('.v4-accordion-item')).map((el, idx) => {
                    const radio = el.querySelector('.v4-accordion-radio');
                    if (radio && (radio.checked || radio.hasAttribute('checked'))) {
                        activeIndex = idx;
                    }
                    const textSpan = el.querySelector('.v4-editable-cell') || el;
                    return textSpan.innerText;
                });
            }
            while (subTexts.length < targetCount) {
                subTexts.push("Sub Item " + (subTexts.length + 1));
            }
            subTexts = subTexts.slice(0, targetCount);
            
            body.innerHTML = '';
            subTexts.forEach((text, i) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'v4-accordion-item';
                itemEl.style.cssText = "padding:8px 12px; font-size:12px; color:#cccccc; font-family:'Inter',sans-serif; outline:none; display:flex; align-items:center; box-sizing:border-box; padding-top:0; padding-bottom:0;";
                itemEl.style.setProperty('height', currentItemHeight + 'px', 'important');
                itemEl.style.setProperty('line-height', currentItemHeight + 'px', 'important');
                if (i < targetCount - 1) {
                    itemEl.style.borderBottom = '1.6px solid rgba(255,255,255,0.05)';
                }
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'accordion-select-' + compId;
                radio.className = 'v4-accordion-radio';
                radio.style.cssText = 'margin-right: 8px; accent-color: #00e5ff; cursor: pointer;';
                if (i === activeIndex) {
                    radio.setAttribute('checked', 'true');
                    radio.checked = true;
                }
                
                const span = document.createElement('span');
                span.className = 'v4-editable-cell';
                span.contentEditable = 'true';
                span.style.cssText = 'outline: none; flex: 1;';
                span.innerText = text;
                if (i === activeIndex) {
                    span.style.textDecoration = 'underline';
                }
                
                const updateState = () => {
                    const items = [];
                    body.querySelectorAll('.v4-accordion-item').forEach((itemNode, idx) => {
                        const r = itemNode.querySelector('.v4-accordion-radio');
                        const s = itemNode.querySelector('.v4-editable-cell');
                        items.push({
                            text: s.innerText,
                            active: r.checked
                        });
                    });
                    container.setAttribute('data-hierarchy', JSON.stringify(items));
                    markDirty();
                };

                radio.addEventListener('change', () => {
                    body.querySelectorAll('.v4-accordion-radio').forEach(r => {
                        if (r !== radio) {
                            r.removeAttribute('checked');
                            r.checked = false;
                            const tSpan = r.nextElementSibling;
                            if (tSpan) tSpan.style.textDecoration = 'none';
                        }
                    });
                    radio.setAttribute('checked', 'true');
                    radio.checked = true;
                    span.style.textDecoration = 'underline';
                    updateState();
                });

                span.addEventListener('input', () => {
                    updateState();
                });
                
                itemEl.appendChild(radio);
                itemEl.appendChild(span);
                body.appendChild(itemEl);
            });
        } else {
            // Render 2-depth (hierarchical tree with 2nd tier radio buttons)
            let hierarchy = [];
            try {
                const hierarchyStr = container.getAttribute('data-hierarchy');
                if (hierarchyStr) {
                    hierarchy = JSON.parse(hierarchyStr);
                }
            } catch (e) {}
            
            if (!Array.isArray(hierarchy) || hierarchy.length === 0) {
                hierarchy = [
                    {
                        text: "1Tier Category 1",
                        children: [
                            { text: "2Tier Subcategory 1.1", active: true },
                            { text: "2Tier Subcategory 1.2", active: false }
                        ]
                    }
                ];
                container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
            }
            
            body.innerHTML = '';
            
            hierarchy.forEach((t1, t1Idx) => {
                const t1Group = document.createElement('div');
                t1Group.className = 'v4-accordion-tier1-group';
                t1Group.style.cssText = 'border-bottom: 1.6px solid rgba(255,255,255,0.05); display: flex; flex-direction: column;';
                
                // 1st Tier Header
                const t1Header = document.createElement('div');
                t1Header.className = 'v4-accordion-tier1-header';
                t1Header.style.cssText = 'padding: 8px 12px; font-size: 12px; font-weight: bold; color: #ffffff; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255,255,255,0.02); height: ' + currentItemHeight + 'px; box-sizing: border-box;';
                
                const t1Span = document.createElement('span');
                t1Span.className = 'v4-editable-cell';
                t1Span.contentEditable = 'true';
                t1Span.style.cssText = 'outline: none; flex: 1;';
                t1Span.innerText = t1.text;
                t1Span.addEventListener('click', (e) => e.stopPropagation());
                t1Span.addEventListener('input', () => {
                    t1.text = t1Span.innerText;
                    container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
                    markDirty();
                });
                
                const t1Arrow = document.createElement('span');
                t1Arrow.className = 'tier-arrow';
                t1Arrow.style.cssText = 'width: 6px; height: 6px; border-right: 1.6px solid #94a3b8; border-bottom: 1.6px solid #94a3b8; transform: rotate(45deg); transition: transform 0.2s; margin-right: 8px; display: inline-block; flex-shrink: 0;';
                
                t1Header.appendChild(t1Span);
                if (t1.children && t1.children.length > 0) {
                    t1Header.appendChild(t1Arrow);
                }
                t1Group.appendChild(t1Header);
                
                // 1st Tier Body (contains 2nd Tier items)
                const t1Body = document.createElement('div');
                t1Body.className = 'v4-accordion-tier1-body';
                t1Body.style.cssText = 'display: flex; flex-direction: column; transition: all 0.2s ease; overflow: hidden;';
                
                let t1Expanded = true;
                t1Header.addEventListener('click', () => {
                    t1Expanded = !t1Expanded;
                    t1Body.style.display = t1Expanded ? 'flex' : 'none';
                    t1Arrow.style.transform = t1Expanded ? 'rotate(45deg)' : 'rotate(-45deg)';
                });
                
                if (t1.children && t1.children.length > 0) {
                    t1.children.forEach((t2, t2Idx) => {
                        const t2Wrapper = document.createElement('div');
                        t2Wrapper.className = 'v4-accordion-tier2-wrapper';
                        t2Wrapper.style.cssText = 'display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255,255,255,0.02);';
                        
                        // 2nd Tier Header (Acts as lowest tier item, has radio button)
                        const t2Header = document.createElement('div');
                        t2Header.className = 'v4-accordion-tier2-header';
                        t2Header.style.cssText = 'padding: 8px 12px 8px 24px; font-size: 11px; color: #e2e8f0; display: flex; align-items: center; cursor: pointer; height: ' + currentItemHeight + 'px; box-sizing: border-box;';
                        
                        const t2Radio = document.createElement('input');
                        t2Radio.type = 'radio';
                        t2Radio.name = 'accordion-select-' + compId;
                        t2Radio.className = 'v4-accordion-radio';
                        t2Radio.style.cssText = 'margin-right: 8px; accent-color: #00e5ff; cursor: pointer;';
                        if (t2.active) {
                            t2Radio.setAttribute('checked', 'true');
                            t2Radio.checked = true;
                        }
                        
                        const t2Span = document.createElement('span');
                        t2Span.className = 'v4-editable-cell';
                        t2Span.contentEditable = 'true';
                        t2Span.style.cssText = 'outline: none; flex: 1;';
                        t2Span.innerText = t2.text;
                        if (t2.active) {
                            t2Span.style.textDecoration = 'underline';
                        }
                        t2Span.addEventListener('click', (e) => e.stopPropagation());
                        t2Span.addEventListener('input', () => {
                            t2.text = t2Span.innerText;
                            container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
                            markDirty();
                        });
                        
                        t2Radio.addEventListener('change', () => {
                            // Uncheck all other radios in the entire accordion
                            container.querySelectorAll('.v4-accordion-radio').forEach(r => {
                                if (r !== t2Radio) {
                                    r.removeAttribute('checked');
                                    r.checked = false;
                                    const tSpan = r.nextElementSibling;
                                    if (tSpan) tSpan.style.textDecoration = 'none';
                                }
                            });
                            t2Radio.setAttribute('checked', 'true');
                            t2Radio.checked = true;
                            t2Span.style.textDecoration = 'underline';
                            
                            // Update active status in hierarchy JSON
                            hierarchy.forEach(category => {
                                if (category.children) {
                                    category.children.forEach(item => {
                                        item.active = (item === t2);
                                    });
                                }
                            });
                            container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
                            markDirty();
                        });
                        
                        t2Header.appendChild(t2Radio);
                        t2Header.appendChild(t2Span);
                        t2Wrapper.appendChild(t2Header);
                        t1Body.appendChild(t2Wrapper);
                    });
                }
                t1Group.appendChild(t1Body);
                body.appendChild(t1Group);
            });
        }
    };
})();
`;
