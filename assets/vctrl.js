/**
 * viewer.js - UI Viewer Logic
 * Handles canvas interaction, screen switching, metadata management, and pins.
 */

/**
 * vctrl.js - Core Viewer Engine (Vanilla V3)
 * [VANILLA ENGINE V3 LOADED]
 */
console.log("%c [VANILLA ENGINE V3 LOADED] ", "background: #00e5ff; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;");
const state = {
    currentProject: null,
    activeFile: null,
    projectMetadata: null,
    tool: 'select',
    transform: { x: 0, y: 0, scale: 1 },
    isDragging: false,
    draggingPinIndex: null,
    dragLayerRect: null,
    startX: 0, startY: 0,
    screens: [], /* Current ordered screens */
    get isReadOnly() { return ghConfig.isReadOnly; },
    hasUnsavedChanges: false,
    isEditing: false,
    editingIndex: -1
};

let quillEditor = null; // Global Quill instance

function initQuillEditor() {
    if (quillEditor) return;
    const container = document.getElementById('editor-container');
    if (!container) {
        console.error("[Quill] 에디터 컨테이너(#editor-container)를 찾을 수 없습니다.");
        return;
    }

    // 1. Initialize Quill
    quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }]
            ]
        }
    });

    // 2. Real-time Live Preview (Sidebar -> Canvas)
    quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1) return;
        
        const html = quillEditor.root.innerHTML;
        const index = state.editingIndex;
        
        // Immediate sync to the marker element for "WOW" effect
        const marker = document.querySelector(`.text-marker[data-index="${index}"]`);
        if (marker) {
            marker.innerHTML = (html === '<p><br></p>') ? "" : html;
            // Deduce and apply color for robustness
            const color = quillEditor.root.style.color || "#000000";
            marker.style.setProperty('color', color, 'important');
        }
    });

    console.log("[Quill] 에디터 초기화 완료.");
}


// State Change Helpers
function markAsDirty() {
    if (state.hasUnsavedChanges) return;
    state.hasUnsavedChanges = true;
    console.log("[Status] Unsaved changes detected.");
    if (DOM.btnGlobalSave) {
        DOM.btnGlobalSave.style.boxShadow = "0 0 20px rgba(0, 229, 255, 0.6)";
    }
}

function markAsClean() {
    state.hasUnsavedChanges = false;
    if (DOM.btnGlobalSave) {
        DOM.btnGlobalSave.style.boxShadow = "";
    }
}

// Exit Protection Logic
window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for browser level exit
    }
});

/**
 * Custom Modal Navigation Guard
 * Returns true if navigation is safe, false if cancelled
 */
async function checkUnsavedChanges() {
    if (!state.hasUnsavedChanges) return true;
    const confirmed = await Notification.confirm(
        "저장되지 않은 수정사항이 있습니다. 무시하고 이동하시겠습니까?", 
        "알림", 
        "warning"
    );
    if (confirmed) {
        markAsClean(); // Clear flag so next move is safe
        return true;
    }
    return false;
}

const DOM = {
    iframe: document.getElementById('main-iframe'),
    artboardWrapper: document.getElementById('artboard-wrapper'),
    placeholder: document.getElementById('placeholder'),
    placeholderTxt: document.getElementById('placeholder-text'),
    canvas: document.getElementById('canvas'),
    stage: document.getElementById('stage'),
    zoomTxt: document.getElementById('zoom-txt'),
    fileName: document.getElementById('file-name-display'),
    btnBack: document.getElementById('btn-back'),
    
    // Panels
    metadataPanel: document.getElementById('top-metadata-panel'),
    screensList: document.getElementById('screens-list'),
    descriptionList: document.getElementById('description-list'),
    sidebarLeft: document.getElementById('sidebar-left'),
    sidebarRight: document.getElementById('sidebar-right'),
    
    // Bottom Bar
    bottomUpdated: document.getElementById('bottom-updated')?.querySelector('span'),
    pinsLayer: document.getElementById('pins-layer'),
    
    // Buttons
    btnSelect: document.getElementById('btn-select'),
    btnHand: document.getElementById('btn-hand'),
    btnText: document.getElementById('btn-text'),
    btnToggleLeft: document.getElementById('btn-toggle-left'),
    btnToggleRight: document.getElementById('btn-toggle-right'),
    btnGlobalSave: document.getElementById('btn-global-save'),
    
    // Screen Management
    btnAddScreen: document.getElementById('btn-add-screen'),
    addScreenUpload: document.getElementById('add-screen-upload'),
    addScreenModal: document.getElementById('add-screen-modal'),
    btnCancelAdd: document.getElementById('btn-add-screen-cancel'),
    btnSubmitAdd: document.getElementById('btn-add-screen-submit'),
    btnSubmitEdit: document.getElementById('btn-edit-screen-submit'),
    
    // Component Tracking
    compActionsSection: document.getElementById('comp-actions-section'),
    btnCompDelete: document.getElementById('btn-comp-delete'),

    // Forms
    newScreenName: document.getElementById('new-screen-name'),
    templateList: document.getElementById('template-list'),
    
    // Sidebar Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    sidebarToolBtns: document.querySelectorAll('.sidebar-tool-btn'),


    
    // Edit Screen Modal DOM
    editScreenModal: document.getElementById('edit-screen-modal'),
    editScreenTitle: document.getElementById('edit-screen-title'),
    editScreenType: document.getElementById('edit-screen-type'),
    editScreenDesc: document.getElementById('edit-screen-desc'),
    editScreenFilename: document.getElementById('edit-screen-filename'),
    btnCancelEdit: document.getElementById('btn-edit-screen-cancel'),
    btnSubmitEdit: document.getElementById('btn-edit-screen-submit'),
    
    // Description
    btnAddDescription: document.getElementById('btn-add-description'),

    // Auth
    authModal: document.getElementById('auth-modal'),
    tokenInput: document.getElementById('modal-gh-token'),
    authStatus: document.getElementById('modal-auth-status'),
    btnAuthSubmit: document.getElementById('btn-modal-auth-submit'),
    btnAuthClose: document.getElementById('btn-modal-auth-cancel'),
    btnShowAuth: document.getElementById('btn-show-auth'),
    
    // Properties Sidebar Additions
    textPropSection: document.getElementById('text-properties-section'),
    textColorPicker: document.getElementById('text-color-picker'),
    colorPresets: document.querySelectorAll('.color-preset')
};

const context = {
    selectedTemplate: null
};

/**
 * Environment & Auth
 */
function checkEnvironment() {
    if (window.location.protocol === 'file:') {
        const today = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('hide_env_warning') === today) return;

        const banner = document.createElement('div');
        banner.className = 'env-banner';
        banner.innerHTML = `
            <span class="material-icons-outlined" style="color: #f87171;">warning</span>
            <div class="env-banner-text">
                <b>주의:</b> 브라우저 보안 정책으로 인해 로컬 파일 실행 시 프로젝트 생성이 제한될 수 있습니다. (Live Server 권장)
            </div>
            <button class="btn-close-banner">오늘 하루 보지 않기</button>
        `;
        document.body.appendChild(banner);
        
        setTimeout(() => banner.classList.add('active'), 100);

        banner.querySelector('.btn-close-banner').onclick = () => {
            localStorage.setItem('hide_env_warning', today);
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 500);
        };
    }
}

