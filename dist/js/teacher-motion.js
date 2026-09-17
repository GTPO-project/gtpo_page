const bound=new WeakSet();
export function bindTeacherMotion(root=document){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 root.querySelectorAll('.teacher-grid').forEach(grid=>{
  if(bound.has(grid))return;bound.add(grid);
  const links=[...grid.querySelectorAll('.teacher-link')].map(el=>({el,start:+el.dataset.start,duration:+el.dataset.duration,from:el.dataset.from.split(',').map(Number),to:el.dataset.to.split(',').map(Number),final:el.querySelector('.teacher-link-final'),draw:el.querySelector('.teacher-link-draw'),signal:el.querySelector('.teacher-signal')}));
  const arrivals=[...grid.querySelectorAll('.teacher-arrival')],best=grid.querySelector('.teacher-best'),button=grid.querySelector('.teacher-motion-toggle');
  let time=0,last=0,frame=0,visible=false,paused=false,done=false;
  const clamp=v=>Math.max(0,Math.min(1,v));
  function paint(){
   grid.dataset.teacherMotion=done?'complete':paused?'paused':'running';
   for(const l of links){
    const p=clamp((time-l.start)/l.duration),active=p>0&&p<1;
    l.final.style.opacity=p===1?'1':'0';
    l.draw.style.opacity=active?'1':'0';l.draw.style.strokeDasharray='100';l.draw.style.strokeDashoffset=String(100*(1-p));
    l.signal.style.opacity=active?'1':'0';
    l.signal.setAttribute('cx',l.from[0]+(l.to[0]-l.from[0])*p);l.signal.setAttribute('cy',l.from[1]+(l.to[1]-l.from[1])*p);
   }
   best.style.opacity=clamp((time-Number(best.dataset.at))/250);
   for(const el of arrivals){const p=(time-Number(el.dataset.at))/600;el.style.opacity=p>=0&&p<=1?String(Math.sin(p*Math.PI)):'0';}
   button.hidden=done;button.textContent=paused?'Continue animation':'Pause animation';
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function tick(now){frame=0;if(last)time+=Math.min(now-last,80);last=now;if(time>=7800){time=7800;done=true;paint();stop();return;}paint();frame=requestAnimationFrame(tick);}
  function sync(){if(visible&&!document.hidden&&!paused&&!done){if(!frame)frame=requestAnimationFrame(tick);}else stop();}
  function finish(){done=true;time=7800;stop();paint();}
  button.addEventListener('click',()=>{paused=!paused;paint();sync();});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.5;sync();},{threshold:[0,.5],rootMargin:'-90px 0px 0px'});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
  if(reduced.matches||grid.closest('dialog')||grid.dataset.teacherMotion==='complete')finish();else{paint();observer.observe(grid);}
 });
}
