/**
 * Dashboard Logic for bychoi workspace
 * Handles project listing, metadata management, and GitHub synchronization.
 */

const state = {
    projects: []
};

const DOM = {
    list: document.getElementById('file-list'),
    ghStatus: document.getElementById('gh-status'),
    btnShowAuth: document.getElementById('btn-show-auth'),
    authBtnText: document.getElementById('auth-btn-text'),
    btnCreateProject: document.getElementById('btn-create-project'),
    uploadTop: document.getElementById('file-upload-top'),
    
    // Modal DOM
    modal: document.getElementById('metadata-modal'),
    modalMainTitle: document.getElementById('modal-main-title'),
    groupIdField: document.getElementById('group-project-id'),
    metaProjectId: document.getElementById('meta-project-id'),
    modalFilenameDisplay: document.getElementById('modal-filename'),
    metaTitle: document.getElementById('meta-title'),
    metaPeriod: document.getElementById('meta-period'),
    metaAssignee: document.getElementById('meta-assignee'),
    btnModalClose: document.getElementById('btn-modal-close'),
    btnModalSave: document.getElementById('btn-modal-save'),
    
    // Auth Modal DOM
    authModal: document.getElementById('auth-modal'),
    btnAuthClose: document.getElementById('btn-modal-auth-cancel'),
    btnAuthSubmit: document.getElementById('btn-modal-auth-submit'),
    btnAuthTest: document.getElementById('btn-modal-auth-test'),
    tokenInput: document.getElementById('modal-gh-token'),
    ownerInput: document.getElementById('modal-gh-owner'),
    repoInput: document.getElementById('modal-gh-repo'),
    authStatus: document.getElementById('modal-auth-status'),

    // Global Loader DOM
    globalLoader: document.getElementById('global-loader'),
    progressBar: document.getElementById('progress-bar'),
    loaderStatus: document.getElementById('loader-status')
};

const context = {
    currentEditingProject: null,
    isCreateMode: false
};

// Initialize GitHub Status
function updateStatusUI(text, color) {
    const repoInfo = ` [${ghConfig.owner}/${ghConfig.repo}]`;
    DOM.ghStatus.innerText = text + (text.includes('에러') || text.includes('실패') ? repoInfo : '');
    if (color) DOM.ghStatus.style.color = color;
}

function checkEnvironment() {
    if (window.location.protocol === 'file:') {
        console.warn("[Env] Running on file:// protocol. This may cause CORS issues.");
        
        // Check dismissal for today
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
        
        // Animate in
        setTimeout(() => banner.classList.add('active'), 100);

        banner.querySelector('.btn-close-banner').onclick = () => {
            localStorage.setItem('hide_env_warning', today);
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 500);
        };
    }
    console.log(`[Config] Target Repo: ${ghConfig.owner}/${ghConfig.repo}`);
}

