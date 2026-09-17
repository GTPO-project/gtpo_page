import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pipeline} from '../dist/js/pipeline.js';
import {bindCreditMotion} from '../dist/js/credit-motion.js';
const html=pipeline(JSON.parse(fs.readFileSync(new URL('../dist/data/graphics.json',import.meta.url))));
assert.equal((html.match(/data-particle=/g)||[]).length,50);
assert.match(html,/data-credit-mode="pending"/);
for(const id of ['59','58','62'])assert.equal((html.match(new RegExp(`<g[^>]*data-source-bars="${id}">([\\s\\S]*?)</g>`))[1].match(/data-chunk=/g)||[]).length,25);

function fixture(reduced=false){
 const animations=[],history=[],chunkHistory=[],callbacks=[];
 class Node{
  constructor(attrs={}){this.attrs=attrs;this.dataset={};this.children=[];this.listeners={};this.nodes=new Map();this.lists=new Map();this.hidden=true;}
  set textContent(v){this.value=v;history.push(v);}get textContent(){return this.value;}
  setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??'0';}
  querySelector(s){if(!this.nodes.has(s))this.nodes.set(s,new Node());return this.nodes.get(s);}
  querySelectorAll(s){return this.lists.get(s)||[];}
  addEventListener(n,f){this.listeners[n]=f;}
  getBoundingClientRect(){return {left:+(this.attrs.x||10),top:+(this.attrs.y||20),width:+(this.attrs.width||20),height:+(this.attrs.height||10)};}
  animate(frames,options){let resolve,reject;const a={el:this,frames,options,playState:'running',effect:{setKeyframes(v){a.frames=v;}},finished:new Promise((r,j)=>{resolve=r;reject=j;}),pause(){this.playState='paused';},play(){this.playState='running';},cancel(){this.playState='idle';reject(Error('cancel'));},finish(){if(this.playState==='running'){this.playState='finished';resolve();}}};animations.push(a);return a;}
 }
 const make=(n,f=()=>({}))=>Array.from({length:n},(_,i)=>new Node(f(i)));
 const phases=make(2),buttons=make(2),root=new Node();root.dataset=new Proxy({}, {set(t,k,v){if(k==='activeChunk')chunkHistory.push(+v);t[k]=v;return true;}});
 const scores=make(25,i=>({x:18+i*11.36,y:296,width:11.36,height:28,fill:'#35634d'}));
 const grids=make(2);grids.forEach((grid,side)=>{grid.lists.set('.pipe-cell',make(625,i=>({x:side*192+12+Math.floor(i/25)*4.16,y:91+(24-i%25)*4.16,fill:'#35634d'})).map((n,i)=>{n.dataset.chunk=String(i%25);return n;}));});
 phases[0].lists.set('.pipe-grid-cells',grids);phases[0].lists.set('.credit-row-particles rect',make(50));
 for(const id of ['59','58','62']){const bars=make(25,i=>({x:360+i*18.8,y:id==='58'?178:308,width:15,height:64,fill:'#35634d'}));phases[1].lists.set(`.credit-bars-${id} rect`,bars);root.nodes.set(`.credit-bars-${id} rect`,bars[0]);}
 const overlay=root.querySelector('.credit-transfer-overlay');overlay.lists.set('.credit-transfer-token',make(25));
 root.nodes.set('.credit-stages',new Node({x:0,y:0,width:840,height:450}));
 root.lists.set('[data-credit-phase]',phases);root.lists.set('.credit-pause',buttons);root.lists.set('.credit-score-strip rect',scores);
 const doc={hidden:false,listeners:{},addEventListener(n,f){this.listeners[n]=f;}},media={matches:reduced,addEventListener(n,f){this.change=f;}};
 globalThis.document=doc;globalThis.matchMedia=()=>media;globalThis.Element=Node;
 globalThis.IntersectionObserver=class{constructor(f){callbacks.push(f);}observe(){}disconnect(){}};
 bindCreditMotion({querySelectorAll:()=>[root]});
 return {root,phases,buttons,animations,history,chunkHistory,scores,doc,media,
  see(ids){callbacks[0](phases.map((target,i)=>({target,isIntersecting:ids.includes(i),intersectionRatio:ids.includes(i)?.8:0})));},
  async advance(){animations.filter(a=>a.playState==='running').forEach(a=>a.finish());for(let i=0;i<20;i++)await Promise.resolve();}
 };
}
const f=fixture();f.see([1]);assert.equal(f.animations.length,0,'02 cannot skip 01');
f.see([0,1]);assert.equal(f.root.dataset.activePhase,'0');assert.equal(f.phases[1].dataset.visible,undefined);
f.buttons[0].listeners.click();assert.equal(f.root.dataset.playback,'paused');f.see([]);f.see([0,1]);assert.equal(f.root.dataset.playback,'paused');f.buttons[0].listeners.click();
f.see([1]);assert.equal(f.root.dataset.playback,'paused','Pause when current phase leaves, even if later phase is visible');f.see([0,1]);
f.doc.hidden=true;f.doc.listeners.visibilitychange();assert.equal(f.root.dataset.playback,'paused');f.doc.hidden=false;f.doc.listeners.visibilitychange();
for(let i=0;i<25;i++)await f.advance();assert.deepEqual(f.chunkHistory,Array.from({length:25},(_,i)=>i));assert.ok(f.scores.every(n=>n.dataset.revealed==='true'));assert.equal(f.root.dataset.activePhase,'1');
const focus=f.animations.filter(a=>a.el===f.phases[0].querySelector('.credit-row-focus'));assert.equal(focus.reduce((s,a)=>s+a.options.duration,0),7000);assert.equal(focus.filter(a=>a.options.duration===1600).length,3);
await f.advance();assert.equal(f.phases[1].dataset.visible,'true');assert.equal(f.root.dataset.creditStep,'weights');
for(let i=0;i<10&&f.root.dataset.playback!=='complete';i++)await f.advance();assert.equal(f.root.dataset.playback,'complete');assert.equal(f.root.dataset.creditMode,'complete');
for(const id of ['58','62'])assert.ok(f.phases[1].querySelectorAll(`.credit-bars-${id} rect`).every(n=>n.dataset.revealed==='true'));
const count=f.animations.length;f.see([]);f.see([0,1]);assert.equal(f.animations.length,count,'No replay');
const mobile=fixture();mobile.see([0]);for(let i=0;i<25;i++)await mobile.advance();assert.equal(mobile.root.dataset.playback,'idle');assert.equal(mobile.phases[1].dataset.state,undefined);mobile.see([1]);assert.equal(mobile.root.dataset.activePhase,'1');
const reduced=fixture(true);assert.equal(reduced.animations.length,0);assert.equal(reduced.root.dataset.creditMode,'complete');
const changed=fixture();changed.see([0,1]);changed.media.matches=true;changed.media.change();await changed.advance();assert.equal(changed.root.dataset.creditMode,'complete');
console.log('PASS: strict 01→02 dependency, all 25 chunks, 3 detailed rows / 7 seconds, score-to-weight transfer, full bar restoration, current-phase visibility, manual/hidden pauses, no replay and reduced motion.');
