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
