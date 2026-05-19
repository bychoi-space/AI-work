/**
 * vctrl_core.js - Central Orchestrator for LF Editor Studio
 * Responsibility: State management, Message routing, Save/Load orchestration.
 */

console.log("%c [VCTRL CORE] Initializing Engine... ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 1. Global State Management (SSOT)
window.state = {
    currentProject: null,
    activeFile: null,
    projectMetadata: null,
    globalComponents: [],
    tool: 'select',
    transform: { x: 0, y: 0, scale: 1 },
    debugMode: true,
    isDragging: false,
    draggingPinIndex: null,
    dragLayerRect: null,
    startX: 0, startY: 0,
    screens: [],
    connectors: [],
    get isReadOnly() { return (window.ghConfig && window.ghConfig.isReadOnly) || false; },
    hasUnsavedChanges: false,
    isEditing: false,
    editingIndex: -1
};


// --- Core Logic ---
window.loadScreen = async function(fileName) {
    if (state.isEditing && typeof window.closeActiveEditor === 'function') {
        window.closeActiveEditor(true);
    }
    
    if (typeof window.showLoading === 'function') window.showLoading("Loading: " + fileName);
    if (DOM.placeholder) DOM.placeholder.style.display = 'none';
    
    const content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        if (DOM.placeholder) DOM.placeholder.style.display = 'flex';
        if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "파일을 불러오지 못했습니다.";
        return;
    }

    let finalContent = content;
    
    // Inject/Update Styles
    const styleBlock = '<style id="v4-inlined-style">\n' + window.v4Styles + '\n</style>';
    if (finalContent.includes('id="v4-inlined-style"')) {
        finalContent = finalContent.replace(/<style id="v4-inlined-style">[\s\S]*?<\/style>/i, styleBlock);
    } else if (!finalContent.includes('style_v4.css')) {
        finalContent = finalContent.replace('</head>', styleBlock + '\n</head>');
    }

    // Inject/Update Script
    const scriptBlock = '<script id="v4-inlined-script">\n' + window.v4UndoScript + '\n' + window.v4Script + '\n</script>';
    if (finalContent.includes('id="v4-inlined-script"')) {
        finalContent = finalContent.replace(/<script id="v4-inlined-script">[\s\S]*?<\/script>/i, scriptBlock);
    } else {
        finalContent = finalContent.replace('</body>', scriptBlock + '\n</body>');
    }

    // Auto-update JIRA IDENTIFIER for Cover Template
    if (finalContent.includes('cover-jira-id')) {
        const jiraValue = state.projectMetadata.jira || '-';
        finalContent = finalContent.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, `$1${jiraValue}$2`);
    }

    if (DOM.iframe) {
        DOM.iframe.srcdoc = finalContent;
        DOM.iframe.style.display = 'block';
    }

    const loadTimeout = setTimeout(() => {
        if (typeof window.hideLoading === 'function') window.hideLoading();
    }, 3000);

    DOM.iframe.onload = () => {
        clearTimeout(loadTimeout);
        if (typeof window.hideLoading === 'function') window.hideLoading();
        DOM.iframe.onload = null;
        
        // Phase 3: Import legacy description pins ONCE, then render sidebar list
        const legacyPins = (state.activeFile?.meta?.description || []).filter(p => p.type === 'text' || p.text || p.html);
        if (legacyPins.length > 0 && DOM.iframe.contentWindow) {
            setTimeout(() => {
                DOM.iframe.contentWindow.postMessage({ type: 'LF_IMPORT_PINS', pins: legacyPins }, '*');
            }, 80);
        }
        if (typeof window.renderDescriptionList === 'function') {
            setTimeout(window.renderDescriptionList, 100); 
        }
    };

    let scMeta = (state.projectMetadata.screens || {})[fileName] || {};
    if (!scMeta.description) scMeta.description = [];
    if (!scMeta.connectors) scMeta.connectors = [];

    state.activeFile = { 
        name: fileName, 
        size: (content.length / 1024).toFixed(1) + ' KB',
        meta: scMeta
    };
    state.connectors = scMeta.connectors;
    
    if (DOM.fileName) DOM.fileName.innerText = state.projectMetadata.title || state.currentProject;
    
    if (typeof window.updateProperties === 'function') window.updateProperties(); 
    
    if (scMeta.defaultTab === 'description') {
        if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab('description');
    } else {
        if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab('editor'); 
    }
    
    setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 150);
};

