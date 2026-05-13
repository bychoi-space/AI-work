const fs = require('fs');
const content = fs.readFileSync('c:\\ai-work\\assets\\vctrl_core.js', 'utf8');

// Extract v4Script
const startMatch = content.match(/const v4Script = `/);
if (!startMatch) {
    console.log("Could not find v4Script start");
    process.exit(1);
}
const startIndex = startMatch.index + startMatch[0].length;
const endIndex = content.indexOf('`;', startIndex);
const v4Script = content.substring(startIndex, endIndex);

console.log("v4Script extracted, length:", v4Script.length);

function checkBrackets(str) {
    const stack = [];
    const pairs = { '(': ')', '{': '}', '[': ']' };
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (pairs[c]) {
            stack.push({ char: c, pos: i });
        } else if (c === ')' || c === '}' || c === ']') {
            if (stack.length === 0) {
                console.log(`Unmatched closing bracket '${c}' at position ${i}`);
                console.log(str.substring(Math.max(0, i-20), Math.min(str.length, i+20)));
                return false;
            }
            const last = stack.pop();
            if (pairs[last.char] !== c) {
                console.log(`Bracket mismatch: expected '${pairs[last.char]}' but found '${c}' at position ${i}`);
                console.log("Opening bracket at pos:", last.pos);
                console.log(str.substring(Math.max(0, i-20), Math.min(str.length, i+20)));
                return false;
            }
        }
    }
    if (stack.length > 0) {
        const last = stack.pop();
        console.log(`Unmatched opening bracket '${last.char}' at position ${last.pos}`);
        console.log(str.substring(Math.max(0, last.pos-20), Math.min(str.length, last.pos+20)));
        return false;
    }
    return true;
}

if (checkBrackets(v4Script)) {
    console.log("All brackets match in v4Script!");
} else {
    console.log("Bracket error found!");
}
