# Four Star Captain Site Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `fourstarcaptain.com` as a public GitHub Pages site built with Hugo, with a minimal coming-soon placeholder that proves the end-to-end deployment pipeline (push → build → deploy → custom domain → HTTPS → `.tv` redirect).

**Architecture:** Hugo extended static site, in-tree theme at `themes/fourstarcaptain/`. CI via `.github/workflows/deploy.yml` mirroring the `xearthlayer-website` pattern (native `actions/deploy-pages@v5`, no `gh-pages` branch). `static/CNAME` pins the custom domain. DNS at Hover (A/AAAA/CNAME for `.com`; URL forwarding for `.tv`).

**Tech Stack:** Hugo extended 0.160.0, GitHub Actions, GitHub Pages, Hover DNS, Poppins via Google Fonts.

**Working directory:** `/media/Disk6/Projects/fourstarcaptain.com` (local dir name differs from repo name — this is fine; git does not care).

**Source spec:** `docs/superpowers/specs/2026-04-23-fourstarcaptain-site-infrastructure-design.md`

**Pre-existing state:** two commits on `main` — initial README + CLAUDE.md, and the design spec. No Hugo scaffold yet.

**Note on "tests":** This is a static-site infra project; there is no unit-test harness. Each task uses a concrete verification gate in place of a unit test — `hugo` builds cleanly, the dev server renders the expected DOM, a specific file appears in `public/`, `curl` returns the expected status, Lighthouse hits the score floor. Treat the verification step as the "test" in TDD terms: if it fails, the change is not done.

---

## Task 1: Hugo project skeleton

**Files:**
- Create: `hugo.toml`
- Create: `.gitignore`
- Create: `archetypes/default.md`
- Create: `content/_index.md`
- Create: `data/.gitkeep`
- Create: `layouts/.gitkeep`
- Create: `static/.gitkeep`
- Create: `themes/fourstarcaptain/.gitkeep`

- [ ] **Step 1: Create `.gitignore`**

Write to `.gitignore`:

```gitignore
# Hugo build output
/public/
/resources/_gen/

# Hugo cache
/.hugo_build.lock

# OS files
.DS_Store
Thumbs.db

# Editor directories
.idea/
.vscode/
*.swp
*.swo
*~

# Node modules (if using npm for build tools)
/node_modules/

# Environment files
.env
.env.local
```

- [ ] **Step 2: Create `hugo.toml`**

Write to `hugo.toml`:

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

- [ ] **Step 3: Create `archetypes/default.md`**

Write to `archetypes/default.md`:

```markdown
+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date }}
draft = true
+++
```

- [ ] **Step 4: Create `content/_index.md`**

Write to `content/_index.md`:

```markdown
+++
title = "Four Star Captain"
+++
```

- [ ] **Step 5: Create placeholder directories**

Create empty tracked placeholders so the directory structure commits:

```bash
mkdir -p data layouts static themes/fourstarcaptain
touch data/.gitkeep layouts/.gitkeep static/.gitkeep themes/fourstarcaptain/.gitkeep
```

- [ ] **Step 6: Verify Hugo recognises the project**

Run:

```bash
hugo version
```

Expected: prints `hugo v0.160.x-... +extended ...`. Confirms the binary is installed and extended (which we need for SCSS/asset features later). Extended vs standard makes no difference for this exact coming-soon page, but we pin extended because the design spec will use it.

Run:

```bash
hugo config | head -20
```

Expected: prints the config tree; `baseURL` shows `https://fourstarcaptain.com/`; `theme` shows `fourstarcaptain`. No parse error.

Run:

```bash
hugo --gc --minify
```

Expected: exits non-zero with a message like `Error: module "fourstarcaptain" not found` or similar — we have declared the theme but not yet populated it. This is the failing gate before Task 2 fixes it.

- [ ] **Step 7: Commit**

```bash
git add hugo.toml .gitignore archetypes/default.md content/_index.md data/.gitkeep layouts/.gitkeep static/.gitkeep themes/fourstarcaptain/.gitkeep
git commit -m "Scaffold Hugo project (config, archetypes, empty content)"
```

---

