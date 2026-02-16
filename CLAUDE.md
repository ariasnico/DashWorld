# CORDIS DIE - Global Surveillance Dashboard

## Project Overview

CORDIS DIE is a tactical-themed global news dashboard. It renders an interactive 3D globe (globe.gl + Three.js) where users click on countries to view macroeconomic data (RestCountries API, World Bank API) and live news headlines (Google News RSS via rss2json proxy). The UI uses a military/CRT aesthetic with scanline overlays, vignette effects, and an Orbitron display font.

## Tech Stack

- **Runtime**: Vanilla JS (ES Modules), no build step, no framework
- **3D**: Three.js r0.146 + globe.gl v2.28 (loaded via unpkg CDN)
- **Styling**: Pure CSS with `@import` aggregation, CSS custom properties for theming
- **APIs**: RestCountries v3.1, World Bank v2, Google News RSS (proxied through rss2json)
- **Hosting**: Vercel (static site)
- **Fonts**: Google Fonts — Orbitron (display), Share Tech Mono (monospace)

## Project Structure

```
index.html                    # Single-page entry point
src/
├── css/
│   ├── variables.css         # Design tokens (colors, spacing, z-index, dimensions)
│   ├── base.css              # CSS reset and global styles
│   ├── main.css              # @import aggregator (load order matters)
│   ├── responsive.css        # Breakpoints: 768px (tablet), 480px (mobile), landscape
│   └── components/
│       ├── effects.css       # Scanlines, vignette, blink/pulse animations
│       ├── globe.css         # Globe container positioning
│       ├── header.css        # HUD header bar with clip-path
│       ├── intel-panel.css   # Side panel (country data + news)
│       ├── loader.css        # Boot screen with progress bar
│       └── ticker.css        # Bottom scrolling news ticker
└── js/
    ├── app.js                # Entry point — bootstraps all modules
    ├── config.js             # Centralized constants, API URLs, settings
    ├── clock.js              # ZULU (UTC) clock in header
    ├── dashboard.js          # Intel panel: fetches country data + news, renders HTML
    ├── globe.js              # Globe initialization, polygon interactions, camera control
    ├── loader.js             # Boot loader with fallback timeout
    └── ticker.js             # Bottom ticker: fetches global headlines
```

## Architecture Notes

- **Module pattern**: All JS uses ES modules (`import`/`export`). `app.js` is the entry point loaded with `type="module"`.
- **No bundler**: CSS uses native `@import` chains; JS uses native ES module imports. No webpack/vite/rollup.
- **DOM references**: Each module grabs its own DOM elements at the top level on import. This means modules must be loaded after DOM is ready (handled in `app.js`).
- **AbortController**: `dashboard.js` uses an AbortController to cancel in-flight fetch requests when users rapidly click different countries.
- **Config-driven**: All API endpoints, globe settings, animation durations, and news parameters are centralized in `config.js`.

## Key Conventions

- **CSS**: BEM-like naming (`intel-panel__title`, `sys-status__defcon`). All design tokens in `variables.css`.
- **Language**: UI text is in Spanish. Code comments and identifiers are in English.
- **Theming**: Orange (`--primary: #ff8c00`) as main color, cyan (`--accent: #00f3ff`) for highlights, red (`--danger: #ff003c`) for alerts.

## Development

```bash
# Local dev server (any static server works)
npx serve .

# Deploy
vercel
```

## Common Tasks

- **Add a new data source**: Add the API URL to `config.js`, create a fetch function in `dashboard.js`, wire it into the `Promise.all` in `updateDashboard()`.
- **Add a new CSS component**: Create `src/css/components/name.css`, add `@import` in `main.css` (before `responsive.css`).
- **Change globe appearance**: Modify `CONFIG.globe` in `config.js`.
- **Change news settings**: Modify `CONFIG.news` in `config.js`.
