+++
title = "Hangar and Articles — Design"
date = 2026-05-05
+++

# Hangar and Articles

Add two new sections to fourstarcaptain.com:

1. **Hangar** — a Sim-Specs-style page listing addon aircraft, categorized by aircraft type.
2. **Articles** — a tagged blog-style section for standalone, evergreen pieces (fixes, workarounds, X-Plane-on-Linux notes).

Both surface from the homepage as CTA cards alongside Sim Specs and YouTube.

## Background

The current `themes/fourstarcaptain/layouts/_default/single.html` is hardcoded to render `data/sim-specs.yaml`. It is a sim-specs layout misfiled as the default. Adding any new single-page route (Hangar, individual articles) without fixing this means inheriting sim-specs rendering on the wrong page. Refactoring the layout is therefore part of this work, not a separate cleanup.

## Goals

- Hangar page reachable at `/hangar/`, structured like Sim Specs but populated from `data/hangar.yaml` with categories by aircraft type.
- Articles section reachable at `/articles/` with per-article URLs at `/articles/<slug>/`, sorted newest first, supporting tags via Hugo's built-in taxonomy.
- Two new homepage CTA cards: one for Hangar, one for Articles, each with a fitting line-icon in the existing feather-style.
- Existing Sim Specs page renders unchanged after the refactor.

## Non-goals

- A curated Articles landing or index beyond the chronological listing. Deferred.
- A global tags index page (e.g. `/tags/`). Hugo auto-generates per-tag pages; a global tag cloud is deferred.
- RSS feed configuration. Hugo emits one by default if we want it; leaving as-is for this iteration.
- YouTube sync workflow, search, pagination — none in scope.

## Architecture changes (foundation)

The current `_default/single.html` will be split:

- **Move** sim-specs rendering into a new `themes/fourstarcaptain/layouts/sim-specs/single.html`. Hugo's layout lookup picks this up automatically for `content/sim-specs.md` because it matches the page's logical name.
- **Restore** `themes/fourstarcaptain/layouts/_default/single.html` as a generic single-page layout that renders `.Title`, optional `.Content`, and otherwise gets out of the way. This becomes the layout used by individual article pages.
- **Add** `themes/fourstarcaptain/layouts/hangar/single.html` that mirrors the (moved) sim-specs layout but reads `hugo.Data.hangar`.

After the refactor:

| Route | Resolved layout |
|---|---|
| `/sim-specs/` | `layouts/sim-specs/single.html` |
| `/hangar/` | `layouts/hangar/single.html` |
| `/articles/` | `layouts/articles/list.html` |
| `/articles/<slug>/` | `layouts/articles/single.html` |
| `/tags/<tag>/` | `layouts/_default/term.html` |
| Any other page | `layouts/_default/single.html` |

## Hangar

### Data

`data/hangar.yaml`, identical shape to `data/sim-specs.yaml`:

```yaml
categories:
  - name: Airliners
    items:
      - name: 737-800
        value: PMDG
        note: Optional note shown beneath
        link: https://example.com/optional/url
  - name: General Aviation
    items: []
  - name: Military
    items: []
  - name: Helicopters
    items: []
```

Per-item fields:

- `name` — aircraft model (required).
- `value` — developer/publisher (required).
- `note` — optional supplementary line.
- `link` — optional URL; when present, `value` becomes a link.

The author orders categories and items as desired; the layout preserves YAML order.

### Content

`content/hangar.md`:

```toml
+++
title = "Hangar"
+++

The addon aircraft currently in the sim. Updated as the fleet changes.
```

(Author may revise the intro line; the spec only fixes the file path and title.)

### Layout

`themes/fourstarcaptain/layouts/hangar/single.html` — structurally identical to the moved sim-specs layout, with the only change being `hugo.Data.hangar` in place of `(index hugo.Data "sim-specs")`. Both layouts emit the same class names (`page`, `page-header`, `spec-category`, `spec-list`, `spec-row`, `spec-name`, `spec-value`, `spec-note`) so styling is shared.

### CSS

Rename `themes/fourstarcaptain/assets/css/_sim-specs.css` → `_specs-list.css`. Update the import line (search the codebase for the existing reference) to match. No selector changes required — the existing rules already key off `.spec-*` classes that both pages share.

### Homepage CTA

Append to `data/ctas.yaml`:

```yaml
- title: Hangar
  subtitle: The addon aircraft in the sim.
  href: /hangar/
  external: false
  icon: hangar
```

Add a new `<symbol id="cta-icon-hangar">` to the inline SVG sprite in `themes/fourstarcaptain/layouts/partials/cta.html`. Style: side-view aircraft silhouette in the same line-stroke feather-icon style as `cta-icon-sliders` (24×24 viewBox, `stroke="currentColor"`, `stroke-width="2"`, `fill="none"`).

## Articles

### Hugo section setup

Standard Hugo section under `content/articles/`:

- `content/articles/_index.md` — listing-page front matter + one-line intro:

  ```toml
  +++
  title = "Articles"
  +++

  Notes, fixes, and discoveries — mostly from running X-Plane on Linux.
  ```

- `content/articles/<slug>.md` — individual articles. Front matter:

  ```toml
  +++
  title = "Article title"
  date = 2026-05-05
  summary = "One-sentence description shown on the listing page."
  tags = ["x-plane", "linux"]
  draft = false
  +++

  Article body in Markdown.
  ```

  `title`, `date`, `summary`, `tags` are required for new articles. `draft = true` hides the article from production builds.

