/**
 * Shared Application Logic & GitHub Integration
 */

const ghConfig = {
    // Priority: localStorage > Hardcoded default
    get owner() { return localStorage.getItem('gh_owner') || 'bychoi-space'; },
    set owner(val) { localStorage.setItem('gh_owner', val); },
    
    get repo() { return localStorage.getItem('gh_repo') || 'AI-work'; },
    set repo(val) { localStorage.setItem('gh_repo', val); },
    dataDir: 'data/', 
    
    // Internal private state
    _token: (localStorage.getItem('gh_token') || '').trim(),

    // Robust getter for token
    get token() {
        const t = (localStorage.getItem('gh_token') || '').trim();
        // Support all valid GitHub tokens (ghp_, github_pat_, etc.)
        if (t && t.length >= 10) return t;
        return null;
    },

    set token(val) {
        if (!val || val === 'null' || val === 'undefined' || val.trim().length < 10) {
            localStorage.removeItem('gh_token');
        } else {
            localStorage.setItem('gh_token', val.trim());
        }
    },

    get isReadOnly() { 
        return !this.token; 
    },

    updateToken(newToken) {
        this.token = newToken; // Goes through setter
    },

    handleAuthError() {
        console.warn("[Auth] 401 Unauthorized detected. Purging token and resetting.");
        this.token = null; 
        // Force reload to completely reset app state to Guest Mode
        setTimeout(() => location.reload(), 100);
    }
};

/**
 * Slugify: Convert string to URL-friendly English ID
 */
function slugify(text) {
    if (!text) return "";
    
    // 1. Basic Transliteration for Korean (Simple heuristic)
    // For a real app, a library like 'hangul' or 'romanize' would be better.
    // Here we'll do a simple mapping or just strip and keep ASCII as fallback.
    
    // 1. Basic cleaning: spaces to underscores, remove non-alphanumeric (supporting Unicode)
    // We use \p{L} for any letter and \p{N} for any number to support Korean etc.
    return text.toString().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\p{L}\p{N}_]+/gu, '') // Keep letters/numbers in any language
        .replace(/\_\_+/g, '_')
        .replace(/^_+/, '')
        .replace(/_+$/, '');
}

/**
 * Robust UTF-8 to Base64 (Modern browser approach)
 */
function encodeBase64(str) {
    if (!str) return "";
    try {
        const bytes = new TextEncoder().encode(str);
        const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
        return btoa(binary);
    } catch (e) {
        console.error("[Base64] Encoding failed:", e);
        return btoa(unescape(encodeURIComponent(str)));
    }
}

async function listContents(path = '') {
    try {
        const fullPath = `${ghConfig.dataDir}${path}`.replace(/\/$/, '');
        
        // --- HYBRID FETCHING LOGIC ---
        // If guest, we cannot 'list' directories via HTTP easily.
        // We MUST rely on metadata.json to know what screens exist.
        if (ghConfig.isReadOnly) {
            console.log("[Hybrid] Guest mode detected. Using metadata mapping instead of API listing.");
            const meta = await fetchProjectMetadata(path);
            
            if (path === '') {
                // Root listing: Use "projects" key
                const projects = meta.projects || { "Default_Project": { "title": "Default Project" } };
                return Object.keys(projects).map(name => ({
                    name: name,
                    type: 'dir',
                    path: `${fullPath}/${name}`
                }));
            } else {
                // Folder listing: Use "screens" or "files" key
                const screens = meta.screens || meta.files || {};
                return Object.keys(screens).map(name => ({
                    name: name,
                    type: 'file',
                    path: `${fullPath}/${name}`
                }));
            }
        }

        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${fullPath}`;
        const headers = { 'Authorization': `token ${ghConfig.token}`, 'Cache-Control': 'no-cache' };
        
        const res = await fetch(url, { headers, cache: 'no-store' });
        if (res.status === 401) { ghConfig.handleAuthError(); return listContents(path); }
        if (!res.ok) return [];
        
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("[GitHub API] listContents error:", err);
        return [];
    }
}

async function listRepoRoot() {
    try {
        // Migration is an Editor-only task. Guests should never see this.
        if (ghConfig.isReadOnly) return [];

        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/`;
        const headers = { 'Authorization': `token ${ghConfig.token}` };

        const res = await fetch(url, { headers, cache: 'no-store' });
        if (res.status === 401) { ghConfig.handleAuthError(); return []; }
        if (!res.ok) return [];
        
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("[GitHub API] listRepoRoot error:", err);
        return [];
    }
}

/**
 * GitHub API Helper: Upload to a specific project
 */
