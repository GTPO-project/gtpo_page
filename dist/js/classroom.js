import {idea} from './idea-content.js?v=method-contrast-1';

const tick = '<path d="m-4 0 3 3 6-7"/>';
const cross = '<path d="m-3-3 6 6m0-6-6 6"/>';
function paper(student, reference=false) {
  return `<g class="${reference?'class-reference':'class-paper'}"><rect width="58" height="68" rx="3" fill="#fbfaf5" stroke="#bbbcb0"/><path d="M10 11h25" stroke="#bbc0b1" stroke-width="3"/>${student.answers.map((ok,i)=>`<g transform="translate(0 ${23+i*16})"><rect class="class-verdict" x="5" y="-7" width="48" height="14" rx="2" fill="currentColor" opacity="0"/><path d="M11 0h17" stroke="#8d9788" stroke-width="2"/><g transform="translate(42 0)" stroke-width="2" fill="none" stroke-linecap="round"><g class="${!ok&&!reference?'class-wrong':'class-correct'}" stroke="${ok||reference?'#35634D':'#9B4843'}">${ok||reference?tick:cross}</g>${!ok&&!reference?`<circle class="class-focus" r="8" stroke="#35634D" opacity="0"/><g class="class-fixed" stroke="#35634D" opacity="0">${tick}</g>`:''}</g></g>`).join('')}</g>`;
}
function pupil(s) {
  return `<g class="class-person"><path d="M-26 52q0-29 26-29t26 29v15h-52z" fill="currentColor"/><path d="m-17 40-20 24m54-24 20 24" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><rect x="-6" y="15" width="12" height="14" rx="4" fill="#d6c1a7"/><circle cy="0" r="21" fill="#e1d0b7"/><path d="M-21 0q-4-28 21-26 26-1 21 26l-6-10q-19 1-27-8z" fill="${s.id%2?'#4b5149':'#70695b'}"/><path d="M-7 1v2m14-2v2" stroke="#464c43" stroke-width="2.5" stroke-linecap="round"/><path d="M-5 11q5 4 10 0" fill="none" stroke="#7d6d5b" stroke-width="1.5"/><circle cx="-24" cy="-19" r="12" fill="#f7f4ec" stroke="currentColor" stroke-width="1.5"/><text x="-24" y="-14" text-anchor="middle" font-size="15" font-weight="700">${s.id}</text></g>`;
}
function scene(mobile=false) {
  const W=mobile?400:760,H=mobile?482:526,scale=mobile?.79:1;
  const left=mobile?5:58,right=mobile?208:428,top=mobile?165:174,bottom=mobile?342:368;
  const teacher=146,travel=(bottom-top)/scale;
  return `<svg class="classroom-svg ${mobile?'classroom-small':'classroom-wide'}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <path class="class-room-detail" d="M16 118H${W-16}" fill="none" stroke="#dddccf"/>
    <g class="class-board" transform="translate(${mobile?24:170} 12)"><rect width="${mobile?352:420}" height="94" rx="5" fill="#e7ebdf" stroke="#8b9d88" stroke-width="1.5"/><text class="class-board-method" x="${mobile?176:210}" y="28" text-anchor="middle" font-size="25" font-weight="750">${idea.phases[0].boardMethod}</text><text class="class-board-title" x="${mobile?176:210}" y="53" text-anchor="middle" font-size="18" font-weight="600">${idea.phases[0].board}</text><text class="class-board-sub" x="${mobile?176:210}" y="77" text-anchor="middle" font-size="15" fill="#596657">${idea.phases[0].boardSub}</text><path d="M18 94h${mobile?316:384}" stroke="#8b9d88" stroke-width="5" stroke-linecap="round"/></g>
    ${idea.students.map((s,i)=>{
      const x=i%2?right:left,y=i<2?top:bottom,good=s.score>60;
      return `<g class="class-student ${good?'class-teacher':'class-learner'}" data-student="${s.id}" transform="translate(${x} ${y}) scale(${scale})" style="color:${good?'#35634D':'#9B4843'};--tutor-x:${teacher}px;--tutor-y:${travel}px">
        <ellipse cx="86" cy="99" rx="90" ry="8" fill="#e8e5d9"/>
        <g transform="translate(39 0)">${pupil(s)}</g>
        <path d="M6 64h214v12H6z" fill="#c1bda6"/><path d="M18 76v24m190-24v24" stroke="#9f9f8c" stroke-width="5"/>
        <g transform="translate(87 9)">${paper(s)}</g>
        ${good?`<g class="class-score" transform="translate(99 -31)"><text text-anchor="middle" font-size="24" font-weight="650" fill="#35634D">${s.score}</text></g>`:`<g class="class-score" transform="translate(99 -31)"><text text-anchor="middle" font-size="24" font-weight="650" fill="#9B4843">${s.score}</text></g><g transform="translate(153 9)">${paper({...s,answers:[true,true,true]},true)}</g><g class="class-align" fill="none" stroke="#35634D" stroke-width="1.5" opacity="0"><path d="M145 32h8m-8 16h8m-8 16h8"/></g><g class="class-progress" transform="translate(12 138)" opacity="0"><text class="class-progress-label" x="89" y="-12" text-anchor="middle" font-size="18">Corrections: 0 / 2</text><path d="M0 0h178" stroke="#deded0" stroke-width="5" stroke-linecap="round"/><path class="class-progress-fill" d="M0 0h178" pathLength="1" stroke="#35634D" stroke-width="5" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/></g>`}
        <g class="class-sign" transform="translate(174 -20)" opacity="0"><circle r="17" fill="currentColor"/><path d="M-7 0H7${good?'M0-7V7':''}" stroke="#f7f4ec" stroke-width="2.5"/></g>
      </g>`;
    }).join('')}
    <g class="class-pairing" fill="none" stroke="#35634D" stroke-width="2" opacity="0">
      ${[left,right].map((x,i)=>`<path d="M${x+31*scale} ${top+115*scale}v${mobile?18:25}"/><path d="m${x+31*scale-4} ${top+115*scale+(mobile?14:21)} 4 4 4-4"/><text x="${x+49*scale}" y="${top+115*scale+17}" fill="#35634D" stroke="none" font-size="${mobile?14:16}">${i?'2 → 3':'1 → 4'}</text>`).join('')}
  </svg>`;
}

