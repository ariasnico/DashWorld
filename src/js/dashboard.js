/**
 * CORDIS DIE // Dashboard / Intel Panel Module
 * Handles country data fetching (RestCountries, World Bank, Google News)
 * and renders the side intel panel.
 */

import { CONFIG } from './config.js';
import { updateTickerWithCountry } from './ticker.js';
import { showConnections } from './connections.js';

// --- DOM References ---
const panel = document.getElementById('intelPanel');
const factsList = document.getElementById('factsList');
const newsList = document.getElementById('newsList');
const connectionsList = document.getElementById('connectionsList');
const pCountry = document.getElementById('pCountry');
const pCoords = document.getElementById('pCoords');

// Abort controller to cancel in-flight requests on rapid clicks
let currentFetchController = null;

/**
 * Open the panel and populate it with country intelligence.
 * @param {object} props - GeoJSON feature properties
 * @param {number} lat
 * @param {number} lng
 */
export async function updateDashboard(props, lat, lng) {
    const name = props.ADMIN;
    const iso = (props.ISO_A2 && props.ISO_A2 !== '-99') ? props.ISO_A2 : null;

    // Header
    pCountry.innerText = name;
    pCoords.innerText = `LAT: ${lat.toFixed(4)} // LNG: ${lng.toFixed(4)}`;

    // Loading states
    factsList.innerHTML = '<li class="decrypting">[>>] DESENCRIPTANDO RED ESTATAL Y BANCO MUNDIAL...</li>';
    newsList.innerHTML = '<li class="decrypting">[>>] INTERCEPTANDO TRANSMISIONES LOCALES...</li>';
    connectionsList.innerHTML = '<li class="decrypting">[>>] ANALIZANDO RED COMERCIAL...</li>';
    panel.classList.add('active');

    // Show trade connection arcs on globe + render partner list
    renderConnections(iso, lat, lng);

    // Cancel previous in-flight requests
    if (currentFetchController) currentFetchController.abort();
    currentFetchController = new AbortController();
    const { signal } = currentFetchController;

    try {
        await Promise.all([
            fetchMacroData(props, iso, signal),
            fetchNews(name, signal),
        ]);
    } catch (e) {
        if (e.name === 'AbortError') return;
        newsList.innerHTML = '<li><span style="color:var(--danger); font-weight:bold;">[!] FIREWALL ESTATAL DETECTADO. CONEXION RECHAZADA.</span></li>';
    }
}

/**
 * Close the intel panel.
 */
export function closePanel() {
    panel.classList.remove('active');
}

// --- Private Helpers ---

/**
 * Show trade arcs on globe and render partner list in the panel.
 */
function renderConnections(iso, lat, lng) {
    if (!iso) {
        connectionsList.innerHTML = '<li><span style="color:#888;">[!] CODIGO ISO NO DISPONIBLE</span></li>';
        return;
    }

    const partners = showConnections(iso, lat, lng);

    if (!partners || partners.length === 0) {
        connectionsList.innerHTML = '<li><span style="color:#888;">[!] RED COMERCIAL NO DISPONIBLE PARA ESTE OBJETIVO</span></li>';
        return;
    }

    const maxVolume = Math.max(...partners.map(p => p.volume));

    connectionsList.innerHTML = partners.map(p => {
        const pct = ((p.volume / maxVolume) * 100).toFixed(0);
        return `
            <li>
                <div class="connection-item">
                    <div class="connection-item__header">
                        <span class="connection-item__name">${p.name.toUpperCase()}</span>
                        <span class="connection-item__volume">$${p.volume.toFixed(1)}B USD</span>
                    </div>
                    <div class="connection-bar">
                        <div class="connection-bar__fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            </li>
        `;
    }).join('');
}

/**
 * Fetch macroeconomic data from RestCountries + World Bank.
 */
async function fetchMacroData(props, iso, signal) {
    let capital = 'CLASIFICADO';
    let pop = props.POP_EST ? props.POP_EST.toLocaleString('es-ES') : 'CLASIFICADO';
    let currency = 'CLASIFICADO';
    let gdpText = props.GDP_MD_EST
        ? `$${(props.GDP_MD_EST / 1000).toFixed(2)} BILLONES USD`
        : 'CLASIFICADO';

    if (iso) {
        // RestCountries — demographics
        try {
            const resCountry = await fetch(`${CONFIG.api.restCountries}${iso}`, { signal });
            const dataCountry = (await resCountry.json())[0];
            if (dataCountry.capital) capital = dataCountry.capital[0];
            if (dataCountry.population) pop = dataCountry.population.toLocaleString('es-ES');
            if (dataCountry.currencies) currency = Object.values(dataCountry.currencies)[0].name;
        } catch (_) { /* use fallback values */ }

        // World Bank — GDP
        try {
            const resWb = await fetch(
                `${CONFIG.api.worldBank}${iso}${CONFIG.api.worldBankIndicator}`,
                { signal }
            );
            const dataWb = await resWb.json();
            if (dataWb[1]?.[0]?.value) {
                const val = dataWb[1][0].value;
                if (val >= 1e12) gdpText = `$${(val / 1e12).toFixed(2)} BILLONES USD`;
                else if (val >= 1e9) gdpText = `$${(val / 1e9).toFixed(2)} MIL MILLONES USD`;
                else gdpText = `$${(val / 1e6).toFixed(2)} MILLONES USD`;
            }
        } catch (_) { /* use fallback values */ }
    }

    factsList.innerHTML = `
        <li><span class="data-label">CAPITAL:</span> <span class="data-value">${capital.toUpperCase()}</span></li>
        <li><span class="data-label">POBLACION CIVIL:</span> <span class="data-value">${pop}</span></li>
        <li><span class="data-label">SISTEMA FIAT:</span> <span class="data-value data-value--accent">${currency.toUpperCase()}</span></li>
        <li><span class="data-label">PIB (BANCO MUNDIAL):</span> <span class="data-value">${gdpText}</span></li>
    `;
}

/**
 * Fetch live news via Google News RSS through rss2json proxy.
 */
async function fetchNews(name, signal) {
    const query = `"${name}" (economia OR politica OR crisis)`;
    const { language, country, countryNewsCount } = CONFIG.news;
    const rssUrl = `${CONFIG.api.googleNewsRss}/search?q=${encodeURIComponent(query)}&hl=${language}&gl=${country}&ceid=${country}:${language}`;
    const proxyUrl = `${CONFIG.api.rss2json}${encodeURIComponent(rssUrl)}`;

    const resNews = await fetch(proxyUrl, { signal });
    const newsData = await resNews.json();

    if (newsData.status === 'ok' && newsData.items?.length > 0) {
        const html = newsData.items.slice(0, countryNewsCount).map(item => {
            const titleParts = item.title.split(' - ');
            const source = titleParts.length > 1 ? titleParts.pop() : 'INTELIGENCIA ABIERTA';
            const cleanTitle = titleParts.join(' - ');

            return `
                <li>
                    <span class="meta-tag">INTEL: ${source.toUpperCase()} // ESTADO: VERIFICADO</span>
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer">${cleanTitle.toUpperCase()}</a>
                </li>
            `;
        }).join('');

        newsList.innerHTML = html;
        updateTickerWithCountry(name, newsData.items[0].title);
    } else {
        newsList.innerHTML = '<li><span style="color:var(--danger); font-weight:bold;">[!] APAGON MEDIATICO. NO SE DETECTAN TRANSMISIONES VALIDAS.</span></li>';
    }
}
