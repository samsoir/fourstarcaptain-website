# Hangar and Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Hangar page and an Articles section (with tags) to fourstarcaptain.com, surfaced as homepage CTA cards, on top of a foundational layout refactor that fixes the misfiled sim-specs renderer.

**Architecture:** Hugo static site. Sim-specs rendering moves out of the (incorrectly named) `_default/single.html` into a section-named layout `layouts/sim-specs/single.html`. A true generic `_default/single.html` is restored and used by article pages. Hangar gets its own `layouts/hangar/single.html` reading `data/hangar.yaml`. Articles uses a standard Hugo section (`content/articles/`) with list/single layouts and Hugo's built-in `tags` taxonomy.

**Tech Stack:** Hugo extended 0.160.0 (pinned), in-tree theme at `themes/fourstarcaptain/`, no JavaScript framework, no build tooling beyond Hugo itself. Verification per task: `hugo` builds clean, pages render correctly under `hugo server -D` at `http://localhost:1313`.

**Verification idiom (used throughout):** This project has no test framework. After each implementation step the agent MUST run `hugo --gc --minify` and confirm zero warnings/errors, then spot-check the affected route in a browser via `hugo server -D`. Treat unexpected `hugo` warnings as failures.

---

## Task 1: Refactor sim-specs layout out of `_default/single.html`

**Files:**
- Create: `themes/fourstarcaptain/layouts/sim-specs/single.html`
- Modify: `themes/fourstarcaptain/layouts/_default/single.html`
- Rename: `themes/fourstarcaptain/assets/css/_sim-specs.css` → `themes/fourstarcaptain/assets/css/_specs-list.css`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html`

- [ ] **Step 1: Capture a baseline screenshot of `/sim-specs/`**

Run a local server in the background and load the page:

```bash
hugo server -D --port 1313
```

Open `http://localhost:1313/sim-specs/` in a browser and visually note the rendering (categories, item rows, fonts). This is the regression-comparison baseline. Stop the server (`Ctrl-C`) when done.

- [ ] **Step 2: Create the new sim-specs layout file**

Create `themes/fourstarcaptain/layouts/sim-specs/single.html` with the contents below — this is the existing rendering moved verbatim, preserving its hardcoded reference to `hugo.Data` for sim-specs:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page">
  <header class="page-header">
    <h1 class="page-title">{{ .Title }}</h1>
    {{ with .Content }}<div class="page-intro">{{ . }}</div>{{ end }}
  </header>

  {{ range (index hugo.Data "sim-specs").categories }}
  <section class="spec-category">
    <h2 class="category-label">{{ .name }}</h2>
    <ul class="spec-list">
      {{ range .items }}
      <li class="spec-row">
        <span class="spec-name">{{ .name }}</span>
        <span class="spec-value">
          {{ if .link }}<a href="{{ .link }}" target="_blank" rel="noopener noreferrer">{{ .value }}</a>{{ else }}{{ .value }}{{ end }}
        </span>
        {{ with .note }}<p class="spec-note">{{ . }}</p>{{ end }}
      </li>
      {{ end }}
    </ul>
  </section>
  {{ end }}
</article>

