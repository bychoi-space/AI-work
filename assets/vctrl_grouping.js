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
                // Single selection from core also updates our list
                selectedIds = [data.id];
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
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (window.state.isReadOnly) return;
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
        } else {
            DOM.selectionBar.style.display = 'none';
        }
    };

    const groupSelected = () => {
        if (selectedIds.length < 2) return;
        const iframe = document.getElementById('main-iframe');
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        const host = doc.querySelector('.page') || doc.querySelector('.artboard') || doc.body;
        const comps = selectedIds.map(id => doc.getElementById(id)).filter(el => el);

        if (comps.length < 2) return;

        // 1. Calculate Bounding Box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        comps.forEach(c => {
            const t = parseInt(c.style.top) || 0;
            const l = parseInt(c.style.left) || 0;
            minX = Math.min(minX, l);
            minY = Math.min(minY, t);
            maxX = Math.max(maxX, l + c.offsetWidth);
            maxY = Math.max(maxY, t + c.offsetHeight);
        });

        // 2. Create Group Container
        const groupId = `group-${Date.now()}`;
        const group = doc.createElement('div');
        group.id = groupId;
        group.className = 'lf-component lf-group selected';
        Object.assign(group.style, {
            position: 'absolute',
            top: minY + 'px',
            left: minX + 'px',
            width: (maxX - minX) + 'px',
            height: (maxY - minY) + 'px',
            background: 'transparent',
            border: 'none'
        });

        // Add standard handles
        group.innerHTML = `
            <div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>
            <div class="lf-resizer"></div>
            <div class="lf-delete-trigger">×</div>
        `;

        host.appendChild(group);

        // 3. Move components into group
        comps.forEach(c => {
            const ct = parseInt(c.style.top) || 0;
            const cl = parseInt(c.style.left) || 0;
            c.style.top = (ct - minY) + 'px';
            c.style.left = (cl - minX) + 'px';
            c.classList.remove('selected');
            group.appendChild(c);
        });

        selectedIds = [groupId];
        updateSelectionUI();
        window.MessageHub.send(iframe.contentWindow, 'LF_DIRTY');
    };

    const ungroupSelected = () => {
        if (selectedIds.length !== 1) return;
        const iframe = document.getElementById('main-iframe');
        if (!iframe || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;
        const group = doc.getElementById(selectedIds[0]);
        if (!group || !group.classList.contains('lf-group')) return;

        const host = doc.querySelector('.page') || doc.querySelector('.artboard') || doc.body;
        const gt = parseInt(group.style.top) || 0;
        const gl = parseInt(group.style.left) || 0;

        const children = Array.from(group.children).filter(c => c.classList.contains('lf-component'));
        const newIds = [];

        children.forEach(c => {
            const ct = parseInt(c.style.top) || 0;
            const cl = parseInt(c.style.left) || 0;
            c.style.top = (gt + ct) + 'px';
            c.style.left = (gl + cl) + 'px';
            c.classList.add('selected');
            host.appendChild(c);
            newIds.push(c.id);
        });

        group.remove();
        selectedIds = newIds;
        updateSelectionUI();
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
        clone.classList.remove('selected');
        clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
        
        // Remove internal IDs to prevent collisions when inserted multiple times
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        const moleculeData = {
            id: 'mol-' + Date.now(),
            name: name,
            category: 'Custom',
            previewHtml: `<div style="font-size: 10px; font-weight: 700; color: #6366f1;">${name}</div>`,
            html: clone.outerHTML
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
                    window.Notification.alert(`'${name}'이(가) Molecules 라이브러리에 추가되었습니다.`, "저장 완료");
                } else {
                    console.log(`[V4] Molecule added: ${name}`);
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
        if (!confirm("이 Molecule을 삭제하시겠습니까?")) return;

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

    return {
        init,
        getSelectedIds: () => selectedIds,
        clearSelection,
        groupSelected,
        ungroupSelected,
        addToMolecules,
        deleteMolecule
    };
})();

window.deleteMolecule = (id, e) => window.GroupingManager.deleteMolecule(id, e);

// Auto-init when ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure core is ready
    setTimeout(() => window.GroupingManager.init(), 500);
});
