# Design System

All tokens live in `assets/css/tokens.css` as CSS custom properties on `:root`, with a
`[data-theme="light"]` block overriding the theme-dependent ones. The theme is toggled at runtime
by `toggleTheme()` (`app.js`), which flips `data-theme` on `#app`. Only genuinely repeated values
are tokenized — one-off values (e.g. the 88×68px check-in thumbnail, the 200px QR box) are left
inline in `pages.css`, per the "don't over-engineer" rule in `to은영CLUADE.md`.

> Note: these are the values actually shipped in `assets/css/tokens.css`. They differ in places
> from the color values quoted in the original static design reference (`README.md`, `styles.css`
> at the repo root) — treat this file as current source of truth for the live app.

## Brand

| token | value |
|---|---|
| `--color-primary` | `#FC4E00` |
| `--color-primary-light` | `rgba(252, 78, 0, 0.12)` — active segmented/chip background |
| `--color-primary-glow` | `rgba(252, 78, 0, 0.28)` — login screen radial glow |
| `--color-success` | `#22C55E` |
| `--color-danger` | `#EF4444` |
| `--color-warning` | `#F59E0B` |

## Theme colors

| token | dark (default) | light (`[data-theme="light"]`) |
|---|---|---|
| `--bg` | `#111111` | `#F5F5F5` |
| `--bg-card` | `#1A1A1A` | `#FFFFFF` |
| `--bg-elevated` | `#222222` | `#FFFFFF` |
| `--text` | `#F5F5F5` | `#111111` |
| `--text-secondary` | `#A3A3A3` | `#6B6B6B` |
| `--text-tertiary` | `#6B6B6B` | `#A3A3A3` |
| `--border` | `#2A2A2A` | `#E5E5E5` |
| `--border-light` | `#333333` | `#EEEEEE` |
| `--shadow-card` | `0 2px 8px rgba(0,0,0,.3)` | `0 2px 8px rgba(0,0,0,.08)` |
| `--shadow-elevated` | `0 4px 16px rgba(0,0,0,.4)` | `0 4px 16px rgba(0,0,0,.12)` |

The favorite-player hero banner on My page (`.my-fav-player-banner`) is hardcoded to a dark
treatment (`background: #1a1a1a`) regardless of theme, matching the original design intent noted
in the pre-implementation `README.md`.

## Typography

- Family: `'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif`
- Sizes: `--font-size-xs` 11px · `sm` 13px · `base` 15px (body default) · `lg` 17px · `xl` 20px ·
  `2xl` 26px · `3xl` 32px
- Weights: `--font-weight-regular` 400 · `medium` 500 · `bold` 700 · `black` 900

## Spacing

`--space-xs` 4px · `sm` 8px · `md` 12px · `lg` 16px · `xl` 20px · `2xl` 24px · `3xl` 28px · `4xl` 32px

## Radius

`--radius-sm` 8px · `md` 12px · `lg` 16px · `xl` 20px · `--radius-full` 9999px (pills/circles)

## Z-index

`--z-bottom-nav` / `--z-header` 100 · `--z-modal` 200 · `--z-toast` 300

## Layout

`--bottom-nav-height` 56px · `--header-height` 52px, plus `--safe-area-top` /
`--safe-area-bottom` from `env(safe-area-inset-*)` for notch/home-indicator devices. The app
shell (`#app`) caps at `max-width: 430px`, centered — a single mobile viewport, not a responsive
breakpoint system.