## Task 2: Theme skeleton

Flesh out `themes/fourstarcaptain/` just enough to make `hugo` build successfully and render a visible "Hello" placeholder on the homepage. Visual design comes in Task 4.

**Files:**
- Delete: `themes/fourstarcaptain/.gitkeep`
- Create: `themes/fourstarcaptain/theme.toml`
- Create: `themes/fourstarcaptain/layouts/_default/baseof.html`
- Create: `themes/fourstarcaptain/layouts/index.html`
- Create: `themes/fourstarcaptain/assets/css/main.css`

- [ ] **Step 1: Remove theme placeholder**

```bash
rm themes/fourstarcaptain/.gitkeep
```

- [ ] **Step 2: Create `themes/fourstarcaptain/theme.toml`**

Write to `themes/fourstarcaptain/theme.toml`:

```toml
name = "fourstarcaptain"
license = "Proprietary"
licenselink = ""
description = "In-tree theme for fourstarcaptain.com."
homepage = "https://fourstarcaptain.com/"
tags = []
features = []
min_version = "0.160.0"

[author]
  name = "Sam de Freyssinet"
  homepage = "https://fourstarcaptain.com/"
```

- [ ] **Step 3: Create the base layout**

Write to `themes/fourstarcaptain/layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode | default "en-us" }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ .Title }}{{ if ne .Kind "home" }} — {{ .Site.Title }}{{ end }}</title>
  {{ $css := resources.Get "css/main.css" | resources.Minify | resources.Fingerprint }}
  <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
</head>
<body>
  {{ block "main" . }}{{ end }}
</body>
</html>
```

- [ ] **Step 4: Create the homepage layout (placeholder)**

Write to `themes/fourstarcaptain/layouts/index.html`:

```html
{{ define "main" }}
<main>
  <p>Hello, Four Star Captain.</p>
</main>
{{ end }}
```

- [ ] **Step 5: Create a minimal stylesheet**

Write to `themes/fourstarcaptain/assets/css/main.css`:

```css
:root { color-scheme: dark; }
html, body { margin: 0; padding: 0; background: #000; color: #fff; font-family: system-ui, sans-serif; }
main { min-height: 100svh; display: flex; align-items: center; justify-content: center; }
```

- [ ] **Step 6: Verify build succeeds**

Run:

```bash
hugo --gc --minify
```

Expected: exits 0; prints a summary ending with something like `Total in …`. No errors. Creates `public/index.html` and `public/css/main.<hash>.css`.

Run:

```bash
grep -q 'Hello, Four Star Captain' public/index.html && echo OK || echo FAIL
```

Expected: prints `OK`.

- [ ] **Step 7: Smoke-test the dev server**

Run:

```bash
hugo server --port 1313 &
HUGO_PID=$!
sleep 2
curl -sS http://localhost:1313/ | grep -q 'Hello, Four Star Captain' && echo OK || echo FAIL
kill $HUGO_PID
```

Expected: prints `OK`, then the server is stopped.

- [ ] **Step 8: Commit**

```bash
git add themes/fourstarcaptain/
git rm --cached themes/fourstarcaptain/.gitkeep 2>/dev/null || true
git commit -m "Add minimal fourstarcaptain theme skeleton"
```

---

## Task 3: Logo and favicon assets

Author the badge as SVG and rasterise the PNG favicon set. The SVG below is a hand-authored approximation — close enough for a placeholder page. Post-deploy, the user can refine it (or swap for the production-grade SVG if one exists).

**Files:**
- Create: `static/logo.svg`
- Create: `static/favicon.svg`
- Create: `static/favicon-32.png`
- Create: `static/favicon-192.png`
- Create: `static/apple-touch-icon.png`
- Delete: `static/.gitkeep`

- [ ] **Step 1: Remove static placeholder**

```bash
rm static/.gitkeep
```

- [ ] **Step 2: Create `static/logo.svg`**

Hand-authored badge: a rectangular shield with a chevron bottom, three horizontal bars above, and four five-pointed stars in a row beneath them, with a final bar at the foot. White fill, transparent background. `viewBox="0 0 200 240"`.

