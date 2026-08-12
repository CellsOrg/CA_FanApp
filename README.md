# Handoff: Cloud Alpacas Fan App — HTML/CSS Design Reference

## Overview
Cloud Alpacas Fan App is a lightweight MVP fan app (login, ticket/membership/season pass purchase, goods store, stadium check-in, and a personal "My" status page). This bundle is a **static HTML/CSS extraction of the current design**, restructured with a small token system and shared component classes so a developer can use it as a direct starting point — without changing the visual result.

## About the Design Files
The files here (`index.html`, `styles.css`) are **design references**, not the original interactive prototype. The original was built as an interactive Design Component (dynamic state, click handlers, live theme switching). This bundle strips that interactivity and keeps only the **visual output**: layout, spacing, typography, colors, and assets, reproduced 1:1. Recreate this UI in your target stack (React Native, SwiftUI, Flutter, or a web framework) using your app's existing patterns — treat `styles.css` as the token/style reference, not a stylesheet to ship as-is.

## Fidelity
**High-fidelity.** Colors, spacing, radii, typography, image crops/ratios, and copy match the live design pixel-for-pixel. Recreate this UI precisely in your target environment.

## Screens included in `index.html`
1. **Splash** — full-bleed brand image, subtle zoom animation, no visible loader.
2. **Login** — logo, phone number field, auto-login toggle, primary CTA, signup link.
3. **Sign Up** — back nav, 3 benefit rows (icon + title + description), name/phone fields, sign-up channel chips (Instagram/카카오톡/직접입력), primary CTA.
4. **Sign Up — Favorite Player** — search input, position filter chips, 2-column player card grid (1:1 photo, name, number, position, selected checkmark).
5. **예매 (Ticket / Membership / Season Pass)** — one shared segmented tab (티켓/멤버십/시즌권) and one shared 2-column product grid component reused across all three tabs (see Components below for the reuse note).
6. **굿즈 (Goods)** — channel segmented tab (온라인 스토어/구장 굿즈샵) + sticky text-tab category row + 2-column product grid (taller thumbnail ratio than Ticket/Membership/Season).
7. **입장 (Check-in)** — ticket summary card, QR panel, primary CTA.
8. **마이 (My)** — profile row with logout/theme icon actions, favorite-player hero banner (always dark, independent of app theme), 2×2 stat card grid (membership/season/tickets/attendance), recent purchase list. Included in **both dark and light theme** to show the token switch (`data-theme="dark"` vs `"light"` on `.phone`) — identical markup, only CSS variables change.

## Components
- **`.segmented`** — pill tab bar with an active state (orange text + orange-tint background). Used for Ticket/Membership/Season and Online/Stadium — same visual component, different data per instance.
- **`.text-tab`** — underline-style tab (used only for Goods categories, since it has more items and needs a lighter visual weight than the segmented control).
- **`.product-grid` / `.product-card`** — the single reusable 2-column grid used by Ticket, Membership, Season Pass, Goods, and the Favorite Player picker. Two thumbnail-ratio modifiers exist because the source design uses two different crops:
  - `.product-thumb--wide` (1.57:1, `object-fit: cover`) — Ticket / Membership / Season Pass.
  - `.product-thumb--tall` (3:4, `object-fit: contain`) — Goods.
  Membership and Season Pass tab panels are commented out in `index.html` (see inline comments) since they are the *same* `.product-grid` markup as Ticket with swapped copy/images — duplicating them verbatim added no new structure, so only one live instance is shown; wire the other two tabs from the same component with their data (see Design Tokens → assets below for their image files).
- **`.card` / `.card-lg`** — bordered surface, used for form panels, the check-in ticket summary, and QR container.
- **`.footer-cta`** — the fixed CTA area pinned above the bottom nav. **Important:** each page renders its own footer content — Ticket page never shows the Goods or Check-in button and vice versa. Do not build one shared footer with all buttons hidden/shown by CSS; render only the current page's CTA.
- **`.bottom-nav`** — 4-item tab bar (예매/굿즈/입장/마이), active item colored `--color-primary`, inactive `--text-tertiary`.
- **`.stat-grid` / `.stat-card`** — 2×2 status cards on My page.
- **`.purchase-row`** — recent purchase list item (thumbnail, name, price + channel, payment status pill, chevron).
- **`.chip`** — small pill selector used for sign-up channel, position filter, and (in the full app) refund-reason radios.

