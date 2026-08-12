# Component Map

Shared UI in this project has two layers: JS render functions that produce markup, and CSS
classes that style it. Both are single-source — check this table before adding a new one.

## Shared JS render functions (`assets/js/components.js` unless noted)

| function | renders | reused by |
|---|---|---|
| `renderBottomNav()` / `initBottomNav()` | 4-item bottom tab bar (예매/굿즈/입장/마이) | injected once in `initApp()`, shared by every logged-in screen |
| `renderPageHeader(title, backScreen)` | back-button + title header | favorite-player, cart, notifications, benefits |
| `renderProductGrid(products, thumbClass, onSelect)` | 2-column product grid with single-select highlight + check badge | Ticket, Membership, Season Pass (via `renderTicketTabContent()` in `app.js`), Goods (`renderGoodsGrid()`) |
| `renderSegmentedTab(tabs, activeIndex, onSwitch)` | pill tab bar | 티켓/멤버십/시즌권 tab (`renderTicketPage()`), 온라인/구장 channel tab (`renderGoodsPage()`) |
| `renderGameList(games, onSelect)` | game picker list with date/matchup | Ticket tab 0 only (`renderTicketTabContent()`) |
| `renderPurchaseRow(order)` | recent-purchase row (thumb, name, status pill) | My page (`renderMyPageContent()`) |
| `renderNotificationRow(noti)` | notification list row | Notifications page |
| `renderBenefitCard(benefit)` | benefit card with conditional "사용하기" button | Benefits page |
| `renderCheckoutButtons()` | footer-CTA button pair: "장바구니에 담기" / "바로 결제하기" | Ticket page, Goods page footer |
| `renderCartIconButton()` | header cart icon with item-count badge (`.cart-badge`) | Ticket page, Goods page header row |
| `renderCartItemRow(item, editable)` | one cart-line row (thumb, name, size/marking, price); `editable` toggles qty +/− + remove vs. a plain quantity label | Cart page (editable) and cart-mode `purchase-confirm` summary (read-only) |
| `renderAddToCartModal()` | "장바구니에 담았습니다" confirmation modal with 더 둘러보기 / 장바구니 가기 | injected once in `initApp()`; opened by `showAddToCartModal()` |
| `renderSizeMarkingModal()` | empty modal shell for the jersey/jacket 사이즈+마킹 picker | injected once in `initApp()`; populated per-product by `openSizeMarkingModal()` in `app.js` |

`renderProductGrid` and `renderSegmentedTab` are the two components explicitly called out in the
original design reference (`README.md`) as reused across Ticket/Membership/Season/Goods — that
reuse is preserved: there is exactly one implementation, parameterized by data and a thumbnail
modifier class (`.product-thumb--wide` vs `.product-thumb--tall`). `renderCartItemRow` follows the
same pattern for the cart: one row template, an `editable` flag instead of a second copy, reused
by both the cart page and the cart-checkout summary.

## Shared JS helpers (`assets/js/app.js`)

These aren't markup components, but they're the same kind of "one implementation, called from
multiple flows" piece the reuse rule is about — mainly so the direct-purchase and cart-purchase
paths (and the ticket/membership/season/goods branches within each) don't fork into copies.

| function | purpose |
|---|---|
| `findSelectedProductAndGame(purchaseType, productId, gameId)` | single lookup used by buy-now, add-to-cart, and both checkout renderers to resolve `APP.selectedProduct`/`selectedGame` into actual `DATA` records |
| `requiresSizeAndMarking(product)` | `true` iff `product.sizes` exists (currently home/away jersey + jacket) — the single gate that decides whether the size/marking modal intercepts buy-now / add-to-cart |
| `logOrder(purchaseType, product, game, quantity, paymentMethod, chargedAmount, size, markingPlayer)` | the one place that appends to `DATA.orders` and updates `DATA.fanStats`; called once per line item by both `confirmDirectPurchase()` and `confirmCartPurchase()` |
| `getCouponDiscount(subtotal)` | percentage discount from `APP.appliedCoupon`, shared by both checkout renderers and both confirm functions |
| `markBenefitUsed(benefitId)` | flips a `DATA.benefits` entry to `Used`; used by both the Benefits page's "사용하기" button (`useBenefit()`) and coupon consumption at checkout (`consumeAppliedCoupon()`) |

