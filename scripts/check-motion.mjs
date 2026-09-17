import assert from 'node:assert/strict';
import {bindClassroom} from '../dist/js/classroom.js';

// Deterministic browser-clock substitute: exercise lifecycle races without timers.
function fixture(reduced=false) {
  const animations=[],observers=[];
  const node=()=>({textContent:'',hidden:true,attributes:{},listeners:{},
    setAttribute(k,v){this.attributes[k]=v;},
    addEventListener(k,fn){this.listeners[k]=fn;},
    animate(){
      let resolve,reject;
      const animation={playState:'running',finished:new Promise((a,b)=>{resolve=a;reject=b;}),
        play(){this.playState='running';},pause(){this.playState='paused';},
        cancel(){this.playState='idle';reject(new Error('cancelled'));},
        finish(){assert.equal(this.playState,'running');this.playState='finished';resolve();}};
      animations.push(animation);return animation;
    }});
  const nodes=new Map(),el={dataset:{},classList:{toggle(){}},
    querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);},querySelectorAll(){return [];}};
  const doc={hidden:false,listeners:{},addEventListener(k,fn){this.listeners[k]=fn;}};
  const media={matches:reduced,addEventListener(k,fn){this.change=fn;}};
  globalThis.document=doc;globalThis.Element=class {animate(){}};
  globalThis.matchMedia=()=>media;
  globalThis.IntersectionObserver=class {constructor(fn){observers.push(fn);}observe(){}};
  bindClassroom({querySelectorAll:()=>[el]});
  return {el,media,doc,animations,button:el.querySelector('.classroom-pause'),
    visibility(ratio){observers[0]([{isIntersecting:ratio>0,intersectionRatio:ratio}]);},
    async next(){animations.at(-1).finish();await Promise.resolve();await Promise.resolve();}};
}

const f=fixture();
f.visibility(.2);assert.equal(f.animations.length,0,'Do not start while just the board is visible');
f.visibility(.8);assert.equal(f.el.dataset.phase,'intro');assert.equal(f.el.dataset.playback,'playing');
f.button.listeners.click();assert.equal(f.el.dataset.playback,'paused');
f.visibility(0);f.visibility(.8);assert.equal(f.el.dataset.playback,'paused','Re-entry preserves manual pause');
f.button.listeners.click();assert.equal(f.el.dataset.playback,'playing');
await f.next();assert.equal(f.el.dataset.phase,'grpo');
assert.equal(f.el.dataset.method,'grpo');assert.equal(f.el.querySelector('.class-method-grpo .class-method-state').textContent,'NOW');
f.doc.hidden=true;f.doc.listeners.visibilitychange();assert.equal(f.el.dataset.playback,'paused');
f.doc.hidden=false;f.doc.listeners.visibilitychange();assert.equal(f.el.dataset.playback,'playing');
f.visibility(0);assert.equal(f.el.dataset.playback,'paused');
f.visibility(.8);await f.next();assert.equal(f.el.dataset.phase,'gtpo');
assert.equal(f.el.dataset.method,'gtpo');assert.equal(f.el.querySelector('.class-method-gtpo .class-method-state').textContent,'NOW');
await f.next();assert.equal(f.el.dataset.phase,'improve');
await f.next();assert.equal(f.el.dataset.playback,'complete');assert.equal(f.button.hidden,true);
const count=f.animations.length;f.visibility(0);f.visibility(.8);assert.equal(f.animations.length,count,'No replay after completion');
const reduced=fixture(true);assert.equal(reduced.el.dataset.playback,'complete');assert.equal(reduced.animations.length,0);
const changed=fixture();changed.visibility(.8);changed.media.matches=true;changed.media.change();
await Promise.resolve();assert.equal(changed.el.dataset.playback,'complete');assert.equal(changed.button.hidden,true);
console.log('PASS: once-only start, phase order, manual/off-screen/hidden pause, resume, reduced motion and in-flight cancellation.');