async function uploadToProject(project, filename, content, statusCallback) {
    const path = project ? `${project}/${filename}` : filename;
    return await uploadToGitHub(path, content, statusCallback);
}

/**
 * GitHub API Helper: Fetch file content (Project-aware)
 */
async function fetchProjectFileContent(project, filename) {
    const path = project ? `${project}/${filename}` : filename;
    return await fetchFileContent(path);
}

/**
 * GitHub API Helper: Upload or Update file
 */
async function uploadToGitHub(filename, content, statusCallback) {
    try {
        console.log(`[GitHub API] Initiating update for: ${filename}`);
        const encodedPath = encodeURIComponent(`${ghConfig.dataDir}${filename}`).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        
        // 1. Get SHA (if file exists)
        let sha = undefined;
        // Added cache: 'no-store' to prevent stale 404s or old SHAs from blocking updates
        const getRes = await fetch(url, { 
            headers: { 'Authorization': `token ${ghConfig.token}` },
            cache: 'no-store'
        });
        
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
            console.log(`[GitHub API] Found existing file SHA: ${sha}`);
        } else if (getRes.status === 404) {
            console.log(`[GitHub API] File not found (404). Will create new.`);
        } else {
            const errBody = await getRes.json().catch(() => ({}));
            const detailedMsg = errBody.message || getRes.statusText;
            console.error(`[GitHub API] SHA check failed. Status: ${getRes.status}`, errBody);
            throw new Error(`SHA_FETCH_${getRes.status}_(${detailedMsg})`);
        }

        // 2. Put content
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Authorization': `token ${ghConfig.token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                message: `Update: ${filename} via UI Studio`,
                content: encodeBase64(content),
                sha: sha
            })
        });

        if (putRes.ok) {
            console.log(`[GitHub API] Successfully updated: ${filename}`);
            if (statusCallback) {
                statusCallback('저장 완료 ✅', '#4ade80');
                setTimeout(() => statusCallback('가동 중🟢', '#4ade80'), 3000);
            }
            return true;
        } else {
            const errBody = await putRes.json().catch(() => ({}));
            // Extract detailed validation errors from GitHub (crucial for 422)
            const reason = errBody.message || "Unknown Validation Error";
            console.error(`[GitHub API] Upload failed. Status: ${putRes.status}`, errBody);
            throw new Error(`FAIL_${putRes.status}_(${reason})`);
        }
    } catch (err) {
        console.error("[GitHub API] Fatal Error:", err.message);
        let errorMsg = err.message;
        
        // Human-friendly mapping for common GitHub errors
        if (errorMsg.includes("409")) errorMsg = "이미 존재하는 파일명입니다 (409 Conflict)";
        if (errorMsg.includes("401")) errorMsg = "인증 토큰이 올바르지 않습니다 (401 Unauthorized)";
        if (errorMsg.includes("404")) errorMsg = "저장 위치를 찾을 수 없습니다 (404 Not Found)";
        if (errorMsg.includes("422")) errorMsg = "잘못된 데이터 형식입니다 (422 validation failed)";

        if (statusCallback) statusCallback(`에러: ${errorMsg}`, '#ef4444');
        return false;
    }
}