## Shared CSS component classes (`assets/css/components.css` unless noted)

| class(es) | purpose |
|---|---|
| `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-sm` / `.btn-done-pill` | buttons |
| `.card` / `.card-lg` | bordered surface (login card, check-in summary, QR box) |
| `.segmented` / `.segmented-item` | pill tab bar |
| `.text-tab-row` / `.text-tab-item` | sticky underline tab row (Goods categories only) |
| `.product-grid` / `.product-card` / `.product-thumb--wide` / `.product-thumb--tall` / `.check-badge` | 2-column product grid, two thumbnail-ratio modifiers |
| `.footer-cta` / `.footer-cta-buttons` | fixed bottom CTA bar; `.footer-cta-buttons` lays its two children (장바구니에 담기 / 바로 결제하기) out side by side, `flex:1` each |
| `.section-title-row` | header row pairing `.section-title` with `renderCartIconButton()` (Ticket/Goods) |
| `.cart-icon-btn` / `.cart-badge` | header cart icon + item-count badge, updated by `updateCartBadges()` |
| `.chip` / `.chip-group` | pill selector — signup channel (multi-select), player position filter (single-select), size/marking-player picker (single-select each) |
| `.stat-grid` / `.stat-card` | 2×2 stat cards, My page only |
| `.purchase-row` / `.list-row` / `.benefit-card` | list-item patterns for purchases / notifications / benefits |
| `.cart-item-row` / `.cart-item-thumb` / `.cart-item-qty` / `.cart-item-remove` | cart line-item row, pairs with `renderCartItemRow()` |
| `.payment-section` / `.payment-method-list` / `.payment-method-item(.active)` | 결제 수단 chip row on `purchase-confirm` |
| `.coupon-section` / `.coupon-list` / `.coupon-list-item` / `.coupon-applied-row` / `.coupon-remove-btn` | 쿠폰 적용 control on `purchase-confirm` |
| `.modal-overlay` / `.modal-sheet` / `.modal-handle` / `.modal-close-btn` | shared bottom-sheet modal shell, used by both `#add-to-cart-modal` and `#size-marking-modal` |
| `.cart-modal-body` / `.cart-modal-icon` / `.cart-modal-actions` | add-to-cart modal content layout |
| `.toast` | global transient message, appended/removed by `showToast()` in `utils.js`; `pointer-events: none` so it never blocks a tap on the button underneath it |
| `.game-list` / `.game-card` (`assets/css/pages.css`) | ticket-tab game picker, pairs with `renderGameList()` |
| `.player-card-grid` / `.player-card` / `.player-none-icon` (`assets/css/pages.css`) | favorite-player picker grid; `.player-none-icon` is the "?" placeholder tile for the "아직 없음" option |

## Shared JS utilities (`assets/js/utils.js`)

| function | purpose |
|---|---|
| `formatPrice(n)` | `n.toLocaleString('ko-KR') + '원'` |
| `formatDate(dateStr)` / `formatDateFull(dateStr)` | short (`M/D`) and full (`YYYY.MM.DD`) date display |
| `formatSizeMarking(size, markingPlayerId)` | `"사이즈: L · 마킹: 문태양"`-style line, shared by the direct-checkout summary, cart rows, and cart-checkout summary |
| `navigateTo(screenId, pushHistory)` | single screen-navigation entry point — see `ARCHITECTURE.md` |
| `showToast(message, duration)` | transient bottom message |
| `initChipGroup(container, onChange, multiSelect = false)` | toggle behavior for a `.chip-group`; single-select by default (position filter, payment method, size, marking player), pass `multiSelect: true` for independent per-chip toggling (signup acquisition channel) |
| `initCheckbox(el)` | toggle `.checked` on click |
| `trackEngagement(type, source, playerId)` | logs an Engagement Signal to console + `window._engagementLog` |
| `generateQRPlaceholder()` | placeholder QR-pattern SVG for the check-in screen (not a real QR encoder) |

## Before adding something new

Per `to은영CLUADE.md`: reuse → extend → create, in that order. A new screen needing a product
grid, a segmented tab, a pill/chip selector, a list row, a page header, or a cart-style line item
should call the existing function above with new data rather than writing new markup.
