# Refactor & Implementation Decisions

## 1. JS-template rendering instead of `pages/` + `components/` HTML fragments

`to은영CLUADE.md` originally specified page-specific HTML under `pages/`, shared HTML under
`components/`, and a `loadComponent()` fetcher to stitch them together at runtime.

The implementation instead renders every screen and every shared UI piece from a JS function
(`render*()`) that returns a string, assembled once into `#app` on load (see
`ARCHITECTURE.md`). Reasoning:

- No extra network round-trip per fragment on a plain static file server (this app has no build
  step or bundler — `index.html` is served as-is).
- `APP`/`DATA` state and the markup that depends on it live in the same JS scope, avoiding
  cross-fragment message passing to keep e.g. the product grid's selected state in sync with the
  footer CTA visibility.
- The "write shared UI once, reuse everywhere" rule is still met — the reuse unit is a JS
  function (`renderProductGrid()`, `renderSegmentedTab()`, etc., see `COMPONENT_MAP.md`) instead
  of an `.html` partial. There is exactly one implementation of each shared piece, called with
  different data.

This is a deliberate deviation from the original structure doc, not an oversight — flagging it
here per that doc's own "Definition of Done" (`update the relevant document when architecture ...
decisions change`).

## 2. Dummy data source of truth

`data/dummy-data.js`'s header comment states values should mirror the Salesforce project's
`SAMPLE_DATA.md` / `DEMO_DATASETS.md`. Those files live in a separate project and aren't present
in this repo, so exact field-for-field parity (e.g. `Fan_Value_Tier__c` enum values,
`Engagement_Level__c` thresholds) could not be verified from here. `DATA.currentFan` /
`DATA.players` / `DATA.games` currently encode a fixed demo persona (이루키, 문태양, a 5-game May
2026 schedule) matching the scripted demo narrative described in the team's Salesforce-project
feature spec (external to this repo).

`DATA.players` was later replaced outright at explicit user request (문태양, 강도윤, 이서준,
박현우 — down from the original 8) without being able to cross-check the new three names against
`SAMPLE_DATA.md`/`DEMO_DATASETS.md` for the same reason. `player-moon` (문태양) kept its original
id/number/position/photo since `DATA.currentFan.favoritePlayer`, the My-page hero banner, the
benefit recommendation copy, and `engagementSignals` all hardcode a reference to him specifically
(see §8) — renaming or removing that entry would have silently broken those. The other three
entries are new ids (`player-kang`, `player-lee`, `player-park`, following the existing
surname-romanization convention) with numbers/positions assigned for variety since none were
specified, and the shared `player-default.png` placeholder photo, consistent with "only 문태양 has
a real photo" from the original design reference.

## 3. Bug fixes applied (2026-08-12)

A live-browser pass (Playwright, full click-through of every screen) surfaced four bugs, fixed in
this pass:

| bug | fix | file |
|---|---|---|
| Goods purchase had no checkout path — `renderPurchaseConfirmContent()`, `changeQty()`, and `confirmPurchase()` only branched on `'Ticket Purchase' \| 'Membership Enrollment' \| 'Season Pass'`, so selecting a `'Goods Purchase'` product always fell through to product being `undefined` and rendered the "상품을 선택해주세요" empty state — goods could never actually be bought | added the missing `'Goods Purchase'` branch in all three functions | `assets/js/app.js` |
| `confirmPurchase()` always routed back to `'ticket'` regardless of purchase type, so completing a goods purchase landed the user on the Ticket screen | route to `'goods'` when `purchaseType === 'Goods Purchase'`, else `'ticket'` | `assets/js/app.js` |
| After a purchase completed, the footer CTA button and the previously-selected product card stayed visible/highlighted even though `APP.selectedProduct` had been reset to `null` — tapping "구매하기" again led to a dead-end empty state | `confirmPurchase()` now hides the relevant `footer-cta` and re-renders the grid it came from | `assets/js/app.js` |
| The splash→login auto-advance `setTimeout(..., 2200)` fired unconditionally, so a user who navigated past splash and logged in within 2.2s of page load got forcibly kicked back to the login screen | guarded the callback to only navigate if `#splash` is still the active screen | `assets/js/app.js` |
| `.toast` had no `pointer-events` rule and a higher z-index than `.footer-cta`, so for ~2s after any toast-triggering action it could swallow taps on the CTA button underneath it (confirmed via `elementFromPoint` hit-testing) | added `pointer-events: none` to `.toast` | `assets/css/components.css` |