// Project List Rendering
async function refreshFileList() {
    const isGuest = ghConfig.isReadOnly;
    
    // Update Auth Button UI (IMMEDIATELY)
    if (DOM.authBtnText) DOM.authBtnText.innerText = isGuest ? '에디터 인증' : '에디터 모드';
    if (DOM.btnShowAuth) {
        DOM.btnShowAuth.style.background = isGuest ? 'rgba(255,255,255,0.05)' : 'rgba(0, 229, 255, 0.1)';
        DOM.btnShowAuth.style.color = isGuest ? '#fff' : 'var(--accent)';
    }

    if (isGuest) {
        updateStatusUI('게스트 모드 (읽기 전용) 👥', '#94a3b8');
    } else {
        updateStatusUI('', ''); 
    }
    
    try {
        const rootItems = await listRepoRoot();
        const systemFiles = ['index.html', 'viewer.html', 'stitch_ui_viewer.html'];
        const legacies = (Array.isArray(rootItems) ? rootItems : []).filter(i => 
            i.type === 'file' && 
            (i.name.endsWith('.html') || i.name.endsWith('.htm')) &&
            !systemFiles.includes(i.name.toLowerCase())
        );
        
        const dataItems = await listContents('');
        if (!Array.isArray(dataItems)) {
            throw new Error("Could not fetch project list (invalid response)");
        }
        const folders = dataItems.filter(i => i.type === 'dir' && i.name !== 'assets');

        if (legacies.length > 0) {
            console.log("[Migration] Found legacy files in root. Moving to Default_Project...");
            updateStatusUI('기존 파일 마이그레이션 중... ⏳', '#facc15');
            
            const defaultMeta = await fetchProjectMetadata('Default_Project');
            for (const f of legacies) {
                try {
                    const content = await fetchFileContent(f.name, true);
                    if (content) {
                        defaultMeta.screens = defaultMeta.screens || {};
                        defaultMeta.screens[f.name] = { updatedAt: new Date().toISOString() };
                        await uploadToProject('Default_Project', f.name, content);
                        await deleteFileFromGitHub(f.name, f.sha, true);
                    }
                } catch (e) { console.error("Migration failed for:", f.name, e); }
            }
            await saveProjectMetadata('Default_Project', defaultMeta);
            if (!folders.find(fol => fol.name === 'Default_Project')) {
                folders.push({ name: 'Default_Project', type: 'dir' });
            }
        }

        if (folders.length === 0 || !folders.find(f => f.name === 'Default_Project')) {
            folders.unshift({ name: 'Default_Project', type: 'dir' });
        }

        if (DOM.globalLoader) {
            DOM.globalLoader.classList.add('active');
            DOM.progressBar.style.width = '0%';
            DOM.loaderStatus.innerText = `프로젝트 정보를 불러오는 중... (0/${folders.length})`;
        }

        let loadedCount = 0;
        const projectData = await Promise.all(folders.map(async (folder) => {
            try {
                const meta = await fetchProjectMetadata(folder.name);
                const screens = meta.screens || meta.files || {};
                
                loadedCount++;
                if (DOM.progressBar) {
                    const percent = Math.round((loadedCount / folders.length) * 100);
                    DOM.progressBar.style.width = percent + '%';
                    DOM.loaderStatus.innerText = `프로젝트 정보를 불러오는 중... (${loadedCount}/${folders.length})`;
                }

                return {
                    name: folder.name, meta: meta, screens: Object.keys(screens).length
                };
            } catch (e) {
                loadedCount++;
                return { name: folder.name, meta: {title: folder.name}, screens: 0 };
            }
        }));

        state.projects = projectData;
        renderList();
        
        setTimeout(() => {
            if (DOM.globalLoader) DOM.globalLoader.classList.remove('active');
        }, 500);
        updateStatusUI(isGuest ? '게스트 모드 (읽기 전용) 👥' : '', isGuest ? '#94a3b8' : '#4ade80');
    } catch (err) {
        console.error("refreshFileList error:", err);
        updateStatusUI('연결 확인 필요 ⚠️', '#fb923c');
        DOM.list.innerHTML = `
            <div class="empty-text" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 16px; opacity:0.5;">📡</div>
                <div style="font-weight: 600; margin-bottom: 8px;">데이터를 불러오는 데 어려움이 있습니다.</div>
                <div style="font-size: 13px; color: var(--text-dim); margin-bottom: 24px; line-height: 1.6;">
                    원격 저장소에 접근할 수 없거나 토큰 권한이 만료되었을 수 있습니다.<br>
                    설정을 확인하거나 잠시 후 다시 시도해 주세요.
                </div>
                <button onclick="location.reload()" class="btn-secondary" style="width:auto; padding: 0 20px;">
                    <span class="material-icons-outlined" style="font-size:18px; margin-right:6px;">refresh</span>
                    새로고침
                </button>
            </div>`;
    } finally {
        const loading = document.getElementById('loading-state');
        if (loading) loading.style.display = 'none';
    }
}

async function showAuthModal() {
    if (DOM.ownerInput) DOM.ownerInput.value = ghConfig.owner;
    if (DOM.repoInput) DOM.repoInput.value = ghConfig.repo;
    if (DOM.tokenInput) DOM.tokenInput.value = ghConfig.token || '';
    if (DOM.authModal) DOM.authModal.classList.add('active');
}
function hideAuthModal() {
    if (DOM.authModal) DOM.authModal.classList.remove('active');
    if (DOM.authStatus) DOM.authStatus.innerText = "";
}
async function handleAuthSubmit() {
    const config = {
        token: DOM.tokenInput.value.trim(),
        owner: DOM.ownerInput.value.trim(),
        repo: DOM.repoInput.value.trim()
    };

    const success = await verifyConnection(config, (msg, color) => {
        DOM.authStatus.innerText = msg;
        DOM.authStatus.style.color = color;
    });

    if (success) {
        ghConfig.owner = config.owner;
        ghConfig.repo = config.repo;
        ghConfig.token = config.token;
        setTimeout(() => {
            hideAuthModal();
            location.reload(); 
        }, 1000);
    }
}

async function handleAuthTest() {
    const config = {
        token: DOM.tokenInput.value.trim(), owner: DOM.ownerInput.value.trim(), repo: DOM.repoInput.value.trim()
    };
    await verifyConnection(config, (msg, color) => {
        DOM.authStatus.innerText = msg;
        DOM.authStatus.style.color = color;
    });
}

