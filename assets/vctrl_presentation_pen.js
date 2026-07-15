/**
 * assets/vctrl_presentation_pen.js
 * Presentation Laser Pointer and Highlighter Pen Stroke drawing module for LF Editor Studio.
 * Activated strictly inside [Fullscreen Mode] when holding the [Shift] key.
 * Fully encapsulated: Dynamically injects drawing canvas and monitors presentation state.
 */

(function() {
    console.log("[Presentation Pen] Module initialized in full encapsulation mode.");

    let canvas = null;
    let ctx = null;
    
    let laserPoints = []; // {x, y, age, maxAge}
    let penStrokes = [];  // [[{x, y}, ...]]
    let currentStroke = null;
    let isDrawingPen = false;
    let isShiftPressed = false;
    let lastMousePos = null;
    let animationFrameId = null;

    // Initialize and inject Presentation Pen Overlay Canvas
    function initPenCanvas() {
        // Create and inject canvas if not exists directly to body
        canvas = document.getElementById('presentation-pen-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'presentation-pen-canvas';
            Object.assign(canvas.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: '99999' // Topmost layer
            });
            document.body.appendChild(canvas);
            console.log("[Presentation Pen] Dynamic fixed Canvas injected to body successfully.");
        }

        ctx = canvas.getContext('2d');
        resizeCanvas();

        // Listeners for resizing
        window.addEventListener('resize', resizeCanvas);
        
        // Listeners for key holds (Shift activation)
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Listeners for mouse moves and drawing coordinates on window level (bypasses pointer-events:none)
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // Start drawing frame loop
        startDrawLoop();
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Force canvas size update on layout transitions
    window.syncPresentationCanvas = function() {
        setTimeout(resizeCanvas, 380);
    };

    // Global Proxy Event Listeners for Iframe communication
    window.__lf_proxy_mousemove__ = function(e, iframeEl) {
        const isFullscreen = document.body.classList.contains('fullscreen-mode');
        if (!isFullscreen || !iframeEl) return;
        
        const rect = iframeEl.getBoundingClientRect();
        
        // Calculate absolute cursor coordinates by mapping iframe inner ClientX/Y 
        const scaleX = rect.width / iframeEl.offsetWidth;
        const scaleY = rect.height / iframeEl.offsetHeight;
        const absX = rect.left + (e.clientX * scaleX);
        const absY = rect.top + (e.clientY * scaleY);
        
        lastMousePos = { x: absX, y: absY };
        
        // Always add laser tail point in fullscreen mode
        laserPoints.push({
            x: absX,
            y: absY,
            age: 0,
            maxAge: 25
        });

        // Append Pen Stroke Point if drawing active
        if (isShiftPressed && isDrawingPen && currentStroke) {
            currentStroke.push(lastMousePos);
        }
    };

    window.__lf_proxy_keydown__ = function(e) {
        const isFullscreen = document.body.classList.contains('fullscreen-mode');
        if (!isFullscreen) return;
        
        if (!isShiftPressed) {
            isShiftPressed = true;
            if (canvas) {
                canvas.style.pointerEvents = 'auto';
            }
        }
    };

    window.__lf_proxy_keyup__ = function(e) {
        isShiftPressed = false;
        isDrawingPen = false;
        currentStroke = null;
        if (canvas) {
            canvas.style.pointerEvents = 'none';
        }
        lastMousePos = null;
    };

    function handleKeyDown(e) {
        const isFullscreen = document.body.classList.contains('fullscreen-mode');
        if (!isFullscreen) return;

        // Shift Key activates Highlighter pen drawing mode by enabling pointer-events
        if (e.key === 'Shift' && !isShiftPressed) {
            isShiftPressed = true;
            if (canvas) {
                canvas.style.pointerEvents = 'auto';
            }
        }

        // Clear drawings on ESC or 'C' key
        if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            clearDrawings();
        }
    }

    function handleKeyUp(e) {
        if (e.key === 'Shift') {
            isShiftPressed = false;
            isDrawingPen = false;
            currentStroke = null;
            if (canvas) {
                canvas.style.pointerEvents = 'none';
            }
            lastMousePos = null;
        }
    }

    function handleMouseDown(e) {
        if (!isShiftPressed || e.button !== 0) return; // Only left click with Shift draws pen strokes
        
        isDrawingPen = true;
        const pos = getMousePos(e);
        currentStroke = [pos];
    }

    function handleMouseMove(e) {
        const isFullscreen = document.body.classList.contains('fullscreen-mode');
        if (!isFullscreen) return;

        const pos = getMousePos(e);
        lastMousePos = pos;

        // Always add laser tail point in fullscreen mode
        laserPoints.push({
            x: pos.x,
            y: pos.y,
            age: 0,
            maxAge: 25 // 25 frames lifetime
        });

        // Append Pen Stroke Point if drawing active
        if (isShiftPressed && isDrawingPen && currentStroke) {
            currentStroke.push(pos);
        }
    }

    function handleMouseUp() {
        if (isDrawingPen && currentStroke) {
            if (currentStroke.length >= 2) {
                penStrokes.push(currentStroke);
            }
            currentStroke = null;
        }
        isDrawingPen = false;
    }

    function getMousePos(e) {
        return {
            x: e.clientX,
            y: e.clientY
        };
    }

    function clearDrawings() {
        penStrokes = [];
        currentStroke = null;
        laserPoints = [];
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    let tooltip = null;
    function initTooltip() {
        if (tooltip) return;
        tooltip = document.createElement('div');
        tooltip.id = 'presentation-pen-tooltip';
        tooltip.innerHTML = `
            <span style="display:flex; align-items:center; gap:6px;">
                <kbd style="background:rgba(255,255,255,0.2); border-radius:4px; padding:2px 6px; font-family:monospace; font-size:10px; font-weight:700; color:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.3)">Shift</kbd>
                <span style="color:rgba(255,255,255,0.7); font-size:11px; font-weight:600;">+ Drag : Highlighter</span>
            </span>
            <span style="opacity:0.3; color:#fff;">|</span>
            <span style="display:flex; align-items:center; gap:6px;">
                <kbd style="background:rgba(255,255,255,0.2); border-radius:4px; padding:2px 6px; font-family:monospace; font-size:10px; font-weight:700; color:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.3)">C</kbd>
                <span style="color:rgba(255,255,255,0.7); font-size:11px; font-weight:600;">: Clear</span>
            </span>
        `;
        
        Object.assign(tooltip.style, {
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: '99998',
            display: 'none',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            webkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            userSelect: 'none'
        });
        
        document.body.appendChild(tooltip);
    }

    // Handle body class mutation to clear canvas when fullscreen ends
    let wasFullscreen = false;
    const fsObserver = new MutationObserver(() => {
        const isFullscreen = document.body.classList.contains('fullscreen-mode');
        if (isFullscreen !== wasFullscreen) {
            wasFullscreen = isFullscreen;
            if (isFullscreen) {
                // Entering Fullscreen Presentation Mode
                resizeCanvas();
                initTooltip();
                if (tooltip) {
                    tooltip.style.display = 'flex';
                }
                
                // Programmatically hide properties card immediately if open
                const card = document.getElementById('floating-inspector-card');
                if (card) {
                    card.style.setProperty('display', 'none', 'important');
                }
            } else {
                // Exiting Fullscreen Presentation Mode
                clearDrawings();
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
                if (canvas) {
                    canvas.style.pointerEvents = 'none';
                    canvas.style.cursor = 'default';
                }
                isShiftPressed = false;
                isDrawingPen = false;
            }
        }
    });
    
    // Self-register init on window load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPenCanvas();
            fsObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        });
    } else {
        initPenCanvas();
        fsObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function startDrawLoop() {
        function drawFrame() {
            if (!canvas || !ctx) {
                animationFrameId = requestAnimationFrame(drawFrame);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Completed Highlighter Pen Strokes (Neon Yellow, semi-transparent)
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = 6;
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)'; // Neon Amber-Yellow

            penStrokes.forEach(stroke => {
                if (stroke.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(stroke[0].x, stroke[0].y);
                for (let i = 1; i < stroke.length; i++) {
                    ctx.lineTo(stroke[i].x, stroke[i].y);
                }
                ctx.stroke();
            });

            // Draw Active Highlighter Stroke
            if (isDrawingPen && currentStroke && currentStroke.length >= 2) {
                ctx.beginPath();
                ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
                for (let i = 1; i < currentStroke.length; i++) {
                    ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
                }
                ctx.stroke();
            }

            // Draw Laser Pointer Tail
            if (laserPoints.length > 0) {
                for (let i = 1; i < laserPoints.length; i++) {
                    const p1 = laserPoints[i - 1];
                    const p2 = laserPoints[i];
                    const life = 1 - (p2.age / p2.maxAge);
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(239, 68, 68, ${life * 0.8})`; // Fading neon red
                    ctx.lineWidth = life * 5;
                    ctx.stroke();
                }

                // Increment age and filter dead trails
                laserPoints.forEach(p => p.age++);
                laserPoints = laserPoints.filter(p => p.age < p.maxAge);
            }

            // Draw Shiny Laser Pointer Head
            if (lastMousePos) {
                ctx.beginPath();
                ctx.arc(lastMousePos.x, lastMousePos.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                
                // Add soft neon glow outer circle
                ctx.shadowColor = '#fca5a5';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0; // Reset shadow state for next frame
            }

            animationFrameId = requestAnimationFrame(drawFrame);
        }
        
        drawFrame();
    }
})();
