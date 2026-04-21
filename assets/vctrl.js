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
    editMode: false,
    activeElement: null
};

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

/**
 * LF Editor Studio - Core Logic
 */
async function toggleEditMode() {
    if (state.isReadOnly) return showAuthModal();
    if (!state.activeFile) return;

    state.editMode = !state.editMode;
    DOM.btnEditMode.classList.toggle('active', state.editMode);
    DOM.editorControls.style.display = state.editMode ? 'flex' : 'none';

    if (state.editMode) {
        setTool('select'); // Force select tool for editing
        injectEditorUI();
    } else {
        removeEditorUI();
    }
    
    console.log(`[Editor] Studio Mode: ${state.editMode ? 'ENABLED' : 'DISABLED'}`);
}

function injectEditorUI() {
    const doc = DOM.iframe.contentDocument;
    if (!doc) return;

    // 1. Inject Styles
    if (!doc.getElementById('editor-studio-styles')) {
        const style = doc.createElement('style');
        style.id = 'editor-studio-styles';
        style.innerHTML = `
            .editor-editable:hover { outline: 2px solid #22d3ee !important; cursor: pointer !important; }
            .editor-editable.active { outline: 2px solid #6366f1 !important; box-shadow: 0 0 10px rgba(99,102,241,0.3) !important; }
            [contenteditable="true"]:focus { outline: none !important; background: rgba(99,102,241,0.05) !important; }
        `;
        doc.head.appendChild(style);
    }

    // 2. Scan & Make Editable
    // Target common text elements first
    doc.querySelectorAll('div, p, span, h1, h2, h3, h4, h5, h6, td, th').forEach(el => {
        if (el.children.length === 0 || (el.children.length === 1 && el.children[0].tagName === 'BR')) {
            el.classList.add('editor-editable');
            el.contentEditable = "true";
            
            el.addEventListener('focus', () => {
                state.activeElement = el;
                showFloatingToolbar(el);
            });
            el.addEventListener('input', () => markAsDirty());
        }
    });

    // 3. Block selection for non-text
    doc.querySelectorAll('img, table, .gantt-container').forEach(el => {
        el.classList.add('editor-editable');
        el.style.pointerEvents = 'auto';
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            state.activeElement = el;
            showFloatingToolbar(el);
        });
    });
}

function removeEditorUI() {
    const doc = DOM.iframe.contentDocument;
    if (!doc) return;
    doc.querySelectorAll('.editor-editable').forEach(el => {
        el.classList.remove('editor-editable', 'active');
        el.contentEditable = "false";
    });
    const s = doc.getElementById('editor-studio-styles');
    if (s) s.remove();
    hideFloatingToolbar();
}

function showFloatingToolbar(el) {
    const rect = el.getBoundingClientRect();
    const iframeRect = DOM.iframe.getBoundingClientRect();
    
    // Position toolbar above the element
    const top = iframeRect.top + rect.top - 50;
    const left = iframeRect.left + rect.left + (rect.width/2);
    
    DOM.floatingToolbar.style.top = `${top}px`;
    DOM.floatingToolbar.style.left = `${left}px`;
    DOM.floatingToolbar.style.transform = `translate(-50%, ${state.editMode ? 0 : 10}px)`;
    DOM.floatingToolbar.classList.add('active');
    DOM.floatingToolbar.style.display = 'flex';
}

function hideFloatingToolbar() {
    DOM.floatingToolbar.classList.remove('active');
    setTimeout(() => {
        if (!DOM.floatingToolbar.classList.contains('active')) {
            DOM.floatingToolbar.style.display = 'none';
        }
    }, 200);
}

