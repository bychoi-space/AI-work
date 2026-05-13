const fs = require('fs');
const content = fs.readFileSync('assets/vctrl_core.js', 'utf8');
const v4ScriptMatch = content.match(/const v4Script = `([\s\S]*?)`;/);
if (!v4ScriptMatch) {
    console.log("v4Script not found or malformed");
    process.exit(1);
}
const script = v4ScriptMatch[1];
let balance = 0;
for (let i = 0; i < script.length; i++) {
    if (script[i] === '{') balance++;
    if (script[i] === '}') balance--;
}
console.log("Brace balance in v4Script:", balance);
if (balance !== 0) {
    console.log("Mismatched braces detected!");
}