async function renderList() {
    if (state.projects.length === 0) {
        DOM.list.innerHTML = `<div class="empty-text" style="grid-column: 1 / -1;">프로젝트가 없습니다.</div>`;
        return;
    }
    DOM.list.innerHTML = '';
    for (const p of state.projects) {
        const card = document.createElement('a');
        card.className = 'file-card';
        const firstScreen = Object.keys(p.meta.screens || {})[0] || '';
        card.href = `viewer.html?project=${encodeURIComponent(p.name)}${firstScreen ? '&file='+encodeURIComponent(firstScreen) : ''}`;
        
        const m = p.meta;
        const mainTitle = m.title || p.name;
        const subInfo = `${p.screens} screens • ${p.name}`;

        card.innerHTML = `
            <div class="edit-btn-card" data-project="${p.name}" title="정보 수정">
                <span class="material-icons-outlined">edit</span>
            </div>
            <div class="delete-btn-card" data-project="${p.name}" title="프로젝트 삭제">
                <span class="material-icons-outlined">delete_outline</span>
            </div>
            <div class="thumbnail-wrapper" style="background: linear-gradient(135deg, #1e293b, #0f172a);">
                <div class="icon-wrapper" style="width: 100%; height: 100%;">
                    <span class="material-icons-outlined" style="font-size: 48px; opacity: 0.6; color: var(--accent);">folder</span>
                </div>
            </div>
            <div class="card-info">
                <div class="card-name" title="${mainTitle}">${mainTitle}</div>
                <div class="card-meta">${subInfo}</div>
            </div>
        `;
        DOM.list.appendChild(card);
    }
}

document.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('.delete-btn-card');
    const editBtn = e.target.closest('.edit-btn-card');

    if (editBtn) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        openEditProjectModal(editBtn.dataset.project);
    }

    if (delBtn) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        const projectName = delBtn.dataset.project;
        const confirmed = await Notification.confirm(`'${projectName}' 프로젝트와 모든 관련 파일을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`, "프로젝트 삭제");
        if (confirmed) {
            const success = await deleteProjectWithContents(projectName, updateStatusUI);
            if (success) {
                state.projects = state.projects.filter(p => p.name !== projectName);
                renderList();
                setTimeout(() => refreshFileList(), 1500);
            }
        }
    }
});

function formatKODateRange(selectedDates) {
    if (selectedDates.length !== 2) return '';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        return `${year}.${month}.${date}(${days[d.getDay()]})`;
    };
    return `${format(selectedDates[0])} ~ ${format(selectedDates[1])}`;
}

function initDatePicker(defaultValue = null) {
    flatpickr(DOM.metaPeriod, {
        mode: "range", locale: "ko", dateFormat: "Y.m.d",
        defaultDate: defaultValue ? defaultValue.split(' ~ ') : null,
        onChange: (selectedDates) => {
            if (selectedDates.length === 2) {
                DOM.metaPeriod.value = formatKODateRange(selectedDates);
            }
        }
    });
}

DOM.btnCreateProject.onclick = async () => {
    if (ghConfig.isReadOnly) return showAuthModal();
    context.isCreateMode = true;
    context.currentEditingProject = null;
    DOM.modalMainTitle.innerText = "새 프로젝트 생성";
    DOM.groupIdField.style.display = "none";
    DOM.modalFilenameDisplay.innerText = "새로운 프로젝트를 생성합니다. 제목을 입력하면 ID가 자동 생성됩니다.";
    DOM.metaProjectId.value = "";
    DOM.metaTitle.value = "";
    DOM.metaPeriod.value = "";
    DOM.metaAssignee.value = "";
    initDatePicker();
    DOM.modal.classList.add('active');
    DOM.metaTitle.oninput = () => {
        if (context.isCreateMode) DOM.metaProjectId.value = slugify(DOM.metaTitle.value);
    };
};

async function openEditProjectModal(projectName) {
    context.isCreateMode = false;
    context.currentEditingProject = projectName;
    DOM.modalMainTitle.innerText = "프로젝트 정보 수정";
    DOM.groupIdField.style.display = "none";
    updateStatusUI('메타데이터 로딩 중... ⏳', '#facc15');
    const m = await fetchProjectMetadata(projectName);
    DOM.modalFilenameDisplay.innerText = `Project: ${projectName}`;
    DOM.metaTitle.value = m.title || '';
    DOM.metaPeriod.value = m.period || '';
    DOM.metaAssignee.value = m.assignee || '';
    initDatePicker(m.period);
    DOM.modal.classList.add('active');
}

