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

    list.forEach(function(item, index) {
        // Description Row (Sidebar)
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

        // Pin Marker (Canvas)
        var pin = document.createElement('div');
        if (item.type === 'text') {
            pin.className = 'text-marker';
            pin.innerHTML = `
                <div class="lf-drag-handle">
                    <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
                </div>
                <div class="lf-delete-trigger">×</div>
                ${item.html || item.text || ''}
            `;
            pin.style.setProperty('color', item.color || "#000000", 'important');
            if (state.isEditing && state.editingIndex === index) pin.classList.add('editing-active');
        } else {
            pin.className = 'pin-marker';
            pin.innerHTML = `
                <div class="lf-delete-trigger">×</div>
                ${index + 1}
            `;
        }
        pin.dataset.index = index;
        pin.style.left = (item.x || 0) + "%";
        pin.style.top = (item.y || 0) + "%";
        
        // Highlight logic
        var highlight = function(active) { pin.classList.toggle('highlight', active); row.classList.toggle('highlight', active); };
        pin.onmouseenter = function() { highlight(true); };
        pin.onmouseleave = function() { highlight(false); };
        row.onmouseenter = function() { highlight(true); };
        row.onmouseleave = function() { highlight(false); };

        // Pin Drag Logic
        pin.addEventListener('mousedown', function(e) {
            var state = window.state, DOM = window.DOM;
            if (state.isReadOnly) return;
            var handle = e.target.closest('.lf-drag-handle');
            e.stopPropagation();

            var startX = e.clientX, startY = e.clientY;
            var moved = false;
            var initialItemX = item.x || 0, initialItemY = item.y || 0;
            var r = DOM.pinsLayer.getBoundingClientRect();
            
            var cw = parseInt(DOM.iframe.style.width) || 1440;
            var ch = parseInt(DOM.iframe.style.height) || 900;

            if (window.SmartGuide) window.SmartGuide.findSnapTargets();

            var onMouseMove = function(moveEvent) {
                var state = window.state, DOM = window.DOM;
                if (item.type === 'text' && !handle) return;
                var dx = moveEvent.clientX - startX, dy = moveEvent.clientY - startY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    if (!moved) {
                        if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                        pin.style.cursor = 'grabbing';
                        pin.classList.add('active', 'dragging-now');
                    }
                    moved = true;
                }
                if (moved) {
                    var targetX = initialItemX + (dx / r.width) * 100;
                    var targetY = initialItemY + (dy / r.height) * 100;
                    
                    if (window.SmartGuide) {
                        var pxX = (targetX / 100) * cw;
                        var pxY = (targetY / 100) * ch;
                        var snap = window.SmartGuide.calculateSnap(pxX, pxY);
                        window.SmartGuide.drawGuides(snap);
                        targetX = (snap.x / cw) * 100;
                        targetY = (snap.y / ch) * 100;
                    }

                    item.x = Math.max(0, Math.min(targetX, 100));
                    item.y = Math.max(0, Math.min(targetY, 100));
                    pin.style.left = item.x + "%"; pin.style.top = item.y + "%";
                }
            };

            var onMouseUp = function() {
                var state = window.state, DOM = window.DOM;
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                if (window.SmartGuide) window.SmartGuide.clearGuides();
                if (moved) {
                    if (DOM.iframe) DOM.iframe.style.pointerEvents = (state.tool === 'hand') ? 'none' : 'auto';
                    pin.style.cursor = 'grab';
                    pin.classList.remove('active', 'dragging-now');
                    markAsDirty();
                } else {
                    if (item.type === 'text') spawnTextEditor(item.x, item.y, index);
                    else {
                        var input = row.querySelector('.desc-input');
                        if (input) { window.switchSidebarTab?.('description'); input.focus(); }
                    }
                }
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // Delete Trigger Logic (on marker)
        var delTrigger = pin.querySelector('.lf-delete-trigger');
        if (delTrigger) {
            delTrigger.onclick = function(e) {
                e.stopPropagation();
                window.deleteAnnotation(index);
            };
        }

        // Input & Row Actions
        var input = row.querySelector('.desc-input');
        var autoResize = function(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
        input.oninput = function() { item.text = input.value; autoResize(input); markAsDirty(); };
        autoResize(input);

        row.querySelector('.desc-btn-del').onclick = async function() {
            var state = window.state;
            if (state.isReadOnly) return window.showAuthModal?.();
            if (await Notification.confirm("이 설명을 삭제하시겠습니까?", "설명 삭제")) {
                list.splice(index, 1); markAsDirty(); renderDescriptionList();
            }
        };

        DOM.descriptionList.appendChild(row);
        DOM.pinsLayer.appendChild(pin);
    });
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
    window.switchSidebarTab?.('editor');
    
    var editorSection = document.getElementById('text-editor-section');
    if (editorSection) editorSection.style.display = 'block';
    
    var emptyMsg = document.querySelector('.empty-inspector');
    if (emptyMsg) emptyMsg.style.display = 'none';

    if (window.quillEditor) {
        var item = state.activeFile.meta.description[existingIndex];
        window.quillEditor.root.innerHTML = item ? (item.html || item.text || "") : "";
        window.quillEditor.focus();
    }

    document.getElementById('btn-editor-apply').onclick = function() { closeActiveEditor(true); };
    document.getElementById('btn-editor-delete').onclick = function() { deleteAnnotation(window.state.editingIndex); closeActiveEditor(false); };
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
    if (!DOM || !DOM.canvas || !DOM.iframe) return;
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
    if (DOM.btnSelect) DOM.btnSelect.classList.toggle('active', t === 'select');
    if (DOM.btnHand) DOM.btnHand.classList.toggle('active', t === 'hand');
    if (DOM.btnText) DOM.btnText.classList.toggle('active', t === 'text');
    if (DOM.canvas) DOM.canvas.classList.toggle('hand-active', t === 'hand');
    if (DOM.iframe) DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
    if (DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = (t === 'select') ? 'auto' : 'none';
};

// 5. Global Event Listeners (deferred to ensure DOM is ready)
window.addEventListener('DOMContentLoaded', function() {
    var DOM = window.DOM;

    window.addEventListener('keydown', function(e) {
        var state = window.state;
        if (!state) return;
        if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        if (e.code === 'Space' && state.tool !== 'hand') {
            if (DOM && DOM.canvas) DOM.canvas.classList.add('hand-active');
            if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
        }
        if (e.code === 'KeyV') setTool('select');
        if (e.code === 'KeyH') setTool('hand');
        if (e.code === 'KeyT') { if (window.handleTextCreation) window.handleTextCreation(); }
        if (e.code === 'KeyF') toggleFullscreen();
    });

    window.addEventListener('keyup', function(e) {
        var state = window.state, DOM = window.DOM;
        if (!state) return;
        if (e.code === 'Space' && state.tool !== 'hand') {
            if (DOM && DOM.canvas) DOM.canvas.classList.remove('hand-active');
            if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
        }
    });

    if (DOM && DOM.canvas) {
        DOM.canvas.addEventListener('wheel', function(e) {
            var state = window.state;
            if (!state) return;
            e.preventDefault();
            var s = state.transform.scale;
            var ns = Math.max(0.1, Math.min(s * (1 + (e.deltaY > 0 ? -0.1 : 0.1)), 20));
            var r = DOM.canvas.getBoundingClientRect();
            var mx = e.clientX - r.left, my = e.clientY - r.top;
            state.transform.x = mx - (mx - state.transform.x) * (ns / s);
            state.transform.y = my - (my - state.transform.y) * (ns / s);
            state.transform.scale = ns;
            updateTransform();
        }, { passive: false });

        DOM.canvas.addEventListener('mousedown', function(e) {
            var state = window.state, DOM = window.DOM;
            if (!state) return;
            if (state.tool === 'hand' || e.button === 1 || DOM.canvas.classList.contains('hand-active')) {
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

    // Auto-fit when window/monitor changes
    window.addEventListener('resize', function() {
        if (window.centerView) window.centerView();
    });

    console.log("[VCTRL V3] Utility Engine initialized successfully.");
});

// 6. MessageHub Deselection Integration
if (window.MessageHub) {
    MessageHub.subscribe('LF_DESELECT', function() {
        if (window.closeActiveEditor) window.closeActiveEditor(true);
    });
}