{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 3: Replace `_default/single.html` with a generic single-page layout**

Overwrite `themes/fourstarcaptain/layouts/_default/single.html` with:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page">
  <header class="page-header">
    <h1 class="page-title">{{ .Title }}</h1>
  </header>
  <div class="page-body">
    {{ .Content }}
  </div>
</article>

{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 4: Rename the CSS file**

```bash
git mv themes/fourstarcaptain/assets/css/_sim-specs.css themes/fourstarcaptain/assets/css/_specs-list.css
```

- [ ] **Step 5: Update `baseof.html` to reference the renamed file**

In `themes/fourstarcaptain/layouts/_default/baseof.html`, replace:

```html
  {{ $simSpecs := resources.Get "css/_sim-specs.css" }}
```

with:

```html
  {{ $specsList := resources.Get "css/_specs-list.css" }}
```

And in the same file, replace:

```html
  {{ $css := slice $tokens $base $nav $hero $gallery $simSpecs $cta $footer | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

with:

```html
  {{ $css := slice $tokens $base $nav $hero $gallery $specsList $cta $footer | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 6: Build and verify no warnings**

Run:

```bash
hugo --gc --minify
```

Expected: build completes, no `WARN` lines about missing layouts or templates, `public/sim-specs/index.html` exists.

- [ ] **Step 7: Visually verify `/sim-specs/` is unchanged**

Run:

```bash
hugo server -D --port 1313
```

Load `http://localhost:1313/sim-specs/` and confirm the page renders identically to the Step 1 baseline (same categories, items, layout, typography). Stop the server.

- [ ] **Step 8: Commit**

```bash
git add themes/fourstarcaptain/layouts/sim-specs/single.html \
        themes/fourstarcaptain/layouts/_default/single.html \
        themes/fourstarcaptain/assets/css/_specs-list.css \
        themes/fourstarcaptain/layouts/_default/baseof.html
git commit -m "$(cat <<'EOF'
Refactor sim-specs layout out of _default/single.html

Move the sim-specs rendering to a section-named layout so the default
single-page template can be a true generic page, used by upcoming
Hangar and Articles work. Rename _sim-specs.css to _specs-list.css
since the styles are about to be shared by Hangar.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add the Hangar page

**Files:**
- Create: `data/hangar.yaml`
- Create: `content/hangar.md`
- Create: `themes/fourstarcaptain/layouts/hangar/single.html`

- [ ] **Step 1: Create the Hangar data file**

Create `data/hangar.yaml`:

```yaml
# Addon aircraft installed in the sim, grouped by aircraft type.
# Categories render in declaration order. Each item: { name, value, note?, link? }
# name  = aircraft model
# value = developer / publisher
# note  = optional supplementary line beneath the item
# link  = optional URL; when present, the value becomes a link.
categories:
  - name: Airliners
    items: []
  - name: General Aviation
    items: []
  - name: Military
    items: []
  - name: Helicopters
    items: []
```

(Empty item lists are intentional — the author populates them later. The categories themselves are declared so the page renders with section headings on first visit.)

- [ ] **Step 2: Create the Hangar content page**

Create `content/hangar.md`:

```markdown
+++
title = "Hangar"
+++

The addon aircraft currently in the sim. Updated as the fleet changes.
```

- [ ] **Step 3: Create the Hangar layout**

Create `themes/fourstarcaptain/layouts/hangar/single.html`:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page">
  <header class="page-header">
    <h1 class="page-title">{{ .Title }}</h1>
    {{ with .Content }}<div class="page-intro">{{ . }}</div>{{ end }}
  </header>

  {{ range hugo.Data.hangar.categories }}
  <section class="spec-category">
    <h2 class="category-label">{{ .name }}</h2>
    <ul class="spec-list">
      {{ range .items }}
      <li class="spec-row">
        <span class="spec-name">{{ .name }}</span>
        <span class="spec-value">
          {{ if .link }}<a href="{{ .link }}" target="_blank" rel="noopener noreferrer">{{ .value }}</a>{{ else }}{{ .value }}{{ end }}
        </span>
        {{ with .note }}<p class="spec-note">{{ . }}</p>{{ end }}
      </li>
      {{ end }}
    </ul>
  </section>
  {{ end }}
</article>

{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 4: Build and verify**

Run:

```bash
hugo --gc --minify
```

Expected: clean build, `public/hangar/index.html` exists.

- [ ] **Step 5: Visually verify `/hangar/`**

Run `hugo server -D --port 1313`, load `http://localhost:1313/hangar/`, confirm:
- Title "Hangar" renders.
- Intro paragraph renders below the title.
- Four empty category sections appear: Airliners, General Aviation, Military, Helicopters — each with its heading.
- Visual treatment matches the Sim Specs page (same fonts, spacing, colors) because both layouts emit identical class names.

Stop the server.

- [ ] **Step 6: Commit**

```bash
git add data/hangar.yaml content/hangar.md themes/fourstarcaptain/layouts/hangar/single.html
git commit -m "$(cat <<'EOF'
Add Hangar page listing addon aircraft by category

Mirrors the Sim Specs page structure (data + named-section layout),
reusing the .spec-* class names so the existing styling applies
without changes. Categories ship empty; the author populates them.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add the Hangar CTA card to the homepage

**Files:**
- Modify: `themes/fourstarcaptain/layouts/partials/cta.html`
- Modify: `data/ctas.yaml`

- [ ] **Step 1: Add the Hangar icon symbol**

In `themes/fourstarcaptain/layouts/partials/cta.html`, add a new `<symbol>` inside the existing `<defs>` block (after the `cta-icon-sliders` symbol, before `cta-icon-youtube`). The icon is a side-view aircraft silhouette in the same line-stroke feather style as `cta-icon-sliders`:

```html
      <symbol id="cta-icon-hangar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
      </symbol>
```

- [ ] **Step 2: Add the Hangar entry to `data/ctas.yaml`**

Replace the contents of `data/ctas.yaml` with:

```yaml
# Call-to-action cards shown on the homepage below the gallery.
# Append new entries here as content grows (articles, about page, etc.).
# Each card: { title, subtitle, href, external, icon }
# icon = key matching a <symbol> id declared in partials/cta.html's SVG sprite.
ctas:
  - title: Sim Specs
    subtitle: See what's running the sim.
    href: /sim-specs/
    external: false
    icon: sliders
  - title: Hangar
    subtitle: The addon aircraft in the sim.
    href: /hangar/
    external: false
    icon: hangar
  - title: YouTube
    subtitle: Watch the latest videos and subscribe.
    href: https://www.youtube.com/@fourstarcaptain
    external: true
    icon: youtube
```

(Articles is intentionally not added yet — that comes in Task 6.)

- [ ] **Step 3: Build and verify**

Run:

```bash
hugo --gc --minify
```

Expected: clean build.

- [ ] **Step 4: Visually verify the homepage**

Run `hugo server -D --port 1313`, load `http://localhost:1313/`, confirm:
- Three CTA cards appear in this order: Sim Specs, Hangar, YouTube.
- The Hangar card shows the airplane line icon, the title "Hangar", and the subtitle.
- Clicking the Hangar card navigates to `/hangar/`.
- Resize the browser window: confirm the cards wrap cleanly at narrow widths.

Stop the server.

- [ ] **Step 5: Commit**

```bash
git add themes/fourstarcaptain/layouts/partials/cta.html data/ctas.yaml
git commit -m "$(cat <<'EOF'
Add Hangar CTA card on the homepage

Inserts a side-view aircraft icon symbol and a third card linking
to /hangar/. Sits between Sim Specs and YouTube to keep the
internal pages adjacent.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Enable the `tags` taxonomy

**Files:**
- Modify: `hugo.toml`

- [ ] **Step 1: Update `hugo.toml`**

Currently `hugo.toml` line 5 reads:

```toml
disableKinds = ["taxonomy", "term"]
```

Replace it with:

```toml
disableKinds = []
```

Then add a new section at the end of the file:

```toml
[taxonomies]
  tag = "tags"
```

The complete `[taxonomies]` block must appear at the top level of the file (i.e. not inside another `[section]`).

- [ ] **Step 2: Build and verify**

Run:

```bash
hugo --gc --minify
```

Expected: clean build. The build output may now mention "tags" in the kinds list. No errors.

- [ ] **Step 3: Commit**

```bash
git add hugo.toml
git commit -m "$(cat <<'EOF'
Enable Hugo tags taxonomy

Re-enables the previously-disabled taxonomy and term kinds and
declares a single 'tag' taxonomy. Required by the Articles section
landing in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add the Articles section (content, layouts, CSS, seed article)

**Files:**
- Create: `content/articles/_index.md`
- Create: `content/articles/x-plane-on-linux-getting-started.md`
- Create: `themes/fourstarcaptain/layouts/articles/list.html`
- Create: `themes/fourstarcaptain/layouts/articles/single.html`
- Create: `themes/fourstarcaptain/layouts/_default/term.html`
- Create: `themes/fourstarcaptain/layouts/_default/taxonomy.html`
- Create: `themes/fourstarcaptain/assets/css/_articles.css`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html`

- [ ] **Step 1: Create the Articles section index**

Create `content/articles/_index.md`:

```markdown
+++
title = "Articles"
+++

Notes, fixes, and discoveries — mostly from running X-Plane on Linux.
```

- [ ] **Step 2: Create the seed article**

Create `content/articles/x-plane-on-linux-getting-started.md`:

```markdown
+++
title = "Getting X-Plane Running on Linux"
date = 2026-05-05
summary = "A starting checklist for X-Plane 12 on a recent Linux desktop — drivers, audio, controllers, and the small things that bite."
tags = ["x-plane", "linux"]
draft = false
+++

This is a placeholder article. It exists so the listing and single-article
layouts have something to render until real content is written.

## Drivers

Notes on GPU drivers go here.

## Audio

Notes on audio configuration go here.

## Controllers

Notes on yokes, throttles, and rudder pedals go here.
```

- [ ] **Step 3: Create the Articles list layout**

Create `themes/fourstarcaptain/layouts/articles/list.html`:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page">
  <header class="page-header">
    <h1 class="page-title">{{ .Title }}</h1>
    {{ with .Content }}<div class="page-intro">{{ . }}</div>{{ end }}
  </header>

  <ul class="article-list">
    {{ range .Pages.ByDate.Reverse }}
    <li class="article-list-item">
      <h2 class="article-list-title"><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
      <p class="article-meta">
        <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
        {{ with .Params.tags }}
        <span class="article-tags">
          {{ range . }}<a class="article-tag" href="/tags/{{ . | urlize }}/">{{ . }}</a>{{ end }}
        </span>
        {{ end }}
      </p>
      {{ with .Params.summary }}<p class="article-summary">{{ . }}</p>{{ end }}
    </li>
    {{ end }}
  </ul>
</article>

{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 4: Create the Articles single layout**

Create `themes/fourstarcaptain/layouts/articles/single.html`:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page article">
  <header class="page-header">
    <h1 class="page-title">{{ .Title }}</h1>
    <p class="article-meta">
      <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
      {{ with .Params.tags }}
      <span class="article-tags">
        {{ range . }}<a class="article-tag" href="/tags/{{ . | urlize }}/">{{ . }}</a>{{ end }}
      </span>
      {{ end }}
    </p>
  </header>

  <div class="article-body">
    {{ .Content }}
  </div>
</article>

{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 5: Create the taxonomy term layout (one-tag listing)**

Create `themes/fourstarcaptain/layouts/_default/term.html`:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page">
  <header class="page-header">
    <h1 class="page-title">Articles tagged: {{ .Title }}</h1>
    <p class="page-intro"><a href="/articles/">← All articles</a></p>
  </header>

  <ul class="article-list">
    {{ range .Pages.ByDate.Reverse }}
    <li class="article-list-item">
      <h2 class="article-list-title"><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
      <p class="article-meta">
        <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
        {{ with .Params.tags }}
        <span class="article-tags">
          {{ range . }}<a class="article-tag" href="/tags/{{ . | urlize }}/">{{ . }}</a>{{ end }}
        </span>
        {{ end }}
      </p>
      {{ with .Params.summary }}<p class="article-summary">{{ . }}</p>{{ end }}
    </li>
    {{ end }}
  </ul>
</article>

{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 6: Create the taxonomy index stub**

Create `themes/fourstarcaptain/layouts/_default/taxonomy.html`:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page">
  <header class="page-header">
    <h1 class="page-title">Tags</h1>
    <p class="page-intro">No tag index yet. <a href="/articles/">Browse articles instead.</a></p>
  </header>
</article>

{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 7: Create the Articles CSS**

Create `themes/fourstarcaptain/assets/css/_articles.css`:

```css
/* Article list (used by /articles/ and /tags/<tag>/) */
.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-list-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--color-rule, rgba(255, 255, 255, 0.08));
}

.article-list-item:last-child {
  border-bottom: none;
}

.article-list-title {
  margin: 0 0 0.35rem 0;
  font-size: 1.35rem;
  line-height: 1.25;
}

.article-list-title a {
  color: var(--color-text, inherit);
  text-decoration: none;
}

.article-list-title a:hover {
  text-decoration: underline;
}

.article-meta {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: var(--color-text-muted, rgba(255, 255, 255, 0.6));
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.article-meta time {
  font-variant-numeric: tabular-nums;
}

.article-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.article-tag {
  display: inline-block;
  padding: 0.1rem 0.55rem;
  border: 1px solid var(--color-rule, rgba(255, 255, 255, 0.18));
  border-radius: 999px;
  font-size: 0.75rem;
  text-decoration: none;
  color: var(--color-text-muted, rgba(255, 255, 255, 0.75));
  text-transform: lowercase;
}

.article-tag:hover {
  color: var(--color-text, #fff);
  border-color: var(--color-text, rgba(255, 255, 255, 0.6));
}

.article-summary {
  margin: 0;
  color: var(--color-text-muted, rgba(255, 255, 255, 0.75));
  line-height: 1.5;
}

/* Single article body */
.article-body {
  max-width: 70ch;
  line-height: 1.65;
}

.article-body h2 {
  margin-top: 2rem;
  font-size: 1.4rem;
}

.article-body h3 {
  margin-top: 1.5rem;
  font-size: 1.15rem;
}

.article-body p,
.article-body ul,
.article-body ol,
.article-body blockquote {
  margin: 1rem 0;
}

.article-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: var(--color-code-bg, rgba(255, 255, 255, 0.08));
}

.article-body pre {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 6px;
  background: var(--color-code-bg, rgba(255, 255, 255, 0.08));
}

.article-body pre code {
  background: transparent;
  padding: 0;
}

.article-body blockquote {
  border-left: 3px solid var(--color-rule, rgba(255, 255, 255, 0.25));
  padding-left: 1rem;
  color: var(--color-text-muted, rgba(255, 255, 255, 0.75));
}

.article-body a {
  color: var(--color-link, inherit);
}
```

(The `var(... , <fallback>)` pattern means the file works even if a token isn't defined yet in `_tokens.css` — it falls back to a sensible value. The implementer should still inspect `_tokens.css` and replace fallback values that would clash with the site's actual palette.)

- [ ] **Step 8: Wire `_articles.css` into `baseof.html`**

In `themes/fourstarcaptain/layouts/_default/baseof.html`, add a new resource line below the `_specs-list.css` line:

```html
  {{ $articles := resources.Get "css/_articles.css" }}
```

And update the slice line to include it (immediately after `$specsList`):

```html
  {{ $css := slice $tokens $base $nav $hero $gallery $specsList $articles $cta $footer | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 9: Build and verify**

Run:

```bash
hugo --gc --minify
```

Expected: clean build. Confirm these output files exist:

```bash
ls public/articles/index.html \
   public/articles/x-plane-on-linux-getting-started/index.html \
   public/tags/x-plane/index.html \
   public/tags/linux/index.html \
   public/tags/index.html
```

All five should exist. If any are missing the taxonomy is misconfigured — re-check Task 4.

- [ ] **Step 10: Visually verify all article routes**

Run `hugo server -D --port 1313`, then check each route:

- `http://localhost:1313/articles/` — listing shows the seed article with title (linked), date "May 5, 2026", two tag pills (`x-plane`, `linux`), and the summary.
- `http://localhost:1313/articles/x-plane-on-linux-getting-started/` — full article renders with title, meta line, and Markdown body (placeholder paragraphs, two H2 sub-sections).
- `http://localhost:1313/tags/x-plane/` — heading "Articles tagged: x-plane" with the seed article listed below.
- `http://localhost:1313/tags/linux/` — same, for `linux`.
- `http://localhost:1313/tags/` — stub page with the message and link back to articles.

Stop the server.

- [ ] **Step 11: Commit**

```bash
git add content/articles/ \
        themes/fourstarcaptain/layouts/articles/ \
        themes/fourstarcaptain/layouts/_default/term.html \
        themes/fourstarcaptain/layouts/_default/taxonomy.html \
        themes/fourstarcaptain/assets/css/_articles.css \
        themes/fourstarcaptain/layouts/_default/baseof.html
git commit -m "$(cat <<'EOF'
Add Articles section with tags

Standard Hugo section under content/articles/ with list and single
layouts, tag pages via the built-in taxonomy, and a seed article so
the listing renders. CSS hangs off existing tokens with safe fallbacks.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Add the Articles CTA card to the homepage

**Files:**
- Modify: `themes/fourstarcaptain/layouts/partials/cta.html`
- Modify: `data/ctas.yaml`

- [ ] **Step 1: Add the Articles icon symbol**

In `themes/fourstarcaptain/layouts/partials/cta.html`, add a new `<symbol>` inside the existing `<defs>` block (after `cta-icon-hangar`, before `cta-icon-youtube`). Open-book line icon:

```html
      <symbol id="cta-icon-articles" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 7v14"/>
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
      </symbol>
```

- [ ] **Step 2: Insert the Articles entry into `data/ctas.yaml`**

Replace the contents of `data/ctas.yaml` with:

```yaml
# Call-to-action cards shown on the homepage below the gallery.
# Append new entries here as content grows (articles, about page, etc.).
# Each card: { title, subtitle, href, external, icon }
# icon = key matching a <symbol> id declared in partials/cta.html's SVG sprite.
ctas:
  - title: Sim Specs
    subtitle: See what's running the sim.
    href: /sim-specs/
    external: false
    icon: sliders
  - title: Hangar
    subtitle: The addon aircraft in the sim.
    href: /hangar/
    external: false
    icon: hangar
  - title: Articles
    subtitle: Notes, fixes, and discoveries.
    href: /articles/
    external: false
    icon: articles
  - title: YouTube
    subtitle: Watch the latest videos and subscribe.
    href: https://www.youtube.com/@fourstarcaptain
    external: true
    icon: youtube
```

- [ ] **Step 3: Build and verify**

Run:

```bash
hugo --gc --minify
```

Expected: clean build.

- [ ] **Step 4: Visually verify the homepage with four cards**

Run `hugo server -D --port 1313`, then:

- Load `http://localhost:1313/`. Confirm four CTA cards in order: Sim Specs, Hangar, Articles, YouTube.
- The Articles card shows the open-book icon, title "Articles", subtitle "Notes, fixes, and discoveries.".
- Clicking the Articles card navigates to `/articles/`.
- Resize the browser through wide desktop, ~1024px tablet, and ~375px mobile widths. Confirm the four cards wrap cleanly without overflow or awkward gaps.
- If wrapping breaks at any width, inspect `themes/fourstarcaptain/assets/css/_cta.css` and adjust the `grid-template-columns` rule to accommodate four cards. Document the change in the commit message if one is needed.

Stop the server.

- [ ] **Step 5: Commit**

```bash
git add themes/fourstarcaptain/layouts/partials/cta.html data/ctas.yaml
git commit -m "$(cat <<'EOF'
Add Articles CTA card on the homepage

Fourth card linking to /articles/, sitting between Hangar and the
external YouTube link to keep all internal sections grouped.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Final end-to-end verification

**Files:** none modified.

- [ ] **Step 1: Clean production build**

```bash
rm -rf public resources
hugo --gc --minify
```

Expected: zero errors, zero warnings about missing layouts/templates/data.

- [ ] **Step 2: Confirm all expected output files exist**

```bash
ls public/index.html \
   public/sim-specs/index.html \
   public/hangar/index.html \
   public/articles/index.html \
   public/articles/x-plane-on-linux-getting-started/index.html \
   public/tags/x-plane/index.html \
   public/tags/linux/index.html \
   public/tags/index.html
```

All eight should print without error.

- [ ] **Step 3: Confirm the deploy workflow file is unchanged**

Run:

```bash
git diff --quiet HEAD -- .github/workflows/deploy.yml && echo "OK: deploy.yml untouched"
```

Expected: `OK: deploy.yml untouched`. The deploy pipeline must not have been altered by this work.

- [ ] **Step 4: Spot-check the live-rendered site one more time**

Run `hugo server -D --port 1313` and load each of these URLs in a browser, confirming each renders without console errors and looks correct:

- `/`
- `/sim-specs/`
- `/hangar/`
- `/articles/`
- `/articles/x-plane-on-linux-getting-started/`
- `/tags/x-plane/`

Stop the server.

---

## Task 8: Remove the design spec

The user requested the spec be removed once the implementation is complete.

**Files:**
- Delete: `docs/superpowers/specs/2026-05-05-hangar-and-articles-design.md`

- [ ] **Step 1: Remove the spec file**

```bash
git rm docs/superpowers/specs/2026-05-05-hangar-and-articles-design.md
```

- [ ] **Step 2: Confirm no other files reference it**

```bash
grep -r "2026-05-05-hangar-and-articles-design" . --exclude-dir=.git --exclude-dir=public --exclude-dir=resources
```

Expected: no output (no references remain).

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
Remove Hangar/Articles design spec now that the work has shipped

Per author preference: design specs are scaffolding for the
implementation pass and don't need to live in the repository
afterward.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-review notes

- **Spec coverage:** every section of the spec maps to a task. Architecture refactor → Task 1. Hangar (data, content, layout, CSS-via-rename, CTA) → Tasks 2–3. Articles (Hugo section, tags taxonomy, layouts, term/taxonomy stubs, CSS, seed) → Tasks 4–5. Articles CTA → Task 6. Verification → Task 7. Spec deletion (post-spec author request) → Task 8.
- **Type/name consistency:** classes used across layouts and CSS — `.spec-category`, `.spec-list`, `.spec-row`, `.spec-name`, `.spec-value`, `.spec-note` (sim-specs and hangar share these); `.article-list`, `.article-list-item`, `.article-list-title`, `.article-meta`, `.article-tags`, `.article-tag`, `.article-summary`, `.article-body` (articles); CTA icon ids `cta-icon-sliders`, `cta-icon-hangar`, `cta-icon-articles`, `cta-icon-youtube`. All references match across tasks.
- **Placeholders:** none. Every code/config block contains the literal content the engineer will write.
- **Out-of-band concern:** Task 4 removes `taxonomy` and `term` from `disableKinds`. Task 5 depends on this — the build will silently produce no `tags/*` output if Task 4 is skipped. Step 9 of Task 5 explicitly checks for the taxonomy output files to catch this.