DOM.btnModalClose.onclick = () => DOM.modal.classList.remove('active');

DOM.btnModalSave.onclick = async () => {
    if (context.isCreateMode && !DOM.metaProjectId.value.trim()) {
        await Notification.alert("프로젝트 ID를 입력해주세요.", "필수 확인");
        return;
    }
    const projectName = context.isCreateMode ? DOM.metaProjectId.value.trim() : context.currentEditingProject;
    const originalText = DOM.btnModalSave.innerText;
    DOM.btnModalSave.innerText = '저장 중...';
    DOM.btnModalSave.disabled = true;
    DOM.btnModalSave.style.opacity = '0.7';
    
    const data = {
        projectMeta: {
            title: DOM.metaTitle.value.trim(), period: DOM.metaPeriod.value.trim(), assignee: DOM.metaAssignee.value.trim()
        }
    };

    try {
        const success = await updateScreenMetadata(projectName, null, data, (msg, color) => {
            DOM.btnModalSave.innerText = msg;
            DOM.btnModalSave.style.background = color;
            if (color === '#4ade80') {
                setTimeout(() => {
                    DOM.modal.classList.remove('active');
                    DOM.btnModalSave.innerText = originalText;
                    DOM.btnModalSave.disabled = false;
                    DOM.btnModalSave.style.opacity = '';
                    DOM.btnModalSave.style.background = '';
                    refreshFileList();
                }, context.isCreateMode ? 2000 : 1000);
            }
        });
        if (!success) {
            DOM.btnModalSave.disabled = false; DOM.btnModalSave.style.opacity = '';
        }
    } catch (err) {
        console.error("[ModalSave] Error:", err);
        DOM.btnModalSave.innerText = "에러 발생 ❌";
        DOM.btnModalSave.style.background = "#ef4444";
        DOM.btnModalSave.disabled = false;
        DOM.btnModalSave.style.opacity = '';
        await Notification.alert(`저장 중 오류가 발생했습니다: ${err.message}`, "저장 오류", "error");
    }
};

async function handleFiles(fileList) {
    const newFiles = Array.from(fileList).filter(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
    if (newFiles.length === 0) return;
    const targetProject = await Notification.prompt("파일을 업로드할 프로젝트 이름을 입력하세요.", "Default_Project", "파일 업로드");
    if (targetProject === null) return;

    for (const file of newFiles) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const content = ev.target.result;
            const success = await uploadToProject(targetProject, file.name, content, updateStatusUI);
            if (success) {
                const meta = await fetchProjectMetadata(targetProject);
                meta.screens = meta.screens || {};
                meta.screens[file.name] = { updatedAt: new Date().toISOString() };
                await saveProjectMetadata(targetProject, meta);
                refreshFileList();
            }
        };
        reader.readAsText(file);
    }
}

if (DOM.uploadTop) {
    DOM.uploadTop.addEventListener('change', async (e) => {
        if (ghConfig.isReadOnly) {
            e.preventDefault(); showAuthModal(); e.target.value = ''; return;
        }
        await handleFiles(e.target.files);
        e.target.value = '';
    });
}

if (DOM.btnShowAuth) DOM.btnShowAuth.onclick = () => showAuthModal();
if (DOM.btnAuthSubmit) DOM.btnAuthSubmit.onclick = handleAuthSubmit;
if (DOM.btnAuthTest) DOM.btnAuthTest.onclick = handleAuthTest;
if (DOM.btnAuthClose) DOM.btnAuthClose.onclick = hideAuthModal;
if (DOM.tokenInput) DOM.tokenInput.onkeyup = (e) => { if(e.key==='Enter') handleAuthSubmit(); };

window.addEventListener('dragover', (e) => {
    e.preventDefault(); if (ghConfig.isReadOnly) return;
    document.body.classList.add('drag-active');
});
window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null) document.body.classList.remove('drag-active');
});
window.addEventListener('drop', async (e) => {
    e.preventDefault(); document.body.classList.remove('drag-active');
    if (e.dataTransfer.files) await handleFiles(e.dataTransfer.files);
});

// Splash Screen Killer
(function() {
    const intro = document.getElementById('intro-overlay');
    if (!intro) return;
    const dismiss = () => {
        intro.style.opacity = '0';
        intro.style.pointerEvents = 'none';
        setTimeout(() => { if (intro.parentNode) intro.remove(); document.body.style.overflow = 'auto'; }, 1000);
    };
    setTimeout(dismiss, 800);
    window.addEventListener('load', () => setTimeout(dismiss, 1200));
    intro.addEventListener('click', dismiss);
})();

// Start system
checkEnvironment();
refreshFileList();
