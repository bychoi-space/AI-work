$corePath = "c:\ai-work\assets\vctrl_core.js"

$coreCode = @"
/**
 * vctrl_core.js - Central Orchestrator for LF Editor Studio
 * Absolute Stability Version (09:36 AM Restoration)
 */
window.MessageHub = {
    handlers: {},
    subscribe: function(type, callback) { if (!this.handlers[type]) this.handlers[type] = []; this.handlers[type].push(callback); },
    subscribeOnce: function(type, callback) { var self = this; var h = function(data) { self.unsubscribe(type, h); callback(data); }; this.subscribe(type, h); },
    unsubscribe: function(type, callback) { if (this.handlers[type]) { this.handlers[type] = this.handlers[type].filter(function(cb) { return cb !== callback; }); } },
    init: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            var d = e.data; if (!d || !d.type) return;
            if (self.handlers[d.type]) { self.handlers[d.type].forEach(function(cb) { cb(d); }); }
            if (d.type === 'LF_SNAP_REQUEST' && window.SmartGuide) {
                var snap = window.SmartGuide.calculateSnap(d.x, d.y, d.w, d.h);
                window.SmartGuide.drawGuides(snap);
                self.send(e.source, 'LF_SNAP_RESPONSE', snap);
            } else if (d.type === 'LF_SNAP_START' && window.SmartGuide) { window.SmartGuide.findSnapTargets(); }
            else if (d.type === 'LF_SNAP_END' && window.SmartGuide) { window.SmartGuide.clearGuides(); }
            else if (d.type === 'LF_DIRTY') { if (window.markAsDirty) window.markAsDirty(); }
        });
    },
    send: function(target, type, data) {
        if (!target || !target.postMessage) return;
        var payload = { type: type }; if (data) { for (var k in data) payload[k] = data[k]; }
        target.postMessage(payload, '*');
    }
};
window.MessageHub.init();

window.state = { currentProject: null, activeFile: null, projectMetadata: null, screens: [], tool: 'select' };

var v4Styles = ':root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg-dark: #0f172a; --v4-border: rgba(255, 255, 255, 0.15); } body { font-family: \"Inter\", sans-serif; margin: 0; padding: 0; color: #fff; overflow: hidden; } .lf-component { position: absolute; cursor: pointer; box-sizing: border-box; z-index: 100; } .lf-component.selected { outline: 2px solid var(--v4-primary); z-index: 10001 !important; } .lf-drag-handle { position: absolute; width: 24px; height: 24px; background: var(--v4-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; border: 2px solid #fff; z-index: 10002; opacity: 0; transition: 0.2s; top: -12px; left: -12px; font-size: 10px; } .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; } .lf-resizer { position: absolute; bottom: -5px; right: -5px; width: 12px; height: 12px; background: var(--v4-primary); cursor: nwse-resize; border-radius: 50%; border: 2px solid #fff; z-index: 10002; opacity: 0; } .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; } .lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 10002; font-size: 14px; } .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; } .lf-icon { background-image: url(\"https://img.lfmall.co.kr/file/WAS/display/lf2022/mobile/gnb_fnb_sp_v0.1.png\"); background-size: 500% 400%; width: 100%; height: 100%; display: inline-block; background-repeat: no-repeat; pointer-events: none; } .v4-editable-cell:focus { outline: none; background: rgba(99, 102, 241, 0.1); }';

var v4UndoScript = '(function() { var stack = []; window.V4UndoManager = { saveState: function() { var host = document.querySelector(\".page\") || document.querySelector(\".artboard\") || document.body; if (!host) return; var clone = host.cloneNode(true); clone.querySelectorAll(\".lf-drag-handle, .lf-resizer, .lf-delete-trigger\").forEach(function(el) { el.remove(); }); clone.querySelectorAll(\".lf-component\").forEach(function(el) { el.classList.remove(\"selected\"); }); stack.push(clone.innerHTML); if (stack.length > 30) stack.shift(); }, undo: function() { if (stack.length === 0) return; var host = document.querySelector(\".page\") || document.querySelector(\".artboard\") || document.body; if (!host) return; host.innerHTML = stack.pop(); window.parent.postMessage({ type: \"LF_DIRTY\" }, \"*\"); }, init: function() { var self = this; document.addEventListener(\"keydown\", function(e) { if ((e.ctrlKey || e.metaKey) && e.key === \"z\") { e.preventDefault(); self.undo(); } }); } }; V4UndoManager.init(); })();';

