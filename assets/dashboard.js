/**
 * Dashboard Logic for bychoi workspace
 * Handles project listing, metadata management, and GitHub synchronization.
 */

const state = {
    projects: [],
    deletedProjects: new Set() // Blacklist for zombie projects
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
    metaJira: document.getElementById('meta-jira'),
    metaFigma: document.getElementById('meta-figma'),
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

// Premium Card Themes Config
const PREMIUM_THEMES = [
    {
        name: "Indigo Breeze",
        gradient: "linear-gradient(135deg, #4f46e5, #818cf8)",
        iconColor: "#ffffff",
        glowColor: "rgba(99, 102, 241, 0.4)",
        icon: "folder"
    },
    {
        name: "Sunset Glow",
        gradient: "linear-gradient(135deg, #f97316, #fca5a5)",
        iconColor: "#ffffff",
        glowColor: "rgba(249, 115, 22, 0.4)",
        icon: "insights"
    },
    {
        name: "Emerald Forest",
        gradient: "linear-gradient(135deg, #10b981, #6ee7b7)",
        iconColor: "#ffffff",
        glowColor: "rgba(16, 185, 129, 0.4)",
        icon: "account_tree"
    },
    {
        name: "Oceanic Teal",
        gradient: "linear-gradient(135deg, #06b6d4, #67e8f9)",
        iconColor: "#ffffff",
        glowColor: "rgba(6, 182, 212, 0.4)",
        icon: "database"
    },
    {
        name: "Rose Plum",
        gradient: "linear-gradient(135deg, #db2777, #fbcfe8)",
        iconColor: "#ffffff",
        glowColor: "rgba(219, 39, 119, 0.4)",
        icon: "dashboard"
    },
    {
        name: "Royal Violet",
        gradient: "linear-gradient(135deg, #7c3aed, #c4b5fd)",
        iconColor: "#ffffff",
        glowColor: "rgba(124, 58, 237, 0.4)",
        icon: "grid_view"
    },
    {
        name: "Amber Sunset",
        gradient: "linear-gradient(135deg, #d97706, #fde047)",
        iconColor: "#ffffff",
        glowColor: "rgba(217, 119, 6, 0.4)",
        icon: "calendar_month"
    },
    {
        name: "Cyber Coral",
        gradient: "linear-gradient(135deg, #f43f5e, #fda4af)",
        iconColor: "#ffffff",
        glowColor: "rgba(244, 63, 94, 0.4)",
        icon: "layers"
    }
];

// Deterministic seed-based theme picker
function getDeterministicTheme(projectName) {
    let hash = 0;
    for (let i = 0; i < projectName.length; i++) {
        hash = projectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PREMIUM_THEMES.length;
    return PREMIUM_THEMES[index];
}

// Render dynamic theme presets inside project edit modal
function renderThemePresets(selectedThemeIndex) {
    const container = document.getElementById('theme-presets');
    if (!container) return;
    container.innerHTML = '';
    
    // Auto-select option (uses deterministic hash background)
    const autoDiv = document.createElement('div');
    autoDiv.className = `theme-preset-item ${selectedThemeIndex === -1 ? 'active' : ''}`;
    autoDiv.dataset.index = "-1";
    autoDiv.style.background = "linear-gradient(135deg, #1e293b, #0f172a)";
    autoDiv.title = "자동 지정 (Deterministic Theme)";
    autoDiv.innerHTML = `<span class="material-icons-outlined" style="font-size: 16px; color: #fff;">auto_awesome</span>`;
    container.appendChild(autoDiv);

    PREMIUM_THEMES.forEach((t, idx) => {
        const item = document.createElement('div');
        item.className = `theme-preset-item ${selectedThemeIndex === idx ? 'active' : ''}`;
        item.dataset.index = idx.toString();
        item.style.background = t.gradient;
        item.title = t.name;
        item.innerHTML = `<span class="material-icons-outlined" style="font-size: 14px; color: ${t.iconColor};">${t.icon}</span>`;
        container.appendChild(item);
    });

    // Preset click handler
    container.querySelectorAll('.theme-preset-item').forEach(item => {
        item.onclick = () => {
            container.querySelectorAll('.theme-preset-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            const indexInput = document.getElementById('meta-theme-index');
            if (indexInput) indexInput.value = item.dataset.index;
        };
    });
}


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
    updateStatusUI('', ''); 
    
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
        let folders = dataItems.filter(i => i.type === 'dir' && i.name !== 'assets');
        folders = folders.filter(f => !state.deletedProjects.has(f.name));

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

        state.projects = projectData.filter(p => !state.deletedProjects.has(p.name));
        renderList();
        
        setTimeout(() => {
            if (DOM.globalLoader) DOM.globalLoader.classList.remove('active');
        }, 500);
        updateStatusUI('', '');
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

// Compute the latest update date from a project's screens and metadata
function getLatestUpdateDate(meta) {
    let latest = null;
    if (meta.screens) {
        for (const file in meta.screens) {
            const sc = meta.screens[file];
            if (sc.updatedAt) {
                const date = new Date(sc.updatedAt);
                if (!latest || date > latest) latest = date;
            }
        }
    }
    if (meta.updatedAt) {
        const date = new Date(meta.updatedAt);
        if (!latest || date > latest) latest = date;
    }
    return latest;
}

// Format Date object to a human-readable relative string
function formatRelativeTime(date) {
    if (!date || isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
}

// Ensure a date string has a day of week in parentheses
function ensureDayOfWeek(dateStr) {
    if (!dateStr) return '';
    const trimmed = dateStr.trim();
    if (trimmed.includes('(')) return trimmed;
    
    // Check YYYY.MM.DD or YYYY-MM-DD format
    const match = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return `${match[1]}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}(${days[d.getDay()]})`;
        }
    }
    return trimmed;
}


async function renderList(projectsToRender = state.projects) {
    if (projectsToRender.length === 0) {
        const isSearch = document.getElementById('project-search-input') && document.getElementById('project-search-input').value.trim() !== '';
        const msg = isSearch ? "검색된 프로젝트가 없습니다." : "생성된 프로젝트가 없습니다. 우측 상단의 New Project 버튼을 눌러 새 프로젝트를 생성해주세요.";
        DOM.list.innerHTML = `
            <div class="empty-text" style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; background: rgba(30, 41, 59, 0.4); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                <span class="material-icons-outlined" style="font-size: 48px; color: var(--accent); opacity: 0.6; margin-bottom: 16px; display: block;">create_new_folder</span>
                <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">프로젝트가 비어 있습니다</div>
                <div style="font-size: 13px; color: var(--text-secondary);">${msg}</div>
            </div>`;
        return;
    }
    DOM.list.innerHTML = '';
    for (const p of projectsToRender) {
        const card = document.createElement('a');
        card.className = 'file-card';
        card.href = `viewer.html?project=${encodeURIComponent(p.name)}`;
        
        const m = p.meta;
        const mainTitle = m.title || p.name;
        const subInfo = `${p.screens} screens • ${p.name}`;

        // Get Theme config (use user custom index, otherwise deterministically pick from seed)
        const themeIndex = (m && m.themeIndex !== undefined) ? parseInt(m.themeIndex) : -1;
        const theme = (themeIndex >= 0 && themeIndex < PREMIUM_THEMES.length) 
            ? PREMIUM_THEMES[themeIndex] 
            : getDeterministicTheme(p.name);

        // Abbreviate project name (e.g. "[과제] 온오프 재고" -> "온오")
        const cleanTitle = mainTitle.replace(/\[[^\]]+\]/g, '').trim();
        const abbrText = cleanTitle.slice(0, 2).toUpperCase() || p.name.slice(0, 2).toUpperCase();

        const hasMeta = (m.assignee && m.assignee.trim()) || 
                        (m.period && m.period.trim()) || 
                        (m.jira && m.jira.trim()) || 
                        (m.figmaUrl && m.figmaUrl.trim());

        let chipsHtml = '';
        if (hasMeta) {
            chipsHtml += `<div class="card-meta-chips">`;
            if (m.assignee && m.assignee.trim()) {
                chipsHtml += `
                    <div class="meta-chip meta-chip-assignee" title="담당자: ${m.assignee}">
                        <span class="material-icons-outlined">person</span>
                        <span>${m.assignee}</span>
                    </div>`;
            }
            if (m.period && m.period.trim()) {
                const rawPeriod = m.period.includes(' ~ ') ? m.period.split(' ~ ')[0] : m.period;
                const displayPeriod = ensureDayOfWeek(rawPeriod);
                chipsHtml += `
                    <div class="meta-chip meta-chip-period" title="기간: ${m.period}">
                        <span class="material-icons-outlined">event</span>
                        <span>${displayPeriod}</span>
                    </div>`;
            }
            if (m.jira && m.jira.trim()) {
                chipsHtml += `
                    <div class="meta-chip meta-chip-jira" title="Jira ID: ${m.jira}">
                        <span class="material-icons-outlined">confirmation_number</span>
                        <span>${m.jira}</span>
                    </div>`;
            }
            if (m.figmaUrl && m.figmaUrl.trim()) {
                chipsHtml += `
                    <a href="${m.figmaUrl}" target="_blank" class="meta-chip meta-chip-figma" title="Figma 바로가기">
                        <span class="material-icons-outlined">brush</span>
                        <span>Figma</span>
                    </a>`;
            }
            chipsHtml += `</div>`;
        } else {
            const latestDate = getLatestUpdateDate(m);
            const relativeTime = formatRelativeTime(latestDate);
            const updateStr = relativeTime ? `${relativeTime} 업데이트` : '업데이트 없음';
            
            chipsHtml += `
                <div class="card-meta-chips">
                    <div class="meta-chip meta-chip-update" title="${updateStr}">
                        <span class="material-icons-outlined">schedule</span>
                        <span>${updateStr}</span>
                    </div>
                    <div class="meta-chip meta-chip-add-cta" data-project="${p.name}" title="프로젝트 정보 입력하기">
                        <span class="material-icons-outlined">add</span>
                        <span>정보 입력하기</span>
                    </div>
                </div>`;
        }

        card.innerHTML = `
            <div class="pdf-btn-card" data-project="${p.name}" title="프로젝트 전체 스크린 PDF 다운로드">
                <span class="material-icons-outlined">picture_as_pdf</span>
            </div>
            <div class="edit-btn-card" data-project="${p.name}" title="정보 수정">
                <span class="material-icons-outlined">edit</span>
            </div>
            <div class="delete-btn-card" data-project="${p.name}" title="프로젝트 삭제">
                <span class="material-icons-outlined">delete_outline</span>
            </div>
            <div class="thumbnail-wrapper" style="background: ${theme.gradient}; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: 16/10; border-radius: 12px; transition: all 0.4s ease; border: 1px solid rgba(255,255,255,0.08);">
                
                <!-- Glowing Ambient Orbs -->
                <div class="thumbnail-glow-orb" style="position: absolute; width: 130px; height: 130px; background: ${theme.glowColor}; border-radius: 50%; filter: blur(28px); bottom: -30px; right: -30px; opacity: 0.85; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); pointer-events: none;"></div>
                <div class="thumbnail-glow-orb-top" style="position: absolute; width: 90px; height: 90px; background: rgba(255,255,255,0.18); border-radius: 50%; filter: blur(18px); top: -20px; left: -20px; opacity: 0.6; pointer-events: none;"></div>
                
                <!-- Frosted Glass Icon Plate -->
                <div class="frosted-glass-pane" style="position: relative; width: 66px; height: 66px; background: rgba(255, 255, 255, 0.16); border: 1.6px solid rgba(255, 255, 255, 0.28); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.2); transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); z-index: 2; pointer-events: none;">
                    <span class="material-icons-outlined" style="font-size: 32px; color: ${theme.iconColor}; text-shadow: 0 2px 8px rgba(0,0,0,0.15);">${theme.icon}</span>
                </div>
                
                <!-- Floating Category/Abbr Badge -->
                <div class="abbr-badge" style="position: absolute; bottom: 12px; left: 12px; padding: 4px 10px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.14); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-radius: 20px; color: rgba(255,255,255,0.92); font-size: 10px; font-weight: 700; letter-spacing: 0.5px; z-index: 2; pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                    ${abbrText}
                </div>
            </div>
            <div class="card-info">
                <div class="card-name" title="${mainTitle}">${mainTitle}</div>
                <div class="card-meta" style="margin-bottom: 8px;">${subInfo}</div>
                ${chipsHtml}
            </div>
        `;
        DOM.list.appendChild(card);
    }
}

document.addEventListener('click', async (e) => {
    const pdfBtn = e.target.closest('.pdf-btn-card');
    const delBtn = e.target.closest('.delete-btn-card');
    const editBtn = e.target.closest('.edit-btn-card');
    const figmaLink = e.target.closest('.meta-chip-figma');
    const addCta = e.target.closest('.meta-chip-add-cta');

    if (pdfBtn) {
        e.preventDefault(); e.stopPropagation();
        const projName = pdfBtn.dataset.project;
        const targetProj = state.projects.find(p => p.name === projName);
        exportProjectToPDF(projName, targetProj ? targetProj.meta : null);
    }

    if (figmaLink) {
        e.stopPropagation();
    }

    if (addCta) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        openEditProjectModal(addCta.dataset.project);
    }

    if (editBtn) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        openEditProjectModal(editBtn.dataset.project);
    }

    if (delBtn) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        const projectName = delBtn.dataset.project;
        
        const confirmed = await Notification.confirm(`'${projectName}' 프로젝트와 모든 관련 파일을 삭제하시겠습니까?\n이 작업은 절대 되돌릴 수 없습니다.`, "프로젝트 영구 삭제");
        if (confirmed) {
            updateStatusUI('프로젝트 삭제 중... ⏳', '#f87171');
            
            // 게이지바 초기화 및 활성화
            let deleteProgress = 10;
            if (DOM.globalLoader) {
                DOM.globalLoader.classList.add('active');
                DOM.loaderStatus.innerText = '삭제 대상 분석 중...';
                if (DOM.progressBar) DOM.progressBar.style.width = deleteProgress + '%';
            }

            // 커스텀 로딩 상태 업데이트 콜백 정의
            const deleteStatusCallback = (text, color) => {
                updateStatusUI(text, color);
                if (DOM.globalLoader) {
                    if (DOM.loaderStatus) DOM.loaderStatus.innerText = text;
                    if (DOM.progressBar) {
                        deleteProgress = Math.min(deleteProgress + 8, 95); // 95%까지 서서히 증가
                        DOM.progressBar.style.width = deleteProgress + '%';
                    }
                }
            };

            const success = await deleteProjectWithContents(projectName, deleteStatusCallback);
            if (success) {
                // UI 즉시 반영 + 블랙리스트 등록 (UI에서 완전히 제거)
                state.deletedProjects.add(projectName);
                state.projects = state.projects.filter(p => p.name !== projectName);
                renderList();
                
                if (DOM.progressBar) DOM.progressBar.style.width = '100%';
                updateStatusUI(`'${projectName}' 삭제 완료`, '#4ade80');
                if (DOM.loaderStatus) DOM.loaderStatus.innerText = `'${projectName}' 삭제를 완료하였습니다.`;
                
                // 완료 후 로더 화면을 부드럽게 퇴장 처리
                setTimeout(() => {
                    if (DOM.globalLoader) DOM.globalLoader.classList.remove('active');
                    refreshFileList(); // Background refresh to sync with GH
                }, 1500); 
            } else {
                updateStatusUI('삭제 실패 (일부 파일 잔류 가능)', '#f87171');
                if (DOM.loaderStatus) DOM.loaderStatus.innerText = '삭제 중 오류가 발생했습니다.';
                if (DOM.globalLoader) DOM.globalLoader.classList.remove('active');
                Notification.alert("삭제 중 오류가 발생했습니다. 일부 파일이 지워지지 않았을 수 있습니다. 잠시 후 다시 시도하거나 수동으로 삭제해 주세요.", "오류", "error");
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
    DOM.metaJira.value = "";
    DOM.metaFigma.value = "";
    initDatePicker();
    
    // Initialize theme presets to Auto (-1)
    const indexInput = document.getElementById('meta-theme-index');
    if (indexInput) indexInput.value = "-1";
    renderThemePresets(-1);

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
    DOM.metaJira.value = m.jira || '';
    DOM.metaFigma.value = m.figmaUrl || '';
    initDatePicker(m.period);
    
    // Load existing theme index, fallback to -1
    const themeIndex = (m && m.themeIndex !== undefined) ? parseInt(m.themeIndex) : -1;
    const indexInput = document.getElementById('meta-theme-index');
    if (indexInput) indexInput.value = themeIndex.toString();
    renderThemePresets(themeIndex);

    DOM.modal.classList.add('active');
}

DOM.btnModalClose.onclick = () => DOM.modal.classList.remove('active');

DOM.btnModalSave.onclick = async () => {
    let projectName = context.isCreateMode ? DOM.metaProjectId.value.trim() : context.currentEditingProject;
    
    // Auto-generate ID if missing in Create Mode
    if (context.isCreateMode && !projectName) {
        projectName = slugify(DOM.metaTitle.value.trim());
        DOM.metaProjectId.value = projectName;
    }

    if (!projectName) {
        await Notification.alert("프로젝트 제목을 입력해주세요.", "필수 확인");
        return;
    }
    const originalText = DOM.btnModalSave.innerText;
    DOM.btnModalSave.innerText = '저장 중...';
    DOM.btnModalSave.disabled = true;
    DOM.btnModalSave.style.opacity = '0.7';
    
    // Extract selected theme index
    const indexInput = document.getElementById('meta-theme-index');
    const themeVal = indexInput ? parseInt(indexInput.value) : -1;

    const data = {
        projectMeta: {
            title: DOM.metaTitle.value.trim(),
            period: DOM.metaPeriod.value.trim(),
            assignee: DOM.metaAssignee.value.trim(),
            jira: DOM.metaJira.value.trim(),
            figmaUrl: DOM.metaFigma.value.trim(),
            themeIndex: themeVal
        }
    };


    try {
        const success = await updateScreenMetadata(projectName, null, data, (msg, color) => {
            DOM.btnModalSave.innerText = msg;
            DOM.btnModalSave.style.background = color;
            if (color === '#4ade80') {
                if (context.isCreateMode && typeof saveProjectHistory === 'function') {
                    const initialHistory = [{
                        version: '0.1',
                        date: (typeof getFormattedKST === 'function') ? getFormattedKST() : new Date().toISOString().slice(0,19).replace('T',' '),
                        message: '프로젝트 최초 생성',
                        assignee: DOM.metaAssignee.value.trim() || '',
                        developer: '',
                        jira: DOM.metaJira.value.trim() || '',
                        file: 'metadata.json'
                    }];
                    saveProjectHistory(projectName, initialHistory, null).catch(e => console.warn("Failed to save initial history:", e));
                }

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

// Search and Auto-complete Logic
const searchInput = document.getElementById('project-search-input');
const searchDropdown = document.getElementById('search-dropdown');

if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            searchDropdown.classList.remove('active');
            renderList(state.projects); // Reset to full list
            return;
        }

        // Filter projects by ID or title
        const filtered = state.projects.filter(p => {
            const idMatch = p.name.toLowerCase().includes(query);
            const titleMatch = (p.meta.title || '').toLowerCase().includes(query);
            return idMatch || titleMatch;
        });

        // Re-render grid with filtered items
        renderList(filtered);

        // Populate auto-complete dropdown (max 5 items)
        if (filtered.length > 0) {
            searchDropdown.innerHTML = filtered.slice(0, 5).map(p => {
                const mainTitle = p.meta.title || p.name;
                const url = `viewer.html?project=${encodeURIComponent(p.name)}`;
                return `
                    <a href="${url}" class="search-item" style="text-decoration:none;">
                        <span class="material-icons-outlined search-item-icon">folder</span>
                        <div style="display:flex; flex-direction:column;">
                            <span class="search-item-title">${mainTitle}</span>
                            <span class="search-item-sub">ID: ${p.name}</span>
                        </div>
                    </a>
                `;
            }).join('');
            searchDropdown.classList.add('active');
        } else {
            searchDropdown.innerHTML = `<div class="search-item" style="justify-content:center;"><span class="search-item-title" style="color:var(--text-secondary);">검색 결과가 없습니다.</span></div>`;
            searchDropdown.classList.add('active');
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('active');
        }
    });
}

// Start system
checkEnvironment();
refreshFileList();
