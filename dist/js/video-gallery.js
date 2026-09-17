import {esc} from './figures.js?v=scenes-1';

export function videoGallery(tasks){
 const cards=tasks.map((task,position)=>`<article class="gallery-card" data-position="${position}" data-task="${task.id}" aria-hidden="true" inert>
  <button class="gallery-select" type="button" aria-label="Select ${esc(task.title)}" aria-pressed="false" tabindex="-1">
   <span class="gallery-card-head"><strong>${esc(task.title)}</strong><span class="gallery-card-status">${task.src?'Video':'Video forthcoming'}</span></span>
   <span class="gallery-media">${task.src?`<video data-src="${esc(task.src)}" muted loop playsinline preload="none" poster="${esc(task.poster)}" aria-label="${esc(task.title)} preview"></video>`:`<img src="${esc(task.poster)}" alt="${esc(task.title)}" loading="lazy" width="700" height="620"><span class="gallery-forthcoming">Video forthcoming</span>`}</span>
  </button></article>`).join('');
 return `<section class="video-gallery" id="videos" aria-label="Task video gallery" aria-roledescription="carousel">
  ${tasks.map(task=>`<span class="video-anchor" id="video-${task.id}" tabindex="-1"></span>`).join('')}
  <div class="gallery-heading"><h3 class="subheading">Task demonstrations</h3><div class="gallery-cycle-controls"><button type="button" data-gallery="previous" aria-label="Previous task">Previous</button><button type="button" data-gallery="next" aria-label="Next task">Next</button><button type="button" data-gallery="cycle">Pause gallery</button></div></div>
  <div class="gallery-viewport"><div class="gallery-track">${cards}</div><button class="gallery-side-select gallery-side-left" type="button" data-gallery="previous" aria-label="Select previous video"></button><button class="gallery-side-select gallery-side-right" type="button" data-gallery="next" aria-label="Select next video"></button></div>
  <div class="gallery-details"><p class="gallery-current"></p><div class="gallery-playback"><button type="button" data-gallery="playback">Pause video</button><button type="button" data-gallery="full">Full video</button></div></div>
  <div class="gallery-task-list" role="group" aria-label="Choose task">${tasks.map((task,i)=>`<button type="button" data-select-task="${i}" aria-pressed="false">${esc(task.title)}</button>`).join('')}</div>
  <p class="visually-hidden gallery-announcement" aria-live="polite"></p>
 </section>
 <dialog id="task-video-dialog" aria-labelledby="task-video-title"><div class="task-video-bar"><h3 id="task-video-title"></h3><button type="button" data-close-video>Close</button></div><video controls playsinline preload="metadata" aria-label="Full task video"></video><p class="video-error" role="status" hidden>Video could not load. Close and reopen to retry.</p></dialog>`;
}

