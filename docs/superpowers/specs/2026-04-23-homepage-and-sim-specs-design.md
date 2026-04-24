# Four Star Captain — Homepage, Navigation, Footer, and Sim Specs Design

**Date:** 2026-04-23
**Status:** Approved (pending written-spec review)
**Author:** Sam de Freyssinet (with Claude)
**Predecessor:** [2026-04-23 Site Infrastructure Design](./2026-04-23-fourstarcaptain-site-infrastructure-design.md)

## Overview

Replace the coming-soon placeholder with the real public homepage, add a Sim Specs page, introduce site-wide navigation and footer, and extend the Phase 1 design tokens into a proper system. This is "Spec A" in the Phase 2 split; the YouTube sync workflow is deferred to a follow-on "Spec B".

**Audience weighting** (explicit, because it shaped every design choice below):

| Audience | Weight | What they want |
|---|---:|---|
| Home base for the community (returning viewers) | 45% | Fast access to recent videos and Sim Specs |
| Portfolio / identity piece | 35% | A "this is Four Star Captain" moment |
| Discovery surface for new visitors | 20% | Enough identity to "get" the channel quickly |

The design deliberately favors the C weighting via a gallery-forward layout while keeping enough cinematic identity in the hero to serve D.

## Scope & Sequencing

Phase 2 is split into two sequential specs:

1. **This spec (A) — homepage, nav, footer, Sim Specs page.** Visible progress. Gallery ships with a hand-maintained list; the YouTube-sync infrastructure is not required to ship this spec.
2. **Spec B — YouTube sync workflow.** Scheduled GitHub Action that writes `data/videos.yaml` from the channel's feed. Lands without any UI change because the gallery already reads from that file.

Articles and per-video detail pages are deferred to later specs.

## Architecture

### Extended theme structure

```
themes/fourstarcaptain/
├── layouts/
│   ├── _default/
│   │   ├── baseof.html        # extend: nav, scroll state, script tag
│   │   └── single.html        # NEW: used by Sim Specs
│   ├── partials/              # NEW directory
│   │   ├── nav.html
│   │   ├── footer.html
│   │   ├── hero.html
│   │   └── gallery.html
│   └── index.html             # rewrite: hero + gallery
└── assets/
    ├── css/
    │   ├── main.css           # import aggregator
    │   ├── _tokens.css        # NEW: colors, type, spacing
    │   ├── _base.css          # NEW: resets, body typography
    │   ├── _nav.css           # NEW
    │   ├── _hero.css          # NEW
    │   ├── _gallery.css       # NEW
    │   ├── _footer.css        # NEW
    │   └── _sim-specs.css     # NEW
    └── js/
        └── nav-scroll.js      # NEW: ~15 lines

content/
├── _index.md                  # unchanged
└── sim-specs.md               # NEW

static/
├── hero.webm                  # NEW: self-hosted b-roll (primary)
├── hero.mp4                   # NEW: fallback
└── hero-poster.jpg            # NEW: still frame

data/
├── videos.yaml                # NEW: hand-maintained until Spec B ships
└── sim-specs.yaml             # NEW
```

### Why split CSS

The Phase 1 `main.css` is ~90 lines. Phase 2 adds roughly 400 lines of CSS across nav, hero, gallery, footer, sim specs, and the token system. Splitting by concern keeps each file in the ~50–80 line range where edits are reliable. Hugo's `resources.Concat` merges them back into one minified, fingerprinted output served via a single `<link>` with SRI.

### Thumbnails

Gallery uses YouTube's public thumbnail CDN (`https://img.youtube.com/vi/<ID>/hqdefault.jpg`) at runtime. No build-time fetching, no repo bloat. `hqdefault.jpg` is always present for every YouTube video, is 480×360 (4:3), and we crop it to 16:9 via `object-fit: cover` — the cropped 60px top and bottom are exactly the black bars YouTube itself adds.

Post-launch optimisation (not in this spec): upgrade to `maxresdefault.jpg` with an `onerror` fallback to `hqdefault.jpg`.

## Design System Tokens

### Colors