Write to `static/logo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" role="img" aria-labelledby="logoTitle">
  <title id="logoTitle">Four Star Captain</title>
  <!-- shield outline: rectangle top, chevron bottom -->
  <path fill="#ffffff" d="M20 10 H180 V200 L100 230 L20 200 Z"/>
  <!-- three horizontal bars (cut-outs, black) -->
  <rect x="36" y="34" width="128" height="22" fill="#000000"/>
  <rect x="36" y="64" width="128" height="22" fill="#000000"/>
  <rect x="36" y="94" width="128" height="22" fill="#000000"/>
  <!-- four stars row (black on white) -->
  <g fill="#000000">
    <path d="M62 140 l3.5 9.5 l10 .5 l-7.5 6 l2.5 9.5 l-8.5 -5.5 l-8.5 5.5 l2.5 -9.5 l-7.5 -6 l10 -.5 Z"/>
    <path d="M88 140 l3.5 9.5 l10 .5 l-7.5 6 l2.5 9.5 l-8.5 -5.5 l-8.5 5.5 l2.5 -9.5 l-7.5 -6 l10 -.5 Z"/>
    <path d="M114 140 l3.5 9.5 l10 .5 l-7.5 6 l2.5 9.5 l-8.5 -5.5 l-8.5 5.5 l2.5 -9.5 l-7.5 -6 l10 -.5 Z"/>
    <path d="M140 140 l3.5 9.5 l10 .5 l-7.5 6 l2.5 9.5 l-8.5 -5.5 l-8.5 5.5 l2.5 -9.5 l-7.5 -6 l10 -.5 Z"/>
  </g>
  <!-- bottom bar -->
  <rect x="36" y="178" width="128" height="16" fill="#000000"/>
</svg>
```

- [ ] **Step 3: Duplicate as `favicon.svg`**

```bash
cp static/logo.svg static/favicon.svg
```

- [ ] **Step 4: Generate PNG favicons**

Rasterise to three PNG sizes with a solid black background (so the white badge is visible on any browser chrome).

Run:

```bash
rsvg-convert -w 32  -h 32  -b '#000000' static/favicon.svg -o static/favicon-32.png
rsvg-convert -w 192 -h 192 -b '#000000' static/favicon.svg -o static/favicon-192.png
rsvg-convert -w 180 -h 180 -b '#000000' static/favicon.svg -o static/apple-touch-icon.png
```

Expected: three PNG files written, no errors.

- [ ] **Step 5: Verify assets appear in `public/` after build**

Run:

```bash
hugo --gc --minify
ls public/favicon.svg public/favicon-32.png public/favicon-192.png public/apple-touch-icon.png public/logo.svg
```

Expected: all five files listed, no `ls` errors.

- [ ] **Step 6: Reference favicons in `baseof.html`**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Add the favicon links to `<head>` immediately after the `<title>` line:

```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

- [ ] **Step 7: Verify favicon links render**

Run:

```bash
hugo --gc --minify
grep -q 'favicon.svg' public/index.html && echo OK || echo FAIL
```

Expected: `OK`.

- [ ] **Step 8: Commit**

```bash
git add static/logo.svg static/favicon.svg static/favicon-32.png static/favicon-192.png static/apple-touch-icon.png themes/fourstarcaptain/layouts/_default/baseof.html
git rm --cached static/.gitkeep 2>/dev/null || true
git commit -m "Add logo SVG and favicon set"
```

---

## Task 4: Coming-soon page content and styling

Replace the "Hello" placeholder with the designed page: black background, badge logo centered vertically in the top half, Four Star Captain wordmark beneath in Poppins 600, studio attribution near the bottom with red accent, copyright line beneath that.

**Files:**
- Modify: `themes/fourstarcaptain/layouts/index.html`
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html`
- Modify: `themes/fourstarcaptain/assets/css/main.css`

- [ ] **Step 1: Add Google Fonts preconnect and Poppins to `baseof.html`**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Immediately before the existing `<link rel="stylesheet">` line, insert:

```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap">
```

- [ ] **Step 2: Rewrite the homepage layout**

Overwrite `themes/fourstarcaptain/layouts/index.html` with:

```html
{{ define "main" }}
<main class="coming-soon">
  <div class="brand">
    <img class="logo" src="/logo.svg" alt="" aria-hidden="true" width="120" height="144">
    <h1 class="wordmark">Four Star Captain</h1>
  </div>
  <footer class="studio">
    <p class="attribution">
      <span class="accent">de</span> FREYSSINET<span class="accent">*</span> <span class="studios">STUDIOS</span>
    </p>
    <p class="copyright">Copyright &copy; MMXXVI de Freyssinet, all rights reserved.</p>
  </footer>
</main>
{{ end }}
```

Note: the `alt=""` + `aria-hidden="true"` is intentional — the adjacent `<h1>` already names the brand, so the logo is decorative for screen-reader purposes and should not be announced twice.

- [ ] **Step 3: Rewrite the stylesheet**

Overwrite `themes/fourstarcaptain/assets/css/main.css` with:

```css
:root {
  color-scheme: dark;
  --bg: #000;
  --fg: #fff;
  --accent: #e4022b;
}

*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

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
  width: clamp(80px, 14vw, 120px);
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
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
}

.attribution .accent { color: var(--accent); }
.attribution .studios {
  font-weight: 400;
  font-size: 0.75rem;
  letter-spacing: 0.5em;
  margin-left: 0.25em;
}

.copyright {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Build and eyeball the result**

Run:

```bash
hugo --gc --minify
```

Expected: exits 0.

Run:

```bash
hugo server --port 1313 &
HUGO_PID=$!
sleep 2
echo "Open http://localhost:1313/ in a browser and verify:"
echo " - black background"
echo " - white badge centered in upper half"
echo " - 'Four Star Captain' below the badge"
echo " - 'de FREYSSINET* STUDIOS' near bottom with red 'de' and red star"
echo " - copyright line beneath"
echo "Then press Enter to continue."
read
kill $HUGO_PID
```

Expected (human-verified): the rendered page matches the description. Test this at both desktop (≥1200px) and mobile (≤420px) viewport widths via the browser's devtools responsive mode.

- [ ] **Step 5: Automated DOM checks**

Run:

```bash
hugo --gc --minify
grep -q 'class="wordmark">Four Star Captain' public/index.html && echo WORDMARK_OK || echo WORDMARK_FAIL
grep -q 'MMXXVI' public/index.html && echo ROMAN_OK || echo ROMAN_FAIL
grep -q 'Poppins' public/index.html && echo FONT_OK || echo FONT_FAIL
```

Expected: all three print `_OK`.

- [ ] **Step 6: Commit**

```bash
git add themes/fourstarcaptain/layouts/index.html themes/fourstarcaptain/layouts/_default/baseof.html themes/fourstarcaptain/assets/css/main.css
git commit -m "Build coming-soon page content and styling"
```

---

## Task 5: Meta tags, OG/Twitter cards, and SEO basics

Add the meta tags spec'd in the design doc to improve share previews and Lighthouse SEO.

**Files:**
- Modify: `themes/fourstarcaptain/layouts/_default/baseof.html`

- [ ] **Step 1: Add description and social meta to `<head>`**

Edit `themes/fourstarcaptain/layouts/_default/baseof.html`. Immediately after the `<title>...</title>` line, insert:

```html
  <meta name="description" content="{{ .Site.Params.description }}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{{ .Site.Title }}">
  <meta property="og:description" content="{{ .Site.Params.description }}">
  <meta property="og:url" content="{{ .Site.BaseURL }}">
  <meta property="og:image" content="{{ .Site.BaseURL }}favicon-192.png">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{{ .Site.Title }}">
  <meta name="twitter:description" content="{{ .Site.Params.description }}">
  <meta name="twitter:image" content="{{ .Site.BaseURL }}favicon-192.png">
