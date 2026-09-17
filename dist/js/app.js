import {videoGallery,bindVideoGallery} from './video-gallery.js?v=gallery-ring-2';
import {bindSceneMotion} from './scene-motion.js?v=scenes-1';
import {bindTeacherMotion} from './teacher-motion.js?v=teacher-motion-1';
import {bindChartTableLinks} from './chart-table-links.js?v=table-links-1';
import {bindCreditMotion} from './credit-motion.js?v=table-links-1';
import {pipeline} from './pipeline.js?v=window-align-1';
import {bindPipelineMotion} from './pipeline-motion.js?v=table-links-1';
import {bindOverview} from './overview-motion.js?v=classroom-2';
import {overview,teachers,credit,scenes,esc} from './figures.js?v=scenes-1';
import {chart,performanceBars,realBars,bindCharts} from './charts.js?v=table-links-1';
import {table,ablationTable} from './tables.js?v=table-links-1';
import {media} from './content.js?v=gallery-1';
import {idea} from './idea-content.js';
import {classroom,bindClassroom} from './classroom.js?v=corrections-1';
import {bindChartMotion} from './chart-motion.js';
const content=document.querySelector('#content');
export const figure=(number,title,body)=>`<figure class="figure" id="figure-${number}" data-figure="${number}" aria-label="Figure ${number}: ${esc(title)}">${number<=2?'':`<div class="figure-head">${number===7?'':`<h3><span class="figure-no">Figure ${number}</span>${title}</h3>`}<button class="expand" type="button" data-expand="figure-${number}">Expand ↗</button></div>`}<div class="figure-body">${body}</div></figure>`;
export const heading=(kicker,title,num)=>`<div class="section-heading"><div><div class="section-kicker">${kicker}</div><h2>${title}</h2></div><span class="number">${num}</span></div>`;
export function video(m){return m.src?`<video controls playsinline preload="metadata" ${m.poster?`poster="${esc(m.poster)}"`:''} aria-label="${esc(m.title)}"><source src="${esc(m.src)}">Your browser cannot play this video.</video>`:`<div class="video-placeholder" role="img" aria-label="${esc(m.title)}. Video forthcoming."><div class="placeholder-copy"><strong>${esc(m.title)}</strong><span>Video forthcoming</span></div></div>`;}
async function init(){
 const [graphics,abstract,charts,tables,real]=await Promise.all(['graphics','abstract','charts','tables','real-world'].map(async n=>{const r=await fetch(`data/${n}.json${n==='graphics'?'?v=ot-cells-2':''}`);if(!r.ok)throw Error(`Cannot load ${n}`);return r.json();}));
 const tbl=n=>table(tables[n-1]);
 content.innerHTML=`
 <section class="section wrap" id="abstract"><div class="abstract-layout"><div><div class="section-kicker">The idea</div><h2>Learning together.</h2></div><div class="abstract-copy"><p>${idea.summary}</p></div></div>${classroom()}</section>
 <section class="section wrap" id="method">${heading('01 / Method','Success teaches failure.','01')}
 <p class="section-intro">Robot interaction is expensive. GTPO makes more use of each rollout by pairing a failed trajectory with a successful one from the same group, then aligning their visual progress to assign credit over time.</p>
 ${figure(1,'Group teaching, at a glance',overview(graphics))}
 <div class="explanation-grid"><div><span class="step-index">01 / GROUP</span><h3>A teacher in the rollout.</h3><p>Sample trajectories from the same initial configuration. Successes provide on-policy references for failures.</p></div><div><span class="step-index">02 / ALIGN</span><h3>Match visual progress.</h3><p>Temporal optimal transport aligns trajectories while allowing local differences in execution speed.</p></div><div><span class="step-index">03 / TEACH</span><h3>Allocate credit over time.</h3><p>Redistribute each failure’s advantage across action chunks. Successful trajectories retain uniform weights.</p></div></div>
 ${figure(2,'Temporal optimal transport, step by step',pipeline(graphics))}</section>
 <section class="section wrap" id="results">${heading('02 / Simulation','More from every rollout.','02')}
 <p class="section-intro">Across all four LIBERO suites, GTPO improves success and training efficiency from a matched initialization. Published baselines are retained with their original evaluation settings clearly distinguished.</p>
 ${tbl(1)}${tbl(2)}
 ${figure(3,'Training efficiency across LIBERO',`<div class="charts-grid">${chart('object','(a) LIBERO-Object',charts.object,{tts:true,ymin:38})}${chart('spatial','(b) LIBERO-Spatial',charts.spatial,{tts:true,ymin:35})}${chart('goal','(c) LIBERO-Goal',charts.goal,{tts:true,ymin:38})}${chart('long','(d) LIBERO-Long',charts.long,{tts:true,ymin:10,yticks:[20,40,60,80,100]})}</div>`)}${tbl(3)}</section>
 <section class="section wrap" id="ablations">${heading('03 / Ablations','What makes teaching effective?','03')}
 <p class="section-intro">The experiments separate temporal alignment, credit concentration, and teacher assignment. These comparisons test the reported settings; they do not establish universal OT necessity.</p>
 ${figure(4,'Optimal transport versus pointwise matching',chart('ot','Temporal alignment matters',charts.ot,{ymin:40}))}${tbl(4)}
 <div class="explanation-grid"><div><span class="step-index">TEMPORAL WINDOW</span><h3>Enough room to align.</h3><p>k = 30 gives the best AUC and TTS@95. Both narrow and wide windows can limit learning.</p></div><div><span class="step-index">CREDIT TEMPERATURE</span><h3>A changing concentration.</h3><p>Exponential annealing gives the best AUC. Linear reaches 95% three steps earlier, with lower Early SR.</p></div><div><span class="step-index">TEACHER ASSIGNMENT</span><h3>A teacher for each failure.</h3><p>Nearest-neighbor teaching leads all three metrics. Successful rollouts keep uniform weights.</p></div></div>
 ${figure(5,'Design analyses',`<div class="ablation-pairs" id="table-5" data-table="5">${[['window','(a) Temporal window'],['temperature','(b) Credit temperature'],['teacher','(c) Teacher assignment']].map(([key,title],i)=>`<div class="ablation-pair">${chart(key,title,charts[key],{ymin:40})}${i===2?`<div class="teacher-evidence"><div id="teacher-selection" data-supplement="teacher-selection">${teachers()}</div>${ablationTable(tables[4],i)}</div>`:ablationTable(tables[4],i)}</div>`).join('')}<p class="table-note">AUC / Early: % · TTS@95: steps · &gt; Not reached</p></div>`)}
 </section>
 <section class="section wrap" id="credit">${heading('04 / Credit allocation','Where visual progress diverges.','04')}
 <p class="section-intro">A successful teacher guides a failed student, with the missed grasp marked in red. This illustrates credit allocation; it does not establish causal error localization.</p>
 ${figure(6,'A closer look at the student’s credit',credit(graphics))}</section>
 <section class="section wrap" id="real-world">${heading('05 / Real world','From simulation to physical interaction.','05')}
 <p class="section-intro">Five manipulation tasks evaluate GTPO on a UR5 with base and wrist cameras. A π<sub>0.5</sub> checkpoint fine-tuned on 50 demonstrations initializes three rounds of on-policy training.</p>
 ${figure(7,'Robot setup and tasks',scenes())}
 <div class="comparison protocol"><div><h3 class="subheading">Matched training, physical trials.</h3><p>GRPO and GTPO share the first round of rollouts, then collect fresh data with their latest policies. Groups use nearby same-task initial states and require an autonomous success.</p></div><div><h3 class="subheading">Interventions stay separate.</h3><p>Interrupted policy prefixes count as failures. Human corrective segments enter an auxiliary SFT loss only. Both methods use a PPO-style clipped probability-ratio loss; neither uses a critic or GAE.</p></div></div>
 ${figure(8,'Real-world learning and final success',`<div class="charts-grid">${chart('rounds','(a) Three on-policy rounds',charts.rounds,{rounds:true,ymin:15,yticks:[20,40,60,80,100]})}${realBars(real)}</div>`)}
 ${videoGallery(media.tasks)}</section>`;
 document.querySelector('#overview-performance').innerHTML=performanceBars();
 document.querySelector('#overview-efficiency').innerHTML=chart('overview-object','(d) Efficiency',charts.object,{tts:true,ymin:38,insetLegend:true});
 const chartMap={...charts,'overview-object':charts.object};bindCharts(chartMap);bindChartTableLinks(document);bindTeacherMotion(document);bindExpansion(chartMap);bindOverview(document);bindClassroom(document);bindChartMotion(document);bindSceneMotion(document);bindVideoGallery(media.tasks);bindPipelineMotion(document);bindCreditMotion(document);bindNavigation();document.documentElement.dataset.ready='true';
 if(location.hash)requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'start',behavior:'instant'}));
}
function bindExpansion(charts){const dialog=document.querySelector('#figure-dialog');document.addEventListener('click',e=>{const b=e.target.closest('[data-expand]');if(!b)return;const target=document.getElementById(b.dataset.expand);const area=dialog.querySelector('.dialog-content');area.innerHTML=target.querySelector('.figure-body').outerHTML;const clonedIds=new Map();area.querySelectorAll('[id]').forEach(el=>{clonedIds.set(el.id,`expanded-${el.id}`);el.id=`expanded-${el.id}`;});area.querySelectorAll('*').forEach(el=>{for(const attr of ['fill','stroke','filter','clip-path','mask','marker-start','marker-mid','marker-end']){const value=el.getAttribute(attr);if(value)el.setAttribute(attr,value.replace(/url\(#([^)]*)\)/g,(match,id)=>clonedIds.has(id)?`url(#${clonedIds.get(id)})`:match));}});for(const attr of ['aria-describedby','aria-labelledby'])area.querySelectorAll(`[${attr}]`).forEach(el=>el.setAttribute(attr,`expanded-${el.getAttribute(attr)}`));dialog.showModal();bindCharts(charts,area);bindChartTableLinks(area);bindTeacherMotion(area);bindOverview(area);});document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{dialog.querySelector('.dialog-content').replaceChildren();});}
function bindNavigation(){
 const links=[...document.querySelectorAll('nav a')],targets=links.map(a=>document.querySelector(a.hash));
 let scheduled=false;
 function update(){
  scheduled=false;let active=-1;
  const boundary=document.querySelector('.site-header').getBoundingClientRect().bottom+60;
  targets.forEach((target,i)=>{if(target&&target.getBoundingClientRect().top<=boundary)active=i;});
  links.forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
}

init().catch(e=>{content.innerHTML=`<p class="wrap fatal">The research figures could not load. Please reload this page or <a href="assets/gtpo-paper.pdf">read the paper PDF</a>.</p>`;console.error(e);});