Also removed a dead, unused `header` variable left over in `handleGoodsBuy()`.

## 4. Cart, checkout, and jersey/jacket customization

Added at explicit user request, on top of the single-item "구매하기" flow from §3:

- **Two footer buttons instead of one.** "구매하기" split into "장바구니에 담기" (add to cart,
  `addCurrentSelectionToCart()`) and "바로 결제하기" (unchanged single-item flow, renamed
  `handleBuyNow()`). Both funnel through the same size/marking gate and the same
  `purchase-confirm` screen, distinguished by `APP.purchaseMode` (`'direct' | 'cart'`) — see
  `ARCHITECTURE.md` for the full flow.
- **Cart** (`APP.cart`, `cart` screen, `renderCartPageContent()`) lets items accumulate across
  Ticket/Membership/Season/Goods before a single checkout. Chose a plain array of line items over
  e.g. grouping by product, since jersey/jacket items can differ by size/marking even for the same
  product id and shouldn't be merged.
- **Payment method + coupon** (`renderPaymentAndCouponSection()`) added to `purchase-confirm` for
  both direct and cart checkout. Coupons reuse `DATA.benefits` (filtered to
  `status === 'Issued' && discountPercent`) rather than a separate coupon list, per the "don't
  invent a parallel data source" rule — a `Benefit__c` of type `Discount` already is a coupon.
  Applying one consumes it via the same `markBenefitUsed()` the Benefits page's "사용하기" button
  uses (see `COMPONENT_MAP.md`), so a coupon spent at checkout correctly shows as "사용 완료" if
  the user later opens the Benefits page.
- **Size/marking modal** for jersey/jacket goods (`requiresSizeAndMarking()`, gated purely on
  `product.sizes` existing in `DATA.goods` — no product-id special-casing, so any future goods
  item that needs sizing just needs a `sizes` array). Its close (✕) button was added on request
  and deliberately resets the pending selection back to the goods page's default state rather than
  falling back to a no-size purchase — a sized item can't legitimately be bought without a size.

## 5. Signup consent tiers and multi-select acquisition channel

Both from explicit user request:

- **필수/선택 split.** `to은영CLUADE.md`'s dummy-data guidance predates any consent-requirement
  concept, so this was a genuinely new product decision, not something to infer from existing
  data. Given the choice between (a) making some of the four *marketing* channels mandatory or
  (b) adding standard 이용약관/개인정보 consent as the required items and keeping all four
  marketing channels optional, went with (b) — it matches real Korean signup-form convention and
  doesn't force marketing consent, which (b) generally shouldn't for a real app. `handleSignup()`
  now blocks (`showToast('필수 항목에 동의해주세요.')`) unless every `[data-consent][data-required]`
  row is checked; "전체 동의" still toggles all six rows together.
- **Multi-select channel chips.** `initChipGroup()` gained a `multiSelect` parameter rather than a
  second function, so the existing single-select behavior (player position filter, payment
  method, size, marking-player) stays exactly as-is and only the signup-channel call site opts
  into independent per-chip toggling. `APP.signupData.channel` changed from a string to an array
  accordingly.

## 6. Favorite-player picker rework

Originally a card grid plus a separate "나중에 선택할게요" skip link below it. Reworked (user
request) so "아직 없음" is a real option inside the grid instead of a bypass below it — it's
prepended to every filtered/searched result set unconditionally, so it's reachable regardless of
which position filter or search term is active. The screen header changed from "최애 선수 선택" to
the more conversational "제일 응원하는 선수는?" to match. `handleSelectPlayer()` branches on
`APP.selectedPlayer === 'none'` before doing the normal `DATA.players.find(...)` lookup.

## 7. Second bug-fix pass (2026-08-12, later same day)