function showAuthModal() {
    if (DOM.authModal) DOM.authModal.classList.add('active');
}
function hideAuthModal() {
    if (DOM.authModal) DOM.authModal.classList.remove('active');
    if (DOM.authStatus) DOM.authStatus.innerText = "";
}
async function handleAuthSubmit() {
    const token = DOM.tokenInput.value.trim();
    if (!token) {
        DOM.authStatus.innerText = "토큰을 입력해주세요.";
        DOM.authStatus.style.color = "#f87171";
        return;
    }

    const success = await verifyAndSaveToken(token, (msg, color) => {
        DOM.authStatus.innerText = msg;
        DOM.authStatus.style.color = color;
    });

    if (success) {
        setTimeout(() => {
            hideAuthModal();
            location.reload(); 
        }, 1000);
    }
}

/**
 * Initialization
 */
async function init() {
    try {
        checkEnvironment();

        const params = new URLSearchParams(window.location.search);
        const project = params.get('project') || 'Default_Project';
        let fileName = params.get('file');

        state.currentProject = project;

        // Fetch data
        const [contents, metadata] = await Promise.all([
            listContents(project),
            fetchProjectMetadata(project)
        ]);

        state.projectMetadata = metadata || {};
        
        // Sort screens by metadata order
        const repoScreens = (contents || []).filter(i => i.type === 'file' && i.name.endsWith('.html'));
        const order = state.projectMetadata.screenOrder || [];
        
        // Sort repoScreens based on order array
        const sortedScreens = repoScreens.sort((a,b) => {
            const indexA = order.indexOf(a.name);
            const indexB = order.indexOf(b.name);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        state.screens = sortedScreens;
        renderScreenList(state.screens, fileName);

        if (!fileName && state.screens.length > 0) {
            fileName = state.screens[0].name;
        }

        if (fileName) {
            await loadScreen(fileName);
        } else {
            DOM.placeholderTxt.innerText = "프로젝트 스크린을 추가해주세요.";
            if (DOM.btnAddScreen) DOM.btnAddScreen.classList.add('pulse-attention');
        }

        updateProperties(); 
        setDeviceViewport('desktop', 1440, 900);

        initQuillEditor();

        // GLOBAL EVENT DELEGATION for Color Presets
        window.addEventListener('click', (e) => {
            const btn = e.target.closest('.color-preset');
            if (btn) {
                updateActiveTextAnnotationColor(btn.dataset.color);
            }
        }, true);

        if (DOM.textColorPicker) {
            DOM.textColorPicker.oninput = (e) => updateActiveTextAnnotationColor(e.target.value);
            DOM.textColorPicker.onchange = (e) => updateActiveTextAnnotationColor(e.target.value);
        }

    } catch (err) {
        console.error("Initialization failed:", err);
        if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "초기화 오류가 발생했습니다. 콘솔을 확인하세요.";
    } finally {
        // Absolute safety: remove loading bar regardless of success/failure
        hideLoading();
    }

    window.addEventListener('popstate', () => {
        const p = new URLSearchParams(window.location.search);
        const f = p.get('file');
        if (f) {
            loadScreen(f);
            updateActiveScreenInUI(f);
        }
    });
}

function showLoading(text = "Loading Screen") {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        const txt = overlay.querySelector('.loading-text');
        if (txt) txt.innerText = text;
        overlay.classList.remove('fade-out');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('fade-out');
    setTimeout(centerView, 600);
}

/**
 * UI Rendering
 */
function renderScreenList(screens, activeName) {
    DOM.screensList.innerHTML = '';
    let activeItem = null;
    
    screens.forEach((s, index) => {
        const item = document.createElement('div');
        item.className = 'screen-item';
        item.draggable = !state.isReadOnly;
        item.dataset.index = index;
        
        const scMeta = (state.projectMetadata.screens || {})[s.name] || {};
        const badgeHtml = getCategoryBadge(scMeta.type);
        const displayTitle = scMeta.title || s.name;

        item.innerHTML = `
            <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                ${badgeHtml}
                <span class="screen-name" title="${s.name}">${displayTitle}</span>
            </div>
            <div class="screen-actions" style="display:flex; gap:4px;">
                <button class="screen-edit-btn" title="속성 편집">
                    <span class="material-icons-outlined" style="font-size:16px;">edit</span>
                </button>
                <button class="screen-delete-btn" title="화면 삭제">
                    <span class="material-icons-outlined" style="font-size:16px;">delete</span>
                </button>
            </div>
        `;
        
        if (s.name === activeName) {
            item.classList.add('active');
            activeItem = item;
        }

        item.onclick = async (e) => {
            if (e.target.closest('.screen-delete-btn')) {
                handleDeleteScreen(s.name, s.sha);
                return;
            }
            if (e.target.closest('.screen-edit-btn')) {
                handleEditScreen(s.name);
                return;
            }
            
            // App-level navigation guard
            if (!(await checkUnsavedChanges())) return;
            
            const url = `viewer.html?project=${state.currentProject}&file=${s.name}`;
            history.pushState(null, '', url);
            loadScreen(s.name);
            updateActiveScreenInUI(s.name);
        };
        // Reordering logic
        item.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', index);
            item.classList.add('dragging');
        };
        item.ondragend = () => {
            item.classList.remove('dragging');
            document.querySelectorAll('.screen-item').forEach(i => i.classList.remove('drag-over'));
        };
        item.ondragover = (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        };
        item.ondragleave = () => item.classList.remove('drag-over');
        item.ondrop = async (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(item.dataset.index);
            if (fromIndex !== toIndex) {
                const [movedItem] = state.screens.splice(fromIndex, 1);
                state.screens.splice(toIndex, 0, movedItem);
                
                // Update persistent order
                state.projectMetadata.screenOrder = state.screens.map(s => s.name);
                await saveProjectMetadata(state.currentProject, state.projectMetadata);
                
                renderScreenList(state.screens, state.activeFile?.name);
            }
        };

        DOM.screensList.appendChild(item);
    });

    if (activeItem) {
        setTimeout(() => activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 800);
    }
}

function updateActiveScreenInUI(activeName) {
    document.querySelectorAll('.screen-item').forEach(item => {
        const name = item.querySelector('.screen-name').title;
        item.classList.toggle('active', name === activeName);
        if (name === activeName) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

function getCategoryBadge(type) {
    if (!type || type === 'default') return '<span class="screen-badge badge-default">ETC</span>';
    const categories = {
        'cover': { label: 'COVER', class: 'badge-cover' },
        'architecture': { label: 'ARCH', class: 'badge-architecture' },
        'plan': { label: 'PLAN', class: 'badge-plan' },
        'ui': { label: 'UI', class: 'badge-ui' },
        'admin-nbos': { label: 'NBOS', class: 'badge-admin-nbos' },
        'admin-onesphere': { label: '1SPH', class: 'badge-admin-onesphere' }
    };
    const cat = categories[type] || { label: 'ETC', class: 'badge-default' };
    return `<span class="screen-badge ${cat.class}">${cat.label}</span>`;
}

/**
 * Screen Content Management
 */
async function loadScreen(fileName) {
    if (state.isEditing) {
        closeActiveEditor(true);
    }
    showLoading("Loading: " + fileName);
    DOM.placeholder.style.display = 'none';
    
    const content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) {
        hideLoading();
        DOM.placeholder.style.display = 'flex';
        DOM.placeholderTxt.innerText = "파일을 불러오지 못했습니다.";
        return;
    }

    // Using srcdoc as a safer alternative to blob URLs for local HTML content
    // This avoids "Not allowed to load local resource" blob errors
    DOM.iframe.srcdoc = content;
    DOM.iframe.style.display = 'block';

    // Fail-safe: dismissal of loading overlay even if iframe onload doesn't fire perfectly
    const loadTimeout = setTimeout(() => {
        hideLoading();
        console.warn("[Load Fail-safe] Forcing hideLoading after 3s timeout");
    }, 3000);

    DOM.iframe.onload = () => {
        clearTimeout(loadTimeout);
        hideLoading();
        DOM.iframe.onload = null;
    };

    let scMeta = (state.projectMetadata.screens || {})[fileName] || {};
    if (!scMeta.description) scMeta.description = [];
    else if (typeof scMeta.description === 'string') {
        scMeta.description = scMeta.description.trim() ? [{ text: scMeta.description, x: 0, y: 0 }] : [];
    }

    state.activeFile = { 
        name: fileName, 
        size: (content.length / 1024).toFixed(1) + ' KB',
        meta: scMeta
    };
    
    DOM.fileName.innerText = state.projectMetadata.title || state.currentProject;
    
    renderDescriptionList();
    setTimeout(() => centerView(), 150);
}

/**
 * Metadata & Screen Editing
 */
async function handleEditScreen(fileName) {
    if (state.isReadOnly) return showAuthModal();
    const meta = (state.projectMetadata.screens || {})[fileName] || {};
    DOM.editScreenFilename.innerText = fileName;
    DOM.editScreenTitle.value = meta.title || "";
    DOM.editScreenType.value = meta.type || "default";
    DOM.editScreenDesc.value = meta.description || "";
    DOM.editScreenModal.classList.add('active');
    
    DOM.btnSubmitEdit.onclick = async () => {
        const newTitle = DOM.editScreenTitle.value.trim();
        const newType = DOM.editScreenType.value;
        const newDesc = DOM.editScreenDesc.value.trim();
        
        DOM.btnSubmitEdit.disabled = true;
        DOM.btnSubmitEdit.innerText = "저장 중...";
        
        if (!state.projectMetadata.screens) state.projectMetadata.screens = {};
        state.projectMetadata.screens[fileName] = {
            ...state.projectMetadata.screens[fileName],
            title: newTitle,
            type: newType,
            description: newDesc,
            updatedAt: new Date().toISOString()
        };
        
        const success = await saveProjectMetadata(state.currentProject, state.projectMetadata);
        if (success) {
            DOM.editScreenModal.classList.remove('active');
            location.reload(); 
        } else {
            await Notification.alert("메타데이터 저장에 실패했습니다.", "오류", "error");
            DOM.btnSubmitEdit.disabled = false;
            DOM.btnSubmitEdit.innerText = "변경사항 저장";
        }
    };
}

async function handleDeleteScreen(fileName, sha) {
    if (state.isReadOnly) return showAuthModal();
    const confirmed = await Notification.confirm(`'${fileName}' 화면을 정말 삭제하시겠습니까?`, "화면 삭제");
    if (confirmed) {
        showLoading("화면 삭제 처리 중...");
        let targetSha = sha;
        if (!targetSha) {
            const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${ghConfig.dataDir}${state.currentProject}/${fileName}`;
            const res = await fetch(url, { headers: { 'Authorization': `token ${ghConfig.token}` }});
            if (res.ok) {
                const data = await res.json();
                targetSha = data.sha;
            }
        }
        if (!targetSha) return await Notification.alert("파일 정보를 가져오지 못했습니다.", "삭제 실패", "error");

        const success = await deleteFileFromGitHub(`${state.currentProject}/${fileName}`, targetSha, false, msg => DOM.placeholderTxt.innerText = msg);
        if (success) {
            if (state.projectMetadata.screens) delete state.projectMetadata.screens[fileName];
            if (state.projectMetadata.screenOrder) {
                state.projectMetadata.screenOrder = state.projectMetadata.screenOrder.filter(name => name !== fileName);
            }
            await saveProjectMetadata(state.currentProject, state.projectMetadata);
            
            showLoading("데이터 삭제 최종 동기화 중...");
            setTimeout(() => {
                window.location.href = `viewer.html?project=${state.currentProject}`;
            }, 2000);
        } else {
            await Notification.alert("파일 삭제에 실패했습니다.", "오류", "error");
        }
    }
}

/**
 * Project Properties Bar
 */
function updateProperties() {
    if (!state.activeFile || !state.projectMetadata) return;
    const pm = state.projectMetadata;
    const m = state.activeFile.meta || {};

    DOM.metadataPanel.innerHTML = `
        <div class="form-group-inline"><label class="form-label">프로젝트명</label><input type="text" id="viewer-meta-title" class="form-input" value="${pm.title || ''}" ${state.isReadOnly ? 'disabled' : ''}></div>
        <div class="form-group-inline"><label class="form-label">담당자</label><input type="text" id="viewer-meta-assignee" class="form-input" value="${pm.assignee || ''}" ${state.isReadOnly ? 'disabled' : ''}></div>
        <div class="form-group-inline"><label class="form-label">기간</label><input type="text" id="viewer-meta-period" class="form-input" value="${pm.period || ''}" ${state.isReadOnly ? 'disabled' : ''}></div>
        <div class="form-group-inline"><label class="form-label">JIRA</label><input type="text" id="viewer-meta-jira" class="form-input" value="${pm.jira || ''}" ${state.isReadOnly ? 'disabled' : ''}></div>
        <div class="form-group-inline"><label class="form-label">FIGMA</label><input type="text" id="viewer-meta-figma" class="form-input" value="${pm.figmaUrl || ''}" ${state.isReadOnly ? 'disabled' : ''}>${pm.figmaUrl ? `<a href="${pm.figmaUrl}" target="_blank" style="margin-left:4px; font-size:12px; color:var(--accent);">[열기]</a>` : ''}</div>
        <div class="form-group-inline"><label class="form-label">PUB</label><input type="text" id="viewer-meta-pub" class="form-input" value="${pm.pubUrl || ''}" ${state.isReadOnly ? 'disabled' : ''}>${pm.pubUrl ? `<a href="${pm.pubUrl}" target="_blank" style="margin-left:4px; font-size:12px; color:var(--accent);">[열기]</a>` : ''}</div>
    `;

    // Metadata Input Listeners
    if (!state.isReadOnly) {
        DOM.metadataPanel.querySelectorAll('input').forEach(input => {
            input.oninput = () => markAsDirty();
        });
    }

    const periodInput = document.getElementById('viewer-meta-period');
    if (!state.isReadOnly && periodInput) {
        flatpickr(periodInput, {
            mode: "range", locale: "ko", dateFormat: "Y.m.d",
            defaultDate: pm.period ? pm.period.split(' ~ ') : null,
            onChange: (selectedDates) => {
                if (selectedDates.length === 2) {
                    const days = ['일', '월', '화', '수', '목', '금', '토'];
                    const format = d => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}(${days[d.getDay()]})`;
                    periodInput.value = `${format(selectedDates[0])} ~ ${format(selectedDates[1])}`;
                    markAsDirty();
                }
            }
        });
    }

    renderDescriptionList();
    if (DOM.bottomUpdated) {
        DOM.bottomUpdated.innerText = m.updatedAt ? `최종 업데이트: ${new Date(m.updatedAt).toLocaleString()}` : '최종 업데이트: -';
    }
}

