/**
 * LF Editor - Unified Project PDF Exporter Module (v3 - High Fidelity True-to-Editor Renderer)
 * Handles batch rendering of all screens within a project into a single PDF file (1440x900 Landscape).
 */

// Global UI Overlay Helpers for PDF Exporting
function showPdfProgressModal(projectName) {
    let modal = document.getElementById('pdf-export-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pdf-export-modal';
        modal.className = 'pdf-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        modal.innerHTML = `
            <div style="background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; width: 420px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; color: #f8fafc; font-family: 'Inter', sans-serif;">
                <div style="display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 50%; margin: 0 auto 16px;">
                    <span class="material-icons-outlined" style="font-size: 28px; color: #818cf8; animation: spinPdfIcon 2s linear infinite;">picture_as_pdf</span>
                </div>
                <h3 id="pdf-modal-title" style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #ffffff;">PDF 문서 생성 중</h3>
                <p id="pdf-modal-subtitle" style="margin: 0 0 20px; font-size: 13px; color: #94a3b8; line-height: 1.5;">프로젝트의 모든 스크린을 고화질로 결합하고 있습니다.</p>
                
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
                    <div id="pdf-modal-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 4px; transition: width 0.2s ease;"></div>
                </div>
                <div id="pdf-modal-status" style="font-size: 12px; color: #cbd5e1; font-weight: 500;">준비 중...</div>
            </div>
            <style>
                @keyframes spinPdfIcon {
                    0% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.1) rotate(180deg); }
                    100% { transform: scale(1) rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById('pdf-modal-title').innerText = `[${projectName}] PDF 생성`;
    document.getElementById('pdf-modal-progress-bar').style.width = '0%';
    document.getElementById('pdf-modal-status').innerText = '프로젝트 정보 확인 중...';
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
}

function updatePdfProgress(percent, statusText) {
    const bar = document.getElementById('pdf-modal-progress-bar');
    const status = document.getElementById('pdf-modal-status');
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (status) status.innerText = statusText;
}

function hidePdfProgressModal() {
    const modal = document.getElementById('pdf-export-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

// Fetch project metadata fallback handler
async function fetchProjectMetadataForPdf(projectName) {
    // 1. Try system API (GitHub API / Cache) to bypass local file:// CORS block
    if (typeof window.fetchProjectMetadata === 'function') {
        try {
            const meta = await window.fetchProjectMetadata(projectName);
            if (meta && meta.screens) return meta;
        } catch (e) {
            console.warn("[PDF Exporter] fetchProjectMetadata API failed, fallback to fetch:", e);
        }
    }

    // 2. Direct HTTP Fetch Fallback
    try {
        const url = `data/${encodeURIComponent(projectName)}/metadata.json?t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("[PDF Exporter] Metadata fetch error:", e);
    }
    return { title: projectName, screens: {} };
}

// Fetch screen HTML content
async function fetchScreenHtmlForPdf(projectName, screenFileName) {
    // 1. Try system API (GitHub API / Cache) to bypass local file:// CORS block
    if (typeof window.fetchProjectFileContent === 'function') {
        try {
            const content = await window.fetchProjectFileContent(projectName, screenFileName);
            if (content && content !== "__NOT_FOUND__") {
                return content;
            }
        } catch (e) {
            console.warn(`[PDF Exporter] fetchProjectFileContent failed for ${screenFileName}:`, e);
        }
    }

    // 2. Direct HTTP Fetch Fallback
    try {
        const url = `data/${encodeURIComponent(projectName)}/${encodeURIComponent(screenFileName)}?t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) {
            return await res.text();
        }
    } catch (e) {
        console.warn(`[PDF Exporter] Failed to fetch screen HTML via fetch: ${screenFileName}`, e);
    }

    // 3. Fallback for file:// protocol using dynamic hidden iframe loading
    try {
        const html = await new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:fixed; left:0; top:0; width:1px; height:1px; opacity:0.001; pointer-events:none; z-index:1;';
            const screenUrl = `data/${encodeURIComponent(projectName)}/${encodeURIComponent(screenFileName)}`;
            let resolved = false;

            iframe.onload = () => {
                if (resolved) return;
                resolved = true;
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    const docHtml = doc.documentElement.outerHTML;
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                    resolve(docHtml);
                } catch (err) {
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                    resolve(null);
                }
            };
            iframe.onerror = () => {
                if (resolved) return;
                resolved = true;
                if (document.body.contains(iframe)) document.body.removeChild(iframe);
                resolve(null);
            };

            document.body.appendChild(iframe);
            iframe.src = screenUrl;

            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                    resolve(null);
                }
            }, 3000);
        });
        if (html) return html;
    } catch (e) {
        console.warn(`[PDF Exporter] Hidden iframe fallback failed: ${screenFileName}`, e);
    }

    return null;
}

