# Homepage, Navigation, Footer, and Sim Specs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the coming-soon placeholder with the real homepage (hero + gallery + footer), add site-wide navigation, and ship the `/sim-specs/` page — all on the design-system token scaffolding established in this spec.

**Architecture:** Extend the existing Hugo theme at `themes/fourstarcaptain/` with partial templates (`nav.html`, `hero.html`, `gallery.html`, `footer.html`) and a split CSS module set concatenated at build time via `resources.Concat`. Thumbnails are referenced directly from YouTube's CDN. Hero video is self-hosted with a still-frame fallback. Tasks 1-7 are "silent" — they add files and CSS without altering the currently-deployed coming-soon page; Task 8 is the visible flip.

**Tech Stack:** Hugo extended 0.160.0, Hugo template pipeline (`resources.Get | resources.Concat | resources.Minify | resources.Fingerprint`), vanilla CSS custom properties, ~15 lines of vanilla JavaScript, YAML data files, Google Fonts (Inter + Montserrat).

**Working directory:** `/media/Disk6/Projects/fourstarcaptain.com`

**Source spec:** `docs/superpowers/specs/2026-04-23-homepage-and-sim-specs-design.md`

**Pre-existing state:** Phase 1 deployment live at `https://fourstarcaptain.com/` with a coming-soon page (black bg + centered badge + Inter wordmark + Montserrat attribution). Theme at `themes/fourstarcaptain/` has a single `layouts/_default/baseof.html`, `layouts/index.html`, and `assets/css/main.css`. CI via `.github/workflows/deploy.yml` on push to `main`.

**Note on "tests":** Static Hugo site with no unit-test harness. Each task uses concrete verification gates: `hugo` build success, `grep` against rendered HTML, `curl` against the dev server, and — where visual, at Task 8 — a human-verified render of a list of class names found in the DOM.

**Placeholder assets:** The plan commits a placeholder `hero-poster.jpg` (black, 1920×1080, ~5 KB) but NOT `hero.webm` / `hero.mp4`. The `<video>` sources reference those paths but the CSS puts `/hero-poster.jpg` as a background on `.hero`, so a missing video falls back to a static poster without layout breakage. The user drops in their b-roll after the plan ships.

**Scope reminder:** YouTube sync, articles, per-video pages, search, analytics, and light-theme variants are out of scope. See the spec for the full list.

---

## Task 1: Design-system foundation, Inter font, CSS module split

Establish the CSS module split and the token + base modules that every later task builds on. The coming-soon page must continue to render identically — this is a scaffolding task, not a visible change.

**Files:**
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (Google Fonts URL, CSS pipeline switch to `resources.Concat`)
- Create: `themes/fourstarcaptain/assets/css/_tokens.css`
- Create: `themes/fourstarcaptain/assets/css/_base.css`
- Create: `themes/fourstarcaptain/assets/css/_coming-soon.css` (extracted from current `main.css`)
- Delete: `themes/fourstarcaptain/assets/css/main.css` (contents now split across the three new files)

- [ ] **Step 1: Create `_tokens.css` with the full token set**

Write to `themes/fourstarcaptain/assets/css/_tokens.css`:

```css
:root {
  color-scheme: dark;

  /* Colors */
  --bg: #000;
  --fg: #fff;
  --accent: #b50000;
  --accent-hover: #e6002e;
  --muted: #8a8a8a;
  --soft: #1a1a1a;
  --line: #262626;
  --nav-bg: rgba(0, 0, 0, 0.85);

  /* Typography */
  --t-hero: clamp(2.5rem, 6vw, 4.5rem);
  --t-h1: clamp(2rem, 4.5vw, 3rem);
  --t-h2: clamp(1.25rem, 2.2vw, 1.5rem);
  --t-body: 1rem;
  --t-small: 0.85rem;
  --t-caption: 0.7rem;

  /* Spacing */
  --s-1: 0.25rem;
  --s-2: 0.5rem;
  --s-3: 0.75rem;
  --s-4: 1rem;
  --s-5: 1.5rem;
  --s-6: 2rem;
  --s-7: 3rem;
  --s-8: 4rem;
  --s-9: 6rem;
}
```

- [ ] **Step 2: Create `_base.css`**

Write to `themes/fourstarcaptain/assets/css/_base.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

body {
  font-size: var(--t-body);
  line-height: 1.5;
}

a { color: inherit; text-decoration: none; }
a:hover { color: var(--accent-hover); }

img, video { display: block; max-width: 100%; height: auto; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Create `_coming-soon.css` with the existing coming-soon rules**

Write to `themes/fourstarcaptain/assets/css/_coming-soon.css`:

```css
.coming-soon {
  min-height: 100svh;
  display: grid;
  grid-template-rows: 1fr auto;
  justify-items: center;
  padding: 2rem 1.5rem;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  align-self: center;
}

.logo {
  width: clamp(160px, 28vw, 240px);
  height: auto;
  display: block;
}

.wordmark {
  margin: 0;
  font-weight: 600;
  font-size: clamp(2rem, 5vw, 3.25rem);
  letter-spacing: 0.01em;
  text-align: center;
}

.studio {
  text-align: center;
  padding-bottom: 1rem;
}

.attribution {
  margin: 0 0 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
}

.attribution .signature {
  font-size: 1rem;
  letter-spacing: 0.5em;
  padding-left: 0.5em;
}