Phase 1 established `--bg` (`#000`), `--fg` (`#fff`), `--accent` (`#b50000`). Phase 2 adds:

| Token | Value | Purpose |
|---|---|---|
| `--accent-hover` | `#e6002e` | link and button hover |
| `--muted` | `#8a8a8a` | secondary text, captions, video titles |
| `--soft` | `#1a1a1a` | card surfaces, gallery hover |
| `--line` | `#262626` | dividers, subtle borders |
| `--nav-bg` | `rgba(0,0,0,.85)` | solid-state nav background (paired with `backdrop-filter: blur(8px)`) |

### Typography

Inter is the new body/heading font. Montserrat stays reserved for the studio attribution. Loaded as a single Google Fonts URL:

```
https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@500&display=swap
```

| Token | Size | Use |
|---|---|---|
| `--t-hero` | `clamp(2.5rem, 6vw, 4.5rem)` | hero wordmark |
| `--t-h1` | `clamp(2rem, 4.5vw, 3rem)` | page titles |
| `--t-h2` | `clamp(1.25rem, 2.2vw, 1.5rem)` | section headings |
| `--t-body` | `1rem` | prose, video titles |
| `--t-small` | `0.85rem` | nav items, metadata |
| `--t-caption` | `0.7rem` | uppercase labels (`FLIGHT DECK`, `RECENT VIDEOS`), footer links |

Category labels use `--t-caption` + `letter-spacing: 0.25em; text-transform: uppercase; color: var(--accent)`.

### Spacing

4px base, geometric-ish scale:

```
--s-1: 0.25rem   --s-4: 1rem      --s-7: 3rem
--s-2: 0.5rem    --s-5: 1.5rem    --s-8: 4rem
--s-3: 0.75rem   --s-6: 2rem      --s-9: 6rem
```

### Breakpoint

Single mobile/desktop split at **720px**. Sub-720px changes: gallery collapses 3-column → 1-column, nav collapses to an inline row (no hamburger — three items fit), hero shrinks to 50vh.

### Motion

Honor `prefers-reduced-motion: reduce`. Hero video hides; poster image takes over. Nav transitions drop to instant. Hover transforms are suppressed.

## Navigation

Three items: brand mark (left) as the home link, `Sim Specs` (right), `YouTube ↗` (right, external).

### Markup

```html
<nav class="nav" aria-label="Primary">
  <a class="nav-home" href="/" rel="home" aria-label="Four Star Captain — Home">
    <img src="/logo.svg" alt="" aria-hidden="true" width="40" height="40">
    <span>Four Star Captain</span>
  </a>
  <ul class="nav-links">
    <li><a href="/sim-specs/">Sim Specs</a></li>
    <li>
      <a href="{{ .Site.Params.youtube }}" target="_blank" rel="noopener noreferrer"
         aria-label="YouTube channel (opens in new tab)">
        YouTube <span aria-hidden="true">↗</span>
      </a>
    </li>
  </ul>
</nav>
```

The "Home" link is carried only by the brand mark; no redundant "Home" label in the right-hand links.

### Behavior

The homepage layout adds a `has-hero` class to `<body>`; other pages do not. Scroll state is reflected by the `scrolled` class on `<body>`, toggled by `nav-scroll.js` when `window.scrollY > 80`.

CSS then expresses the behavior as:

```css
.nav { background: var(--nav-bg); backdrop-filter: blur(8px); }
body.has-hero:not(.scrolled) .nav {
  background: transparent;
  backdrop-filter: none;
}
```

- **On `/` at the top:** `body` carries `has-hero` but not `scrolled` → nav is transparent.
- **On `/` after >80px scroll:** `body` gains `scrolled` → nav becomes solid with blur.
- **On any other page (Sim Specs, future routes):** `body` lacks `has-hero` → nav is solid from first paint, regardless of scroll position.

### JavaScript — `assets/js/nav-scroll.js`

```js
const body = document.body;
const onScroll = () => body.classList.toggle('scrolled', window.scrollY > 80);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
```

Loaded with `<script defer src="{{ .RelPermalink }}">` at the end of `<head>`. Passive scroll listener avoids jank. If JavaScript is disabled, the nav stays in its "scrolled" state (solid) — a graceful loss of the transparent flourish, not a broken site.