/**
 * Descriptions & Pins
 */
function renderDescriptionList() {
    if (!state.activeFile) return;
    const list = state.activeFile.meta.description;
    DOM.descriptionList.innerHTML = '';
    DOM.pinsLayer.innerHTML = '';

    list.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'desc-row';
        row.draggable = !state.isReadOnly;
        row.dataset.index = index;
        row.innerHTML = `
            <div class="desc-index">${index + 1}</div>
            <textarea class="desc-input" rows="1" placeholder="설명을 입력하세요..." ${state.isReadOnly ? 'disabled' : ''}>${item.text || ''}</textarea>
            <div class="desc-actions">
                <button class="desc-btn desc-btn-del" data-index="${index}" title="삭제"><span class="material-icons-outlined">remove_circle_outline</span></button>
            </div>
        `;

        const pin = document.createElement('div');
        if (item.type === 'text') {
            pin.className = 'text-marker';
            // Support both HTML (New) and Text (Old)
            pin.innerHTML = item.html || item.text || '';
            const markerColor = item.color || "#000000";
            pin.style.setProperty('color', markerColor, 'important');
            
            if (state.isEditing && state.editingIndex === index) {
                pin.classList.add('editing-active');
            }
        } else {
            pin.className = 'pin-marker';
            pin.innerText = index + 1;
        }
        pin.dataset.index = index;
        
        const highlight = (active) => { pin.classList.toggle('highlight', active); row.classList.toggle('highlight', active); };
        pin.onmouseenter = () => highlight(true);
        pin.onmouseleave = () => highlight(false);
        row.onmouseenter = () => highlight(true);
        row.onmouseleave = () => highlight(false);

        // Delete Button on Marker
        if (!state.isReadOnly) {
            const delBtn = document.createElement('div');
            delBtn.className = 'marker-delete-btn';
            delBtn.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 11px;">X</span>';
            delBtn.title = "삭제";
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteAnnotation(index);
            };
            pin.appendChild(delBtn);
        }

        DOM.descriptionList.appendChild(row);
        DOM.pinsLayer.appendChild(pin);
        
        // Initial Position via Vanilla (centered) - MUST BE IN DOM FIRST
        pin.style.left = (item.x || 0) + "%";
        pin.style.top = (item.y || 0) + "%";
        pin.style.cursor = 'grab';

        // Robust Custom Click Handling
        let lastClickTime = 0;
        const doubleClickThreshold = 450; 

        // Block propagation for ALL click-related events to protect pinsLayer
        const stopProps = (e) => e.stopPropagation();
        pin.addEventListener('click', stopProps);
        pin.addEventListener('dblclick', stopProps);

        const handleActivation = (e) => {
            if (state.isReadOnly) return false;
            if (e.target.closest('.marker-delete-btn')) return false;
            
            // Activation will now happen on MouseUp if not moved
            return false;
        };

        // Listen on MouseDown to catch it early and handle Drag
        pin.addEventListener('mousedown', (e) => {
            if (state.isReadOnly) return;
            if (e.target.closest('.marker-delete-btn')) return;
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            let moved = false;
            const initialItemX = item.x || 0;
            const initialItemY = item.y || 0;
            const r = DOM.pinsLayer.getBoundingClientRect();

            if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
            document.body.style.cursor = 'grabbing';
            pin.style.cursor = 'grabbing';
            pin.style.transition = 'none'; 
            pin.style.zIndex = '1001'; 
            pin.classList.add('active', 'dragging-now'); // Add dragging class
            highlight(true);

            const onMouseMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
                item.x = Math.max(0, Math.min(initialItemX + (dx / r.width) * 100, 100));
                item.y = Math.max(0, Math.min(initialItemY + (dy / r.height) * 100, 100));
                pin.style.left = item.x + "%";
                pin.style.top = item.y + "%";
            };

            const onMouseUp = () => {
                if (DOM.iframe) DOM.iframe.style.pointerEvents = (state.tool === 'hand') ? 'none' : 'auto';
                document.body.style.cursor = '';
                pin.style.cursor = 'grab';
                pin.style.transition = ''; 
                pin.style.zIndex = '100';
                pin.classList.remove('active', 'dragging-now');
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                highlight(false);
                
                if (moved) {
                    markAsDirty();
                } else {
                    // It was a simple click -> Activate Editor
                    spawnTextEditor(item.x, item.y, index);
                }
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // Touch support
        pin.ontouchstart = (e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;
            const initialItemX = item.x || 0;
            const initialItemY = item.y || 0;
            const r = DOM.pinsLayer.getBoundingClientRect();
            highlight(true);

            const onTouchMove = (moveEvent) => {
                const t = moveEvent.touches[0];
                const dx = t.clientX - startX;
                const dy = t.clientY - startY;
                item.x = Math.max(0, Math.min(initialItemX + (dx / r.width) * 100, 100));
                item.y = Math.max(0, Math.min(initialItemY + (dy / r.height) * 100, 100));
                pin.style.left = item.x + "%";
                pin.style.top = item.y + "%";
            };

            const onTouchEnd = () => {
                window.removeEventListener('touchmove', onTouchMove);
                window.removeEventListener('touchend', onTouchEnd);
                highlight(false);
            };

            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
        };

        const input = row.querySelector('.desc-input');
        input.oninput = () => { 
            item.text = input.value; 
            autoResize(input); 
            markAsDirty();
        };
        const autoResize = (el) => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
        
        row.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', index);
            row.classList.add('dragging-row');
        };
        row.ondragend = () => document.querySelectorAll('.desc-row').forEach(r => r.classList.remove('drag-over', 'dragging-row'));
        row.ondragover = (e) => { e.preventDefault(); row.classList.add('drag-over'); };
        row.ondragleave = () => row.classList.remove('drag-over');
        row.ondrop = (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(row.dataset.index);
            if (fromIndex !== toIndex) {
                const [movedItem] = list.splice(fromIndex, 1);
                list.splice(toIndex, 0, movedItem);
                renderDescriptionList();
            }
        };
        
        autoResize(input);

        row.querySelector('.desc-btn-del').onclick = async () => {
            if (state.isReadOnly) return showAuthModal();
            if (await Notification.confirm("이 설명을 삭제하시겠습니까?", "설명 삭제")) {
                list.splice(index, 1);
                markAsDirty();
                renderDescriptionList();
            }
        };
    });
}

