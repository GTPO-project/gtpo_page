import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {movingAverage,crossing} from '../dist/js/charts.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=n=>JSON.parse(fs.readFileSync(path.join(root,'dist/data',n),'utf8'));
const charts=json('charts.json'),tables=json('tables.json'),photos=json('photos.json'),graphics=json('graphics.json');
assert.equal(tables.length,10);assert.deepEqual(tables.map(t=>t.rows.length),[16,2,3,3,13,11,16,6,11,14]);
for(const t of tables)for(const row of t.rows){assert.equal(row.cells.length,t.headers.length);assert.ok(row.cells.every(s=>!s.includes('\\')),'No unrendered LaTeX commands');}
assert.equal(charts.spatial[1].source,'data/libero_spatial/spatial_grpo.csv');
assert.equal(charts.spatial[2].source,'data/libero_spatial/spatial_gtpo.csv');
assert.ok(charts.window.find(s=>s.label==='k = 15').source.endsWith('gtpo_k_50.csv'));
assert.ok(charts.window.find(s=>s.label==='k = 50').source.endsWith('gtpo_k_15.csv'));
let pointCount=0;
for(const [name,ss] of Object.entries(charts))for(const s of ss){
 assert.ok(s.points.length);pointCount+=s.points.length;
 for(let i=0;i<s.points.length;i++){const [x,y]=s.points[i];assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&y>=0&&y<=100);if(i)assert.ok(x>=s.points[i-1][0]);}
 if(name!=='rounds'){
   // Independent comparison against the actual source CSV, including missing-value handling.
   const csv=fs.readFileSync(path.resolve(root,'..',s.source),'utf8').trim().split(/\r?\n/).slice(1);
   const expected=csv.map(r=>r.split(',').map(v=>v.replaceAll('"','').trim())).filter(r=>r[s.column]&&r[s.stepColumn]).map(r=>[Number(r[s.stepColumn]),Number(r[s.column])*100]).filter(p=>name!=='window'||p[0]<=96);
   assert.deepEqual(s.points,expected,`${name}: ${s.label}`);
 }
}
assert.equal(pointCount,3089);
// Numerically verify the displayed OT table against the source convention.
const expected={GTPO:[85.97,78.23,52,100],'GTPO-pointwise':[81.89,74.70,73,95.80],GRPO:[80.72,73.74,70,96.53]};
for(const s of charts.ot){const trend=movingAverage(s.points);const auc=trend.reduce((sum,p)=>sum+p[1],0)/trend.length;const early=trend[19][1];const actual=[auc,early,crossing(trend),s.points.at(-1)[1]];actual.forEach((v,i)=>assert.ok(Math.abs(v-expected[s.label][i])<.011,`${s.label} metric ${i}: ${v}`));}
assert.equal(crossing(movingAverage(charts.spatial[2].points)),null);
assert.equal(crossing(movingAverage(charts.long[2].points)),null);
for(const p of Object.values(photos))assert.ok(fs.statSync(path.join(root,'dist',p)).size>0);
for(const n of ['25','26','43'])assert.equal(graphics[n].colors.flat().length,625);
for(const n of ['58','59','62'])assert.equal(graphics[n].bars.length,25);
for(const filename of fs.readdirSync(path.join(root,'dist/js')).filter(s=>s.endsWith('.js'))){const r=spawnSync(process.execPath,['--check',path.join(root,'dist/js',filename)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);}
const sourcePdf=fs.readFileSync(path.resolve(root,'../GTPO-paper/main.pdf')),sitePdf=fs.readFileSync(path.join(root,'dist/assets/gtpo-paper.pdf'));assert.ok(sourcePdf.equals(sitePdf));
const report={status:'pass',figures:8,tables:10,tableRows:95,rawDataPoints:pointCount,photoAssets:Object.keys(photos).length,checks:['CSV data and corrected filename mappings','OT metrics against the paper','Unreached thresholds preserved','Matrix and bar element counts','All table dimensions and LaTeX rendering','JavaScript syntax','PDF byte-for-byte integrity']};
fs.writeFileSync(path.join(root,'qa/data-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
