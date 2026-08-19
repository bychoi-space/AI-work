/**
 * LFmall Design Studio V4 - Premium Component Library
 * Optimized for high-fidelity design reviews.
 */

window.V4_COMPONENT_LIBRARY = {
    atoms: [
        {
            id: 'v4-btn-primary',
            name: 'Glass Primary Button',
            category: 'Atoms',
            previewHtml: `<div class="v4-btn-glass" style="background: var(--v4-primary); border:none; box-shadow: 0 4px 12px var(--v4-primary-glow);">Click Me</div>`,
            html: `<button class="v4-btn-glass" style="background: #6366f1; border:none; color:white; padding: 12px 24px; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">Primary Action</button>`
        },
        {
            id: 'v4-badge-new',
            name: 'Neon Badge',
            category: 'Atoms',
            previewHtml: `<span style="background: #00e5ff; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 900;">NEW</span>`,
            html: `<span style="background: #00e5ff; color: #000; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-block; box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);">NEW</span>`
        },
        {
            id: 'v4-text-premium',
            name: 'Premium Text Block',
            category: 'Atoms',
            previewHtml: `<div style="font-size: 12px; color: #0f172a; border-bottom: 1.6px solid #475569; width: 40px; text-align: center;">TEXT</div>`,
            html: `
            <div class="v4-shape v4-shape-text" style="width: 100%; height: 100%; background: transparent; border: 1.6px solid transparent; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; white-space: pre-wrap;">Enter Premium Text</div>
            </div>`
        },
        {
            id: 'v4-atom-icon-share',
            name: 'Share Icon (Premium)',
            category: 'Atoms',
            width: '40px',
            height: '40px',
            previewHtml: `<div class="lf-icon lf-icon-share" style="width: 24px; height: 24px; background-image: url('https://img.lfmall.co.kr/file/WAS/apps/2023/mfront/product/iconShare@2x.png'); background-size: contain; background-repeat: no-repeat; background-position: center; background-origin: content-box; filter: brightness(0) invert(1);"></div>`,
            html: `<div class="lf-icon" style="width: 100%; height: 100%; background-image: url('https://img.lfmall.co.kr/file/WAS/apps/2023/mfront/product/iconShare@2x.png'); background-size: contain; background-repeat: no-repeat; background-position: center; padding: 8px; box-sizing: border-box; background-origin: content-box; background-clip: content-box; pointer-events: none;"></div>`
        },
        {
            id: 'v4-atom-textbox',
            name: 'Textbox',
            category: 'Atoms',
            width: '150px',
            height: '30px',
            previewHtml: `<div style="width: 80px; height: 20px; background: var(--v4-input-bg, #fafaf2); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 4px; display: flex; align-items: center; padding: 0 4px; font-size: 8px; color: var(--v4-placeholder-color, #a3a3a3); font-family: inherit;">Placeholder</div>`,
            html: `
            <div class="v4-textbox-container" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: var(--v4-input-bg, #fafaf2); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; display: flex; align-items: center; padding: 0 12px; pointer-events: auto;">
                <div class="v4-textbox-placeholder" style="position: absolute; left: 12px; color: var(--v4-placeholder-color, #a3a3a3); pointer-events: none; font-size: 12px; font-weight: 400; user-select: none; font-family: inherit;">Placeholder</div>
                <div contenteditable="true" class="v4-editable-cell v4-textbox-input" style="width: 100%; height: 100%; border: none; outline: none; background: transparent; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; display: flex; align-items: center; white-space: nowrap; overflow: hidden; padding: 8px 0; box-sizing: border-box; padding-right: 48px; font-family: inherit;"></div>
                <div class="v4-textbox-counter" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 400; color: var(--v4-placeholder-color, #a3a3a3); user-select: none; display: none; font-family: inherit;">0/100</div>
            </div>`
        },
        {
            id: 'v4-atom-textarea',
            name: 'Textarea',
            category: 'Atoms',
            width: '150px',
            height: '60px',
            previewHtml: `<div style="width: 80px; height: 30px; background: var(--v4-input-bg, #fafaf2); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 4px; padding: 2px; font-size: 8px; color: var(--v4-placeholder-color, #a3a3a3); box-sizing: border-box; font-family: inherit;">Placeholder</div>`,
            html: `
            <div class="v4-textarea-container" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: var(--v4-input-bg, #fafaf2); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; display: flex; flex-direction: column; padding: 10px 12px; pointer-events: auto;">
                <div class="v4-textarea-placeholder" style="position: absolute; left: 12px; top: 10px; color: var(--v4-placeholder-color, #a3a3a3); pointer-events: none; font-size: 12px; font-weight: 400; user-select: none; font-family: inherit;">Placeholder</div>
                <div contenteditable="true" class="v4-editable-cell v4-textarea-input" style="width: 100%; height: 100%; border: none; outline: none; background: transparent; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; resize: none; overflow-y: auto; padding: 0 0 20px 0; word-break: break-all; white-space: pre-wrap; box-sizing: border-box; font-family: inherit;"></div>
                <div class="v4-textarea-counter" style="position: absolute; right: 12px; bottom: 8px; font-size: 12px; font-weight: 400; color: var(--v4-placeholder-color, #a3a3a3); user-select: none; display: none; font-family: inherit;">0/100</div>
            </div>`
        },
        {
            id: 'v4-atom-stepper',
            name: 'Quantity Stepper',
            category: 'Atoms',
            width: '154px',
            height: '30px',
            previewHtml: `<div style="display: flex; align-items: center; background: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 6px; font-size: 10px; height: 20px; padding: 0 4px; box-sizing: border-box; width: 80px; justify-content: space-between;"><span style="color: var(--v4-placeholder-color, #9ca3af); font-weight: bold; cursor: default;">—</span><span style="font-weight: bold; color: var(--v4-text-color, #0f172a);">1</span><span style="color: var(--v4-text-color, #0f172a); font-weight: bold; cursor: default;">+</span></div>`,
            html: `
            <div class="v4-stepper-container" data-min="1" data-max="99" data-val="1" data-btn-enabled="true" data-btn-text="적용" data-disabled="false" style="position: relative; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; pointer-events: auto; user-select: none;">
                <div class="v4-stepper-control" style="display: inline-flex; align-items: center; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background-color: var(--v4-component-bg, #ffffff); overflow: hidden; height: 30px; box-sizing: border-box;">
                    <button class="v4-stepper-dec" style="width: 30px; height: 100%; border: none; background: var(--v4-disabled-bg, #f3f4f6); color: var(--v4-placeholder-color, #9ca3af); font-size: 12px; font-weight: 400; cursor: not-allowed; outline: none; display: flex; align-items: center; justify-content: center; user-select: none; transition: background-color 0.2s, color 0.2s; font-family: inherit;">—</button>
                    <div class="v4-stepper-value" style="width: 40px; text-align: center; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); user-select: none; font-family: inherit;">1</div>
                    <button class="v4-stepper-inc" style="width: 30px; height: 100%; border: none; background: var(--v4-component-bg, #ffffff); border-left: 1.6px solid var(--v4-border-color, #e5e7eb); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; cursor: pointer; outline: none; display: flex; align-items: center; justify-content: center; user-select: none; transition: background-color 0.2s, color 0.2s; font-family: inherit;">+</button>
                </div>
                <button class="v4-stepper-action" style="height: 30px; padding: 0 12px; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background-color: var(--v4-component-bg, #ffffff); font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: inherit;">적용</button>
            </div>`
        },
        {
            id: 'v4-atom-selectbox',
            name: 'Select Box',
            category: 'Atoms',
            width: '150px',
            height: '30px',
            previewHtml: `<div style="display: flex; align-items: center; justify-content: space-between; background: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 6px; font-size: 10px; height: 20px; padding: 0 6px; box-sizing: border-box; width: 80px;"><span style="color: var(--v4-text-color, #0f172a);">선택하세요</span><span style="font-size: 8px; color: var(--v4-placeholder-color, #9ca3af);">▼</span></div>`,
            html: `
            <div class="v4-selectbox-container" data-default-text="선택하세요" data-dropdown-active="false" data-options="Option 1,Option 2,Option 3" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box;">
                <div class="v4-selectbox-header" style="display: flex; align-items: center; justify-content: space-between; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background-color: var(--v4-component-bg, #ffffff); height: 100%; width: 100%; padding: 0 12px; box-sizing: border-box; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); cursor: pointer; overflow: hidden;">
                    <span class="v4-selectbox-selected-text" style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">선택하세요</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--v4-placeholder-color, #9ca3af)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <div class="v4-selectbox-options" style="display: none; position: absolute; top: calc(100% - 2px); left: 0; width: 100%; background-color: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc); border-top: none; border-radius: 0 0 8px 8px; box-sizing: border-box; z-index: 1000; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div class="v4-selectbox-option" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); border-bottom: 1.6px solid var(--v4-disabled-bg, #f3f4f6); box-sizing: border-box;">Option 1</div>
                    <div class="v4-selectbox-option" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); border-bottom: 1.6px solid var(--v4-disabled-bg, #f3f4f6); box-sizing: border-box;">Option 2</div>
                    <div class="v4-selectbox-option" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); border-bottom: 1.6px solid var(--v4-disabled-bg, #f3f4f6); box-sizing: border-box;">Option 3</div>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-fileupload',
            name: 'File Upload',
            category: 'Atoms',
            width: '300px',
            height: '30px',
            previewHtml: `<div style="display: flex; align-items: center; background: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 6px; font-size: 10px; height: 20px; padding: 0 4px; box-sizing: border-box; width: 80px; gap: 4px;"><div style="flex: 1; border: 1px solid var(--v4-disabled-bg, #eee); height: 12px; background: var(--v4-input-bg, #fafafa);"></div><div style="background: var(--v4-disabled-bg, #eee); font-size: 8px; padding: 1px 3px; border-radius: 2px;">첨부</div></div>`,
            html: `
            <div class="v4-fileupload-container" data-selected="false" data-file-name="" data-button-text="파일첨부" data-placeholder="선택된 파일 없음" style="position: relative; display: flex; align-items: center; gap: 6px; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box;">
                <div class="v4-fileupload-textbox-wrapper" style="position: relative; display: flex; align-items: center; flex: 1; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background-color: var(--v4-component-bg, #ffffff); height: 30px; padding: 0 10px; box-sizing: border-box;">
                    <div class="v4-fileupload-textbox" style="font-size: 12px; font-weight: 400; color: var(--v4-placeholder-color, #9ca3af); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; cursor: not-allowed; font-family: inherit;">선택된 파일 없음</div>
                    <span class="v4-fileupload-delete" style="display: none; cursor: pointer; color: var(--v4-placeholder-color, #9ca3af); font-size: 14px; font-weight: bold; margin-left: 8px; flex-shrink: 0; transition: color 0.2s;">&times;</span>
                </div>
                <button class="v4-fileupload-button" style="height: 30px; padding: 0 14px; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background-color: var(--v4-component-bg, #ffffff); font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: inherit;">파일첨부</button>
            </div>`
        },
        {
            id: 'v4-atom-alert',
            name: 'Alert Window',
            category: 'Atoms',
            width: '250px',
            height: '120px',
            previewHtml: `<div style="display: flex; flex-direction: column; width: 80px; height: 50px; background: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; font-size: 8px; box-sizing: border-box;"><div style="background: var(--v4-disabled-bg, #e5e7eb); height: 12px; display: flex; align-items: center; padding: 0 4px; border-bottom: 1px solid var(--v4-border-color, #ccc); font-weight: bold;">Alert</div><div style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 6px; color: var(--v4-placeholder-color, #666); padding: 2px; text-align: center;">Message</div></div>`,
            html: `
            <div class="v4-alert-container" data-message="얼럿 메시지 입력 표시" data-btn-count="1" data-btn-text-1="확인" data-btn-text-2="취소" data-btn-text-3="저장" data-btn-style-1="normal" data-btn-style-2="normal" data-btn-style-3="normal" data-show-desc="true" data-desc="얼럿 노출 케이스" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; background: transparent; justify-content: flex-end;">
                <div class="v4-alert-desc-wrapper" style="display: flex; justify-content: flex-start; width: 100%; flex-shrink: 0;">
                    <div class="v4-alert-desc-badge" style="background: #1e3a8a; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 400; font-family: inherit; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1.6px solid #1e40af;">얼럿 노출 케이스</div>
                </div>
                <div class="v4-alert-dialog" style="flex: 1; width: 100%; background: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc) !important; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); overflow: hidden; display: flex; flex-direction: column; box-sizing: border-box;">
                    <div class="v4-alert-header" style="height: 32px; flex-shrink: 0; background: var(--v4-disabled-bg, #e5e7eb); display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1.6px solid var(--v4-border-color, #cccccc) !important; box-sizing: border-box; width: 100%;">
                        <span class="v4-alert-title" style="font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); font-family: inherit;">Alert</span>
                        <span class="v4-alert-close" style="cursor: pointer; color: var(--v4-placeholder-color, #9ca3af); font-size: 16px; font-weight: bold; line-height: 1; display: flex; align-items: center; justify-content: center;">&times;</span>
                    </div>
                    <div class="v4-alert-content" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 12px; box-sizing: border-box; width: 100%;">
                        <div class="v4-alert-message" style="font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); text-align: center; line-height: 1.4; white-space: pre-wrap; font-family: inherit; margin-bottom: 14px; word-break: break-all; width: 100%;">얼럿 메시지 입력 표시</div>
                        <div class="v4-alert-buttons" style="display: flex; gap: 8px; justify-content: center; width: 100%; flex-wrap: nowrap; flex-shrink: 0;">
                            <button class="v4-alert-btn v4-alert-btn-1 style-normal" style="height: 28px; min-width: 70px; padding: 0 12px; border: 1.6px solid var(--v4-border-color, #cccccc) !important; border-radius: 6px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); box-sizing: border-box; transition: background 0.2s;">확인</button>
                            <button class="v4-alert-btn v4-alert-btn-2 style-normal" style="height: 28px; min-width: 70px; padding: 0 12px; border: 1.6px solid var(--v4-border-color, #cccccc) !important; border-radius: 6px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); box-sizing: border-box; transition: background 0.2s;">취소</button>
                            <button class="v4-alert-btn v4-alert-btn-3 style-normal" style="height: 28px; min-width: 70px; padding: 0 12px; border: 1.6px solid var(--v4-border-color, #cccccc) !important; border-radius: 6px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); box-sizing: border-box; transition: background 0.2s;">저장</button>
                        </div>
                    </div>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-popup',
            name: 'Popup Window',
            koName: '팝업 모달 다이얼로그 창',
            category: 'Atoms',
            width: '300px',
            height: '200px',
            previewHtml: `<div style="display: flex; flex-direction: column; width: 80px; height: 55px; background: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 6px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); overflow: hidden; font-size: 8px; box-sizing: border-box;"><div style="background: var(--v4-disabled-bg, #f1f5f9); height: 14px; display: flex; align-items: center; justify-content: space-between; padding: 0 4px; border-bottom: 1px solid var(--v4-border-color, #ccc); font-weight: bold; color: #1e293b;"><span>Popup</span><span>&times;</span></div><div style="flex: 1; padding: 4px; background: transparent;"></div></div>`,
            html: `
            <div class="v4-shape v4-popup-container" style="width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; flex-direction: column; background: var(--v4-component-bg, rgb(255, 255, 255)); border: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)) !important; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.06); overflow: hidden;">
                <div class="v4-popup-header" style="height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; background: var(--v4-disabled-bg, #f1f5f9); border-bottom: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)) !important; box-sizing: border-box; width: 100%; flex-shrink: 0; pointer-events: auto;">
                    <div contenteditable="true" class="v4-editable-cell v4-popup-title" style="font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); outline: none; text-align: left; flex: 1; font-family: inherit;">Popup Title</div>
                    <span class="v4-popup-close" style="cursor: pointer; color: var(--v4-placeholder-color, #94a3b8); font-size: 16px; font-weight: bold; line-height: 1; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">&times;</span>
                </div>
                <div class="v4-popup-body" style="flex: 1; width: 100%; padding: 12px; box-sizing: border-box; background: transparent; position: relative;">
                    
                </div>
            </div>`
        },
        {
            id: 'v4-atom-button',
            name: 'Button',
            category: 'Atoms',
            width: '80px',
            height: '40px',
            previewHtml: `<div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 30px; background: var(--v4-component-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 8px; font-weight: bold; color: var(--v4-text-color, #333); box-sizing: border-box;">Button</div>`,
            html: `
            <div class="v4-btn-container" data-text="버튼" data-btn-style="normal" data-btn-radius="6" data-font-size="12" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
                <button class="v4-custom-btn style-normal" style="width: 100%; height: 100%; border: 1.6px solid var(--v4-border-color, #cccccc) !important; border-radius: 6px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); box-sizing: border-box; transition: all 0.2s; font-family: inherit;">버튼</button>
            </div>`
        },
        {
            id: 'v4-atom-datepicker',
            name: 'Date Picker',
            category: 'Atoms',
            width: '500px',
            height: '30px',
            previewHtml: `<div style="display:flex; align-items:center; background:var(--v4-component-bg, #ffffff); border:1.6px solid var(--v4-border-color, #cccccc); border-radius:4px; height:20px; padding:0 5px; font-size:7px; color:var(--v4-text-color, #0f172a); box-sizing:border-box; gap:3px; white-space:nowrap;"><span>26/05/18</span><span style="color:var(--v4-placeholder-color, #9ca3af);">&#9553;</span><span>-</span><span style="color:var(--v4-placeholder-color, #9ca3af);">&#9553;</span><span>26/06/18</span></div>`,
            html: `
            <div class="v4-datepicker-container" data-show-presets="true" data-show-end-date="true" data-default-preset="1M" data-start-date="" data-end-date="" style="position: relative; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; flex-wrap: nowrap; width: 100%; height: 100%;">
                <div class="v4-dp-fields" style="display: inline-flex; align-items: center; gap: 0; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background: var(--v4-component-bg, #ffffff); height: 100%; min-height: 30px; overflow: hidden; box-sizing: border-box; flex-shrink: 0;">
                    <div class="v4-dp-input-group" style="display: inline-flex; align-items: center; padding: 0 10px; gap: 6px; height: 100%;">
                        <div class="v4-dp-date-field v4-dp-start v4-editable-cell" contenteditable="true" style="font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); outline: none; white-space: nowrap; min-width: 82px; font-family: inherit; -webkit-user-select: text; user-select: text;"></div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--v4-placeholder-color, #9ca3af)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 15px; height: 15px; flex-shrink: 0; pointer-events: none; background-image: none !important;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div class="v4-dp-separator" style="color: var(--v4-placeholder-color, #9ca3af); font-size: 12px; padding: 0 2px; flex-shrink: 0; font-family: inherit;">-</div>
                    <div class="v4-dp-input-group" style="display: inline-flex; align-items: center; padding: 0 10px; gap: 6px; height: 100%;">
                        <div class="v4-dp-date-field v4-dp-end v4-editable-cell" contenteditable="true" style="font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); outline: none; white-space: nowrap; min-width: 82px; font-family: inherit; -webkit-user-select: text; user-select: text;"></div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--v4-placeholder-color, #9ca3af)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 15px; height: 15px; flex-shrink: 0; pointer-events: none; background-image: none !important;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                </div>
                <div class="v4-dp-presets" style="display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <button class="v4-dp-preset-btn" data-preset="1D" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">1D</button>
                    <button class="v4-dp-preset-btn" data-preset="1W" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">1W</button>
                    <button class="v4-dp-preset-btn v4-dp-preset-active" data-preset="1M" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid var(--v4-primary); border-radius: 8px; background: var(--v4-primary); color: #ffffff; font-size: 12px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">1M</button>
                    <button class="v4-dp-preset-btn" data-preset="6M" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">6M</button>
                    <button class="v4-dp-preset-btn" data-preset="all" style="height: 30px; min-width: 36px; padding: 0 12px; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background: var(--v4-component-bg, #ffffff); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">&#51204;&#52404;</button>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-toggle',
            name: 'Toggle Button',
            koName: '토글 버튼 스위치 toggle switch',
            category: 'Atoms',
            width: '40px',
            height: '20px',
            previewHtml: `<div style="width:30px; height:15px; border-radius:10px; background:#3b82f6; position:relative; display:flex; align-items:center; box-sizing:border-box; padding:2px;"><div style="width:11px; height:11px; border-radius:50%; background:#fff; position:absolute; right:2px;"></div></div>`,
            html: `
            <div class="v4-toggle-container" data-checked="false" data-color="#3b82f6" style="position: relative; width: 100%; height: 100%; border-radius: 9999px; background: rgb(203, 213, 225); border: 1.6px solid rgb(200, 200, 200) !important; box-sizing: border-box; cursor: pointer; transition: all 0.2s; padding: 0;">
                <div class="v4-toggle-handle" style="position: absolute; top: 3.4px; left: 3.4px; height: calc(100% - 6.8px); aspect-ratio: 1 / 1; border-radius: 50%; background: #ffffff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transform: translateX(0);"></div>
            </div>`
        },
        {
            id: 'v4-atom-image',
            name: 'Image',
            koName: '이미지 업로드 첨부',
            category: 'Atoms',
            width: '120px',
            height: '100px',
            previewHtml: `<span class="material-icons-outlined" style="font-size: 20px; color: var(--v4-placeholder-color, #a3a3a3);">image</span>`,
            html: `<div class="v4-shape v4-shape-image" style="width: 100%; height: 100%; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23cbd5e1%22 stroke-width=%221.6%22><rect width=%2220%22 height=%2220%22 x=%222%22 y=%222%22 rx=%222%22 ry=%222%22/><circle cx=%228.5%22 cy=%228.5%22 r=%221.5%22/><path d=%22M21 15l-5-5L5 21%22/></svg>'); background-size: contain; background-position: center; background-repeat: no-repeat; box-sizing: border-box; border: 1.6px solid transparent;"></div>`
        },
        {
            id: 'v4-atom-admin-settings',
            name: 'Query Item',
            koName: '조회 항목',
            category: 'Atoms',
            width: '1180px',
            height: '40px',
            previewHtml: `<div style="display:flex; align-items:center; border:1px solid #ccc; background:#f8fafc; padding:4px; width:80px; height:40px; box-sizing:border-box;"><div style="width:25px; height:100%; background:#e2e8f0; border-right:1px solid #ccc;"></div><div style="flex:1; height:100%; background:#fff;"></div></div>`,
            html: `
            <div class="v4-admin-settings-container" data-row-count="1" data-row-height="40"
                 data-row1-label="조회 항목" data-row1-cols="1" data-row1-type="textbox"
                 style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background: #ffffff; border: 1.6px solid rgb(226, 232, 240); border-radius: 8px; font-family: inherit; display: flex; flex-direction: column; overflow: hidden; pointer-events: auto;">
                <div class="v4-admin-settings-table" style="display: flex; flex-direction: column; width: 100%; height: 100%;">
                    <!-- Row 1 -->
                    <div class="v4-admin-row" style="display: flex; width: 100%; box-sizing: border-box; height: 40px;">
                        <div class="v4-admin-label-cell" style="width: 140px; background: #f1f5f9; display: flex; align-items: center; padding: 0 16px; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; flex-shrink: 0; font-family: inherit;">조회 항목</div>
                        <div class="v4-admin-content-cell" style="flex: 1; display: flex; align-items: center; padding: 0 16px; box-sizing: border-box;"></div>
                    </div>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-accordion',
            name: 'Accordion',
            category: 'Atoms',
            width: '180px',
            height: '36px',
            legacyName: 'Accordion UI'
        },
        {
            id: 'v4-atom-checkbox',
            name: 'Check Box',
            category: 'Atoms',
            width: '80px',
            height: '32px',
            legacyName: 'Check Box'
        },
        {
            id: 'v4-atom-radio',
            name: 'Radio Button',
            category: 'Atoms',
            width: '80px',
            height: '32px',
            legacyName: 'Radio Button'
        },
        {
            id: 'v4-atom-grid',
            name: 'Grid UI',
            category: 'Atoms',
            width: '500px',
            height: '336px',
            legacyName: 'Grid UI'
        },
        {
            id: 'v4-atom-searchbar',
            name: 'Search Bar',
            category: 'Atoms',
            width: '200px',
            height: '30px',
            legacyName: 'Search Bar'
        }
    ],
    molecules: [
        {
            id: 'v4-search-bar',
            name: 'Glass Search Bar',
            category: 'Molecules',
            previewHtml: `<div style="width: 120px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; border: 1.6px solid rgba(255,255,255,0.2);"></div>`,
            html: `
            <div class="v4-search-container" style="display: flex; align-items: center; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1.6px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 8px 16px; width: 100%; max-width: 400px; box-sizing: border-box;">
                <span class="material-icons-outlined" style="color: rgba(255,255,255,0.4); font-size: 20px;">search</span>
                <input type="text" placeholder="Search products..." style="background: transparent; border: none; color: white; margin-left: 10px; font-size: 14px; outline: none; width: 100%;">
            </div>`
        },

        {
            id: 'v4-tool-text',
            name: 'Text',
            koName: '텍스트 글상자',
            category: 'Shapes',
            isTool: true,
            toolName: 'text',
            icon: 'title',
            iconColor: 'var(--accent)',
            cardStyle: 'background: rgba(255, 255, 255, 0.05); border: 1.6px solid rgba(255, 255, 255, 0.1) !important;',
            html: '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; padding:2px 4px; display:block; text-align:left;">Edit Text</div>'
        },
        {
            id: 'v4-data-table',
            name: 'Table',
            koName: '표 테이블',
            category: 'Shapes',
            icon: 'table_chart',
            iconColor: '#818cf8',
            width: '200px',
            height: '100px',
            cardStyle: 'background: rgba(99, 102, 241, 0.05); border: 1.6px solid rgba(99, 102, 241, 0.1) !important;',
            previewHtml: `<div style="width: 80px; height: 40px; border: 1.6px solid var(--v4-border-color, #475569); background: var(--v4-disabled-bg, #e2e8f0); border-radius: 4px;"></div>`,
            html: `
            <table class="v4-premium-table" style="background: var(--v4-disabled-bg, #ffffff); border: 1.6px solid var(--v4-border-color, #cbd5e1); color: var(--v4-text-color, #0f172a); font-family: inherit; width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse; box-sizing: border-box;">
                <colgroup>
                    <col style="width: 100px;">
                    <col style="width: 100px;">
                </colgroup>
                <thead>
                    <tr style="height: 50px;">
                        <th contenteditable="true" class="v4-editable-cell" style="background: var(--v4-input-bg, #f8fafc); color: var(--v4-text-color, #0f172a); border: 1.6px solid var(--v4-border-color, #cbd5e1); font-size: 12px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">구분</th>
                        <th contenteditable="true" class="v4-editable-cell" style="background: var(--v4-input-bg, #f8fafc); color: var(--v4-text-color, #0f172a); border: 1.6px solid var(--v4-border-color, #cbd5e1); font-size: 12px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">상세 내용</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height: 50px;">
                        <td contenteditable="true" class="v4-editable-cell" style="border: 1.6px solid var(--v4-border-color, #cbd5e1); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">내용</td>
                        <td contenteditable="true" class="v4-editable-cell" style="border: 1.6px solid var(--v4-border-color, #cbd5e1); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">정보</td>
                    </tr>
                </tbody>
            </table>`
        },
        {
            id: 'v4-shape-rect',
            name: 'Rect',
            koName: '사각형 사각도형',
            category: 'Shapes',
            icon: 'crop_square',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 40px; height: 30px; background: var(--v4-component-bg, rgb(255, 255, 255)); border: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)); border-radius: 4px;"></div>`,
            html: `
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div>`
        },
        {
            id: 'v4-shape-circle',
            name: 'Circle',
            koName: '원 원형 동그라미',
            category: 'Shapes',
            icon: 'panorama_fish_eye',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 30px; height: 30px; background: var(--v4-component-bg, rgb(255, 255, 255)); border: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)); border-radius: 50%;"></div>`,
            html: `
            <div class="v4-shape v4-shape-circle" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div>`
        },
        {
            id: 'v4-shape-triangle',
            name: 'Triangle',
            koName: '삼각형 삼각 세모',
            category: 'Shapes',
            icon: 'change_history',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 30px solid rgb(255, 255, 255);"></div>`,
            html: `
            <div class="v4-shape v4-shape-triangle" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: flex-end; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="50,1 1,99 99,99" style="fill: rgb(255, 255, 255); stroke: rgb(200, 200, 200); stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 10px; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative;"></div>
            </div>`
        },
        {
            id: 'v4-shape-diamond',
            name: 'Diamond',
            koName: '다이아몬드 마름모 조건 의사결정',
            category: 'Shapes',
            icon: 'crop_square',
            iconColor: '#00e5ff',
            iconStyle: 'transform: rotate(45deg);',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 30px; height: 30px; background: rgb(255, 255, 255); border: 1.6px solid rgb(200, 200, 200); clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>`,
            html: `
            <div class="v4-shape v4-shape-diamond" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="50,1 99,50 50,99 1,50" style="fill: rgb(255, 255, 255); stroke: rgb(200, 200, 200); stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 60%; height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative;"></div>
            </div>`
        },
        {
            id: 'v4-shape-arrow',
            name: 'Arrow',
            koName: '화살표 방향 지시 흐름도',
            category: 'Shapes',
            icon: 'trending_flat',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<svg viewBox="0 0 100 100" style="width: 30px; height: 30px; overflow: visible;"><path d="M 0,30 L 60,30 L 60,10 L 100,50 L 60,90 L 60,70 L 0,70 Z" style="fill: rgb(255, 255, 255); stroke: rgb(200, 200, 200); stroke-width: 1.6; vector-effect: non-scaling-stroke;" /></svg>`,
            html: `
            <div class="v4-shape v4-shape-arrow" data-arrow-dir="right" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <path class="v4-arrow-path" d="M 0,30 L 60,30 L 60,10 L 100,50 L 60,90 L 60,70 L 0,70 Z" style="fill: rgb(255, 255, 255); stroke: rgb(200, 200, 200); stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 50%; height: 40%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative;"></div>
            </div>`
        },
        {
            id: 'v4-connector-straight',
            name: 'Line (Straight)',
            koName: '직선 화살표 선 커넥터',
            category: 'Shapes',
            iconType: 'svg',
            iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
            cardStyle: 'background: rgba(148, 163, 184, 0.1); border: 1.6px solid rgba(148, 163, 184, 0.2) !important;',
            previewHtml: `<div style="display: flex; align-items: center; width: 30px;"><div style="flex: 1; height: 2px; background: #3b82f6;"></div><div style="width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 6px solid #3b82f6;"></div></div>`,
            onclick: "window.ConnectorEngine && window.ConnectorEngine.spawnLine('straight')"
        },
        {
            id: 'v4-connector-elbow',
            name: 'Line (Elbow)',
            koName: '꺾인선 화살표 선 커넥터',
            category: 'Shapes',
            iconType: 'svg',
            iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><polyline points="9 10 9 19 18 19"></polyline></svg>',
            cardStyle: 'background: rgba(148, 163, 184, 0.1); border: 1.6px solid rgba(148, 163, 184, 0.2) !important;',
            previewHtml: `<div style="width: 24px; height: 24px; border-left: 2px solid #3b82f6; border-bottom: 2px solid #3b82f6; position: relative;"><div style="position: absolute; right: -6px; bottom: -4px; width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 6px solid #3b82f6;"></div></div>`,
            onclick: "window.ConnectorEngine && window.ConnectorEngine.spawnLine('elbow')"
        },
        {
            id: 'v4-shape-pattern-grid',
            name: 'Pattern',
            koName: '패턴 격자 그리드 모눈종이',
            category: 'Shapes',
            icon: 'grid_4x4',
            iconColor: '#fff',
            cardStyle: 'background: rgba(255, 255, 255, 0.05); border: 1.6px solid rgba(255, 255, 255, 0.1) !important;',
            previewHtml: `<div class="v4-shape-pattern-grid" style="width: 40px; height: 30px; background: rgb(255, 255, 255); border: 1.6px solid rgb(200, 200, 200);"></div>`,
            html: `
            <div class="v4-shape v4-shape-pattern-grid" style="width: 100%; height: 100%; background: rgb(255, 255, 255); border: 1.6px solid rgb(200, 200, 200); display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div>`
        },
        {
            id: 'v4-shape-wave',
            name: 'Wave',
            koName: '물결 웨이브 파도 구분선',
            category: 'Shapes',
            icon: 'waves',
            iconColor: '#fb923c',
            cardStyle: 'background: rgba(251, 146, 60, 0.05); border: 1.6px solid rgba(251, 146, 60, 0.1) !important;',
            width: '360px',
            height: '20px',
            previewHtml: `<svg viewBox="0 0 100 20" preserveAspectRatio="none" style="width: 45px; height: 15px;"><polygon points="0,6 12.5,2 25,6 37.5,2 50,6 62.5,2 75,6 87.5,2 100,6 100,16 87.5,12 75,16 62.5,12 50,16 37.5,12 25,16 12.5,12 0,16" style="fill: #ffedd5; stroke: #fb923c; stroke-width: 1.6; vector-effect: non-scaling-stroke;" /></svg>`,
            html: `
            <div class="v4-shape v4-shape-wave" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 360 20" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="0,6 45,2 90,6 135,2 180,6 225,2 270,6 315,2 360,6 360,16 315,12 270,16 225,12 180,16 135,12 90,16 45,12 0,16" style="fill: #ffedd5; stroke: #fb923c; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px 20px; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative; color: var(--v4-text-color, #0f172a);"></div>
            </div>`
        }
    ],
    organisms: [
        {
            id: 'v4-premium-gnb',
            name: 'Black Pearl GNB',
            category: 'Organisms',
            previewHtml: `<div style="width: 100%; height: 10px; background: #000;"></div>`,
            html: `
            <nav class="premium-gnb" style="display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 80px; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.1); width: 100%; color: white; font-family: 'Inter', sans-serif; box-sizing: border-box;">
                <div style="display: flex; align-items: center; gap: 32px;">
                    <div style="font-size: 24px; font-weight: 900; letter-spacing: -1px;">LF<span style="color: #6366f1;">.</span></div>
                    <div style="display: flex; gap: 24px; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.7);">
                        <span>NEW</span>
                        <span>MEN</span>
                        <span>WOMEN</span>
                        <span>KIDS</span>
                        <span>SALE</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <span class="material-icons-outlined">search</span>
                    <span class="material-icons-outlined">person_outline</span>
                    <span class="material-icons-outlined" style="position: relative;">
                        shopping_bag
                        <span style="position: absolute; top: -4px; right: -6px; width: 14px; height: 14px; background: #6366f1; border-radius: 50%; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900;">2</span>
                    </span>
                </div>
            </nav>`
        }
    ]
};
