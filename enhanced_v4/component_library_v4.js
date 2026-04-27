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
        }
    ],
    molecules: [
        {
            id: 'v4-search-bar',
            name: 'Glass Search Bar',
            category: 'Molecules',
            previewHtml: `<div style="width: 120px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);"></div>`,
            html: `
            <div class="v4-search-container" style="display: flex; align-items: center; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 8px 16px; width: 100%; max-width: 400px;">
                <span class="material-icons-outlined" style="color: rgba(255,255,255,0.4); font-size: 20px;">search</span>
                <input type="text" placeholder="Search products..." style="background: transparent; border: none; color: white; margin-left: 10px; font-size: 14px; outline: none; width: 100%;">
            </div>`
        },
        {
            id: 'v4-product-card',
            name: 'Premium Product Card',
            category: 'Molecules',
            previewHtml: `<div style="width: 60px; height: 80px; background: #eee; border-radius: 8px;"></div>`,
            html: `
            <div class="premium-product-card" style="width: 240px; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); font-family: 'Inter', sans-serif;">
                <div style="height: 240px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; position: relative;">
                    <img src="https://via.placeholder.com/200x240/f8f9fa/adb5bd?text=Product+Image" style="max-width: 100%; height: auto;">
                    <div style="position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <span class="material-icons-outlined" style="font-size: 18px; color: #666;">favorite_border</span>
                    </div>
                </div>
                <div style="padding: 20px;">
                    <div style="font-size: 12px; color: #888; margin-bottom: 4px;">LF COLLECTION</div>
                    <div style="font-size: 15px; font-weight: 600; color: #1a1a1a; line-height: 1.4; margin-bottom: 12px;">Premium Leather Crossbody Bag</div>
                    <div style="display: flex; align-items: baseline; gap: 8px;">
                        <span style="font-size: 18px; font-weight: 800; color: #e60012;">₩ 248,000</span>
                        <span style="font-size: 13px; color: #adb5bd; text-decoration: line-through;">₩ 310,000</span>
                        <span style="font-size: 13px; font-weight: 700; color: #e60012;">20%</span>
                    </div>
                </div>
            </div>`
        },
        {
            id: 'v4-data-table',
            name: 'Glass Data Table',
            category: 'Molecules',
            previewHtml: `<div style="width: 80px; height: 40px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;"></div>`,
            html: `
            <table class="v4-premium-table">
                <thead>
                    <tr>
                        <th contenteditable="true" class="v4-editable-cell">구분</th>
                        <th contenteditable="true" class="v4-editable-cell">상세 내용</th>
                        <th contenteditable="true" class="v4-editable-cell">비고</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td contenteditable="true" class="v4-editable-cell">디스플레이</td>
                        <td contenteditable="true" class="v4-editable-cell">OLED Super Retina XDR</td>
                        <td contenteditable="true" class="v4-editable-cell">검토완료</td>
                    </tr>
                    <tr>
                        <td contenteditable="true" class="v4-editable-cell">해상도</td>
                        <td contenteditable="true" class="v4-editable-cell">2532 x 1170 px</td>
                        <td contenteditable="true" class="v4-editable-cell">수정필요</td>
                    </tr>
                </tbody>
            </table>`
        },
        {
            id: 'v4-shape-rect',
            name: 'Rectangle',
            category: 'Shapes',
            previewHtml: `<div style="width: 40px; height: 30px; background: #334155; border: 1px solid #000; border-radius: 4px;"></div>`,
            html: `
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #334155; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 600; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;">Edit Text</div>
            </div>`
        },
        {
            id: 'v4-shape-circle',
            name: 'Circle',
            category: 'Shapes',
            previewHtml: `<div style="width: 30px; height: 30px; background: #334155; border: 1px solid #000; border-radius: 50%;"></div>`,
            html: `
            <div class="v4-shape v4-shape-circle" style="width: 100%; height: 100%; background: #334155; border: 2px solid #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; outline: none; font-weight: 700; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;">Circle</div>
            </div>`
        },
        {
            id: 'v4-shape-triangle',
            name: 'Triangle',
            category: 'Shapes',
            previewHtml: `<div style="width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 30px solid #334155;"></div>`,
            html: `
            <div class="v4-shape v4-shape-triangle" style="width: 100%; height: 100%; background: #334155; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); display: flex; align-items: flex-end; justify-content: center; color: white; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 10px; text-align: center; outline: none; font-weight: 600; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;">Triangle</div>
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
