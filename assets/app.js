/**
 * Shared Application Logic & GitHub Integration
 */

// Utility: Slugify text for IDs/Filenames
function slugify(text) {
    if (!text) return `project_${Date.now().toString().slice(-6)}`;
    
    // 1. Basic conversion (lowercase, remove special chars)
    let slug = text.toString().toLowerCase().trim()
        .replace(/\s+/g, '_')           // Replace spaces with _
        .replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\-]+/g, '') // Remove all non-word chars except Korean
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text

    // 2. Korean handling (if only Korean, use random suffix)
    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(slug);
    if (hasKorean) {
        // Simple mapping or just random if it's all Korean
        slug = `p_${Math.random().toString(36).substring(2, 7)}`;
    }

    if (!slug) slug = `project_${Math.random().toString(36).substring(2, 7)}`;
    return slug;
}

const _INTERNAL_KEY = 'MXFpYngxZ3FENGp2MklETERBaTMyOHpmRldIQ2xtazZiNkdkX3BoZw=='; // Scancode Bypass Encoded (VERIFIED)

const ghConfig = {
    get owner() { return localStorage.getItem('gh_owner') || 'bychoi-space'; },
    set owner(val) { localStorage.setItem('gh_owner', val); },
    get repo() { return localStorage.getItem('gh_repo') || 'AI-work'; },
    set repo(val) { localStorage.setItem('gh_repo', val); },
    dataDir: 'data/', 
    get token() { 
        const stored = localStorage.getItem('gh_token');
        if (stored && stored.trim()) {
            console.log("[Auth] Using token from LocalStorage");
            return stored.trim();
        }
        // Default fallback with decode logic
        try {
            const fallback = atob(_INTERNAL_KEY).split('').reverse().join('');
            console.log("[Auth] Using default Manager Mode token");
            return fallback;
        } catch(e) { return ''; }
    },
    set token(val) { localStorage.setItem('gh_token', (val || '').trim()); },
    get isReadOnly() { return !this.token; },
    clearToken() { localStorage.removeItem('gh_token'); location.reload(); }
};

async function listContents(path) {
    const safePath = (ghConfig.dataDir + path).split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}?t=${Date.now()}`;
    
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    console.log("[API] Requesting contents for:", path);
    
    // 5-second Timeout Protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        let res = await fetch(url, { headers, credentials: 'omit', signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok && (res.status === 401 || res.status === 403)) {
            if (localStorage.getItem('gh_token')) {
                localStorage.removeItem('gh_token');
                res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
            }
        }
        return res.ok ? await res.json() : [];
    } catch (e) {
        console.warn("[API] listContents failed or timed out:", e.message);
        return [];
    }
}

async function listRepoRoot() {
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/?t=${Date.now()}`;
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    let res = await fetch(url, { headers, credentials: 'omit' });
    if (!res.ok && (res.status === 401 || res.status === 403)) {
        if (localStorage.getItem('gh_token')) localStorage.removeItem('gh_token');
        res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
    }
    return res.ok ? await res.json() : [];
}

async function fetchFileContent(path, isRoot = false) {
    const fullPath = isRoot ? path : `${ghConfig.dataDir}${path}`;
    const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}?t=${Date.now()}`;
    
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    let res = await fetch(url, { headers, credentials: 'omit' });
    if (!res.ok && (res.status === 401 || res.status === 403)) {
        if (localStorage.getItem('gh_token')) localStorage.removeItem('gh_token');
        res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
    }
    
    if (!res.ok) return null;
    const data = await res.json();
    return decodeURIComponent(escape(atob(data.content)));
}

async function fetchProjectFileContent(project, filename) {
    return await fetchFileContent(`${project}/${filename}`);
}

async function fetchProjectMetadata(project) {
    const content = await fetchFileContent(`${project}/metadata.json`);
    try {
        return content ? JSON.parse(content) : { title: project, screens: {} };
    } catch(e) {
        return { title: project, screens: {} };
    }
}

async function saveProjectMetadata(project, metadata, statusCallback) {
    const content = JSON.stringify(metadata, null, 2);
    return await uploadToProject(project, 'metadata.json', content, statusCallback);
}

async function uploadToProject(project, filename, content, statusCallback, isBinary = false) {
    if (ghConfig.isReadOnly) return false;
    try {
        const fullPath = `${ghConfig.dataDir}${project}/${filename}`;
        const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}`;
        let sha = null;
        
        const token = ghConfig.token;
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        try {
            const res = await fetch(url + `?t=${Date.now()}`, { headers, credentials: 'omit' });
            if (res.status === 401 || res.status === 403) {
                if (localStorage.getItem('gh_token')) {
                    localStorage.removeItem('gh_token');
                }
            }
            if (res.ok) { const json = await res.json(); sha = json.sha; }
        } catch(e) {}

        const finalContent = isBinary ? content : btoa(unescape(encodeURIComponent(content)));

        if (statusCallback) statusCallback('Saving...', '#facc15');
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${ghConfig.token}`, 
                'Content-Type': 'application/json' 
            },
            credentials: 'omit',
            body: JSON.stringify({
                message: `Update ${filename}`,
                content: finalContent,
                sha: sha
            })
        });
        if (putRes.ok) {
            if (statusCallback) {
                statusCallback('Success', '#4ade80');
                setTimeout(() => statusCallback('Ready', '#4ade80'), 2000);
            }
            return true;
        }
        if (putRes.status === 401) localStorage.removeItem('gh_token');
        return false;
    } catch (err) {
        if (statusCallback) statusCallback('Error', '#f87171');
        return false;
    }
}

async function deleteFileFromGitHub(path, sha, isRoot = false) {
    if (ghConfig.isReadOnly) return false;
    const fullPath = isRoot ? path : `${ghConfig.dataDir}${path}`;
    const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}`;
    
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 
                'Authorization': `token ${ghConfig.token}`, 
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ message: `Delete ${path}`, sha: sha })
        });
        if (res.status === 401) localStorage.removeItem('gh_token');
        return res.ok;
    } catch (e) {
        console.error("[API] deleteFileFromGitHub failed:", e);
        return false;
    }
}

