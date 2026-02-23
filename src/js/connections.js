/**
 * CORDIS DIE // Geopolitical Connections Module
 * Shows animated arcs between a country and its top trade partners,
 * with pulsing rings at arc endpoints.
 */

import { CONFIG } from './config.js';
import { getGlobe, getCountryCoords, updateRings } from './globe.js';

let _tradeData = null;

/**
 * Initialize connections: load the static trade partners dataset.
 */
export async function initConnections() {
    try {
        const res = await fetch(CONFIG.api.tradePartners);
        _tradeData = await res.json();
    } catch (err) {
        console.error('Failed to load trade partners data:', err);
    }
}

/**
 * Show trade connection arcs for a country.
 * @param {string} iso - ISO_A2 code of the selected country
 * @param {number} lat - latitude of clicked point
 * @param {number} lng - longitude of clicked point
 * @returns {Array|null} - partner list for panel rendering, or null
 */
export function showConnections(iso, lat, lng) {
    const world = getGlobe();
    if (!world || !_tradeData) return null;

    const entry = _tradeData[iso];
    if (!entry || !entry.partners || entry.partners.length === 0) {
        clearConnections();
        return null;
    }

    const cfg = CONFIG.connections;
    const partners = entry.partners;

    // Find max volume for relative stroke scaling
    const maxVolume = Math.max(...partners.map(p => p.volume));

    // Build arcs
    const arcs = partners.map(p => {
        const dest = getCountryCoords(p.iso);
        if (!dest) return null;

        const relativeStroke = cfg.arcStrokeMin +
            (p.volume / maxVolume) * (cfg.arcStrokeMax - cfg.arcStrokeMin);

        return {
            startLat: lat,
            startLng: lng,
            endLat: dest.lat,
            endLng: dest.lng,
            color: cfg.arcColor,
            stroke: relativeStroke,
            partnerName: p.name,
            volume: p.volume,
        };
    }).filter(Boolean);

    // Build rings at arc endpoints
    const rings = arcs.map(a => ({
        lat: a.endLat,
        lng: a.endLng,
        maxR: cfg.ringMaxRadius,
        propagationSpeed: cfg.ringPropagationSpeed,
        repeatPeriod: cfg.ringRepeatPeriod,
        color: cfg.ringColor,
    }));

    // Apply arcs to globe
    world
        .arcsData(arcs)
        .arcStartLat('startLat')
        .arcStartLng('startLng')
        .arcEndLat('endLat')
        .arcEndLng('endLng')
        .arcColor('color')
        .arcStroke('stroke')
        .arcDashLength(cfg.arcDashLength)
        .arcDashGap(cfg.arcDashGap)
        .arcDashAnimateTime(cfg.arcDashAnimateTime);

    // Apply connection rings via coordinator
    updateRings('connections', rings);

    return partners;
}

/**
 * Clear all connection arcs and their endpoint rings.
 */
export function clearConnections() {
    const world = getGlobe();
    if (!world) return;

    world.arcsData([]);
    updateRings('connections', []);
}
