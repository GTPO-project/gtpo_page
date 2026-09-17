# Figure coverage

All eight manuscript figures are rendered as native webpage elements. Figure 1/2 heading rows, long figure captions and Figure 2 formula blocks are omitted at the user’s request. Tables 1–10 are HTML tables; Table 1 leads with four matched GRPO/GTPO comparisons and retains all 16 source rows in its expandable full table.

| Figure | Source | Native components / elements |
| --- | --- | --- |
| 1a | PPT slide 3; teaser.pdf | Initial-state photograph, four source-derived Bézier rollout paths (PPT shape IDs 21, 24, 34, 30) with individual gradients and numbered endpoints, two intermediate observation photographs with dashed arrows directed into the observations, successful/failed outcomes, buffer outline and four gradient trajectories. Source gradient stop positions are retained in the muted site palette: failure 3 transitions later, failure 4 earlier. Mobile reflows these elements vertically. Expanded views retain the horizontal composition and local gradient references. |
| 1b | PPT slide 3 | Four trajectory badges; rewards +1, +1, 0, 0; aligned reward/advantage arrows; four 20-bar uniform advantage profiles with complete A/t axes; row highlighting linked to the same rollout in 1a and the feature-space node in 1c. |
| 1c | PPT slide 3 | Source-traced folded feature surface with a curled edge and green/cream/red shading, four source-positioned nodes with dashed projections onto the manifold, bidirectional 2–3 and 1–4 pairings, 20×20 OT matrix with source vertical flip and separately drawn alignment guides, teacher/student trajectory rails, curved teaching-to-Score-3 connector, score-to-advantage arrow, source-colored score strip and dense advantage bars. |
| 1d | Paper plotting scripts / Table 1 | Eight performance bars with exact values and method labels; three raw Object series, seven-point trends, 95% threshold, TTS markers and 19-step comparison. |
| 2a | PPT slide 4 | Twelve observation frames in four labeled rows; ellipses; successful/failed final-frame outlines; encoder connections; visual encoder; four feature-space polylines and nodes; feature axes; paired/alternative connections and distance labels. |
| 2b | PPT slide 4 | Four equal-canvas stages: cost grid, teacher/student axes, source temporal mask and window bracket, distributions and transport arrows, source transport plan. Animation shows cost scanning, mask restriction, alternating row/column scaling and the final plan; no numerical solver iterates are inferred. |
| 2c | PPT slide 4 plus corrected LaTeX overlay | Two proportionate panels: source cost/transport grids and chunk-score strip on the left; original advantage, credit weights and dense advantage on three aligned time axes on the right. All 75 source bars remain. One-time animation reveals scores and weights, then highlights corresponding chunks while revealing dense credit. Formula blocks are removed; VLA update is an inline destination. |
| 3 | Four CSV suites and plotting scripts | Object, Spatial, Goal, Long: every raw point, three trends, complete legends, axes, 95% threshold, crossing markers, TTS labels and comparison bounds. |
| 4 | ot_necessity.csv | All 77 steps of three methods; raw points, smoothed lines, distinct styles, legend and 95% threshold. Table 4 accompanies it. |
| 5 | Ablation CSVs | Window: five curves; temperature: five curves; teacher: three curves. Raw points, trends, threshold and legends. Table 5 is split into matching 5/5/3-row panels beside the three vertically stacked plots; phones interleave each plot and table. |
| 6 | PPT slide 7 | Cost grid, eight teacher frames, eight student frames, 25 credit bars, time direction and failed-grasp annotation on student frame 5; explicit qualitative-evidence limitation. |
| 7 | PPT slide 6 | Six independent photographs: scene, stacking, battery, soldering, screw driving, opening; native captions with manuscript ordering. |
| 8a | draw_real_world_results.py | SFT points and three rounds for soldering/opening × GTPO/GRPO; circle/square markers, solid/dashed paths, complete legend and initialization labels. |
| 8b | draw_real_world_results.py | Five tasks × three methods = 15 labeled bars; y-axis, grid, method legend, exact values and 20-trial annotation. |
| Teacher detail | PPT slide 5 | Three selection panels; 37 large/small nodes, 16 teaching arrows, success/failure groups, single best teacher and labels for ST/MTA/NNT. |

## Table coverage

| Table | Rows | Content |
| --- | ---: | --- |
| 1 | 16 | LIBERO success/ranks for all baselines and matched SFT/GRPO/GTPO conditions |
| 2 | 2 | RoboTwin, four tasks and average |
| 3 | 3 | Aggregate LIBERO efficiency and improvement |
| 4 | 3 | OT versus pointwise matching metrics |
| 5 | 13 | Window, temperature and teacher analyses |
| 6 | 11 | Simulation model/input configuration |
| 7 | 16 | Simulation rollout and optimization |
| 8 | 6 | Temporal OT configuration |
| 9 | 11 | Evaluation and systems |
| 10 | 14 | Real-world SFT and inference |

## Media and maintenance

Five task-video placeholders; the overview-video block has been removed at the user’s request. Their titles, posters and optional `src` are in `dist/js/content.js`. Setting `src` replaces the placeholder with a native video player. No playback control is displayed for a missing video.

## Figure 1 motion and interaction

Each panel enters once when first visible: a short fade/translation, source rollout path drawing, and staggered uniform-advantage rows. No replay control is shown; scrolling back and opening the expanded figure do not replay the entrance. Reduced-motion preferences suppress entrance animation and transitions. Trajectory paths, buffer rows, and GRPO rows share selection state within each view. The external rollout picker and instruction text have been removed to keep the figure compact. Highlighting preserves the original data and qualitative teaching diagram.

The desktop Figure 1 comparison assigns 36% of its column space to GRPO and 64% to GTPO. GRPO uses shorter connectors and narrower bar profiles without reducing label size. Both panels use filled arrowheads, stronger typography, and explicit red sparse / green dense labels. Mobile GTPO renders its three steps independently rather than cropping unrelated SVG elements.

The OT evolution runs once per page visit, independently as its mobile steps enter view. It waits for each animation to finish before the next stage; expanded figures and reduced-motion mode show the final static artwork. There is no replay control.

## Figure 2 presentation and verification

- `dist/js/pipeline.js` owns the rebuilt SVG/HTML layout. Panel (a) uses equal 320×390 canvases and non-scaling connections. Panel (b) uses equal 240×270 canvases; panel (c) uses a 320:540 split with equal rendered heights on desktop and stacks on phones.
- `pipeline-motion.js` animates (b); `credit-motion.js` animates (c). Each runs once, respects manual/offscreen/hidden-tab pauses and reduced motion, and defers unseen mobile stages. Source artwork is fully restored after playback.
- Source integrity and playback checks: `node scripts/check-pipeline.mjs`, `node scripts/check-credit-motion.mjs`, `npm run check`. In-app browser checks cover 320, 390, 768, 1440 widths and a 720×500 reduced viewport; no claim of native browser 200% zoom testing.
- Generic figure captions, repeated appendix/source implementation notes and visible chart-interaction hints are removed. Essential units, dataset labels, unreached-threshold notation, warm-start conditions, 20 physical trials and the qualitative causal boundary remain in the appropriate labels, concise notes or main copy.

Figure 2(c) sequential playback now illustrates row-wise multiplication/aggregation (three detailed rows, 25 total scores), then reveals stage 02 and transfers each indexed score into its source weight profile before dense credit. `check-credit-motion.mjs` verifies strict ordering, seven-second scoring, current-stage visibility, source restoration and reduced-motion behavior.
