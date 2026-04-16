/**
 * Shared Application Logic & GitHub Integration
 */

const ghConfig = {
    owner: 'bychoi-space',
    repo: 'AI-work',
    // Trim token in case of leading/trailing spaces
    token: (localStorage.getItem('gh_token') || '').trim(),
    dataDir: 'data/' // 사용자 파일 저장 폴더
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
 */
async function fetchFileContent(filename) {
    if (!ghConfig.token) return null;
    
    try {
        const encodedPath = encodeURIComponent(`${ghConfig.dataDir}${filename}`).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        const res = await fetch(url, { 
            headers: { 
                'Authorization': `token ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
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
    if (!ghConfig.token) return [];
    
    try {
        const encodedPath = encodeURIComponent(`${ghConfig.dataDir}`).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        const res = await fetch(url, { headers: { 'Authorization': `token ${ghConfig.token}` }});
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
 */
async function deleteFileFromGitHub(filename, sha, statusCallback) {
    if (!ghConfig.token || !sha) return false;

    if (statusCallback) statusCallback('삭제 중 ⏳', '#f87171');

    try {
        const encodedPath = encodeURIComponent(`${ghConfig.dataDir}${filename}`).replace(/%2F/g, '/');
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
 * Metadata Storage (JSON DB) Helpers
 */
const METADATA_FILE = 'metadata.json';
async function fetchMetadata() {
    if (!ghConfig.token) return { files: {} };
    try {
        const encodedPath = encodeURIComponent(`${ghConfig.dataDir}${METADATA_FILE}`).replace(/%2F/g, '/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${encodedPath}`;
        const res = await fetch(url, { 
            headers: { 
                'Authorization': `token ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });
        
        if (res.status === 404) return { files: {} };
        if (!res.ok) throw new Error(`FETCH_META_FAILED_${res.status}`);
        
        const content = await res.text();
        if (!content || content.trim() === '') return { files: {} };
        
        try {
            return JSON.parse(content);
        } catch (pErr) {
            console.error('[GitHub API] JSON Parse Error in metadata.json:', pErr);
            return { files: {} };
        }
    } catch (err) {
        console.error('[GitHub API] fetchMetadata Error:', err.message);
        return { files: {} };
    }
}

async function saveMetadata(allMetadata, statusCallback) {
    if (!ghConfig.token) return false;
    const content = JSON.stringify(allMetadata, null, 2);
    return await uploadToGitHub(METADATA_FILE, content, statusCallback);
}

async function updateFileMetadata(filename, data, statusCallback) {
    const metadata = await fetchMetadata();
    metadata.files = metadata.files || {};
    const existing = metadata.files[filename] || {};
    
    metadata.files[filename] = {
        title: data.title !== undefined ? data.title : existing.title || '',
        period: data.period !== undefined ? data.period : existing.period || '',
        assignee: data.assignee !== undefined ? data.assignee : existing.assignee || '',
        jira: data.jira !== undefined ? data.jira : existing.jira || '',
        description: data.description !== undefined ? data.description : existing.description || '',
        figmaUrl: data.figmaUrl !== undefined ? data.figmaUrl : existing.figmaUrl || '',
        pubUrl: data.pubUrl !== undefined ? data.pubUrl : existing.pubUrl || '',
        updatedAt: new Date().toISOString()
    };
    return await saveMetadata(metadata, statusCallback);
}
