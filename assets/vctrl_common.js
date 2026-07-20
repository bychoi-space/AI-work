/**
 * assets/vctrl_common.js
 * Shared common helper functions for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4CommonScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.rgbToHex = function(rgb) {
    if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
    if (rgb.startsWith('#')) return rgb;
    const matches = rgb.match(/\d+/g);
    if (!matches || matches.length < 3) return "#ffffff";
    const r = Math.min(255, parseInt(matches[0])).toString(16).padStart(2, "0");
    const g = Math.min(255, parseInt(matches[1])).toString(16).padStart(2, "0");
    const b = Math.min(255, parseInt(matches[2])).toString(16).padStart(2, "0");
    return "#" + r + g + b;
};

window.calculatePathData = function(c, s, e) {
    if (c.type === 'straight') return 'M ' + s.x + ' ' + s.y + ' L ' + e.x + ' ' + e.y;
    
    const sSide = c.start.side || 'right';
    const eSide = c.end.side || 'left';
    
    const getDirOffset = (side, amount) => {
        if (side === 'left') return { dx: -amount, dy: 0 };
        if (side === 'right') return { dx: amount, dy: 0 };
        if (side === 'top') return { dx: 0, dy: -amount };
        if (side === 'bottom') return { dx: 0, dy: amount };
        return { dx: 0, dy: 0 };
    };
    
    const offset = 20;
    const oStart = getDirOffset(sSide, offset);
    const oEnd = getDirOffset(eSide, offset);
    
    const ptStart = { x: s.x + oStart.dx, y: s.y + oStart.dy };
    const ptEnd = { x: e.x + oEnd.dx, y: e.y + oEnd.dy };
    
    let path = 'M ' + s.x + ' ' + s.y + ' L ' + ptStart.x + ' ' + ptStart.y;
    
    if (sSide === 'left' || sSide === 'right') {
        if (eSide === 'left' || eSide === 'right') {
            const midX = (ptStart.x + ptEnd.x) / 2;
            path += ' H ' + midX + ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
        } else {
            path += ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
        }
    } else {
        if (eSide === 'top' || eSide === 'bottom') {
            const midY = (ptStart.y + ptEnd.y) / 2;
            path += ' V ' + midY + ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
        } else {
            path += ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
        }
    }
    return path;
};

window.v4CommonScript = `
(function() {
    console.log("[V4 Common] Module loaded.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};
    
    // Core shared message helpers
    window.notifyParent = function(data) { if (window.parent) window.parent.postMessage(data, '*'); };
    window.markDirty = function() { window.notifyParent({ type: 'LF_DIRTY' }); };

    // Universal RGB to HEX Converter
    window.rgbToHex = function(rgb) {
        if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
        if (rgb.startsWith('#')) return rgb;
        const matches = rgb.match(/\\d+/g);
        if (!matches || matches.length < 3) return "#ffffff";
        const r = Math.min(255, parseInt(matches[0])).toString(16).padStart(2, "0");
        const g = Math.min(255, parseInt(matches[1])).toString(16).padStart(2, "0");
        const b = Math.min(255, parseInt(matches[2])).toString(16).padStart(2, "0");
        return "#" + r + g + b;
    };

    // Universal Connector Path Data Calculator
    window.calculatePathData = function(c, s, e) {
        if (c.type === 'straight') return 'M ' + s.x + ' ' + s.y + ' L ' + e.x + ' ' + e.y;
        
        const sSide = c.start.side || 'right';
        const eSide = c.end.side || 'left';
        
        const getDirOffset = (side, amount) => {
            if (side === 'left') return { dx: -amount, dy: 0 };
            if (side === 'right') return { dx: amount, dy: 0 };
            if (side === 'top') return { dx: 0, dy: -amount };
            if (side === 'bottom') return { dx: 0, dy: amount };
            return { dx: 0, dy: 0 };
        };
        
        const offset = 20;
        const oStart = getDirOffset(sSide, offset);
        const oEnd = getDirOffset(eSide, offset);
        
        const ptStart = { x: s.x + oStart.dx, y: s.y + oStart.dy };
        const ptEnd = { x: e.x + oEnd.dx, y: e.y + oEnd.dy };
        
        let path = 'M ' + s.x + ' ' + s.y + ' L ' + ptStart.x + ' ' + ptStart.y;
        
        if (sSide === 'left' || sSide === 'right') {
            if (eSide === 'left' || eSide === 'right') {
                const midX = (ptStart.x + ptEnd.x) / 2;
                path += ' H ' + midX + ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
            } else {
                path += ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
            }
        } else {
            if (eSide === 'top' || eSide === 'bottom') {
                const midY = (ptStart.y + ptEnd.y) / 2;
                path += ' V ' + midY + ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
            } else {
                path += ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
            }
        }
        return path;
    };
})();
`;