### Accessibility

- `<nav aria-label="Primary">` wraps the navigation.
- Brand link carries `rel="home"` and a descriptive `aria-label`.
- YouTube link has `rel="noopener noreferrer"` and an `aria-label` announcing "opens in new tab".
- Focus-visible outlines on all links: 2px `var(--accent)`, 4px offset.

### Mobile (<720px)

Three items flow in a single row, each at `--t-small`. Logo label shrinks to just the badge (text hidden) if needed to fit.

## Hero

Sits in the top 60–70vh of the homepage only (never rendered on `/sim-specs/` or future routes). Serves the D (identity) weighting.

### Markup

```html
<section class="hero" aria-label="Four Star Captain">
  <video class="hero-video" autoplay muted loop playsinline
         preload="metadata" poster="/hero-poster.jpg"
         disablepictureinpicture>
    <source src="/hero.webm" type="video/webm">
    <source src="/hero.mp4"  type="video/mp4">
  </video>
  <div class="hero-scrim" aria-hidden="true"></div>
  <div class="hero-overlay">
    <img class="hero-logo" src="/logo.svg" alt="" width="220" height="220" aria-hidden="true">
    <h1 class="hero-wordmark">Four Star Captain</h1>
  </div>
</section>
```

### Video attributes — rationale

- `autoplay muted loop playsinline` — required combination for inline autoplay on iOS Safari and all modern desktop browsers.
- `preload="metadata"` — fetch size/duration metadata only; defer the byte payload.
- `poster="/hero-poster.jpg"` — shown while the video buffers, when autoplay is blocked, and for `prefers-reduced-motion` users.
- `disablepictureinpicture` — suppress the Chrome/Safari PiP button; an ambient background should not pop out.

### Layout

- Height: `clamp(480px, 70vh, 800px)` on desktop; `50vh` on mobile.
- Video fills with `object-fit: cover`. Any source aspect ratio (16:9, 21:9) will crop cleanly.
- Overlay uses `display: grid; place-items: center;` — logo over wordmark, stacked.

### Scrim

A single absolutely-positioned `.hero-scrim` div carries two stacked gradients:

- Top gradient (~120px tall): `linear-gradient(180deg, rgba(0,0,0,0.55), transparent)` — keeps the transparent nav readable regardless of frame brightness.
- Bottom gradient (~180px tall): `linear-gradient(0deg, rgba(0,0,0,0.9), transparent)` — fades the video into the page so the gallery peek feels anchored rather than floating.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .hero-video { display: none; }
  .hero {
    background: url('/hero-poster.jpg') center/cover var(--bg);
  }
}
```

### Asset spec (for the implementation plan; the user provides the source clip)

- Source: user's own b-roll footage.
- Encodes: `.webm` (VP9 or AV1 preferred) and `.mp4` (H.264 baseline).
- Size target: ≤ 6 MB each at 1920×1080, 25–30 fps, ~20 s duration for a seamless loop.
- Poster: JPEG, 1920×1080, ~150 KB.

### Mobile

- iOS requires `playsinline` (included) to prevent fullscreen hijack.
- Mobile data-saver modes may refuse autoplay even with `muted`. Poster shows instead; acceptable.
- Hero shrinks to 50vh on <720px.

## Gallery

Immediately below the hero. Homepage only; not rendered on `/sim-specs/` or future routes.

### Data — `data/videos.yaml`

```yaml
# Newest first. First six are shown on the homepage.
videos:
  - id: dQw4w9WgXcQ
    title: Why the 787's FMC makes me a better pilot
  - id: Zz37mwKBU5E
    title: North Atlantic crossing at FL390
  # …