/**
 * Global Save
 */
async function handleGlobalSave() {
    if (state.isReadOnly) return showAuthModal();
    if (!state.activeFile) return;

    const btn = DOM.btnGlobalSave;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px;">sync</span> 저장 중...';
    btn.style.opacity = '0.7';

    const projectMeta = {
        title: document.getElementById('viewer-meta-title')?.value || '',
        assignee: document.getElementById('viewer-meta-assignee')?.value || '',
        period: document.getElementById('viewer-meta-period')?.value || '',
        jira: document.getElementById('viewer-meta-jira')?.value || '',
        figmaUrl: document.getElementById('viewer-meta-figma')?.value || '',
        pubUrl: document.getElementById('viewer-meta-pub')?.value || ''
    };

    const success = await updateScreenMetadata(state.currentProject, state.activeFile.name, { projectMeta, description: state.activeFile.meta.description }, (msg, color) => {
        btn.innerHTML = `<span class="material-icons-outlined" style="font-size:16px;">${color === '#4ade80' ? 'check_circle' : 'error'}</span> ${msg}`;
        btn.style.background = color || ''; btn.style.opacity = '1';
        if (color === '#4ade80') setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; }, 2000);
    });

    if (success) {
        markAsClean();
        // Sync project level meta
        Object.assign(state.projectMetadata, projectMeta);
        
        // Sync current screen level meta (descriptions, etc.)
        if (!state.projectMetadata.screens) state.projectMetadata.screens = {};
        state.projectMetadata.screens[state.activeFile.name] = {
            ...state.projectMetadata.screens[state.activeFile.name],
            description: JSON.parse(JSON.stringify(state.activeFile.meta.description)), // Deep copy to be safe
            updatedAt: new Date().toISOString()
        };
        
        if (projectMeta.title) DOM.fileName.innerText = projectMeta.title;
    }
}

