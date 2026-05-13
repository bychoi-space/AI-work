
// This is a conceptual check. 
// In a parent window, if we have an iframe scaled by 0.5:
// const r = iframe.contentDocument.body.getBoundingClientRect();
// Does r.width return 1440 or 720?
// In Chrome, it returns 1440.

console.log("Iframe getBoundingClientRect() returns internal unscaled coordinates.");
