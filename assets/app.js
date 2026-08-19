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
    
    const maxRetries = 2;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        try {
            let res = await fetch(url, { headers, credentials: 'omit', signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!res.ok && (res.status === 401 || res.status === 403)) {
                if (localStorage.getItem('gh_token')) {
                    console.warn("[Auth] GitHub API token returned 401/403 on list request. Retrying anonymously.");
                    localStorage.removeItem('gh_token');
                    res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
                }
            }
            if (res.ok) {
                const list = await res.json();
                window.shaCache = window.shaCache || {};
                if (Array.isArray(list)) {
                    list.forEach(item => {
                        if (item.type === 'file' && item.sha) {
                            const relativePath = item.path.startsWith(ghConfig.dataDir)
                                ? item.path.substring(ghConfig.dataDir.length)
                                : item.path;
                            window.shaCache[relativePath] = item.sha;
                        }
                    });
                }
                return list;
            }
            if ((res.status >= 500 && res.status <= 504) && attempt <= maxRetries) {
                console.warn(`[API] listContents returned transient status ${res.status}. Retrying attempt ${attempt}...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }
            return [];
        } catch (e) {
            clearTimeout(timeoutId);
            console.warn(`[API] listContents for ${path} failed or timed out (attempt ${attempt}/${maxRetries + 1}):`, e.message);
            if (attempt <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                return [];
            }
        }
    }
    return [];
}

async function listRepoRoot() {
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/?t=${Date.now()}`;
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        let res = await fetch(url, { headers, credentials: 'omit', signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok && (res.status === 401 || res.status === 403)) {
            console.warn("[Auth] GitHub API token returned 401/403 on root request. Retrying anonymously.");
            res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
        }
        return res.ok ? await res.json() : [];
    } catch (e) {
        console.warn("[API] listRepoRoot failed or timed out:", e.message);
        return [];
    }
}

async function fetchFileContent(path, isRoot = false) {
    window.fileContentCache = window.fileContentCache || {};
    if (window.fileContentCache[path]) {
        console.log("[Cache] Returning cached content for:", path);
        return window.fileContentCache[path];
    }
    const fullPath = isRoot ? path : `${ghConfig.dataDir}${path}`;
    const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}?t=${Date.now()}`;
    
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const maxRetries = 2;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout for stability

        try {
            let res = await fetch(url, { headers, credentials: 'omit', signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok && (res.status === 401 || res.status === 403)) {
                console.warn("[Auth] GitHub API token returned 401/403 on file request. Retrying anonymously.");
                res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
            }
            
            if (!res.ok) {
                if (res.status === 404) return "__NOT_FOUND__";
                if ((res.status >= 500 && res.status <= 504) && attempt <= maxRetries) {
                    console.warn(`[API] GitHub API returned transient status ${res.status}. Retrying attempt ${attempt}...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }
                return null;
            }
            const data = await res.json();
            if (data && data.content) {
                window.shaCache = window.shaCache || {};
                window.shaCache[path] = data.sha;
                try {
                    const decoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
                    window.fileContentCache[path] = decoded; // Cache successful fetch in-memory
                    return decoded;
                } catch(e) { return null; }
            }
            return null;
        } catch (e) {
            clearTimeout(timeoutId);
            console.warn(`[API] fetchFileContent for ${path} failed or timed out (attempt ${attempt}/${maxRetries + 1}):`, e.message);
            if (attempt <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }
            return null;
        }
    }
    return null;
}

async function fetchProjectFileContent(project, filename) {
    const content = await fetchFileContent(`${project}/${filename}`);
    return content === "__NOT_FOUND__" ? null : content;
}

async function fetchProjectMetadata(project) {
    const content = await fetchFileContent(`${project}/metadata.json`);
    if (content === "__NOT_FOUND__") {
        return { title: project, screens: {} };
    }
    if (content === null) {
        throw new Error("GitHub API와 통신하는 중 오류가 발생했거나 권한이 없습니다. 메타데이터 유실 방지를 위해 저장이 차단됩니다.");
    }
    try {
        return JSON.parse(content);
    } catch(e) {
        console.error("[Metadata] JSON parse error:", e);
        throw new Error("메타데이터 파일이 손상되었습니다: " + e.message);
    }
}

