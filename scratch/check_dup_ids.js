const fs = require('fs');
const content = fs.readFileSync('C:/ai-work/data/p_eg0v3/99_Blank_798.html', 'utf8');
const matches = content.match(/id="([^"]+)"/g) || [];
const ids = matches.map(m => m.match(/id="([^"]+)"/)[1]);

const counts = {};
ids.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
});

const duplicates = Object.keys(counts).filter(id => counts[id] > 1 && (id.startsWith('v4-comp-') || id.startsWith('v4-pin-') || id.startsWith('group-')));
if (duplicates.length > 0) {
    console.log("Found duplicate IDs:");
    duplicates.forEach(id => {
        console.log(`ID: ${id}, Count: ${counts[id]}`);
    });
} else {
    console.log("No duplicate IDs found.");
}
