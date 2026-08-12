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
  (e.g. `DATA.orders.unshift(...)` on purchase, `benefit.status = 'Used'` on benefit/coupon use,
  `DATA.fanStats.membership` / `.seasonPass` on the matching purchase type).
- **`APP`** (`assets/js/app.js`) holds ephemeral UI state:
  - selection in progress: `selectedGame`, `selectedProduct`, `selectedQuantity`, `purchaseType`
    (`'Ticket Purchase' | 'Membership Enrollment' | 'Season Pass' | 'Goods Purchase'`)
  - navigation/filter state: `ticketTab`, `goodsChannel`, `goodsCategory`, `selectedPlayer`
  - **cart**: `cart` (array of line items, see below), `addToCartOrigin` (`'ticket' | 'goods'`,
    used so "더 둘러보기" can return to wherever the item was added from), `purchaseMode`
    (`'direct' | 'cart'`, which checkout path `purchase-confirm` is currently rendering)
  - **checkout**: `selectedPaymentMethod`, `appliedCoupon` (a `Benefit__c` id)
  - **jersey/jacket customization**: `selectedSize`, `selectedMarkingPlayer` (direct-purchase path
    only — cart line items carry their own `size`/`markingPlayer` instead), `pendingCartAction`
    (`'buyNow' | 'addToCart'`, which action to resume once the size/marking modal is confirmed)
  - in-progress signup form data (`signupData`)
- All 12 screens are rendered **once** into `#app` on `DOMContentLoaded` (`initApp()`), each
  wrapped in `<div class="screen" id="...">`. Only one is visible at a time via the
  `.screen.active` rule in `base.css` (`display:none` otherwise) — switching screens is just
  toggling that class, nothing is destroyed or recreated. Most panels re-render their own content
  in place when their state changes (ticket tab content, goods grid, player grid, cart page,
  purchase-confirm content) via dedicated `render*Content()` functions.
  - **Exception: My page.** Unlike every other screen, My page's dynamic parts (the stat grid and
    the recent-purchases list) are re-rendered on *every visit*, not just when their own state
    changes — see "My page live refresh" below.
- **`navigateTo(screenId, pushHistory = true)`** (`utils.js`) is the single navigation entry
  point: toggles `.active`, refreshes My page's content if that's the target (see below), updates
  the bottom-nav active item, shows/hides the bottom nav for no-nav screens, pushes
  `history.pushState`, and fires a `trackEngagement('App Screen View', ...)` signal. Browser
  back/forward is handled by a `popstate` listener that replays `navigateTo` without pushing
  history again.

## My page live refresh

Every other screen is safe to render once at init because its content only changes in response to
its own on-screen interactions (tapping a tab, selecting a product). My page is different: its
stat grid (멤버십/시즌권/티켓/관람) and recent-purchases list summarize activity that happens on
*other* screens (a purchase completed on Ticket/Goods, a check-in on Check-in). Rendering it once
at init means it would go stale the first time the user buys something after landing there once.

The fix: `renderMyPage()` only returns the static shell (profile row, favorite-player banner,
quick links) plus two empty containers — `#my-stat-grid` and `#my-purchases-list`.
`renderMyPageContent()` fills those in from the current `DATA.fanStats` / `DATA.orders`, and is
called both once at init and every time `navigateTo('my-page')` runs (that call is hard-coded
into `navigateTo()` itself in `utils.js`, since My page is reachable from the generic bottom-nav
click handler rather than a dedicated `goToMyPage()`-style function). Net effect: the numbers and
list are always current as of the moment the user opens the tab.

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
| `purchase-confirm` | `renderPurchaseConfirm()` | ticket/goods "바로 결제하기", cart "결제하기" |
| `cart` | `renderCartPage()` | cart icon (ticket/goods header), add-to-cart modal "장바구니 가기" |

## Purchase flow

Ticket / Membership / Season Pass / Goods selection all funnel into the same footer CTA and the
same `purchase-confirm` screen; Goods additionally branches through a size/marking step for
jersey and jacket products.

### 1. Selecting a product

Selecting a product card (and, on the Ticket tab, a game) sets `APP.selectedProduct` /
`selectedGame` and `APP.purchaseType`, then reveals the footer CTA — which is always the same two
buttons, `renderCheckoutButtons()`: **"장바구니에 담기"** and **"바로 결제하기"**.

### 2a. "바로 결제하기" (direct purchase) — `handleBuyNow()`

