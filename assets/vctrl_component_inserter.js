/**
 * vctrl_component_inserter.js
 * Manages V4 component library insertion, image upload handlers, and atomic component injection.
 */
(function() {
    function notifyIframe(data) {
        const activeIframe = document.getElementById('main-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage(data, '*');
        } else {
            console.warn("[V4 Component Inserter] notifyIframe failed: activeIframe or contentWindow not found.");
        }
    }

    window.insertV4ComponentById = function(id, customIdx) {
        if (id === 'v4-atom-image') {
            triggerImageFileUpload();
            return;
        }
        const legacyMap = {
            'v4-atom-accordion': 'Accordion UI',
            'v4-atom-checkbox': 'Check Box',
            'v4-atom-radio': 'Radio Button',
            'v4-atom-grid': 'Grid UI',
            'v4-atom-searchbar': 'Search Bar'
        };
        if (legacyMap[id] && typeof window.insertAtomicComponent === 'function') {
            window.insertAtomicComponent('atom', legacyMap[id]);
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

        const isIcon = item.id.includes('icon') || (item.html && (item.html.includes('<img') || item.html.includes('lf-icon')));
        const style = { 
            width: item.width || (isIcon ? '40px' : '120px'), 
            height: item.height || (isIcon ? '40px' : '40px') 
        };
        if (item.id === 'v4-search-bar' || item.id === 'v4-premium-gnb') {
            style.width = '100%';
            style.height = 'auto';
        }
        if (item.id === 'v4-tool-text') {
            style.width = '120px';
            style.height = '30px';
        }

        const isTextTool = item.id === 'v4-tool-text';
        
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
})();
