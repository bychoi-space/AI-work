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
    let currentTargets = [];

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
            MessageHub.subscribe('LF_MOLECULE_EXTRACTED', async (data) => {
                const mol = data.moleculeData;
                if (!window.state.projectMetadata) window.state.projectMetadata = {};
                if (!window.state.projectMetadata.molecules) window.state.projectMetadata.molecules = [];
                window.state.projectMetadata.molecules.unshift(mol);

                if (window.renderAtomicLibrary) window.renderAtomicLibrary();

                const saveFn = window.saveProjectMetadata || (typeof saveProjectMetadata === 'function' ? saveProjectMetadata : null);
                if (saveFn) {
                    const success = await saveFn(window.state.currentProject, window.state.projectMetadata);
                    if (success && window.Notification && typeof window.Notification.alert === 'function') {
                        window.Notification.alert(`'${mol.name}'이(가) Components 라이브러리에 추가되었습니다.`, "저장 완료");
                    }
                }
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
        currentTargets = data.targets || [];

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
        currentTargets.forEach(comp => {
            if (isIntersecting(box, comp)) {
                if (!selectedIds.includes(comp.id)) selectedIds.push(comp.id);
            } else {
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

        // Sync visual selection inside iframe via MessageHub
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_MARQUEE_SELECTION', { ids: selectedIds });
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
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_DESELECT_ALL');
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

            // Line Editor Trigger
            if (selectedIds.length === 1 && selectedIds[0].startsWith('conn_')) {
                if (window.switchSidebarTab) window.switchSidebarTab('editor');
                if (DOM.linePropSection) DOM.linePropSection.style.display = 'block';
                if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
                if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
            }
        } else {
            DOM.selectionBar.style.display = 'none';
            if (DOM.alignBar) DOM.alignBar.style.display = 'none';
        }
    };

    const alignSelected = (type) => {
        if (selectedIds.length < 2) return;
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_ALIGN_SELECTED', { ids: selectedIds, type });
        }
    };

    const groupSelected = () => {
        if (selectedIds.length < 2) return;
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_GROUP_SELECTED', { ids: selectedIds });
        }
    };

    const ungroupSelected = () => {
        if (selectedIds.length < 1) return;
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_UNGROUP_SELECTED', { ids: selectedIds });
        }
    };

    const addToMolecules = async () => {
        if (selectedIds.length !== 1) return;
        const name = prompt("새로운 Molecule 명칭을 입력하세요:", "Custom Molecule");
        if (!name) return;
        
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_EXTRACT_MOLECULE', { id: selectedIds[0], name: name });
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
