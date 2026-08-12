# Component Map

Shared UI in this project has two layers: JS render functions that produce markup, and CSS
classes that style it. Both are single-source — check this table before adding a new one.

## Shared JS render functions (`assets/js/components.js` unless noted)

| function | renders | reused by |
|---|---|---|
| `renderBottomNav()` / `initBottomNav()` | 4-item bottom tab bar (예매/굿즈/입장/마이) | injected once in `initApp()`, shared by every logged-in screen |
| `renderPageHeader(title, backScreen)` | back-button + title header | favorite-player, notifications, benefits, purchase-confirm |
| `renderProductGrid(products, thumbClass, onSelect)` | 2-column product grid with single-select highlight + check badge | Ticket, Membership, Season Pass (via `renderTicketTabContent()` in `app.js`), Goods (`renderGoodsGrid()`) |
| `renderSegmentedTab(tabs, activeIndex, onSwitch)` | pill tab bar | 티켓/멤버십/시즌권 tab (`renderTicketPage()`), 온라인/구장 channel tab (`renderGoodsPage()`) |
| `renderGameList(games, onSelect)` | game picker list with date/matchup | Ticket tab 0 only (`renderTicketTabContent()`) |
| `renderPurchaseRow(order)` | recent-purchase row (thumb, name, status pill) | My page |
| `renderNotificationRow(noti)` | notification list row | Notifications page |
| `renderBenefitCard(benefit)` | benefit card with conditional "사용하기" button | Benefits page |

`renderProductGrid` and `renderSegmentedTab` are the two components explicitly called out in the
original design reference (`README.md`) as reused across Ticket/Membership/Season/Goods — that
reuse is preserved: there is exactly one implementation, parameterized by data and a thumbnail
modifier class (`.product-thumb--wide` vs `.product-thumb--tall`).

## Shared CSS component classes (`assets/css/components.css`)

| class(es) | purpose |
|---|---|
| `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-sm` / `.btn-done-pill` | buttons |
| `.card` / `.card-lg` | bordered surface (login card, check-in summary, QR box) |
| `.segmented` / `.segmented-item` | pill tab bar |
| `.text-tab-row` / `.text-tab-item` | sticky underline tab row (Goods categories only) |
| `.product-grid` / `.product-card` / `.product-thumb--wide` / `.product-thumb--tall` / `.check-badge` | 2-column product grid, two thumbnail-ratio modifiers |
| `.footer-cta` | fixed bottom CTA bar; one instance each on Ticket/Goods, hidden via `.hidden` until a selection exists |
| `.chip` / `.chip-group` | pill selector — signup channel, player position filter |
| `.stat-grid` / `.stat-card` | 2×2 stat cards, My page only |
| `.purchase-row` / `.list-row` / `.benefit-card` | list-item patterns for purchases / notifications / benefits |
| `.toast` | global transient message, appended/removed by `showToast()` in `utils.js` |
| `.game-list` / `.game-card` (`assets/css/pages.css`) | ticket-tab game picker, pairs with `renderGameList()` |
| `.player-card-grid` / `.player-card` (`assets/css/pages.css`) | favorite-player picker grid |

## Shared JS utilities (`assets/js/utils.js`)

| function | purpose |
|---|---|
| `formatPrice(n)` | `n.toLocaleString('ko-KR') + '원'` |
| `formatDate(dateStr)` / `formatDateFull(dateStr)` | short (`M/D`) and full (`YYYY.MM.DD`) date display |
| `navigateTo(screenId, pushHistory)` | single screen-navigation entry point — see `ARCHITECTURE.md` |
| `showToast(message, duration)` | transient bottom message |
| `initChipGroup(container, onChange)` | single-select toggle behavior for a `.chip-group` |
| `initCheckbox(el)` | toggle `.checked` on click |
| `trackEngagement(type, source, playerId)` | logs an Engagement Signal to console + `window._engagementLog` |
| `generateQRPlaceholder()` | placeholder QR-pattern SVG for the check-in screen (not a real QR encoder) |

## Before adding something new

Per `to은영CLUADE.md`: reuse → extend → create, in that order. A new screen needing a product
grid, a segmented tab, a pill/chip selector, a list row, or a page header should call the
existing function above with new data rather than writing new markup.