.attribution .signature::after {
  content: "";
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  margin-left: 0.15em;
  background: url('/de-freyssinet-star.svg') no-repeat center / contain;
  vertical-align: baseline;
}

.attribution .lowercase {
  text-transform: lowercase;
  color: var(--accent);
}

.attribution .studios {
  font-size: 0.7rem;
  letter-spacing: 0.65em;
  padding-left: 0.65em;
  opacity: 0.9;
}

.copyright {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  opacity: 0.7;
}
```

This file is temporary — Task 8 deletes it when the coming-soon page is replaced.

- [ ] **Step 4: Delete `main.css`**

```bash
rm themes/fourstarcaptain/assets/css/main.css
```

- [ ] **Step 5: Update `baseof.html` — Google Fonts URL and CSS pipeline**

Replace the existing Google Fonts `<link rel="stylesheet">` line and the CSS asset pipeline in `themes/fourstarcaptain/layouts/_default/baseof.html`.

Change this line:

```html
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@600&family=Montserrat:wght@500&display=swap">
```

to:

```html
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@500&display=swap">
```

And change these two lines:

```html
  {{ $css := resources.Get "css/main.css" | resources.Minify | resources.Fingerprint }}
  <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
```

to:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $comingSoon := resources.Get "css/_coming-soon.css" }}
  {{ $css := slice $tokens $base $comingSoon | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
  <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
```

- [ ] **Step 6: Build and verify coming-soon page still renders correctly**

Run:

```bash
rm -rf public/ resources/
hugo --gc --minify
```

Expected: exit 0, no warnings.

Run:

```bash
grep -c 'class=coming-soon\|class="coming-soon"' public/index.html
grep -c 'wordmark' public/index.html
grep -c 'Inter:wght@400' public/index.html
grep -c 'de-freyssinet-star' public/css/main.*.css
```

Expected: each grep prints `1`.

- [ ] **Step 7: Visual smoke-check the dev server**

```bash
hugo server --port 1313 --bind 127.0.0.1 &
HUGO_PID=$!
sleep 2
curl -sS http://127.0.0.1:1313/ | grep -oE 'class="(coming-soon|brand|wordmark|studio|attribution|signature|lowercase|studios|copyright|logo)"' | sort -u
kill $HUGO_PID
```

Expected output (ten lines, alphabetical):

```
class="attribution"
class="brand"
class="coming-soon"
class="copyright"
class="logo"
class="lowercase"
class="signature"
class="studio"
class="studios"
class="wordmark"
```

- [ ] **Step 8: Commit**

```bash
git add themes/fourstarcaptain/
git commit -m "$(cat <<'EOF'
Split theme CSS into modules and load Inter 400

Introduce _tokens.css and _base.css as the design-system foundation.
Move the existing coming-soon rules to _coming-soon.css verbatim so
the deployed page renders identically. Switch baseof.html to concat
the three CSS modules via resources.Concat. Add Inter 400 alongside
the existing Inter 600 / Montserrat 500 weights.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Nav-scroll JavaScript and body class hook

Add the tiny script that reflects scroll position into a `scrolled` class on `<body>`. Does not change any visible behaviour in this task — `scrolled` has no style attached until Task 3.

**Files:**
- Create: `themes/fourstarcaptain/assets/js/nav-scroll.js`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (add `<script defer>` + `has-hero` body class)

- [ ] **Step 1: Create the script**

Write to `themes/fourstarcaptain/assets/js/nav-scroll.js`:

```javascript
const body = document.body;
const onScroll = () => body.classList.toggle('scrolled', window.scrollY > 80);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
```

- [ ] **Step 2: Wire the script into `baseof.html`**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Immediately before the closing `</head>` tag, insert:

```html
  {{ $navJs := resources.Get "js/nav-scroll.js" | resources.Minify | resources.Fingerprint }}
  <script defer src="{{ $navJs.RelPermalink }}" integrity="{{ $navJs.Data.Integrity }}"></script>
```

- [ ] **Step 3: Add the `has-hero` body class**

In the same `baseof.html`, change the `<body>` opening tag from:

```html
<body>
```

to:

```html
<body{{ if eq .Kind "home" }} class="has-hero"{{ end }}>
```

This sets the class on the homepage only. Other pages render without it.

- [ ] **Step 4: Build and verify**

```bash
rm -rf public/ resources/
hugo --gc --minify
grep -c '<body class="has-hero">' public/index.html
grep -c 'nav-scroll' public/index.html
ls public/js/nav-scroll.min.*.js
```

Expected: each grep prints `1`; the `ls` lists the fingerprinted JS file with exit 0.

- [ ] **Step 5: Dev server sanity**

```bash
hugo server --port 1313 --bind 127.0.0.1 &
HUGO_PID=$!
sleep 2
curl -sS -o /tmp/index.html http://127.0.0.1:1313/
grep -q '<body class="has-hero">' /tmp/index.html && echo HAS_HERO_OK || echo HAS_HERO_FAIL
kill $HUGO_PID
```

Expected: `HAS_HERO_OK`.

- [ ] **Step 6: Commit**

```bash
git add themes/fourstarcaptain/
git commit -m "$(cat <<'EOF'
Add nav-scroll.js and has-hero body class hook

