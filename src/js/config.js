/**
 * CORDIS DIE // Global Configuration
 * Centralized constants, API endpoints, and settings.
 */

export const CONFIG = {
    globe: {
        backgroundColor: '#050505',
        earthTexture: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
        skyTexture: 'https://unpkg.com/three-globe/example/img/night-sky.png',
        atmosphereColor: '#ff8c00',
        atmosphereAltitude: 0.15,
        initialView: { lat: 20, lng: 0, altitude: 2.5 },
        focusAltitude: 1.5,
        autoRotateSpeed: 0.5,
        dampingFactor: 0.1,
        polygonHoverColor: 'rgba(255, 140, 0, 0.4)',
        polygonBaseColor: 'rgba(20, 20, 20, 0.6)',
        polygonSideColor: 'rgba(255, 140, 0, 0.05)',
        polygonStrokeColor: '#ff8c00',
        polygonBaseAltitude: 0.01,
        polygonHoverAltitude: 0.08,
    },

    api: {
        countriesGeoJson: 'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson',
        restCountries: 'https://restcountries.com/v3.1/alpha/',
        worldBank: 'https://api.worldbank.org/v2/country/',
        worldBankIndicator: '/indicator/NY.GDP.MKTP.CD?format=json&mrnev=1',
        rss2json: 'https://api.rss2json.com/v1/api.json?rss_url=',
        googleNewsRss: 'https://news.google.com/rss',
        usgsEarthquakes: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
        tradePartners: 'data/trade-partners.json',
    },

    news: {
        globalHeadlineCount: 10,
        countryNewsCount: 5,
        language: 'es-419',
        country: 'US',
    },

    connections: {
        arcColor: '#00f3ff',
        arcDashLength: 0.4,
        arcDashGap: 0.2,
        arcDashAnimateTime: 1500,
        arcStrokeMin: 0.5,
        arcStrokeMax: 2.5,
        ringColor: 'rgba(0, 243, 255, 0.6)',
        ringMaxRadius: 2,
        ringPropagationSpeed: 2,
        ringRepeatPeriod: 800,
    },

    events: {
        refreshInterval: 300000,
        magnitudeRadiusScale: 0.3,
        ringThreshold: 5.5,
        ringMaxRadius: 6,
        ringPropagationSpeed: 3,
        ringRepeatPeriod: 1200,
        colors: {
            minor: '#ffcc00',
            moderate: '#ff8c00',
            major: '#ff003c',
        },
        thresholds: {
            moderate: 5.5,
            major: 7.0,
        },
    },

    loader: {
        fallbackTimeout: 5000,
        errorDisplayDelay: 1500,
    },

    animations: {
        focusDuration: 1500,
        resetDuration: 2000,
    },
};
