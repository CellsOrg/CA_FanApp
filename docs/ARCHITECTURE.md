# Architecture

## Overview

Cloud Alpacas Fan App is a static single-page app. `index.html` is a thin shell
(`<div id="app">` plus stylesheet/script tags) — every screen is rendered
client-side by JavaScript into that one div.

## File structure

```
index.html
assets/
  css/
    tokens.css       CSS custom properties: color, spacing, radius, typography, z-index
    base.css         reset, typography utility classes, .screen show/hide, keyframes
    components.css   shared component classes (.btn, .card, .chip, .segmented, .product-grid, ...)
    pages.css        per-screen layout (#login, #signup, #my-page, ...)
  js/
    app.js           APP state, screen render functions, event handlers, init
    components.js    shared render functions reused across screens
    utils.js         formatPrice/formatDate, navigateTo, toast, chip/checkbox helpers, trackEngagement
  images/             image assets
data/
  dummy-data.js       DATA object: demo fan, players, games, products, orders, notifications, benefits
docs/                 this folder
```

## Load order (`index.html`)

- CSS: `tokens.css` → `base.css` → `components.css` → `pages.css` (later files may override earlier rules)
- JS: `data/dummy-data.js` → `utils.js` → `components.js` → `app.js` (`app.js` reads `DATA` and calls
  helpers from the other two, so it must load last)

## Runtime model

- **`DATA`** (`data/dummy-data.js`) is a static, mutable in-memory object standing in for the
  eventual Salesforce-backed API. Screens read from it directly; handlers mutate it in place
  (e.g. `DATA.orders.unshift(...)` on purchase, `benefit.status = 'Used'` on benefit use).
- **`APP`** (`assets/js/app.js`) holds ephemeral UI state: current selections (`selectedGame`,
  `selectedProduct`, `selectedQuantity`), which purchase flow is active (`purchaseType`), which
  tab/category is active, and in-progress signup form data.
- All 11 screens are rendered **once** into `#app` on `DOMContentLoaded` (`initApp()`), each
  wrapped in `<div class="screen" id="...">`. Only one is visible at a time via the
  `.screen.active` rule in `base.css` (`display:none` otherwise) — switching screens is just
  toggling that class, nothing is destroyed or recreated. A few panels re-render their own
  content in place when their state changes (ticket tab content, goods grid, player grid,
  purchase-confirm content) via dedicated `render*Content()` functions.
- **`navigateTo(screenId, pushHistory = true)`** (`utils.js`) is the single navigation entry
  point: toggles `.active`, updates the bottom-nav active item, shows/hides the bottom nav for
  no-nav screens, pushes `history.pushState`, and fires a `trackEngagement('App Screen View', ...)`
  signal. Browser back/forward is handled by a `popstate` listener that replays `navigateTo`
  without pushing history again.

## Deviation from the original `pages/` + `components/` file-split

`to은영CLUADE.md`'s original rule set describes `pages/*.html` (page-specific markup) and
`components/*.html` (shared markup) loaded at runtime via a `loadComponent()` fetcher. The actual
implementation took a different route: every screen and every shared UI piece is a JS function
that returns an HTML string (`render*()` in `app.js` / `components.js`), assembled once into
`#app` instead of fetched as separate `.html` fragments. See `REFACTOR_DECISIONS.md` for the
reasoning and for how this still satisfies the "write shared UI once, reuse it everywhere" rule.

## Screen inventory

| screen id | renderer | reachable from |
|---|---|---|
| `splash` | `renderSplash()` | app load |
| `login` | `renderLogin()` | splash tap, logout |
| `signup` | `renderSignup()` | login → "회원가입" |
| `favorite-player` | `renderFavoritePlayer()` | signup submit |
| `ticket` | `renderTicketPage()` | login submit, bottom nav, favorite-player submit/skip |
| `goods` | `renderGoodsPage()` | bottom nav |
| `checkin` | `renderCheckinPage()` | bottom nav |
| `my-page` | `renderMyPage()` | bottom nav |
| `notifications` | `renderNotificationsPage()` | my-page "🔔 알림" |
| `benefits` | `renderBenefitsPage()` | my-page "🎁 혜택" |
| `purchase-confirm` | `renderPurchaseConfirm()` | ticket/goods "구매하기" |

## Purchase flow (shared across Ticket / Membership / Season Pass / Goods)

1. User selects a product card (and, on the Ticket tab, a game) → `APP.selectedProduct` /
   `selectedGame` set, `APP.purchaseType` set to one of `'Ticket Purchase' | 'Membership
   Enrollment' | 'Season Pass' | 'Goods Purchase'`, footer CTA revealed.
2. "구매하기" → `navigateTo('purchase-confirm')` + `renderPurchaseConfirmContent()`, which
   branches on `APP.purchaseType` to look up the product (and game, for tickets) and render
   quantity/total.
3. "결제하기" → `confirmPurchase()`: logs an Order/OrderItem-shaped object, prepends a row to
   `DATA.orders`, resets `APP` selection state, hides the originating footer CTA, re-renders that
   grid (clearing stale `.is-selected` state), and routes back to `goods` or `ticket` depending on
   which flow it was.