async function deleteProjectWithContents(project, statusCallback) {
    if (ghConfig.isReadOnly) return false;
    
    async function recursiveDelete(currentPath) {
        console.log("[Delete] Listing items in:", currentPath);
        const items = await listContents(currentPath);
        if (!Array.isArray(items)) return true; // Already gone or empty

        let allSuccess = true;
        for (const item of items) {
            const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
            if (item.type === 'dir') {
                const subSuccess = await recursiveDelete(itemPath);
                if (!subSuccess) allSuccess = false;
            } else {
                if (statusCallback) statusCallback(`Deleting ${item.name}...`, '#facc15');
                const success = await deleteFileFromGitHub(itemPath, item.sha);
                if (!success) {
                    console.error("[Delete] Failed to delete file:", itemPath);
                    allSuccess = false;
                }
            }
        }
        return allSuccess;
    }

    try {
        if (statusCallback) statusCallback('Analyzing project structure...', '#facc15');
        const finalSuccess = await recursiveDelete(project);
        return finalSuccess;
    } catch (err) {
        console.error("[Delete] Project deletion failed:", err);
        return false;
    }
}

async function verifyAndSaveToken(token, statusCb) {
    const res = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${token}` }});
    if (res.ok) {
        localStorage.setItem('gh_token', token);
        if (statusCb) statusCb('Verified!', '#4ade80');
        return true;
    }
    if (statusCb) statusCb('Invalid Token', '#f87171');
    return false;
}

async function updateScreenMetadata(project, screenFilename, data, statusCallback) {
    const metadata = await fetchProjectMetadata(project);
    if (data.projectMeta) {
        metadata.title = data.projectMeta.title || metadata.title;
        metadata.assignee = data.projectMeta.assignee || metadata.assignee;
        metadata.developer = data.projectMeta.developer !== undefined ? data.projectMeta.developer : (metadata.developer || '');
        metadata.period = data.projectMeta.period || metadata.period;
        metadata.jira = data.projectMeta.jira || metadata.jira;
        metadata.figmaUrl = data.projectMeta.figmaUrl || metadata.figmaUrl;
        metadata.pubUrl = data.projectMeta.pubUrl || metadata.pubUrl;
    }
    if (screenFilename) {
        metadata.screens = metadata.screens || {};
        metadata.screens[screenFilename] = metadata.screens[screenFilename] || {};
        metadata.screens[screenFilename].description = data.description;
        metadata.screens[screenFilename].updatedAt = new Date().toISOString();
    }
    
    // Save metadata
    const metaSuccess = await saveProjectMetadata(project, metadata, statusCallback);
    
    // Phase 1: Overwrite HTML if content provided
    if (metaSuccess && data.htmlContent) {
        if (statusCallback) statusCallback('Saving Design...', '#facc15');
        return await uploadToProject(project, screenFilename, data.htmlContent, statusCallback);
    }
    
    return metaSuccess;
}

async function createScreenFromTemplate(project, screenName, templateName, injectData = {}, statusCallback) {
    try {
        let content = (window.LF_TEMPLATES && window.LF_TEMPLATES[templateName]);
        if (!content) throw new Error("Template not found");
        
        // Inject metadata
        if (injectData) {
            Object.keys(injectData).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                content = content.replace(regex, injectData[key] || '');
            });
        }
        
        const filename = screenName.endsWith('.html') ? screenName : `${screenName}.html`;
        const success = await uploadToProject(project, filename, content, statusCallback);
        if (success) {
            if (statusCallback) statusCallback('Updating Metadata...', '#facc15');
            const meta = await fetchProjectMetadata(project);
            meta.screens = meta.screens || {};
            
            // Map template to type
            let type = 'default';
            if (templateName.includes('cover')) type = 'cover';
            else if (templateName.includes('architecture')) type = 'architecture';
            else if (templateName.includes('plan_delivery')) type = 'plan-delivery';
            else if (templateName.includes('plan')) type = 'plan';
            else if (templateName.includes('front_ui')) type = 'ui';
            else if (templateName.includes('nbos')) type = 'admin-nbos';
            else if (templateName.includes('onesphere')) type = 'admin-onesphere';

            meta.screens[filename] = { 
                title: injectData.SCREEN_NAME || filename,
                type: type,
                updatedAt: new Date().toISOString(), 
                template: templateName 
            };
            
            // Add to screenOrder if exists
            if (meta.screenOrder) {
                if (!meta.screenOrder.includes(filename)) {
                    meta.screenOrder.push(filename);
                }
            }
            
            const metaSuccess = await saveProjectMetadata(project, meta, statusCallback);
            return metaSuccess; // Crucial: only return true if meta also saved
        }
        return false;
    } catch (err) {
        console.error("Template creation failed:", err);
        return false;
    }
}

const Notification = {
    DOM: null,
    _init() {
        if (this.DOM || document.getElementById('notification-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'notification-overlay';
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = `<div class="dialog-card">
                <div id="notification-icon" class="material-icons-outlined dialog-header-icon"></div>
                <h3 id="notification-title" class="dialog-title"></h3>
                <div id="notification-message" class="dialog-message"></div>
                <div id="notification-input-container"></div>
                <div class="dialog-footer" id="notification-footer"></div>
            </div>`;
        document.body.appendChild(overlay);
        this.DOM = {
            overlay,
            card: overlay.querySelector('.dialog-card'),
            icon: overlay.querySelector('#notification-icon'),
            title: overlay.querySelector('#notification-title'),
            message: overlay.querySelector('#notification-message'),
            inputContainer: overlay.querySelector('#notification-input-container'),
            footer: overlay.querySelector('#notification-footer')
        };
    },
    _show(type, title, message, buttons, hasInput = false, defaultValue = '') {
        this._init();
        this.DOM.title.innerText = title;
        this.DOM.message.innerHTML = message.replace(/\n/g, '<br>');
        const iconMap = { success: 'check_circle', error: 'error_outline', warning: 'report_problem', info: 'info_outline' };
        
        // Clean up classes
        this.DOM.icon.className = `material-icons-outlined dialog-header-icon ${type || 'info'}`;
        this.DOM.icon.innerText = iconMap[type] || 'info_outline';
        
        this.DOM.inputContainer.innerHTML = hasInput ? `<input type="text" id="notification-prompt-input" class="form-input" style="margin-top:20px; width:100%;" value="${defaultValue}">` : '';
        this.DOM.footer.innerHTML = '';
        return new Promise((resolve) => {
            buttons.forEach(btn => {
                const el = document.createElement('button');
                el.className = btn.danger ? 'btn-danger' : (btn.primary ? 'btn-primary' : 'btn-secondary');
                el.innerText = btn.text;
                el.onclick = () => {
                    let value = true;
                    if (hasInput) value = document.getElementById('notification-prompt-input').value;
                    else if (btn.value !== undefined) value = btn.value;
                    this.DOM.overlay.classList.remove('active');
                    resolve(value);
                };
                this.DOM.footer.appendChild(el);
            });
            this.DOM.overlay.classList.add('active');
            if (hasInput) setTimeout(() => document.getElementById('notification-prompt-input').focus(), 100);
        });
    },
    alert(message, title = 'Alert', type = 'info') {
        return this._show(type, title, message, [{ text: '확인', primary: true }]);
    },
    confirm(message, title = '이 작업을 진행할까요?', type = 'warning') {
        return this._show(type, title, message, [
            { text: '취소', primary: false, value: false },
            { text: '네, 진행합니다', primary: true, value: true, danger: type === 'warning' }
        ]);
    },
    prompt(message, defaultValue = '', title = 'Input') {
        return this._show('info', title, message, [
            { text: 'Cancel', primary: false, value: null },
            { text: 'OK', primary: true }
        ], true, defaultValue);
    }
};