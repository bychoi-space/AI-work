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
            <div class="v4-shape v4-shape-text" style="width: 100%; height: 100%; background: transparent; border: 1.6px solid transparent; display: flex; align-items: center; justify-content: center; color: #0f172a; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; text-align: center; outline: none; font-weight: 500; font-size: 14px; word-break: break-word; white-space: pre-wrap;">Enter Premium Text</div>
            </div>`
        },
        {
            id: 'v4-atom-icon-share',
            name: 'Share Icon (Premium)',
            category: 'Atoms',
            previewHtml: `<img src="https://img.lfmall.co.kr/file/WAS/apps/2023/mfront/product/iconShare@2x.png" style="width: 24px;">`,
            html: `<img src="https://img.lfmall.co.kr/file/WAS/apps/2023/mfront/product/iconShare@2x.png" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;">`
        },
        {
            id: 'v4-atom-textbox',
            name: 'Textbox',
            category: 'Atoms',
            previewHtml: `<div style="width: 80px; height: 20px; background: #fafaf2; border: 1.6px solid #cccccc; border-radius: 4px; display: flex; align-items: center; padding: 0 4px; font-size: 8px; color: #a3a3a3; font-family: inherit;">Placeholder</div>`,
            html: `
            <div class="v4-textbox-container" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: #fafaf2; border: 1.6px solid #cccccc; border-radius: 8px; display: flex; align-items: center; padding: 0 12px; pointer-events: auto;">
                <div class="v4-textbox-placeholder" style="position: absolute; left: 12px; color: #a3a3a3; pointer-events: none; font-size: 12px; user-select: none; font-family: inherit;">Placeholder</div>
                <div contenteditable="true" class="v4-editable-cell v4-textbox-input" style="width: 100%; height: 100%; border: none; outline: none; background: transparent; color: #374151; font-size: 12px; display: flex; align-items: center; white-space: nowrap; overflow: hidden; padding: 8px 0; box-sizing: border-box; padding-right: 48px; font-family: inherit;"></div>
                <div class="v4-textbox-counter" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 11px; color: #a3a3a3; user-select: none; display: none; font-family: inherit;">0/100</div>
            </div>`
        },
        {
            id: 'v4-atom-textarea',
            name: 'Textarea',
            category: 'Atoms',
            previewHtml: `<div style="width: 80px; height: 30px; background: #fafaf2; border: 1.6px solid #cccccc; border-radius: 4px; padding: 2px; font-size: 8px; color: #a3a3a3; box-sizing: border-box; font-family: inherit;">Placeholder</div>`,
            html: `
            <div class="v4-textarea-container" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: #fafaf2; border: 1.6px solid #cccccc; border-radius: 8px; display: flex; flex-direction: column; padding: 10px 12px; pointer-events: auto;">
                <div class="v4-textarea-placeholder" style="position: absolute; left: 12px; top: 10px; color: #a3a3a3; pointer-events: none; font-size: 12px; user-select: none; font-family: inherit;">Placeholder</div>
                <div contenteditable="true" class="v4-editable-cell v4-textarea-input" style="width: 100%; height: 100%; border: none; outline: none; background: transparent; color: #374151; font-size: 12px; resize: none; overflow-y: auto; padding: 0 0 20px 0; word-break: break-all; white-space: pre-wrap; box-sizing: border-box; font-family: inherit;"></div>
                <div class="v4-textarea-counter" style="position: absolute; right: 12px; bottom: 8px; font-size: 11px; color: #a3a3a3; user-select: none; display: none; font-family: inherit;">0/100</div>
            </div>`
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
            category: 'Shapes',
            isTool: true,
            toolName: 'text',
            icon: 'title',
            iconColor: 'var(--accent)',
            cardStyle: 'background: rgba(255, 255, 255, 0.05); border: 1.6px solid rgba(255, 255, 255, 0.1) !important;',
            html: '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:#000000; padding:2px 4px; display:block; text-align:left;">Edit Text</div>'
        },
        {
            id: 'v4-data-table',
            name: 'Table',
            category: 'Shapes',
            icon: 'table_chart',
            iconColor: '#818cf8',
            cardStyle: 'background: rgba(99, 102, 241, 0.05); border: 1.6px solid rgba(99, 102, 241, 0.1) !important;',
            previewHtml: `<div style="width: 80px; height: 40px; border: 1.6px solid #475569; background: #e2e8f0; border-radius: 4px;"></div>`,
            html: `
            <table class="v4-premium-table" style="background: #e2e8f0; border: 1.6px solid #475569; color: #0f172a; width: 100%; height: 100%;">
                <thead>
                    <tr>
                        <th contenteditable="true" class="v4-editable-cell" style="background: #cbd5e1; color: #0f172a; border-bottom: 1.6px solid #475569; font-size: 14px; font-weight: 700;">구분</th>
                        <th contenteditable="true" class="v4-editable-cell" style="background: #cbd5e1; color: #0f172a; border-bottom: 1.6px solid #475569; font-size: 14px; font-weight: 700;">상세 내용</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td contenteditable="true" class="v4-editable-cell" style="border-bottom: 1.6px solid #cbd5e1; color: #0f172a; font-size: 14px;">내용</td>
                        <td contenteditable="true" class="v4-editable-cell" style="border-bottom: 1.6px solid #cbd5e1; color: #0f172a; font-size: 14px;">정보</td>
                    </tr>
                </tbody>
            </table>`
        },
        {
            id: 'v4-shape-rect',
            name: 'Rect',
            category: 'Shapes',
            icon: 'crop_square',
            iconColor: '#00e5ff',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 40px; height: 30px; background: #e2e8f0; border: 1.6px solid #475569; border-radius: 4px;"></div>`,
            html: `
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #e2e8f0; border: 1.6px solid #475569; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #0f172a; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 600; font-size: 14px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;">Edit Text</div>
            </div>`
        },
        {
            id: 'v4-shape-circle',
            name: 'Circle',
            category: 'Shapes',
            icon: 'panorama_fish_eye',
            iconColor: '#00e5ff',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 30px; height: 30px; background: #e2e8f0; border: 1.6px solid #475569; border-radius: 50%;"></div>`,
            html: `
            <div class="v4-shape v4-shape-circle" style="width: 100%; height: 100%; background: #e2e8f0; border: 1.6px solid #475569; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0f172a; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 700; font-size: 14px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;">Circle</div>
            </div>`
        },
        {
            id: 'v4-shape-triangle',
            name: 'Triangle',
            category: 'Shapes',
            icon: 'change_history',
            iconColor: '#00e5ff',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 30px solid #e2e8f0;"></div>`,
            html: `
            <div class="v4-shape v4-shape-triangle" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: flex-end; justify-content: center; color: #0f172a; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="50,1 1,99 99,99" style="fill: #e2e8f0; stroke: #475569; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 10px; text-align: center; outline: none; font-weight: 600; font-size: 14px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative;">Triangle</div>
            </div>`
        },
        {
            id: 'v4-shape-diamond',
            name: 'Diamond',
            category: 'Shapes',
            icon: 'crop_square',
            iconColor: '#00e5ff',
            iconStyle: 'transform: rotate(45deg);',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 30px; height: 30px; background: #e2e8f0; border: 1.6px solid #475569; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>`,
            html: `
            <div class="v4-shape v4-shape-diamond" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: #0f172a; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="50,1 99,50 50,99 1,50" style="fill: #e2e8f0; stroke: #475569; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 60%; height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; outline: none; font-weight: 700; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; font-size: 14px; z-index: 2; position: relative;">Decision</div>
            </div>`
        },
        {
            id: 'v4-connector-straight',
            name: 'Line (Straight)',
            category: 'Shapes',
            iconType: 'svg',
            iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            cardStyle: 'background: rgba(148, 163, 184, 0.1); border: 1.6px solid rgba(148, 163, 184, 0.2) !important;',
            previewHtml: `<div style="display: flex; align-items: center; width: 30px;"><div style="flex: 1; height: 2px; background: #3b82f6;"></div><div style="width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 6px solid #3b82f6;"></div></div>`,
            onclick: "window.ConnectorEngine && window.ConnectorEngine.spawnLine('straight')"
        },
        {
            id: 'v4-connector-elbow',
            name: 'Line (Elbow)',
            category: 'Shapes',
            iconType: 'svg',
            iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><polyline points="9 10 9 19 18 19"></polyline><polyline points="14 14 19 19 14 24"></polyline></svg>',
            cardStyle: 'background: rgba(148, 163, 184, 0.1); border: 1.6px solid rgba(148, 163, 184, 0.2) !important;',
            previewHtml: `<div style="width: 24px; height: 24px; border-left: 2px solid #3b82f6; border-bottom: 2px solid #3b82f6; position: relative;"><div style="position: absolute; right: -6px; bottom: -4px; width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 6px solid #3b82f6;"></div></div>`,
            onclick: "window.ConnectorEngine && window.ConnectorEngine.spawnLine('elbow')"
        },
        {
            id: 'v4-shape-pattern-grid',
            name: 'Pattern',
            category: 'Shapes',
            icon: 'grid_4x4',
            iconColor: '#fff',
            cardStyle: 'background: rgba(255, 255, 255, 0.05); border: 1.6px solid rgba(255, 255, 255, 0.1) !important;',
            previewHtml: `<div class="v4-shape-pattern-grid" style="width: 40px; height: 30px; border: 1.6px solid #475569;"></div>`,
            html: `
            <div class="v4-shape v4-shape-pattern-grid" style="width: 100%; height: 100%; border: 1.6px solid #475569; display: flex; align-items: center; justify-content: center; color: #0f172a; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 600; font-size: 14px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div>`
        },
        {
            id: 'v4-shape-wave',
            name: 'Wave',
            category: 'Shapes',
            icon: 'waves',
            iconColor: '#fb923c',
            cardStyle: 'background: rgba(251, 146, 60, 0.05); border: 1.6px solid rgba(251, 146, 60, 0.1) !important;',
            width: '360px',
            height: '20px',
            previewHtml: `<svg viewBox="0 0 100 20" preserveAspectRatio="none" style="width: 45px; height: 15px;"><polygon points="0,6 12.5,2 25,6 37.5,2 50,6 62.5,2 75,6 87.5,2 100,6 100,16 87.5,12 75,16 62.5,12 50,16 37.5,12 25,16 12.5,12 0,16" style="fill: #ffedd5; stroke: #fb923c; stroke-width: 1.6; vector-effect: non-scaling-stroke;" /></svg>`,
            html: `
            <div class="v4-shape v4-shape-wave" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: #0f172a; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 360 20" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="0,6 45,2 90,6 135,2 180,6 225,2 270,6 315,2 360,6 360,16 315,12 270,16 225,12 180,16 135,12 90,16 45,12 0,16" style="fill: #ffedd5; stroke: #fb923c; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px 20px; text-align: center; outline: none; font-weight: 600; font-size: 14px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative; color: #0f172a;"></div>
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
