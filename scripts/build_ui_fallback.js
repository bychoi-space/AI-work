const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const UI_LIB_DIR = path.join(ROOT_DIR, 'assets', 'ui_library');
const OUTPUT_FILE = path.join(ROOT_DIR, 'assets', 'ui_library_fallback.js');

const filesToCompile = [
    { name: 'atomic_cards.html', variable: 'window.VCTRL_UI_FALLBACK_ATOMIC' },
    { name: 'icon_cards.html', variable: 'window.VCTRL_UI_FALLBACK_ICON' },
    { name: 'inspector_panels.html', variable: 'window.VCTRL_UI_FALLBACK_INSPECTOR' },
    { name: 'modals.html', variable: 'window.VCTRL_UI_FALLBACK_MODALS' }
];

console.log("[BUILD UI FALLBACK] Starting build...");

let outputContent = `/**
 * ui_library_fallback.js
 * Fallback data for offline file:// protocol execution.
 * Auto-generated.
 */

`;

try {
    filesToCompile.forEach(fileSpec => {
        const filePath = path.join(UI_LIB_DIR, fileSpec.name);
        if (!fs.existsSync(filePath)) {
            console.error(`[BUILD UI FALLBACK] Error: Source file not found at ${filePath}`);
            process.exit(1);
        }

        const rawContent = fs.readFileSync(filePath, 'utf8');
        
        // Escape backticks and backslashes to prevent syntax errors inside JS template literals
        // Replace backslashes first, then backticks, and escape dollar signs if they form template literal placeholders
        const escapedContent = rawContent
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\${/g, '\\${');

        outputContent += `${fileSpec.variable} = \`\n${escapedContent}\`;\n\n`;
        console.log(`[BUILD UI FALLBACK] Compiled ${fileSpec.name} into ${fileSpec.variable}`);
    });

    fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
    console.log(`[BUILD UI FALLBACK] Success! Wrote output to ${OUTPUT_FILE}`);
} catch (error) {
    console.error("[BUILD UI FALLBACK] Compilation failed:", error);
    process.exit(1);
}
