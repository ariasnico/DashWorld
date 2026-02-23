/**
 * CORDIS DIE // Application Entry Point
 * Bootstraps all modules and wires up global event handlers.
 */

import { initLoaderFallback } from './loader.js';
import { initGlobe, resetGlobeView, registerCountriesCallback } from './globe.js';
import { loadGlobalTicker } from './ticker.js';
import { startClock } from './clock.js';
import { initSearch } from './search.js';
import { initEvents } from './events.js';
import { initConnections } from './connections.js';

/**
 * Boot sequence — called on DOM ready.
 */
function boot() {
    initLoaderFallback();
    registerCountriesCallback(initSearch);
    initGlobe();
    loadGlobalTicker();
    startClock();
    initEvents();
    initConnections();

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
