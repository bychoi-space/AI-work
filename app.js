/**
 * Shared Application Logic & GitHub Integration
 */

const ghConfig = {
    owner: 'bychoi-space',
    repo: 'AI-work',
    token: localStorage.getItem('gh_token') || ''
};

function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

/**
 * GitHub API Helper: Upload or Update file
 */
async function uploadToGitHub(filename, content, statusCallback) {
    if (!ghConfig.token) return;
    
    if (statusCallback) statusCallback('업로드 중 ⏳', '#facc15');

    try {
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${filename}`;
        
        let sha = undefined;
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${ghConfig.token}` }});
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        }

        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${ghConfig.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Auto-upload: ${filename} from UI Viewer`,
                content: encodeBase64(content),
                sha: sha
            })
        });

        if (putRes.ok) {
            if (statusCallback) {
                statusCallback('저장 완료 ✅', '#4ade80');
                setTimeout(() => statusCallback('가동 중🟢', '#4ade80'), 3000);
            }
            return true;
        } else {
            throw new Error('Upload failed');
        }
    } catch (err) {
        console.error(err);
        if (statusCallback) statusCallback('오류 발생 ❌', '#ef4444');
        return false;
    }
}

/**
 * GitHub API Helper: Fetch file content
 */
async function fetchFileContent(filename) {
    if (!ghConfig.token) return null;
    
    try {
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${filename}`;
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
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/`;
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
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${filename}`;
        
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