The script toggles a "scrolled" class on <body> when the user scrolls
past 80px; baseof.html now applies "has-hero" on the homepage only.
No visible change yet — the class hooks are in place for Task 3's
nav styling.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Nav partial and CSS

Build the nav partial and its stylesheet. The partial is not yet included in any layout, so the coming-soon page is unaffected; the nav CSS lands in the concatenated stylesheet harmlessly.

**Files:**
- Create: `themes/fourstarcaptain/layouts/partials/nav.html`
- Create: `themes/fourstarcaptain/assets/css/_nav.css`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (add `_nav.css` to the concat slice)

- [ ] **Step 1: Create `partials/nav.html`**

Write to `themes/fourstarcaptain/layouts/partials/nav.html`:

```html
<nav class="nav" aria-label="Primary">
  <a class="nav-home" href="/" rel="home" aria-label="Four Star Captain — Home">
    <img src="/logo.svg" alt="" aria-hidden="true" width="40" height="40">
    <span class="nav-home-label">Four Star Captain</span>
  </a>
  <ul class="nav-links">
    <li><a href="/sim-specs/">Sim Specs</a></li>
    <li>
      <a href="{{ .Site.Params.youtube }}"
         target="_blank" rel="noopener noreferrer"
         aria-label="YouTube channel (opens in new tab)">
        YouTube <span aria-hidden="true">↗</span>
      </a>
    </li>
  </ul>
</nav>
```

- [ ] **Step 2: Create `_nav.css`**

Write to `themes/fourstarcaptain/assets/css/_nav.css`:

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--s-3) var(--s-5);
  background: var(--nav-bg);
  backdrop-filter: blur(8px);
  transition: background 250ms ease, backdrop-filter 250ms ease;
}

body.has-hero:not(.scrolled) .nav {
  background: transparent;
  backdrop-filter: none;
}

.nav-home {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  color: var(--fg);
  font-size: var(--t-small);
  letter-spacing: 0.04em;
}

.nav-home img {
  width: 28px;
  height: 28px;
}

.nav-home-label {
  font-weight: 600;
}

.nav-links {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--s-5);
}

.nav-links a {
  font-size: var(--t-small);
  color: var(--fg);
  letter-spacing: 0.04em;
  transition: color 150ms ease;
}

.nav-links a:hover,
.nav-links a:focus-visible {
  color: var(--accent-hover);
}

.nav :focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 2px;
}

@media (max-width: 720px) {
  .nav { padding: var(--s-2) var(--s-4); }
  .nav-home img { width: 24px; height: 24px; }
  .nav-home-label { display: none; }
  .nav-links { gap: var(--s-4); }
}
```

- [ ] **Step 3: Add `_nav.css` to the concat slice in `baseof.html`**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Locate the CSS pipeline block:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $comingSoon := resources.Get "css/_coming-soon.css" }}
  {{ $css := slice $tokens $base $comingSoon | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

Replace with:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $nav := resources.Get "css/_nav.css" }}
  {{ $comingSoon := resources.Get "css/_coming-soon.css" }}
  {{ $css := slice $tokens $base $nav $comingSoon | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 4: Build and verify CSS picks up `_nav.css`**

```bash
rm -rf public/ resources/
hugo --gc --minify
grep -c 'body.has-hero:not(.scrolled)' public/css/main.*.css
grep -c 'nav-links' public/css/main.*.css
```

Expected: both greps print `1`.

- [ ] **Step 5: Confirm coming-soon page still renders unchanged**

```bash
curl -sS -o /tmp/idx.html http://127.0.0.1:1313/ 2>/dev/null || (hugo server --port 1313 --bind 127.0.0.1 &
HUGO_PID=$!
sleep 2
curl -sS -o /tmp/idx.html http://127.0.0.1:1313/
kill $HUGO_PID)
grep -q 'class="wordmark">Four Star Captain' /tmp/idx.html && echo COMING_SOON_OK || echo COMING_SOON_FAIL
grep -c '<nav' /tmp/idx.html
```

Expected: `COMING_SOON_OK`; the `<nav` grep prints `0` (partial not yet included anywhere).

- [ ] **Step 6: Commit**

```bash
git add themes/fourstarcaptain/
git commit -m "$(cat <<'EOF'
Add nav partial and stylesheet (not yet wired in)

Creates partials/nav.html with the home-link brand mark and two
nav items (Sim Specs, YouTube). The accompanying _nav.css handles
the transparent/solid transition via body.has-hero:not(.scrolled).
The partial is not yet included in any layout; it will be consumed
by the homepage rewrite in Task 8 and by single.html in Task 7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Footer partial and CSS

Factor the studio signature out of the coming-soon page into a shared footer partial and add the left-side YouTube + XEarthLayer links alongside it.

**Files:**
- Create: `themes/fourstarcaptain/layouts/partials/footer.html`
- Create: `themes/fourstarcaptain/assets/css/_footer.css`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (add `_footer.css` to concat)

- [ ] **Step 1: Create `partials/footer.html`**

Write to `themes/fourstarcaptain/layouts/partials/footer.html`:

