/**
 * CORDIS DIE // Country Search Module
 * Fuzzy search over loaded GeoJSON country features.
 * Powered by Fuse.js (loaded via CDN) for typo-tolerant matching.
 */

import { focusCountry } from './globe.js';

const input = document.getElementById('searchInput');
const resultsList = document.getElementById('searchResults');

let fuse = null;
let activeIndex = -1;
let currentResults = [];

/**
 * Build the Fuse.js index from GeoJSON country features.
 * Called once by globe.js after the polygon data is loaded.
 * @param {Array} features - GeoJSON feature array
 */
export function initSearch(features) {
    fuse = new Fuse(features, {
        keys: [
            { name: 'properties.ADMIN',     weight: 0.50 },
            { name: 'properties.NAME',      weight: 0.25 },
            { name: 'properties.NAME_LONG', weight: 0.15 },
            { name: 'properties.ISO_A2',    weight: 0.05 },
            { name: 'properties.ISO_A3',    weight: 0.05 },
        ],
        threshold: 0.35,
        distance: 100,
        includeScore: true,
        minMatchCharLength: 2,
        shouldSort: true,
    });

    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleOutsideClick);
}

function handleInput() {
    const query = input.value.trim();
    if (query.length < 2) {
        closeDropdown();
        return;
    }
    const raw = fuse.search(query, { limit: 6 });
    currentResults = raw.map(r => r.item);
    renderDropdown(currentResults);
}

function handleKeydown(e) {
    const items = resultsList.querySelectorAll('.search-widget__result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        updateActive(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActive(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = activeIndex >= 0 ? currentResults[activeIndex] : currentResults[0];
        if (target) selectCountry(target);
    } else if (e.key === 'Escape') {
        closeDropdown();
        input.blur();
    }
}

function handleOutsideClick(e) {
    if (!e.target.closest('#search-widget')) {
        closeDropdown();
    }
}

function renderDropdown(features) {
    activeIndex = -1;

    if (!features.length) {
        closeDropdown();
        return;
    }

    resultsList.innerHTML = features.map((f, i) => {
        const name = f.properties.ADMIN || f.properties.NAME || 'UNKNOWN';
        const iso  = (f.properties.ISO_A2 && f.properties.ISO_A2 !== '-99')
            ? f.properties.ISO_A2
            : '??';
        return `<li class="search-widget__result-item" data-index="${i}">
            <span class="search-widget__result-iso">${iso}</span>
            <span class="search-widget__result-name">${name.toUpperCase()}</span>
        </li>`;
    }).join('');

    resultsList.removeAttribute('hidden');

    resultsList.querySelectorAll('.search-widget__result-item').forEach(item => {
        // mousedown prevents input blur before the click fires
        item.addEventListener('mousedown', e => e.preventDefault());
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index, 10);
            selectCountry(currentResults[idx]);
        });
        item.addEventListener('mouseenter', () => {
            activeIndex = parseInt(item.dataset.index, 10);
            updateActive(resultsList.querySelectorAll('.search-widget__result-item'));
        });
    });
}

function updateActive(items) {
    items.forEach((el, i) => {
        el.classList.toggle('search-widget__result-item--active', i === activeIndex);
    });
}

function selectCountry(feature) {
    const props = feature.properties;
    const lat = props.LABEL_Y ?? 0;
    const lng = props.LABEL_X ?? 0;
    input.value = '';
    closeDropdown();
    focusCountry(props, lat, lng);
}

function closeDropdown() {
    activeIndex = -1;
    currentResults = [];
    resultsList.innerHTML = '';
    resultsList.setAttribute('hidden', '');
}