async function fetchFileContent(filename, isRoot = false) {
    try {
        const fullPath = isRoot ? filename : `${ghConfig.dataDir}${filename}`;
        
        // --- HYBRID FETCHING LOGIC ---
        // Guests fetch directly from the domain (relative path)
        if (ghConfig.isReadOnly) {
            const res = await fetch(fullPath, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            return await res.text();
        }

        const encodedPath = encodeURIComponent(fullPath).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        const headers = { 
            'Authorization': `token ${ghConfig.token}`,
            'Accept': 'application/vnd.github.v3.raw' 
        };

        const res = await fetch(url, { headers, cache: 'no-store' });
        if (res.status === 401) { ghConfig.handleAuthError(); return fetchFileContent(filename, isRoot); }
        if (!res.ok) throw new Error('Fetch content failed');
        
        return await res.text();
    } catch (err) {
        console.error("[Hybrid] fetchFileContent error:", err);
        return null;
    }
}

/**
 * GitHub API Helper: Sync file list (Legacy)
 */
async function syncFilesFromGitHub(callback) {
    const data = await listContents('');
    const systemFiles = ['index.html', 'viewer.html', 'style.css', 'app.js', 'stitch_ui_viewer.html'];
    const htmlFiles = data.filter(item => 
        (item.name.endsWith('.html') || item.name.endsWith('.htm')) && 
        !systemFiles.includes(item.name)
    );
    if (callback) callback(htmlFiles);
    return htmlFiles;
}

/**
 * Generic GitHub Content Listing
 */
async function listContents(path) {
    try {
        const fullPath = `${ghConfig.dataDir}${path}`;
        const encodedPath = encodeURIComponent(fullPath).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        
        const headers = {};
        if (ghConfig.token) headers['Authorization'] = `token ${ghConfig.token}`;

        const res = await fetch(url, { headers, cache: 'reload' });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("listContents error:", e);
        return [];
    }
}

/**
 * List Repository Root (Explicitly bypasses dataDir)
 */
async function listRepoRoot() {
    try {
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/`;
        
        const headers = {};
        if (ghConfig.token) headers['Authorization'] = `token ${ghConfig.token}`;

        const res = await fetch(url, { headers, cache: 'reload' });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("listRepoRoot error:", e);
        return [];
    }
}

/**
 * GitHub API Helper: Delete file
 * @param {boolean} isRoot - If true, ignores dataDir
 */
async function deleteFileFromGitHub(filename, sha, isRoot = false, statusCallback) {
    // Correct argument ordering if called from index.html (filename, sha, callback)
    if (typeof isRoot === 'function') {
        statusCallback = isRoot;
        isRoot = false;
    }
    
    if (!ghConfig.token || !sha) return false;
    if (statusCallback) statusCallback('삭제 중 ⏳', '#f87171');

    try {
        const fullPath = isRoot ? filename : `${ghConfig.dataDir}${filename}`;
        const encodedPath = encodeURIComponent(fullPath).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 
                'Authorization': `token ${ghConfig.token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                message: `Delete: ${filename} from UI Viewer`,
                sha: sha
            })
        });

        if (res.ok) {
            if (statusCallback) {
                statusCallback('삭제 완료 ✅', '#4ade80');
                setTimeout(() => statusCallback('가동 중🟢', '#4ade80'), 2000);
            }
            return true;
        } else {
            throw new Error('Delete failed');
        }
    } catch (err) {
        console.error(err);
        if (statusCallback) statusCallback('삭제 오류 ❌', '#ef4444');
        return false;
    }
}

/**
 * Metadata Storage (Per-Project)
 */
const METADATA_FILE = 'metadata.json';

async function fetchProjectMetadata(project) {
    const fullPath = project ? `${project}/${METADATA_FILE}` : METADATA_FILE;
    const relativePath = `${ghConfig.dataDir}${fullPath}`;
    
    // --- DUAL-CHANNEL FETCHING ---
    // 1. Try API if authenticated
    if (!ghConfig.isReadOnly) {
        try {
            const encodedPath = encodeURIComponent(relativePath).replace(/%2F/g, '/');
            const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
            const res = await fetch(url, {
                headers: { 
                    'Authorization': `token ${ghConfig.token}`
                },
                cache: 'reload'
            });
            
            if (res.status === 401) {
                console.error("[Hybrid] API Error: Unauthorized (401)");
                ghConfig.isReadOnly = true;
            }
            if (res.ok) {
                const data = await res.json();
                // If it's a content API response, it has 'content' (base64)
                if (data.content && data.encoding === 'base64') {
                    // Robust UTF-8 Base64 decoding
                    const binary = atob(data.content.replace(/\s/g, ''));
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                    return JSON.parse(new TextDecoder().decode(bytes));
                }
                return data;
            }
            if (res.status === 404) {
                return { screens: {}, title: project || 'Default Project' };
            }
        } catch (e) {
            console.error("[Hybrid] API Metadata fetch failed:", e);
        }
    }

    // 2. Fallback to direct fetch (useful for GitHub Pages or if API limit reached)
    try {
        const res = await fetch(relativePath, { cache: 'reload' });
        if (res.status === 404) return { screens: {}, title: project || 'Default Project' };
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("[Hybrid] Metadata fetch fatal error:", e);
    }

    return { screens: {}, title: project || 'Default Project' };
}

/**
 * Real-time Connection & Permission Verification
 */