```

- [ ] **Step 2: Verify meta tags render**

Run:

```bash
hugo --gc --minify
grep -q 'og:title' public/index.html && echo OG_OK || echo OG_FAIL
grep -q 'twitter:card' public/index.html && echo TW_OK || echo TW_FAIL
grep -q 'Companion site for the Four Star Captain' public/index.html && echo DESC_OK || echo DESC_FAIL
```

Expected: all three print `_OK`.

- [ ] **Step 3: Commit**

```bash
git add themes/fourstarcaptain/layouts/_default/baseof.html
git commit -m "Add description and OpenGraph/Twitter card meta tags"
```

---

## Task 6: CNAME file

**Files:**
- Create: `static/CNAME`

- [ ] **Step 1: Create `static/CNAME`**

Write to `static/CNAME` (single line, trailing newline, nothing else):

```
fourstarcaptain.com
```

- [ ] **Step 2: Verify it ends up in `public/`**

Run:

```bash
hugo --gc --minify
cat public/CNAME
```

Expected: prints `fourstarcaptain.com`.

- [ ] **Step 3: Commit**

```bash
git add static/CNAME
git commit -m "Add CNAME for fourstarcaptain.com"
```

---

## Task 7: Deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow**

Write to `.github/workflows/deploy.yml`:

```yaml
name: Deploy Hugo site to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.160.0
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i ${{ runner.temp }}/hugo.deb

      - name: Checkout
        uses: actions/checkout@v6
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v6

      - name: Build with Hugo
        env:
          HUGO_CACHEDIR: ${{ runner.temp }}/hugo_cache
          HUGO_ENVIRONMENT: production
          TZ: America/Los_Angeles
        run: |
          hugo \
            --gc \
            --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Validate YAML parses**

Run:

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/deploy.yml')); print('YAML_OK')"
```

Expected: `YAML_OK` and exit 0. Any YAML parse error will surface here before push.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deploy workflow"
```

---

## Task 8: Create GitHub repo and push

**Manual step with exact commands.** Requires `gh` CLI authenticated as `samsoir`.

- [ ] **Step 1: Confirm `gh` is authenticated as `samsoir`**

Run:

```bash
gh auth status
```

Expected: includes `Logged in to github.com account samsoir`. If not, run `gh auth login` first and re-run this step.

- [ ] **Step 2: Create the remote repo**

From the project root:

```bash
gh repo create samsoir/fourstarcaptain-website \
  --public \
  --description "Companion site for the Four Star Captain YouTube channel" \
  --source . \
  --remote origin \
  --push
```

Expected: the repo is created on GitHub, `origin` remote is added, and `main` is pushed. The command output includes the repo URL.

- [ ] **Step 3: Verify the push**

Run:

```bash
git remote -v
gh repo view samsoir/fourstarcaptain-website --json url,visibility,defaultBranchRef -q '"\(.url)  visibility=\(.visibility)  default=\(.defaultBranchRef.name)"'
```

Expected: remote shows `git@github.com:samsoir/fourstarcaptain-website.git` (or HTTPS equivalent); the `gh repo view` line prints the URL, `PUBLIC`, and `main`.

- [ ] **Step 4: Watch the first workflow run**

The push triggers `deploy.yml`. Run:

```bash
gh run watch
```

Expected: the run completes with `✓ Deploy Hugo site to GitHub Pages`. If it fails, fix the cause (e.g. YAML error, Hugo build error) locally, commit, push; do not skip ahead.

Note: the deploy **job** will fail on this first run because GitHub Pages is not yet configured (Task 9 turns it on). The **build** job must succeed. If the deploy job is failing because Pages is unconfigured, that is expected and unblocks Task 9; any other failure is a real problem to fix.

---

## Task 9: Configure GitHub Pages and custom domain

**Manual step with exact commands.**

- [ ] **Step 1: Enable Pages with GitHub Actions as source**

Run:

```bash
gh api -X POST repos/samsoir/fourstarcaptain-website/pages \
  -f 'build_type=workflow'
```

Expected: HTTP 201 response printing a JSON body with `"status": null` or `"status": "queued"` and `"build_type": "workflow"`. (If the API returns 409 "Pages is already enabled", switch the source:

```bash
gh api -X PUT repos/samsoir/fourstarcaptain-website/pages -f 'build_type=workflow'
```

)

- [ ] **Step 2: Set the custom domain**

Run:

```bash
gh api -X PUT repos/samsoir/fourstarcaptain-website/pages \
  -f 'cname=fourstarcaptain.com'
```