/**
 * Canvas Operations
 */
function centerView() {
    if (!DOM.canvas || !DOM.iframe) return;
    const iw = parseInt(DOM.iframe.style.width) || 1440, ih = parseInt(DOM.iframe.style.height) || 900;
    const cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    let s = Math.min((cw * 0.95) / iw, (ch * 0.95) / ih, 1);
    if (s > 0.98) s = 0.98;
    state.transform = { x: (cw - (iw * s)) / 2, y: (ch - (ih * s)) / 2, scale: s };
    updateTransform();
}

function updateTransform() {
    DOM.stage.style.transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
    DOM.zoomTxt.innerText = Math.round(state.transform.scale * 100) + '%';
}

function adjustZoom(delta) {
    state.transform.scale = Math.max(0.1, Math.min(state.transform.scale + delta, 3));
    updateTransform();
}

function setDeviceViewport(type, w, h) {
    document.querySelectorAll('.tools .device-btn').forEach(btn => btn.classList.remove('active'));
    if(type === 'mobile') document.querySelector('.tools .tool-btn[onclick*="mobile"]').classList.add('active');
    else if(type === 'tablet') document.querySelector('.tools .tool-btn[onclick*="tablet"]').classList.add('active');
    else document.getElementById('btn-desktop').classList.add('active');

    if (DOM.artboardWrapper) { DOM.artboardWrapper.style.width = w + 'px'; DOM.artboardWrapper.style.height = h + 'px'; }
    DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px';
    setTimeout(() => centerView(), 100);
}

function setTool(t) {
    state.tool = t;
    DOM.btnSelect.classList.toggle('active', t === 'select');
    DOM.btnHand.classList.toggle('active', t === 'hand');
    if (DOM.btnText) DOM.btnText.classList.toggle('active', t === 'text');
    DOM.canvas.classList.toggle('hand-active', t === 'hand');

    // Sidebar tool sync
    DOM.sidebarToolBtns?.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === t);
    });
    
    // Toggle pointer-events to allow clicking on the artboard for pins
    DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
    if (DOM.pinsLayer) {
        DOM.pinsLayer.style.pointerEvents = (t === 'select') ? 'auto' : 'none';
    }
}

/**
 * Event Listeners
 */

// Canvas-click to add pins has been removed per user request.
// Use Sidebar buttons [Text Creation] or [Add Description] to create annotations.
DOM.pinsLayer.onclick = (e) => {
    // We only prevent default/bubbling here to keep context clean
    if (e.target !== DOM.pinsLayer) return;
};

function getCascadedPosition(startX = 50, startY = 50) {
    let x = startX, y = startY;
    const step = 3; // 3% offset as suggested
    const list = state.activeFile?.meta.description || [];
    
    let isOccupied = true;
    let attempts = 0;
    while (isOccupied && attempts < 15) {
        isOccupied = list.some(item => 
            item.type === 'text' && Math.abs(item.x - x) < 1 && Math.abs(item.y - y) < 1
        );
        if (isOccupied) {
            x += step;
            y += step;
            attempts++;
            if (x > 95 || y > 95) { x = startX; y = startY; break; }
        }
    }
    return { x, y };
}

function handleTextCreation() {
    if (state.isReadOnly) return showAuthModal();
    if (!state.activeFile) return Notification.alert("스크린을 선택해주세요.", "알림", "warning");
    if (state.isEditing) return;

    const x = 50;
    const y = 50;
    
    // 1. Push immediate empty data to enable real-time sync
    const newIdx = state.activeFile.meta.description.length;
    state.activeFile.meta.description.push({
        html: "",
        text: "",
        x, y,
        type: 'text',
        color: "#000000"
    });

    // 2. Refresh UI to show the empty marker
    renderDescriptionList();

    // 3. Open editor for this new marker
    spawnTextEditor(x, y, newIdx);
}

/**
 * Global Editor Controller
 */
function closeActiveEditor(save = true) {
    if (!state.isEditing) return;
    
    const editorSection = document.getElementById('text-editor-section');
    const emptyMsg = document.querySelector('.empty-inspector');
    
    const htmlContent = quillEditor ? quillEditor.root.innerHTML : "";
    const plainText = quillEditor ? quillEditor.getText().trim() : "";
    const finalColor = quillEditor ? normalizeToHex(quillEditor.root.style.color || "#000000") : "#000000";

    if (save && quillEditor) {
        if (state.editingIndex !== -1 && state.activeFile) {
            state.activeFile.meta.description[state.editingIndex].html = htmlContent;
            state.activeFile.meta.description[state.editingIndex].text = plainText;
            state.activeFile.meta.description[state.editingIndex].color = finalColor;
            
            if (!plainText && (htmlContent === "" || htmlContent === "<p><br></p>")) {
                state.activeFile.meta.description.splice(state.editingIndex, 1);
            }
            markAsDirty();
        }
    } else if (!save && state.editingIndex !== -1 && state.activeFile) {
        const item = state.activeFile.meta.description[state.editingIndex];
        if (!item.text && (!item.html || item.html === "<p><br></p>")) {
            state.activeFile.meta.description.splice(state.editingIndex, 1);
        }
    }

    state.isEditing = false;
    state.editingIndex = -1;
    if (editorSection) editorSection.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'flex';
    renderDescriptionList();
}

function spawnTextEditor(x, y, existingIndex = -1) {
    // Continuous Editing: If another is open, save it first
    if (state.isEditing) {
        closeActiveEditor(true);
    }
    state.isEditing = true;
    state.editingIndex = existingIndex;

    // 1. Prepare UI
    switchSidebarTab('properties');
    const editorSection = document.getElementById('text-editor-section');
    if (editorSection) editorSection.style.display = 'block';

    const emptyMsg = document.querySelector('.empty-inspector');
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    // 2. Visual Highlight
    const markers = document.querySelectorAll('.text-marker');
    markers.forEach(m => m.classList.remove('editing-active'));
    if (existingIndex !== -1) {
        const activeMarker = document.querySelector(`.text-marker[data-index="${existingIndex}"]`);
        if (activeMarker) activeMarker.classList.add('editing-active');
    }

    // 3. Load content into Quill
    if (quillEditor) {
        const item = (existingIndex !== -1 && state.activeFile) ? state.activeFile.meta.description[existingIndex] : null;
        const initialHtml = item ? (item.html || item.text || "") : "";
        quillEditor.root.innerHTML = initialHtml;
        quillEditor.focus();
    }

    // 4. Action Button Handlers
    const btnApply = document.getElementById('btn-editor-apply');
    const btnDelete = document.getElementById('btn-editor-delete');

    if (btnApply) {
        btnApply.onclick = (e) => {
            e.stopPropagation();
            closeActiveEditor(true);
        };
    }

    if (btnDelete) {
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            deleteAnnotation(state.editingIndex);
            closeActiveEditor(false); 
        };
    }

    const handleGlobalClick = (e) => {
        if (!state.isEditing) return;
        if (e.target.closest('#text-editor-section') || 
            e.target.closest('.text-marker') || 
            e.target.closest('.sidebar-right') ||
            e.target.closest('.ql-tooltip')) return;
        
        closeActiveEditor(true);
        window.removeEventListener('mousedown', handleGlobalClick);
    };
    
    setTimeout(() => {
        window.addEventListener('mousedown', handleGlobalClick);
    }, 400);
}

