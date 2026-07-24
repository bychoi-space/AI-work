/**
 * vctrl_ui_library.js - Modular UI Components & Templates
 * Responsibility: Dynamic async loading of inspector panels, library cards, and modals.
 * Optimized with local fallback mapping for 'file://' CORS protocol restrictions.
 */

(function() {
    console.log("[VCTRL UI LIBRARY] Synchronously injecting modular UI components...");

    async function loadUIBlock(url, containerId, isAppend) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Fetch failed with status " + response.status);
            const html = await response.text();
            injectHTML(html, containerId, isAppend);
            return true;
        } catch (err) {
            console.warn(`[VCTRL UI LIBRARY] Failed to fetch ${url}:`, err);
            return false;
        }
    }

    function injectHTML(html, containerId, isAppend) {
        if (containerId === 'body') {
            document.body.insertAdjacentHTML('beforeend', html);
        } else {
            const container = document.getElementById(containerId);
            if (container) {
                if (isAppend) {
                    container.insertAdjacentHTML('beforeend', html);
                } else {
                    container.innerHTML = html;
                }
            }
        }
    }

    function triggerAllV4Bindings() {
        console.log("[VCTRL UI LIBRARY] Re-triggering all V4 inspector event bindings...");
        if (typeof window.initAllInspectorEvents === 'function') {
            window.initAllInspectorEvents();
        } else {
            if (typeof window.rebindInspectorDOM === 'function') window.rebindInspectorDOM();
            if (typeof window.initCheckboxRadioEvents === 'function') window.initCheckboxRadioEvents();
            if (typeof window.initTextboxTextareaEvents === 'function') window.initTextboxTextareaEvents();
            if (typeof window.initSearchbarEvents === 'function') window.initSearchbarEvents();
            if (typeof window.initStepperEvents === 'function') window.initStepperEvents();
            if (typeof window.initSelectboxEvents === 'function') window.initSelectboxEvents();
            if (typeof window.initFileuploadEvents === 'function') window.initFileuploadEvents();
            if (typeof window.initAlertEvents === 'function') window.initAlertEvents();
            if (typeof window.initButtonEvents === 'function') window.initButtonEvents();
            if (typeof window.initDatePickerEvents === 'function') window.initDatePickerEvents();
            if (typeof window.initAccordionEvents === 'function') window.initAccordionEvents();
            if (typeof window.initGridEvents === 'function') window.initGridEvents();
            if (typeof window.initAdminSettingsEvents === 'function') window.initAdminSettingsEvents();
            if (typeof window.initToggleEvents === 'function') window.initToggleEvents();
            if (typeof window.initV4AddonEventListeners === 'function') window.initV4AddonEventListeners();
        }
    }

    function loadFallbackAndApply(res1, res2, res3, res4) {
        // Check if fallback script is already loaded, otherwise dynamically load it
        if (window.VCTRL_UI_FALLBACK_INSPECTOR) {
            applyFallbackData(res1, res2, res3, res4);

            // Trigger inspector rebinding to cache newly injected HTML elements
            triggerAllV4Bindings();
        } else {
            const script = document.createElement('script');
            // Cache bust query for local script
            script.src = 'assets/ui_library_fallback.js?v=' + Date.now();
            script.onload = function() {
                console.log("[VCTRL UI LIBRARY] Fallback script loaded. Injecting offline components...");
                applyFallbackData(res1, res2, res3, res4);
                // Trigger inspector rebinding to cache newly injected HTML elements after fallback load
                triggerAllV4Bindings();
            };
            script.onerror = function(e) {
                console.error("[VCTRL UI LIBRARY] Critical error: Fallback script failed to load.", e);
            };
            document.head.appendChild(script);
        }
    }

    async function initializeUI() {
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            console.log("[VCTRL UI LIBRARY] Running under file:// protocol. Direct fallback recovery to prevent CORS console errors.");
            loadFallbackAndApply(false, false, false, false);
            return;
        }

        // Try to load HTML blocks asynchronously
        const res1 = await loadUIBlock('assets/ui_library/inspector_panels.html', 'inspector-panels-storage', false);
        const res2 = await loadUIBlock('assets/ui_library/atomic_cards.html', 'atomic-library-container', false);
        const res3 = await loadUIBlock('assets/ui_library/icon_cards.html', 'icon-library-container', false);
        const res4 = await loadUIBlock('assets/ui_library/modals.html', 'body', true);

        // Fallback check
        if (!res1 || !res2 || !res3 || !res4) {
            console.log("[VCTRL UI LIBRARY] Fetch failure detected. Activating local fallback data...");
            loadFallbackAndApply(res1, res2, res3, res4);
        } else {
            // Trigger inspector rebinding after all asynchronous blocks are successfully fetched
            triggerAllV4Bindings();
            syncWindowDOM();
        }
    }

    function applyFallbackData(res1, res2, res3, res4) {
        if (!res1 && window.VCTRL_UI_FALLBACK_INSPECTOR) {
            injectHTML(window.VCTRL_UI_FALLBACK_INSPECTOR, 'inspector-panels-storage', false);
        }
        if (!res2 && window.VCTRL_UI_FALLBACK_ATOMIC) {
            injectHTML(window.VCTRL_UI_FALLBACK_ATOMIC, 'atomic-library-container', false);
        }
        if (!res3 && window.VCTRL_UI_FALLBACK_ICON) {
            injectHTML(window.VCTRL_UI_FALLBACK_ICON, 'icon-library-container', false);
        }
        if (!res4 && window.VCTRL_UI_FALLBACK_MODALS) {
            injectHTML(window.VCTRL_UI_FALLBACK_MODALS, 'body', true);
        }
        syncWindowDOM();
    }

    function syncWindowDOM() {
        if (!window.DOM) return;
        const get = id => document.getElementById(id);
        window.DOM.editScreenModal = get('edit-screen-modal');
        window.DOM.editScreenTitle = get('edit-screen-title');
        window.DOM.editScreenType = get('edit-screen-type');
        window.DOM.editScreenDefaultTab = get('edit-screen-default-tab');
        window.DOM.editScreenDesc = get('edit-screen-desc');
        window.DOM.editScreenFilename = get('edit-screen-filename');
        window.DOM.btnCancelEdit = get('btn-edit-screen-cancel');
        window.DOM.btnSubmitEdit = get('btn-edit-screen-submit');
        window.DOM.addScreenModal = get('add-screen-modal');
        window.DOM.btnCancelAdd = get('btn-add-screen-cancel');
        window.DOM.btnSubmitAdd = get('btn-add-screen-submit');
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeUI);
    } else {
        initializeUI();
    }
})();
