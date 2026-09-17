# Source and reconstruction notes

The source manuscript, presentation and experiment files are read-only inputs. The site does not change them.

## Differences retained in the website

1. **Pipeline formulas.** Slide 4 contains an older credit-weight expression. The website follows `GTPO-paper/figures/figure2_credit_formulas.tex`: score `s(i,t) = -sum_b T*(t,b) C*(t,b)` and normalized weights `L_i softmax(-s_i / tau)`. These are MathML, not formula screenshots.
2. **Temporal window.** Main-text design analyses report `k = 30` as the default; Appendix Table 8 records `k = 15`. Both remain visible, with an adjacent source note.
3. **Temperature.** Table 5 describes exponential/linear schedules from `0.05` to `1`; Appendix Table 8 records `0.01` to `1` over 80 policy iterations. Both remain as supplied.
4. **Initialization context.** The main text distinguishes one- and full-demonstration warm starts. Appendix simulation configuration identifies a LIBERO-130 LoRA SFT checkpoint and says RL updates all parameters with LoRA disabled. These are separate contexts, not a website-inferred universal setting.
5. **Real-world task lettering.** The composite source image labels screw driving `(d)` and soldering `(e)`, whereas its manuscript caption lists soldering `(d)` and screw driving `(e)`. The website uses the manuscript caption order and places the corresponding independent photograph beside each task name.

## Existing data corrections reproduced

- Spatial: `spatial_grpo.csv` is GTPO one-demonstration; `spatial_gtpo.csv` is GRPO one-demonstration. This mapping is explicitly documented in the paper's plotting script.
- Window ablation: `gtpo_k_15.csv` and `gtpo_k_50.csv` are exchanged, exactly as in the paper's plotting script. All runs are truncated at their common 96-step analysis horizon.
- Long: GTPO one-demonstration has an independent x-axis column. GRPO and GTPO full-demonstration share the other x-axis column. Missing entries are omitted, without inventing samples.
- Pale scatter points are raw evaluations. Curves use centered, seven-checkpoint, edge-padded moving averages. They are not confidence intervals.
- A missing TTS@95 crossing is censored at the recorded budget and remains a `>` bound. It is never fabricated.

## Reconstruction boundaries

- Real photographs and observation frames are independently extracted from the PPT and saved as WebP assets. No composite figure screenshots are shipped as figure images.
- Figures 1 and 2 reconstruct visual elements as independently authored SVG paths, text, grids, bars and connectors. Their layout is adapted to the web rather than kept at slide coordinates.
- Matrices use 25×25 cells (overview matrix: 20×20). The overview uses the most frequent color inside each source cell, excluding grid boundaries; this corrects 38 center samples contaminated by the two white alignment guides. Those guides are drawn separately, with the PPT vertical flip preserved. Other matrices retain source-cell-center sampling. Credit strips and bars retain the individual supplied color/height patterns. The website maps colors into its red/green palette. These are qualitative artwork reconstructions, not recovered numerical OT arrays; no quantitative tooltip is attached to them.
- The feature-space surface and Sinkhorn distributions are native schematic paths. No additional experimental observations are inferred from their geometry.
- Figure 6 contains eight teacher and eight student frames. The failure annotation remains on the fifth student frame, matching the source presentation.
- All Table 1–10 data cells come from the LaTeX source, including original decimal precision, rankings, parenthetical gains and censoring symbols.
- The five real-world tasks retain the source script's SFT and per-round success rates, with 20 trials per point.
- The website does not invent authors, affiliations, a release repository, or a formal BibTeX citation.

See `FIGURE-INVENTORY.md` for the figure-to-component mapping and `dist/data/ppt-elements.json` for the 463-element raw PPT inventory.

## Blog layout and classroom analogy

