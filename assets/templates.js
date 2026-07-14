/**
 * LFmall Design Studio - Embedded Templates
 * This file contains the HTML structure of the templates to ensure 
 * they can be loaded reliably without fetch() restrictions.
 * (Now optimized to act as a lightweight local fallback configuration)
 */

window.LF_TEMPLATES = {
    // Large templates are extracted to assets/templates/ for dynamic fetching.
    // Minimally keeping blank configuration mapping for backward compatibility.
    'template_blank.html': `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Blank Screen</title>
    <style>
        body { margin: 0; padding: 0; background: #f8f9fa; }
        .page { width: 1440px; height: 900px; position: relative; background: #ffffff; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    </style>
</head>
<body>
    <div class="page"></div>
</body>
</html>`
};
