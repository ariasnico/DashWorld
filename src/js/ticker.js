/**
 * CORDIS DIE // News Ticker Module
 * Fetches world headlines and displays them in the bottom scrolling bar.
 */

import { CONFIG } from './config.js';

const tickerEl = document.getElementById('globalTicker');

/**
 * Load global headlines from Google News RSS via rss2json proxy.
 */
export function loadGlobalTicker() {
    const { language, country, globalHeadlineCount } = CONFIG.news;
    const rssUrl = `${CONFIG.api.googleNewsRss}/headlines/section/topic/WORLD?hl=${language}&gl=${country}&ceid=${country}:${language}`;
    const proxyUrl = `${CONFIG.api.rss2json}${encodeURIComponent(rssUrl)}`;

    fetch(proxyUrl)
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                const headlines = data.items
                    .slice(0, globalHeadlineCount)
                    .map(i => i.title.toUpperCase())
                    .join('  ///  ');
                tickerEl.innerText = `/// ALERTAS GLOBALES /// ${headlines} /// SATELITE ODIN EN LINEA ///`;
            }
        })
        .catch(() => {
            /* Silently keep the default ticker text on failure */
        });
}

/**
 * Update the ticker with a country-specific breaking headline.
 * @param {string} countryName
 * @param {string} headline
 */
export function updateTickerWithCountry(countryName, headline) {
    tickerEl.innerText = `/// ULTIMA INTERCEPCION EN ${countryName.toUpperCase()}: ${headline.toUpperCase()} ///`;
}