window.handleDeleteScreen = async function(name, sha) {
    if (state.isReadOnly) return window.showAuthModal?.();
    const confirmed = await Notification.confirm(
        `'${name}' 스크린을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`, 
        "스크린 삭제", 
        "warning"
    );
    if (!confirmed) return;
    
    if (typeof window.showLoading === 'function') window.showLoading("Deleting: " + name);
    
    const success = await deleteFileFromGitHub(`${state.currentProject}/${name}`, sha);
    if (success) {
        state.screens = state.screens.filter(s => s.name !== name);
        if (state.projectMetadata.screens) delete state.projectMetadata.screens[name];
        if (state.projectMetadata.screenOrder) {
            state.projectMetadata.screenOrder = state.projectMetadata.screenOrder.filter(n => n !== name);
        }
        await saveProjectMetadata(state.currentProject, state.projectMetadata, () => {});
        
        if (state.activeFile && state.activeFile.name === name) {
            location.href = `viewer.html?project=${state.currentProject}`;
        } else {
            location.reload();
        }
    } else {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        window.Notification?.alert("삭제 실패", "오류", "error");
    }
};

window.injectIframeInteractions = function(doc) {
    const style = doc.createElement('style');
    style.textContent = `
        .lf-component { position: absolute !important; box-sizing: border-box !important; user-select: none; }
        .lf-component:hover { outline: 2px solid #00e5ff !important; cursor: pointer !important; }
        .lf-component.selected { outline: 2px solid #00e5ff !important; z-index: 9999 !important; }
        .lf-resizer { width: 12px; height: 12px; background: #00e5ff; border: 2px solid #fff; position: absolute; right: -6px; bottom: -6px; cursor: nwse-resize !important; display: none; border-radius: 2px; z-index: 10000; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
        .lf-delete-trigger { display: none; position: absolute; top: -10px; right: -10px; width: 22px; height: 22px; background: #ef4444; color: #fff; border-radius: 50%; cursor: pointer; align-items: center; justify-content: center; border: 2px solid #fff; z-index: 10001; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer, .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: #6366f1; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; border: 2px solid #fff; z-index: 10001; font-size: 12px; font-weight: 700; }
    `;
    doc.head.appendChild(style);

    let isMoving = false, isResizing = false, activeEl = null, startX, startY, startW, startH, startTop, startLeft;

    doc.addEventListener('mousedown', e => {
        if (state.tool !== 'select') return;
        const deleteBtn = e.target.closest('.lf-delete-trigger');
        const resizer = e.target.closest('.lf-resizer');
        const dragHandle = e.target.closest('.lf-drag-handle');
        const comp = e.target.closest('.lf-component');

        if (deleteBtn && comp) {
            comp.remove(); markAsDirty();
            window.parent.postMessage({ type: 'LF_DESELECT' }, '*');
            e.preventDefault(); e.stopPropagation();
            return;
        }
        if (resizer) {
            isResizing = true; activeEl = resizer.parentElement;
            startX = e.clientX; startY = e.clientY; startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
            e.preventDefault(); e.stopPropagation();
        } else if (dragHandle) {
            isMoving = true; activeEl = dragHandle.closest('.lf-component');
            startX = e.clientX; startY = e.clientY; startTop = activeEl.offsetTop; startLeft = activeEl.offsetLeft;
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            activeEl.classList.add('selected');
            const isPin = activeEl.classList.contains('text-marker');
            window.parent.postMessage({ 
                type: 'LF_COMP_SELECTED', 
                id: activeEl.id, 
                isTable: !!activeEl.querySelector('table'), 
                isShape: !!activeEl.querySelector('.v4-shape'), 
                isIcon: !!activeEl.querySelector('.lf-icon'),
                isPin: isPin,
                pinIndex: isPin ? parseInt(activeEl.id.replace('v4-pin-', '')) : -1
            }, '*');
            e.preventDefault(); e.stopPropagation();
        } else if (comp) {
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            comp.classList.add('selected');
            const isPin = comp.classList.contains('text-marker');
            window.parent.postMessage({ 
                type: 'LF_COMP_SELECTED', 
                id: comp.id, 
                isTable: !!comp.querySelector('table'), 
                isShape: !!comp.querySelector('.v4-shape'), 
                isIcon: !!comp.querySelector('.lf-icon') || !!comp.querySelector('svg'),
                isPin: isPin,
                pinIndex: isPin ? parseInt(comp.id.replace('v4-pin-', '')) : -1
            }, '*');
        } else {
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            window.parent.postMessage({ type: 'LF_DESELECT' }, '*');
        }
    });

    doc.addEventListener('mousemove', e => {
        if (!activeEl) return;
        if (isResizing) {
            activeEl.style.width = `${startW + (e.clientX - startX)}px`;
            activeEl.style.height = `${startH + (e.clientY - startY)}px`;
        } else if (isMoving) {
            activeEl.style.top = `${startTop + (e.clientY - startY)}px`;
            activeEl.style.left = `${startLeft + (e.clientX - startX)}px`;
            
            // Sync for pins if moved via this fallback logic
            if (activeEl.classList.contains('text-marker')) {
                const idx = parseInt(activeEl.id.replace('v4-pin-', ''));
                window.parent.postMessage({ type: 'LF_UPDATE_PIN_POS', index: idx, x: parseFloat(activeEl.style.left), y: parseFloat(activeEl.style.top) }, '*');
            }
        }
    });

    doc.addEventListener('mouseup', () => { if (activeEl) markAsDirty(); isMoving = false; isResizing = false; activeEl = null; });
};

