/**
 * vctrl_floating_inspector.js
 * Manages floating property card position, slider/color picker events, 
 * selection-based button filtering, and inspector storage DOM restoration.
 */
(function() {
    function notifyIframe(data) {
        const activeIframe = document.getElementById('main-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage(data, '*');
        } else {
            console.warn("[Floating Inspector] notifyIframe failed: activeIframe or contentWindow not found.");
        }
    }

    // Helper to safely bind input event to element by ID
    window.bindInputById = function(id, callback) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function(e) {
                callback(e, this.value);
            });
        }
    };

    // Helper to safely bind click event to element by ID
    window.bindClickById = function(id, callback) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', function(e) {
                callback(e);
            });
        }
    };
})();
