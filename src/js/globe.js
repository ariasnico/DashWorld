/**
 * CORDIS DIE // Globe Module
 * Initializes and configures the 3D globe (globe.gl).
 */

import { CONFIG } from './config.js';
import { hideLoader } from './loader.js';
import { updateDashboard, closePanel } from './dashboard.js';

const container = document.getElementById('globe-container');
let world = null;

/**
 * Initialize the 3D globe, load GeoJSON, and bind interactions.
 */
export function initGlobe() {
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
            world.polygonsData(countries.features)
                .polygonSideColor(() => cfg.polygonSideColor)
                .polygonStrokeColor(() => cfg.polygonStrokeColor)
                .polygonCapColor(() => cfg.polygonBaseColor)
                .polygonAltitude(cfg.polygonBaseAltitude);
            setTimeout(hideLoader, 1000);
        })
        .catch(console.error);

    // Responsive resize
    window.addEventListener('resize', handleResize);
}

/**
 * Focus camera on a specific country and open the dashboard.
 */
function focusCountry(props, lat, lng) {
    world.controls().autoRotate = false;
    world.pointOfView({ lat, lng, altitude: CONFIG.globe.focusAltitude }, CONFIG.animations.focusDuration);
    updateDashboard(props, lat, lng);
}

/**
 * Reset globe to default view with auto-rotation.
 */
export function resetGlobeView() {
    closePanel();
    world.controls().autoRotate = true;
    world.pointOfView({ altitude: CONFIG.globe.initialView.altitude }, CONFIG.animations.resetDuration);
}

/**
 * Keep globe sized to the viewport.
 */
function handleResize() {
    if (world) {
        world.width(window.innerWidth).height(window.innerHeight);
    }
}
