/**
 * Shared Application Logic & GitHub Integration
 */

const ghConfig = {
    owner: 'bychoi-space',
    repo: 'AI-work',
    // Stricter token handling to prevent sending 'null' strings or invalid headers
    get token() {
        const t = localStorage.getItem('gh_token');
        if (!t || t === 'null' || t === 'undefined' || t.trim() === '') return null;
        return t.trim();
    },
    dataDir: 'data/', // Base folder for user projects
    get isReadOnly() { 
        const t = this.token;
        // Strict check: Must be a string AND start with ghp_ or similar to be considered an editor
        return !t || !t.startsWith('ghp_');
    },
    updateToken(newToken) {
        if (!newToken || newToken.trim() === '') {
            localStorage.removeItem('gh_token');
        } else {
            localStorage.setItem('gh_token', newToken.trim());
        }
    }
};

/**
 * Robust UTF-8 to Base64 (Modern browser approach)
 */
function encodeBase64(str) {
    try {
        // Use TextEncoder to get UTF-8 bytes, then convert to binary string for btoa
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    } catch (e) {
        console.error("[Base64] Modern encoding failed, falling back:", e);
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e2) {
            console.error("[Base64] Full fallback failed:", e2);
            return "";
        }
    }
}

/**
 * GitHub API Helper: List contents of a directory (Relative to dataDir)
 */
async function listContents(path = '') {
    try {
        const fullPath = `${ghConfig.dataDir}${path}`.replace(/\/$/, '');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${fullPath}`;
        
        const headers = {};
        if (ghConfig.token) headers['Authorization'] = `token ${ghConfig.token}`;
        
        const res = await fetch(url, { 
            headers: headers,
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("[GitHub API] listContents error:", err);
        return [];
    }
}

/**
 * GitHub API Helper: List repository root (Used for Migration only)
 */
async function listRepoRoot() {
    try {
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/`;
        
        const headers = {};
        if (ghConfig.token) headers['Authorization'] = `token ${ghConfig.token}`;

        const res = await fetch(url, { 
            headers: headers,
            cache: 'no-store'
        });
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
        // Display the specific GitHub reason (e.g. "sha is required") on the button
        if (statusCallback) statusCallback(`에러: ${err.message}`, '#ef4444');
        return false;
    }
}

/**
 * GitHub API Helper: Fetch file content
 * @param {boolean} isRoot - If true, ignores dataDir (used for migration)
 */
async function fetchFileContent(filename, isRoot = false) {
    try {
        const fullPath = isRoot ? filename : `${ghConfig.dataDir}${filename}`;
        const encodedPath = encodeURIComponent(fullPath).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        
        const headers = { 'Accept': 'application/vnd.github.v3.raw' };
        if (ghConfig.token) headers['Authorization'] = `token ${ghConfig.token}`;

        const res = await fetch(url, { 
            headers: headers,
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Fetch content failed');
        
        return await res.text();
    } catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * GitHub API Helper: Sync file list
 */
async function syncFilesFromGitHub(callback) {
    try {
        const encodedPath = encodeURIComponent(`${ghConfig.dataDir}`).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        
        const headers = {};
        if (ghConfig.token) headers['Authorization'] = `token ${ghConfig.token}`;

        const res = await fetch(url, { headers: headers });
        if (!res.ok) throw new Error('Sync failed');
        
        const data = await res.json();
        const systemFiles = ['index.html', 'viewer.html', 'style.css', 'app.js', 'stitch_ui_viewer.html'];
        const htmlFiles = data.filter(item => 
            (item.name.endsWith('.html') || item.name.endsWith('.htm')) && 
            !systemFiles.includes(item.name)
        );
        
        if (callback) callback(htmlFiles);
        return htmlFiles;
    } catch (err) {
        console.error(err);
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
    // If no project, fallback to root context (legacy)
    const fullPath = project ? `${project}/${METADATA_FILE}` : METADATA_FILE;
    
    try {
        const encodedPath = encodeURIComponent(`${ghConfig.dataDir}${fullPath}`).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        
        const headers = { 
            'Accept': 'application/vnd.github.v3.raw'
        };
        if (ghConfig.token) headers['Authorization'] = `token ${ghConfig.token}`;

        const res = await fetch(url, { 
            headers: headers,
            cache: 'no-store'
        });
        
        if (res.status === 404) return { screens: {}, title: project || 'Default Project' };
        if (!res.ok) throw new Error(`FETCH_META_FAILED_${res.status}`);
        
        const content = await res.text();
        return JSON.parse(content);
    } catch (err) {
        console.error('[GitHub API] fetchProjectMetadata Error:', err.message);
        return { screens: {}, title: project || 'Default Project' };
    }
}

/**
 * Real-time Token Verification
 */
async function verifyAndSaveToken(token, statusCallback) {
    if (!token) return false;
    if (statusCallback) statusCallback('검증 중... ⏳', '#facc15');

    try {
        const res = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${token.trim()}` }
        });

        if (res.ok) {
            ghConfig.updateToken(token);
            if (statusCallback) statusCallback('인증 완료 ✅', '#4ade80');
            return true;
        } else {
            if (statusCallback) statusCallback('토큰이 유효하지 않습니다 ❌', '#ef4444');
            return false;
        }
    } catch (err) {
        if (statusCallback) statusCallback('인증 오류 ❌', '#ef4444');
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

// --- Legacy Compatibility Functions (Keep for existing Dashboard flow) ---
async function fetchMetadata() { return fetchProjectMetadata(null); }
async function updateFileMetadata(filename, data, statusCallback) {
    // Treat legacy isolated files as single-screen updates in the root metadata
    return updateScreenMetadata(null, filename, { ...data, projectMeta: data }, statusCallback);
}
