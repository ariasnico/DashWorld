/**
 * CORDIS DIE // Application Entry Point
 * Bootstraps all modules and wires up global event handlers.
 */

import { initLoaderFallback } from './loader.js';
import { initGlobe, resetGlobeView } from './globe.js';
import { loadGlobalTicker } from './ticker.js';
import { startClock } from './clock.js';

/**
 * Boot sequence — called on DOM ready.
 */
function boot() {
    initLoaderFallback();
    initGlobe();
    loadGlobalTicker();
    startClock();

    // Wire close button
    const closeBtn = document.getElementById('closePanelBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', resetGlobeView);
    }
}

// Launch when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
