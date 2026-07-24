/**
 * vctrl_v3.js - Legacy & Utility Engine
 * Responsibility: Annotation pins, canvas interaction (zoom/pan), and viewport management.
 * 
 * IMPORTANT: This file uses window.state and window.DOM directly (not cached const)
 * to ensure references are always live, regardless of script load timing.
 */

console.log("%c [VCTRL V3] Utility Engine Loaded ", "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 2. Annotation & Pins System
window.renderDescriptionList = function() {
    var state = window.state, DOM = window.DOM;
    if (!state || !state.activeFile) return;
    var list = state.activeFile.meta.description;
    if (!DOM || !DOM.descriptionList || !DOM.pinsLayer) return;

    DOM.descriptionList.innerHTML = '';
    DOM.pinsLayer.innerHTML = '';

    // Phase 3: LF_IMPORT_PINS is sent once during loadScreen only.
    // After that, text boxes live in iframe DOM and are saved as HTML.

    list.forEach(function(item, index) {
        // Description Row (Sidebar) - Kept in parent for easier editing
        var row = document.createElement('div');
        row.className = 'desc-row';
        row.draggable = !state.isReadOnly;
        row.dataset.index = index;
        row.innerHTML = `
            <div class="desc-index">${index + 1}</div>
            <textarea class="desc-input" rows="1" placeholder="설명을 입력하세요..." ${state.isReadOnly ? 'disabled' : ''}>${item.text || ''}</textarea>
            <div class="desc-actions">
                <button class="desc-btn desc-btn-del" data-index="${index}" title="삭제"><span class="material-icons-outlined">remove_circle_outline</span></button>
            </div>
        `;
        
        // Pin Marker logic removed here...
        
        // Highlight logic (Simplified for sidebar)
        var highlight = function(active) { row.classList.toggle('highlight', active); };
        row.onmouseenter = function() { highlight(true); };
        row.onmouseleave = function() { highlight(false); };

        // Input & Row Actions
        var input = row.querySelector('.desc-input');
        var autoResize = function(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
        input.oninput = function() { 
            item.text = input.value; 
            autoResize(input); 
            markAsDirty();
        };
        autoResize(input);

        row.querySelector('.desc-btn-del').onclick = async function() {
            var state = window.state;
            if (state.isReadOnly) return window.showAuthModal?.();
            if (await Notification.confirm("이 설명을 삭제하시겠습니까?", "설명 삭제")) {
                list.splice(index, 1); 
                markAsDirty(); 
                renderDescriptionList();
                
                var DOM = window.DOM;
                if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                    window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REORDER_PINS', { pins: list });
                }
            }
        };

        DOM.descriptionList.appendChild(row);
    });

    // Auto-resize inputs after they are successfully appended
    setTimeout(function() {
        if (typeof window.autoResizeDescriptionInputs === 'function') {
            window.autoResizeDescriptionInputs();
        }
    }, 50);
};

window.autoResizeDescriptionInputs = function() {
    var DOM = window.DOM || {};
    if (!DOM.descriptionList) return;
    DOM.descriptionList.querySelectorAll('.desc-input').forEach(function(el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    });
};


window.focusDescriptionRow = function(index) {
    var DOM = window.DOM;
    if (!DOM || !DOM.descriptionList) return;
    
    // 기존 선택 하이라이트 일괄 해제
    DOM.descriptionList.querySelectorAll('.desc-row').forEach(function(row) {
        row.classList.remove('selected-pin');
    });
    
    // 대상 index 행 활성화 및 스크롤, 포커스
    var row = DOM.descriptionList.querySelector(`.desc-row[data-index="${index}"]`);
    if (row) {
        row.classList.add('selected-pin');
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        var input = row.querySelector('.desc-input');
        if (input) {
            input.focus();
            if (typeof window.autoResizeDescriptionInputs === 'function') {
                window.autoResizeDescriptionInputs();
            }
        }
    }
};

window.deleteAnnotation = function(index) {
    var state = window.state;
    if (state.isReadOnly || !state.activeFile) return;
    state.activeFile.meta.description.splice(index, 1);
    markAsDirty(); renderDescriptionList();
};

window.spawnTextEditor = function(x, y, existingIndex) {
    if (existingIndex === undefined) existingIndex = -1;
    var state = window.state;
    if (state.isEditing) closeActiveEditor(true);
    state.isEditing = true;
    state.editingIndex = existingIndex;
    window.initQuillEditor?.();
    
    var editorSection = document.getElementById('text-editor-section');
    if (editorSection) editorSection.style.display = 'block';

    if (window.quillEditor) {
        var item = state.activeFile.meta.description[existingIndex];
        window.quillEditor.root.innerHTML = item ? (item.html || item.text || "") : "";
        window.quillEditor.focus();
    }

    const applyBtn = document.getElementById('btn-editor-apply');
    if (applyBtn) {
        applyBtn.onclick = function() { closeActiveEditor(true); };
    }
    const btnDel = document.getElementById('btn-editor-delete');
    if (btnDel) {
        btnDel.onclick = function() { deleteAnnotation(window.state.editingIndex); closeActiveEditor(false); };
    }
};

window.closeActiveEditor = function(save) {
    if (save === undefined) save = true;
    var state = window.state;
    if (!state.isEditing) return;
    var q = window.quillEditor;
    if (save && q) {
        var item = state.activeFile.meta.description[state.editingIndex];
        if (item) {
            item.html = q.root.innerHTML;
            item.text = q.getText().trim();
            if (!item.text && item.html === "<p><br></p>") state.activeFile.meta.description.splice(state.editingIndex, 1);
            markAsDirty();
        }
    }
    state.isEditing = false;
    state.editingIndex = -1;
    var editorSection = document.getElementById('text-editor-section');
    if (editorSection) editorSection.style.display = 'none';
    var emptyMsg = document.querySelector('.empty-inspector');
    if (emptyMsg) emptyMsg.style.display = 'flex';
    renderDescriptionList();
};

// 3. Canvas Utilities
window.centerView = function() {
    var DOM = window.DOM, state = window.state;
    if (!DOM || !DOM.canvas || !DOM.iframe || !state) return;
    var iw = parseInt(DOM.iframe.style.width) || 1440, ih = parseInt(DOM.iframe.style.height) || 900;
    var cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    var s = Math.min((cw * 0.99) / iw, (ch * 0.99) / ih, 1);
    state.transform = { x: (cw - (iw * s)) / 2, y: (ch - (ih * s)) / 2, scale: s };
    updateTransform();
};

window.updateTransform = function() {
    var DOM = window.DOM, state = window.state;
    if (!DOM || !state) return;
    if (DOM.stage) DOM.stage.style.transform = 'translate(' + state.transform.x + 'px, ' + state.transform.y + 'px) scale(' + state.transform.scale + ')';
    if (DOM.zoomTxt) DOM.zoomTxt.innerText = Math.round(state.transform.scale * 100) + '%';
};

window.adjustZoom = function(delta) {
    var state = window.state, DOM = window.DOM;
    if (!state || !DOM || !DOM.canvas) return;
    var s = state.transform.scale;
    var ns = Math.max(0.1, Math.min(s + delta, 20));
    
    // Zoom relative to the center of the viewport
    var cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    var mx = cw / 2, my = ch / 2;
    
    state.transform.x = mx - (mx - state.transform.x) * (ns / s);
    state.transform.y = my - (my - state.transform.y) * (ns / s);
    state.transform.scale = ns;
    updateTransform();
};

// 4. Device Viewport & Fullscreen
window.setDeviceViewport = function(type, w, h) {
    var DOM = window.DOM;
    document.querySelectorAll('.tools .device-btn').forEach(function(btn) { btn.classList.remove('active'); });
    if (DOM && DOM.artboardWrapper) { DOM.artboardWrapper.style.width = w + 'px'; DOM.artboardWrapper.style.height = h + 'px'; }
    if (DOM && DOM.iframe) { DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px'; }
    setTimeout(function() { centerView(); }, 100);
};

window.toggleFullscreen = function(forceExit) {
    var DOM = window.DOM;
    var isActive = document.body.classList.contains('fullscreen-mode');
    var shouldExit = forceExit === true || (forceExit === undefined && isActive);
    document.body.classList.toggle('fullscreen-mode', !shouldExit);
    if (DOM && DOM.btnFullscreen) DOM.btnFullscreen.querySelector('span').innerText = shouldExit ? 'fullscreen' : 'fullscreen_exit';
    setTimeout(centerView, 350);
};

window.setTool = function(t) {
    var state = window.state, DOM = window.DOM;
    if (!state || !DOM) return;
    state.tool = t;
    if (DOM.canvas) DOM.canvas.classList.toggle('hand-active', t === 'hand');
    if (DOM.iframe) DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
    if (DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = (t === 'select') ? 'auto' : 'none';
};

// 5. Global Event Listeners
function initV3Listeners() {
    var DOM = window.DOM;
    if (!DOM) {
        console.warn("[VCTRL V3] DOM registry not found during listener init. Retrying...");
        setTimeout(initV3Listeners, 100);
        return;
    }

    window.addEventListener('keydown', function(e) {
        var state = window.state;
        if (!state) return;
        if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling
            if (state.tool !== 'hand') {
                if (DOM.canvas) DOM.canvas.classList.add('hand-active');
                if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                state.isHandMode = true;
            }
        }
        if (e.code === 'KeyV') setTool('select');
        if (e.code === 'KeyH') setTool('hand');
        if (e.code === 'KeyT') { if (window.handleTextboxCreation) window.handleTextboxCreation(); }
        if (e.code === 'KeyF') toggleFullscreen();
    });

    window.addEventListener('keyup', function(e) {
        var state = window.state, DOM = window.DOM;
        if (!state) return;
        if (e.code === 'Space') {
            if (state.tool !== 'hand') {
                if (DOM.canvas) DOM.canvas.classList.remove('hand-active');
                if (DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
                state.isHandMode = false;
            }
        }
    });

    if (DOM.canvas) {
        DOM.canvas.addEventListener('wheel', function(e) {
            var state = window.state;
            if (!state) return;
            if (e.ctrlKey) {
                e.preventDefault();
                var s = state.transform.scale;
                var ns = Math.max(0.1, Math.min(s * (1 + (e.deltaY > 0 ? -0.1 : 0.1)), 20));
                var r = DOM.canvas.getBoundingClientRect();
                var mx = e.clientX - r.left, my = e.clientY - r.top;
                state.transform.x = mx - (mx - state.transform.x) * (ns / s);
                state.transform.y = my - (my - state.transform.y) * (ns / s);
                state.transform.scale = ns;
                updateTransform();
            }
        }, { passive: false });

        DOM.canvas.addEventListener('mousedown', function(e) {
            var state = window.state, DOM = window.DOM;
            if (!state) return;
            if (e.target.closest('#floating-inspector-card')) return;
            if (state.tool === 'hand' || e.button === 1 || state.isHandMode) {
                state.isDragging = true;
                state.startX = e.clientX - state.transform.x;
                state.startY = e.clientY - state.transform.y;
                e.preventDefault();
            } else {
                // Clicked on empty canvas space
                if (window.closeActiveEditor) window.closeActiveEditor(true);
            }
        });
    }

    window.addEventListener('mousemove', function(e) {
        var state = window.state;
        if (!state || !state.isDragging) return;
        state.transform.x = e.clientX - state.startX;
        state.transform.y = e.clientY - state.startY;
        updateTransform();
    });

    window.addEventListener('mouseup', function() {
        var state = window.state;
        if (state) state.isDragging = false;
    });

    window.addEventListener('resize', function() {
        if (window.centerView) window.centerView();
    });

    if (DOM && DOM.canvas) {
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(function(entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.contentRect.width > 100 && entry.contentRect.height > 100) {
                        if (window.centerView) window.centerView();
                    }
                }
            });
            ro.observe(DOM.canvas);
        }
    }

    console.log("[VCTRL V3] Utility Engine initialized successfully.");
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initV3Listeners);
} else {
    initV3Listeners();
}

// 6. MessageHub Deselection Integration
if (window.MessageHub) {
    MessageHub.subscribe('LF_DESELECT', function() {
        if (window.closeActiveEditor) window.closeActiveEditor(true);
    });
}