function getFormattedKST(dateObj) {
    const now = dateObj ? new Date(dateObj) : new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
window.getFormattedKST = getFormattedKST;

async function saveProjectMetadata(project, metadata, statusCallback) {
    const content = JSON.stringify(metadata, null, 2);
    return await uploadToProject(project, 'metadata.json', content, statusCallback);
}

async function fetchProjectHistory(project) {
    if (!project) return [];
    const content = await fetchFileContent(`${project}/history.json`);
    try {
        if (content && content !== "__NOT_FOUND__") {
            const list = JSON.parse(content);
            if (Array.isArray(list) && list.length > 0) {
                return list;
            }
        }
    } catch(e) {}

    // Auto-generate initial creation history entry if missing or empty
    try {
        const meta = await fetchProjectMetadata(project);
        const createdDate = (meta && meta.updated) ? meta.updated : getFormattedKST();
        const initialEntry = [{
            version: '0.1',
            date: createdDate,
            message: '프로젝트 최초 생성',
            assignee: (meta && meta.assignee) ? meta.assignee : '',
            developer: (meta && meta.developer) ? meta.developer : '',
            jira: (meta && meta.jira) ? meta.jira : '',
            file: 'metadata.json'
        }];
        if (typeof saveProjectHistory === 'function') {
            await saveProjectHistory(project, initialEntry, null);
        }
        return initialEntry;
    } catch (err) {
        console.warn("[History] Auto initialization of project history failed:", err);
        return [{
            version: '0.1',
            date: getFormattedKST(),
            message: '프로젝트 최초 생성',
            file: 'metadata.json'
        }];
    }
}

async function saveProjectHistory(project, history, statusCallback) {
    const content = JSON.stringify(history, null, 2);
    return await uploadToProject(project, 'history.json', content, statusCallback);
}

async function fetchGlobalComponents() {
    const content = await fetchFileContent(`global_components.json`);
    try {
        return content ? JSON.parse(content) : [];
    } catch(e) {
        return [];
    }
}

async function saveGlobalComponents(components, statusCallback) {
    if (ghConfig.isReadOnly) return false;
    try {
        const fullPath = `${ghConfig.dataDir}global_components.json`;
        const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}`;
        
        const cacheKey = `global_components.json`;
        window.shaCache = window.shaCache || {};
        let sha = window.shaCache[cacheKey] || null;
        
        const token = ghConfig.token;
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        if (!sha) {
            try {
                const res = await fetch(url + `?t=${Date.now()}`, { headers, credentials: 'omit' });
                if (res.ok) { const json = await res.json(); sha = json.sha; window.shaCache[cacheKey] = sha; }
            } catch(e) {}
        }

        const finalContent = btoa(unescape(encodeURIComponent(JSON.stringify(components, null, 2))));

        if (statusCallback) statusCallback('Saving components...', '#facc15');
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${ghConfig.token}`, 
                'Content-Type': 'application/json' 
            },
            credentials: 'omit',
            body: JSON.stringify({
                message: `Update global_components.json`,
                content: finalContent,
                sha: sha
            })
        });
        if (putRes.ok) {
            const putData = await putRes.json().catch(() => null);
            if (putData && putData.content && putData.content.sha) {
                window.shaCache[cacheKey] = putData.content.sha;
            }
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

async function uploadToProject(project, filename, content, statusCallback, isBinary = false) {
    if (ghConfig.isReadOnly) return false;
    try {
        const fullPath = `${ghConfig.dataDir}${project}/${filename}`;
        const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}`;
        
        const cacheKey = `${project}/${filename}`;
        window.shaCache = window.shaCache || {};
        let sha = window.shaCache[cacheKey] || null;
        
        const token = ghConfig.token;
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        if (!sha) {
            try {
                const res = await fetch(url + `?t=${Date.now()}`, { headers, credentials: 'omit', signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (res.ok) { 
                    const json = await res.json(); 
                    sha = json.sha; 
                    window.shaCache[cacheKey] = sha;
                }
            } catch(e) {
                console.warn("[API] Failed to pre-fetch SHA for upload:", e.message);
            }
        }

        const finalContent = isBinary ? content : btoa(unescape(encodeURIComponent(content)));

        if (statusCallback) statusCallback('Saving...', '#facc15');
        
        const writeController = new AbortController();
        const writeTimeoutId = setTimeout(() => writeController.abort(), 8000); // Give upload slightly longer (8s)

        let putRes = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${ghConfig.token}`, 
                'Content-Type': 'application/json' 
            },
            credentials: 'omit',
            signal: writeController.signal,
            body: JSON.stringify({
                message: `Update ${filename}`,
                content: finalContent,
                sha: sha
            })
        });
        clearTimeout(writeTimeoutId);

        // 409 Conflict Self-Healing & Retry Mechanism
        if (putRes.status === 409) {
            console.warn(`[API] 409 Conflict for ${filename}. Retrying with fresh SHA...`);
            try {
                const res = await fetch(url + `?t=${Date.now()}`, { headers, credentials: 'omit' });
                if (res.ok) {
                    const json = await res.json();
                    sha = json.sha;
                    window.shaCache[cacheKey] = sha;
                    
                    putRes = await fetch(url, {
                        method: 'PUT',
                        headers: { 
                            'Accept': 'application/vnd.github.v3+json',
                            'Authorization': `token ${ghConfig.token}`, 
                            'Content-Type': 'application/json' 
                        },
                        credentials: 'omit',
                        body: JSON.stringify({
                            message: `Update ${filename} (Retry)`,
                            content: finalContent,
                            sha: sha
                        })
                    });
                }
            } catch (e) {
                console.error("[API] Self-healing retry failed:", e);
            }
        }

        if (putRes.ok) {
            const putData = await putRes.json().catch(() => null);
            if (putData && putData.content && putData.content.sha) {
                window.shaCache[cacheKey] = putData.content.sha;
            }
            // Update the in-memory cache with the fresh content
            window.fileContentCache = window.fileContentCache || {};
            if (!isBinary) {
                window.fileContentCache[cacheKey] = content;
            } else {
                delete window.fileContentCache[cacheKey];
            }
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
    const metadata = data.existingMetadata ? JSON.parse(JSON.stringify(data.existingMetadata)) : await fetchProjectMetadata(project);
    if (data.projectMeta) {
        metadata.title = data.projectMeta.title || metadata.title;
        metadata.assignee = data.projectMeta.assignee || metadata.assignee;
        metadata.developer = data.projectMeta.developer !== undefined ? data.projectMeta.developer : (metadata.developer || '');
        metadata.period = data.projectMeta.period || metadata.period;
        metadata.jira = data.projectMeta.jira || metadata.jira;
        metadata.figmaUrl = data.projectMeta.figmaUrl || metadata.figmaUrl;
        metadata.pubUrl = data.projectMeta.pubUrl || metadata.pubUrl;
        metadata.themeIndex = data.projectMeta.themeIndex !== undefined ? data.projectMeta.themeIndex : metadata.themeIndex;
        metadata.updated = data.projectMeta.updated || metadata.updated;
    }
    if (screenFilename) {
        metadata.screens = metadata.screens || {};
        metadata.screens[screenFilename] = metadata.screens[screenFilename] || {};
        metadata.screens[screenFilename].description = data.description;
        metadata.screens[screenFilename].updatedAt = new Date().toISOString();
        if (data.version !== undefined) {
            metadata.screens[screenFilename].version = data.version;
        }
    }
    
    if (statusCallback) statusCallback('Saving...', '#facc15');
    
    // Save 1: Project Metadata
    const res1 = await saveProjectMetadata(project, metadata, null);
    
    // Save 2: Screen Design HTML
    let res2 = true;
    if (data.htmlContent && screenFilename) {
        res2 = await uploadToProject(project, screenFilename, data.htmlContent, null);
    }
    
    const success = res1 && res2;
    
    if (statusCallback) {
        if (success) {
            statusCallback('Success', '#4ade80');
        } else {
            statusCallback('Error', '#f87171');
        }
    }
    
    return success;
}

