// Figure 1 only: source artwork stays visible even without motion support.
export function bindOverview(container){
 container.querySelectorAll('.overview-interactive').forEach(root=>{
  // An expanded copy has new DOM nodes and receives independent controls/state.
  let selected=0, hovered=0, focused=0;
  const links=[...root.querySelectorAll('[data-rollout-link]')];
  const dialog=root.closest('dialog');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const panels=[...root.querySelectorAll('.diagram-panel')];
  const running=new Set(),entered=new WeakSet();
  function update(){
   const active=hovered||focused||selected;
   root.classList.toggle('has-rollout-focus',!!active);
   root.dataset.activeRollout=String(active);
   links.forEach(el=>{
    el.classList.toggle('rollout-muted',!!active&&+el.dataset.rolloutLink!==active);
    el.classList.toggle('rollout-active',!!active&&+el.dataset.rolloutLink===active);
   });
  }
  const numberFor=target=>{const el=target.closest('[data-rollout-link]');return Number(el?.dataset.rolloutLink??0);};
  root.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;hovered=numberFor(e.target);update();});
  root.addEventListener('pointerleave',()=>{hovered=0;update();});
  root.addEventListener('focusin',e=>{focused=numberFor(e.target);update();});
  root.addEventListener('focusout',e=>{focused=e.relatedTarget&&root.contains(e.relatedTarget)?numberFor(e.relatedTarget):0;update();});
  root.addEventListener('click',e=>{
   const target=e.target.closest('[data-rollout-link]');
   if(!target)return;
   const n=numberFor(target);selected=selected===n?0:n;hovered=0;focused=0;update();
  });
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=hovered=focused=0;update();}});
  function animate(el,frames,options){
   const animation=el.animate(frames,{duration:540,fill:'backwards',easing:'cubic-bezier(.22,.61,.36,1)',...options});
   running.add(animation);const done=()=>running.delete(animation);animation.addEventListener('finish',done,{once:true});animation.addEventListener('cancel',done,{once:true});return animation;
  }
  function enter(panel){
   // Off-screen/hidden responsive copies are not animated.
   if(reduce.matches||!panel.getClientRects().length)return;
   animate(panel,[{opacity:.55,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}]);
   panel.querySelectorAll('[data-trajectory]').forEach((path,i)=>{
    if(path.getBoundingClientRect().width)animate(path,[{strokeDasharray:'1 1',strokeDashoffset:1},{strokeDasharray:'1 1',strokeDashoffset:0}],{duration:850,delay:(i%4)*70});
   });
   panel.querySelectorAll('.uniform-bars').forEach((row,i)=>animate(row,[{opacity:.25,transform:'translateX(-5px)'},{opacity:1,transform:'translateX(0)'}],{duration:450,delay:100+i*85}));
  }
  // Qualitative construction of the supplied illustration; no solver states or
  // numeric transport values are fabricated. Each dependency awaits completion.
  const otPlayed={matrix:false,score:false};
  async function evolveOT(svg,buildMatrix,buildScore){
   const holds=new Map();
   const valid=()=>!reduce.matches&&svg.isConnected;
   const wait=animation=>animation.finished.catch(()=>{});
   const hold=el=>{if(el)holds.set(el,animate(el,[{opacity:0},{opacity:0}],{duration:1,fill:'both'}));};
   const reveal=el=>{holds.get(el)?.cancel();holds.delete(el);};
   const matrix=svg.querySelector('.ot-matrix'),guides=svg.querySelector('.ot-alignment-guides');
   const connector=svg.querySelector('.ot-score-connector'),score=svg.querySelector('.ot-score-output'),advantage=svg.querySelector('.ot-advantage-output');
   if(buildMatrix){hold(matrix);hold(guides);}
   if(buildScore){hold(connector);hold(score);hold(advantage);}
   try{
    if(buildMatrix&&matrix){
     svg.dataset.otPhase='teacher';
     const teacher=svg.querySelector('.ot-teacher-input');
     if(teacher)await wait(animate(teacher,[{opacity:.35},{opacity:1}],{duration:300}));
     if(!valid())return;
     svg.dataset.otPhase='matrix';reveal(matrix);
     await Promise.all([...matrix.querySelectorAll('.ot-matrix-cell')].map(cell=>wait(animate(cell,[{fill:'#f7f4ec'},{fill:cell.getAttribute('fill')}],{duration:640,delay:+cell.dataset.col*16+(19-Number(cell.dataset.row))*2}))));
     if(!valid())return;
     svg.dataset.otPhase='alignment';reveal(guides);
     const band=svg.querySelector('.ot-band');
     if(band)await wait(animate(band,[{strokeDasharray:'1 1',strokeDashoffset:1},{strokeDasharray:'1 1',strokeDashoffset:0}],{duration:350}));
    }
    if(!valid())return;
    if(buildScore&&score){
     svg.dataset.otPhase='transfer';reveal(connector);
     const link=svg.querySelector('.ot-score-link');
     if(link)await wait(animate(link,[{strokeDashoffset:.38,opacity:.4},{strokeDashoffset:0,opacity:1}],{duration:280}));
     if(!valid())return;
     svg.dataset.otPhase='score';reveal(score);
     await Promise.all([...score.querySelectorAll('.ot-score-cell')].map((cell,i)=>wait(animate(cell,[{opacity:.12},{opacity:1}],{duration:240,delay:i*10}))));
     if(!valid())return;
     svg.dataset.otPhase='advantage';reveal(advantage);
     await Promise.all([...svg.querySelectorAll('.ot-credit-bar')].map(bar=>wait(animate(bar,[{transform:'scaleY(.02)'},{transform:'scaleY(1)'}],{duration:380}))));
    }
   }finally{
    holds.forEach(animation=>animation.cancel());
    svg.dataset.otPhase='complete';
   }
  }
  const otObserver=new IntersectionObserver(entries=>{
   entries.forEach(({target,isIntersecting})=>{
    if(!isIntersecting||!target.getBoundingClientRect().width)return;
    otObserver.unobserve(target);
    const matrix=target.dataset.otSequence!=='score'&&!otPlayed.matrix;
    const score=target.dataset.otSequence!=='matrix'&&!otPlayed.score;
    if(matrix)otPlayed.matrix=true;if(score)otPlayed.score=true;
    if(!reduce.matches&&(matrix||score))void evolveOT(target,matrix,score);
   });
  },{threshold:.35});
  if(!dialog)root.querySelectorAll('[data-ot-sequence]').forEach(svg=>otObserver.observe(svg));
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(({target,isIntersecting})=>{
    if(isIntersecting&&!entered.has(target)){entered.add(target);enter(target);observer.unobserve(target);}
   });
  },{threshold:.12});
  if(!dialog)panels.forEach(p=>observer.observe(p));
  function motionPreference(){
   if(reduce.matches)running.forEach(a=>a.cancel());
  }
  motionPreference();reduce.addEventListener('change',motionPreference);
  update();
  // Closing a detail view releases its observer and preference listener.
  if(dialog)dialog.addEventListener('close',()=>{observer.disconnect();otObserver.disconnect();running.forEach(a=>a.cancel());reduce.removeEventListener('change',motionPreference);},{once:true});
 });
}
