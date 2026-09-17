import {esc} from './figures.js';
import {tableNotes} from './content.js?v=sequence-2';
const rowClass=r=>`${r.section?'section-start ':''}${/^GTPO|^<.*GTPO/.test(r.cells[0])&&!r.cells[0].includes('pointwise')?'ours':''}`;
function fullTable(t){return `<div class="table-scroll" tabindex="0" role="region" aria-label="Table ${t.number}: ${esc(t.title)}. Scroll horizontally when needed."><table class="data-table ${t.number>=6?'param-table':''}"><caption class="visually-hidden">${esc(t.title)}</caption><thead><tr>${t.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr class="${rowClass(r)}">${r.cells.map((v,i)=>`<${i===0?'th scope="row"':'td'}>${v}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>${tableNotes[t.number]?`<p class="table-note">${esc(tableNotes[t.number])}</p>`:''}`;}
function mainResults(t){
 const selected=t.rows.filter(r=>/^(GRPO|GTPO)/.test(r.cells[0]));
 const value=v=>v.replace(/<span class="gain">.*?<\/span>/g,'').trim();
 return `<div class="table-scroll compact-results" tabindex="0" role="region" aria-label="LIBERO matched comparisons"><table class="data-table"><caption class="visually-hidden">LIBERO success rate (%), matched GRPO and GTPO comparisons</caption><thead><tr><th scope="col">Method</th><th scope="col">Warm start</th><th scope="col" class="average">Average ↑</th><th scope="col">Object</th><th scope="col">Spatial</th><th scope="col">Goal</th><th scope="col">Long</th></tr></thead><tbody>${selected.map(r=>`<tr class="${rowClass(r)}"><th scope="row">${r.cells[0].startsWith('GTPO')?'GTPO':'GRPO'}</th><td>${r.cells[0].includes('†')?'1 demo / task':'Full demos'}</td>${[10,2,4,6,8].map((j,i)=>`<td${i===0?' class="average"':''}>${value(r.cells[j])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><details class="full-results"><summary>Full comparison · rankings and SFT gains</summary>${fullTable(t)}</details>`;
}
export function table(t){return `<section class="table-shell" id="table-${t.number}" data-table="${t.number}"><h4 class="table-heading"><span class="figure-no">Table ${t.number}</span>${esc(t.title)}${t.number===1?' (%)':''}</h4>${t.number===1?mainResults(t):fullTable(t)}</section>`;}

// Explicit identities: teacher table order is ST/MTA/NNT; the chart uses MTA/NNT/ST.
export function ablationSeriesLabel(index,setting){
 if(index===0)return `k = ${setting}${setting==='30'?' (default)':''}`;
 if(index===1)return setting==='Exp.'?'Exponential (default)':setting==='Linear'?'Linear':`τ = ${setting}`;
 return setting==='NNT'?'NNT (default)':setting;
}
// One manuscript table, presented alongside its three corresponding plots.
export function ablationTable(t,index){
 const groups=[];for(const row of t.rows){if(row.cells[0])groups.push([]);groups.at(-1).push(row);}
 const names=['Temporal window','Credit temperature','Teacher assignment'];
 return `<section class="ablation-metrics" data-table-part="5${'abc'[index]}"><h4 class="table-heading"><span class="figure-no">Table 5${'abc'[index]}</span>Metrics</h4><div class="table-scroll" tabindex="0" role="region" aria-label="${names[index]} metrics"><table class="data-table"><caption class="visually-hidden">${names[index]}: ${t.title}</caption><thead><tr><th scope="col">Setting</th><th scope="col">AUC ↑</th><th scope="col">Early ↑</th><th scope="col">TTS@95 ↓</th></tr></thead><tbody>${groups[index].map(r=>`<tr class="ablation-select-row" data-series-label="${esc(ablationSeriesLabel(index,r.cells[1]))}"><th scope="row"><button class="series-select" type="button" aria-pressed="false" aria-label="Highlight ${esc(ablationSeriesLabel(index,r.cells[1]))}">${r.cells[1]}</button></th>${r.cells.slice(2).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${index===1?'<p class="table-note">Annealing: τ 0.05 → 1</p>':''}</section>`;
}
