const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\LF_User\\.gemini\\antigravity\\brain\\17500ce2-6464-4f4c-88ce-c082c25acc5c\\.system_generated\\logs\\overview.txt';
const targets = [95, 122, 131];

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

targets.forEach(step => {
    const line = lines.find(l => l.includes(`"step_index":${step},`));
    if (line) {
        try {
            const data = JSON.parse(line);
            const toolCall = data.tool_calls[0];
            const args = toolCall.args;
            const replacement = args.ReplacementContent || args.CodeContent;
            const targetFile = args.TargetFile;
            
            if (replacement && targetFile) {
                // Clean up the target file path (it might have escaped slashes)
                const cleanPath = targetFile.replace(/\\\\/g, '\\').replace(/"/g, '');
                
                // Unescape the replacement content
                // ReplacementContent in the log is a string inside JSON, so it's already a string.
                // But we need to make sure we're writing the actual string content.
                fs.writeFileSync(`c:\\ai-work\\restore_step_${step}.txt`, replacement, 'utf8');
                console.log(`Extracted step ${step} to c:\\ai-work\\restore_step_${step}.txt`);
            }
        } catch (e) {
            console.error(`Error parsing step ${step}:`, e.message);
        }
    } else {
        console.log(`Step ${step} not found in log.`);
    }
});