window.insertAtomicComponent = function(type, name) {
    if (state.isReadOnly) return window.showAuthModal?.();
    if (!state.activeFile) return window.Notification?.alert("Please select a screen first.", "Notice", "warning");
    
    let contentHtml = '';
    const id = `lf-comp-${Date.now()}`;
    let defaultStyle = { width: '120px', height: '100px' };

    if (name === 'LF Logo') {
        contentHtml = `<div class="v4-logo-img lf-icon" style="width:100%; height:100%; background-image: url('https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png'); background-size: contain; background-position: center; background-repeat: no-repeat; pointer-events: none;"></div>`;
        defaultStyle = { width: '140px', height: '40px' };
    } else if (name === 'Primary Button') {
        contentHtml = `<div style="background:#00e5ff; color:#000; border:none; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:bold; font-size:14px; box-shadow:0 4px 15px rgba(0,229,255,0.3); pointer-events:none;">BUTTON</div>`;
        defaultStyle = { width: '120px', height: '36px' };
    } else if (name === 'LF Discount') {
        contentHtml = `<div style="color:#E02020; font-size:24px; font-weight:800; font-family:sans-serif; text-align:center; pointer-events:none; line-height:1.2;">20%</div>`;
        defaultStyle = { width: '60px', height: '30px' };
    } else if (type === 'icon') {
        if (name === 'Arrow Left') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
        } else if (name === 'Arrow Right') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        } else if (name === 'Arrow Up') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
        } else if (name === 'Arrow Down') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        } else if (name === 'Close X') {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else if (name === 'Check Box') {
            contentHtml = `<div class="v4-checkbox lf-icon" style="width:100%; height:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); border-radius:6px; display:flex; align-items:center; justify-content:center; position:relative;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%;"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
        } else if (name === 'Radio Button') {
            contentHtml = `<div class="v4-radio lf-icon" style="width:100%; height:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center;"><div style="width:45%; height:45%; background:#ffffff; border-radius:50%;"></div></div>`;
        } else if (name === 'Share Premium') {
            contentHtml = `<div class="lf-icon" style="width:100%; height:100%; background-image: url('https://img.lfmall.co.kr/file/WAS/apps/2023/mfront/product/iconShare@2x.png'); background-size: contain; background-position: center; background-repeat: no-repeat; padding: 8px; box-sizing: border-box; background-origin: content-box; background-clip: content-box; pointer-events: none;"></div>`;
        } else if (name.startsWith('Cust ')) {
            const iconClass = 'lf-' + name.toLowerCase().replace(' ', '-');
            contentHtml = `<div class="lf-icon ${iconClass}"></div>`;
        } else if (name.startsWith('Rv ')) {
            const iconClass = 'lf-' + name.toLowerCase().replace(' ', '-');
            contentHtml = `<div class="lf-icon ${iconClass}"></div>`;
        } else {
            const iconClass = name.toLowerCase().split(' ')[0];
            contentHtml = `<div class="lf-icon lf-icon-${iconClass}" style="filter: brightness(0);"></div>`;
        }
        defaultStyle = { width: '40px', height: '40px' };
    }

    if (DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
        MessageHub.send(DOM.iframe.contentWindow, 'LF_INSERT_V4_COMP', { id, html: contentHtml, style: defaultStyle });
    }
};

// Note: insertV4ComponentById is now handled by vctrl_v4_addon.js for modularity.

window.getCascadedPosition = function(startX = 120, startY = 300) {
    let x = startX, y = startY;
    const step = 25;
    const list = state.activeFile?.meta.description || [];
    let isOccupied = true;
    let attempts = 0;
    while (isOccupied && attempts < 15) {
        isOccupied = list.some(item => item.type === 'text' && Math.abs(item.x - x) < 20 && Math.abs(item.y - y) < 20);
        if (isOccupied) { x += step; y += step; attempts++; if (x > 340 || y > 750) { x = startX; y = startY; break; } }
    }
    return { x, y };
};



window.handleTextCreation = function() {
    if (state.isReadOnly) return window.showAuthModal?.();
    if (!state.activeFile) return window.Notification?.alert("스크린을 선택해주세요.", "알림", "warning");
    
    if (!state.activeFile.meta.description) {
        state.activeFile.meta.description = [];
    }
    
    const newIdx = state.activeFile.meta.description.length;
    state.activeFile.meta.description.push({
        text: "Edit Text",
        html: "<div class=\"v4-editable-cell\" contenteditable=\"true\" style=\"outline:none; color:#000000; padding:2px 4px; display:block; text-align:left;\">Edit Text</div>",
        x: 670,
        y: 430,
        standardized: true
    });
    
    if (typeof window.renderDescriptionList === 'function') {
        window.renderDescriptionList();
    }
    
    if (typeof window.insertV4ComponentById === 'function') {
        window.insertV4ComponentById('v4-tool-text', newIdx);
    } else {
        console.error("[V4 Core] insertV4ComponentById not available for Text Creation.");
    }
    markAsDirty();
};

window.getIframeHTML = async function() {
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (!isFileProtocol) {
        try {
            if (DOM.iframe && DOM.iframe.contentDocument) {
                const doc = DOM.iframe.contentDocument;
                const clone = doc.documentElement.cloneNode(true);
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
                return "<!DOCTYPE html>\n" + clone.outerHTML;
            }
        } catch (e) {
            console.warn("[Security] Direct iframe access failed, switching to message fallback.");
        }
    }

    return new Promise((resolve) => {
        const handler = (e) => {
            if (e.data.type === 'LF_SAVE_CONTENT_RESPONSE') {
                window.removeEventListener('message', handler);
                resolve(e.data.html);
            }
        };
        window.addEventListener('message', handler);
        if (DOM.iframe && DOM.iframe.contentWindow) {
            DOM.iframe.contentWindow.postMessage({ type: 'LF_REQUEST_SAVE_CONTENT' }, '*');
        } else {
            window.removeEventListener('message', handler);
            resolve(null);
        }
        setTimeout(() => {
            window.removeEventListener('message', handler);
            resolve(null);
        }, 2500);
    });
};

window.handleGlobalSave = async function() {
    const overlay = document.getElementById('save-overlay');
    try {
        if (state.isReadOnly) return window.showAuthModal?.();
        
        if (state.isEditing && typeof window.closeActiveEditor === 'function') {
            window.closeActiveEditor(true);
        }
        
        const btn = document.getElementById('btn-global-save');
        if (!btn || btn.disabled) return;

        // Show premium glassmorphic lock overlay
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.opacity = '0';
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
        }

        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">save</span> 저장 중..<span id="save-loading-bar" style="position:absolute; left:0; bottom:0; height:3px; width:0%; background:rgba(255,255,255,0.9); border-radius:0 0 8px 8px; transition:width 2.5s cubic-bezier(0.4,0,0.2,1);"></span>`;
        
        requestAnimationFrame(() => {
            const bar = document.getElementById('save-loading-bar');
            if (bar) bar.style.width = '90%';
        });

        const projectMeta = {
            title: document.getElementById('viewer-meta-title')?.value || '',
            assignee: document.getElementById('viewer-meta-assignee')?.value || '',
            developer: document.getElementById('viewer-meta-developer')?.value || '',
            period: document.getElementById('viewer-meta-period')?.value || '',
            jira: document.getElementById('viewer-meta-jira')?.value || ''
        };

        let htmlContent = await getIframeHTML();
        
        if (htmlContent && htmlContent.includes('cover-jira-id')) {
            const jiraValue = projectMeta.jira || '-';
            htmlContent = htmlContent.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, `$1${jiraValue}$2`);
        }

        const activeFileName = state.activeFile ? state.activeFile.name : null;

        const success = await updateScreenMetadata(state.currentProject, activeFileName, { 
            projectMeta, 
            htmlContent,
            description: state.activeFile ? state.activeFile.meta.description : [],
            existingMetadata: state.projectMetadata
        }, () => {});

        const bar = document.getElementById('save-loading-bar');
        if (bar) { bar.style.transition = 'width 0.3s ease'; bar.style.width = '100%'; }

        await new Promise(r => setTimeout(r, 350));

        // Hide overlay smoothly on completion
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        }

        if (success) {
            markAsClean();
            Object.assign(state.projectMetadata, projectMeta);
            if (projectMeta.title && DOM.fileName) DOM.fileName.innerText = projectMeta.title;
            
            btn.style.setProperty('background', 'linear-gradient(135deg, #22c55e, #16a34a)', 'important');
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">check_circle</span> 저장 완료`;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.removeProperty('background');
                btn.style.position = '';
                btn.style.overflow = '';
                btn.disabled = false;
            }, 1500);
        } else {
            throw new Error("GitHub API 반영에 실패했습니다.");
        }
    } catch (err) {
        console.error("[Save Error]", err);
        // Hide overlay smoothly on error
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        }
        const btn = document.getElementById('btn-global-save');
        if (btn) {
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">error</span> 저장 실패`;
            btn.style.setProperty('background', '#ef4444', 'important');
            setTimeout(() => {
                btn.innerHTML = `<span class="material-icons-outlined" style="font-size:13px;">save</span> 전체 저장`;
                btn.style.removeProperty('background');
                btn.style.position = '';
                btn.style.overflow = '';
                btn.disabled = false;
            }, 1500);
        }
        if (window.Notification) window.Notification.alert('저장 중 오류가 발생했습니다: ' + err.message, '오류', 'error');
    }
};