| bug | fix | file |
|---|---|---|
| My page's stat grid and recent-purchases list were baked into static HTML at `initApp()` and never re-rendered — a purchase or check-in never showed up until the whole page was reloaded | split `renderMyPage()` into a static shell + empty `#my-stat-grid`/`#my-purchases-list` containers, added `renderMyPageContent()` to fill them, called on init and on every `navigateTo('my-page')` | `assets/js/app.js`, `assets/js/utils.js` |
| Buying a membership or season pass never updated `DATA.fanStats.membership` / `.seasonPass` — the stat cards stayed at their seed values (`'Standard'` / `'-'`) forever, regardless of what was actually purchased | `logOrder()` now sets the relevant stat to the purchased product's `tier` | `assets/js/app.js`, `data/dummy-data.js` (added `tier` to memberships/season passes) |
| A coupon-discounted purchase's charged amount wasn't what got recorded — `DATA.orders` always logged the full pre-discount price even though the checkout screen showed (and the user paid) less | `logOrder()` now takes an explicit `chargedAmount` computed by the caller (subtotal minus that line's share of the discount) instead of recomputing `price × quantity` itself | `assets/js/app.js` |
| Default body text (`.text-title`, `.text-heading`, `.text-body`, product names, etc. — anything that doesn't set its own `color`) stayed white after switching to the light theme, since `#app` (where `data-theme` actually lives) never declared its own `color` and text was inheriting `<body>`'s color computed at the dark-mode default | added `color: var(--text)` to `#app` in `base.css` — see `DESIGN_SYSTEM.md` for why this specific element needed it | `assets/css/base.css` |
| `#login` never actually hid — `pages.css` had a bare `#login { display: flex; ... }` rule, and an ID selector (specificity 100) beats the class selector `.screen.active { display: block }` (specificity 20) regardless of which element has `.active`, so the login screen rendered on top of/above whatever screen was actually active | scoped the rule to `#login.active` instead, matching the specificity `.screen.active` expects to win against | `assets/css/pages.css` |

The last two were pre-existing bugs (present before this project's involvement), not regressions
from this pass — found by taking full-page screenshots for the first time while verifying the
theme-toggle fix, rather than only checking specific elements via selectors as earlier passes had.

## 8. Known gaps not addressed

- **Favorite player selection doesn't propagate.** `selectPlayer()` / `handleSelectPlayer()`
  during signup only console-logs the choice (`[Favorite Player → Favorite_Player__c]`) and sets
  `APP.selectedPlayer`; it never writes to `DATA.currentFan.favoritePlayer`. This is now also true
  of explicitly picking "아직 없음" (§6) — nothing clears `favoritePlayer` either. The My-page hero
  banner (`renderMyPage()`) and the benefit recommendation copy are hardcoded to 문태양 regardless
  of what the user picks. Acceptable for the current fixed demo persona (문태양 is `currentFan`'s
  actual favorite in `dummy-data.js`); would need to read from `DATA.currentFan.favoritePlayer`
  if the app ever needs to reflect a different selection.
- **My-page quick-link badges are still static.** The §7 My-page fix covers the stat grid and
  purchase list specifically (what "결제한 상품이 반영 안 됨" was about); the 🔔 알림 /
  🎁 혜택 badge counts in the quick-links row are still baked into the static shell at
  `initApp()` time and won't reflect e.g. a coupon consumed at checkout until a full reload.
  Same category of bug as §7's first fix, just not in scope for it.
- **Check-in shows a fixed seat.** `renderCheckinPage()` always displays "입장권: 1루 내야석
  A구역" and always checks in against `DATA.games[0]`, rather than the fan's actual most recent
  ticket purchase. Fine for the scripted demo scenes; would need to derive from `DATA.orders` for
  a general-purpose flow.
- No real Salesforce integration — every "→ Object__c" comment in `app.js`/`utils.js` marks a
  `console.log` call standing in for a future API call. The team's feature spec describes this
  same status explicitly: "현재는 모두 프론트엔드 Demo 수준이다. Salesforce API 실제 연동은
  다음 단계."