If the selected product `requiresSizeAndMarking()` (i.e. has a `sizes` array in `DATA.goods` —
currently the home/away jersey and the jacket), the size/marking modal opens first (see below)
with `APP.pendingCartAction = 'buyNow'`; otherwise it goes straight to `proceedBuyNow()`, which
sets `APP.purchaseMode = 'direct'`, resets quantity/payment-method/coupon, and navigates to
`purchase-confirm`.

### 2b. "장바구니에 담기" (add to cart) — `addCurrentSelectionToCart()`

Same size/marking gate as above (`APP.pendingCartAction = 'addToCart'` if needed), otherwise goes
straight to `proceedAddToCart(product, game, size, markingPlayer)`, which pushes a line item onto
`APP.cart`:

```js
{ cartId, purchaseType, product, game, quantity: 1, size, markingPlayer }
```

...updates the cart badge (`updateCartBadges()`, sums `quantity` across the cart and paints it
onto every `.cart-badge` element), clears the current selection, remembers
`APP.addToCartOrigin` (`'ticket'` or `'goods'`), and opens the add-to-cart confirmation modal
(`renderAddToCartModal()` / `showAddToCartModal()`) with two actions:

- **"장바구니 가기"** → `goToCartFromModal()` → `navigateTo('cart')` + `renderCartPageContent()`.
- **"더 둘러보기"** → `continueBrowsingFromModal()` → returns to `APP.addToCartOrigin`: `'goods'`
  navigates straight back; `'ticket'` additionally calls `resetTicketTabToDefault()` (resets
  `APP.ticketTab` to 0 and re-syncs the segmented-tab's active class in the DOM, since that
  control is only rendered once at init and never re-rendered).

### Size/marking modal (jersey, jacket)

`openSizeMarkingModal(product)` builds a chip-based picker (사이즈: S–XXL, required; 마킹할 선수:
`DATA.players` + "마킹 없음", optional, single-select via `initChipGroup`) into
`#size-marking-modal-content` and opens it. It has its own close (✕) button
(`closeSizeMarkingModal()`) that discards the pending action entirely and resets the goods
selection back to its default (unselected) state — it does not fall back to a no-size purchase.
`confirmSizeMarking()` requires a size, reads the pending action off `APP.pendingCartAction`, and
resumes either `proceedAddToCart(...)` or (`APP.selectedSize`/`selectedMarkingPlayer` set first)
`proceedBuyNow()`.

### 3. Cart page

`renderCartPageContent()` lists cart items (`renderCartItemRow(item, editable=true)`, with
qty +/− and a remove button), shows the summed total, and "결제하기" →
`handleCartCheckout()` → `APP.purchaseMode = 'cart'` → `purchase-confirm`.

### 4. `purchase-confirm`

`renderPurchaseConfirmContent()` branches on `APP.purchaseMode`:

- **`'direct'`** → `renderDirectCheckoutContent()`: single product, quantity selector, size/marking
  line if applicable.
- **`'cart'`** → `renderCartCheckoutContent()`: read-only list of all cart items
  (`renderCartItemRow(item, editable=false)`), no quantity selector (adjust quantity from the cart
  page instead).

Both render `renderPaymentAndCouponSection()` — a required single-select payment-method chip row
(카드 결제 / 간편결제 / 계좌이체, defaults to 카드 결제) and a coupon control
(`renderCouponControl()`) that lists `DATA.benefits` where `status === 'Issued' && discountPercent`
and applies a percentage discount to the subtotal (`getCouponDiscount()`) when one is picked.

### 5. "결제하기" — `confirmPurchase()`

Branches to `confirmDirectPurchase()` or `confirmCartPurchase()`, both of which funnel through
`logOrder()` per line item (charged amount = that line's subtotal minus its share of the coupon
discount, so `DATA.orders` always reflects what was actually paid, not the pre-discount price).
`logOrder()` also updates `DATA.fanStats`: `totalTickets` for Ticket Purchases,
`membership`/`seasonPass` (to the purchased product's `tier`) for Membership/Season Pass
purchases. After logging, both functions clear the relevant `APP` selection state, hide the
originating footer CTA, re-render that grid (clearing stale `.is-selected` state), consume any
applied coupon (`markBenefitUsed`), and route back — direct purchases return to `goods` or
`ticket` depending on `purchaseType`; cart purchases always return to `ticket` (a cart can mix
item types, so there's no single "origin" to return to).

The `purchase-confirm` back button (`handlePurchaseConfirmBack()`) mirrors this: cart mode → back
to `cart`; direct Goods purchase → back to `goods`; everything else → `ticket`.