// --- State Management ---
window.MessageHub = {
    handlers: {},
    
    // Support multiple subscribers for the same message type
    subscribe(type, callback) {
        if (!this.handlers[type]) this.handlers[type] = [];
        this.handlers[type].push(callback);
    },

    register(type, callback) {
        console.warn(`[MessageHub] register() is deprecated. Use subscribe() instead.`);
        this.subscribe(type, callback);
    },

    init() {
        window.addEventListener('message', (e) => {
            const data = e.data;
            if (!data || !data.type) return;
            
            if (window.DEBUG_MODE) {
                console.log(`%c[MessageHub] IN: ${data.type}`, "color: #10b981;", data);
            }

            // Internal engine hooks
            if (data.type === 'LF_SNAP_START') {
                if (window.SmartGuide) window.SmartGuide.findSnapTargets();
            } else if (data.type === 'LF_SNAP_REQUEST') {
                const DOM = window.DOM;
                if (window.SmartGuide && DOM && DOM.iframe && DOM.iframe.contentWindow) {
                    const snap = window.SmartGuide.calculateSnap(data.x, data.y, data.w, data.h);
                    window.SmartGuide.drawGuides(snap);
                    MessageHub.send(DOM.iframe.contentWindow, 'LF_SNAP_RESPONSE', snap);
                }
            } else if (data.type === 'LF_SNAP_END') {
                if (window.SmartGuide) window.SmartGuide.clearGuides();
            } else if (data.type === 'LF_RESTORE_CONNECTORS') {
                if (window.state && data.connectors) {
                    window.state.connectors = data.connectors;
                    if (window.ConnectorEngine) window.ConnectorEngine.redrawAll();
                }
            } else if (data.type === 'LF_UPDATE_PIN_POS') {
                if (window.state && window.state.activeFile && window.state.activeFile.meta.description) {
                    const pin = window.state.activeFile.meta.description[data.index];
                    if (pin) {
                        pin.x = data.x;
                        pin.y = data.y;
                        if (data.standardized) pin.standardized = true;
                        markAsDirty();
                    }
                }
            } else if (data.type === 'LF_DELETE_PIN') {
                if (window.state && window.state.activeFile && window.state.activeFile.meta.description) {
                    window.state.activeFile.meta.description.splice(data.index, 1);
                    if (typeof window.renderDescriptionList === 'function') {
                        window.renderDescriptionList(window.state.activeFile.meta.description);
                    }
                    
                    // Trigger child iframe to re-order and re-index all remaining text-markers
                    const DOM = window.DOM;
                    if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                        MessageHub.send(DOM.iframe.contentWindow, 'LF_REORDER_PINS', {});
                    }
                    
                    markAsDirty();
                }
            } else if (data.type === 'LF_COMP_SELECTED') {
                state.isEditing = true;
                state.editingIndex = data.id;
                if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab('editor');
                if (typeof window.updateProperties === 'function') window.updateProperties(data);
            } else if (data.type === 'LF_SPACE_DOWN') {
                const DOM = window.DOM;
                if (DOM && DOM.canvas) DOM.canvas.classList.add('hand-active');
                if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                window.state.isHandMode = true;
            } else if (data.type === 'LF_SPACE_UP') {
                const DOM = window.DOM;
                if (DOM && DOM.canvas) DOM.canvas.classList.remove('hand-active');
                if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
                window.state.isHandMode = false;
            }

            // Call all registered subscribers
            if (this.handlers[data.type]) {
                this.handlers[data.type].forEach(callback => {
                    try {
                        callback(data);
                    } catch (err) {
                        console.error(`[MessageHub] Error in handler for "${data.type}":`, err);
                    }
                });
            }
        });
        console.log("[MessageHub] Central message listener active (V2 Modular).");
    },

    send(targetWindow, type, data = {}) {
        if (!targetWindow || !targetWindow.postMessage) {
            console.error("[MessageHub] Invalid target for postMessage.");
            return;
        }
        if (window.DEBUG_MODE) {
            console.log(`%c[MessageHub] OUT: ${type}`, "color: #3b82f6;", data);
        }
        targetWindow.postMessage({ type, ...data }, '*');
    }
};