function serializeIframeContent() {
    const doc = DOM.iframe.contentDocument;
    if (!doc) return null;
    
    // Clone document to clean it
    const clone = doc.documentElement.cloneNode(true);
    
    // Cleanup editor artifacts
    clone.querySelectorAll('.editor-editable').forEach(el => {
        el.classList.remove('editor-editable', 'active');
        el.removeAttribute('contenteditable');
    });
    const s = clone.querySelector('#editor-studio-styles');
    if (s) s.remove();
    
    return "<!DOCTYPE html>\n" + clone.outerHTML;
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
    btnToggleLeft: document.getElementById('btn-toggle-left'),
    btnToggleRight: document.getElementById('btn-toggle-right'),
    btnGlobalSave: document.getElementById('btn-global-save'),
    btnEditMode: document.getElementById('btn-edit-mode'),
    editorControls: document.getElementById('editor-controls'),
    floatingToolbar: document.getElementById('floating-toolbar'),
    ftBtnBold: document.getElementById('ft-btn-bold'),
    ftBtnItalic: document.getElementById('ft-btn-italic'),
    ftBtnColor: document.getElementById('ft-btn-color'),
    ftBtnDelete: document.getElementById('ft-btn-delete'),
    
    // Screen Management
    btnAddScreen: document.getElementById('btn-add-screen'),
    addScreenUpload: document.getElementById('add-screen-upload'),
    addScreenModal: document.getElementById('add-screen-modal'),
    btnCancelAdd: document.getElementById('btn-add-screen-cancel'),
    btnSubmitAdd: document.getElementById('btn-add-screen-submit'),
    btnUploadLocal: document.getElementById('btn-upload-local'),
    newScreenName: document.getElementById('new-screen-name'),
    templateList: document.getElementById('template-list'),
    
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
    btnAuthSubmit: document.getElementById('modal-auth-submit'),
    btnAuthClose: document.getElementById('modal-auth-close'),
    btnShowAuth: document.getElementById('btn-show-auth')
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

        const btnAuthText = document.getElementById('auth-btn-text');
        if (btnAuthText) btnAuthText.innerText = state.isReadOnly ? '에디터 인증' : '에디터 모드';
        if (DOM.btnShowAuth) DOM.btnShowAuth.style.color = state.isReadOnly ? '#fff' : 'var(--accent)';

    } catch (err) {
        console.error("Initialization failed:", err);
        if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "초기화 오류가 발생했습니다. 콘솔을 확인하세요.";
    } finally {
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
    showLoading("Loading: " + fileName);
    DOM.placeholder.style.display = 'none';
    
    const content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) {
        hideLoading();
        DOM.placeholder.style.display = 'flex';
        DOM.placeholderTxt.innerText = "파일을 불러오지 못했습니다.";
        return;
    }

    const blob = new Blob([content], {type: 'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    
    DOM.iframe.onload = () => {
        hideLoading();
        DOM.iframe.onload = null;
    };

    DOM.iframe.src = url;
    DOM.iframe.style.display = 'block';

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
        pin.className = 'pin-marker';
        pin.dataset.index = index;
        pin.innerText = index + 1;
        
        const highlight = (active) => { pin.classList.toggle('highlight', active); row.classList.toggle('highlight', active); };
        pin.onmouseenter = () => highlight(true);
        pin.onmouseleave = () => highlight(false);
        row.onmouseenter = () => highlight(true);
        row.onmouseleave = () => highlight(false);

        DOM.descriptionList.appendChild(row);
        DOM.pinsLayer.appendChild(pin);
        
        // Initial Position via Vanilla (centered) - MUST BE IN DOM FIRST
        pin.style.left = (item.x || 0) + "%";
        pin.style.top = (item.y || 0) + "%";
        // transform: translate(-50%, -50%) is handled in CSS for better performance

        // Robust Vanilla JS Dragging Implementation
        pin.style.cursor = 'grab';
        pin.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            
            const startX = e.clientX;
            const startY = e.clientY;
            const initialItemX = item.x || 0;
            const initialItemY = item.y || 0;
            const r = DOM.pinsLayer.getBoundingClientRect();

            // Event Shield: Prevent iframe from stealing focus during drag
            if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
            document.body.style.cursor = 'grabbing';

            pin.style.cursor = 'grabbing';
            pin.style.transition = 'none'; 
            pin.style.zIndex = '1000';
            pin.classList.add('active');
            highlight(true);

            const onMouseMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                
                item.x = Math.max(0, Math.min(initialItemX + (dx / r.width) * 100, 100));
                item.y = Math.max(0, Math.min(initialItemY + (dy / r.height) * 100, 100));
                
                pin.style.left = item.x + "%";
                pin.style.top = item.y + "%";
            };

            const onMouseUp = () => {
                // Restore interaction
                if (DOM.iframe) DOM.iframe.style.pointerEvents = (state.tool === 'hand') ? 'none' : 'auto';
                document.body.style.cursor = '';

                pin.style.cursor = 'grab';
                pin.style.transition = ''; 
                pin.style.zIndex = '10';
                pin.classList.remove('active');
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                highlight(false);
                
                // Track change
                if (initialItemX !== item.x || initialItemY !== item.y) {
                    markAsDirty();
                }
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

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

    // Phase 1: Serialized HTML Save
    const htmlContent = state.editMode ? serializeIframeContent() : null;
    
    const success = await updateScreenMetadata(state.currentProject, state.activeFile.name, { 
        projectMeta, 
        description: state.activeFile.meta.description,
        htmlContent // Pass the serialized HTML if in edit mode
    }, (msg, color) => {
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
    DOM.canvas.classList.toggle('hand-active', t === 'hand');
    DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
}

/**
 * Event Listeners
 */
DOM.pinsLayer.onclick = (e) => {
    if (state.isReadOnly || !state.activeFile || state.tool !== 'select' || e.target !== DOM.pinsLayer) return;
    const r = DOM.pinsLayer.getBoundingClientRect();
    state.activeFile.meta.description.push({ text: '', x: Math.max(0, Math.min(((e.clientX - r.left)/r.width)*100, 100)), y: Math.max(0, Math.min(((e.clientY - r.top)/r.height)*100, 100)) });
    markAsDirty();
    renderDescriptionList();
    setTimeout(() => DOM.descriptionList.querySelectorAll('.desc-input').slice(-1)[0]?.focus(), 50);
};

if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => { const c = DOM.sidebarLeft?.classList.toggle('collapsed'); if (DOM.btnToggleLeft.querySelector('span')) DOM.btnToggleLeft.querySelector('span').innerText = c ? 'chevron_right' : 'chevron_left'; setTimeout(centerView, 300); };
if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => { const c = DOM.sidebarRight?.classList.toggle('collapsed'); if (DOM.btnToggleRight.querySelector('span')) DOM.btnToggleRight.querySelector('span').innerText = c ? 'chevron_left' : 'chevron_right'; setTimeout(centerView, 300); };

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
if (DOM.btnShowAuth) DOM.btnShowAuth.onclick = showAuthModal;
if (DOM.btnAuthSubmit) DOM.btnAuthSubmit.onclick = handleAuthSubmit;
if (DOM.btnAuthClose) DOM.btnAuthClose.onclick = hideAuthModal;
if (DOM.tokenInput) DOM.tokenInput.onkeyup = (e) => { if(e.key==='Enter') handleAuthSubmit(); };
if (DOM.btnCancelEdit) DOM.btnCancelEdit.onclick = () => DOM.editScreenModal?.classList.remove('active');

if (DOM.btnEditMode) DOM.btnEditMode.onclick = toggleEditMode;
if (DOM.ftBtnBold) DOM.ftBtnBold.onclick = () => { document.execCommand('bold', false); markAsDirty(); };
if (DOM.ftBtnItalic) DOM.ftBtnItalic.onclick = () => { document.execCommand('italic', false); markAsDirty(); };
if (DOM.ftBtnColor) DOM.ftBtnColor.onclick = () => { document.execCommand('foreColor', false, '#e60012'); markAsDirty(); };
if (DOM.ftBtnDelete) DOM.ftBtnDelete.onclick = async () => { if (state.activeElement && await Notification.confirm("이 요소를 영구적으로 삭제하시겠습니까?", "요소 삭제")) { state.activeElement.remove(); hideFloatingToolbar(); markAsDirty(); } };

window.addEventListener('keydown', async e => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if(e.code === 'KeyE') { e.preventDefault(); toggleEditMode(); }
    if(e.key === 'Escape') {
        if (state.editMode) return toggleEditMode();
        if (await checkUnsavedChanges()) {
            window.location.href = 'index.html';
        }
    }
    if(e.code === 'Space' && state.tool !== 'hand') { DOM.canvas.classList.add('hand-active'); DOM.iframe.style.pointerEvents = 'none'; }
    if(e.code === 'KeyV') setTool('select');
    if(e.code === 'KeyH') setTool('hand');
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

init();