var v4Script = '(function() { var isDragging = false, isResizing = false, isMarquee = false, activeEl = null, startX, startY, startW, startH, startRect; function notifyParent(type, data) { var payload = { type: type }; if (data) { for (var k in data) payload[k] = data[k]; } window.parent.postMessage(payload, \"*\"); } document.addEventListener(\"mousedown\", function(e) { var c = e.target.closest(\".lf-component\"), h = e.target.closest(\".lf-drag-handle\"), r = e.target.closest(\".lf-resizer\"), d = e.target.closest(\".lf-delete-trigger\"); if (d && c) { c.remove(); notifyParent(\"LF_DIRTY\"); return; } if (c) { document.querySelectorAll(\".lf-component\").forEach(function(el) { el.classList.remove(\"selected\"); }); c.classList.add(\"selected\"); notifyParent(\"LF_COMP_SELECTED\", { id: c.id }); } else { document.querySelectorAll(\".lf-component\").forEach(function(el) { el.classList.remove(\"selected\"); }); isMarquee = true; notifyParent(\"LF_MARQUEE_START\", { x: e.clientX, y: e.clientY, shiftKey: e.shiftKey }); notifyParent(\"LF_DESELECT\"); } if (r) { V4UndoManager.saveState(); isResizing = true; activeEl = r.parentElement; startX = e.clientX; startY = e.clientY; startW = activeEl.offsetWidth; startH = activeEl.offsetHeight; e.preventDefault(); } else if (h || (c && !e.target.closest(\".v4-editable-cell\"))) { V4UndoManager.saveState(); isDragging = true; activeEl = c; startX = e.clientX; startY = e.clientY; startRect = activeEl.getBoundingClientRect(); notifyParent(\"LF_SNAP_START\"); if (h) e.preventDefault(); } }); document.addEventListener(\"mousemove\", function(e) { if (isDragging && activeEl) { notifyParent(\"LF_SNAP_REQUEST\", { x: startRect.left + (e.clientX - startX), y: startRect.top + (e.clientY - startY), w: activeEl.offsetWidth, h: activeEl.offsetHeight }); } else if (isResizing && activeEl) { activeEl.style.width = Math.max(10, startW + (e.clientX - startX)) + \"px\"; activeEl.style.height = Math.max(10, startH + (e.clientY - startY)) + \"px\"; notifyParent(\"LF_DIRTY\"); } else if (isMarquee) { notifyParent(\"LF_MARQUEE_MOVE\", { x: e.clientX, y: e.clientY }); } }); document.addEventListener(\"mouseup\", function() { if (isDragging) notifyParent(\"LF_SNAP_END\"); if (isMarquee) notifyParent(\"LF_MARQUEE_END\"); isDragging = false; isResizing = false; isMarquee = false; activeEl = null; }); window.addEventListener(\"message\", function(e) { var d = e.data; if (!d) return; if (d.type === \"LF_SNAP_RESPONSE\" && activeEl && isDragging) { var r = activeEl.getBoundingClientRect(); var dx = d.x - r.left, dy = d.y - r.top; if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) { document.querySelectorAll(\".lf-component.selected\").forEach(function(c) { c.style.left = (parseFloat(c.style.left || 0) + dx) + \"px\"; c.style.top = (parseFloat(c.style.top || 0) + dy) + \"px\"; }); notifyParent(\"LF_DIRTY\"); } } else if (d.type === \"LF_ALIGN_COMPONENTS\") { if (window.V4UndoManager) window.V4UndoManager.saveState(); (d.deltas || []).forEach(function(delta) { var el = document.getElementById(delta.id); if (el) { el.style.left = (parseFloat(el.style.left || 0) + delta.dx) + \"px\"; el.style.top = (parseFloat(el.style.top || 0) + delta.dy) + \"px\"; } }); notifyParent(\"LF_DIRTY\"); } else if (d.type === \"LF_INSERT_V4_COMP\") { var host = document.querySelector(\".page\") || document.querySelector(\".artboard\") || document.body; if (!host) return; var v = document.createElement(\"div\"); v.id = d.id; v.className = \"lf-component\"; Object.assign(v.style, Object.assign({ position: \"absolute\", top: \"100px\", left: \"100px\" }, d.style || {})); v.innerHTML = d.html + \"<div class='lf-drag-handle'>::</div><div class='lf-resizer'></div><div class='lf-delete-trigger'>x</div>\"; host.appendChild(v); } else if (d.type === \"LF_REQUEST_SAVE_CONTENT\") { var host = document.querySelector(\".page\") || document.querySelector(\".artboard\") || document.body; if (!host) return; var clone = host.cloneNode(true); clone.querySelectorAll(\".lf-drag-handle, .lf-resizer, .lf-delete-trigger\").forEach(function(el) { el.remove(); }); clone.querySelectorAll(\".lf-component\").forEach(function(el) { el.classList.remove(\"selected\"); }); notifyParent(\"LF_SAVE_CONTENT_RESPONSE\", { html: clone.innerHTML }); } else if (d.type === \"LF_REQUEST_INTERSECTIONS\") { var res = []; document.querySelectorAll(\".lf-component\").forEach(function(c) { var r = c.getBoundingClientRect(); var cr = { x: r.left + d.offsetX, y: r.top + d.offsetY, w: r.width, h: r.height }; if (d.box.x < cr.x + cr.w && d.box.x + d.box.w > cr.x && d.box.y < cr.y + cr.h && d.box.y + d.box.h > cr.y) { c.classList.add(\"selected\"); res.push(c.id); } else { c.classList.remove(\"selected\"); } }); notifyParent(\"LF_MARQUEE_RESULT\", { selectedIds: res }); } }); })();';

