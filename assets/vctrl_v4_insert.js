/**
 * assets/vctrl_v4_insert.js
 * Component insertion and image upload utilities for LF Editor Studio.
 */

(function() {
    console.log("[V4 Addon Insert] Initializing component insertion tools...");
    
    function notifyIframe(data) {
        const activeIframe = document.getElementById('main-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage(data, '*');
        } else {
            console.warn("[V4 Addon] notifyIframe failed: activeIframe or contentWindow not found.");
        }
    }
    window.notifyIframe = notifyIframe;

/**
 * vctrl_v4_addon.js
 * Bridges V4 Table & Shape editing into the main viewer system.
 * Optimized for 'file://' protocol security by using postMessage instead of direct DOM access.
 */



    function notifyIframe(data) {
        const activeIframe = document.getElementById('main-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage(data, '*');
        } else {
            console.warn("[V4 Addon] notifyIframe failed: activeIframe or contentWindow not found.");
        }
    }

    // 1. Component Insertion
    window.insertV4ComponentById = function(id, customIdx) {
        if (id === 'v4-atom-image') {
            triggerImageFileUpload();
            return;
        }
        const lib = window.V4_COMPONENT_LIBRARY;
        if (!lib) return console.error("[V4] Component Library not found.");

        const curState = window.state || window.parent.state || {};
        const customMols = curState.globalComponents || ((curState.projectMetadata && curState.projectMetadata.molecules) ? curState.projectMetadata.molecules : []);
        
        const item = (lib.atoms || []).find(i => i.id === id) || 
                     (lib.molecules || []).find(i => i.id === id) || 
                     (lib.organisms || []).find(i => i.id === id) ||
                     customMols.find(i => i.id === id);

        if (!item) return console.error("[V4] Component not found:", id);

        const style = { 
            width: item.width || '200px', 
            height: item.height || '200px' 
        };
        if (item.category === 'Atoms' || item.id === 'v4-shape-badge') {
            const isIcon = item.id.includes('icon') || item.html.includes('<img');
            if (item.id === 'v4-atom-textbox') {
                style.width = '150px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-textarea') {
                style.width = '150px';
                style.height = '60px';
            } else if (item.id === 'v4-atom-stepper') {
                style.width = '154px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-selectbox') {
                style.width = '150px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-fileupload') {
                style.width = '300px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-alert') {
                style.width = '250px';
                style.height = '120px';
            } else if (item.id === 'v4-atom-popup') {
                style.width = '300px';
                style.height = '200px';
            } else if (item.id === 'v4-atom-button') {
                style.width = '80px';
                style.height = '40px';
            } else if (item.id === 'v4-atom-datepicker') {
                style.width = '500px';
                style.height = '30px';
            } else if (item.id === 'v4-atom-toggle') {
                style.width = '40px';
                style.height = '20px';
            } else if (item.id === 'v4-atom-admin-settings') {
                style.width = '1180px';
                style.height = '50px';
            } else {
                style.width = isIcon ? '40px' : '120px';
                style.height = '40px';
            }
        }
        if (item.id === 'v4-search-bar' || item.id === 'v4-premium-gnb') {
            style.width = '100%';
            style.height = 'auto';
        }
        if (item.id === 'v4-tool-text') {
            style.width = '120px';
            style.height = '30px';
        }

        const isTextTool = item.id === 'v4-tool-text';
        
        // Separate description pins (customIdx present) from pure textboxes (no customIdx)
        const isDescriptionPin = isTextTool && (customIdx !== undefined);
        const targetId = isTextTool 
            ? (isDescriptionPin ? ('v4-pin-' + customIdx) : ('v4-text-' + Date.now()))
            : ('v4-comp-' + Date.now());


        notifyIframe({
            type: 'LF_INSERT_COMPONENT',
            id: targetId,
            html: item.html,
            style: style,
            className: isDescriptionPin ? 'pin-marker' : (isTextTool ? 'v4-text-shape' : ''),
            isGroup: !!item.isGroup
        });
    };

    function triggerImageFileUpload() {
        let input = document.getElementById('v4-image-file-input');
        if (!input) {
            input = document.createElement('input');
            input.id = 'v4-image-file-input';
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64 = evt.target.result;
                    const img = new Image();
                    img.onload = function() {
                        let w = img.naturalWidth || 200;
                        let h = img.naturalHeight || 200;
                        const maxBound = 300;
                        if (w > maxBound || h > maxBound) {
                            const ratio = Math.min(maxBound / w, maxBound / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                        }
                        window.insertImageComponent(base64, w + 'px', h + 'px');
                    };
                    img.src = base64;
                };
                reader.readAsDataURL(file);
                input.value = '';
            });
        }
        input.click();
    }

    window.insertImageComponent = function(base64, width, height) {
        const targetId = 'v4-img-' + Date.now();
        const html = '<div class="v4-shape v4-shape-image" style="width: 100%; height: 100%; background-image: url(\'' + base64 + '\'); background-size: contain; background-position: center; background-repeat: no-repeat; box-sizing: border-box; border: 1.6px solid transparent; background-color: transparent !important;"></div>';
        const finalW = width || '200px';
        const finalH = height || '200px';
        const style = {
            width: finalW,
            height: finalH
        };
        notifyIframe({
            type: 'LF_INSERT_COMPONENT',
            id: targetId,
            html: html,
            style: style,
            className: ''
        });
    };

    // Dependencies are now pre-injected via vctrl_v3.js loadScreen() for security compliance.

    // 2. Inspector Controls (Safe Style Updates)
})();