export function classroom() {
  return `<div class="classroom" data-phase="intro" data-method="setup" data-playback="idle" aria-label="A classroom analogy for group teaching">
    <div class="classroom-heading"><span class="classroom-eyebrow">A classroom analogy</span><span class="classroom-phase">01 / 04</span></div>
    <div class="classroom-methods" aria-label="Method comparison" aria-live="polite" aria-atomic="true">
      <div class="class-method class-method-grpo"><div><strong>GRPO</strong><span class="class-method-state">FIRST</span></div><span>Whole-attempt feedback</span></div>
      <span class="class-method-arrow" aria-hidden="true">→</span>
      <div class="class-method class-method-gtpo"><div><strong>GTPO</strong><span class="class-method-state">NEXT</span></div><span>Step-by-step guidance</span></div>
    </div>
    <p class="visually-hidden">Four students have illustrative scores of 90, 80, 40 and 30, with a class average of 60. GRPO gives students 1 and 2 positive feedback and students 3 and 4 negative feedback across all steps. GTPO pairs student 2 with 3 and student 1 with 4 by solution similarity, aligns their work and guides individual steps. Progress is qualitative, not an experimental measurement.</p>
    <div class="classroom-stage">${scene()}${scene(true)}</div>
    <div class="classroom-caption"><div aria-live="polite" aria-atomic="true"><h3 class="classroom-line">${idea.phases[0].caption}</h3><p class="classroom-detail">${idea.phases[0].detail}</p></div><button class="classroom-pause" type="button" hidden aria-label="Pause classroom animation">Pause</button></div>
    <div class="classroom-static"><p><strong>GRPO</strong> shares one group-relative verdict across an attempt.</p><p><strong>GTPO</strong> aligns a similar successful attempt to guide individual steps.</p></div>
  </div>`;
}

