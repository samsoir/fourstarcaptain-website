# Four Star Captain — Site Infrastructure & Coming-Soon Design

**Date:** 2026-04-23
**Status:** Approved (pending written-spec review)
**Author:** Sam de Freyssinet (with Claude)

## Overview

Stand up the infrastructure for `fourstarcaptain.com` — the companion website for the Four Star Captain YouTube channel — and ship a minimal coming-soon page that proves the deployment pipeline end-to-end. Visual design of the real homepage (hero video, video gallery, footer, Sim Specs page) is deliberately deferred to a follow-on spec.

The design pattern is lifted from the existing `samsoir/xearthlayer-website` repo so that tooling, workflow conventions, and mental models transfer cleanly between the two sites.

## Scope & Sequencing

This work is split into two sequential specs:

1. **This spec (infrastructure + coming-soon placeholder)** — repo, Hugo scaffold, CI, GitHub Pages, custom domains, and a single placeholder page that validates the pipeline.
2. **Next spec (design iteration)** — real homepage with hero video + logo overlay, YouTube video gallery, footer links, Sim Specs page, navigation, typography/color system.

Rationale: get plumbing right and deployed quickly so the design phase can focus on design, with working preview/prod environments already in place.

## Repository & Hugo Scaffold

### Repo

- **GitHub:** `github.com/samsoir/fourstarcaptain-website`
- **Visibility:** public
- **Default branch:** `main`
- **License:** closed / proprietary. Stated in `README.md`. No separate `LICENSE` file (the absence of one plus the README statement is sufficient; adding an OSI license would contradict the closed posture).

### Directory layout

```
fourstarcaptain-website/
├── archetypes/
├── content/
│   └── _index.md
├── data/
├── layouts/                       # project-level overrides (empty at first)
├── static/
│   ├── CNAME
│   ├── favicon.svg
│   ├── favicon-32.png
│   ├── favicon-192.png
│   ├── apple-touch-icon.png
│   └── images/
│       └── logo.svg
├── themes/
│   └── fourstarcaptain/
│       ├── layouts/
│       │   ├── _default/baseof.html
│       │   └── index.html
│       ├── assets/css/main.css
│       └── theme.toml
├── .github/workflows/deploy.yml
├── hugo.toml
├── .gitignore
├── README.md
└── CLAUDE.md
```

### Theme approach

In-tree theme at `themes/fourstarcaptain/`, **not** a git submodule. We own it, we are the only consumer, and submodules add friction with no benefit. Matches XEarthLayer.

### Hugo version

**Hugo extended 0.160.0**, pinned in the deploy workflow. Matches XEarthLayer.

### Static assets

- `logo.svg` — the Four Star Captain badge, extracted/redrawn as SVG from `/media/Disk5/Streaming Resources/off-air 3.png`. White fill, transparent background, viewBox tuned so it renders crisp at favicon sizes.
- `favicon.svg` — same badge as `logo.svg`.
- `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` — rasterized from the SVG at the respective sizes, black square background, badge centered.

### `.gitignore`

Standard Hugo ignores: `public/`, `resources/_gen/`, `.hugo_build.lock`, plus OS/editor noise (`.DS_Store`, `*.swp`). Mirrors XEarthLayer's.

### `hugo.toml`

```toml
baseURL = 'https://fourstarcaptain.com/'
languageCode = 'en-us'
title = 'Four Star Captain'
theme = 'fourstarcaptain'

[params]
  description = "Companion site for the Four Star Captain YouTube channel."
  youtube = "https://www.youtube.com/@fourstarcaptain"
  xearthlayer = "https://xearthlayer.app/"

[markup.goldmark.renderer]
  unsafe = true

[outputs]
  home = ["HTML"]
```

No `[menu]` block yet — the coming-soon page has no navigation. Menu entries are added in the design spec alongside the Sim Specs page.

## Coming-Soon Page

A single full-viewport page. Semantic HTML, minimal CSS, no JavaScript.

### Visual specification

Mirrors the `off-air 3.png` asset:

- Full-bleed black background (`#000`).
- Badge logo (white) centered vertically in the top half. SVG, ~120px wide on desktop, scales down on mobile.
- "Four Star Captain" wordmark below the logo in a heavy rounded sans-serif — **Poppins 600** via Google Fonts (closest free match to the existing logo wordmark). Color `#fff`.
- Near the bottom-center: "de FREYSSINET STUDIOS" attribution in uppercase letter-spaced sans, with "de" and a trailing star in accent red `#e4022b` (eyeballed from the logo; may be tuned in the design spec).
- Below the attribution: `Copyright © MMXXVI de Freyssinet, all rights reserved.` in small white text (roman-numeral year to match the logo treatment).

### Accessibility & meta

- `<title>Four Star Captain</title>`
- `<meta name="description">` populated from `site.Params.description`.
- OpenGraph + Twitter card tags with the logo as the share image.
- Logo SVG has `role="img"` with a nested `<title>Four Star Captain</title>` for screen readers.
- Base CSS declares a `prefers-reduced-motion` media query even though this page has no motion — avoids forgetting it when the design spec introduces the hero video.

### Responsive behaviour

- Single CSS file.
- Flex-centered content, `min-height: 100svh` (small-viewport unit for correct behaviour under mobile browser chrome).
- No CSS framework.

### Explicitly not on this page

- No hero video.
- No video gallery.
- No navigation.
- No footer links to YouTube or XEarthLayer. The page-bottom attribution is studio branding only.

## Deployment Pipeline

