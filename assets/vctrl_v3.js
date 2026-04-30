/**
 * vctrl_v3.js - Legacy & Utility Engine
 * Responsibility: Annotation pins, canvas interaction (zoom/pan), and viewport management.
 */

console.log("%c [VCTRL V3] Utility Engine Loaded ", "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 1. Context & Local State
const context = {
    selectedTemplate: null
};

// 2. Annotation & Pins System
window.renderDescriptionList = function() {
    if (!state.activeFile) return;
    const list = state.activeFile.meta.description;
    if (!DOM.descriptionList || !DOM.pinsLayer) return;

    DOM.descriptionList.innerHTML = '';
    DOM.pinsLayer.innerHTML = '';

    list.forEach((item, index) => {
        // Description Row (Sidebar)
        const row = document.createElement('div');
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
        const pin = document.createElement('div');
        if (item.type === 'text') {
            pin.className = 'text-marker';
            pin.innerHTML = `
                <div class="lf-drag-handle">
                    <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg>
                </div>
                ${item.html || item.text || ''}
            `;
            pin.style.setProperty('color', item.color || "#000000", 'important');
            if (state.isEditing && state.editingIndex === index) pin.classList.add('editing-active');
        } else {
            pin.className = 'pin-marker';
            pin.innerText = index + 1;
        }
        pin.dataset.index = index;
        pin.style.left = (item.x || 0) + "%";
        pin.style.top = (item.y || 0) + "%";
        
        // Highlight logic
        const highlight = (active) => { pin.classList.toggle('highlight', active); row.classList.toggle('highlight', active); };
        pin.onmouseenter = () => highlight(true);
        pin.onmouseleave = () => highlight(false);
        row.onmouseenter = () => highlight(true);
        row.onmouseleave = () => highlight(false);

        // Pin Drag Logic
        pin.addEventListener('mousedown', (e) => {
            if (state.isReadOnly) return;
            const handle = e.target.closest('.lf-drag-handle');
            e.stopPropagation();

            const startX = e.clientX, startY = e.clientY;
            let moved = false;
            const initialItemX = item.x || 0, initialItemY = item.y || 0;
            const r = DOM.pinsLayer.getBoundingClientRect();

            const onMouseMove = (moveEvent) => {
                if (item.type === 'text' && !handle) return;
                const dx = moveEvent.clientX - startX, dy = moveEvent.clientY - startY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    if (!moved) {
                        if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                        pin.style.cursor = 'grabbing';
                        pin.classList.add('active', 'dragging-now');
                    }
                    moved = true;
                }
                if (moved) {
                    item.x = Math.max(0, Math.min(initialItemX + (dx / r.width) * 100, 100));
                    item.y = Math.max(0, Math.min(initialItemY + (dy / r.height) * 100, 100));
                    pin.style.left = item.x + "%"; pin.style.top = item.y + "%";
                }
            };

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                if (moved) {
                    if (DOM.iframe) DOM.iframe.style.pointerEvents = (state.tool === 'hand') ? 'none' : 'auto';
                    pin.style.cursor = 'grab';
                    pin.classList.remove('active', 'dragging-now');
                    markAsDirty();
                } else {
                    if (item.type === 'text') spawnTextEditor(item.x, item.y, index);
                    else {
                        const input = row.querySelector('.desc-input');
                        if (input) { window.switchSidebarTab?.('description'); input.focus(); }
                    }
                }
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // Input & Row Actions
        const input = row.querySelector('.desc-input');
        const autoResize = (el) => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
        input.oninput = () => { item.text = input.value; autoResize(input); markAsDirty(); };
        autoResize(input);

        row.querySelector('.desc-btn-del').onclick = async () => {
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
    if (state.isReadOnly || !state.activeFile) return;
    state.activeFile.meta.description.splice(index, 1);
    markAsDirty(); renderDescriptionList();
};

window.spawnTextEditor = function(x, y, existingIndex = -1) {
    if (state.isEditing) closeActiveEditor(true);
    state.isEditing = true;
    state.editingIndex = existingIndex;
    window.initQuillEditor?.();
    window.switchSidebarTab?.('editor');
    
    const editorSection = document.getElementById('text-editor-section');
    if (editorSection) editorSection.style.display = 'block';
    
    const emptyMsg = document.querySelector('.empty-inspector');
    if (emptyMsg) emptyMsg.style.display = 'none';

    if (window.quillEditor) {
        const item = state.activeFile.meta.description[existingIndex];
        window.quillEditor.root.innerHTML = item ? (item.html || item.text || "") : "";
        window.quillEditor.focus();
    }

    document.getElementById('btn-editor-apply').onclick = () => closeActiveEditor(true);
    document.getElementById('btn-editor-delete').onclick = () => { deleteAnnotation(state.editingIndex); closeActiveEditor(false); };
};

window.closeActiveEditor = function(save = true) {
    if (!state.isEditing) return;
    const q = window.quillEditor;
    if (save && q) {
        const item = state.activeFile.meta.description[state.editingIndex];
        if (item) {
            item.html = q.root.innerHTML;
            item.text = q.getText().trim();
            if (!item.text && item.html === "<p><br></p>") state.activeFile.meta.description.splice(state.editingIndex, 1);
            markAsDirty();
        }
    }
    state.isEditing = false;
    state.editingIndex = -1;
    const editorSection = document.getElementById('text-editor-section');
    if (editorSection) editorSection.style.display = 'none';
    const emptyMsg = document.querySelector('.empty-inspector');
    if (emptyMsg) emptyMsg.style.display = 'flex';
    renderDescriptionList();
};

// 3. Canvas Utilities
window.centerView = function() {
    if (!DOM.canvas || !DOM.iframe) return;
    const iw = parseInt(DOM.iframe.style.width) || 1440, ih = parseInt(DOM.iframe.style.height) || 900;
    const cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    let s = Math.min((cw * 0.99) / iw, (ch * 0.99) / ih, 1);
    state.transform = { x: (cw - (iw * s)) / 2, y: (ch - (ih * s)) / 2, scale: s };
    updateTransform();
};

window.updateTransform = function() {
    if (DOM.stage) DOM.stage.style.transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
    if (DOM.zoomTxt) DOM.zoomTxt.innerText = Math.round(state.transform.scale * 100) + '%';
};

// 4. Device Viewport & Fullscreen
window.setDeviceViewport = function(type, w, h) {
    document.querySelectorAll('.tools .device-btn').forEach(btn => btn.classList.remove('active'));
    if (DOM.artboardWrapper) { DOM.artboardWrapper.style.width = w + 'px'; DOM.artboardWrapper.style.height = h + 'px'; }
    DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px';
    setTimeout(() => centerView(), 100);
};

window.toggleFullscreen = function(forceExit) {
    const isActive = document.body.classList.contains('fullscreen-mode');
    const shouldExit = forceExit === true || (forceExit === undefined && isActive);
    document.body.classList.toggle('fullscreen-mode', !shouldExit);
    if (DOM.btnFullscreen) DOM.btnFullscreen.querySelector('span').innerText = shouldExit ? 'fullscreen' : 'fullscreen_exit';
    setTimeout(centerView, 350);
};

window.setTool = function(t) {
    state.tool = t;
    DOM.btnSelect?.classList.toggle('active', t === 'select');
    DOM.btnHand?.classList.toggle('active', t === 'hand');
    DOM.btnText?.classList.toggle('active', t === 'text');
    DOM.canvas?.classList.toggle('hand-active', t === 'hand');
    DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
    if (DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = (t === 'select') ? 'auto' : 'none';
};

// 5. Global Event Listeners
window.addEventListener('keydown', e => {
    if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.code === 'Space' && state.tool !== 'hand') { DOM.canvas.classList.add('hand-active'); DOM.iframe.style.pointerEvents = 'none'; }
    if (e.code === 'KeyV') setTool('select');
    if (e.code === 'KeyH') setTool('hand');
    if (e.code === 'KeyT') window.handleTextCreation?.();
    if (e.code === 'KeyF') toggleFullscreen();
});

window.addEventListener('keyup', e => {
    if (e.code === 'Space' && state.tool !== 'hand') { DOM.canvas.classList.remove('hand-active'); DOM.iframe.style.pointerEvents = 'auto'; }
});

DOM.canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const s = state.transform.scale, ns = Math.max(0.1, Math.min(s * (1 + (e.deltaY > 0 ? -0.1 : 0.1)), 20));
    const r = DOM.canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    state.transform.x = mx - (mx - state.transform.x) * (ns / s);
    state.transform.y = my - (my - state.transform.y) * (ns / s);
    state.transform.scale = ns; updateTransform();
}, { passive: false });

DOM.canvas.addEventListener('mousedown', e => {
    if (state.tool === 'hand' || e.button === 1 || DOM.canvas.classList.contains('hand-active')) {
        state.isDragging = true; state.startX = e.clientX - state.transform.x; state.startY = e.clientY - state.transform.y; e.preventDefault();
    }
});

window.addEventListener('mousemove', e => { if (state.isDragging) { state.transform.x = e.clientX - state.startX; state.transform.y = e.clientY - state.startY; updateTransform(); }});
window.addEventListener('mouseup', () => { state.isDragging = false; });

console.log("[VCTRL V3] Utility Engine initialized successfully.");