window.loadScreen = async function(fileName) {
    if (typeof window.showLoading === 'function') window.showLoading(\"Loading: \" + fileName);
    var content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) { if (typeof window.hideLoading === 'function') window.hideLoading(); return; }
    var styleTag = '<style id=\"v4-style\">' + v4Styles + '</style>';
    var scriptTag = '<script id=\"v4-script\">' + v4UndoScript + v4Script + '</script>';
    var final = content.replace(/<\/head>/i, function() { return styleTag + '</head>'; })
                       .replace(/<\/body>/i, function() { return scriptTag + '</body>'; });
    var iframe = document.getElementById('main-iframe');
    if (iframe) { 
        iframe.srcdoc = final; 
        iframe.style.display = 'block'; 
        iframe.onload = function() { if (typeof window.hideLoading === 'function') window.hideLoading(); };
    }
    state.activeFile = { name: fileName, meta: (state.projectMetadata.screens || {})[fileName] || {} };
    // Clear any persistent error banner on successful load
    const banner = document.querySelector('.error-banner');
    if (banner) banner.remove();
};

window.init = async function() {
    var params = new URLSearchParams(window.location.search);
    state.currentProject = params.get('project') || 'Default';
    var fileName = params.get('file');
    var results = await Promise.all([listContents(state.currentProject), fetchProjectMetadata(state.currentProject)]);
    state.projectMetadata = results[1] || {};
    state.screens = (results[0] || []).filter(function(i) { return i.name.endsWith('.html'); });
    if (!fileName && state.screens.length > 0) fileName = state.screens[0].name;
    if (typeof renderScreenList === 'function') renderScreenList(state.screens, fileName);
    if (fileName) await loadScreen(fileName);
};
document.addEventListener('DOMContentLoaded', window.init);
"@

[System.IO.File]::WriteAllText($corePath, $coreCode)
Write-Host "VCTRL Core Restoration Successful."
