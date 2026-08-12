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

## 4. Known gaps not addressed in this pass

- **Favorite player selection doesn't propagate.** `selectPlayer()` / `handleSelectPlayer()`
  during signup only console-logs the choice (`[Favorite Player → Favorite_Player__c]`) and sets
  `APP.selectedPlayer`; it never writes to `DATA.currentFan.favoritePlayer`. The My-page hero
  banner (`renderMyPage()`) and the benefit recommendation copy are hardcoded to 문태양 regardless
  of what the user picks. Acceptable for the current fixed demo persona (문태양 is `currentFan`'s
  actual favorite in `dummy-data.js`); would need to read from `DATA.currentFan.favoritePlayer`
  if the app ever needs to reflect a different selection.
- **Check-in shows a fixed seat.** `renderCheckinPage()` always displays "입장권: 1루 내야석
  A구역" and always checks in against `DATA.games[0]`, rather than the fan's actual most recent
  ticket purchase. Fine for the scripted demo scenes; would need to derive from `DATA.orders` for
  a general-purpose flow.
- No real Salesforce integration — every "→ Object__c" comment in `app.js`/`utils.js` marks a
  `console.log` call standing in for a future API call. The team's feature spec describes this
  same status explicitly: "현재는 모두 프론트엔드 Demo 수준이다. Salesforce API 실제 연동은
  다음 단계."
