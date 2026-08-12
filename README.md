# Cloud Alpacas Fan App

A fan-facing mobile web app for Cloud Alpacas: login/signup, favorite-player selection, ticket /
membership / season-pass purchase, a goods store, stadium QR check-in, and a personal "마이"
status page. It's the demo-data-generation channel for the team's Salesforce project — actions
taken here are meant to mirror the Order/OrderItem/Admission__c/Benefit__c/etc. records that
would eventually be created via a real Salesforce integration. The feature-to-object mapping and
demo-scene walkthrough live in the team's Salesforce project docs (not in this repo).

Currently frontend-only: all "→ Object__c" comments in the JS mark a `console.log` call standing
in for a future Salesforce API call. See `docs/REFACTOR_DECISIONS.md` §4 for known gaps.

## Running it

Static site, no build step:

```bash
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

## Structure

See `docs/ARCHITECTURE.md` for the full breakdown (render model, screen list, purchase flow).
Short version:

```
index.html            app shell
assets/css/           tokens.css → base.css → components.css → pages.css
assets/js/            dummy-data.js → utils.js → components.js → app.js
assets/images/         image assets
data/dummy-data.js     demo data (fan, players, games, products, orders, ...)
docs/                  ARCHITECTURE / COMPONENT_MAP / DESIGN_SYSTEM / REFACTOR_DECISIONS
```

## Docs

- `docs/ARCHITECTURE.md` — render model, screen inventory, purchase flow
- `docs/COMPONENT_MAP.md` — shared JS render functions and CSS component classes (check before
  adding new markup)
- `docs/DESIGN_SYSTEM.md` — color/spacing/type tokens, dark/light theme
- `docs/REFACTOR_DECISIONS.md` — why the structure deviates from `to은영CLUADE.md`'s original
  `pages/`+`components/` split, plus a changelog of notable bug fixes

`to은영CLUADE.md` is the project's dev-rules doc (reuse → extend → create, no duplicated
HTML/CSS/JS, keep docs in sync with architecture) and still governs how changes here should be
made.
