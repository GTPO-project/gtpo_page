// Reveal real plotted geometry. Axes, values and the original dashed line styles stay intact.
export function bindChartMotion(root=document) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),active=new Set();
  function animate(el,keyframes,options={}) {
    const animation=el.animate(keyframes,{duration:1000,easing:'cubic-bezier(.22,.61,.36,1)',fill:'backwards',...options});
    active.add(animation);
    animation.finished.then(()=>active.delete(animation),()=>active.delete(animation));
    if(document.hidden)animation.pause();
  }
  const observer=new IntersectionObserver(entries=>{
    for(const {target,isIntersecting,intersectionRatio} of entries) {
      if(!isIntersecting||intersectionRatio<.25)continue;
      observer.unobserve(target);target.dataset.chartEntered='true';
      if(reduced.matches||!Element.prototype.animate)continue;
      target.querySelectorAll('.chart-reveal').forEach(clip=>animate(clip,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1250}));
      target.querySelectorAll('.result-bar').forEach((bar,i)=>animate(bar,[{transform:'scaleY(.001)'},{transform:'scaleY(1)'}],{duration:800,delay:i*45}));
      target.querySelectorAll('.result-value').forEach((value,i)=>animate(value,[{opacity:0},{opacity:1}],{duration:300,delay:430+i*45}));
    }
  },{threshold:.25,rootMargin:'-80px 0px 0px'});
  root.querySelectorAll('.chart-card').forEach(card=>{if(!card.closest('dialog'))observer.observe(card);});
  document.addEventListener('visibilitychange',()=>{for(const animation of active)document.hidden?animation.pause():animation.play();});
  reduced.addEventListener('change',()=>{if(reduced.matches){for(const animation of active)animation.cancel();active.clear();}});
}
