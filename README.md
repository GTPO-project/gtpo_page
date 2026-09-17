# GTPO academic website

English, static research website. No framework, external service, CDN or runtime package installation is required. Source figures are reconstructed as HTML/SVG/MathML; only independent photographs and observation frames are raster assets.

## Preview

From this directory:

```sh
npm start
```

Open http://127.0.0.1:8765/. An equivalent command is:

```sh
python3 scripts/serve.py
```

The local preview supports HTTP byte ranges for video seeking. The site must be served over HTTP because its ES modules load local JSON files. Deployment is configured separately through GitHub Pages.

## Source layout

- `dist/index.html` / `dist/styles.css`: page entry and visual system.
- `dist/js/figures.js`: individually authored SVG figures, MathML formulas, photos and responsive compositions.
- `dist/js/charts.js`: source-driven charts, rolling averages and pointer/keyboard inspection.
- `dist/js/tables.js`: accessible source-derived tables.
- `dist/js/content.js`: copy, captions, table notes and video mappings.
- `dist/data/`: source-derived data and PPT element inventory.
- `scripts/prepare.py`: reproducible extraction. Reads only the parent paper/PPT/data sources; writes only inside this project. Requires Pillow.
- `scripts/check.mjs`: data, numerical metric, asset and syntax validation.
- `qa/`: validation evidence.

## Refresh the source material

The source root is inferred relative to this directory; no private absolute paths are embedded in the site.

```sh
python3 scripts/prepare.py
npm run check
```

If the source environment lacks Pillow, use an existing Python environment with Pillow. All extracted outputs are already included; extraction is not required to run the website.

## Replace video placeholders

Edit the matching entry in `dist/js/content.js`: set `src` to the local video path, optionally adjust `poster`, and keep the title accurate. Put media in `dist/assets/`. The component will render `<video controls playsinline preload="metadata">` automatically.

## Verification and provenance

Run `npm run check`. This verifies all 3,089 recorded points against the source CSVs, existing filename corrections, OT metrics, table sizes, source matrix/bar counts, PDF integrity and JavaScript syntax. Browser checks are summarized in `qa/browser-validation.json` when available.

`SOURCE-NOTES.md` records formula corrections, parameter differences and qualitative reconstruction limits. `FIGURE-INVENTORY.md` maps every figure/subfigure and table to its source and webpage elements.

## Task video gallery

`dist/js/video-gallery.js` and `dist/video-gallery.css` implement the five-task ring gallery: a large active video, angled neighbors, side-card selection, touch/mouse dragging, horizontal trackpad gestures, keyboard navigation and an optional automatic cycle. Offscreen previews pause; full viewing uses a native video dialog. Reduced motion disables cycling and rotation.

Edit `media.tasks` in `dist/js/content.js` to add the remaining videos. Keep each task's stable `id` so task-photo links continue to select it. A null `src` shows its poster and “Video forthcoming,” with no playback controls.

The supplied `DJI_20260917152353_0085_D.mp4` is preserved outside the site. The Solder component web copy is `dist/assets/videos/solder-component-v1.m4v` (H.264, 1920×1080, approximately 18.44 seconds); its JPEG poster is extracted from the same clip. The other four tasks remain forthcoming. The GitHub Pages workflow publishes the same static files after repository setup.

Run `python3 scripts/check-media-server.py` to verify byte-range responses and `npm run check` for source/data integrity.

## GitHub Pages deployment

The repository is `GTPO-project/gtpo_page`. In the repository settings, select **Pages → Build and deployment → Source → GitHub Actions**. Pushing `main` runs `.github/workflows/pages.yml` and publishes only `dist/`. The expected project URL is `https://gtpo-project.github.io/gtpo_page/` after a successful deployment.

The local checkout uses a repository-scoped SSH command and its own GTPO key. No global SSH configuration or pre-existing identity is changed. SSH authentication permits Git transport; configuring Pages in GitHub requires repository settings access.

`npm run check` is the full local provenance audit and uses the original CSVs and paper in the parent research folder. CI checks the standalone website files and syntax without uploading that research folder.