// --- Virtual Undo Manager Proxy (Parent to Child bridge) ---
window.V4UndoManager = {
    saveState: function() {
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            MessageHub.send(iframe.contentWindow, 'LF_SAVE_UNDO');
        }
    },
    undo: function() {
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            MessageHub.send(iframe.contentWindow, 'LF_TRIGGER_UNDO');
        }
    }
};

// 3. Central Event Helpers
window.markAsDirty = function() {
    // Sync connectors to iframe for Undo support
    const iframe = document.getElementById('main-iframe');
    if (iframe && iframe.contentWindow && window.state && window.state.connectors) {
        MessageHub.send(iframe.contentWindow, 'LF_SYNC_CONNECTORS', { connectors: window.state.connectors });
    }

    if (state.hasUnsavedChanges) return;
    state.hasUnsavedChanges = true;
    console.log("[Status] Unsaved changes detected.");

    // UI Feedback
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) {
        btnSave.style.boxShadow = "0 0 20px rgba(0, 229, 255, 0.6)";
    }
};


window.markAsClean = function() {
    state.hasUnsavedChanges = false;
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) {
        btnSave.style.boxShadow = "";
    }
};

window.checkUnsavedChanges = async function() {
    if (!state.hasUnsavedChanges) return true;
    const confirmed = await Notification.confirm("저장되지 않은 수정사항이 있습니다. 무시하고 이동하시겠습니까?", "알림", "warning");
    if (confirmed) {
        markAsClean();
        return true;
    }
    return false;
};

