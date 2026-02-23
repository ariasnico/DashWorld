/**
 * CORDIS DIE // Seismic Events Module
 * Fetches real-time earthquake data from USGS and renders point markers
 * with pulsing rings on the 3D globe.
 */

import { CONFIG } from './config.js';
import { getGlobe, updateRings } from './globe.js';

let _refreshTimer = null;

/**
 * Initialize seismic event monitoring: fetch once, then auto-refresh.
 */
export function initEvents() {
    fetchEarthquakes();
    _refreshTimer = setInterval(fetchEarthquakes, CONFIG.events.refreshInterval);
}

/**
 * Fetch earthquake GeoJSON from USGS and render on the globe.
 */
async function fetchEarthquakes() {
    const world = getGlobe();
    if (!world) return;

    try {
        const res = await fetch(CONFIG.api.usgsEarthquakes);
        const data = await res.json();
        const features = data.features || [];

        const cfg = CONFIG.events;

        // Build point markers
        const points = features.map(f => {
            const [lng, lat, depth] = f.geometry.coordinates;
            const mag = f.properties.mag;
            const place = f.properties.place || 'UBICACION DESCONOCIDA';
            const time = new Date(f.properties.time);
            const zuluTime = time.toISOString().replace('T', ' ').slice(0, 19) + 'Z';

            let color = cfg.colors.minor;
            if (mag >= cfg.thresholds.major) color = cfg.colors.major;
            else if (mag >= cfg.thresholds.moderate) color = cfg.colors.moderate;

            return {
                lat,
                lng,
                size: mag * cfg.magnitudeRadiusScale,
                color,
                mag,
                place,
                depth,
                zuluTime,
            };
        });

        // Build seismic rings for significant quakes
        const rings = features
            .filter(f => f.properties.mag >= cfg.ringThreshold)
            .map(f => {
                const [lng, lat] = f.geometry.coordinates;
                const mag = f.properties.mag;

                let color = cfg.colors.moderate;
                if (mag >= cfg.thresholds.major) color = cfg.colors.major;

                return {
                    lat,
                    lng,
                    maxR: cfg.ringMaxRadius,
                    propagationSpeed: cfg.ringPropagationSpeed,
                    repeatPeriod: cfg.ringRepeatPeriod,
                    color,
                };
            });

        // Apply point markers
        world
            .pointsData(points)
            .pointLat('lat')
            .pointLng('lng')
            .pointRadius('size')
            .pointColor('color')
            .pointAltitude(cfg.pointAltitude)
            .pointLabel(d => `
                <div class="event-tooltip">
                    <div class="event-tooltip__header">ALERTA SISMICA</div>
                    <div class="event-tooltip__row">
                        <span class="event-tooltip__label">UBICACION:</span>
                        <span class="event-tooltip__value">${d.place.toUpperCase()}</span>
                    </div>
                    <div class="event-tooltip__row">
                        <span class="event-tooltip__label">MAGNITUD:</span>
                        <span class="event-tooltip__value event-tooltip__value--mag">${d.mag.toFixed(1)}</span>
                    </div>
                    <div class="event-tooltip__row">
                        <span class="event-tooltip__label">PROFUNDIDAD:</span>
                        <span class="event-tooltip__value">${d.depth.toFixed(1)} KM</span>
                    </div>
                    <div class="event-tooltip__row">
                        <span class="event-tooltip__label">HORA ZULU:</span>
                        <span class="event-tooltip__value">${d.zuluTime}</span>
                    </div>
                </div>
            `);

        // Apply seismic rings via coordinator
        updateRings('events', rings);

        // Configure ring appearance
        world
            .ringColor(() => t => `rgba(255, 0, 60, ${1 - t})`)
            .ringMaxRadius('maxR')
            .ringPropagationSpeed('propagationSpeed')
            .ringRepeatPeriod('repeatPeriod');

    } catch (err) {
        console.error('Failed to fetch earthquake data:', err);
    }
}
