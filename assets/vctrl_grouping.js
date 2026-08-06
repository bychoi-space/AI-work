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
    let selectedIdsIsGroupMap = {};

    const init = () => {
        // Listen for marquee messages from Core (Iframe)
        if (window.MessageHub) {
            MessageHub.subscribe('LF_SHORTCUT_TRIGGERED', (data) => {
                if (data.shortcut === 'group') {
                    groupSelected();
                } else if (data.shortcut === 'ungroup') {
                    ungroupSelected();
                }
            });
            MessageHub.subscribe('LF_SHORTCUT_ALIGN', (data) => {
                alignSelected(data.alignType);
            });
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
            MessageHub.subscribe('LF_UNGROUPED_SYNC_SELECTION', (data) => {
                selectedIds = data.ids || [];
                selectedIdsIsGroupMap = {};
                syncWithCore();
            });
             MessageHub.subscribe('LF_DESELECT', () => {
                 selectedIds = [];
                 selectedIdsIsGroupMap = {};
                 updateSelectionUI();
                 if (typeof window.updateProperties === 'function') {
                     window.updateProperties();
                 }
             });
             MessageHub.subscribe('LF_MOLECULE_EXTRACTED', async (data) => {
                 const mol = data.moleculeData;
                 if (!window.state.globalComponents) window.state.globalComponents = [];
                 window.state.globalComponents.unshift(mol);
 
                 if (window.renderAtomicLibrary) window.renderAtomicLibrary();
 
                 const saveFn = window.saveGlobalComponents || (typeof saveGlobalComponents === 'function' ? saveGlobalComponents : null);
                 if (saveFn) {
                     const success = await saveFn(window.state.globalComponents);
                     if (success && window.Notification && typeof window.Notification.alert === 'function') {
                         window.Notification.alert(`'${mol.name}'이(가) 글로벌 라이브러리에 추가되었습니다.`, "저장 완료");
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
             if (DOM.btnAlignDistributeH) DOM.btnAlignDistributeH.onclick = () => alignSelected('distribute_h');
             if (DOM.btnAlignDistributeV) DOM.btnAlignDistributeV.onclick = () => alignSelected('distribute_v');
         }
 
         // Keyboard Shortcuts
         window.addEventListener('keydown', (e) => {
             if (window.state && window.state.isReadOnly) return;
             if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
                 e.preventDefault();
                 if (e.shiftKey) ungroupSelected();
                 else groupSelected();
             }
             if (e.altKey && ['1','2','3','4','5','6'].includes(e.key)) {
                 e.preventDefault();
                 const typeMap = {
                     '1': 'left',
                     '2': 'center',
                     '3': 'right',
                     '4': 'top',
                     '5': 'middle',
                     '6': 'bottom'
                 };
                 alignSelected(typeMap[e.key]);
             }
         });
     };
 
     const startMarquee = (data) => {
         const overlay = document.getElementById('pins-layer');
         if (!overlay) return;
 
         // Wipes out any prior orphaned marquee boxes from the DOM
         document.querySelectorAll('.v4-marquee-box').forEach(el => el.remove());
 
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
             if (comp.isGroupChild) {
                 // Inner group child components are represented by their top-level parent .lf-group
                 return;
             }
             if (isFullyContained(box, comp)) {
                 if (!selectedIds.includes(comp.id)) selectedIds.push(comp.id);
             } else {
                 selectedIds = selectedIds.filter(id => id !== comp.id);
             }
         });
 
         // --- Connector Selection Integration ---
         if (window.state.connectors && window.ConnectorEngine) {
             const connectorIdsToSelect = [];
             const iframe = document.getElementById('main-iframe');
             const iframeDoc = iframe ? (iframe.contentDocument || iframe.contentWindow.document) : null;
             const host = iframeDoc ? (iframeDoc.querySelector('.mobile-content') || iframeDoc.querySelector('.page') || iframeDoc.body) : null;
             const hostRect = host ? host.getBoundingClientRect() : { left: 0, top: 0 };
             const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
 
             window.state.connectors.forEach(conn => {
                 if (!conn || !conn.start || !conn.end) return;
 
                 let x1 = conn.start.x || 0;
                 let y1 = conn.start.y || 0;
                 let x2 = conn.end.x || 0;
                 let y2 = conn.end.y || 0;
 
                 if (conn.start.targetId && iframeDoc) {
                     const targetEl = iframeDoc.getElementById(conn.start.targetId);
                     if (targetEl) {
                         const r = targetEl.getBoundingClientRect();
                         if (conn.start.side === 'left') { x1 = (r.left - hostRect.left) / scale; y1 = (r.top + r.height/2 - hostRect.top) / scale; }
                         else if (conn.start.side === 'right') { x1 = (r.right - hostRect.left) / scale; y1 = (r.top + r.height/2 - hostRect.top) / scale; }
                         else if (conn.start.side === 'top') { x1 = (r.left + r.width/2 - hostRect.left) / scale; y1 = (r.top - hostRect.top) / scale; }
                         else if (conn.start.side === 'bottom') { x1 = (r.left + r.width/2 - hostRect.left) / scale; y1 = (r.bottom - hostRect.top) / scale; }
                     }
                 }
 
                 if (conn.end.targetId && iframeDoc) {
                     const targetEl = iframeDoc.getElementById(conn.end.targetId);
                     if (targetEl) {
                         const r = targetEl.getBoundingClientRect();
                         if (conn.end.side === 'left') { x2 = (r.left - hostRect.left) / scale; y2 = (r.top + r.height/2 - hostRect.top) / scale; }
                         else if (conn.end.side === 'right') { x2 = (r.right - hostRect.left) / scale; y2 = (r.top + r.height/2 - hostRect.top) / scale; }
                         else if (conn.end.side === 'top') { x2 = (r.left + r.width/2 - hostRect.left) / scale; y2 = (r.top - hostRect.top) / scale; }
                         else if (conn.end.side === 'bottom') { x2 = (r.left + r.width/2 - hostRect.left) / scale; y2 = (r.bottom - hostRect.top) / scale; }
                     }
                 }
 
                 const p1 = { x: x1, y: y1 };
                 const p2 = { x: x2, y: y2 };
                 const isIn = (pt) => pt.x >= box.x && pt.x <= box.x + box.w && pt.y >= box.y && pt.y <= box.y + box.h;
 
                 if (isIn(p1) && isIn(p2)) {
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
 
     const isFullyContained = (r1, r2) => {
        return (r2.x >= r1.x &&
                r2.x + r2.w <= r1.x + r1.w &&
                r2.y >= r1.y &&
                r2.y + r2.h <= r1.y + r1.h);
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
             } else if (selectedIds.length > 1) {
                 if (typeof window.updateProperties === 'function') window.updateProperties();
             }
         }
         document.querySelectorAll('.v4-marquee-box').forEach(el => el.remove());
     };

    const getEffectiveSelectedIds = () => {
        let coreSelected = (window.state && window.state.selectedIds) ? window.state.selectedIds : selectedIds;
        const connSelected = (window.ConnectorEngine && typeof window.ConnectorEngine.getSelectedIds === 'function')
            ? window.ConnectorEngine.getSelectedIds()
            : [];
        if (connSelected && connSelected.length > 0) {
            const merged = new Set([...coreSelected, ...connSelected]);
            return Array.from(merged);
        }
        return coreSelected;
    };

    const setSelectedIds = (ids) => {
        selectedIds = Array.isArray(ids) ? [...ids] : [];
        if (window.state) window.state.selectedIds = [...selectedIds];
        const connIds = selectedIds.filter(id => typeof id === 'string' && id.startsWith('conn_'));
        if (window.ConnectorEngine && typeof window.ConnectorEngine.setSelectedIds === 'function') {
            window.ConnectorEngine.setSelectedIds(connIds);
        }
        updateSelectionUI();
    };

    const clearSelection = () => {
        selectedIds = [];
        if (window.state) window.state.selectedIds = [];
        selectedIdsIsGroupMap = {};
        if (window.ConnectorEngine && typeof window.ConnectorEngine.clearSelection === 'function') {
            window.ConnectorEngine.clearSelection();
        }
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
        const selectionBar = document.getElementById('selection-actions-bar');
        if (!selectionBar) return;

        const btnGroup = document.getElementById('btn-group-action');
        const btnUngroup = document.getElementById('btn-ungroup-action');
        const btnAddToMolecules = document.getElementById('btn-add-molecules-action');
        const selectionNumber = document.getElementById('selection-number');
        const selectionLabel = document.getElementById('selection-label');
        const alignBar = document.getElementById('selection-align-bar');

        const activeIds = getEffectiveSelectedIds();

        if (activeIds.length > 0) {
            // Show Group button if 2+ selected
            if (btnGroup) {
                if (activeIds.length > 1) {
                    btnGroup.style.setProperty('display', 'flex', 'important');
                } else {
                    btnGroup.style.setProperty('display', 'none', 'important');
                }
            }
            
            // Show Ungroup button if 1 group is selected
            let showUngroup = false;
            if (activeIds.length === 1) {
                if (selectedIdsIsGroupMap[activeIds[0]]) {
                    showUngroup = true;
                }
            }
            if (btnUngroup) {
                if (showUngroup) {
                    btnUngroup.style.setProperty('display', 'flex', 'important');
                } else {
                    btnUngroup.style.setProperty('display', 'none', 'important');
                }
            }
            if (btnAddToMolecules) {
                if (showUngroup) {
                    btnAddToMolecules.style.setProperty('display', 'flex', 'important');
                } else {
                    btnAddToMolecules.style.setProperty('display', 'none', 'important');
                }
            }

            if (selectionBar) {
                selectionBar.style.setProperty('display', 'flex', 'important');
            }

            if (selectionNumber) selectionNumber.innerText = activeIds.length;
            if (selectionLabel) selectionLabel.innerText = activeIds.length > 1 ? 'OBJECTS' : 'OBJECT';

            // Show Align Bar if 2+ selected (RESTORED)
            if (alignBar) {
                alignBar.style.display = activeIds.length > 1 ? 'block' : 'none';
            }

            // Line Editor Trigger
            if (activeIds.length === 1 && activeIds[0].startsWith('conn_')) {
                const linePropSection = document.getElementById('line-editor-section');
                const shapePropSection = document.getElementById('shape-inspector-section');
                const textPropSection = document.getElementById('text-editor-section');
                if (linePropSection) linePropSection.style.display = 'block';
                if (shapePropSection) shapePropSection.style.display = 'none';
                if (textPropSection) textPropSection.style.display = 'none';
            }
        } else {
            selectionBar.style.display = 'none';
            if (alignBar) alignBar.style.display = 'none';
        }
    };

    const alignSelected = (type) => {
        const activeIds = getEffectiveSelectedIds();
        if (activeIds.length < 2) return;
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_ALIGN_SELECTED', { ids: activeIds, alignType: type });
        }
    };

    const groupSelected = () => {
        const activeIds = getEffectiveSelectedIds();
        if (activeIds.length < 2) return;
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_GROUP_SELECTED', { ids: activeIds });
        }
    };

    const ungroupSelected = () => {
        const activeIds = getEffectiveSelectedIds();
        if (activeIds.length < 1) return;
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_UNGROUP_SELECTED', { ids: activeIds });
        }
    };

    const addToMolecules = async () => {
        const activeIds = getEffectiveSelectedIds();
        if (activeIds.length !== 1) return;
        const name = prompt("새로운 Molecule 명칭을 입력하세요:", "Custom Molecule");
        if (!name) return;
        
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_EXTRACT_MOLECULE', { id: activeIds[0], name: name });
        }
    };

    const deleteMolecule = async (id, e) => {
        if (e) e.stopPropagation();
        if (!confirm("이 컴포넌트를 삭제하시겠습니까?")) return;

        if (window.state.globalComponents) {
            window.state.globalComponents = window.state.globalComponents.filter(m => m.id !== id);
            
            // Update UI immediately
            if (window.renderAtomicLibrary) window.renderAtomicLibrary();

            // Persist
            const saveFn = window.saveGlobalComponents || (typeof saveGlobalComponents === 'function' ? saveGlobalComponents : null);
            if (saveFn) {
                await saveFn(window.state.globalComponents);
            }
        }
    };

    const renameMolecule = async (id, e) => {
        if (e) e.stopPropagation();
        const molecules = window.state.globalComponents || [];
        const mol = molecules.find(m => m.id === id);
        if (!mol) return;

        const newName = prompt("새로운 컴포넌트 이름을 입력하세요:", mol.name);
        if (newName && newName.trim() && newName !== mol.name) {
            mol.name = newName.trim();
            mol.previewHtml = `<div style="font-size: 10px; font-weight: 700; color: #6366f1;">${mol.name}</div>`;
            
            // Update UI
            if (window.renderAtomicLibrary) window.renderAtomicLibrary();

            // Persist
            const saveFn = window.saveGlobalComponents || (typeof saveGlobalComponents === 'function' ? saveGlobalComponents : null);
            if (saveFn) {
                await saveFn(window.state.globalComponents);
            }
        }
    };

    return {
        init,
        getSelectedIds: () => selectedIds,
        getSelectedIdsIsGroupMap: () => selectedIdsIsGroupMap,
        setSelectedIds,
        clearSelection,
        groupSelected,
        ungroupSelected,
        alignSelected,
        addToMolecules,
        deleteMolecule,
        renameMolecule,
        setSelectedIdsIsGroupMap: (map) => { selectedIdsIsGroupMap = map; },
        setSelectedIds: (ids) => { selectedIds = ids; },
        updateSelectionUI
    };
})();

window.deleteMolecule = (id, e) => window.GroupingManager.deleteMolecule(id, e);
window.renameComponent = (id, e) => window.GroupingManager.renameMolecule(id, e);

// Auto-init when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.GroupingManager.init(), 100);
    });
} else {
    setTimeout(() => window.GroupingManager.init(), 100);
}
