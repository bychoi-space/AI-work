/**
 * vctrl_grouping.js - Orchestrator Layer
 * Responsibility: Multi-selection, Marquee (Drag-select), and Group Transformations.
 */

window.GroupingManager = (function() {
    console.log("%c [VCTRL GROUPING] Orchestrator Loaded ", "background: #8b5cf6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    let isSelecting = false;
    let startX = 0, startY = 0;
    let marqueeBox = null;
    let selectedIds = [];

    const init = () => {
        // Listen for marquee messages from Core (Iframe)
        if (window.MessageHub) {
            MessageHub.subscribe('LF_MARQUEE_START', (data) => {
                if (window.state.isReadOnly || window.state.tool !== 'select') return;
                startMarquee(data);
            });
            MessageHub.subscribe('LF_MARQUEE_MOVE', (data) => {
                updateMarquee(data);
            });
            MessageHub.subscribe('LF_MARQUEE_END', () => {
                endMarquee();
            });
            MessageHub.subscribe('LF_COMP_SELECTED', (data) => {
                // Single/Multi selection from core
                if (data.shiftKey) {
                    if (selectedIds.includes(data.id)) {
                        selectedIds = selectedIds.filter(id => id !== data.id);
                    } else {
                        selectedIds.push(data.id);
                    }
                } else {
                    selectedIds = [data.id];
                }
                updateSelectionUI();
            });
            MessageHub.subscribe('LF_DESELECT', () => {
                selectedIds = [];
                updateSelectionUI();
            });
        }

        // Bind UI Buttons
        if (window.DOM) {
            if (DOM.btnGroup) DOM.btnGroup.onclick = groupSelected;
            if (DOM.btnUngroup) DOM.btnUngroup.onclick = ungroupSelected;
            if (DOM.btnAddToMolecules) DOM.btnAddToMolecules.onclick = addToMolecules;

            // Alignment Listeners (RESTORED)
            if (DOM.btnAlignLeft) DOM.btnAlignLeft.onclick = () => alignSelected('left');
            if (DOM.btnAlignCenter) DOM.btnAlignCenter.onclick = () => alignSelected('center');
            if (DOM.btnAlignRight) DOM.btnAlignRight.onclick = () => alignSelected('right');
            if (DOM.btnAlignTop) DOM.btnAlignTop.onclick = () => alignSelected('top');
            if (DOM.btnAlignMiddle) DOM.btnAlignMiddle.onclick = () => alignSelected('middle');
            if (DOM.btnAlignBottom) DOM.btnAlignBottom.onclick = () => alignSelected('bottom');
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (window.state && window.state.isReadOnly) return;
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                if (e.shiftKey) ungroupSelected();
                else groupSelected();
            }
        });
    };

    const startMarquee = (data) => {
        const overlay = document.getElementById('pins-layer');
        if (!overlay) return;

        isSelecting = true;
        startX = data.x;
        startY = data.y;

        if (!data.shiftKey) {
            clearSelection();
        }

        marqueeBox = document.createElement('div');
        marqueeBox.className = 'v4-marquee-box';
        marqueeBox.style.position = 'absolute';
        marqueeBox.style.border = '1.6px solid #6366f1';
        marqueeBox.style.background = 'rgba(99, 102, 241, 0.15)';
        marqueeBox.style.zIndex = '99999';
        marqueeBox.style.pointerEvents = 'none';
        marqueeBox.style.left = startX + 'px';
        marqueeBox.style.top = startY + 'px';
        overlay.appendChild(marqueeBox);
    };

    const updateMarquee = (data) => {
        if (!isSelecting || !marqueeBox) return;

        const x = Math.min(startX, data.x);
        const y = Math.min(startY, data.y);
        const w = Math.abs(startX - data.x);
        const h = Math.abs(startY - data.y);

        marqueeBox.style.left = x + 'px';
        marqueeBox.style.top = y + 'px';
        marqueeBox.style.width = w + 'px';
        marqueeBox.style.height = h + 'px';

        checkIntersections({ x, y, w, h });
    };

    const checkIntersections = (box) => {
        const iframe = document.getElementById('main-iframe');
        if (!iframe || !iframe.contentDocument) return;

        const comps = iframe.contentDocument.querySelectorAll('.lf-component');
        
        comps.forEach(comp => {
            const r = comp.getBoundingClientRect();
            const compRect = {
                x: r.left,
                y: r.top,
                w: r.width,
                h: r.height
            };

            if (isIntersecting(box, compRect)) {
                comp.classList.add('selected');
                if (!selectedIds.includes(comp.id)) selectedIds.push(comp.id);
            } else {
                comp.classList.remove('selected');
                selectedIds = selectedIds.filter(id => id !== comp.id);
            }
        });

        // --- Connector Selection Integration ---
        if (window.state.connectors && window.ConnectorEngine) {
            const scale = window.state.transform.scale || 1;
            const svgLayer = document.getElementById('connector-layer');
            const svgRect = svgLayer ? svgLayer.getBoundingClientRect() : { left: 0, top: 0 };
            const connectorIdsToSelect = [];

            window.state.connectors.forEach(conn => {
                const p1 = { x: (conn.start.x * scale) + svgRect.left, y: (conn.start.y * scale) + svgRect.top };
                const p2 = { x: (conn.end.x * scale) + svgRect.left, y: (conn.end.y * scale) + svgRect.top };
                const isIn = (pt) => pt.x >= box.x && pt.x <= box.x + box.w && pt.y >= box.y && pt.y <= box.y + box.h;

                if (isIn(p1) || isIn(p2)) {
                    connectorIdsToSelect.push(conn.id);
                    if (!selectedIds.includes(conn.id)) selectedIds.push(conn.id);
                } else {
                    selectedIds = selectedIds.filter(id => id !== conn.id);
                }
            });
            window.ConnectorEngine.setSelectedIds(connectorIdsToSelect);
        }

        syncWithCore();
    };

    const isIntersecting = (r1, r2) => {
        return !(r2.x > r1.x + r1.w || 
                 r2.x + r2.w < r1.x || 
                 r2.y > r1.y + r1.h ||
                 r2.y + r2.h < r1.y);
    };
    const endMarquee = () => {
        isSelecting = false;
        if (marqueeBox) {
            marqueeBox.remove();
            marqueeBox = null;
        }

        if (selectedIds.length > 0) {
            const iframe = document.getElementById('main-iframe');
            if (selectedIds.length === 1 && iframe && iframe.contentWindow) {
                window.MessageHub.send(iframe.contentWindow, 'LF_SELECT_ID', { id: selectedIds[0] });
            }
        }
    };

    const clearSelection = () => {
        selectedIds = [];
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentDocument) {
            iframe.contentDocument.querySelectorAll('.lf-component.selected').forEach(el => el.classList.remove('selected'));
        }
        syncWithCore();
    };

    const syncWithCore = () => {
        if (window.state) {
            window.state.selectedIds = [...selectedIds];
        }
        updateSelectionUI();
    };

    const updateSelectionUI = () => {
        const DOM = window.DOM;
        if (!DOM || !DOM.selectionBar) return;

        if (selectedIds.length > 0) {
            DOM.selectionBar.style.display = 'flex';
            if (DOM.selectionNumber) DOM.selectionNumber.innerText = selectedIds.length;
            if (DOM.selectionLabel) DOM.selectionLabel.innerText = selectedIds.length > 1 ? 'OBJECTS' : 'OBJECT';
            
            // Show Group button if 2+ selected
            DOM.btnGroup.style.display = selectedIds.length > 1 ? 'flex' : 'none';
            
            // Show Ungroup button if 1 group is selected
            let showUngroup = false;
            if (selectedIds.length === 1) {
                const iframe = document.getElementById('main-iframe');
                const comp = iframe?.contentDocument?.getElementById(selectedIds[0]);
                if (comp && comp.classList.contains('lf-group')) {
                    showUngroup = true;
                }
            }
            DOM.btnUngroup.style.display = showUngroup ? 'flex' : 'none';
            if (DOM.btnAddToMolecules) DOM.btnAddToMolecules.style.display = showUngroup ? 'flex' : 'none';

            // Show Align Bar if 2+ selected (RESTORED)
            if (DOM.alignBar) {
                DOM.alignBar.style.display = selectedIds.length > 1 ? 'block' : 'none';
            }
        } else {
            DOM.selectionBar.style.display = 'none';
            if (DOM.alignBar) DOM.alignBar.style.display = 'none';
        }
    };

    const alignSelected = (type) => {
        if (selectedIds.length < 2) return;
        const iframe = document.getElementById('main-iframe');
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        const items = [];
        
        // 1. Gather all selected elements with their global bounding boxes
        selectedIds.forEach(id => {
            const isMarker = id.startsWith('v4-pin-');
            // Both pins and shapes are now inside the iframe
            let el = doc.getElementById(id);
            if (el) {
                const r = el.getBoundingClientRect();
                items.push({ id, type: isMarker ? 'marker' : 'comp', el, x: r.left, y: r.top, w: r.width, h: r.height });
            }
        });

        if (items.length < 2) return;

        // 2. Determine target alignment value (Global client coords)
        let targetX = 0, targetY = 0;
        const minX = Math.min(...items.map(i => i.x));
        const minY = Math.min(...items.map(i => i.y));
        const maxX = Math.max(...items.map(i => i.x + i.w));
        const maxY = Math.max(...items.map(i => i.y + i.h));

        // 3. Move items using Delta (corrected by zoom scale)
        const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;

        items.forEach(item => {
            let dx = 0, dy = 0;
            switch(type) {
                case 'left':   dx = minX - item.x; break;
                case 'right':  dx = maxX - item.w - item.x; break;
                case 'center': dx = (minX + maxX)/2 - item.w/2 - item.x; break;
                case 'top':    dy = minY - item.y; break;
                case 'bottom': dy = maxY - item.h - item.y; break;
                case 'middle': dy = (minY + maxY)/2 - item.h/2 - item.y; break;
            }

            if (dx === 0 && dy === 0) return;

            const realDx = dx / scale;
            const realDy = dy / scale;

            if (item.type === 'marker') {
                const host = item.el.parentElement;
                const hostRect = host.getBoundingClientRect();
                
                // Calculate new visual center in viewport pixels
                let newVisualCenterX, newVisualCenterY;
                
                if (type === 'left' || type === 'right' || type === 'center') {
                    const targetLeft = item.x + dx;
                    newVisualCenterX = targetLeft + item.w / 2;
                    newVisualCenterY = item.y + item.h / 2; // Keep Y same
                } else {
                    const targetTop = item.y + dy;
                    newVisualCenterX = item.x + item.w / 2;
                    newVisualCenterY = targetTop + item.h / 2;
                }

                // Convert viewport center to host-relative percentage
                const newL = ((newVisualCenterX - hostRect.left) / scale / host.clientWidth) * 100;
                const newT = ((newVisualCenterY - hostRect.top) / scale / host.clientHeight) * 100;
                
                item.el.style.left = newL + '%';
                item.el.style.top = newT + '%';

                // Update State via MessageHub
                const idx = parseInt(item.id.replace('v4-pin-', ''));
                if (window.MessageHub) {
                    MessageHub.send(window, 'LF_UPDATE_PIN_POS', { index: idx, x: newL, y: newT });
                }
            } else {
                const curL = parseInt(item.el.style.left) || 0;
                const curT = parseInt(item.el.style.top) || 0;
                item.el.style.left = (curL + realDx) + 'px';
                item.el.style.top = (curT + realDy) + 'px';
                if (window.markAsDirty) window.markAsDirty();
            }
        });
        
        if (window.V4UndoManager) window.V4UndoManager.saveState();
    };

    const groupSelected = () => {
        if (selectedIds.length < 2) return;
        const iframe = document.getElementById('main-iframe');
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        const host = doc.querySelector('.mobile-content') || doc.querySelector('.page') || doc.querySelector('.artboard') || doc.body;
        const hostRect = host.getBoundingClientRect();
        const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;

        // 1. Gather all selected elements and their global bounding boxes
        const comps = selectedIds.map(id => doc.getElementById(id)).filter(el => el);
        if (comps.length < 2) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const items = comps.map(c => {
            const r = c.getBoundingClientRect();
            minX = Math.min(minX, r.left);
            minY = Math.min(minY, r.top);
            maxX = Math.max(maxX, r.right);
            maxY = Math.max(maxY, r.bottom);
            return { el: c, r, isMarker: c.classList.contains('text-marker') };
        });

        // 2. Calculate Group Position in Base Pixels (relative to host)
        const groupBaseL = (minX - hostRect.left) / scale;
        const groupBaseT = (minY - hostRect.top) / scale;
        const groupBaseW = (maxX - minX) / scale;
        const groupBaseH = (maxY - minY) / scale;

        // 3. Create Group Container
        const groupId = `group-${Date.now()}`;
        const group = doc.createElement('div');
        group.id = groupId;
        group.className = 'lf-component lf-group selected';
        Object.assign(group.style, {
            position: 'absolute',
            left: groupBaseL + 'px',
            top: groupBaseT + 'px',
            width: groupBaseW + 'px',
            height: groupBaseH + 'px',
            background: 'transparent',
            border: 'none',
            zIndex: '1000'
        });

        group.innerHTML = `
            <div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>
            <div class="lf-resizer"></div>
            <div class="lf-delete-trigger">×</div>
        `;

        host.appendChild(group);

        // 4. Move components into group and adjust positions
        items.forEach(item => {
            if (item.isMarker) {
                // Calculate center in viewport
                const cx = item.r.left + item.r.width / 2;
                const cy = item.r.top + item.r.height / 2;
                // Relative to group in base pixels
                const rx = (cx - minX) / scale;
                const ry = (cy - minY) / scale;
                // Set as percentage of group
                item.el.style.left = (rx / groupBaseW * 100) + '%';
                item.el.style.top = (ry / groupBaseH * 100) + '%';
            } else {
                // Relative to group in base pixels
                const rx = (item.r.left - minX) / scale;
                const ry = (item.r.top - minY) / scale;
                item.el.style.left = rx + 'px';
                item.el.style.top = ry + 'px';
            }
            item.el.classList.remove('selected');
            group.appendChild(item.el);
        });

        selectedIds = [groupId];
        updateSelectionUI();
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        window.MessageHub.send(iframe.contentWindow, 'LF_DIRTY');
    };

    const ungroupSelected = () => {
        if (selectedIds.length !== 1) return;
        const iframe = document.getElementById('main-iframe');
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        const group = doc.getElementById(selectedIds[0]);
        if (!group || !group.classList.contains('lf-group')) return;

        const host = doc.querySelector('.mobile-content') || doc.querySelector('.page') || doc.querySelector('.artboard') || doc.body;
        const hostRect = host.getBoundingClientRect();
        const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;

        const children = Array.from(group.children).filter(c => c.classList.contains('lf-component'));
        const newIds = [];

        children.forEach(c => {
            const isMarker = c.classList.contains('text-marker');
            const r = c.getBoundingClientRect(); // Global viewport pos

            if (isMarker) {
                // Calculate absolute center and convert to host-relative %
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const rx = (cx - hostRect.left) / scale;
                const ry = (cy - hostRect.top) / scale;
                c.style.left = (rx / host.clientWidth * 100) + '%';
                c.style.top = (ry / host.clientHeight * 100) + '%';
                
                // Update Parent State for Pins
                const idx = parseInt(c.id.replace('v4-pin-', ''));
                if (window.MessageHub) {
                    MessageHub.send(window, 'LF_UPDATE_PIN_POS', { index: idx, x: parseFloat(c.style.left), y: parseFloat(c.style.top) });
                }
            } else {
                // Calculate absolute top-left and convert to host-relative px
                const rx = (r.left - hostRect.left) / scale;
                const ry = (r.top - hostRect.top) / scale;
                c.style.left = rx + 'px';
                c.style.top = ry + 'px';
            }

            c.classList.add('selected');
            host.appendChild(c);
            newIds.push(c.id);
        });

        group.remove();
        selectedIds = newIds;
        updateSelectionUI();
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        window.MessageHub.send(iframe.contentWindow, 'LF_DIRTY');
    };

    const addToMolecules = async () => {
        if (selectedIds.length !== 1) return;
        const iframe = document.getElementById('main-iframe');
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        const group = doc.getElementById(selectedIds[0]);
        if (!group || !group.classList.contains('lf-group')) return;

        const name = prompt("새로운 Molecule 명칭을 입력하세요:", "Custom Molecule");
        if (!name) return;

        // 1. Clone and Clean HTML
        const clone = group.cloneNode(true);
        clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
        
        // Remove internal IDs to prevent collisions when inserted multiple times
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        // Use the inner HTML to avoid double-component wrapping issues
        const moleculeData = {
            id: 'mol-' + Date.now(),
            name: name,
            category: 'Custom',
            width: group.style.width,
            height: group.style.height,
            isGroup: true,
            previewHtml: `<div style="font-size: 10px; font-weight: 700; color: #6366f1;">${name}</div>`,
            html: clone.innerHTML
        };

        if (!window.state.projectMetadata) window.state.projectMetadata = {};
        if (!window.state.projectMetadata.molecules) {
            window.state.projectMetadata.molecules = [];
        }
        window.state.projectMetadata.molecules.unshift(moleculeData); // Newest at top

        // Update UI immediately
        if (window.renderAtomicLibrary) window.renderAtomicLibrary();

        // 3. Persist
        const saveFn = window.saveProjectMetadata || (typeof saveProjectMetadata === 'function' ? saveProjectMetadata : null);
        if (saveFn) {
            const success = await saveFn(window.state.currentProject, window.state.projectMetadata);
            if (success) {
                // Refresh UI first
                if (window.renderAtomicLibrary) window.renderAtomicLibrary();

                // Show notification safely
                if (window.Notification && typeof window.Notification.alert === 'function') {
                    window.Notification.alert(`'${name}'이(가) Components 라이브러리에 추가되었습니다.`, "저장 완료");
                } else {
                    console.log(`[V4] Component added: ${name}`);
                }
            } else {
                console.error("[V4] Failed to save project metadata.");
            }
        } else {
            console.error("[V4] saveProjectMetadata function not found.");
        }
    };

    const deleteMolecule = async (id, e) => {
        if (e) e.stopPropagation();
        if (!confirm("이 컴포넌트를 삭제하시겠습니까?")) return;

        if (window.state.projectMetadata && window.state.projectMetadata.molecules) {
            window.state.projectMetadata.molecules = window.state.projectMetadata.molecules.filter(m => m.id !== id);
            
            // Update UI immediately
            if (window.renderAtomicLibrary) window.renderAtomicLibrary();

            // Persist
            const saveFn = window.saveProjectMetadata || (typeof saveProjectMetadata === 'function' ? saveProjectMetadata : null);
            if (saveFn) {
                await saveFn(window.state.currentProject, window.state.projectMetadata);
            }
        }
    };

    const renameMolecule = async (id, e) => {
        if (e) e.stopPropagation();
        const molecules = window.state.projectMetadata?.molecules || [];
        const mol = molecules.find(m => m.id === id);
        if (!mol) return;

        const newName = prompt("새로운 컴포넌트 이름을 입력하세요:", mol.name);
        if (newName && newName.trim() && newName !== mol.name) {
            mol.name = newName.trim();
            mol.previewHtml = `<div style="font-size: 10px; font-weight: 700; color: #6366f1;">${mol.name}</div>`;
            
            // Update UI
            if (window.renderAtomicLibrary) window.renderAtomicLibrary();

            // Persist
            const saveFn = window.saveProjectMetadata || (typeof saveProjectMetadata === 'function' ? saveProjectMetadata : null);
            if (saveFn) {
                await saveFn(window.state.currentProject, window.state.projectMetadata);
            }
        }
    };

    return {
        init,
        getSelectedIds: () => selectedIds,
        clearSelection,
        groupSelected,
        ungroupSelected,
        alignSelected,
        addToMolecules,
        deleteMolecule,
        renameMolecule
    };
})();

window.deleteMolecule = (id, e) => window.GroupingManager.deleteMolecule(id, e);
window.renameComponent = (id, e) => window.GroupingManager.renameMolecule(id, e);

// Auto-init when ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure core is ready
    setTimeout(() => window.GroupingManager.init(), 500);
});