## Interactions & Behavior (for reference — not present as JS in this bundle)
- Splash auto-advances to Login after ~2s; zoom keyframe `splashZoom` (scale 1 → 1.06 → 1, 2s ease-in-out).
- Screen transitions use a simple fade/slide-up (`fadeIn` keyframe, 0.25s ease) on tab content.
- Selecting a product card sets `.is-selected` (orange border) and reveals a check badge; selecting any product reveals the page's footer CTA (hidden until a selection exists).
- Buying shows a pill-shaped "완료" state in place of the CTA button (`.btn-done-pill`), same size/position as the button it replaces.
- Goods: category tab row is `position: sticky` under the channel segmented control so it never scrolls out of view.
- My page: theme toggle (sun/moon icon) switches `data-theme` on the root; logout icon opens a confirm dialog directly (no intermediate menu).
- Favorite player hero card and its background image are **not** affected by the dark/light toggle — always the dark treatment shown here.

## Design Tokens
All defined in `styles.css` `:root` and the `[data-theme]` blocks.

**Brand**
- Primary: `#FC4E00` — used only for CTAs/active states, never as a large fill.
- Primary tint (10–15% overlay): `rgba(252,78,0,0.15)` — done pills, active segmented background.

**Dark theme**
- Background `#080A0D`, Surface `#111418`, Surface-2 (nav bg) `#0B0D10`, Inset `#1A1E24`, Border `#252A30`
- Text `#FFFFFF`, Text secondary `#A7ABB2`, Text tertiary `#737982`

**Light theme**
- Background `#F5F3F1`, Surface `#FFFFFF`, Inset `#F2EFEC`, Border `#E6E2DD`
- Text `#07111F`, Text secondary `#6B6F76`, Text tertiary `#9A9EA6`

**Spacing** — 4 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24px (`--space-1` … `--space-9`)
**Radius** — 8 / 12 / 14 / 16 / 18 / 20px, plus pill and circle (`--radius-sm` … `--radius-pill`)
**Typography** — 11–20px scale plus two display sizes (26px, 30px); weights 600/700/800; family `'Pretendard', -apple-system, sans-serif`

Values used only once (e.g. the 88×68px match thumbnail, 168px QR box) were left inline rather than forced into tokens, per the "don't over-engineer" requirement.

## Assets
All images live in `assets/`, copied from the working design:
- `splash-bg.png` — splash screen full-bleed image
- `login-logo.png` — circular brand mark on Login
- `match-stadium-bg.png` — Ticket tab matchup card background
- `membership-hero-bg.png`, `season-hero-bg.png` — hero banners for the (commented-out) Membership/Season tabs
- `ticket-first.png`, `ticket-third.png`, `ticket-outfield.png`, `ticket-premium.png` — ticket thumbnails
- `membership-standard.png`, `membership-premium.png`, `membership-vip.png` — membership thumbnails
- `season-standard.png`, `season-vip.png` — season pass thumbnails
- `goods-*.png` — goods thumbnails (home/away jersey, towel, plush, photocard, mug, tumbler, cap, keycap, keyring, fan, griptok, jacket)
- `checkin-match.png` — check-in ticket summary thumbnail
- `my-ticket-icon.png`, `my-attendance-icon.png` — My page stat card art
- `player-moontaeyang.png`, `player-default.png` — favorite player photos (only 문태양 has a real photo; all other players use the default placeholder)
- `my-profile-avatar.png` — My page profile photo

## Files
- `index.html` — all screens, laid out side by side inside `.phone` frames for reference (the `.screens-gallery` / `.phone` wrapper is dev-preview scaffolding, not part of the product UI)
- `styles.css` — token system + shared component classes
- `assets/` — all image assets referenced above

Ask if you'd like screenshots of each screen included alongside this README.