function deleteAnnotation(index) {
    if (state.isReadOnly || !state.activeFile) return;
    state.activeFile.meta.description.splice(index, 1);
    markAsDirty();
    renderDescriptionList();
}

/**
 * Text Property Sidebar Helpers
 */
function showTextProperties(index) {
    if (!DOM.textPropSection) return;
    DOM.textPropSection.style.display = 'block';
    
    // Switch to properties tab automatically
    switchSidebarTab('properties');
}

function hideTextProperties() {
    if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
}

function updateActiveTextAnnotationColor(color) {
    const hex = normalizeToHex(color);
    
    // 1. Update Quill Selection if editor is active
    if (state.isEditing && quillEditor) {
        // Apply color to current selection or the whole editor if nothing selected
        const range = quillEditor.getSelection();
        if (range && range.length > 0) {
            quillEditor.format('color', hex);
        } else {
            // Apply to editor root for better feedback when nothing is selected
            quillEditor.root.style.color = hex;
        }
    }

    // 2. Sync picker and presets UI
    if (DOM.textColorPicker) DOM.textColorPicker.value = hex;
    updatePresetActive(hex);
}

function updatePresetActive(color) {
    const hex = normalizeToHex(color);
    DOM.colorPresets?.forEach(btn => {
        const btnHex = normalizeToHex(btn.dataset.color);
        btn.classList.toggle('active', btnHex.toLowerCase() === hex.toLowerCase());
    });
}

function normalizeToHex(color) {
    if (!color) return "#000000";
    if (color.startsWith('#')) return color;
    
    // Mapping for common preset names
    const colorMap = {
        'black': '#000000',
        'white': '#ffffff',
        'red': '#ef4444',
        'blue': '#3b82f6',
        'green': '#22c55e',
        'yellow': '#eab308'
    };
    if (colorMap[color.toLowerCase()]) return colorMap[color.toLowerCase()];

    // Convert rgb(r, g, b) to #rrggbb
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return color;
    
    const r = parseInt(rgb[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgb[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgb[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}


function toggleSidebar(side, force) {
    const sidebar = side === 'left' ? DOM.sidebarLeft : DOM.sidebarRight;
    const handle = side === 'left' ? DOM.btnToggleLeft : DOM.btnToggleRight;
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const targetCollapsed = force !== undefined ? !force : !isCurrentlyCollapsed;

    sidebar.classList.toggle('collapsed', targetCollapsed);
    
    const icon = handle?.querySelector('span');
    if (icon) {
        if (side === 'left') icon.innerText = targetCollapsed ? 'chevron_right' : 'chevron_left';
        else icon.innerText = targetCollapsed ? 'chevron_left' : 'chevron_right';
    }
    
    setTimeout(centerView, 300);
}

function switchSidebarTab(tabName) {
    DOM.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    DOM.tabPanes.forEach(pane => {
        const isActive = pane.id === `tab-${tabName}`;
        pane.style.display = isActive ? 'flex' : 'none';
        pane.classList.toggle('active', isActive);
    });
    
    // Auto-open sidebar if switching tab
    if (DOM.sidebarRight?.classList.contains('collapsed')) {
        toggleSidebar('right', true);
    }
}

function toggleInspector() {
    // Inspector is now a tab in the right sidebar
    switchSidebarTab('properties');
}

if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => toggleSidebar('left');
if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => toggleSidebar('right');

// Add Tab Button Listeners
DOM.tabBtns.forEach(btn => {
    btn.onclick = () => switchSidebarTab(btn.dataset.tab);
});

// Add Sidebar Tool Listeners
DOM.sidebarToolBtns?.forEach(btn => {
    btn.onclick = () => {
        if (btn.dataset.tool === 'text') {
            handleTextCreation();
        } else {
            setTool(btn.dataset.tool);
        }
    };
});



if (DOM.btnAddScreen) DOM.btnAddScreen.onclick = () => { 
    if (state.isReadOnly) return showAuthModal(); 
    DOM.addScreenModal?.classList.add('active'); 
    if (DOM.newScreenName) DOM.newScreenName.value = ""; 
    context.selectedTemplate = null; 
    DOM.templateList?.querySelectorAll('.template-card').forEach(c => c.classList.remove('active')); 
};
if (DOM.btnCancelAdd) DOM.btnCancelAdd.onclick = () => DOM.addScreenModal?.classList.remove('active');

// Mouse Drag-to-Scroll (Swipe) for Template Selection
if (DOM.templateList) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let moved = false;

    DOM.templateList.addEventListener('mousedown', (e) => {
        isDown = true;
        moved = false;
        DOM.templateList.classList.add('active'); // CSS matches .template-grid.active or similar
        startX = e.pageX - DOM.templateList.offsetLeft;
        scrollLeft = DOM.templateList.scrollLeft;
    });

    DOM.templateList.addEventListener('mouseleave', () => {
        isDown = false;
    });

    DOM.templateList.addEventListener('mouseup', () => {
        isDown = false;
    });

    DOM.templateList.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - DOM.templateList.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        if (Math.abs(walk) > 5) moved = true;
        DOM.templateList.scrollLeft = scrollLeft - walk;
    });

    // Event Delegation for Template Selection with drag protection
    DOM.templateList.addEventListener('click', (e) => {
        if (moved) return; // Prevent selection if it was a drag

        const card = e.target.closest('.template-card');
        if (!card) return;
        
        DOM.templateList.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        context.selectedTemplate = card.dataset.template;
        
        if (DOM.newScreenName && !DOM.newScreenName.value.trim()) {
            DOM.newScreenName.value = card.dataset.defaultName + "_" + new Date().getTime().toString().slice(-4);
        }
    });
}
if (DOM.btnUploadLocal) DOM.btnUploadLocal.onclick = () => DOM.addScreenUpload?.click();
DOM.addScreenUpload.onchange = async (e) => {
    if (state.isReadOnly) return showAuthModal();
    const files = Array.from(e.target.files).filter(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
    if (files.length === 0) return;
    DOM.addScreenModal.classList.remove('active');
    DOM.placeholder.style.display = 'flex'; DOM.placeholderTxt.innerText = "화면 추가 중...";
    for (const file of files) {
        const content = await file.text();
        if (await uploadToProject(state.currentProject, file.name, content, msg => DOM.placeholderTxt.innerText = msg)) {
            state.projectMetadata.screens = state.projectMetadata.screens || {};
            state.projectMetadata.screens[file.name] = { updatedAt: new Date().toISOString() };
            await saveProjectMetadata(state.currentProject, state.projectMetadata);
        }
    }
    location.reload();
};

DOM.btnSubmitAdd.onclick = async () => {
    const screenName = DOM.newScreenName.value.trim();
    if (!screenName || !context.selectedTemplate) return await Notification.alert("입력을 확인해주세요.", "알림", "warning");
    
    const activeCard = document.querySelector('.template-card.active');
    if (activeCard) activeCard.classList.add('generating');
    
    DOM.btnSubmitAdd.innerText = "생성 중..."; 
    DOM.btnSubmitAdd.disabled = true;

    const injectData = {
        PROJECT_NAME: state.projectMetadata.title || state.currentProject,
        SCREEN_NAME: screenName,
        AUTHOR: state.projectMetadata.assignee || '담당자 미정',
        DATE: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, ''),
        VERSION: '1.0',
        JIRA: state.projectMetadata.jira || '-',
        SCREEN_PATH: `https://m.lfmall.co.kr/app/${screenName.replace('.html','')}`
    };

    if (await createScreenFromTemplate(state.currentProject, screenName, context.selectedTemplate, injectData, msg => DOM.placeholderTxt.innerText = msg)) {
        showLoading("새 화면 최종 동기화 중...");
        setTimeout(() => location.reload(), 2000);
    } else { 
        DOM.btnSubmitAdd.innerText = "화면 생성하기"; 
        DOM.btnSubmitAdd.disabled = false; 
        if (activeCard) activeCard.classList.remove('generating'); 
    }
};

if (DOM.btnBack) {
    DOM.btnBack.onclick = async (e) => {
        e.preventDefault();
        if (await checkUnsavedChanges()) {
            window.location.href = 'index.html';
        }
    };
}

if (DOM.btnAddDescription) DOM.btnAddDescription.onclick = () => { if (state.isReadOnly) return showAuthModal(); if (!state.activeFile) return Notification.alert("스크린을 선택해주세요.", "알림", "warning"); state.activeFile.meta.description.push({ text: '', x: 50, y: 50 }); markAsDirty(); renderDescriptionList(); setTimeout(() => DOM.descriptionList?.querySelectorAll('.desc-input').slice(-1)[0]?.focus(), 50); };
if (DOM.btnGlobalSave) DOM.btnGlobalSave.onclick = handleGlobalSave;
if (DOM.btnSelect) DOM.btnSelect.onclick = () => setTool('select');
if (DOM.btnHand) DOM.btnHand.onclick = () => setTool('hand');
if (DOM.btnText) DOM.btnText.onclick = () => setTool('text');
if (DOM.btnShowAuth) DOM.btnShowAuth.onclick = showAuthModal;
if (DOM.btnAuthSubmit) DOM.btnAuthSubmit.onclick = handleAuthSubmit;
if (DOM.btnAuthClose) DOM.btnAuthClose.onclick = hideAuthModal;
if (DOM.tokenInput) DOM.tokenInput.onkeyup = (e) => { if(e.key==='Enter') handleAuthSubmit(); };
if (DOM.btnCancelEdit) DOM.btnCancelEdit.onclick = () => DOM.editScreenModal?.classList.remove('active');

window.addEventListener('keydown', async e => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if(e.key === 'Escape') {
        if (await checkUnsavedChanges()) {
            window.location.href = 'index.html';
        }
    }
    if(e.code === 'Space' && state.tool !== 'hand') { DOM.canvas.classList.add('hand-active'); DOM.iframe.style.pointerEvents = 'none'; }
    if(e.code === 'KeyV') setTool('select');
    if(e.code === 'KeyH') setTool('hand');
    if(e.code === 'KeyT') handleTextCreation();
    if(e.code === 'KeyI') toggleInspector();
    if(e.code === 'KeyL') toggleSidebar('left');
    if(e.code === 'KeyR') toggleSidebar('right');
});
window.addEventListener('keyup', e => { if(e.code === 'Space' && state.tool !== 'hand') { DOM.canvas.classList.remove('hand-active'); DOM.iframe.style.pointerEvents = 'auto'; }});

