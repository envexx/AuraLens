# AuraLens Landing Page

This is a static responsive landing page for AuraLens - DeFi Portfolio Companion.

## Structure

```
landing/
  index.html
  styles/
    style.css
  scripts/
    main.js
  assets/
    logo.svg
    hero-extension.png
    demo.gif
    features/
      overview.svg
      ai.svg
      risk.svg
      ux.svg
```

## Run Locally
- Option 1: Open `index.html` directly in your browser
- Option 2: Serve locally (recommended for CORS):
  - Python: `python -m http.server 8080` then open `http://localhost:8080/landing/`
  - Node: `npx serve .` then navigate to `/landing`

## Notes
- No frameworks or CDNs; pure HTML/CSS/JS
- Theme toggle stored in `localStorage`
- Replace placeholder images (`hero-extension.png`, `demo.gif`) with real assets when available