export function bindClassroom(root=document) {
  root.querySelectorAll('.classroom').forEach(el=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)'),button=el.querySelector('.classroom-pause');
    const active=new Set();let visible=false,readyToStart=false,manualPause=false,started=false,done=false,generation=0;
    function sync() {
      const paused=manualPause||!visible||document.hidden;
      for(const animation of active) { if(animation.playState!=='finished') paused?animation.pause():animation.play(); }
      el.dataset.playback=done?'complete':started?(paused?'paused':'playing'):'idle';
      button.textContent=manualPause?'Continue':'Pause';
      button.setAttribute('aria-label',manualPause?'Continue classroom animation':'Pause classroom animation');
    }
    function animate(target,frames,duration,delay=0) {
      const animation=target.animate(frames,{duration,delay,fill:'forwards',easing:'ease-in-out'});
      active.add(animation);sync();return animation;
    }
    function all(selector,frames,duration,delay=0) {el.querySelectorAll(selector).forEach(node=>animate(node,frames,duration,delay));}
    function caption(phase,index) {
      el.dataset.phase=phase.id;
      el.dataset.method=phase.method;
      el.querySelector('.class-method-grpo .class-method-state').textContent=phase.method==='grpo'?'NOW':phase.method==='gtpo'?'BEFORE':'FIRST';
      el.querySelector('.class-method-gtpo .class-method-state').textContent=phase.method==='gtpo'?'NOW':'NEXT';
      el.querySelector('.classroom-line').textContent=phase.caption;
      el.querySelector('.classroom-detail').textContent=phase.detail;
      el.querySelector('.classroom-phase').textContent=`0${index+1} / 04`;
      el.querySelectorAll('.class-board-method').forEach(n=>n.textContent=phase.boardMethod);
      el.querySelectorAll('.class-board-title').forEach(n=>n.textContent=phase.board);
      el.querySelectorAll('.class-board-sub').forEach(n=>n.textContent=phase.boardSub);
    }
    function finish(reduced=false) {
      done=true;generation++;
      for(const animation of active)animation.cancel();active.clear();
      caption(idea.phases[3],3);el.dataset.phase='complete';el.classList.toggle('is-reduced',reduced);
      el.querySelectorAll('.class-progress-label').forEach(label=>label.textContent='Corrections: 2 / 2');
      button.hidden=true;sync();
    }
    async function correctSteps(runId) {
      const learners=[...el.querySelectorAll('.class-learner')];
      try {
        for(let step=0;step<2;step++) {
          if(done||runId!==generation)return;
          await Promise.all(learners.map(student=>animate(student.querySelectorAll('.class-focus')[step],[{opacity:0},{opacity:1,offset:.5},{opacity:0}],400).finished));
          if(done||runId!==generation)return;
          await Promise.all(learners.flatMap(student=>[
            animate(student.querySelectorAll('.class-wrong')[step],[{opacity:1},{opacity:0}],450).finished,
            animate(student.querySelectorAll('.class-fixed')[step],[{opacity:0},{opacity:1}],450).finished,
            animate(student.querySelector('.class-progress-fill'),[{strokeDashoffset:1-step/2},{strokeDashoffset:1-(step+1)/2}],450).finished
          ]));
          if(done||runId!==generation)return;
          learners.forEach(student=>student.querySelector('.class-progress-label').textContent=`Corrections: ${step+1} / 2`);
        }
      } catch { /* Reduced motion cancels the sequence and commits the complete state. */ }
    }
    async function run() {
      started=true;button.hidden=false;const runId=++generation;
      for(const [index,phase] of idea.phases.entries()) {
        if(done||runId!==generation)return;
        caption(phase,index);
        if(phase.id==='grpo') {
          all('.class-verdict',[{opacity:0},{opacity:.17}],550);
          all('.class-sign',[{opacity:0},{opacity:1}],550);
        }
        if(phase.id==='gtpo') {
          all('.class-verdict',[{opacity:.17},{opacity:0}],400);
          all('.class-sign,.class-score',[{opacity:1},{opacity:0}],400);
          all('.class-pairing',[{opacity:0},{opacity:1}],500);
          all('.class-teacher .class-person',[{transform:'translate(0, 0)'},{transform:'translate(var(--tutor-x), var(--tutor-y))'}],1500,400);
          all('.class-teacher .class-paper',[{opacity:1},{opacity:.3}],900,400);
          all('.class-reference',[{opacity:0},{opacity:1}],800,1600);
          all('.class-align',[{opacity:0},{opacity:.65}],800,2200);
        }
        if(phase.id==='improve') {
          all('.class-progress',[{opacity:0},{opacity:1}],300);
          void correctSteps(runId);
        }
        // A pauseable animation clock advances the story only after actual completion.
        try {await animate(el.querySelector('.classroom-stage'),[{opacity:1},{opacity:1}],phase.duration).finished;}catch{return;}
      }
      if(runId===generation)finish();
    }
    button.addEventListener('click',()=>{manualPause=!manualPause;sync();});
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting&&entries[0].intersectionRatio>0;
      readyToStart=entries[0].intersectionRatio>=.65;
      if(readyToStart&&!started&&!done&&!document.hidden)run();else sync();
    },{threshold:[0,.65],rootMargin:'-96px 0px 0px'});
    observer.observe(el.querySelector('.classroom-stage'));
    document.addEventListener('visibilitychange',()=>{if(readyToStart&&!started&&!done&&!document.hidden)run();else sync();});
    media.addEventListener('change',()=>{if(media.matches)finish(true);});
    if(media.matches||!Element.prototype.animate)finish(true);
  });
}
