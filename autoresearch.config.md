# Autoresearch Configuration

## Goal
Systematically improve the openclaw-appstore (https://hendr15k.github.io/openclaw-appstore/) across three dimensions: performance, features, and visual polish.

## Metric
Composite Score (higher is better):

### Performance (0-3 points, measurable)
- **Total HTML+JS size < 10KB**: +1 (currently 12.4KB)
- **Zero blocking scripts (defer/async)**: +1 (currently inline)
- **All images lazy-loaded**: +1

### Features (0-5 points, countable)
Each of these adds +1:
1. Release notes excerpt shown per app
2. App search/filter functionality
3. Full-screen screenshot modal (click to expand)
4. PWA install prompt UI
5. Category/tag grouping for apps

### Visual Polish (0-4 points, verifiable)
Each adds +1:
1. Smooth card entrance animations
2. Skeleton loading state (not just spinner)
3. Responsive grid layout (2+ column on desktop)
4. App version history tooltip

**Total: 0-12 points. Baseline: ~2/12.**

### Extract Command
```bash
cd /tmp/openclaw-appstore && node scripts/extract-score.js
```

## Target Files
- `www/index.html` (main source — can be modified)
- `www/sw.js` (service worker — can be modified)
- `www/manifest.json` (can be modified)

## Read-Only Files
- `.github/workflows/deploy.yml` (deployment config)
- `www/screenshots/*.png` (existing screenshots)
- `www/icon-*.png` (app icons)

## Run Command
```bash
cd /tmp/openclaw-appstore && node scripts/extract-score.js
```

## Time Budget
- **Per experiment**: 60 seconds
- **Kill timeout**: 120 seconds

## Constraints
- Must remain a single-page static site
- Must remain installable PWA (manifest + sw must work)
- Must not break existing app cards or release fetching
- GitHub Pages deploy must still work
- No external dependencies (no CDN fetches, no frameworks)
- Total file count in www/ should stay reasonable (< 15 files)
- Mobile-first design must be preserved

## Branch
autoresearch/appstore-improvements

## Notes
- Self-directed improvement goals set by agent
- Lighthouse not available on VPS — using manual scoring instead
- Deploy verification: push to main and check live URL returns 200
- Current baseline analysis needed first
