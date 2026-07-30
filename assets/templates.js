/**
 * LFmall Design Studio - Embedded Templates (COMPLETE BUNDLE)
 * This file contains the HTML structure of all templates to ensure 
 * they can be loaded reliably under file:// protocol without fetch/CORS restrictions.
 */

window.LF_TEMPLATES = window.LF_TEMPLATES || {};

// 1. Cover Template
window.LF_TEMPLATES['template_cover.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Cover - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #1a1a1a;
            --v4-accent: #e60012;
            --v4-bg: #ffffff;
            --v4-surface: #f8f9fa;
            --v4-border: #e1e3e5;
            --v4-text: #1a1c1e;
            --v4-text-sub: #6d7175;
            --v4-text-main: #1a1c1e;
        }
        body { 
            margin: 0; padding: 0; 
            font-family: 'Inter', sans-serif; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; background: var(--v4-surface); 
            overflow: hidden; color: var(--v4-text);
        }
        .page { 
            width: 1440px; height: 900px; 
            position: relative; 
            background: #ffffff;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(230, 0, 18, 0.03) 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.04) 0%, transparent 50%);
            box-shadow: 0 40px 100px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        .lf-component { position: absolute !important; box-sizing: border-box !important; transition: outline 0.1s; z-index: 500; }
        .lf-component:hover { outline: 2px solid var(--v4-accent) !important; cursor: move !important; }
        .lf-component.selected { outline: 2px solid var(--v4-accent) !important; z-index: 10001 !important; }
        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: var(--v4-accent); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; z-index: 100; opacity: 0; transition: opacity 0.2s; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; }
        .v4-card { background: #fff; border: 1px solid var(--v4-border); border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .logo-area { display: flex; align-items: center; gap: 14px; }
        .logo-img { height: 32px; width: auto; object-fit: contain; }
        .logo-text { font-size: 18px; font-weight: 800; color: var(--v4-text); letter-spacing: -0.5px; }
        .logo-sub { font-size: 13px; font-weight: 500; color: var(--v4-text-sub); margin-left: 4px; }
        .v4-editable-cell { outline: none; transition: background 0.2s; }
        .v4-editable-cell:focus { background: #f0f1f2; border-radius: 4px; }
        .cover-info-premium-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #ffffff !important; }
        .cover-info-premium-table th { background: #f4f6f8; text-align: left; padding: 12px 20px; border-bottom: 2px solid #c0c4c9; color: #6d7175; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .cover-info-premium-table td { padding: 14px 20px; border-bottom: 1px solid #c0c4c9; background: #fff; line-height: 1.5; color: #1a1c1e !important; font-size: 14px; }
        .cover-info-premium-table tr:last-child td { border-bottom: none; }
        .accent-bar { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: var(--v4-accent); }
    </style>
</head>
<body>
    <div class="page">
        <div class="accent-bar"></div>
        <div style="position: absolute; top: 60px; left: 80px;">
            <div class="logo-area">
                <img src="https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png" class="logo-img" alt="LF Logo">
                <div style="width: 1px; height: 24px; background: #ddd; margin: 0 4px;"></div>
                <div class="logo-text"><span class="logo-sub" style="margin-left: 0;">Project Management System</span></div>
            </div>
        </div>
        <div id="cover-title" class="lf-component" style="top: 220px; left: 80px; min-width: 800px;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div class="lf-delete-trigger">×</div>
            <div id="cover-project-title" contenteditable="true" class="v4-editable-cell" style="font-size: 48px; font-weight: 900; line-height: 1.15; letter-spacing: -2px; color: var(--v4-text); margin-bottom: 28px;">{{PROJECT_NAME}}</div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 40px; height: 3px; background: var(--v4-accent);"></div>
                <div contenteditable="true" class="v4-editable-cell" style="font-size: 18px; color: var(--v4-text-sub); font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Technical Design Specification</div>
            </div>
        </div>
        <div id="cover-version" class="lf-component" style="top: 500px; left: 80px;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div class="lf-delete-trigger">×</div>
            <div style="display: flex; align-items: center; gap: 24px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 12px; font-weight: 800; color: var(--v4-text-sub);">DOCUMENT VERSION</span>
                    <div id="cover-version-val" contenteditable="true" class="v4-editable-cell" style="font-size: 22px; font-weight: 800; color: var(--v4-accent);">v{{VERSION}}</div>
                </div>
                <div style="width: 1px; height: 40px; background: var(--v4-border);"></div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 12px; font-weight: 800; color: var(--v4-text-sub);">JIRA IDENTIFIER</span>
                    <div id="cover-jira-id" contenteditable="true" class="v4-editable-cell" style="font-size: 22px; font-weight: 800; color: var(--v4-text);">{{JIRA}}</div>
                </div>
            </div>
        </div>
        <div id="cover-info-table" class="lf-component v4-card" style="bottom: 80px; right: 80px; width: 540px; padding: 0; overflow: hidden;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div class="lf-delete-trigger">×</div>
            <table class="cover-info-premium-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Information Entity</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight: 600; color: #6d7175;">Lead Designer / Author</td>
                        <td id="cover-author" contenteditable="true" class="v4-editable-cell" style="font-weight: 700; color: #1a1c1e !important;">{{AUTHOR}}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: #6d7175;">Publication Date</td>
                        <td id="cover-date" contenteditable="true" class="v4-editable-cell" style="font-weight: 700; color: #1a1c1e !important;">{{DATE}}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: #6d7175;">System Context</td>
                        <td contenteditable="true" class="v4-editable-cell" style="color: #1a1c1e !important;">LF E-commerce Platform</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;

// 2. Plan Template
window.LF_TEMPLATES['template_plan.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Plan - {{PROJECT_NAME}}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Malgun Gothic', sans-serif; background: #333; }
        .page { width: 1440px; height: 900px; background: #fff; margin: 0 auto; position: relative; padding: 0; box-sizing: border-box; }
        .header-bar { height: 40px; background: #3c3c3c; color: #fff; display: flex; align-items: center; padding: 0 20px; font-size: 14px; }
        .screen-title-overlay { margin: 20px 40px; background: #4b4b4b; color: #fff; display: inline-block; padding: 10px 40px; border-radius: 6px; font-size: 15px; font-weight: bold; }
        .gantt-container { margin: 0 40px; border: 1px solid #ccc; font-size: 12px; border-collapse: collapse; width: calc(100% - 80px); }
        .gantt-container th, .gantt-container td { border: 1px solid #ccc; height: 32px; padding: 0; }
        .bg-gray { background: #888; color: #fff; font-weight: bold; }
        .bg-light-gray { background: #f8f9fa; }
        .task-list { width: 160px; text-align: center; font-weight: bold; }
        .month-header { background: #666; color: #fff; text-align: center; }
        .week-header { width: 30px; text-align: center; background: #f0f0f0; font-size: 10px; }
        .bar-area { position: relative; }
        .bar { position: absolute; height: 14px; border-radius: 7px; top: 9px; opacity: 0.85; }
        .bar.gray { background: #444; }
        .bar.green { background: #5ea432; }
        .bar.light-green { background: #b7d8a6; }
        .bar.blue { background: #2f5597; }
        .bar.orange { background: #ed7d31; }
        .bar.yellow { background: #ffc000; }
        .label-text { position: absolute; font-size: 11px; white-space: nowrap; font-weight: bold; }
        .footer { position: absolute; bottom: 0; left:0; right:0; height: 40px; border-top: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; }
        .logo-area { display: flex; align-items: center; gap: 8px; }
        .logo-symbol { width: 20px; height: 20px; background: #e60012; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); color: #fff; font-size: 10px; display: flex; align-items: center; justify-content: center; }
        .logo-text { font-weight: 900; font-size: 16px; color: #1a1a1a; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header-bar">Plan</div>
        <div class="screen-title-overlay">사업 진행 일정</div>
        <table class="gantt-container">
            <thead>
                <tr class="bg-gray">
                    <th rowspan="2" class="task-list">Task</th>
                    <th colspan="5" class="month-header">12월</th>
                    <th colspan="4" class="month-header">1월</th>
                    <th colspan="4" class="month-header">2월</th>
                    <th colspan="4" class="month-header">3월</th>
                    <th colspan="5" class="month-header">4월</th>
                </tr>
                <tr>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th><th class="week-header">5W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th><th class="week-header">5W</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="bg-light-gray" style="text-align:center;">분석/설계</td><td colspan="22" class="bar-area"><div class="bar gray" style="left:5px; width:150px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#e2efda;">기획서</td><td colspan="22" class="bar-area"><div class="bar green" style="left:35px; width:120px;"></div><div class="bar light-green" style="left:155px; width:120px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#e2efda;">디자인</td><td colspan="22" class="bar-area"><div class="bar light-green" style="left:155px; width:100px;"></div><div class="bar green" style="left:255px; width:120px;"></div><div class="bar light-green" style="left:375px; width:30px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#e2efda;">퍼블리싱</td><td colspan="22" class="bar-area"><div class="bar light-green" style="left:215px; width:100px;"></div><div class="bar green" style="left:315px; width:120px;"></div><div class="bar light-green" style="left:435px; width:40px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#d9e1f2;">개발</td><td colspan="22" class="bar-area"><div class="bar blue" style="left:245px; width:360px;"></div><div class="label-text" style="left:550px; top: -15px; color:#2f5597;">개발 완료 : 4월 24일</div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#fff2cc;">테스트</td><td colspan="22" class="bar-area"><div class="bar yellow" style="left:580px; width:100px;"></div></td></tr>
            </tbody>
        </table>
        <div class="footer">
            <div class="logo-area"><div class="logo-symbol">LF</div><div class="logo-text">LF</div></div>
            <div class="page-num">3</div>
        </div>
    </div>
</body>
</html>`;

// 3. Plan Delivery Template
window.LF_TEMPLATES['template_plan_delivery.html'] = `<!DOCTYPE html>
<html lang="ko"><head>
    <meta charset="UTF-8">
    <title>배송예정일 설정 - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --v4-bg: #f3f4f6; --v4-panel: #ffffff; --v4-accent: #6366f1;
            --v4-text: #111827; --v4-border: #d1d5db;
            --header-dark: #374151; --header-blue: #1e3a8a; --header-red: #b91c1c;
        }
        body { margin:0; padding:0; background:#2d2d2d; font-family:'Inter','Noto Sans KR',sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; overflow:hidden; }
        .artboard { width:1440px; height:900px; background:#fff; position:relative; box-shadow:0 30px 60px rgba(0,0,0,0.4); overflow:hidden; }
        .lf-component { position:absolute; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); box-sizing:border-box; }
        .v4-editable-cell { outline:none; padding:4px; }
        .v4-shape-container { width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:700; }
        .v4-premium-table { width:100%; border-collapse:collapse; font-size:13px; table-layout:fixed; border:1.6px solid #475569 !important; }
        .v4-premium-table th,.v4-premium-table td { border:1.6px solid #cbd5e1 !important; padding:12px 6px; text-align:center; vertical-align:middle; line-height:1.4; }
        .v4-premium-table th { background:var(--header-dark); color:#fff; font-weight:800; }
        .h-blue { background:var(--header-blue) !important; }
        .table-scroll-wrap { overflow:visible; width:100%; }
    </style>
</head>
<body>
    <div class="artboard" id="canvas">
        <div class="lf-component" id="comp-title-shape" style="top:40px; left:40px; width:320px; height:56px;">
            <div class="v4-shape-container" style="background:#4b5563; color:#fff; font-size:18px;">
                <div class="v4-editable-cell" contenteditable="true">{{SCREEN_NAME}}</div>
            </div>
        </div>
        <div class="lf-component" id="comp-main-table" style="top:130px; left:40px; width:1360px; height:auto;">
            <div class="table-scroll-wrap">
                <table class="v4-premium-table">
                    <thead>
                        <tr>
                            <th style="width:180px;">YMD</th>
                            <th style="width:180px;">일자</th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D-Day</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+1</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+2</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+3</div></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="background:#f9fafb;">WRHS_GI_YN</td>
                            <td>안산 출고 여부</td>
                            <td><div class="v4-editable-cell" contenteditable="true">Y</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>`;

// 4. PC UI Template
window.LF_TEMPLATES['template_pc_ui.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>PC UI Chrome - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style>
        :root { --v4-primary: #6366f1; --v4-bg: #1e293b; --v4-text: #f8fafc; }
        body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .page { width: 1440px; height: 900px; position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center; }
        .chrome-browser { width: 1440px; height: 900px; background: #ffffff; display: flex; flex-direction: column; border: 1.6px solid rgba(0, 0, 0, 0.12) !important; position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none; }
        .chrome-header { background: #dee1e6; padding: 8px 8px 0 8px; display: flex; flex-direction: column; gap: 6px; border-bottom: 1.6px solid #cbcbd0 !important; pointer-events: auto; }
        .chrome-top-bar { display: flex; align-items: center; gap: 12px; }
        .chrome-dots { display: flex; gap: 8px; margin-left: 8px; }
        .chrome-dot { width: 12px; height: 12px; border-radius: 50%; }
        .chrome-dot.red { background: #ff5f56; }
        .chrome-dot.yellow { background: #ffbd2e; }
        .chrome-dot.green { background: #27c93f; }
        .chrome-tabs { display: flex; align-items: flex-end; margin-left: 16px; }
        .chrome-tab { background: #ffffff; border-radius: 8px 8px 0 0; padding: 6px 16px; font-size: 11px; font-weight: 600; color: #333; display: flex; align-items: center; gap: 8px; height: 28px; box-sizing: border-box; }
        .chrome-nav-bar { background: #ffffff; padding: 6px 12px; display: flex; align-items: center; gap: 12px; border-bottom: 1.6px solid #e5e7eb !important; pointer-events: auto; }
        .chrome-url-bar { flex: 1; background: #f1f3f4; border-radius: 14px; height: 28px; display: flex; align-items: center; padding: 0 12px; font-size: 12px; color: #5f6368; gap: 8px; }
        .chrome-content-area { flex: 1; background: #ffffff; position: relative; }
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
    </style>
</head>
<body>
    <div class="page" id="canvas">
        <div class="chrome-browser">
            <div class="chrome-header">
                <div class="chrome-top-bar">
                    <div class="chrome-dots"><div class="chrome-dot red"></div><div class="chrome-dot yellow"></div><div class="chrome-dot green"></div></div>
                    <div class="chrome-tabs">
                        <div class="chrome-tab"><span class="material-icons-outlined" style="font-size: 14px; color: #6366f1;">shopping_bag</span><span>LFmall | Premium Design</span></div>
                    </div>
                </div>
                <div class="chrome-nav-bar">
                    <span class="material-icons-outlined" style="font-size: 18px; color: #5f6368;">arrow_back</span>
                    <span class="material-icons-outlined" style="font-size: 18px; color: #5f6368;">arrow_forward</span>
                    <span class="material-icons-outlined" style="font-size: 18px; color: #5f6368;">refresh</span>
                    <div class="chrome-url-bar"><span class="material-icons-outlined" style="font-size: 14px; color: #10b981;">lock</span><span>https://www.lfmall.co.kr</span></div>
                </div>
            </div>
            <div class="chrome-content-area"></div>
        </div>
    </div>
</body>
</html>`;

// 5. Mobile UI 1 Template
window.LF_TEMPLATES['template_mobile_ui_1.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Mobile UI (1) - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --v4-primary: #6366f1; --v4-bg: #1e293b; --v4-frame-bg: #ffffff; }
        body { margin: 0; padding: 0; background: var(--v4-bg); font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .page { width: 1440px; height: 900px; position: relative; display: flex; justify-content: center; align-items: center; gap: 60px; }
        .mobile-frame { width: 375px; height: 838px; background: var(--v4-frame-bg); border-radius: 40px; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px #111; overflow: hidden; border: 4px solid #334155; }
        .mobile-header-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; background: #111; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; z-index: 1000; }
        .mobile-content { width: 360px; height: 800px; position: absolute; top: 30px; left: 7.5px; overflow-y: auto; box-sizing: border-box; }
        .mobile-statusbar { position: absolute; top: 10px; left: 24px; right: 24px; height: 20px; display: flex; align-items: center; justify-content: space-between; color: #111827; font-size: 12px; font-weight: 800; z-index: 1001; pointer-events: none; }
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
    </style>
</head>
<body>
    <div class="page">
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G 100%</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content"></div>
        </div>
    </div>
</body>
</html>`;

// 6. Mobile UI 2 Template
window.LF_TEMPLATES['template_mobile_ui_2.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Mobile UI (2) - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --v4-primary: #6366f1; --v4-bg: #1e293b; --v4-frame-bg: #ffffff; }
        body { margin: 0; padding: 0; background: var(--v4-bg); font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .page { width: 1440px; height: 900px; position: relative; display: flex; justify-content: center; align-items: center; gap: 80px; }
        .mobile-frame { width: 375px; height: 838px; background: var(--v4-frame-bg); border-radius: 40px; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px #111; overflow: hidden; border: 4px solid #334155; }
        .mobile-header-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; background: #111; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; z-index: 1000; }
        .mobile-content { width: 360px; height: 800px; position: absolute; top: 30px; left: 7.5px; overflow-y: auto; box-sizing: border-box; }
        .mobile-statusbar { position: absolute; top: 10px; left: 24px; right: 24px; height: 20px; display: flex; align-items: center; justify-content: space-between; color: #111827; font-size: 12px; font-weight: 800; z-index: 1001; pointer-events: none; }
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
    </style>
</head>
<body>
    <div class="page">
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G 100%</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content"></div>
        </div>
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G 100%</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content"></div>
        </div>
    </div>
</body>
</html>`;

// 7. Mobile UI 3 Template
window.LF_TEMPLATES['template_mobile_ui_3.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Mobile UI (3) - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --v4-primary: #6366f1; --v4-bg: #1e293b; --v4-frame-bg: #ffffff; }
        body { margin: 0; padding: 0; background: var(--v4-bg); font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .page { width: 1440px; height: 900px; position: relative; display: flex; justify-content: center; align-items: center; gap: 40px; }
        .mobile-frame { width: 375px; height: 838px; background: var(--v4-frame-bg); border-radius: 40px; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px #111; overflow: hidden; border: 4px solid #334155; }
        .mobile-header-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; background: #111; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; z-index: 1000; }
        .mobile-content { width: 360px; height: 800px; position: absolute; top: 30px; left: 7.5px; overflow-y: auto; box-sizing: border-box; }
        .mobile-statusbar { position: absolute; top: 10px; left: 24px; right: 24px; height: 20px; display: flex; align-items: center; justify-content: space-between; color: #111827; font-size: 12px; font-weight: 800; z-index: 1001; pointer-events: none; }
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
    </style>
</head>
<body>
    <div class="page">
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content"></div>
        </div>
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content"></div>
        </div>
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content"></div>
        </div>
    </div>
</body>
</html>`;

// 8. Admin Onesphere Template
window.LF_TEMPLATES['template_onesphere.html'] = `<!DOCTYPE html>
<html lang="ko"><head>
    <meta charset="UTF-8">
    <title>Admin Onesphere - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root { --v4-primary: #6366f1; --v4-bg: #1e293b; --v4-surface: #f8f9fa; --v4-text: #1a1c1e; }
        body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--v4-bg); overflow: hidden; color: var(--v4-text); }
        .page { width: 1440px; height: 900px; position: relative; background: #ffffff; box-shadow: 0 40px 100px rgba(0,0,0,0.05); overflow: hidden; }
        .lf-component { position: absolute; cursor: pointer; transition: outline 0.2s; box-sizing: border-box; z-index: 100; }
    </style>
</head>
<body>
    <div class="page" id="canvas"></div>
</body>
</html>`;

// 9. Blank Template
window.LF_TEMPLATES['template_blank.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Blank Screen</title>
    <style>
        body { margin: 0; padding: 0; background: #1e293b; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .artboard { width: 1440px; height: 900px; position: relative; background: #ffffff; box-shadow: 0 30px 60px rgba(0,0,0,0.4); overflow: hidden; }
        .lf-component { position: absolute; cursor: pointer; transition: outline 0.2s; box-sizing: border-box; z-index: 100; }
    </style>
</head>
<body>
    <div class="artboard" id="canvas"></div>
</body>
</html>`;

// Alias key mappings for instant synchronous resolution across all template options
window.LF_TEMPLATES['cover'] = window.LF_TEMPLATES['template_cover.html'];
window.LF_TEMPLATES['plan'] = window.LF_TEMPLATES['template_plan.html'];
window.LF_TEMPLATES['plan_delivery'] = window.LF_TEMPLATES['template_plan_delivery.html'];
window.LF_TEMPLATES['pc_ui'] = window.LF_TEMPLATES['template_pc_ui.html'];
window.LF_TEMPLATES['ui'] = window.LF_TEMPLATES['template_pc_ui.html'];
window.LF_TEMPLATES['front_ui'] = window.LF_TEMPLATES['template_pc_ui.html'];
window.LF_TEMPLATES['mobile_ui_1'] = window.LF_TEMPLATES['template_mobile_ui_1.html'];
window.LF_TEMPLATES['mobile_ui_2'] = window.LF_TEMPLATES['template_mobile_ui_2.html'];
window.LF_TEMPLATES['mobile_ui_3'] = window.LF_TEMPLATES['template_mobile_ui_3.html'];
window.LF_TEMPLATES['mobile_ui'] = window.LF_TEMPLATES['template_mobile_ui_1.html'];
window.LF_TEMPLATES['onesphere'] = window.LF_TEMPLATES['template_onesphere.html'];
window.LF_TEMPLATES['admin_onesphere'] = window.LF_TEMPLATES['template_onesphere.html'];
window.LF_TEMPLATES['blank'] = window.LF_TEMPLATES['template_blank.html'];