DOM.canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const s = state.transform.scale, ns = Math.max(0.1, Math.min(s * (1 + (e.deltaY > 0 ? -0.1 : 0.1)), 20));
    const r = DOM.canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    state.transform.x = mx - (mx - state.transform.x) * (ns / s);
    state.transform.y = my - (my - state.transform.y) * (ns / s);
    state.transform.scale = ns; updateTransform();
}, {passive: false});

DOM.canvas.addEventListener('mousedown', e => { if(state.tool === 'hand' || e.button === 1 || DOM.canvas.classList.contains('hand-active')) { state.isDragging = true; state.startX = e.clientX - state.transform.x; state.startY = e.clientY - state.transform.y; e.preventDefault(); }});
window.addEventListener('mousemove', e => {
    if (state.isDragging) { state.transform.x = e.clientX - state.startX; state.transform.y = e.clientY - state.startY; updateTransform(); }
});
window.addEventListener('mouseup', () => { 
    state.isDragging = false; 
});

/**
 * Tab Switching & Atomic Components
 */
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = pane.id === `tab-${tabId}` ? 'flex' : 'none';
        pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });
}

// Injects necessary interaction styles into the iframe
function injectIframeInteractions(doc) {
    if (doc.getElementById('lf-editor-styles')) return;
    const style = doc.createElement('style');
    style.id = 'lf-editor-styles';
    style.innerHTML = `
        .lf-component {
            position: absolute !important;
            outline: 2px solid transparent;
            transition: outline 0.1s;
            box-sizing: border-box !important;
            min-width: 20px; min-height: 20px;
        }
        .lf-component:hover {
            outline: 2px solid #00e5ff !important;
            cursor: move !important;
        }
        .lf-component.selected {
            outline: 2px solid #00e5ff !important;
            z-index: 9999 !important;
        }
        .lf-resizer {
            width: 12px; height: 12px;
            background: #00e5ff;
            border: 2px solid #fff;
            position: absolute;
            right: -6px; bottom: -6px;
            cursor: nwse-resize !important;
            display: none;
            border-radius: 2px;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer {
            display: block;
        }
        /* Direct Delete Button Style */
        .lf-delete-trigger {
            display: none;
            position: absolute;
            top: -10px; right: -10px;
            width: 22px; height: 22px;
            background: #ef4444;
            color: #fff;
            border-radius: 50%;
            cursor: pointer;
            align-items: center; justify-content: center;
            border: 2px solid #fff;
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer,
        .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger {
            display: flex;
        }
        /* Sprite Icon Base Style inside IFrame */
        .lf-icon {
            background-image: url("https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png");
            background-size: 200px 160px;
            width: 40px; height: 40px;
            display: block;
            background-repeat: no-repeat;
        }
        .lf-icon-home     { background-position: -80px 0; }
        .lf-icon-category { background-position: 0 0; }
        .lf-icon-my       { background-position: -120px 0; }
        .lf-icon-heart    { background-position: -160px 0; }
        .lf-icon-search   { background-position: -80px -40px; }
        .lf-icon-cart     { background-position: -120px -40px; }
        .lf-icon-brand    { background-position: -40px 0; }
        .lf-icon-back     { background-position: 0 -40px; }
        .lf-icon-bell     { background-position: -40px -40px; }
        .lf-icon-share    { background-position: -160px -40px; }
        .lf-icon-party    { background-position: 0 -120px; }
    `;
    doc.head.appendChild(style);

    // IFrame Interaction Logic
    let isMoving = false, isResizing = false;
    let activeEl = null, startX, startY, startW, startH, startTop, startLeft;

    doc.addEventListener('mousedown', e => {
        // Prevent interaction if in Text mode or Hand mode
        if (state.activeTool !== 'select') return;

        const deleteBtn = e.target.closest('.lf-delete-trigger');
        const resizer = e.target.closest('.lf-resizer');
        const comp = e.target.closest('.lf-component');

        if (deleteBtn) {
            comp.remove();
            markAsDirty();
            window.postMessage({ type: 'LF_COMP_DESELECTED' }, '*');
            Notification.toast("컴포넌트가 삭제되었습니다.");
            e.preventDefault(); e.stopPropagation();
            return;
        }

        if (resizer) {
            isResizing = true;
            activeEl = resizer.parentElement;
            startX = e.clientX; startY = e.clientY;
            startW = activeEl.offsetWidth; startH = activeEl.offsetHeight;
            e.preventDefault(); e.stopPropagation();
        } else if (comp) {
            isMoving = true;
            activeEl = comp;
            startX = e.clientX; startY = e.clientY;
            startTop = activeEl.offsetTop; startLeft = activeEl.offsetLeft;
            
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            activeEl.classList.add('selected');
            
            // Inform parent about selection
            window.postMessage({ type: 'LF_COMP_SELECTED', id: activeEl.id }, '*');

            e.preventDefault(); e.stopPropagation();
        } else {
            doc.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            window.postMessage({ type: 'LF_COMP_DESELECTED' }, '*');
        }
    });

    doc.addEventListener('mousemove', e => {
        if (!activeEl) return;
        if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            activeEl.style.width = `${startW + dx}px`;
            activeEl.style.height = `${startH + dy}px`;
        } else if (isMoving) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            activeEl.style.top = `${startTop + dy}px`;
            activeEl.style.left = `${startLeft + dx}px`;
        }
    });

    doc.addEventListener('mouseup', () => {
        if (activeEl) markAsDirty();
        isMoving = false; isResizing = false; activeEl = null;
    });

    doc.addEventListener('keydown', e => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selected = doc.querySelector('.lf-component.selected');
            if (selected) {
                selected.remove();
                markAsDirty();
                window.postMessage({ type: 'LF_COMP_DESELECTED' }, '*');
                Notification.toast("컴포넌트가 삭제되었습니다.");
            }
        }
    });
}

