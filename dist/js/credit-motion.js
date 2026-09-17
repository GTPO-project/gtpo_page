// Source artwork illustrates the operations; intermediate numerical values are not inferred.
export function bindCreditMotion(container=document) {
 container.querySelectorAll('[data-credit-motion]').forEach(root=>{
  const phases=[...root.querySelectorAll('[data-credit-phase]')],buttons=[...root.querySelectorAll('.credit-pause')];
  const media=matchMedia('(prefers-reduced-motion: reduce)'),visible=new Set(),ready=new Set(),active=new Set(),effects=new Set(),flights=new Set();
  const scoreCells=[...root.querySelectorAll('.credit-score-strip rect')];
  let next=0,running=false,manual=false,stopped=false;
  const status=step=>{root.dataset.creditStep=step;};
  function sync(){
   const paused=manual||document.hidden||!visible.has(phases[next]);
   active.forEach(a=>paused?a.pause():a.play());
   root.dataset.playback=stopped||next===2?'complete':running?(paused?'paused':'playing'):'idle';
   buttons.forEach((b,i)=>{b.hidden=!running||stopped||i!==next;b.textContent=manual?'Continue':'Pause';b.setAttribute('aria-label',manual?'Continue credit animation':'Pause credit animation');});
  }
  function animation(el,frames,duration,delay=0){
   const a=el.animate(frames,{duration,delay,easing:'ease-in-out',fill:'both'});active.add(a);effects.add(a);
   a.finished.then(()=>active.delete(a),()=>active.delete(a));sync();return a;
  }
  const motion=(...args)=>animation(...args).finished;
  function cleanup(){effects.forEach(a=>a.cancel());effects.clear();active.clear();flights.clear();delete root.dataset.activeChunk;}
  async function score(phase){
   status('matrix');
   const focus=phase.querySelector('.credit-row-focus'),particles=[...phase.querySelectorAll('.credit-row-particles rect')];
   const grids=phase.querySelectorAll('.pipe-grid-cells');
   const costCells=[...grids[0].querySelectorAll('.pipe-cell')],planCells=[...grids[1].querySelectorAll('.pipe-cell')];
   for(let chunk=0;chunk<25;chunk++){
    root.dataset.activeChunk=String(chunk);
    const detailed=[0,12,24].includes(chunk),duration=detailed?1600:100;
    const y=(24-chunk)*4.16,tx=18+(chunk+.5)*284/25;
    focus.setAttribute('transform',`translate(0 ${y})`);
    const work=[motion(focus,[{opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.86},{opacity:0}],duration)];
    if(detailed){
     status('matrix',`Chunk ${chunk+1}: multiply aligned entries, sum the row, and negate.`);
     const rows=[costCells.filter(c=>+c.dataset.chunk===chunk),planCells.filter(c=>+c.dataset.chunk===chunk)];
     rows.forEach((cells,side)=>cells.forEach((cell,j)=>{
      const token=particles[side*25+j],x=+cell.getAttribute('x'),cy=+cell.getAttribute('y');
      token.setAttribute('fill',cell.getAttribute('fill'));
      work.push(motion(token,[{opacity:0,transform:`translate(${x}px,${cy}px)`},{opacity:1,transform:`translate(${x}px,${cy}px)`,offset:.15},{opacity:1,transform:`translate(${141+j*1.5}px,218px)`,offset:.55},{opacity:1,transform:`translate(158px,253px)`,offset:.73},{opacity:0,transform:`translate(${tx}px,307px)`}],duration));
     }));
     work.push(motion(phase.querySelector('.credit-aggregation-arrows'),[{opacity:.8},{opacity:1,offset:.55},{opacity:1}],duration));
    }
    work.push(motion(scoreCells[chunk],[{opacity:0},{opacity:1}],detailed?250:80,detailed?1350:20).then(()=>{scoreCells[chunk].dataset.revealed='true';}));
    await Promise.all(work);
   }
   status('score-complete');
  }
  const overlay=root.querySelector('.credit-transfer-overlay'),stages=root.querySelector('.credit-stages');
  function geometry(from,to){
   const box=stages.getBoundingClientRect(),a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
   return {box,x:a.left-box.left,y:a.top-box.top,w:a.width,h:a.height,tx:b.left-box.left,ty:b.top-box.top,tw:b.width,th:Math.max(.5,b.height)};
  }
  function transferFrames(token,from,to){
   const g=geometry(from,to),exit=geometry(scoreCells.at(-1),root.querySelector('.credit-bars-58 rect'));
   const exitX=exit.x+exit.w+4,bend=g.box.width>650?(exitX+exit.tx)/2:g.box.width-7,base=g.ty+g.th;
   token.setAttribute('width',g.w);token.setAttribute('height',g.h);
   // Travel along the score strip and through the gutter, never across labels.
   return [{opacity:0,fill:from.getAttribute('fill'),transform:`translate(${g.x}px,${g.y}px) scale(1,1)`},
    {opacity:1,fill:from.getAttribute('fill'),transform:`translate(${g.x}px,${g.y}px) scale(1,1)`,offset:.1},
    {opacity:1,fill:from.getAttribute('fill'),transform:`translate(${exitX}px,${g.y+g.h*.3}px) scale(.3,.3)`,offset:.3},
    {opacity:1,fill:from.getAttribute('fill'),transform:`translate(${bend}px,${base}px) scale(.3,.3)`,offset:.55},
    {opacity:1,fill:to.getAttribute('fill'),transform:`translate(${g.tx}px,${base}px) scale(.3,.3)`,offset:.76},
    {opacity:1,fill:to.getAttribute('fill'),transform:`translate(${g.tx}px,${g.ty}px) scale(${g.tw/g.w},${g.th/g.h})`,offset:.93},
    {opacity:0,fill:to.getAttribute('fill'),transform:`translate(${g.tx}px,${g.ty}px) scale(${g.tw/g.w},${g.th/g.h})`}];
  }
  function route(){
   const target=root.querySelector('.credit-bars-58 rect'),g=geometry(scoreCells.at(-1),target),path=overlay.querySelector('.credit-transfer-path');
   overlay.setAttribute('viewBox',`0 0 ${g.box.width} ${g.box.height}`);
   const sx=g.x+g.w,sy=g.y+g.h/2,tx=g.tx,ty=g.ty+g.th;
   const bend=g.box.width>650?(sx+tx)/2:g.box.width-7;
   path.setAttribute('d',`M${sx} ${sy}C${bend} ${sy},${bend} ${ty},${tx} ${ty}`);
  }
  async function allocate(phase){
   status('reveal');route();
   await Promise.all([motion(phase.querySelector('.pipe-art'),[{opacity:0},{opacity:1}],800),motion(overlay.querySelector('.credit-transfer-path'),[{opacity:0,strokeDasharray:'1',strokeDashoffset:1},{opacity:.65,strokeDasharray:'1',strokeDashoffset:0}],800)]);
   phase.dataset.visible='true';
   const original=[...phase.querySelectorAll('.credit-bars-59 rect')],weights=[...phase.querySelectorAll('.credit-bars-58 rect')],dense=[...phase.querySelectorAll('.credit-bars-62 rect')],tokens=[...overlay.querySelectorAll('.credit-transfer-token')];
   status('weights');
   await Promise.all(weights.map(async(el,i)=>{
    const token=tokens[i],a=animation(token,transferFrames(token,scoreCells[i],el),1000,i*50),record={a,token,from:scoreCells[i],to:el};flights.add(record);
    await Promise.all([a.finished,motion(scoreCells[i],[{opacity:.45},{opacity:1}],300,i*50)]);flights.delete(record);
    await motion(el,[{opacity:0},{opacity:1}],150);el.dataset.revealed='true';
   }));
   status('normalize');
   await motion(phase.querySelector('.credit-bars-58'),[{opacity:.6},{opacity:1}],650);
   status('dense');
   await Promise.all([
    ...dense.map((el,i)=>motion(el,[{opacity:0,transform:'scaleY(0)',transformOrigin:'center top'},{opacity:1,transform:'scaleY(1)',transformOrigin:'center top'}],600,i*80).then(()=>{el.dataset.revealed='true';})),
    ...original.map((el,i)=>motion(el,[{opacity:.55},{opacity:1}],400,i*80)),
    ...weights.map((el,i)=>motion(el,[{opacity:.55},{opacity:1}],400,i*80)),
    motion(phase.querySelector('.credit-chunk-focus'),[{opacity:0,transform:'translateX(0)'},{opacity:1,transform:'translateX(0)',offset:.05},{opacity:1,transform:'translateX(451.2px)',offset:.94},{opacity:0,transform:'translateX(451.2px)'}],2520)
   ]);
  }
  async function pump(){
   if(running||stopped||manual||document.hidden||next===2||!ready.has(phases[next]))return;
   running=true;const phase=phases[next];phase.dataset.state='active';root.dataset.activePhase=String(next);sync();
   try{await [score,allocate][next](phase);}catch(error){if(!stopped){console.error('Credit animation failed',error);finishStatic();return;}}
   finally{cleanup();phase.dataset.state='done';running=false;}
   if(stopped){sync();return;}next++;if(next===2){root.dataset.creditMode='complete';status('complete');}sync();void pump();
  }
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(({target,isIntersecting,intersectionRatio})=>{if(isIntersecting&&intersectionRatio>0)visible.add(target);else visible.delete(target);if(isIntersecting&&intersectionRatio>=.4)ready.add(target);else ready.delete(target);});sync();void pump();
  },{threshold:[0,.4],rootMargin:'-96px 0px 0px'});
  function finishStatic(){stopped=true;observer.disconnect();cleanup();next=2;root.dataset.creditMode='complete';phases.forEach(p=>p.dataset.state='done');status('complete');sync();}
  const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{if(root.dataset.activePhase!=='1'||stopped)return;route();flights.forEach(r=>r.a.effect.setKeyframes(transferFrames(r.token,r.from,r.to)));});resize?.observe(stages);
  buttons.forEach(b=>b.addEventListener('click',()=>{manual=!manual;sync();void pump();}));
  document.addEventListener('visibilitychange',()=>{sync();void pump();});media.addEventListener('change',()=>{if(media.matches)finishStatic();});
  if(media.matches||!Element.prototype.animate)finishStatic();else{root.dataset.creditMode='animated';phases.forEach(p=>observer.observe(p));}
 });
}
