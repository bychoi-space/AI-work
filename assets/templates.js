/**
 * LFmall Design Studio - Embedded Templates
 * This file contains the HTML structure of the templates to ensure 
 * they can be loaded reliably without fetch() restrictions.
 */

window.LF_TEMPLATES = {
    // 1. Cover Template (V4 Premium Edition - Refined)
    'template_cover.html': `<!DOCTYPE html>
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
            --v4-text-main: #1a1c1e; /* Ensure dark text on light background */
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
            background: var(--v4-bg);
            box-shadow: 0 40px 100px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        
        /* V4 Component Base Styles */
        .lf-component { position: absolute !important; box-sizing: border-box !important; transition: outline 0.1s; }
        .lf-component:hover { outline: 2px solid var(--v4-accent) !important; cursor: move !important; }
        .lf-component.selected { outline: 2px solid var(--v4-accent) !important; z-index: 9999 !important; }
        
        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: var(--v4-accent); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; z-index: 100; opacity: 0; transition: opacity 0.2s; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; }
        
        .v4-card {
            background: #fff;
            border: 1px solid var(--v4-border);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .logo-area { display: flex; align-items: center; gap: 14px; }
        .logo-img { height: 32px; width: auto; object-fit: contain; }
        .logo-text { font-size: 20px; font-weight: 800; color: var(--v4-text); letter-spacing: -0.5px; }
        .logo-sub { font-size: 14px; font-weight: 500; color: var(--v4-text-sub); margin-left: 4px; }

        .v4-editable-cell { outline: none; transition: background 0.2s; }
        .v4-editable-cell:focus { background: #f0f1f2; border-radius: 4px; }

        /* V4 Table Styling - Modern & Clean */
        .v4-premium-table { width: 100%; border-collapse: collapse; color: var(--v4-text); font-size: 15px; }
        .v4-premium-table th { background: #f4f6f8; text-align: left; padding: 14px 24px; border-bottom: 2px solid var(--v4-border); color: var(--v4-text-sub); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .v4-premium-table td { padding: 18px 24px; border-bottom: 1px solid var(--v4-border); background: #fff; line-height: 1.5; color: #1a1c1e !important; }
        .v4-premium-table tr:last-child td { border-bottom: none; }
        
        .accent-bar { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: var(--v4-accent); }
        
        /* FIXED: Ensure Information Entity table is always visible and clear */
        #cover-info-table {
            visibility: visible !important;
            opacity: 1 !important;
        }
        #cover-info-table td, #cover-info-table th {
            visibility: visible !important;
            opacity: 1 !important;
        }
        /* HIGH SPECIFICITY COLOR FIX */
        .v4-premium-table td.v4-editable-cell {
            color: #1a1c1e !important;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="accent-bar"></div>

        <!-- Static Header (Non-editable branding) -->
        <div style="position: absolute; top: 60px; left: 80px;">
            <div class="logo-area">
                <img src="https://img.lfmall.co.kr/file/WAS/apps/2024/mfront/logo/lf_logo_mo.png" class="logo-img" alt="LF Logo">
                <div style="width: 1px; height: 24px; background: #ddd; margin: 0 4px;"></div>
                <div class="logo-text">LF <span class="logo-sub">Project Management System</span></div>
            </div>
        </div>

        <!-- Editable Main Title - Balanced Typography -->
        <div id="cover-title" class="lf-component" style="top: 220px; left: 80px; min-width: 800px;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div contenteditable="true" class="v4-editable-cell" style="font-size: 72px; font-weight: 900; line-height: 1.15; letter-spacing: -2px; color: var(--v4-text); margin-bottom: 16px;">{{PROJECT_NAME}}</div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 40px; height: 3px; background: var(--v4-accent);"></div>
                <div contenteditable="true" class="v4-editable-cell" style="font-size: 20px; color: var(--v4-text-sub); font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Technical Design Specification</div>
            </div>
        </div>

        <!-- Editable Version Info - Clean Badges -->
        <div id="cover-version" class="lf-component" style="top: 500px; left: 80px;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div style="display: flex; align-items: center; gap: 24px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 11px; font-weight: 800; color: var(--v4-text-sub);">DOCUMENT VERSION</span>
                    <div contenteditable="true" class="v4-editable-cell" style="font-size: 22px; font-weight: 800; color: var(--v4-accent);">v{{VERSION}}</div>
                </div>
                <div style="width: 1px; height: 40px; background: var(--v4-border);"></div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 11px; font-weight: 800; color: var(--v4-text-sub);">JIRA IDENTIFIER</span>
                    <div contenteditable="true" class="v4-editable-cell" style="font-size: 22px; font-weight: 800; color: var(--v4-text);">{{JIRA}}</div>
                </div>
            </div>
        </div>

        <!-- Editable Project Info Table - High Legibility -->
        <div id="cover-info-table" class="lf-component v4-card" style="bottom: 80px; right: 80px; width: 540px; padding: 0; overflow: hidden;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <table class="v4-premium-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Information Entity</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight: 600; color: var(--v4-text-sub);">Lead Designer / Author</td>
                        <td contenteditable="true" class="v4-editable-cell" style="font-weight: 700; color: #1a1c1e !important;">{{AUTHOR}}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: var(--v4-text-sub);">Publication Date</td>
                        <td contenteditable="true" class="v4-editable-cell" style="font-weight: 700; color: #1a1c1e !important;">{{DATE}}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: var(--v4-text-sub);">System Context</td>
                        <td contenteditable="true" class="v4-editable-cell" style="color: #1a1c1e !important;">LF E-commerce Platform</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Subtle Abstract Decoration (Modern Gray) -->
        <div style="position: absolute; bottom: -50px; left: -50px; width: 300px; height: 300px; background: #eee; border-radius: 50%; opacity: 0.5;"></div>
    </div>
</body>
</html>`,

    // 2. Architecture Template
    'template_architecture.html': `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Architecture - {{PROJECT_NAME}}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Malgun Gothic', sans-serif; background: #333; }
        .page { width: 1440px; height: 900px; background: #fff; margin: 0 auto; position: relative; padding: 20px; box-sizing: border-box; box-shadow: 0 0 50px rgba(0,0,0,0.5); }
        .header-bar { height: 40px; background: #3c3c3c; color: #fff; display: flex; align-items: center; padding: 0 20px; font-size: 14px; position: absolute; top:0; left:0; right:0; }
        .screen-title-overlay { position: absolute; top: 60px; left: 40px; background: #4b4b4b; color: #fff; padding: 12px 60px; border-radius: 8px; font-size: 16px; font-weight: bold; border: 1px solid #999; }
        .footer { position: absolute; bottom: 0; left:0; right:0; height: 40px; border-top: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; }
        .logo-area { display: flex; align-items: center; gap: 8px; }
        .logo-symbol { width: 20px; height: 20px; background: #e60012; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); color: #fff; font-size: 10px; display: flex; align-items: center; justify-content: center; }
        .logo-text { font-weight: 900; font-size: 16px; color: #1a1a1a; }
        .page-num { position: absolute; left: 50%; transform: translateX(-50%); font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header-bar">Architecture</div>
        <div class="screen-title-overlay">{{SCREEN_NAME}} 명세</div>
        
        <!-- Content Area -->
        <div style="margin-top: 100px; font-style: italic; color: #ccc; text-align: center; border: 1px dashed #eee; height: 600px; display: flex; align-items: center; justify-content: center;">
            상세 아키텍처 다이어그램을 여기에 배치하세요.
        </div>

        <div class="footer">
            <div class="logo-area"><div class="logo-symbol">LF</div><div class="logo-text">LF</div></div>
            <div class="page-num">1</div>
        </div>
    </div>
</body>
</html>`,

    // 3. Plan (Gantt) Template
    'template_plan.html': `<!DOCTYPE html>
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
</html>`,

    // 4. Front UI Template
    'template_front_ui.html': `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Front UI - {{PROJECT_NAME}}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Malgun Gothic', sans-serif; background: #fafafa; }
        .meta-table { width: 100%; border-collapse: collapse; background: #fff; font-size: 12px; margin-bottom: 20px; border: 1px solid #999; }
        .meta-table th, .meta-table td { border: 1px solid #999; height: 28px; padding: 0 10px; }
        .meta-table th { background: #e1e1e1; color: #333; font-weight: normal; width: 100px; text-align: center; }
        .meta-table .value { width: calc(25% - 100px); color: #000; }
        .meta-table .highlight { color: #e60012; font-weight: bold; }
        
        .main-frame { width: 375px; height: 812px; background: #fff; margin: 40px auto; border: 1px solid #ccc; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .app-header { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #eee; }
        .material-icons-outlined { font-size: 20px; }
        .bottom-fixed { position: absolute; bottom: 0; left: 0; right: 0; height: 60px; border-top: 1px solid #eee; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #888; }
        
        .footer { position: fixed; bottom: 0; left:0; right:0; height: 40px; background: #fff; border-top: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; }
        .logo-area { display: flex; align-items: center; gap: 8px; }
        .logo-symbol { width: 20px; height: 20px; background: #e60012; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); color: #fff; font-size: 10px; display: flex; align-items: center; justify-content: center; }
        .logo-text { font-weight: 900; font-size: 16px; color: #1a1a1a; }
    </style>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
</head>
<body>
    <table class="meta-table">
        <tr>
            <th>화면 구분</th><td class="value">Front-End</td>
            <th>화면 명칭</th><td class="value highlight">{{SCREEN_NAME}}</td>
            <th>작성자</th><td class="value">{{AUTHOR}}</td>
            <th>작성 일자</th><td class="value">{{DATE}}</td>
        </tr>
        <tr>
            <th>화면 코드</th><td class="value">-</td>
            <th>화면 경로</th><td class="value" style="color:#e60012">{{SCREEN_PATH}}</td>
            <th>문서 버전</th><td class="value">v{{VERSION}}</td>
            <th>기타</th><td class="value">JIRA: {{JIRA}}</td>
        </tr>
    </table>

    <div class="main-frame">
        <div class="app-header">
            <span class="material-icons-outlined">chevron_left</span>
            <span style="font-size: 15px; font-weight: bold;">{{SCREEN_NAME}}</span>
            <div style="display:flex; gap:12px;">
                <span class="material-icons-outlined">search</span>
                <span class="material-icons-outlined">home</span>
                <span class="material-icons-outlined">shopping_bag</span>
            </div>
        </div>
        <div style="height: 600px; display: flex; align-items: center; justify-content: center; color: #ccc; font-style: italic;">
            UI WIREFRAME AREA
        </div>
        <div class="bottom-fixed">하단 고정 영역</div>
    </div>

    <div class="footer">
        <div class="logo-area"><div class="logo-symbol">LF</div><div class="logo-text">LF</div></div>
        <div class="page-num">4</div>
    </div>
</body>
</html>`,

    // 5. Admin (NBOS) Template
    'template_nbos.html': `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Admin NBOS - {{PROJECT_NAME}}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Malgun Gothic', sans-serif; background: #fff; }
        .meta-table { width: 100%; border-collapse: collapse; background: #f9f9f9; font-size: 11px; border: 1px solid #aaa; }
        .meta-table th, .meta-table td { border: 1px solid #aaa; height: 24px; padding: 0 8px; }
        .meta-table th { background: #e8e8e8; width: 80px; text-align: center; }
        .meta-table .value { width: calc(25% - 80px); }

        .admin-header { background: #333; height: 32px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; color: #fff; font-size: 11px; }
        .nbos-logo { display:flex; align-items:center; gap:5px; font-weight:900; }
        .nbos-logo span { color:#e60012; }
        
        .admin-nav { background: #555; height: 32px; display: flex; align-items: center; border-bottom: 2px solid #e60012; }
        .nav-item { padding: 0 20px; color: #fff; font-size: 12px; height: 32px; line-height: 32px; cursor: pointer; }
        .nav-item.active { background: #e60012; font-weight: bold; }

        .admin-layout { display: flex; height: calc(100vh - 150px); }
        .admin-sidebar { width: 180px; background: #f2f2f2; border-right: 1px solid #ccc; font-size: 11px; padding: 10px; }
        .menu-group { margin-bottom: 10px; }
        .menu-item { padding: 4px 10px; cursor: pointer; color: #444; }
        .menu-item.active { color: #e60012; font-weight: bold; background: #fff; border: 1px solid #ccc; }

        .admin-content { flex: 1; padding: 15px; }
        .content-title { font-size: 14px; font-weight: bold; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ccc; display: flex; justify-content: space-between; }
        
        .filter-form { border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
        .filter-row { display: flex; border-bottom: 1px solid #eee; }
        .filter-row:last-child { border-bottom: none; }
        .filter-label { width: 120px; background: #f8f8f8; padding: 8px 15px; font-size: 11px; border-right: 1px solid #eee; }
        .filter-value { flex: 1; padding: 6px 10px; display: flex; align-items: center; gap: 8px; }
        .filter-input { height: 22px; border: 1px solid #ccc; padding: 0 5px; font-size: 11px; flex: 1; max-width: 200px; }
        
        .btn-search { background: #333; color: #fff; border: none; padding: 5px 25px; border-radius: 3px; font-size: 12px; cursor: pointer; margin: 10px auto; display: block; }
        .grid-header { font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #666; }
        .data-grid { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #ccc; }
        .data-grid th { background: #f0f0f0; border: 1px solid #ccc; padding: 6px; }
        .data-grid td { border: 1px solid #eee; padding: 6px; text-align: center; }
    </style>
</head>
<body>
    <table class="meta-table">
        <tr>
            <th>화면 구분</th><td class="value">nBOS</td>
            <th>화면 명칭</th><td class="value">{{SCREEN_NAME}}</td>
            <th>작성자</th><td class="value">{{AUTHOR}}</td>
            <th>작성 일자</th><td class="value">{{DATE}}</td>
        </tr>
        <tr>
            <th>화면 코드</th><td class="value">-</td>
            <th>화면 경로</th><td class="value">{{SCREEN_PATH}}</td>
            <th>문서 버전</th><td class="value">v{{VERSION}}</td>
            <th>기타</th><td class="value">JIRA: {{JIRA}}</td>
        </tr>
    </table>

    <div class="admin-header">
        <div class="nbos-logo"><span>l.i:</span>mall Back Office System</div>
        <div>홍길동 관리자 (administrator) | 🔒 [로그아웃]</div>
    </div>
    <div class="admin-nav">
        <div class="nav-item">홈</div>
        <div class="nav-item active">상품</div>
        <div class="nav-item">주문/배송</div>
        <div class="nav-item">회원/프로모션</div>
        <div class="nav-item">영업</div>
    </div>

    <div class="admin-layout">
        <div class="admin-sidebar">
            <div class="menu-group">
                <div style="font-weight:bold; margin-bottom:5px;">■ 상품관리</div>
                <div class="menu-item active">단품관리</div>
                <div class="menu-item">세트상품관리</div>
                <div class="menu-item">상품그룹관리</div>
            </div>
        </div>
        <div class="admin-content">
            <div class="content-title">단품관리 <span>🏠 > 상품관리 > 단품관리</span></div>
            <div class="filter-form">
                <div class="filter-row">
                    <div class="filter-label">온라인상품코드</div><div class="filter-value"><input class="filter-input" type="text"></div>
                    <div class="filter-label">상품명</div><div class="filter-value"><input class="filter-input" type="text" style="max-width:none"></div>
                </div>
                <div class="filter-row">
                    <div class="filter-label">상품구분</div><div class="filter-value"><select class="filter-input"><option>[전체]</option></select></div>
                    <div class="filter-label">브랜드</div><div class="filter-value"><input class="filter-input" type="text"> 🔍</div>
                </div>
            </div>
            <button class="btn-search">조회</button>
            
            <div class="grid-header">상품목록 (총 1,234건)</div>
            <table class="data-grid">
                <thead>
                    <tr><th>번호</th><th>상품코드</th><th>상품명</th><th>판매가</th><th>상태</th><th>등록일</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>PRD0001</td><td>LF몰 전용 패키지 A</td><td>99,000</td><td>판매중</td><td>2024-04-20</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`,

    // 6. Admin (Onesphere) Template - Modern Version
    'template_onesphere.html': `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Admin Onesphere - {{PROJECT_NAME}}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Malgun Gothic', '-apple-system', sans-serif; background: #f4f6f8; color: #202223; }
        .meta-table { width: 100%; border-collapse: collapse; background: #fff; font-size: 12px; border-bottom: 2px solid #6366f1; }
        .meta-table th, .meta-table td { border: 1px solid #e1e3e5; height: 32px; padding: 0 12px; }
        .meta-table th { background: #f6f6f7; color: #6d7175; width: 100px; text-align: left; }
        
        .modern-layout { display: flex; min-height: calc(100vh - 100px); }
        .modern-sidebar { width: 240px; background: #1c2536; color: #eee; padding: 20px 0; }
        .sidebar-item { padding: 12px 24px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s; }
        .sidebar-item:hover { background: rgba(255,255,255,0.08); }
        .sidebar-item.active { background: #6366f1; color: #fff; }
        
        .modern-main { flex: 1; padding: 32px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-size: 24px; font-weight: bold; }
        
        .card { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 24px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; }
        .stat-card { padding: 20px; border-radius: 8px; border: 1px solid #e1e3e5; background: #fff; }
        .stat-label { font-size: 13px; color: #6d7175; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: bold; color: #6366f1; }
        
        .table-modern { width: 100%; border-collapse: collapse; }
        .table-modern th { text-align: left; padding: 12px; border-bottom: 2px solid #f4f6f8; color: #6d7175; font-size: 13px; }
        .table-modern td { padding: 16px 12px; border-bottom: 1px solid #f4f6f8; font-size: 14px; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .badge-success { background: #e3f9e5; color: #007f5f; }
    </style>
</head>
<body>
    <table class="meta-table">
        <tr>
            <th>화면 구분</th><td class="value">OneSphere (Cloud)</td>
            <th>화면 명칭</th><td class="value">{{SCREEN_NAME}}</td>
            <th>작성자</th><td class="value">{{AUTHOR}}</td>
            <th>작성 일자</th><td class="value">{{DATE}}</td>
        </tr>
        <tr>
            <th>화면 코드</th><td class="value">OS-PRD-01</td>
            <th>화면 경로</th><td class="value" style="color:#6366f1">{{SCREEN_PATH}}</td>
            <th>문서 버전</th><td class="value">v{{VERSION}}</td>
            <th>기타</th><td class="value">JIRA: {{JIRA}}</td>
        </tr>
    </table>

    <div class="modern-layout">
        <aside class="modern-sidebar">
            <div class="sidebar-item active">Dashboard</div>
            <div class="sidebar-item">Products Management</div>
            <div class="sidebar-item">Orders Status</div>
            <div class="sidebar-item">Inventory Tracking</div>
            <div class="sidebar-item">Cloud Metrics</div>
        </aside>
        
        <main class="modern-main">
            <div class="page-header">
                <h1 class="page-title">{{SCREEN_NAME}} Overview</h1>
                <button style="background:#6366f1; color:#fff; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">Update Status</button>
            </div>

            <div class="stats-grid">
                <div class="stat-card"><div class="stat-label">Total Screens</div><div class="stat-value">48</div></div>
                <div class="stat-card"><div class="stat-label">Updated Today</div><div class="stat-value">12</div></div>
                <div class="stat-card"><div class="stat-label">System Health</div><div class="stat-value">99%</div></div>
                <div class="stat-card"><div class="stat-label">Sync Status</div><div class="stat-value">LIVE</div></div>
            </div>

            <div class="card">
                <h3 style="margin-top:0;">Recent Updates</h3>
                <table class="table-modern">
                    <thead><tr><th>Version</th><th>Description</th><th>Status</th><th>Updated By</th></tr></thead>
                    <tbody>
                        <tr><td>v2.1</td><td>Implementation of new global save button</td><td><span class="badge badge-success">Done</span></td><td>최범열</td></tr>
                        <tr><td>v2.0</td><td>Advanced template system expansion</td><td><span class="badge badge-success">Active</span></td><td>LF AI Agent</td></tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</body>
</html>`
};
