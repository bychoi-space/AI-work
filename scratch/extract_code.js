const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\LF_User\\.gemini\\antigravity\\brain\\6e9878b3-97cb-456a-a7c5-5a4c6e78231a\\.system_generated\\logs\\overview.txt';
const outputPath = 'c:\\ai-work\\vctrl_connectors_backup.js';

try {
    const data = fs.readFileSync(logPath, 'utf8');
    const lines = data.split('\n');
    let fullContent = "";

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const step = JSON.parse(line);
            const tool_calls = step.tool_calls || [];
            for (const call of tool_calls) {
                const args = call.args || {};
                if (args.TargetFile && args.TargetFile.includes('vctrl_connectors.js')) {
                    if (args.CodeContent) {
                        fullContent = args.CodeContent;
                        console.log(`Found CodeContent at step ${step.step_index}`);
                    }
                }
            }
        } catch (e) {
            // Ignore parse errors for truncated lines
        }
    }

    if (fullContent) {
        fs.writeFileSync(outputPath, fullContent);
        console.log(`Successfully extracted to ${outputPath}`);
    } else {
        console.log("Could not find vctrl_connectors.js content.");
    }
} catch (err) {
    console.error(err);
}