```

Hand-maintained until Spec B lands. When Spec B ships, the sync job regenerates this file from the channel feed and commits it; the layout reads the same keys.

### Markup

```html
<section class="gallery" aria-labelledby="gallery-heading">
  <h2 id="gallery-heading" class="gallery-heading">Recent videos</h2>
  <ul class="gallery-grid">
    {{ range first 6 $.Site.Data.videos.videos }}
    <li>
      <a href="https://youtu.be/{{ .id }}" target="_blank" rel="noopener noreferrer"
         aria-label="{{ .title }} (opens on YouTube)">
        <img src="https://img.youtube.com/vi/{{ .id }}/hqdefault.jpg"
             loading="lazy" width="480" height="360" alt="">
        <span class="video-title">{{ .title }}</span>
      </a>
    </li>
    {{ end }}
  </ul>
  <p class="gallery-more">
    <a href="{{ .Site.Params.youtube }}" target="_blank" rel="noopener noreferrer">
      See all on YouTube →
    </a>
  </p>
</section>
```

Each card is a single `<a>` — no nested interactive elements — so keyboard users tab through six items, not eighteen.

### Styling

- Heading `RECENT VIDEOS` in `--t-caption` uppercase letter-spaced red, with a thin red underline accent beneath.
- Grid: `grid-template-columns: repeat(3, 1fr); gap: var(--s-5);` desktop. Single column on mobile, same gap.
- Card at rest: thumbnail cropped to 16:9 via `aspect-ratio: 16/9; object-fit: cover;`, title in `--t-body` below, color `var(--fg)`.
- Card hover / focus-visible: thumbnail `transform: scale(1.02);` with a 200ms transition; title color shifts to `var(--accent-hover)`.
- Focus ring: 2px `var(--accent)`, 4px offset, visible only on keyboard focus.

### "See all on YouTube →"

Right-aligned under the grid. `--t-small`, `color: var(--muted)`, hover → `var(--accent-hover)`. Opens in new tab.

## Footer

Shared across all pages via `partials/footer.html`.

### Content

```
YouTube · XEarthLayer                          © MMXXVI Four Star Captain
                                               de Freyssinet Studios ★
```

- Left: two links — `YouTube` (channel URL) and `XEarthLayer` (xearthlayer.app). Separator is a middle-dot `·` in `var(--muted)`. Both open in new tab.
- Right, top line: `© MMXXVI Four Star Captain` in `--t-small`, `color: var(--muted)`.
- Right, bottom line: the `de FREYSSINET STUDIOS ★` signature in Montserrat 500 with the red star — **reused verbatim from Phase 1** (the existing partial is factored out of the coming-soon layout in this spec and moved into `partials/footer.html`).
- `border-top: 1px solid var(--line); padding: var(--s-6) 0;`.

### Mobile

Stacks to two centered rows: links above, copyright + signature below.

## Sim Specs Page

URL: `/sim-specs/`. Page from `content/sim-specs.md`, layout `themes/fourstarcaptain/layouts/_default/single.html`.

### Content — `content/sim-specs.md`

```markdown
+++
title = "Sim Specs"
+++

The hardware and software running the sim. Updated when something changes.
```

The user will populate the real data in `data/sim-specs.yaml`.

### Data — `data/sim-specs.yaml`

```yaml
# Categories render in the order listed.
categories:
  - name: Flight Deck
    items:
      - name: Yoke
        value: Honeycomb Alpha
      - name: Throttle Quadrant
        value: Honeycomb Bravo
        note: Modded with 3D-printed reverser detents
      - name: Rudder Pedals
        value: Thrustmaster TPR
  - name: Computer
    items:
      - name: CPU
        value: AMD Ryzen 9 7950X3D
      - name: GPU
        value: NVIDIA RTX 4090
  - name: Software
    items:
      - name: Sim
        value: X-Plane 12
      - name: Scenery
        value: XEarthLayer
        link: https://xearthlayer.app/
```

The `note` and `link` fields are optional. If `link` is set, the value renders as an anchor with `target="_blank" rel="noopener noreferrer"`.

The stub seeded by the implementation plan contains a single placeholder category so the page renders on first build. The user replaces the contents themselves after the plan ships.

### Layout — `single.html` responsibilities

Renders for any future page driven by `content/<slug>.md`, but Sim Specs is its first user. Structure:

```
[ nav ]

<h1>Sim Specs</h1>
<p class="page-intro">...front matter body...</p>