function insertAtomicComponent(type, name) {
    if (ghConfig.isReadOnly) return showAuthModal();
    if (!state.activeFile) return Notification.alert("먼저 스크린을 선택해주세요.", "알림", "warning");

    const iframeDoc = DOM.iframe.contentDocument || DOM.iframe.contentWindow.document;
    if (!iframeDoc) return;

    injectIframeInteractions(iframeDoc);

    let contentHtml = '';
    const id = `lf-comp-${Date.now()}`;

    if (name === 'LF Logo') {
        contentHtml = `<img src="https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png" style="width:100%; height:auto; display:block; pointer-events:none;">`;
    } else if (name === 'Primary Button') {
        contentHtml = `<div style="background:#00e5ff; color:#000; border:none; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:bold; font-size:14px; box-shadow:0 4px 15px rgba(0,229,255,0.3); pointer-events:none;">BUTTON</div>`;
    } else if (name === 'LF Discount') {
        contentHtml = `<div style="color:#E02020; font-size:24px; font-weight:800; font-family:sans-serif; text-align:center; pointer-events:none; line-height:1.2;">20%</div>`;
    } else if (name === 'LF GNB') {
        contentHtml = `
            <div style="background:#000; width:100%; height:100%; display:flex; align-items:center; justify-content:space-between; padding:0 16px; pointer-events:none;">
                <span class="material-icons-outlined" style="color:#fff; font-size:20px;">search</span>
                <span style="color:#fff; font-size:18px; font-weight:900; letter-spacing:-0.5px; font-family:sans-serif;">l.f:</span>
                <span class="material-icons-outlined" style="color:#fff; font-size:20px;">home</span>
            </div>`;
    } else if (name === 'LF LNB') {
        contentHtml = `
            <div style="background:#fff; border-bottom:1px solid #f2f2f2; width:100%; height:100%; display:flex; align-items:center; padding:0 16px; pointer-events:none; overflow:hidden;">
                <div style="display:flex; align-items:center; gap:20px; font-size:14px; font-family:sans-serif;">
                    <span style="color:#000; font-weight:bold; position:relative;">홈<span style="position:absolute; top:-2px; right:-6px; width:4px; height:4px; background:#E02020; border-radius:50%;"></span></span>
                    <span style="color:#888;">베스트</span>
                    <span style="color:#888;">여성</span>
                    <span style="color:#888;">남성</span>
                    <span style="color:#888;">기획전</span>
                </div>
            </div>`;
    } else if (type === 'icon') {
        const iconClass = name.toLowerCase().split(' ')[0]; // home, category, search, etc.
        contentHtml = `<div class="lf-icon lf-icon-${iconClass}" style="width:100%; height:100%; pointer-events:none;"></div>`;
    }

    if (contentHtml) {
        const comp = iframeDoc.createElement('div');
        comp.id = id;
        comp.className = 'lf-component';
        comp.style.top = name === 'LF GNB' ? '0px' : (name === 'LF LNB' ? '50px' : '150px');
        comp.style.left = (name === 'LF GNB' || name === 'LF LNB') ? '0px' : '100px';
        comp.style.width = (name === 'LF GNB' || name === 'LF LNB') ? '100%' : (type === 'icon' ? '40px' : (name === 'LF Discount' ? '60px' : '120px'));
        comp.style.height = name === 'LF GNB' ? '50px' : (name === 'LF LNB' ? '48px' : (type === 'icon' ? '40px' : 'auto'));
        
        comp.innerHTML = `${contentHtml}
            <div class="lf-resizer"></div>
            <div class="lf-delete-trigger">×</div>`;
        iframeDoc.body.appendChild(comp);
        
        Notification.toast(`${name} 컴포넌트가 삽입되었습니다.`);
        markAsDirty();
    }
}

// Global Event Listeners for Tabs and Components
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
});

document.querySelectorAll('.component-item').forEach(item => {
    item.onclick = () => insertAtomicComponent(item.dataset.type, item.dataset.name);
});

// Component Selection & Deletion Handlers
window.addEventListener('message', e => {
    if (e.data.type === 'LF_COMP_SELECTED') {
        DOM.compActionsSection.style.display = 'block';
    } else if (e.data.type === 'LF_COMP_DESELECTED') {
        DOM.compActionsSection.style.display = 'none';
    }
});

DOM.btnCompDelete.onclick = () => {
    const iframeDoc = DOM.iframe.contentDocument || DOM.iframe.contentWindow.document;
    const selected = iframeDoc.querySelector('.lf-component.selected');
    if (selected) {
        selected.remove();
        markAsDirty();
        DOM.compActionsSection.style.display = 'none';
        Notification.toast("컴포넌트가 삭제되었습니다.");
    }
};

init();
