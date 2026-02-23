# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CORDIS DIE is a tactical-themed global news dashboard. It renders an interactive 3D globe (globe.gl + Three.js) where users click countries to view macroeconomic data (RestCountries API, World Bank API) and live news headlines (Google News RSS via rss2json proxy). The UI uses a military/CRT aesthetic with scanline overlays, vignette effects, and Orbitron display font. UI text is in Spanish; code identifiers and comments are in English.

## Development

```bash
# Local dev server (any static server works)
npm run dev        # runs: npx serve .
```

No build step, no bundler, no test framework. Deployed as a static site on Vercel.

## Architecture

- **No framework**: Vanilla JS with native ES Modules, pure CSS with native `@import` chains.
- **Entry point**: `index.html` loads CDN libraries (Three.js, globe.gl, Fuse.js) then `src/js/app.js` as `type="module"`.
- **Bootstrap flow**: `app.js` → `initLoaderFallback()` → `initGlobe()` → on globe ready, `initSearch()` is registered as callback → `loadGlobalTicker()` → `startClock()`.
- **Config-driven**: All API endpoints, globe settings, animation durations, and news parameters live in `config.js` under a single `CONFIG` object.
- **DOM references**: Each module grabs its own DOM elements at the top level on import. Modules must load after DOM is ready (handled in `app.js`).
- **AbortController**: `dashboard.js` cancels in-flight requests when users rapidly click different countries to prevent race conditions.

### Module Responsibilities

| Module | Role |
|--------|------|
| `app.js` | Bootstrap & event wiring |
| `config.js` | Centralized constants & API URLs |
| `globe.js` | 3D globe init, polygon interactions, camera control |
| `dashboard.js` | Intel panel: fetches country data + news, renders HTML |
| `search.js` | Fuzzy country search (Fuse.js) with keyboard navigation |
| `ticker.js` | Bottom headline ticker (global + country-specific) |
| `loader.js` | Boot screen with fallback timeout |
| `clock.js` | ZULU (UTC) clock display |

### CSS Architecture

- BEM-like naming: `.intel-panel__title`, `.search-widget__result-item--active`
- All design tokens centralized in `src/css/variables.css` (colors, spacing, z-index, dimensions)
- Component styles in `src/css/components/`, aggregated via `@import` in `main.css`
- `responsive.css` must be imported last (breakpoints: 768px tablet, 480px mobile, landscape)
- Theming: orange `--primary`, cyan `--accent`, red `--danger`, near-black `--bg-dark`

## Common Tasks

- **Add a new data source**: Add API URL to `config.js`, create fetch function in `dashboard.js`, wire into the `Promise.all` in `updateDashboard()`.
- **Add a new CSS component**: Create `src/css/components/name.css`, add `@import` in `main.css` before `responsive.css`.
- **Change globe appearance or news settings**: Modify `CONFIG.globe` or `CONFIG.news` in `config.js`.
