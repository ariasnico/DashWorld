/**
 * CORDIS DIE // Loader Module
 * Manages the boot/loading screen with fallback timeout.
 */

import { CONFIG } from './config.js';

const loaderEl = document.getElementById('loader');
const loadingTextEl = document.getElementById('loading-text');
const errorMsgEl = document.getElementById('error-msg');

let hidden = false;

/**
 * Fade out and remove the loader overlay.
 */
export function hideLoader() {
    if (hidden) return;
    hidden = true;

    loaderEl.style.opacity = '0';
    setTimeout(() => {
        if (loaderEl.parentNode) loaderEl.remove();
    }, 1000);
}

/**
 * Initialize fallback timeout — if the globe hasn't loaded
 * within the threshold, force-dismiss the loader.
 */
export function initLoaderFallback() {
    setTimeout(() => {
        if (document.body.contains(loaderEl)) {
            loadingTextEl.style.display = 'none';
            errorMsgEl.style.display = 'block';
            setTimeout(hideLoader, CONFIG.loader.errorDisplayDelay);
        }
    }, CONFIG.loader.fallbackTimeout);
}
