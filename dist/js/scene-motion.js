export function bindSceneMotion(root=document){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),active=new Set();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const card=entry.target;
   if(!entry.isIntersecting||entry.intersectionRatio<.2||card.dataset.sceneEntered)continue;
   card.dataset.sceneEntered='true';observer.unobserve(card);
   if(reduced.matches)continue;
   const motion=card.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.22,.61,.36,1)'});
   active.add(motion);motion.finished.then(()=>active.delete(motion),()=>active.delete(motion));
  }
 },{threshold:.2,rootMargin:'-90px 0px 0px'});
 root.querySelectorAll('.scene-card').forEach(card=>observer.observe(card));
 document.addEventListener('visibilitychange',()=>{for(const motion of active)document.hidden?motion.pause():motion.play();});
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const motion of active)motion.finish();});
 document.addEventListener('click',event=>{
  const link=event.target.closest('a.scene-link');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  link.closest('dialog')?.close();
  document.querySelector(link.hash)?.focus({preventScroll:true});
 });
}