Near-verbatim copy of `xearthlayer-website/.github/workflows/deploy.yml` with project-specific values swapped.

### `.github/workflows/deploy.yml`

- **Name:** `Deploy Hugo site to GitHub Pages`
- **Triggers:** `push` to `main`, plus `workflow_dispatch`.
- **Permissions:** `contents: read`, `pages: write`, `id-token: write`.
- **Concurrency:** `group: "pages"`, `cancel-in-progress: false` (so queued deploys do not get cancelled mid-publish).
- **Build job (`ubuntu-latest`):**
  1. Install Hugo extended `0.160.0` from the official `.deb`.
  2. `actions/checkout@v6` with `submodules: recursive` and `fetch-depth: 0`.
  3. `actions/configure-pages@v6`.
  4. `hugo --gc --minify` with `HUGO_ENVIRONMENT=production`, `TZ=America/Los_Angeles`, `HUGO_CACHEDIR` pointed at the runner temp dir.
  5. `actions/upload-pages-artifact@v4` from `./public`.
- **Deploy job:** `actions/deploy-pages@v5` into the `github-pages` environment. Depends on `build`.

No `gh-pages` branch, no build output committed. Uses GitHub's native Pages deployment.

### Repo settings (manual, one-time)

- **Settings → Pages → Source:** `GitHub Actions`.
- **Settings → Pages → Custom domain:** `fourstarcaptain.com`. This triggers GitHub's DNS verification; the committed `static/CNAME` matches.
- **Settings → Pages → Enforce HTTPS:** on, after DNS propagates and the cert issues.
- **Settings → Actions → Workflow permissions:** leave at default (the elevated permissions are declared per-job in the workflow).

### Difference from XEarthLayer

No `sync-packages.yml` or `sync-version.yml`. Those exist for XEarthLayer's release-driven content; this site has no such pipeline yet. A comparable YouTube-sync workflow is captured under Future Work.

## Domains & DNS (Hover)

Canonical domain: **`fourstarcaptain.com`**.
Redirect: **`fourstarcaptain.tv` → `fourstarcaptain.com`** (permanent 301).

### `static/CNAME`

```
fourstarcaptain.com
```

### Hover DNS — `fourstarcaptain.com` (canonical)

| Type  | Host | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| AAAA  | @    | 2606:50c0:8000::153    |
| AAAA  | @    | 2606:50c0:8001::153    |
| AAAA  | @    | 2606:50c0:8002::153    |
| AAAA  | @    | 2606:50c0:8003::153    |
| CNAME | www  | samsoir.github.io.     |

These are the same GitHub Pages apex IPs used by XEarthLayer.

### Hover forwarding — `fourstarcaptain.tv` (redirect)

Hover's **Connect → Forward** feature:

- Forward `fourstarcaptain.tv` and `www.fourstarcaptain.tv` to `https://fourstarcaptain.com`.
- Type: **permanent (301)**.
- **Preserve path:** enabled.
- **HTTPS:** enabled.

No additional DNS records on `.tv` beyond what Hover's forwarding supplies.

### Verification checklist (post-deploy)

1. `dig fourstarcaptain.com A` returns the four GitHub IPs.
2. `curl -I https://fourstarcaptain.com` returns `200 OK` with a valid TLS cert.
3. `curl -I https://www.fourstarcaptain.com` returns `301` to the apex.
4. `curl -I https://fourstarcaptain.tv` returns `301` to `https://fourstarcaptain.com`.
5. `curl -I https://fourstarcaptain.tv/foo` returns a `301` whose `Location` preserves `/foo`.

## Acceptance Criteria

This spec is done when all of the following hold:

1. `samsoir/fourstarcaptain-website` exists on GitHub, public, with `main` as the default branch.
2. `git push origin main` triggers `deploy.yml` and it completes green end-to-end.
3. `https://fourstarcaptain.com` serves the coming-soon page with a valid HTTPS cert.
4. `https://www.fourstarcaptain.com` `301`s to the apex.
5. `https://fourstarcaptain.tv` and `https://www.fourstarcaptain.tv` both `301` to `https://fourstarcaptain.com`, preserving path.
6. Lighthouse on the coming-soon page scores ≥95 on Performance, Accessibility, Best Practices, and SEO. This is a baseline the design spec must not regress against.
7. `CLAUDE.md` is updated with real build/serve commands (`hugo server -D`, `hugo --gc --minify`), the Hugo version pin, and the path to the deploy workflow — replacing the current "unscaffolded" placeholder.
8. Local dev is documented: `hugo server` serves on `localhost:1313` with live reload.

## Out of Scope

All of the following are deferred to the design spec that follows this one:

- Hero video (background autoplay, muted, with logo overlay).
- YouTube video gallery.
- Footer with YouTube / XEarthLayer / copyright links.
- Sim Specs page.
- Site navigation / menu.
- Typography and color decisions beyond the coming-soon placeholder.
- Articles/blog content model.

## Future Work (captured, not implemented here)

- **YouTube video sync workflow.** Scheduled GitHub Action that pulls the latest videos from the Four Star Captain channel (via YouTube Data API or channel RSS feed), writes `data/youtube.json`, and commits the change to re-trigger `deploy.yml`. Mental model matches XEarthLayer's `sync-packages.yml`. Exact mechanism chosen during the design spec.
- **Articles section.** Content model (`content/articles/*.md`), listing page, taxonomy, and RSS output. Either folded into the design spec or its own dedicated spec.
- **Analytics.** Not in scope until the site has meaningful traffic.
