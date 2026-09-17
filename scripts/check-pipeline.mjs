import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pipeline,sourceGrid} from '../dist/js/pipeline.js';
import {recolor} from '../dist/js/figures.js';
import {bindPipelineMotion} from '../dist/js/pipeline-motion.js';

const graphics=JSON.parse(fs.readFileSync(new URL('../dist/data/graphics.json',import.meta.url)));
const html=pipeline(graphics);
assert.deepEqual([...html.matchAll(/data-photo="(\d+)"/g)].map(m=>+m[1]),[27,28,29,19,20,21,30,31,32,22,23,24]);
assert.equal(html.includes('<math'),false,'Formula blocks removed at user request');
assert.equal((html.match(/class="pipe-cell"/g)||[]).length,3125);
for(const id of ['25','26','43']) {
  const source=graphics[id],kind=id==='43'?'mask':'cost';
  const rendered=sourceGrid(source,47,43,174,kind,graphics['43']);
  const cells=[...rendered.matchAll(/<rect[^>]+>/g)];assert.equal(cells.length,625);
  cells.forEach((m,i)=>{
    const row=Math.floor(i/25),col=i%25,attrs=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]));
    assert.equal(+attrs.x,47+row*174/25);assert.equal(+attrs.y,43+(24-col)*174/25);
    assert.equal(+attrs['data-student'],col);assert.equal(+attrs['data-teacher'],row);
    assert.equal(attrs['data-permitted'],String(graphics['43'].colors[row][col][0]<220));
    if(kind!=='mask')assert.equal(attrs.fill,recolor(source.colors[row][col]));
  });
}
for(const [id,height] of [['59',64],['58',64],['62',64]]) {
  const group=html.match(new RegExp(`<g[^>]* data-source-bars="${id}">([\\s\\S]*?)</g>`))[1];
  const bars=[...group.matchAll(/<rect[^>]*height="([^"]+)"/g)];assert.equal(bars.length,25);
  bars.forEach((m,i)=>assert.equal(+m[1],graphics[id].bars[i].height*height));
}

function fixture(reducedMotion=false) {
  const animations=[],history=[],callbacks=[];
  function node() {
    let value='';return {dataset:{},children:[],hidden:true,listeners:{},
      get textContent(){return value;},set textContent(v){value=v;history.push(v);},
      setAttribute(){},getAttribute(){return '#35634d';},
      addEventListener(name,fn){this.listeners[name]=fn;},
      animate(frames,options){let resolve,reject;const a={frames,options,playState:'running',finished:new Promise((a,b)=>{resolve=a;reject=b;}),pause(){this.playState='paused';},play(){this.playState='running';},cancel(){this.playState='idle';reject(new Error('cancelled'));},finish(){if(this.playState==='running'){this.playState='finished';resolve();}}};animations.push(a);return a;}
    };
  }
  const stages=Array.from({length:4},()=>{
    const stage=node(),nodes=new Map(),cells=Array.from({length:3},(_,i)=>Object.assign(node(),{dataset:{teacher:String(i),student:String(i),permitted:String(i!==2)}}));
    stage.querySelector=s=>{if(!nodes.has(s)){const el=node();el.children=[node(),node()];nodes.set(s,el);}return nodes.get(s);};
    stage.querySelectorAll=s=>s==='.pipe-cell'?cells:Array.from({length:4},node);return stage;
  });
  const nodes=new Map(),root=node();root.closest=()=>null;
  root.querySelector=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);};root.querySelectorAll=()=>stages;
  const doc={hidden:false,listeners:{},addEventListener(n,fn){this.listeners[n]=fn;}};
  const media={matches:reducedMotion,addEventListener(n,fn){this.change=fn;}};
  globalThis.document=doc;globalThis.matchMedia=()=>media;globalThis.Element=class {animate(){}};
  globalThis.IntersectionObserver=class {constructor(fn){callbacks.push(fn);}observe(){}disconnect(){}};
  bindPipelineMotion({querySelectorAll:()=>[root]});
  return {animations,history,stages,root,doc,media,button:root.querySelector('.pipe-pause'),
    see(indices){callbacks[0](stages.map((target,i)=>({target,isIntersecting:indices.includes(i),intersectionRatio:indices.includes(i)?.8:0})));},
    async advance(){animations.filter(a=>a.playState==='running').forEach(a=>a.finish());for(let i=0;i<8;i++)await Promise.resolve();}
  };
}
const f=fixture();f.see([0,1,2,3]);assert.equal(f.root.dataset.activeStep,'0');
f.button.listeners.click();assert.equal(f.root.dataset.playback,'paused');assert.ok(f.animations.every(a=>a.playState==='paused'));
f.see([]);f.see([0,1,2,3]);assert.equal(f.root.dataset.playback,'paused','Manual pause survives re-entry');
f.button.listeners.click();f.doc.hidden=true;f.doc.listeners.visibilitychange();assert.equal(f.root.dataset.playback,'paused');
f.doc.hidden=false;f.doc.listeners.visibilitychange();await f.advance();assert.equal(f.root.dataset.activeStep,'1');
f.see([]);assert.equal(f.root.dataset.playback,'paused');f.see([0,1,2,3]);
for(let i=0;i<15&&f.root.dataset.playback!=='complete';i++)await f.advance();
assert.equal(f.root.dataset.playback,'complete');assert.ok(f.stages.every(s=>s.dataset.state==='done'));
assert.equal(f.history.filter(x=>x==='u ← μ / (𝒦v)').length,4);assert.equal(f.history.filter(x=>x==='v ← ν / (𝒦ᵀu)').length,4);
const count=f.animations.length;f.see([]);f.see([0,1,2,3]);assert.equal(f.animations.length,count,'Never replay');
const small=fixture();small.see([0]);small.stages[0].querySelector('.pipe-local-pause').listeners.click();assert.equal(small.root.dataset.playback,'paused');assert.match(small.stages[0].querySelector('.pipe-local-equation').textContent,/cosine/);small.stages[0].querySelector('.pipe-local-pause').listeners.click();await small.advance();assert.equal(small.stages[1].dataset.state,undefined,'Do not animate unseen mobile stages');small.see([1]);await small.advance();assert.equal(small.stages[1].dataset.state,'done');
const reduced=fixture(true);assert.equal(reduced.animations.length,0);assert.equal(reduced.root.dataset.playback,'complete');
const changed=fixture();changed.see([0,1,2,3]);changed.media.matches=true;changed.media.change();await changed.advance();assert.equal(changed.root.dataset.playback,'complete');
console.log('PASS: source cells/orientation/mask, 12 photos, 75 bars, formula blocks removed, sequential stages, row/column updates, pause/resume, mobile visibility, once-only and reduced motion.');