export function bindVideoGallery(tasks){
 const root=document.querySelector('.video-gallery'),viewport=root.querySelector('.gallery-viewport'),track=root.querySelector('.gallery-track');
 const cards=[...root.querySelectorAll('.gallery-card')],options=[...root.querySelectorAll('[data-select-task]')];
 const dialog=document.querySelector('#task-video-dialog'),fullVideo=dialog.querySelector('video'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cycleButton=root.querySelector('[data-gallery="cycle"]'),playButton=root.querySelector('[data-gallery="playback"]'),fullButton=root.querySelector('[data-gallery="full"]');
 const n=tasks.length,mod=i=>(i%n+n)%n,times=new Map();
 let index=Math.max(0,tasks.findIndex(t=>t.src)),position=index,requested=index,cardWidth=0,radius=0;
 let motion=null,version=0,visible=false,hover=false,focused=false,cyclePaused=reduced.matches,videoPaused=false,timer=0,touch=null,returnFocus=null;
 let suppressClick=false,wheelDistance=0,wheelTime=0,wheelLock=0;
 function activeVideo(){return cards[position]?.querySelector('video');}
 function inView(){return visible&&!document.hidden&&!dialog.open;}
 function pause(video){if(video&&!video.paused){times.set(video.closest('[data-task]')?.dataset.task||tasks[index].id,video.currentTime);video.pause();}}
 function status(){
  const task=tasks[index],video=activeVideo();
  const state=!task.src?'Video forthcoming':video?.error?'Video unavailable':video?.paused?'Paused':'Playing';
  cards[position].querySelector('.gallery-card-status').textContent=state;
  root.querySelector('.gallery-current').textContent=`${String(index+1).padStart(2,'0')} / ${String(n).padStart(2,'0')} · ${task.title}`;
  playButton.hidden=fullButton.hidden=!task.src;playButton.textContent=video&&!video.paused?'Pause video':'Play video';
  cycleButton.textContent=cyclePaused?'Resume gallery':'Pause gallery';
  root.dataset.activeTask=task.id;
 }
 function syncMedia(){
  const current=activeVideo(),ticket=++version;
  cards.forEach(card=>{const video=card.querySelector('video');if(video!==current)pause(video);});
  if(!current){status();return;}
  const start=()=>{
   if(ticket!==version||current!==activeVideo())return;
   if(inView()&&!videoPaused&&!motion&&!reduced.matches){current.play().catch(()=>{if(ticket===version)status();});}
   else pause(current);
   status();
  };
  if(!current.getAttribute('src')){
   const taskId=tasks[index].id;
   current.src=current.dataset.src;
   current.addEventListener('loadedmetadata',()=>{current.currentTime=Math.min(times.get(taskId)||0,current.duration||0);start();},{once:true});
   current.load();
  }
  start();
 }
 function armCycle(){
  clearTimeout(timer);
  if(inView()&&!hover&&!focused&&!cyclePaused&&!motion&&!reduced.matches)timer=setTimeout(()=>select(index+1,false),6500);
 }
 function updateCards(){
  const offset=p=>{let d=p-index;if(d>n/2)d-=n;if(d<-n/2)d+=n;return d;};
  cards.forEach((card,p)=>{
   const delta=offset(p),shown=Math.abs(delta)<=1,active=p===position,button=card.querySelector('button');
   card.style.transform=pose(delta);card.style.zIndex=String(5-Math.abs(delta));card.style.opacity=active?'1':shown?'.58':'0';
   card.classList.toggle('is-active',active);card.inert=!shown;card.setAttribute('aria-hidden',String(!shown));
   button.tabIndex=shown?0:-1;button.setAttribute('aria-pressed',String(active));
   if(!active)card.querySelector('.gallery-card-status').textContent=tasks[mod(p)].src?'Select video':'Video forthcoming';
  });
  options.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  root.querySelector('.gallery-side-left').setAttribute('aria-label',`Select ${tasks[mod(index-1)].title}`);
  root.querySelector('.gallery-side-right').setAttribute('aria-label',`Select ${tasks[mod(index+1)].title}`);
  status();
 }
 function pose(offset){const angle=offset*55*Math.PI/180;return `translate3d(${Math.sin(angle)*radius}px,0,${-(1-Math.cos(angle))*radius}px) rotateY(${-offset*55}deg)`;}
 function relative(p,current){let d=p-current;if(d>n/2)d-=n;if(d<-n/2)d+=n;return d;}
 function settle(){
  motion=null;position=index;updateCards();syncMedia();
  if(requested!==index)select(requested,false);else armCycle();
 }
 function select(next,manual=true){
  requested=mod(next);
  if(manual){clearTimeout(timer);root.querySelector('.gallery-announcement').textContent=tasks[requested].title;}
  if(motion)return;
  if(requested===index){syncMedia();armCycle();return;}
  pause(activeVideo());let delta=requested-index;
  if(delta>n/2)delta-=n;if(delta<-n/2)delta+=n;
  const previous=index;index=requested;position=index;videoPaused=false;updateCards();
  if(reduced.matches){settle();return;}
  const animations=cards.map((card,p)=>{
   const from=relative(p,previous),to=from-delta;
   const frames=Array.from({length:25},(_,i)=>{const t=i/24,offset=from+(to-from)*t;return {transform:pose(offset),opacity:Math.abs(offset)>=1.8?0:Math.abs(offset)<=.05?1:Math.max(0,1-Math.abs(offset)*.42)};});
   return card.animate(frames,{duration:800,easing:'cubic-bezier(.2,.82,.2,1)'});
  });
  motion={cancel:()=>animations.forEach(a=>a.cancel())};
  Promise.all(animations.map(a=>a.finished)).then(settle,()=>{});syncMedia();

 }
 function resize(){
  if(motion){motion.cancel();motion=null;position=index;}
  const width=viewport.clientWidth;cardWidth=Math.min(720,width*(width<540?.86:.78));radius=width*.57;
  root.style.setProperty('--gallery-card-width',`${cardWidth}px`);
  track.style.height=`${cardWidth*9/16+82}px`;updateCards();syncMedia();armCycle();

 }
 new ResizeObserver(resize).observe(viewport);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.18;syncMedia();armCycle();},{threshold:[0,.18],rootMargin:'-85px 0px 0px'}).observe(viewport);
 document.addEventListener('visibilitychange',()=>{syncMedia();if(document.hidden)fullVideo.pause();armCycle();});
 root.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;armCycle();}});
 root.addEventListener('pointerleave',()=>{hover=false;armCycle();});
 root.addEventListener('focusin',e=>{focused=e.target!==cycleButton;armCycle();});
 root.addEventListener('focusout',()=>queueMicrotask(()=>{focused=root.contains(document.activeElement)&&document.activeElement!==cycleButton;armCycle();}));
 root.addEventListener('keydown',e=>{
  if(e.target.closest('video')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();select(e.key==='Home'?0:e.key==='End'?n-1:requested+(e.key==='ArrowRight'?1:-1));
 });
 root.addEventListener('click',e=>{
  const option=e.target.closest('[data-select-task]'),card=e.target.closest('.gallery-card'),control=e.target.closest('[data-gallery]');
  if(option)select(+option.dataset.selectTask);
  else if(card)select(mod(+card.dataset.position));
  else if(control){
   if(control.dataset.gallery==='previous')select(requested-1);
   if(control.dataset.gallery==='next')select(requested+1);
   if(control.dataset.gallery==='cycle'){cyclePaused=!cyclePaused;status();armCycle();}
   if(control.dataset.gallery==='playback'){
    const video=activeVideo();if(!video)return;videoPaused=!video.paused;
    if(videoPaused)pause(video);else video.play().catch(()=>status());status();
   }
   if(control.dataset.gallery==='full'&&tasks[index].src){
    returnFocus=control;pause(activeVideo());dialog.querySelector('h3').textContent=tasks[index].title;
    dialog.querySelector('.video-error').hidden=true;fullVideo.poster=tasks[index].poster;fullVideo.src=tasks[index].src;
    fullVideo.muted=true;dialog.showModal();fullVideo.addEventListener('loadedmetadata',()=>{fullVideo.currentTime=times.get(tasks[index].id)||0;fullVideo.play().catch(()=>{});},{once:true});syncMedia();armCycle();
   }
  }
 });
 viewport.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  suppressClick=false;touch={x:e.clientX,y:e.clientY,id:e.pointerId,dragging:false};clearTimeout(timer);
 });
 viewport.addEventListener('pointermove',e=>{
  if(!touch||touch.id!==e.pointerId)return;
  const dx=e.clientX-touch.x,dy=e.clientY-touch.y;
  if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.25){
   touch.dragging=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');
  }
 });
 viewport.addEventListener('pointerup',e=>{
  if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y,dragging=touch.dragging;touch=null;
  viewport.classList.remove('is-dragging');if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);
  if(dragging){suppressClick=true;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))select(requested+(dx<0?1:-1));}
  armCycle();
 });
 viewport.addEventListener('pointercancel',()=>{touch=null;viewport.classList.remove('is-dragging');armCycle();});
 viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},true);
 viewport.addEventListener('dragstart',e=>e.preventDefault());
 viewport.addEventListener('wheel',e=>{
  // Only deliberate horizontal gestures select a task; vertical scrolling stays native.
  if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)*1.25||Math.abs(e.deltaX)<2)return;
  e.preventDefault();const now=performance.now();if(now<wheelLock)return;
  if(now-wheelTime>180)wheelDistance=0;wheelTime=now;wheelDistance+=e.deltaX*(e.deltaMode===1?16:1);
  if(Math.abs(wheelDistance)>55){select(requested+(wheelDistance>0?1:-1));wheelDistance=0;wheelLock=now+850;}
 },{passive:false});
 dialog.querySelector('[data-close-video]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{
  times.set(tasks[index].id,fullVideo.currentTime);fullVideo.pause();fullVideo.removeAttribute('src');fullVideo.load();
  if(activeVideo()?.readyState)activeVideo().currentTime=times.get(tasks[index].id)||0;
  returnFocus?.focus({preventScroll:true});syncMedia();armCycle();
 });
 fullVideo.addEventListener('error',()=>{if(dialog.open)dialog.querySelector('.video-error').hidden=false;});
 cards.forEach(card=>{const video=card.querySelector('video');if(video)for(const event of ['playing','pause','error'])video.addEventListener(event,()=>{if(video===activeVideo())status();});});
 function hashSelection(){const next=tasks.findIndex(t=>location.hash===`#video-${t.id}`);if(next>=0){select(next);cyclePaused=true;status();root.focus({preventScroll:true});}}
 root.tabIndex=-1;addEventListener('hashchange',hashSelection);
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#video-"]');if(a&&a.hash===location.hash)hashSelection();});
 reduced.addEventListener('change',()=>{if(reduced.matches){cyclePaused=true;if(motion){motion.cancel();settle();}}syncMedia();armCycle();});
 resize();hashSelection();
}