```html
<footer class="site-footer">
  <ul class="footer-links">
    <li>
      <a href="{{ .Site.Params.youtube }}" target="_blank" rel="noopener noreferrer">YouTube</a>
    </li>
    <li>
      <a href="{{ .Site.Params.xearthlayer }}" target="_blank" rel="noopener noreferrer">XEarthLayer</a>
    </li>
  </ul>
  <div class="footer-signoff">
    <p class="copyright">Copyright &copy; MMXXVI Four Star Captain. All rights reserved.</p>
    <p class="attribution">
      <span class="signature"><span class="lowercase">de</span> Freyssinet</span>
      <span class="studios">Studios</span>
    </p>
  </div>
</footer>
```

- [ ] **Step 2: Create `_footer.css`**

Write to `themes/fourstarcaptain/assets/css/_footer.css`:

```css
.site-footer {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: var(--s-6);
  padding: var(--s-6) var(--s-5);
  border-top: 1px solid var(--line);
  margin-top: var(--s-8);
}

.footer-links {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: var(--s-3);
  align-items: center;
  font-size: var(--t-small);
}

.footer-links li:not(:last-child)::after {
  content: "·";
  color: var(--muted);
  margin-left: var(--s-3);
}

.footer-links a {
  color: var(--fg);
  transition: color 150ms ease;
}

.footer-links a:hover,
.footer-links a:focus-visible { color: var(--accent-hover); }

.footer-signoff {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  align-items: flex-end;
}

.footer-signoff .copyright {
  margin: 0;
  font-size: var(--t-small);
  color: var(--muted);
}

.footer-signoff .attribution {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--s-1);
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
}

.footer-signoff .attribution .signature {
  font-size: var(--t-caption);
  letter-spacing: 0.4em;
}

.footer-signoff .attribution .signature::after {
  content: "";
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  margin-left: 0.15em;
  background: url('/de-freyssinet-star.svg') no-repeat center / contain;
  vertical-align: baseline;
}

.footer-signoff .attribution .lowercase {
  text-transform: lowercase;
  color: var(--accent);
}

.footer-signoff .attribution .studios {
  font-size: 0.65rem;
  letter-spacing: 0.55em;
  padding-left: 0.55em;
  opacity: 0.9;
}

@media (max-width: 720px) {
  .site-footer {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .footer-links { justify-content: center; }
  .footer-signoff { align-items: center; text-align: center; }
  .footer-signoff .attribution { align-items: center; }
}
```

- [ ] **Step 3: Add `_footer.css` to the concat slice**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Replace the CSS pipeline block with:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $nav := resources.Get "css/_nav.css" }}
  {{ $footer := resources.Get "css/_footer.css" }}
  {{ $comingSoon := resources.Get "css/_coming-soon.css" }}
  {{ $css := slice $tokens $base $nav $footer $comingSoon | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 4: Build and verify**

```bash
rm -rf public/ resources/
hugo --gc --minify
grep -c 'site-footer' public/css/main.*.css
grep -c 'footer-signoff' public/css/main.*.css
grep -c '<footer class="site-footer">' public/index.html
```

Expected: first two greps print `1`; the HTML grep prints `0` (partial not yet included).

- [ ] **Step 5: Commit**

```bash
git add themes/fourstarcaptain/
git commit -m "$(cat <<'EOF'
Add footer partial and stylesheet (not yet wired in)

Creates partials/footer.html with the YouTube and XEarthLayer links
on the left and the de Freyssinet Studios signature on the right.
The partial is not yet included in any layout; it will be consumed
by the homepage rewrite in Task 8 and by single.html in Task 7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Hero partial, CSS, and placeholder poster

Build the hero partial, its stylesheet, and a placeholder poster JPEG. Video source files (`hero.webm`, `hero.mp4`) are intentionally NOT created — the user drops in their own b-roll later. The poster + CSS background ensure a missing video still yields a clean-looking hero zone.

**Files:**
- Create: `themes/fourstarcaptain/layouts/partials/hero.html`
- Create: `themes/fourstarcaptain/assets/css/_hero.css`
- Create: `static/hero-poster.jpg` (generated via ImageMagick)
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (add `_hero.css` to concat)

- [ ] **Step 1: Generate the placeholder poster**

Run:

```bash
convert -size 1920x1080 \
  gradient:'#000000-#0a0a0a' \
  -quality 80 \
  static/hero-poster.jpg
ls -la static/hero-poster.jpg
file static/hero-poster.jpg
```

Expected: file exists, under 20 KB, `file` reports `JPEG image data, ..., 1920x1080`.

- [ ] **Step 2: Create `partials/hero.html`**

Write to `themes/fourstarcaptain/layouts/partials/hero.html`:

```html
<section class="hero" aria-label="{{ .Site.Title }}">
  <video class="hero-video" autoplay muted loop playsinline
         preload="metadata" poster="/hero-poster.jpg"
         disablepictureinpicture>
    <source src="/hero.webm" type="video/webm">
    <source src="/hero.mp4"  type="video/mp4">
  </video>
  <div class="hero-scrim" aria-hidden="true"></div>
  <div class="hero-overlay">
    <img class="hero-logo" src="/logo.svg" alt="" width="220" height="220" aria-hidden="true">
    <h1 class="hero-wordmark">{{ .Site.Title }}</h1>
  </div>
</section>
```

- [ ] **Step 3: Create `_hero.css`**

Write to `themes/fourstarcaptain/assets/css/_hero.css`:

```css
.hero {
  position: relative;
  width: 100%;
  height: clamp(480px, 70vh, 800px);
  background: url('/hero-poster.jpg') center / cover var(--bg);
  overflow: hidden;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, transparent 120px),
    linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, transparent 180px);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  grid-auto-flow: row;
  gap: var(--s-5);
  padding: var(--s-5);
}