/**
 * Compiles raw screen HTML by preserving original layout and injecting necessary fonts and cleanup rules
 */
function compileScreenHtmlForPdf(rawHtml) {
    if (!rawHtml) return '';
    let compiled = rawHtml;

    // 1. Ensure v4Styles are injected/updated
    const styleBlock = '<style id="v4-inlined-style">\n' + (window.v4Styles || '') + '\n</style>';
    if (compiled.includes('id="v4-inlined-style"')) {
        compiled = compiled.replace(/<style id="v4-inlined-style">[\s\S]*?<\/style>/i, styleBlock);
    } else if (compiled.includes('</head>')) {
        compiled = compiled.replace('</head>', styleBlock + '\n</head>');
    } else {
        compiled = `<head>${styleBlock}</head>\n` + compiled;
    }

    // 2. Inject standard fonts & PDF export clean-up overrides
    const pdfCleanOverride = `
    <!-- PDF Exporter Base Fonts & Non-Destructive Clean Overrides -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style id="pdf-export-clean-overrides">
        /* Hide selection boxes, drag handles, resizers, inspector tools during PDF export */
        .selection-box, .resize-handle, .lf-delete-trigger, .lf-drag-handle, .lf-resizer,
        #floating-inspector-card, .smart-guide-line, .lf-connector-port, .guide-layer,
        .selection-rect, .selection-overlay, .cell-resizer, #guide-layer, .pins-layer {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }
        /* Disable transitions and animations for crisp and immediate capture */
        *, *::before, *::after {
            transition: none !important;
            animation-duration: 0s !important;
        }
        /* Hide scrollbars */
        ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }
        /* Fix html2canvas inset box-shadow rendering bug on mobile frames */
        .mobile-frame {
            background: #ffffff !important;
            background-color: #ffffff !important;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4) !important;
            outline: 8px solid #111111 !important;
            outline-offset: -8px !important;
        }
        .mobile-content {
            background: transparent !important;
        }
        /* Ensure 1440x900 viewport bounding without breaking internal layout flow */
        html, body {
            width: 1440px !important;
            height: 900px !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    </style>
    `;

    if (compiled.includes('</head>')) {
        compiled = compiled.replace('</head>', pdfCleanOverride + '\n</head>');
    } else {
        compiled = `<head>${pdfCleanOverride}</head>\n` + compiled;
    }

    return compiled;
}

/**
 * Main PDF Export Function (High Fidelity True-to-Editor Renderer)
 * Batch renders all screens in the given project into a 1440x900 Landscape PDF document.
 */