// 5. Navigation Protection
window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});


// 6. Initial Bootstrap
window.checkEnvironment = function() {
    if (window.location.protocol === 'file:') {
        console.warn("[ENV] Running on file:// protocol. Direct iframe DOM access is blocked. Using MessageHub.");
    }
};

window.init = async function() {
    try {
        console.log("[INIT] Initialization started...");
        checkEnvironment();

        const params = new URLSearchParams(window.location.search);
        let project = params.get('project') || 'Default_Project';
        let fileName = params.get('file');

        state.currentProject = project;
        console.log("[INIT] Target Project:", project);

        // Fetch data
        const [contents, metadata, globalComps] = await Promise.all([
            listContents(project),
            fetchProjectMetadata(project),
            (typeof fetchGlobalComponents === 'function') ? fetchGlobalComponents() : Promise.resolve([])
        ]);
        state.projectMetadata = metadata || {};
        state.globalComponents = globalComps || [];

        
        const repoScreens = (contents || []).filter(i => i.type === 'file' && i.name.endsWith('.html'));
        const order = state.projectMetadata.screenOrder || [];
        const sortedScreens = repoScreens.sort((a,b) => {
            const indexA = order.indexOf(a.name);
            const indexB = order.indexOf(b.name);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        state.screens = sortedScreens;
        
        if (!fileName && state.screens.length > 0) {
            fileName = state.screens[0].name;
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('file', fileName);
            window.history.replaceState({}, '', newUrl);
        }

        if (typeof renderScreenList === 'function') renderScreenList(state.screens, fileName);
        if (typeof renderAtomicLibrary === 'function') renderAtomicLibrary();
        if (typeof initQuillEditor === 'function') initQuillEditor();

        if (fileName) {
            await loadScreen(fileName);
        } else {
            if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "프로젝트 스크린을 추가해주세요.";
            if (DOM.btnAddScreen) DOM.btnAddScreen.classList.add('pulse-attention');
        }

        // --- ATTACH GLOBAL LISTENERS ---
        console.log("[INIT] Attaching global listeners...");
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest('#btn-global-save')) {
                handleGlobalSave();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (state.isReadOnly) return;
            // Ignore if typing in editable areas, input, select, textarea
            if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                console.log("[V4 Core] Parent Ctrl+Z caught. Triggering child undo.");
                if (window.V4UndoManager) window.V4UndoManager.undo();
            }
        });
        
        if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => {
            const collapsed = DOM.sidebarLeft.classList.toggle('collapsed');
            DOM.btnToggleLeft.querySelector('span').innerText = collapsed ? 'chevron_right' : 'chevron_left';
            setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 400);
        };
        if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => {
            const collapsed = DOM.sidebarRight.classList.toggle('collapsed');
            DOM.btnToggleRight.querySelector('span').innerText = collapsed ? 'chevron_left' : 'chevron_right';
            setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 400);
        };

        if (DOM.btnFullscreen) DOM.btnFullscreen.onclick = () => { if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(); };
        if (DOM.btnFullscreenExit) DOM.btnFullscreenExit.onclick = () => { if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true); };

        DOM.tabBtns.forEach(btn => {
            btn.onclick = () => { if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab(btn.dataset.tab); };
        });

        // RESTORED: Sidebar Tool Buttons (Text, etc.)
        if (DOM.sidebarToolBtns) {
            DOM.sidebarToolBtns.forEach(btn => {
                const tool = btn.dataset.tool;
                if (tool) {
                    btn.onclick = () => {
                        if (tool === 'text') {
                            if (typeof window.handleTextCreation === 'function') window.handleTextCreation();
                        } else if (typeof window.setTool === 'function') {
                            window.setTool(tool);
                        }
                    };
                }
            });
        }
        
        // RESTORED: Top Bar Tool Buttons
        if (DOM.btnSelect) DOM.btnSelect.onclick = () => window.setTool?.('select');
        if (DOM.btnHand) DOM.btnHand.onclick = () => window.setTool?.('hand');

        // RESTORED: Add Screen Modal Logic
        if (DOM.btnAddScreen) {
            DOM.btnAddScreen.onclick = () => {
                if (state.isReadOnly) return window.showAuthModal?.();
                if (DOM.addScreenModal) DOM.addScreenModal.classList.add('active');
            };
        }
        if (DOM.btnCancelAdd) {
            DOM.btnCancelAdd.onclick = () => {
                if (DOM.addScreenModal) DOM.addScreenModal.classList.remove('active');
            };
        }
        
        // Template Selection Logic
        document.querySelectorAll('.template-card').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                if (DOM.newScreenName) {
                    const defaultName = card.dataset.defaultName || "new_screen";
                    DOM.newScreenName.value = defaultName + "_" + Math.floor(Math.random() * 1000);
                }
            };
        });

        if (DOM.btnSubmitAdd) {
            DOM.btnSubmitAdd.onclick = async () => {
                const selectedCard = document.querySelector('.template-card.selected');
                if (!selectedCard) return window.Notification?.alert("템플릿을 선택해주세요.", "알림", "warning");
                
                const screenName = DOM.newScreenName?.value?.trim();
                if (!screenName) return window.Notification?.alert("화면 이름을 입력해주세요.", "알림", "warning");

                DOM.btnSubmitAdd.disabled = true;
                DOM.btnSubmitAdd.innerText = "생성 중..";

                const template = selectedCard.dataset.template;
                const success = await createScreenFromTemplate(state.currentProject, screenName, template, {
                    PROJECT_TITLE: state.projectMetadata.title,
                    SCREEN_NAME: screenName
                }, msg => { if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = msg; });

                if (success) {
                    location.reload();
                } else {
                    window.Notification?.alert("화면 생성에 실패했습니다.", "오류", "error");
                    DOM.btnSubmitAdd.disabled = false;
                    DOM.btnSubmitAdd.innerText = "화면 생성하기";
                }
            };
        }

        // Shortcuts & Key Event Proxying to Canvas Iframe
        window.addEventListener('keydown', (e) => {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (isInput) return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { 
                e.preventDefault(); 
                handleGlobalSave(); 
                return;
            }

            if (e.key === 'Escape') {
                if (document.body.classList.contains('fullscreen-mode')) {
                    if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true);
                    return;
                }
                if (DOM.addScreenModal) DOM.addScreenModal.classList.remove('active');
                if (DOM.editScreenModal) DOM.editScreenModal.classList.remove('active');
                if (typeof window.hideAuthModal === 'function') window.hideAuthModal();
                return;
            }

            // Proxy canvas shortcuts if we have active selections or targets
            const proxiedCodes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace', 'Space'];
            const isCtrlShortcut = (e.ctrlKey || e.metaKey) && ['g'].includes(e.key.toLowerCase());
            
            if (proxiedCodes.includes(e.code) || isCtrlShortcut) {
                if (DOM.iframe && DOM.iframe.contentWindow) {
                    DOM.iframe.contentWindow.postMessage({
                        type: 'LF_SHORTCUT_KEY_PROXY',
                        code: e.code,
                        key: e.key,
                        shiftKey: e.shiftKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey
                    }, '*');
                    
                    // Prevent default browser behaviors for layout movement keys
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Space'].includes(e.code)) {
                        e.preventDefault();
                    }
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (isInput) return;

            if (e.code === 'Space') {
                if (DOM.iframe && DOM.iframe.contentWindow) {
                    DOM.iframe.contentWindow.postMessage({
                        type: 'LF_SHORTCUT_KEY_PROXY',
                        code: e.code,
                        key: e.key,
                        shiftKey: e.shiftKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey
                    }, '*');
                }
            }
        });

    } catch (err) {
        console.error("Initialization failed:", err);
    }
};

window.DEBUG_MODE = true;
MessageHub.init();
document.addEventListener('DOMContentLoaded', () => {
    window.init();
});
