/**
 * CORDIS DIE // Globe Module
 * Initializes and configures the 3D globe (globe.gl).
 */

import { CONFIG } from './config.js';
import { hideLoader } from './loader.js';
import { updateDashboard, closePanel } from './dashboard.js';

const container = document.getElementById('globe-container');
let world = null;
let _countriesReadyCallback = null;
let _countryCoords = {};
let _ringSources = {};

/**
 * Register a callback to receive GeoJSON features once the globe has loaded them.
 * @param {function} fn
 */
export function registerCountriesCallback(fn) {
    _countriesReadyCallback = fn;
}

/**
 * Return the globe.gl instance for direct layer manipulation.
 */
export function getGlobe() {
    return world;
}

/**
 * Lookup centroid coordinates for a country by ISO_A2 code.
 * @param {string} iso - ISO_A2 country code
 * @returns {{ lat: number, lng: number } | null}
 */
export function getCountryCoords(iso) {
    return _countryCoords[iso] || null;
}

/**
 * Ring coordinator — merges rings from multiple sources and applies to globe.
 * @param {string} source - identifier (e.g. 'connections', 'events')
 * @param {Array} rings - array of ring data objects
 */
export function updateRings(source, rings) {
    _ringSources[source] = rings;
    const merged = Object.values(_ringSources).flat();
    if (world) world.ringsData(merged);
}

/**
 * Initialize the 3D globe, load GeoJSON, and bind interactions.
 */
export function initGlobe() {
    if (typeof Globe === 'undefined') {
        console.error('Globe library failed to load from CDN');
        hideLoader();
        return;
    }

    const cfg = CONFIG.globe;

    world = Globe()(container)
        .backgroundColor(cfg.backgroundColor)
        .globeImageUrl(cfg.earthTexture)
        .backgroundImageUrl(cfg.skyTexture)
        .atmosphereColor(cfg.atmosphereColor)
        .atmosphereAltitude(cfg.atmosphereAltitude)
        .pointOfView(cfg.initialView)
        .onPolygonHover(hoverD => {
            world
                .polygonCapColor(d => d === hoverD ? cfg.polygonHoverColor : cfg.polygonBaseColor)
                .polygonAltitude(d => d === hoverD ? cfg.polygonHoverAltitude : cfg.polygonBaseAltitude);
            container.style.cursor = hoverD ? 'crosshair' : 'default';
        })
        .onPolygonClick((d, _event, { lat, lng }) => {
            focusCountry(d.properties, lat, lng);
        });

    // Auto-rotation
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = cfg.autoRotateSpeed;
    world.controls().dampingFactor = cfg.dampingFactor;

    // Load country polygons
    fetch(CONFIG.api.countriesGeoJson)
        .then(res => res.json())
        .then(countries => {
            // Build coordinate index by computing centroids from geometry
            countries.features.forEach(f => {
                const p = f.properties;
                const iso = p.ISO_A2;
                if (!iso || iso === '-99') return;
                const centroid = computeCentroid(f.geometry);
                if (centroid) _countryCoords[iso] = centroid;
            });

            world.polygonsData(countries.features)
                .polygonSideColor(() => cfg.polygonSideColor)
                .polygonStrokeColor(() => cfg.polygonStrokeColor)
                .polygonCapColor(() => cfg.polygonBaseColor)
                .polygonAltitude(cfg.polygonBaseAltitude);
            setTimeout(hideLoader, 1000);
            if (_countriesReadyCallback) _countriesReadyCallback(countries.features);
        })
        .catch(err => {
            console.error('Failed to load country polygons:', err);
            hideLoader();
        });

    // Responsive resize
    window.addEventListener('resize', handleResize);
}

/**
 * Focus camera on a specific country and open the dashboard.
 */
export function focusCountry(props, lat, lng) {
    world.controls().autoRotate = false;
    world.pointOfView({ lat, lng, altitude: CONFIG.globe.focusAltitude }, CONFIG.animations.focusDuration);
    updateDashboard(props, lat, lng);
}

/**
 * Reset globe to default view with auto-rotation.
 */
export function resetGlobeView() {
    closePanel();
    // Lazy import to avoid circular dependency at module load time
    import('./connections.js').then(({ clearConnections }) => clearConnections()).catch(() => {});
    world.controls().autoRotate = true;
    world.pointOfView({ altitude: CONFIG.globe.initialView.altitude }, CONFIG.animations.resetDuration);
}

/**
 * Compute a simple centroid from a GeoJSON Polygon or MultiPolygon geometry.
 * Averages all coordinate points to approximate the center.
 * @param {object} geometry - GeoJSON geometry object
 * @returns {{ lat: number, lng: number } | null}
 */
function computeCentroid(geometry) {
    let coords = [];
    if (geometry.type === 'Polygon') {
        coords = geometry.coordinates[0]; // outer ring
    } else if (geometry.type === 'MultiPolygon') {
        // Use the largest polygon (most points) as representative
        let largest = [];
        for (const poly of geometry.coordinates) {
            if (poly[0].length > largest.length) largest = poly[0];
        }
        coords = largest;
    }
    if (coords.length === 0) return null;

    let sumLng = 0, sumLat = 0;
    for (const [lng, lat] of coords) {
        sumLng += lng;
        sumLat += lat;
    }
    return { lat: sumLat / coords.length, lng: sumLng / coords.length };
}

/**
 * Keep globe sized to the viewport.
 */
function handleResize() {
    if (world) {
        world.width(window.innerWidth).height(window.innerHeight);
    }
}