{{ range site.Data.sim_specs.categories }}
  <h2 class="category-label">{{ .name | upper }}</h2>
  <ul class="spec-list">
    {{ range .items }}
      <li>
        <span class="spec-name">{{ .name }}</span>
        <span class="spec-value">
          {{ with .link }}<a href="{{ . }}" target="_blank" rel="noopener noreferrer">{{ end }}
          {{ .value }}
          {{ if .link }}</a>{{ end }}
        </span>
        {{ with .note }}<p class="spec-note">{{ . }}</p>{{ end }}
      </li>
    {{ end }}
  </ul>
{{ end }}

[ footer ]
```

### Styling

- Page title: `--t-h1`, Inter 600, margin `var(--s-7) 0 var(--s-3)`.
- Intro: `--t-body`, `color: var(--muted)`, margin-bottom `var(--s-7)`.
- Category label: `--t-caption` uppercase, `color: var(--accent)`, `letter-spacing: 0.25em`, underlined-accent bar, margin-top `var(--s-6)`.
- Row: `display: grid; grid-template-columns: 1fr auto; gap: var(--s-4); padding: var(--s-3) 0; border-bottom: 1px solid var(--line);`.
- Row name: `--t-body`, `color: var(--fg)`.
- Row value: `--t-body`, `color: var(--muted)`. Anchor values render in `var(--fg)` with hover `var(--accent-hover)`.
- Note: `--t-small`, `color: var(--muted)`, padding-top `var(--s-1)`. Optional chevron prefix `↳`.
- On <720px: row grid becomes a single column; value stacks beneath name, both left-aligned.

No filtering, no sorting, no photos. Pure read-only reference.

## Acceptance Criteria

1. `/` renders: nav, hero with autoplaying muted looped video (or poster if blocked), 6-video gallery from `data/videos.yaml`, footer.
2. Each gallery card opens its YouTube video in a new tab via `https://youtu.be/<id>`.
3. "See all on YouTube →" opens the channel URL in a new tab.
4. Nav is transparent on `/` above the hero; after >80px of vertical scroll the nav background transitions to `rgba(0,0,0,0.85)` with `backdrop-filter: blur(8px)`.
5. Nav is solid on `/sim-specs/` from initial page load.
6. `/sim-specs/` renders categories from `data/sim-specs.yaml` in the declared order. Optional `note` values render beneath their row; items with `link` render as anchors opening in a new tab.
7. `prefers-reduced-motion: reduce` hides the hero video and replaces it with the poster image as a CSS background. Hover transforms and nav transitions suppress to instant.
8. At viewport widths below 720px: gallery is one column; hero is 50vh; nav items flow inline; sim-specs rows stack name over value.
9. No JavaScript console errors on either page. With JavaScript disabled, both pages still render correctly — the nav simply stays in its solid "scrolled" state on the homepage.
10. Build stays clean on Hugo 0.160.0 — no new warnings beyond Phase 1 baseline.
11. Footer partial is shared between homepage and Sim Specs; the Phase 1 "de FREYSSINET STUDIOS" signature is reused verbatim from its current markup and moved into the partial.

## Out of Scope

- YouTube auto-sync (Spec B).
- Articles / blog routes.
- Per-video detail pages.
- Search.
- Analytics.
- Light-theme variant. The site is dark-only by design.
- Rework or continued existence of the coming-soon page. It is replaced by the new homepage, not preserved.

## Future Work

- **Spec B: YouTube sync workflow.** Scheduled GitHub Action regenerates `data/videos.yaml` from the channel feed and commits it, re-triggering the deploy workflow. The gallery picks up the new list on the next build, no layout change needed.
- **Articles section.** Content model (`content/articles/*.md`), listing page, taxonomy, and RSS. Own spec when there is content to justify it.
- **Per-video detail pages.** Enabled by Spec B's data model — not a v2 priority.
- **Sim specs photos.** The `data/sim-specs.yaml` schema leaves room to add `image:` keys later without restructuring; card-style rendering arrives when photos do.
- **Upgrade thumbnails to `maxresdefault.jpg`** with `onerror` fallback once the gallery has observable behavior under traffic.
