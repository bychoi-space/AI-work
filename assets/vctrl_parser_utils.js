/**
 * assets/vctrl_parser_utils.js
 * Parsing and text synchronization utilities for LF Editor Studio.
 */

// --- Cover Template Metadata Sync & Version Auto-Increment Helper ---
window.syncCoverMetadata = function(html, metadata, isSave = false, currentActiveFile = null) {
    if (!html) return html;
    
    // 1. Title
    const titleValue = metadata.title || '';
    if (html.match(/(<div[^>]*id="cover-project-title"[^>]*>)/i)) {
        html = html.replace(/(<div[^>]*id="cover-project-title"[^>]*>)[^<]*(<\/div>)/i, `$1${titleValue}$2`);
    } else {
        html = html.replace(/(<div[^>]*id="cover-title"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell"[^>]*>)[^<]*(<\/div>)/i, `$1${titleValue}$2`);
    }
    
    // 2. JIRA
    const jiraValue = metadata.jira || '-';
    html = html.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, `$1${jiraValue}$2`);
    
    // 3. Author
    const authorValue = metadata.assignee || '-';
    if (html.match(/(<td[^>]*id="cover-author"[^>]*>)/i)) {
        html = html.replace(/(<td[^>]*id="cover-author"[^>]*>)[^<]*(<\/td>)/i, `$1${authorValue}$2`);
    } else {
        html = html.replace(/(Lead Designer \/ Author[\s\S]*?<td[^>]*class="v4-editable-cell"[^>]*>)[^<]*(<\/td>)/i, `$1${authorValue}$2`);
    }
    
    // 4. Date
    const dateValue = metadata.period || '-';
    if (html.match(/(<td[^>]*id="cover-date"[^>]*>)/i)) {
        html = html.replace(/(<td[^>]*id="cover-date"[^>]*>)[^<]*(<\/td>)/i, `$1${dateValue}$2`);
    } else {
        html = html.replace(/(Publication Date[\s\S]*?<td[^>]*class="v4-editable-cell"[^>]*>)[^<]*(<\/td>)/i, `$1${dateValue}$2`);
    }
    
    // 5. Version
    if (currentActiveFile) {
        let currentVer = 0.1;
        const verMatch = html.match(/(<div[^>]*id="cover-version-val"[^>]*>v?)([\d.]+)(<\/div>)/i) || 
                         html.match(/(<div[^>]*id="cover-version"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell"[^>]*>v?)([\d.]+)(<\/div>)/i);
        
        if (verMatch && verMatch[2]) {
            currentVer = parseFloat(verMatch[2]);
        } else if (metadata.screens && metadata.screens[currentActiveFile] && metadata.screens[currentActiveFile].version !== undefined) {
            currentVer = parseFloat(metadata.screens[currentActiveFile].version);
        }
        
        let nextVerStr = currentVer.toFixed(1);
        if (isSave) {
            nextVerStr = (currentVer + 0.1).toFixed(1);
        }
        
        if (html.match(/(<div[^>]*id="cover-version-val"[^>]*>)/i)) {
            html = html.replace(/(<div[^>]*id="cover-version-val"[^>]*>v?)[^<]*(<\/div>)/i, `$1${nextVerStr}$2`);
        } else {
            html = html.replace(/(<div[^>]*id="cover-version"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell")([^>]*>v?)([^<]*)(<\/div>)/i, `$1 id="cover-version-val" $2${nextVerStr}$4`);
        }
    }
    
    return html;
};