- The reading column is capped at 840 CSS pixels. This is a layout change, not a browser zoom setting. Figure 1 retains its 36:64 comparison at a content width of at least 800 pixels; smaller columns stack the comparison panels. Following the requested compact-chart refinement, chart groups use two columns on desktop (including Figure 1 Performance/Efficiency); phones use one column. The standalone alignment comparison is capped at 550 pixels. All line and bar charts reveal once on entry using a clipping region or bar growth; clipping preserves the original line dashes, observations, scales and values. Expanded figures and reduced-motion views show complete static charts.
- The idea section uses a shortened, two-sentence explanation; the source abstract in `dist/data/abstract.json` and the manuscript PDF are preserved.
- The classroom is a separate, authored SVG/HTML analogy, not a ninth paper figure. Scores 90, 80, 40 and 30 (mean 60), three-step papers, and ungraduated progress bars are illustrative. They are not experimental data or recovered trajectories.
- The pairings 2→3 and 1→4 illustrate a failed rollout selecting a successful teacher by visual trajectory similarity. Classroom movement does not encode physical nearest-neighbor selection; paper correction represents dense credit, not teacher-action copying or validated causal error localization.
- The scene runs once on first substantial visibility, then holds the final frame. Manual pause, off-screen pause and document-visibility pause share one animation clock. Reduced motion displays the final state with textual GRPO/GTPO explanations. No replay or looping is provided.
- Editable copy and storyboard durations live in `dist/js/idea-content.js`; artwork and playback behavior live in `dist/js/classroom.js`; layout and scene styles live in `dist/blog.css`.

- Figure 1(c) projects each source color onto its original continuous color ramp, then maps that position to the same green (#35634D), ivory (#F7F4EC), and red (#9B4843) palette as GRPO. This preserves the source color ordering without the bright yellow/orange hues. The feature surface and teacher rail use the same palette. The teaching connector ends at Score 3, which then feeds the advantage bars. Its one-time construction animation progresses through Teacher 2, matrix cells, alignment guides, Score 3, and advantage; it is an illustration of the supplied mechanism, not a recovered sequence of numerical solver iterations.

- At the user’s request, Figure 1’s long overview caption is omitted from the rendered page; its source text remains in the content configuration. The individual graph footnotes and GROUP / ALIGN / TEACH explanations are retained.

- Classroom progress bars now count the two illustrated corrections on each learner’s paper (0/2, 1/2, 2/2), synchronized with the two corrections and ending full. They do not depict policy success rates or measured learning gains. The classroom’s bottom border is removed.

## Figure 2 refinement and editorial cleanup

- Figure 2(a) uses consistent geometry, stronger connection strokes and aligned canvases. Figure 2(b) animates four source-backed steps: cosine cost, temporal restriction, alternating row/column balancing and transport plan. Animation illustrates operations; it is not a record of numerical solver iterations.
- Figure 2(c) shows cost/plan-to-score on the left and the same 25 time positions across advantage, weights and dense advantage on the right. Source cell colors and relative bar heights are preserved; staged reveals and chunk highlights explain their relationship. Both animations run once, pause offscreen/with hidden tabs, preserve manual pause and display static completed artwork for reduced motion.
- At the user’s request, Figure 2 formula blocks, long figure captions, overview video, redundant implementation/source notes and hero explanation have been removed from the page. Corrected equations and full captions remain available in the source files and paper PDF. The manuscript/data have not changed.
- Table 1 now shows four matched GRPO/GTPO rows with Average first. Its full comparison retains all 16 rows, 12 columns, original ranks, gains and precision in a keyboard-accessible disclosure. Necessary footnotes are shortened.
- The header/footer use a serif GTPO wordmark with an understated dark-red square; the favicon follows the same typography and palette.

## Sequential credit computation and paired ablations

- Figure 2(c) now has a strict dependency: all 25 score chunks complete before the allocation panel appears. Student chunks 1, 13 and 25 receive detailed synchronized row highlights and source-colored aggregation particles; the remaining chunks are accelerated. The scoring stage lasts seven active seconds. Score colors then travel through the inter-panel gutter and morph into the corresponding source weight bars, followed by an all-chunk normalization emphasis and dense-advantage reveal. This remains an illustration of the operation, with no inferred intermediate numerical values.
- Playback pauses based on the currently active panel, even when a later panel is visible. Fast scrolling cannot start stage 02 before 01; both panels reserve their final layout geometry. Resizing recalculates transfer positions without restarting playback.
- Figure 5 is arranged in three plot/table pairs. Table 5 is split into its original five window rows, five temperature rows and three teacher rows; all metric precision, emphasis and censoring symbols remain. The original Analysis column is represented by each paired chart’s title and table caption. Narrow screens show each plot immediately followed by its corresponding metrics.
- Selecting a Table 5 row highlights its matching curve and legend with a short transition; selecting it again or pressing Escape restores all series. Mapping uses explicit labels (including ST/MTA/NNT), not row order. Keyboard, touch and expanded figures use the same interaction; raw data, smoothing and line patterns remain unchanged.
- The homepage eyebrow is removed. Classroom captions use natural height; the final caption has 24px of bottom space on desktop and 20px on phones before the section divider.
