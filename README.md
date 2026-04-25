# Four Star Captain

Companion website for the [Four Star Captain](https://www.youtube.com/@fourstarcaptain) YouTube channel. Built with Hugo, deployed to GitHub Pages, served at [fourstarcaptain.com](https://fourstarcaptain.com).

The site exists to host supplementary material that doesn't belong on YouTube — sim specifications, future articles, and a curated entry point to recent videos.

## Stack

- **[Hugo](https://gohugo.io/) extended 0.160.0** (pinned in `.github/workflows/deploy.yml`). Local installs must be a compatible 0.160.x extended build.
- **In-tree theme** at `themes/fourstarcaptain/` — not a submodule. All layout and CSS lives there.
- **No JavaScript framework, no CSS preprocessor, no build tools beyond Hugo itself.** A single ~15-line `nav-scroll.js` is the only client-side script.
- **Hosting:** GitHub Pages (public source repo). Custom domain via Hover.
- **DNS:** Hover-managed. Apex `A`/`AAAA` records point at GitHub Pages IPs, `www` is a CNAME to `samsoir.github.io.`.

## Local development

```bash
git clone git@github.com:samsoir/fourstarcaptain-website.git
cd fourstarcaptain-website
hugo server -D
```

`hugo server` watches the project and auto-rebuilds on save; open `http://localhost:1313/` in a browser. The `-D` flag includes draft content.

For a production-equivalent build into `public/`:

```bash
hugo --gc --minify
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`:

1. **build** — installs Hugo extended 0.160.0, runs `hugo --gc --minify`, uploads `public/` as a Pages artifact.
2. **deploy** — `actions/deploy-pages@v5` publishes to the `github-pages` environment.

There is no `gh-pages` branch and no manually-committed build output. The custom domain is pinned by `static/CNAME`.

To re-run the workflow without a code change: `gh workflow run "Deploy Hugo site to GitHub Pages"`.

To watch the latest run: `gh run watch`.

## Common content updates

### Add or replace a video in the homepage gallery

Edit `data/videos.yaml`. Newest first. The first six entries render on the homepage; everything else is currently unused (reserved for the future YouTube sync workflow).

```yaml
videos:
  - id: dQw4w9WgXcQ
    title: Plain text title shown under the thumbnail
```

The thumbnail is fetched from `https://img.youtube.com/vi/<id>/hqdefault.jpg` at runtime — nothing to commit beyond the YAML.

### Update the Sim Specs page

Edit `data/sim-specs.yaml`. Categories render in declaration order. Each item needs `name` and `value`; the optional `link` makes the value clickable, the optional `note` renders as a smaller line beneath.

```yaml
categories:
  - name: Flight Deck
    items:
      - name: Yoke
        value: Honeycomb Alpha
        note: Optional note shown beneath
        link: https://example.com/optional/url
```

### Edit the homepage CTAs

Edit `data/ctas.yaml`. Each entry produces one card under the gallery. `icon` references a `<symbol>` id declared inline in `themes/fourstarcaptain/layouts/partials/cta.html` — adding a new icon means adding both the symbol and the YAML entry.

### Replace the hero video

The hero plays `static/hero.webm` (preferred by modern browsers) with `static/hero.mp4` as a fallback, falling through to the `static/hero-poster.jpg` still if neither loads. To replace the clip, drop the new files into `static/` and commit. See [Hero video encoding](#hero-video-encoding) below for the exact encode parameters.

## Hero video encoding

Source clips are typically 4K H.264 `.mov` exports. The site needs two streamable web encodes (`.webm` + `.mp4`) plus a still poster, all sized to fit comfortably in the repository (~40 MB total) while keeping quality acceptable for a fullscreen ambient background. Audio is dropped — the `<video>` element on the page is muted.

### Output targets

| File | Codec | Container | Resolution | FPS | Bitrate target | Typical size (~2 min source) |
|---|---|---|---|---|---|---|
| `static/hero.webm` | VP9 (libvpx-vp9) | WebM | 1920 × 800 | 24 | 1.0 Mbps two-pass | ~16 MB |
| `static/hero.mp4` | H.264 high@4.1 (libx264) | MP4 | 1920 × 800 | 24 | 1.5 Mbps two-pass | ~23 MB |
| `static/hero-poster.jpg` | JPEG | — | 1920 × 800 | — | quality 4 | ~60 KB |

The 1920 × 800 resolution preserves a 2.4:1 cinematic aspect — the most recent source has been at this aspect, but `object-fit: cover` in the hero CSS will crop a 16:9 source cleanly without distortion if a future source comes through differently.

### Encoding commands

Set `SRC` to the source `.mov` and run from any working directory; outputs are written into `static/` of this repo.

```bash
SRC='/path/to/source.mov'
PROJ='/path/to/fourstarcaptain.com'

# MP4 / H.264 — two-pass, ~1.5 Mbps target
ffmpeg -y -i "$SRC" \
  -an -vf "scale=1920:800:flags=lanczos" -r 24 \
  -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p \
  -preset slow -b:v 1500k -maxrate 2000k -bufsize 3000k \
  -movflags +faststart -pass 1 -f mp4 /dev/null

ffmpeg -y -i "$SRC" \
  -an -vf "scale=1920:800:flags=lanczos" -r 24 \
  -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p \
  -preset slow -b:v 1500k -maxrate 2000k -bufsize 3000k \
  -movflags +faststart -pass 2 \
  "$PROJ/static/hero.mp4"

# WebM / VP9 — two-pass, ~1.0 Mbps target
ffmpeg -y -i "$SRC" \
  -an -vf "scale=1920:800:flags=lanczos" -r 24 \
  -c:v libvpx-vp9 -pix_fmt yuv420p \
  -b:v 1000k -minrate 500k -maxrate 1450k \
  -tile-columns 2 -row-mt 1 -threads 8 \
  -speed 4 -pass 1 -f webm /dev/null

ffmpeg -y -i "$SRC" \
  -an -vf "scale=1920:800:flags=lanczos" -r 24 \
  -c:v libvpx-vp9 -pix_fmt yuv420p \
  -b:v 1000k -minrate 500k -maxrate 1450k \
  -tile-columns 2 -row-mt 1 -threads 8 \
  -speed 1 -pass 2 \
  "$PROJ/static/hero.webm"

# Poster — frame at 0.5s, scaled to match
ffmpeg -y -ss 0.5 -i "$SRC" -vframes 1 \
  -vf "scale=1920:800:flags=lanczos" -q:v 4 \
  "$PROJ/static/hero-poster.jpg"
```

A few notes on the flag choices:

- **`-an`** strips audio. The page's `<video>` element is muted; shipping audio is bytes wasted.
- **`-vf "scale=...:flags=lanczos"`** uses the Lanczos resampler — sharper than bilinear at downscales of this magnitude.
- **`-r 24`** forces 24 fps. Drop or change if the source is e.g. 30 fps and you want to preserve it.
- **`+faststart`** on the MP4 moves the `moov` atom to the front of the file so the browser can start playback before the entire file is buffered.
- **`-tile-columns 2 -row-mt 1`** parallelises VP9 encoding. Tune `-threads` to the encode machine.
- **`-speed 4` then `-speed 1`** — first pass is fast (collects stats), second pass is slow (uses stats for quality). Setting both passes to `-speed 1` gives a marginal quality bump at the cost of much more time.
- **Two-pass** is used on both encodes because it produces predictable file sizes for a fixed target bitrate. Single-pass CRF would also work but the resulting file size is harder to plan around.

If you want to budget a different total file size, the levers are:

- **Bitrate** (the dominant factor) — halve `-b:v` to roughly halve the file size at noticeable quality cost.
- **Resolution** — `scale=1280:534` (720p-equivalent at 2.4:1) cuts pixel count by ~57%; reduce bitrate proportionally.
- **Duration** — trimming the clip is the cleanest size win when quality matters.

A scratch-friendly version of the full pipeline lives at `/tmp/encode-hero.sh` whenever the script is regenerated for a new clip; it is not committed because the source path is local-machine specific.

## Project layout

```
fourstarcaptain.com/
├── archetypes/                              # Hugo content templates
├── content/                                 # Markdown pages
│   ├── _index.md                            # homepage front matter
│   └── sim-specs.md                         # Sim Specs page
├── data/                                    # YAML data the layouts consume
│   ├── videos.yaml
│   ├── sim-specs.yaml
│   └── ctas.yaml
├── static/                                  # files copied verbatim into public/
│   ├── CNAME                                # custom-domain pin
│   ├── logo.svg
│   ├── favicon.svg
│   ├── favicon-{32,192}.png
│   ├── apple-touch-icon.png
│   ├── hero.{webm,mp4}
│   └── hero-poster.jpg
├── themes/fourstarcaptain/                  # in-tree theme
│   ├── layouts/
│   │   ├── _default/{baseof,single}.html
│   │   ├── index.html                       # homepage layout
│   │   └── partials/{nav,hero,gallery,cta,footer}.html
│   └── assets/
│       ├── css/{_tokens,_base,_nav,_hero,_gallery,_sim-specs,_cta,_footer}.css
│       └── js/nav-scroll.js
├── docs/superpowers/                        # design specs and implementation plans
├── .github/workflows/deploy.yml             # CI
├── hugo.toml                                # site config
├── CLAUDE.md                                # guidance for Claude Code
└── README.md
```

## License

Closed / proprietary. All content and code in this repository is the property of Four Star Captain. No license is granted for reuse.