Expected: HTTP 204 No Content.

- [ ] **Step 3: Re-run the deploy workflow**

Run:

```bash
gh workflow run "Deploy Hugo site to GitHub Pages"
gh run watch
```

Expected: both build and deploy jobs finish green. The deploy job output includes a Pages URL (will be `https://samsoir.github.io/fourstarcaptain-website/` until the custom domain is configured, then switches to the custom domain after DNS propagates).

- [ ] **Step 4: Confirm the `samsoir.github.io` URL serves the site**

Run:

```bash
curl -sSI https://samsoir.github.io/fourstarcaptain-website/ | head -1
```

Expected: `HTTP/2 200` (or a 301 to the custom domain once DNS is configured — acceptable either way at this point).

---

## Task 10: Configure Hover DNS for `fourstarcaptain.com`

**Manual step — user acts in the Hover web UI.** The commands here are verification, not configuration.

- [ ] **Step 1: Add records in Hover**

Log in to [hover.com](https://hover.com/), select `fourstarcaptain.com`, go to **DNS**, and add the following records (remove any conflicting existing apex A/AAAA records first):

| Type  | Host | Value                  | TTL (default) |
|-------|------|------------------------|---------------|
| A     | @    | 185.199.108.153        | default       |
| A     | @    | 185.199.109.153        | default       |
| A     | @    | 185.199.110.153        | default       |
| A     | @    | 185.199.111.153        | default       |
| AAAA  | @    | 2606:50c0:8000::153    | default       |
| AAAA  | @    | 2606:50c0:8001::153    | default       |
| AAAA  | @    | 2606:50c0:8002::153    | default       |
| AAAA  | @    | 2606:50c0:8003::153    | default       |
| CNAME | www  | samsoir.github.io.     | default       |

Save.

- [ ] **Step 2: Wait for propagation and verify A records**

Run:

```bash
dig +short fourstarcaptain.com A
```

Expected (order may vary):

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

If the answer is empty or shows old records, wait and retry — propagation can take 5–60 minutes.

- [ ] **Step 3: Verify `www` CNAME**

Run:

```bash
dig +short www.fourstarcaptain.com CNAME
```

Expected: `samsoir.github.io.`

- [ ] **Step 4: Wait for GitHub to issue the Let's Encrypt cert**

In the repo's **Settings → Pages** UI, watch for the "Enforce HTTPS" checkbox to become enabled (not greyed out). This can take up to 15 minutes after DNS propagates. Once available, enable it:

```bash
gh api -X PUT repos/samsoir/fourstarcaptain-website/pages \
  -f 'https_enforced=true'
```

Expected: HTTP 204.

- [ ] **Step 5: Verify HTTPS**

Run:

```bash
curl -sSI https://fourstarcaptain.com/ | head -1
curl -sSI https://www.fourstarcaptain.com/ | head -1
```

Expected:
- First command: `HTTP/2 200`
- Second command: `HTTP/2 301` with a `location: https://fourstarcaptain.com/` header. Re-run with `-I` alone to see all headers:
  ```bash
  curl -sI https://www.fourstarcaptain.com/ | grep -i '^location:'
  ```
  Expected: `location: https://fourstarcaptain.com/`

---

## Task 11: Configure Hover forwarding for `fourstarcaptain.tv`

**Manual step — user acts in the Hover web UI.**

- [ ] **Step 1: Enable URL forwarding in Hover**

Log in to [hover.com](https://hover.com/), select `fourstarcaptain.tv`, and under **Connect → Forward** (or "Email & Forwarding" depending on current UI) configure:

- **Forward from:** `fourstarcaptain.tv` → **Forward to:** `https://fourstarcaptain.com`
- **Type:** Permanent (301)
- **Preserve path:** enabled
- **HTTPS:** enabled (Hover may call this "Secure forwarding" or similar — check the box)

Add a second forwarding rule for `www.fourstarcaptain.tv` with the same target.

Save.

- [ ] **Step 2: Verify apex `.tv` redirect**

Run:

```bash
curl -sSI https://fourstarcaptain.tv/ | grep -E '^(HTTP|location:)' -i
```

Expected:
```
HTTP/2 301
location: https://fourstarcaptain.com/
```

- [ ] **Step 3: Verify `www.` `.tv` redirect**

Run:

```bash
curl -sSI https://www.fourstarcaptain.tv/ | grep -E '^(HTTP|location:)' -i
```

Expected:
```
HTTP/2 301
location: https://fourstarcaptain.com/
```

- [ ] **Step 4: Verify path preservation**

Run:

```bash
curl -sSI https://fourstarcaptain.tv/some/deep/path | grep -i '^location:'
```

Expected: `location: https://fourstarcaptain.com/some/deep/path` (the path `/some/deep/path` must appear in the redirect target).

If it does not preserve the path, revisit Hover's forwarding configuration and ensure path-preservation is explicitly enabled.

---

## Task 12: Lighthouse baseline

Lock in the Performance / Accessibility / Best Practices / SEO ≥95 floor from the spec.

**Files (potential):**
- None required if all four metrics already pass. If a metric falls short, the fix likely lives in `themes/fourstarcaptain/layouts/_default/baseof.html` or `themes/fourstarcaptain/assets/css/main.css`.

- [ ] **Step 1: Run Lighthouse against the production URL**

Using Chrome/Chromium devtools (Lighthouse tab) OR the `lighthouse` CLI:

```bash
# If lighthouse CLI is installed; skip and use the devtools UI otherwise.
which lighthouse && lighthouse https://fourstarcaptain.com/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless --no-sandbox" \
  --output=json --output-path=/tmp/lh.json \
  --quiet
```

Via devtools: open `https://fourstarcaptain.com/` in Chrome, open devtools, Lighthouse tab, select the four categories, "Analyze page load" (mobile preset).

- [ ] **Step 2: Record scores and verify floor**

Scores must each be ≥ 95. Write them down (they go into the commit message in Step 4):

```
Performance:   ≥ 95   (actual: ___)
Accessibility: ≥ 95   (actual: ___)
Best Practices:≥ 95   (actual: ___)
SEO:           ≥ 95   (actual: ___)
```

If any score is below 95, read the Lighthouse findings and apply the smallest fix that closes the gap. Common ones for a page this size:

- **Accessibility** complaining about contrast → check the `.copyright` opacity; 0.85 on white over black gives ~14:1 contrast so this should pass, but Lighthouse can be picky about small text.
- **SEO** complaining about missing `<html lang>` → confirm `baseof.html` has `lang="{{ .Site.LanguageCode }}"`.
- **Best Practices** complaining about console errors → ensure no broken asset paths.
- **Performance** — nearly impossible to miss 95 on a page this minimal; if it does, it usually means Google Fonts is render-blocking. Consider adding `font-display: swap` (already in the URL) or `preload` the font file.

Iterate: make the fix, rebuild, redeploy (push a commit), re-run Lighthouse.

- [ ] **Step 3: Verify the live site still returns 200**

Run:

```bash
curl -sSI https://fourstarcaptain.com/ | head -1
```

Expected: `HTTP/2 200`.

- [ ] **Step 4: Commit (only if a fix was required)**

If no fix was required, skip this step.

If a fix was required, commit it:

```bash
git add <changed files>
git commit -m "Tune coming-soon page to hit Lighthouse ≥95 floor

Performance: <actual>
Accessibility: <actual>
Best Practices: <actual>
SEO: <actual>"
git push
gh run watch
```

Expected: run green, re-verify Lighthouse scores after redeploy.

---

## Task 13: Update `CLAUDE.md`

Replace the "unscaffolded" placeholder with the real build/serve commands and pointers to workflow and spec.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Overwrite `CLAUDE.md`**

Write to `CLAUDE.md`:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Companion website for the "Four Star Captain" YouTube channel (https://www.youtube.com/@fourstarcaptain). Static site built with Hugo, deployed to GitHub Pages. Custom domain: `fourstarcaptain.com` (canonical); `fourstarcaptain.tv` 301s to `.com` via Hover URL forwarding.

License is closed — treat all content as proprietary.

## Toolchain

- Hugo extended **0.160.0** (pinned in `.github/workflows/deploy.yml`). Local installs must be compatible.
- In-tree theme at `themes/fourstarcaptain/` (not a submodule). All layout/CSS changes live under that directory.
- No JavaScript, no build tools beyond Hugo itself.

## Common commands

| Command | Purpose |
|---|---|
| `hugo server -D` | Local dev server at `http://localhost:1313` with live reload. `-D` includes draft content. |
| `hugo --gc --minify` | Production build into `public/`. Matches CI. |
| `hugo config` | Print resolved site config. Useful for debugging `hugo.toml`. |
| `gh run watch` | Watch the latest deploy workflow run from the terminal. |
| `gh workflow run "Deploy Hugo site to GitHub Pages"` | Manually re-run the deploy (no code change needed). |

## Deploy pipeline

`.github/workflows/deploy.yml` builds on `push` to `main` (or `workflow_dispatch`) and publishes via `actions/deploy-pages@v5`. No `gh-pages` branch. The custom domain is pinned by `static/CNAME`.

## Content model

- `content/_index.md` — homepage front matter.
- `themes/fourstarcaptain/layouts/index.html` — homepage layout.
- `themes/fourstarcaptain/layouts/_default/baseof.html` — base HTML template (head, favicons, meta).
- `themes/fourstarcaptain/assets/css/main.css` — all styles.

## Specs and plans

- Design specs: `docs/superpowers/specs/YYYY-MM-DD-*.md`
- Implementation plans: `docs/superpowers/plans/YYYY-MM-DD-*.md`

The current site is intentionally a coming-soon placeholder. The next spec covers real homepage design (hero video, YouTube gallery, footer), a Sim Specs page, and eventually articles.
```

- [ ] **Step 2: Commit and push**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md with real toolchain and command guidance"
git push
gh run watch
```

Expected: run green.

---

## Plan self-review

- **Spec coverage:**
  - Repo public + `samsoir/fourstarcaptain-website` → Task 8 ✓
  - Hugo scaffold + in-tree theme → Tasks 1, 2 ✓
  - `hugo.toml` content → Task 1 ✓
  - Coming-soon page (visual, a11y, responsive, no motion) → Tasks 2, 3, 4 ✓
  - OG/Twitter/description meta → Task 5 ✓
  - Favicons + logo SVG → Task 3 ✓
  - Deploy workflow mirroring XEarthLayer → Task 7 ✓
  - Repo settings (Source: Actions, Custom domain, HTTPS) → Task 9, 10 ✓
  - `static/CNAME` → Task 6 ✓
  - Hover DNS for `.com` → Task 10 ✓
  - Hover forwarding for `.tv` → Task 11 ✓
  - Verification checklist (dig, curl, 301s, path preservation) → Tasks 10, 11 ✓
  - Acceptance criteria items 1-8 → covered across Tasks 7, 8, 9, 10, 11, 12, 13 ✓
  - Lighthouse ≥95 floor → Task 12 ✓
  - `CLAUDE.md` update → Task 13 ✓
  - `.gitignore` → Task 1 ✓
  - No `LICENSE` file → respected (not created in any task) ✓
  - Local dev documented → Task 13 (in `CLAUDE.md`) ✓

- **Placeholder scan:** No "TBD", no "fill in later". The logo SVG is an approximation and says so; it is still complete, runnable code. The only human-judgement step is Task 4 Step 4 (eyeball the rendered page) — this is necessary and explicitly scoped to visual verification rather than hidden hand-waving.

- **Type/name consistency:**
  - Theme name `fourstarcaptain` used consistently in `hugo.toml`, `theme.toml`, and `themes/fourstarcaptain/` path ✓
  - CSS class names `.coming-soon`, `.brand`, `.logo`, `.wordmark`, `.studio`, `.attribution`, `.accent`, `.studios`, `.copyright` all defined in CSS and used in HTML ✓
  - File paths in "Files:" headers match those used in `git add` commands ✓
  - Workflow name `Deploy Hugo site to GitHub Pages` matches between Task 7 (creation) and Task 9 (trigger) and Task 12 (redeploy) ✓

No issues found.
