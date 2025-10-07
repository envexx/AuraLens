# AuraLens – DeFi Portfolio Companion (Chrome Extension)

<div align="center">
  <img src="assets/logo.svg" alt="AuraLens" width="140" height="140" />
  <br/>
  <em>AI‑assisted DeFi portfolio insights and strategy recommendations powered by AdEx AURA.</em>
</div>

[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Manifest%20V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![Tech](https://img.shields.io/badge/Canvas-Chart-blue.svg)](#)
[![AURA API](https://img.shields.io/badge/Powered%20by-AdEx%20AURA-1E40AF.svg)](https://aura.adex.network)

AuraLens analyzes your DeFi portfolio using AdEx AURA and presents clear, actionable strategy cards (APY, risk, notes) directly in the wallet popup.

## Folder Structure

```
extension/
  assets/
    logo.svg
  popup/
    popup.html
  scripts/
    popup.js
  styles/
    popup.css
  manifest.json
  README.md
```

## Features
- MV3 popup UI (Inter), Light/Dark themes, blue‑dark accent
- Wallets modal: add, select active, remove (persisted via `chrome.storage.local`)
- Persists `activeWalletIndex` and theme
- AURA integration:
  - `GET /api/portfolio/balances` (tokens with `balanceUSD`)
  - `GET /api/portfolio/strategies` (recommended strategies)
  - Host permission: `https://aura.adex.network/*`
- Doughnut portfolio chart (custom Canvas, no external libs) from top `balanceUSD` tokens
- Strategy cards: risk badge, colored chips (APY, Platforms, Networks, Operations), separate Note box
- Loading skeletons and error state; no dummy data in production
- Assets tab: tokens sorted by USD with amount and USD value
- Scrollable `#mainApp`; larger, readable chart

## Install (Chrome/Edge)
1) Open `chrome://extensions` (Edge: `edge://extensions`)
2) Enable Developer mode
3) Click “Load unpacked” → select `extension/`
4) Pin the extension and open the popup

Permissions:
- `storage` (menyimpan wallets & preferensi tema)
- `https://aura.adex.network/*` (fetch balances & strategies)

## Usage
1) Click the wallet icon → Wallets modal
2) Add an address (0x...), then Select to set active
3) Doughnut chart, Assets, and Strategies update automatically from AURA
4) Open popup DevTools (Right click → Inspect) to see logs:
   - `[AURA] Balances response: …`
   - `[AURA] Strategies response: …`

## Development
- No build step; edit directly:
  - UI: `popup/popup.html`, `styles/popup.css`
  - Logic/API: `scripts/popup.js`
- Canvas chart renderer (no Chart.js)
- Optional: wire an API key in Settings and forward via fetch (`apiKey`)

## Troubleshooting
- Empty chart: ensure an active wallet is selected and AURA API is reachable
- Missing data: check popup console for HTTP errors (429/500) or rate limit
- Host permission: ensure `https://aura.adex.network/*` is in `manifest.json`

## License
MIT

