import {alignmentSteps} from './pipeline.js';

export function bindPipelineMotion(container=document) {
  container.querySelectorAll('[data-pipeline-alignment]').forEach(root=>{
    const stages=[...root.querySelectorAll('[data-align-stage]')],button=root.querySelector('.pipe-pause');
    const localButtons=stages.map(stage=>stage.querySelector('.pipe-local-pause'));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const visible=new Set(),ready=new Set(),played=new Set(),active=new Set(),effects=new Set();
    let running=false,manualPause=false,stopped=false;
    function sync() {
      const paused=manualPause||document.hidden||!visible.size;
      for(const animation of active)paused?animation.pause():animation.play();
      root.dataset.playback=stopped||played.size===stages.length&&!running?'complete':running?(paused?'paused':'playing'):'idle';
      button.hidden=!running||stopped;
      button.textContent=manualPause?'Continue':'Pause';
      button.setAttribute('aria-label',manualPause?'Continue alignment animation':'Pause alignment animation');
      localButtons.forEach((control,index)=>{
        control.hidden=!running||stopped||stages[index].dataset.state!=='active';
        control.textContent=button.textContent;
        control.setAttribute('aria-label',manualPause?'Continue alignment animation':'Pause alignment animation');
      });
    }
    function animate(el,frames,duration,delay=0) {
      const a=el.animate(frames,{duration,delay,fill:'both',easing:'ease-in-out'});
      active.add(a);effects.add(a);
      a.finished.then(()=>active.delete(a),()=>active.delete(a));sync();return a.finished;
    }
    function describe(index,title,detail,equation) {
      root.dataset.activeStep=String(index);
      root.querySelector('.pipe-phase-number').textContent=`0${index+1} / 04`;
      root.querySelector('.pipe-phase-title').textContent=title;
      root.querySelector('.pipe-phase-detail').textContent=detail;
      root.querySelector('.pipe-phase-equation').textContent=equation;
      stages[index].querySelector('.pipe-description').textContent=detail;
      stages[index].querySelector('.pipe-local-equation').textContent=equation;
    }
    function cleanup() {delete root.dataset.balanceAxis;for(const a of effects)a.cancel();effects.clear();active.clear();}
    function complete() {
      describe(3,'Aligned in time. Ready to assign credit.','The plan links student chunks to nearby teacher progress.','𝒯⋆1 = μ   ·   (𝒯⋆)ᵀ1 = ν');
      button.hidden=true;sync();
    }
    async function cost(stage) {
      describe(0,alignmentSteps[0].title,alignmentSteps[0].detail,'𝒞ₐᵦ = 1 − cosine(xᵢ,ₐ₊₁, xⱼ,ᵦ₊₁)');
      const scan=stage.querySelector('.pipe-cost-scan');
      await Promise.all([
        ...[...stage.querySelectorAll('.pipe-cell')].map(cell=>animate(cell,[{fill:C_PAPER},{fill:cell.getAttribute('fill')}],700,Number(cell.dataset.teacher)*42)),
        animate(scan,[{opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.88},{opacity:0}],2000),
        animate(scan.children[0],[{transform:'translateY(167px)'},{transform:'translateY(0)'}],2000),
        animate(scan.children[1],[{transform:'translateX(0)'},{transform:'translateX(167px)'}],2000)
      ]);
    }
    async function mask(stage) {
      describe(1,alignmentSteps[1].title,alignmentSteps[1].detail,'𝒦 = ℳ ⊙ exp(−𝒞 / ε)');
      await Promise.all([...stage.querySelectorAll('.pipe-cell')].map(cell=>cell.dataset.permitted==='true'
        ?animate(cell,[{opacity:.12},{opacity:1}],650,(Number(cell.dataset.student)+Number(cell.dataset.teacher))*28)
        :animate(cell,[{fill:'#98b59b',opacity:.7},{fill:cell.getAttribute('fill'),opacity:.22}],1300)));
    }
    async function balance(stage) {
      const planStage=stages[3],rowScan=planStage.querySelector('.pipe-plan-scan'),columnScan=planStage.querySelector('.pipe-plan-column');
      for(let pass=0;pass<2;pass++) {
        describe(2,'Balance the student rows.','Scale row mass toward the uniform student marginal μ.','u ← μ / (𝒦v)');root.dataset.balanceAxis='row';
        await Promise.all([
          animate(stage.querySelector('.pipe-row-focus'),[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.8},{opacity:0}],1400),
          animate(stage.querySelector('.pipe-student-mass'),[{opacity:.55},{opacity:1,offset:.5},{opacity:.8}],1400),
          animate(rowScan,[{opacity:0},{opacity:1,offset:.1},{opacity:1,offset:.9},{opacity:0}],1400),
          animate(rowScan.children[0],[{transform:'translateY(167px)'},{transform:'translateY(0)'}],1400),
          ...[...stage.querySelectorAll('.pipe-mass-link')].map(link=>animate(link,[{strokeDashoffset:1,stroke:'#9b4843'},{strokeDashoffset:0,stroke:'#81937a'}],1400))
        ]);
        describe(2,'Balance the teacher columns.','Scale column mass toward ν, then alternate the two updates.','v ← ν / (𝒦ᵀu)');root.dataset.balanceAxis='column';
        await Promise.all([
          animate(stage.querySelector('.pipe-column-focus'),[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.8},{opacity:0}],1400),
          animate(stage.querySelector('.pipe-teacher-mass'),[{opacity:.55},{opacity:1,offset:.5},{opacity:.8}],1400),
          animate(columnScan,[{opacity:0},{opacity:1,offset:.1},{opacity:1,offset:.9},{opacity:0}],1400),
          animate(columnScan.children[0],[{transform:'translateX(0)'},{transform:'translateX(167px)'}],1400),
          ...[...stage.querySelectorAll('.pipe-mass-link')].map(link=>animate(link,[{strokeDashoffset:0,stroke:'#35634d'},{strokeDashoffset:1,stroke:'#81937a'}],1400))
        ]);
      }
      delete root.dataset.balanceAxis;
    }
    async function plan(stage) {
      describe(3,alignmentSteps[3].title,alignmentSteps[3].detail,'𝒯⋆ = diag(u) 𝒦 diag(v)');
      const scan=stage.querySelector('.pipe-plan-scan');
      await Promise.all([
        ...[...stage.querySelectorAll('.pipe-cell')].map(cell=>animate(cell,[{opacity:.05},{opacity:1}],800,Number(cell.dataset.teacher)*42)),
        animate(scan,[{opacity:0},{opacity:1,offset:.1},{opacity:1,offset:.9},{opacity:0}],2200),
        animate(scan.children[0],[{transform:'translateY(167px)'},{transform:'translateY(0)'}],2200)
      ]);
    }
    const sequences=[cost,mask,balance,plan];
    async function pump() {
      if(running||stopped||manualPause||document.hidden)return;
      const next=stages.findIndex(stage=>ready.has(stage)&&!played.has(stage));
      if(next<0)return;
      running=true;const stage=stages[next];played.add(stage);stage.dataset.state='active';button.hidden=false;sync();
      try {await sequences[next](stage);}catch { /* Preference changes commit the static source artwork. */ }
      finally {cleanup();stage.dataset.state='done';running=false;sync();}
      if(stopped)return;
      if(played.size===stages.length)complete();else void pump();
    }
    const observer=new IntersectionObserver(entries=>{
      for(const {target,isIntersecting,intersectionRatio} of entries) {
        if(isIntersecting&&intersectionRatio>0)visible.add(target);else visible.delete(target);
        if(isIntersecting&&intersectionRatio>=.45)ready.add(target);else ready.delete(target);
      }
      sync();void pump();
    },{threshold:[0,.45],rootMargin:'-90px 0px 0px'});
    function staticMode() {
      if(!reduced.matches&&Element.prototype.animate)return;
      stopped=true;observer.disconnect();cleanup();stages.forEach(stage=>{played.add(stage);stage.dataset.state='done';});complete();
    }
    [button,...localButtons].forEach(control=>control.addEventListener('click',()=>{manualPause=!manualPause;sync();void pump();}));
    document.addEventListener('visibilitychange',()=>{sync();void pump();});
    reduced.addEventListener('change',staticMode);
    if(root.closest('dialog')){stopped=true;stages.forEach(s=>played.add(s));complete();}
    else if(reduced.matches||!Element.prototype.animate)staticMode();
    else stages.forEach(stage=>observer.observe(stage));
  });
}
const C_PAPER='#f7f4ec';