.hero-logo {
  width: clamp(140px, 18vw, 220px);
  height: auto;
}

.hero-wordmark {
  margin: 0;
  font-weight: 600;
  font-size: var(--t-hero);
  letter-spacing: 0.01em;
  text-align: center;
}

@media (max-width: 720px) {
  .hero { height: 50vh; min-height: 380px; }
  .hero-logo { width: clamp(120px, 28vw, 160px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-video { display: none; }
}
```

- [ ] **Step 4: Add `_hero.css` to the concat slice**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Replace the CSS pipeline block with:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $nav := resources.Get "css/_nav.css" }}
  {{ $hero := resources.Get "css/_hero.css" }}
  {{ $footer := resources.Get "css/_footer.css" }}
  {{ $comingSoon := resources.Get "css/_coming-soon.css" }}
  {{ $css := slice $tokens $base $nav $hero $footer $comingSoon | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 5: Build and verify**

```bash
rm -rf public/ resources/
hugo --gc --minify
grep -c '\.hero-video' public/css/main.*.css
grep -c 'hero-scrim' public/css/main.*.css
ls public/hero-poster.jpg
```

Expected: both greps print `1`; `ls` exits 0.

- [ ] **Step 6: Commit**

```bash
git add themes/fourstarcaptain/ static/hero-poster.jpg
git commit -m "$(cat <<'EOF'
Add hero partial, stylesheet, and placeholder poster

The partial is not yet wired into any layout; it consumes
/hero.webm + /hero.mp4 (user-supplied) and falls back to the
placeholder /hero-poster.jpg via a CSS background on .hero. Two
scrims (top and bottom) preserve nav legibility and blend the
video into the page. Reduced-motion users get the still poster.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Gallery partial, CSS, and data seed

Build the video gallery that reads from `data/videos.yaml`. Seed the YAML with the Rickroll placeholder so the build has something to render; the user replaces with real video IDs before Task 8 ships (or afterward — the layout is data-driven).

**Files:**
- Create: `data/videos.yaml`
- Create: `themes/fourstarcaptain/layouts/partials/gallery.html`
- Create: `themes/fourstarcaptain/assets/css/_gallery.css`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (add `_gallery.css` to concat)

- [ ] **Step 1: Create `data/videos.yaml` with a placeholder list**

Write to `data/videos.yaml`:

```yaml
# Newest first. First 6 show on the homepage.
# Replace with real video IDs + titles before going live.
videos:
  - id: dQw4w9WgXcQ
    title: Placeholder video 1
  - id: dQw4w9WgXcQ
    title: Placeholder video 2
  - id: dQw4w9WgXcQ
    title: Placeholder video 3
  - id: dQw4w9WgXcQ
    title: Placeholder video 4
  - id: dQw4w9WgXcQ
    title: Placeholder video 5
  - id: dQw4w9WgXcQ
    title: Placeholder video 6
```

- [ ] **Step 2: Create `partials/gallery.html`**

Write to `themes/fourstarcaptain/layouts/partials/gallery.html`:

```html
<section class="gallery" aria-labelledby="gallery-heading">
  <h2 id="gallery-heading" class="gallery-heading">Recent Videos</h2>
  <ul class="gallery-grid">
    {{ range first 6 .Site.Data.videos.videos }}
    <li>
      <a href="https://youtu.be/{{ .id }}"
         target="_blank" rel="noopener noreferrer"
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
      See all on YouTube &rarr;
    </a>
  </p>
</section>
```

- [ ] **Step 3: Create `_gallery.css`**

Write to `themes/fourstarcaptain/assets/css/_gallery.css`:

```css
.gallery {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--s-8) var(--s-5) 0;
}

.gallery-heading {
  margin: 0 0 var(--s-5);
  font-size: var(--t-caption);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  position: relative;
  padding-bottom: var(--s-3);
}

.gallery-heading::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background: var(--accent);
}

.gallery-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s-5);
}

.gallery-grid li {
  margin: 0;
}

.gallery-grid a {
  display: block;
  color: var(--fg);
  overflow: hidden;
  transition: color 150ms ease;
}

.gallery-grid img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 2px;
  transition: transform 200ms ease;
  background: var(--soft);
}

.gallery-grid .video-title {
  display: block;
  margin-top: var(--s-3);
  font-size: var(--t-body);
  line-height: 1.4;
}

.gallery-grid a:hover img,
.gallery-grid a:focus-visible img {
  transform: scale(1.02);
}

.gallery-grid a:hover .video-title,
.gallery-grid a:focus-visible .video-title {
  color: var(--accent-hover);
}

.gallery-grid a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 2px;
}

.gallery-more {
  margin: var(--s-5) 0 0;
  text-align: right;
}

.gallery-more a {
  color: var(--muted);
  font-size: var(--t-small);
  transition: color 150ms ease;
}

.gallery-more a:hover,
.gallery-more a:focus-visible { color: var(--accent-hover); }

@media (max-width: 720px) {
  .gallery { padding: var(--s-6) var(--s-4) 0; }
  .gallery-grid { grid-template-columns: 1fr; gap: var(--s-4); }
  .gallery-more { text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  .gallery-grid img { transition: none; }
  .gallery-grid a:hover img,
  .gallery-grid a:focus-visible img { transform: none; }
}
```

- [ ] **Step 4: Add `_gallery.css` to the concat slice**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Replace the CSS pipeline block with:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $nav := resources.Get "css/_nav.css" }}
  {{ $hero := resources.Get "css/_hero.css" }}
  {{ $gallery := resources.Get "css/_gallery.css" }}
  {{ $footer := resources.Get "css/_footer.css" }}
  {{ $comingSoon := resources.Get "css/_coming-soon.css" }}
  {{ $css := slice $tokens $base $nav $hero $gallery $footer $comingSoon | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 5: Build and verify**

```bash
rm -rf public/ resources/
hugo --gc --minify
grep -c '\.gallery-grid' public/css/main.*.css
grep -c '\.gallery-heading::after' public/css/main.*.css
```

Expected: both greps print `1`.

- [ ] **Step 6: Commit**

```bash
git add themes/fourstarcaptain/ data/videos.yaml
git commit -m "$(cat <<'EOF'
Add gallery partial, stylesheet, and placeholder videos.yaml

The partial reads .Site.Data.videos.videos and renders the first six
as a 3x2 grid of YouTube-thumbnail-sourced cards. Each card opens
the video on YouTube in a new tab. Not yet wired into any layout.
data/videos.yaml is seeded with six placeholder entries so the
build has data to render; user replaces before real launch.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Sim Specs page

The first page to actually render the nav + footer partials. Goes live at `/sim-specs/` while the coming-soon page is still the homepage.

**Files:**
- Create: `content/sim-specs.md`
- Create: `data/sim-specs.yaml`
- Create: `themes/fourstarcaptain/layouts/_default/single.html`
- Create: `themes/fourstarcaptain/assets/css/_sim-specs.css`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (add `_sim-specs.css` to concat)

- [ ] **Step 1: Create `content/sim-specs.md`**

Write to `content/sim-specs.md`:

```markdown
+++
title = "Sim Specs"
+++

The hardware and software running the sim. Updated when something changes.
```

- [ ] **Step 2: Create `data/sim-specs.yaml` with a seed category**

Write to `data/sim-specs.yaml`:

```yaml
# Edit this file to reflect the real setup.
# Each category renders as a red-label section on /sim-specs/.
categories:
  - name: Flight Deck
    items:
      - name: Yoke
        value: TBD
      - name: Throttle Quadrant
        value: TBD
      - name: Rudder Pedals
        value: TBD
  - name: Computer
    items:
      - name: CPU
        value: TBD
      - name: GPU
        value: TBD
  - name: Software
    items:
      - name: Sim
        value: X-Plane 12
      - name: Scenery
        value: XEarthLayer
        link: https://xearthlayer.app/
```

- [ ] **Step 3: Create `_default/single.html`**

Write to `themes/fourstarcaptain/layouts/_default/single.html`:

```html
{{ define "main" }}
{{ partial "nav.html" . }}

<article class="page">
  <header class="page-header">
    <h1 class="page-title">{{ .Title }}</h1>
    {{ with .Content }}<div class="page-intro">{{ . }}</div>{{ end }}
  </header>

  {{ range .Site.Data.sim_specs.categories }}
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

Template notes (Hugo context rules that trip people up):
- Inside `{{ range .Site.Data.sim_specs.categories }}`, `.` is the category. Inside the nested `{{ range .items }}`, `.` is the individual item (so `.name`, `.value`, `.link`, `.note` reference the item fields).
- The `if .link` / `else` form is used rather than `with .link` because `with` rebinds `.` to the link string, which would shadow the item and make `.value` unreachable inside the block.

- [ ] **Step 4: Create `_sim-specs.css`**

Write to `themes/fourstarcaptain/assets/css/_sim-specs.css`:

```css
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--s-9) var(--s-5) var(--s-8);
}

.page-header {
  margin-bottom: var(--s-8);
}

.page-title {
  margin: 0 0 var(--s-4);
  font-size: var(--t-h1);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.page-intro {
  color: var(--muted);
  font-size: var(--t-body);
  line-height: 1.6;
}

.page-intro p { margin: 0; }

.spec-category {
  margin-top: var(--s-7);
}

.spec-category .category-label {
  margin: 0 0 var(--s-3);
  font-size: var(--t-caption);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  position: relative;
  padding-bottom: var(--s-2);
}

.spec-category .category-label::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 32px;
  height: 2px;
  background: var(--accent);
}

.spec-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.spec-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: var(--s-4);
  padding: var(--s-3) 0;
  border-bottom: 1px solid var(--line);
}

.spec-name {
  color: var(--fg);
  font-weight: 600;
  font-size: var(--t-body);
}

.spec-value {
  color: var(--muted);
  font-size: var(--t-body);
  text-align: right;
}

.spec-value a {
  color: var(--fg);
  text-decoration: none;
  transition: color 150ms ease;
}

.spec-value a:hover,
.spec-value a:focus-visible {
  color: var(--accent-hover);
}

.spec-note {
  grid-column: 1 / -1;
  margin: var(--s-1) 0 0;
  padding-left: var(--s-4);
  font-size: var(--t-small);
  color: var(--muted);
}

.spec-note::before {
  content: "↳ ";
  color: var(--accent);
}

@media (max-width: 720px) {
  .page { padding: var(--s-8) var(--s-4) var(--s-7); }
  .spec-row {
    grid-template-columns: 1fr;
    gap: var(--s-1);
  }
  .spec-value { text-align: left; }
  .spec-note { padding-left: 0; }
}
```

- [ ] **Step 5: Add `_sim-specs.css` to the concat slice**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Replace the CSS pipeline block with:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $nav := resources.Get "css/_nav.css" }}
  {{ $hero := resources.Get "css/_hero.css" }}
  {{ $gallery := resources.Get "css/_gallery.css" }}
  {{ $simSpecs := resources.Get "css/_sim-specs.css" }}
  {{ $footer := resources.Get "css/_footer.css" }}
  {{ $comingSoon := resources.Get "css/_coming-soon.css" }}
  {{ $css := slice $tokens $base $nav $hero $gallery $simSpecs $footer $comingSoon | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 6: Build and verify `/sim-specs/` renders**

```bash
rm -rf public/ resources/
hugo --gc --minify
ls public/sim-specs/index.html
grep -c '<nav' public/sim-specs/index.html
grep -c 'site-footer' public/sim-specs/index.html
grep -c 'class="page-title"' public/sim-specs/index.html
grep -c 'category-label' public/sim-specs/index.html
grep -c 'FLIGHT DECK\|Flight Deck' public/sim-specs/index.html
```

Expected: `ls` exits 0; each grep prints `1` (or more — the `Flight Deck` grep may match `1` since it's only written once per category).

Also confirm the homepage is still coming-soon:

```bash
grep -c 'class=coming-soon\|class="coming-soon"' public/index.html
grep -c '<nav' public/index.html
```

Expected: first prints `1`; second prints `0`.

- [ ] **Step 7: Dev server spot check**

```bash
hugo server --port 1313 --bind 127.0.0.1 &
HUGO_PID=$!
sleep 2
curl -sS http://127.0.0.1:1313/sim-specs/ | grep -oE 'class="(nav|page-title|category-label|site-footer|spec-row)"' | sort -u
kill $HUGO_PID
```

Expected: five distinct class names (one line each for nav, page-title, category-label, site-footer, spec-row).

- [ ] **Step 8: Commit**

```bash
git add content/sim-specs.md data/sim-specs.yaml themes/fourstarcaptain/
git commit -m "$(cat <<'EOF'
Add /sim-specs/ page with nav, categorized list, footer

First page to consume the nav + footer partials. Data lives in
data/sim-specs.yaml seeded with placeholder values; user edits to
reflect the real setup. single.html handles any future page driven
by content/<slug>.md + a matching data file, though Sim Specs is
its only current user.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Replace the homepage — wire hero + gallery + nav + footer, retire coming-soon

The visible flip. After this task, `/` renders the real homepage.

**Files:**
- Modify: `themes/fourstarcaptain/layouts/index.html` (complete rewrite)
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html` (drop `_coming-soon.css` from concat)
- Delete: `themes/fourstarcaptain/assets/css/_coming-soon.css`

- [ ] **Step 1: Rewrite `layouts/index.html`**

Overwrite `themes/fourstarcaptain/layouts/index.html` with:

```html
{{ define "main" }}
{{ partial "nav.html" . }}
{{ partial "hero.html" . }}
{{ partial "gallery.html" . }}
{{ partial "footer.html" . }}
{{ end }}
```

- [ ] **Step 2: Remove `_coming-soon.css` from the concat slice**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Replace the CSS pipeline block with:

```html
  {{ $tokens := resources.Get "css/_tokens.css" }}
  {{ $base := resources.Get "css/_base.css" }}
  {{ $nav := resources.Get "css/_nav.css" }}
  {{ $hero := resources.Get "css/_hero.css" }}
  {{ $gallery := resources.Get "css/_gallery.css" }}
  {{ $simSpecs := resources.Get "css/_sim-specs.css" }}
  {{ $footer := resources.Get "css/_footer.css" }}
  {{ $css := slice $tokens $base $nav $hero $gallery $simSpecs $footer | resources.Concat "css/main.css" | resources.Minify | resources.Fingerprint }}
```

- [ ] **Step 3: Delete `_coming-soon.css`**

```bash
rm themes/fourstarcaptain/assets/css/_coming-soon.css
```

- [ ] **Step 4: Build and verify homepage markup**

```bash
rm -rf public/ resources/
hugo --gc --minify
grep -c '<body class="has-hero">' public/index.html
grep -c '<nav class="nav"' public/index.html
grep -c 'class="hero"' public/index.html
grep -c 'class="gallery"' public/index.html
grep -c 'class="site-footer"' public/index.html
grep -c 'class=coming-soon\|class="coming-soon"' public/index.html
```

Expected: first five greps each print `1`; the last grep prints `0`.

- [ ] **Step 5: Confirm `/sim-specs/` still renders and the homepage renders without coming-soon remnants**

```bash
grep -c 'class="page-title"' public/sim-specs/index.html
grep -c 'class=coming-soon' public/css/main.*.css
```

Expected: first prints `1`; second prints `0` (coming-soon rules are gone from the concatenated stylesheet).

- [ ] **Step 6: Dev-server visual inventory**

```bash
hugo server --port 1313 --bind 127.0.0.1 &
HUGO_PID=$!
sleep 2
echo "--- homepage class inventory ---"
curl -sS http://127.0.0.1:1313/ | grep -oE 'class="(nav|nav-home|nav-links|hero|hero-video|hero-scrim|hero-overlay|hero-logo|hero-wordmark|gallery|gallery-heading|gallery-grid|gallery-more|video-title|site-footer|footer-links|footer-signoff)"' | sort -u
echo
echo "--- open in a browser: http://127.0.0.1:1313/ ---"
echo "--- verify in browser: ---"
echo "  - nav is transparent at the top of the homepage"
echo "  - scrolling down > 80px: nav becomes solid with blur"
echo "  - gallery shows 6 Rickroll thumbnails (or real data if you have edited data/videos.yaml)"
echo "  - clicking a thumbnail opens YouTube in a new tab"
echo "  - footer shows YouTube . XEarthLayer on the left, copyright + signature on the right"
echo "  - press Enter to shut down the dev server"
read
kill $HUGO_PID
```

Expected (class inventory): at least the 16 class names above show up, each once.

- [ ] **Step 7: Commit**

```bash
git add themes/fourstarcaptain/ .gitignore 2>/dev/null || true
git add -u themes/fourstarcaptain/
git commit -m "$(cat <<'EOF'
Replace coming-soon homepage with hero + gallery + nav + footer

The homepage now composes the four partials built over Tasks 3-6:
nav (transparent over hero, solid on scroll), hero (video + poster
+ scrims + centered logo/wordmark), gallery (6-video YouTube grid),
and footer (YouTube/XEarthLayer links + de Freyssinet signature).
_coming-soon.css is removed from the concat slice and deleted from
disk; the placeholder stylesheet has outlived its purpose.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Plan self-review

- **Spec coverage:**
  - Architecture / extended theme structure → Tasks 1–7 collectively establish the full tree laid out in the spec ✓
  - Design system tokens (colors, type, spacing, breakpoint, motion) → Task 1 ✓
  - Inter font loaded at weights 400 + 600 → Task 1 ✓
  - Navigation markup, behavior (transparent over hero / solid on scroll / solid always on non-home), accessibility, mobile collapse → Tasks 2 + 3 (JS + CSS) + Task 7 (first consumer) + Task 8 (homepage consumer) ✓
  - Hero markup (video + scrim + overlay) with autoplay/muted/loop/playsinline/poster/disablePiP → Task 5 ✓
  - Reduced-motion poster fallback → Task 5 ✓
  - Gallery data shape + partial + styling + YouTube thumbnail CDN + new-tab behavior → Task 6 ✓
  - Footer with YouTube + XEarthLayer + copyright + signature reused verbatim → Task 4 ✓
  - Sim Specs page content + single.html + data + styling → Task 7 ✓
  - Acceptance criteria 1-9 → verified across Tasks 6 (gallery), 7 (sim specs), 8 (homepage integration) — JS-disabled + reduced-motion fallbacks land in Tasks 2, 5, 6 ✓
  - Acceptance criterion 10 (build clean on Hugo 0.160.0, no new warnings) → validated at every task ✓
  - Acceptance criterion 11 (footer partial shared, signature reused verbatim) → Task 4 ✓
  - Out-of-scope items (YouTube sync, articles, per-video pages, search, analytics, light theme) → correctly absent ✓

- **Placeholder scan:** No "TBD" or "fill in later" in task steps. The seeded `data/sim-specs.yaml` contains `TBD` as placeholder values for the user to replace — this is the user's data, not the plan's scaffolding, and is explicitly called out in the step description.

- **Type / name consistency:**
  - Token names (`--accent`, `--muted`, `--soft`, `--line`, `--nav-bg`, `--t-*`, `--s-*`) are consistent between `_tokens.css` and every consumer ✓
  - Body classes `has-hero` and `scrolled` are named consistently between `_nav.css` CSS selector (`body.has-hero:not(.scrolled)`) and `nav-scroll.js` (`window.scrollY > 80`) and `baseof.html` (`{{ if eq .Kind "home" }} class="has-hero"{{ end }}`) ✓
  - Partial filenames (`nav.html`, `hero.html`, `gallery.html`, `footer.html`) match between the `Create:` headers and the `{{ partial "X.html" . }}` includes in `single.html` (Task 7) and `index.html` (Task 8) ✓
  - Data keys (`.Site.Data.videos.videos`, `.Site.Data.sim_specs.categories`, `.id`, `.title`, `.name`, `.value`, `.link`, `.note`, `.items`) match between data file schemas and template consumers ✓
  - CSS class names (`.nav`, `.nav-home`, `.nav-links`, `.hero`, `.hero-video`, `.hero-scrim`, `.hero-overlay`, `.hero-logo`, `.hero-wordmark`, `.gallery`, `.gallery-heading`, `.gallery-grid`, `.video-title`, `.gallery-more`, `.site-footer`, `.footer-links`, `.footer-signoff`, `.page`, `.page-header`, `.page-title`, `.page-intro`, `.spec-category`, `.category-label`, `.spec-list`, `.spec-row`, `.spec-name`, `.spec-value`, `.spec-note`) match between CSS definitions and the HTML that consumes them ✓

No issues found.
