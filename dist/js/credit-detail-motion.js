// Reveal the source timeline; frame positions illustrate time, not inferred OT matches.
export function bindCreditDetail(container=document,options={}) {
 container.querySelectorAll('[data-credit-detail]').forEach(root=>{
  const frames=[...root.querySelectorAll('.film-cell')];
  const bars=[...root.querySelectorAll('.detail-weight-bars rect')];
  const cursor=root.querySelector('.detail-time-cursor'),button=root.querySelector('.detail-pause');
  const matrix=root.querySelector('.detail-cost'),timeline=root.querySelector('.detail-timeline');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed=0,last=0,raf=0,visible=false,manual=false,done=false;
  const lead=600,durations=[850,850,850,850,850,1700,850,850],end=lead+durations.reduce((a,b)=>a+b,0);
  function draw(t) {
   matrix.style.opacity=String(.35+.65*Math.min(1,t/lead));
   let remaining=Math.max(0,t-lead),index=0;
   while(index<7&&remaining>=durations[index])remaining-=durations[index++];
   const position=Math.min(8,index+remaining/durations[index]),progress=position/8;
   root.dataset.observation=String(index+1);
   frames.forEach((frame,i)=>{
    const active=t>=lead&&i%8===index;
    frame.classList.toggle('detail-current',active);
    frame.style.opacity=t<lead?'.6':i%8<=index?'1':'.5';
   });
   bars.forEach((bar,i)=>{
    const amount=Math.max(0,Math.min(1,progress*bars.length-i));
    bar.style.transform=`scaleY(${amount})`;
    bar.style.opacity=String(.3+.7*amount);
   });
   cursor.setAttribute('transform',`translate(${Math.min(819,progress*820)} 0)`);
   cursor.setAttribute('opacity',t>=lead?'0.65':'0');
  }
  function finish() {
   done=true;cancelAnimationFrame(raf);raf=0;root.dataset.detailMotion='complete';
   frames.forEach(f=>{f.classList.remove('detail-current');f.style.removeProperty('opacity');});
   bars.forEach(b=>{b.style.removeProperty('transform');b.style.removeProperty('opacity');});
   matrix.style.removeProperty('opacity');cursor.setAttribute('opacity','0');button.hidden=true;
   observer?.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',onReduced);
  }
  function tick(now) {
   if(last)elapsed+=Math.min(80,now-last);last=now;
   if(elapsed>=end+750){finish();return;}
   draw(Math.min(elapsed,end));raf=requestAnimationFrame(tick);
  }
  function sync() {
   cancelAnimationFrame(raf);raf=0;last=0;
   if(done)return;
   const paused=manual||document.hidden||!visible;
   root.dataset.detailMotion=paused?'paused':'playing';
   button.textContent=manual?'Continue':'Pause';
   button.setAttribute('aria-label',manual?'Continue trajectory animation':'Pause trajectory animation');
   if(!paused)raf=requestAnimationFrame(tick);
  }
  function onReduced(){if(reduced.matches)finish();}
  let observer=null;
  if(options.static||reduced.matches){finish();return;}
  draw(0);button.hidden=false;
  observer=new IntersectionObserver(entries=>{
   visible=entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.25);sync();
  },{threshold:[0,.25],rootMargin:'-90px 0px 0px'});
  observer.observe(timeline);
  button.addEventListener('click',()=>{manual=!manual;sync();});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',onReduced);
 });
}