async function exportProjectToPDF(projectName, projectMeta = null) {
    if (!projectName) {
        alert("프로젝트명이 지정되지 않았습니다.");
        return;
    }

    // Verify CDN dependencies
    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
        alert("PDF 생성 라이브러리가 로드되지 않았습니다. 페이지를 새로고침 후 다시 시도해 주세요.");
        return;
    }

    showPdfProgressModal(projectName);

    try {
        let meta = projectMeta;
        if (!meta || !meta.screens || Object.keys(meta.screens).length === 0) {
            updatePdfProgress(5, "프로젝트 상세 정보를 확인하는 중...");
            meta = await fetchProjectMetadataForPdf(projectName);
        }

        const screensObj = meta.screens || meta.files || {};
        const screenFiles = Object.keys(screensObj);

        if (screenFiles.length === 0) {
            hidePdfProgressModal();
            alert("해당 프로젝트에 포함된 스크린이 없습니다.");
            return;
        }

        const projectTitle = meta.title || projectName;
        updatePdfProgress(10, `프로젝트 (${screenFiles.length}개 스크린) 변환을 시작합니다...`);

        const { jsPDF } = window.jspdf;
        // Standard 1440x900 aspect ratio landscape PDF
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1440, 900],
            compress: true
        });

        let processedCount = 0;

        for (let i = 0; i < screenFiles.length; i++) {
            const screenFileName = screenFiles[i];
            const screenInfo = screensObj[screenFileName] || {};
            const screenTitle = screenInfo.title || screenFileName.replace('.html', '');

            const percent = Math.round(10 + ((i + 1) / screenFiles.length) * 85);
            updatePdfProgress(percent, `스크린 렌더링 중... (${i + 1}/${screenFiles.length}: ${screenTitle})`);

            const rawHtml = await fetchScreenHtmlForPdf(projectName, screenFileName);
            if (!rawHtml) {
                console.warn(`[PDF Exporter] Skipping screen (content empty): ${screenFileName}`);
                continue;
            }

            const compiledHtml = compileScreenHtmlForPdf(rawHtml);

            // Create in-viewport hidden iframe to ensure GPU layout and font engines execute completely
            const iframe = document.createElement('iframe');
            iframe.style.cssText = `
                position: fixed;
                left: 0;
                top: 0;
                width: 1440px;
                height: 900px;
                border: none;
                margin: 0;
                padding: 0;
                overflow: hidden;
                z-index: 1;
                opacity: 0.001;
                pointer-events: none;
            `;
            document.body.appendChild(iframe);

            // Wait for iframe content & CSS to load
            await new Promise((resolve) => {
                iframe.onload = () => {
                    setTimeout(resolve, 100);
                };
                iframe.srcdoc = compiledHtml;
            });

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const targetEl = iframeDoc.documentElement || iframeDoc.body;

            // 1. Wait for web fonts (Inter, Pretendard, Noto Sans KR, Material Icons) to finish loading
            try {
                if (iframeDoc.fonts && typeof iframeDoc.fonts.ready?.then === 'function') {
                    await Promise.race([
                        iframeDoc.fonts.ready,
                        new Promise(r => setTimeout(r, 2000))
                    ]);
                }
            } catch (fontErr) {
                console.warn("[PDF Exporter] Font ready wait warning:", fontErr);
            }

            // 2. Ensure all images inside iframe are completely loaded and decoded
            const imgs = Array.from(iframeDoc.querySelectorAll('img'));
            if (imgs.length > 0) {
                await Promise.all(imgs.map(img => {
                    if (img.complete) {
                        return (typeof img.decode === 'function') ? img.decode().catch(() => {}) : Promise.resolve();
                    }
                    return new Promise(r => {
                        img.onload = () => {
                            if (typeof img.decode === 'function') img.decode().catch(() => {}).then(r);
                            else r();
                        };
                        img.onerror = r;
                        setTimeout(r, 2000);
                    });
                }));
            }

            // 3. Wait for layout settling and final paint tick
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            await new Promise(r => setTimeout(r, 200));

            // Detect accurate background color from source document
            const computedBodyBg = iframeDoc.defaultView?.getComputedStyle(iframeDoc.body)?.backgroundColor;
            const computedHtmlBg = iframeDoc.defaultView?.getComputedStyle(iframeDoc.documentElement)?.backgroundColor;
            let targetBg = null;
            if (computedBodyBg && computedBodyBg !== 'rgba(0, 0, 0, 0)' && computedBodyBg !== 'transparent') {
                targetBg = computedBodyBg;
            } else if (computedHtmlBg && computedHtmlBg !== 'rgba(0, 0, 0, 0)' && computedHtmlBg !== 'transparent') {
                targetBg = computedHtmlBg;
            }

            // Convert iframe content to canvas using html2canvas
            const canvas = await html2canvas(targetEl, {
                scale: 2, // High resolution (2880x1800)
                useCORS: true,
                allowTaint: true,
                backgroundColor: targetBg,
                logging: false,
                width: 1440,
                height: 900,
                windowWidth: 1440,
                windowHeight: 900,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            if (processedCount > 0) {
                pdf.addPage([1440, 900], 'landscape');
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, 1440, 900);
            processedCount++;

            // Clean up temporary iframe
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }

        if (processedCount === 0) {
            hidePdfProgressModal();
            alert("스크린 렌더링에 실패하였습니다.");
            return;
        }

        updatePdfProgress(98, "PDF 저장 중...");

        const cleanName = projectTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
        const outputFilename = `${cleanName}_Screens.pdf`;

        pdf.save(outputFilename);

        setTimeout(() => {
            hidePdfProgressModal();
        }, 600);

    } catch (err) {
        console.error("[PDF Exporter] Error during PDF generation:", err);
        hidePdfProgressModal();
        alert("PDF 생성 도중 오류가 발생했습니다: " + err.message);
    }
}
