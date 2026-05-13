$inspectorPath = "c:\ai-work\assets\vctrl_inspector.js"
$content = Get-Content $inspectorPath -Raw

# Remove any previous bridge attempts and ensure clean state
$content = $content -replace "(?ms)window\.insertV4ComponentById.*", ""

$bridges = @"

window.insertV4ComponentById = function(id) {
    const comp = (window.allComponents || []).find(c => c.id === id);
    if (!comp) return;
    const iframe = document.getElementById('main-iframe');
    if (iframe && window.MessageHub) {
        window.MessageHub.send(iframe.contentWindow, 'LF_INSERT_V4_COMP', {
            id: 'v4_' + Date.now(),
            html: comp.html,
            style: comp.style || {}
        });
    }
};

window.insertAtomicComponent = function(type, value) {
    let html = '';
    let style = { width: '40px', height: '40px' };
    if (type === 'icon') {
        html = '<div class="lf-icon lf-icon-' + value.toLowerCase() + '"></div>';
        style = { width: '32px', height: '32px' };
    }
    const iframe = document.getElementById('main-iframe');
    if (iframe && window.MessageHub) {
        window.MessageHub.send(iframe.contentWindow, 'LF_INSERT_V4_COMP', {
            id: 'atom_' + Date.now(),
            html: html,
            style: style
        });
    }
};

console.log("[VCTRL INSPECTOR] UI Controller synchronized with 09:36 AM Engine.");
"@

[System.IO.File]::WriteAllText($inspectorPath, $content.TrimEnd() + $bridges)
Write-Host "Inspector Bridge Sync Successful."