async function verifyConnection(config, statusCallback) {
    const { token, owner, repo } = config;
    if (!token || !owner || !repo) {
        if (statusCallback) statusCallback('모든 필드를 입력해주세요 ⚠️', '#fb923c');
        return false;
    }

    if (statusCallback) statusCallback('연결 확인 중... ⏳', '#facc15');

    try {
        // 1. Verify Token & User
        const userRes = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${token.trim()}` }
        });
        
        if (!userRes.ok) {
            if (statusCallback) statusCallback('토큰이 유효하지 않습니다 (401) ❌', '#ef4444');
            return false;
        }

        // 2. Verify Repo Access & Permissions
        const repoUrl = `https://api.github.com/repos/${owner.trim()}/${repo.trim()}`;
        const repoRes = await fetch(repoUrl, {
            headers: { 'Authorization': `token ${token.trim()}` }
        });

        if (!repoRes.ok) {
            const msg = repoRes.status === 404 ? '저장소를 찾을 수 없습니다 ❌' : '저장소 접근 권한이 없습니다 ❌';
            if (statusCallback) statusCallback(msg, '#ef4444');
            return false;
        }

        const repoData = await repoRes.json();
        // Check if user has push (write) permissions
        if (!repoData.permissions || !repoData.permissions.push) {
            if (statusCallback) statusCallback('저장소 쓰기 권한이 없습니다 ❌', '#ef4444');
            return false;
        }

        if (statusCallback) statusCallback('연결 성공! 권한 확인 완료 ✅', '#4ade80');
        return true;
    } catch (err) {
        console.error("[Auth] Verification error:", err);
        if (statusCallback) statusCallback(`네트워크 에러: ${err.message} ❌`, '#ef4444');
        return false;
    }
}

async function saveProjectMetadata(project, metadata, statusCallback) {
    const fullPath = project ? `${project}/${METADATA_FILE}` : METADATA_FILE;
    const content = JSON.stringify(metadata, null, 2);
    return await uploadToGitHub(fullPath, content, statusCallback);
}

async function updateScreenMetadata(project, screenFilename, data, statusCallback) {
    const metadata = await fetchProjectMetadata(project);
    
    // 1. Update project-level info
    if (data.projectMeta) {
        metadata.title = data.projectMeta.title || metadata.title;
        metadata.assignee = data.projectMeta.assignee || metadata.assignee;
        metadata.period = data.projectMeta.period || metadata.period;
        metadata.jira = data.projectMeta.jira || metadata.jira;
        metadata.figmaUrl = data.projectMeta.figmaUrl || metadata.figmaUrl;
        metadata.pubUrl = data.projectMeta.pubUrl || metadata.pubUrl;
    }

    // 2. Update screen-specific info (Pins, descriptions)
    if (screenFilename) {
        metadata.screens = metadata.screens || {};
        metadata.screens[screenFilename] = {
            description: data.description !== undefined ? data.description : (metadata.screens[screenFilename]?.description || []),
            updatedAt: new Date().toISOString()
        };
    }

    return await saveProjectMetadata(project, metadata, statusCallback);
}

/**
 * Screen Creation from Template
 */
async function createScreenFromTemplate(project, screenName, templateName, statusCallback) {
    try {
        if (statusCallback) statusCallback('템플릿 불러오는 중... ⏳', '#facc15');
        
        // 1. Fetch Template Content
        const templatePath = `assets/templates/${templateName}`;
        const res = await fetch(templatePath);
        if (!res.ok) throw new Error(`Template not found: ${templateName}`);
        let content = await res.text();
        
        // 2. Simple Placeholder Replacement
        content = content.replace(/{{SCREEN_NAME}}/g, screenName);
        content = content.replace(/{{PROJECT_NAME}}/g, project);
        
        // 3. Upload to GitHub
        const filename = screenName.endsWith('.html') ? screenName : `${screenName}.html`;
        const success = await uploadToProject(project, filename, content, statusCallback);
        
        if (success) {
            // 4. Update Metadata
            const meta = await fetchProjectMetadata(project);
            if (!meta || typeof meta !== 'object') {
                throw new Error("Cannot retrieve project metadata for update");
            }
            meta.screens = meta.screens || {};
            meta.screens[filename] = { 
                updatedAt: new Date().toISOString(),
                template: templateName
            };
            
            // Pass the callback to finalize the status on the UI
            const metaSuccess = await saveProjectMetadata(project, meta, statusCallback);
            if (!metaSuccess) throw new Error("File was created but Metadata update failed");
            
            return true;
        }
        return false;
    } catch (err) {
        console.error("[Template] Error creating screen:", err);
        // Map error for display in statusCallback
        let displayErr = err.message;
        if (displayErr.includes("409")) displayErr = "파일이 이미 존재합니다 (409)";
        
        if (statusCallback) statusCallback(`실패: ${displayErr}`, '#ef4444');
        return false;
    }
}

// --- Legacy Compatibility Functions (Keep for existing Dashboard flow) ---
async function fetchMetadata() { return fetchProjectMetadata(null); }
async function updateFileMetadata(filename, data, statusCallback) {
    // Treat legacy isolated files as single-screen updates in the root metadata
    return updateScreenMetadata(null, filename, { ...data, projectMeta: data }, statusCallback);
}