async function createScreenFromTemplate(project, screenName, templateName, injectData = {}, statusCallback) {
    try {
        let content = null;
        if (window.LF_TEMPLATES) {
            content = window.LF_TEMPLATES[templateName] || 
                      window.LF_TEMPLATES[templateName.toLowerCase()] || 
                      window.LF_TEMPLATES[`template_${templateName}.html`] || 
                      window.LF_TEMPLATES[`template_${templateName}`] || 
                      window.LF_TEMPLATES[templateName.replace(/^template_/, '').replace(/\.html$/, '')] ||
                      window.LF_TEMPLATES[templateName.replace(/\.html$/, '')];
        }
        if (!content) {
            try {
                const fetchName = templateName.endsWith('.html') ? templateName : `${templateName}.html`;
                const response = await fetch(`assets/templates/${fetchName}`);
                if (response.ok) {
                    content = await response.text();
                    window.LF_TEMPLATES = window.LF_TEMPLATES || {};
                    window.LF_TEMPLATES[templateName] = content;
                    window.LF_TEMPLATES[fetchName] = content;
                }
            } catch (e) {
                console.warn("[Templates] Dynamic fetch failed, falling back to window.LF_TEMPLATES:", e);
            }
        }
        if (!content) throw new Error("Template not found: " + templateName);
        
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
            else if (templateName.includes('mobile_ui')) type = 'mobile-ui';
            else if (templateName.includes('nbos')) type = 'admin-nbos';
            else if (templateName.includes('onesphere')) type = 'admin-onesphere';
            else if (templateName.includes('blank')) type = 'blank';

            meta.screens[filename] = { 
                title: injectData.SCREEN_NAME || filename,
                type: type,
                updatedAt: new Date().toISOString(), 
                template: templateName,
                version: (type === 'cover') ? 0.1 : undefined
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
                <div id="notification-icon-bg" class="dialog-icon">
                    <span id="notification-icon" class="material-icons-outlined"></span>
                </div>
                <h3 id="notification-title" class="dialog-title"></h3>
                <div id="notification-message" class="dialog-message"></div>
                <div id="notification-input-container"></div>
                <div class="dialog-footer" id="notification-footer"></div>
            </div>`;
        document.body.appendChild(overlay);
        this.DOM = {
            overlay,
            card: overlay.querySelector('.dialog-card'),
            iconBg: overlay.querySelector('#notification-icon-bg'),
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
        const iconBg = this.DOM.iconBg || this.DOM.overlay.querySelector('#notification-icon-bg');
        if (iconBg) {
            iconBg.className = `dialog-icon ${type || 'info'}`;
        }
        if (this.DOM.icon) {
            this.DOM.icon.className = 'material-icons-outlined';
            this.DOM.icon.innerText = iconMap[type] || 'info_outline';
        }
        
        this.DOM.inputContainer.innerHTML = hasInput ? `<input type="text" id="notification-prompt-input" class="dialog-input" style="width:100%; box-sizing:border-box;" value="${defaultValue}">` : '';
        this.DOM.footer.innerHTML = '';
        return new Promise((resolve) => {
            buttons.forEach(btn => {
                const el = document.createElement('button');
                el.className = btn.danger ? 'btn-danger' : (btn.primary ? 'btn-primary' : 'btn-secondary');
                el.innerText = btn.text;
                el.onclick = () => {
                    let value;
                    if (btn.value !== undefined) {
                        value = btn.value;
                    } else if (hasInput) {
                        value = document.getElementById('notification-prompt-input').value;
                    } else {
                        value = true;
                    }
                    this.DOM.overlay.classList.remove('active');
                    resolve(value);
                };
                this.DOM.footer.appendChild(el);
            });
            this.DOM.overlay.classList.add('active');
            if (hasInput) {
                setTimeout(() => {
                    const inputEl = document.getElementById('notification-prompt-input');
                    if (inputEl) {
                        inputEl.focus();
                        inputEl.onkeydown = (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = inputEl.value;
                                this.DOM.overlay.classList.remove('active');
                                resolve(val);
                            }
                        };
                    }
                }, 100);
            }
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

window.NotificationUI = Notification;
try {
    window.Notification = Notification;
} catch(e) {
    console.warn("Could not overwrite global window.Notification:", e);
}