### Tags

Enable Hugo's built-in `tags` taxonomy in `hugo.toml`:

```toml
[taxonomies]
  tag = "tags"
```

Hugo will then auto-generate `/tags/<tag>/` pages from any `tags` front-matter array. No global `/tags/` index is exposed in navigation in this iteration.

### Layouts

- `themes/fourstarcaptain/layouts/articles/list.html` — listing for `/articles/`. Renders the page header (title + intro from `_index.md`), then iterates `.Pages` sorted by `date` descending. Each entry shows: linked title, formatted date, tag pill list, summary line.

- `themes/fourstarcaptain/layouts/articles/single.html` — individual article. Renders title, date, tag pill list, then `.Content` (the Markdown body).

- `themes/fourstarcaptain/layouts/_default/term.html` — minimal taxonomy term page. Header reads "Articles tagged: <term>", followed by the same listing markup as `articles/list.html` (filtered to that tag by Hugo automatically). Used for `/tags/<tag>/`.

- `themes/fourstarcaptain/layouts/_default/taxonomy.html` — exists only so Hugo doesn't fall back to an unintended template if the global `/tags/` URL is hit. Renders a single sentence ("No tag index yet.") and a link back to `/articles/`. Acceptable as a stub because no link in the site points here.

### CSS

A new `themes/fourstarcaptain/assets/css/_articles.css` covers:

- Article list rows (title, meta line with date and tag pills, summary).
- Tag pill style (small pill, monospace or sentence-case — match the existing typographic system in `_tokens.css`).
- Article body typography (paragraph rhythm, headings within the article body, code blocks, blockquotes, links).

The implementer is expected to read `_tokens.css` and reuse its scale/colour variables rather than introducing new ones.

### Seed content

Create one stub article so the listing page is not empty on first build:

`content/articles/x-plane-on-linux-getting-started.md` with placeholder body, real-looking front matter (`title`, current `date`, `summary`, `tags = ["x-plane", "linux"]`). The author will rewrite or delete it later.

### Homepage CTA

Append to `data/ctas.yaml`:

```yaml
- title: Articles
  subtitle: Notes, fixes, and discoveries.
  href: /articles/
  external: false
  icon: articles
```

Add a new `<symbol id="cta-icon-articles">` to the inline SVG sprite in `partials/cta.html`. Style: open-book line icon (24×24 viewBox, same stroke conventions as `cta-icon-sliders`).

## CTA grid layout

The grid currently holds two cards. After this work it holds four. The existing CSS in `_cta.css` uses a responsive grid; the implementer must verify (not assume) that four cards wrap cleanly at desktop, tablet, and mobile breakpoints, and adjust the grid template only if a regression appears.

## Verification

Run `hugo server -D` and check:

1. **Homepage** renders four CTA cards: Sim Specs, Hangar, Articles, YouTube. Cards wrap cleanly on mobile.
2. **`/sim-specs/`** renders identically to before the refactor — this is the regression-check.
3. **`/hangar/`** renders the four empty categories (or whatever sample content the implementer adds while testing) using the same visual treatment as Sim Specs.
4. **`/articles/`** renders the listing with the seed article: title, date, tags, summary.
5. **`/articles/x-plane-on-linux-getting-started/`** renders the article body with title, date, and tags.
6. **`/tags/x-plane/`** and **`/tags/linux/`** render the term page listing the seed article.
7. **Production build** (`hugo --gc --minify`) completes without warnings introduced by this change.

## Files touched (summary)

**New:**

- `data/hangar.yaml`
- `content/hangar.md`
- `content/articles/_index.md`
- `content/articles/x-plane-on-linux-getting-started.md`
- `themes/fourstarcaptain/layouts/sim-specs/single.html` (moved from `_default/single.html`)
- `themes/fourstarcaptain/layouts/hangar/single.html`
- `themes/fourstarcaptain/layouts/articles/list.html`
- `themes/fourstarcaptain/layouts/articles/single.html`
- `themes/fourstarcaptain/layouts/_default/term.html`
- `themes/fourstarcaptain/layouts/_default/taxonomy.html`
- `themes/fourstarcaptain/assets/css/_articles.css`

**Renamed:**

- `themes/fourstarcaptain/assets/css/_sim-specs.css` → `_specs-list.css`

**Modified:**

- `themes/fourstarcaptain/layouts/_default/single.html` (replaced with a true generic single-page layout)
- `themes/fourstarcaptain/layouts/partials/cta.html` (two new `<symbol>` definitions)
- `data/ctas.yaml` (two new entries; ordering: Sim Specs, Hangar, Articles, YouTube)
- `hugo.toml` (enable `tags` taxonomy)
- `themes/fourstarcaptain/layouts/_default/baseof.html` — update the `resources.Get "css/_sim-specs.css"` line to `_specs-list.css`, and add a new `resources.Get` line for `_articles.css` so the new stylesheet is included in the bundled `<style>` block.

## Deferred

- Curated articles landing page (more than chronological listing).
- Global `/tags/` index page.
- Article search.
- Pagination on `/articles/` (will be needed once article count exceeds a screenful).
- RSS feed branding/config beyond Hugo defaults.
