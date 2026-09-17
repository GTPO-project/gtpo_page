import {C,esc,svg,text,line,arrow} from './figures.js';
export const styles=[{color:C.green,dash:''},{color:'#7d9371',dash:'7 3'},{color:C.red,dash:'3 3'},{color:'#987c50',dash:'9 3 2 3'},{color:'#69716c',dash:'2 4'}];
export function movingAverage(points,window=7){const pad=Math.floor(window/2);return points.map((p,i)=>[p[0],Array.from({length:window},(_,j)=>points[Math.max(0,Math.min(points.length-1,i+j-pad))][1]).reduce((a,b)=>a+b,0)/window]);}
export function crossing(points){return points.find(p=>p[1]>=95)?.[0]??null;}
const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(2);
function marker(x,y,style,size=3){return style==='square'?`<rect x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}" fill="currentColor"/>`:`<circle cx="${x}" cy="${y}" r="${size}" fill="currentColor"/>`;}
export function chart(id,title,series,options={}){
 const W=560,H=330,L=55,R=18,T=29,B=48,plotW=W-L-R,plotH=H-T-B;
 const ymax=options.ymax??102,ymin=options.ymin??38,xmax=Math.max(...series.flatMap(s=>s.points.map(p=>p[0]))),xmin=0;
 const sx=x=>L+(x-xmin)/(xmax-xmin)*plotW,sy=y=>T+(ymax-y)/(ymax-ymin)*plotH;
 let s=`<defs><clipPath id="chart-reveal-${id}"><rect class="chart-reveal" x="${L-5}" y="${T-5}" width="${plotW+10}" height="${plotH+10}"/></clipPath></defs>`;let yticks=options.yticks??[40,60,80,100];
 yticks.forEach(v=>{s+=line(L,sy(v),W-R,sy(v),C.line)+text(L-10,sy(v)+4,v,12,C.muted,'end');});
 const xticks=options.rounds?[0,1,2,3]:[0,.25,.5,.75,1].map(f=>Math.round(xmax*f));
 xticks.forEach(v=>{s+=line(sx(v),T,sx(v),H-B,C.line,.65)+text(sx(v),H-B+22,options.rounds?['SFT','Iter 1','Iter 2','Iter 3'][v]:v,12,C.muted,'middle');});
 if(!options.rounds)s+=line(L,sy(95),W-R,sy(95),'#a3aa98',1,'3 4')+text(L+5,sy(95)-7,'95%',11,C.muted);
 s+=text(L,16,'Success rate (%)',12,C.muted)+text(W-R,H-3,options.rounds?'On-policy training rounds':'RL training steps',12,C.muted,'end');
 const trends=series.map(d=>options.rounds?d.points:movingAverage(d.points));
 series.forEach((d,i)=>{const st=styles[d.style??i%5];const path=trends[i].map((p,j)=>`${j?'L':'M'}${sx(p[0]).toFixed(2)} ${sy(p[1]).toFixed(2)}`).join(' ');
 s+=`<g data-series="${esc(d.label)}" style="color:${st.color}" clip-path="url(#chart-reveal-${id})">`;
 if(!options.rounds)s+=d.points.map(p=>`<circle data-step="${p[0]}" data-value="${p[1]}" cx="${sx(p[0])}" cy="${sy(p[1])}" r="1.6" fill="${st.color}" opacity=".24"/>`).join('');
 s+=`<path d="${path}" fill="none" stroke="${st.color}" stroke-width="${d.style===0?2.9:2.3}" stroke-linejoin="round" ${st.dash?`stroke-dasharray="${st.dash}"`:''}/>`;
 if(options.rounds)s+=d.points.map(p=>marker(sx(p[0]),sy(p[1]),d.marker,4)).join('');
 s+='</g>';
 });
 if(options.tts){
   trends.forEach((p,i)=>{const t=crossing(p),st=styles[series[i].style??i%5];if(t!==null)s+=`<circle cx="${sx(t)}" cy="${sy(95)}" r="4" fill="${st.color}" stroke="${C.paper}" stroke-width="1.5"/>`;});
   const a=crossing(trends[1]),b=crossing(trends[2]);
   if(a!==null){const bx=b??series[2].points.at(-1)[0],y=sy(87);s+=line(sx(a),sy(95),sx(a),y,styles[1].color)+line(sx(bx),sy(95),sx(bx),y,styles[2].color)+arrow(sx(a),y,sx(bx),y,C.muted)+arrow(sx(bx),y,sx(a),y,C.muted)+text((sx(a)+sx(bx))/2,y+18,`${b===null?'>':''}${fmt(bx-a)} steps`,12,C.muted,'middle');}
 }
 if(options.rounds)s+=text(L+8,sy(40)-8,'SFT 40',11,C.muted)+text(L+8,sy(20)-8,'SFT 20',11,C.muted);
 s+=`<g class="chart-cursor" hidden><path stroke="${C.ink}" stroke-dasharray="2 3"/><circle r="4" fill="${C.green}"/></g>`;
 if(options.insetLegend){
   s+=`<g class="chart-inset-legend"><rect x="255" y="166" width="278" height="72" fill="${C.paper}" fill-opacity=".96"/>`;
   series.forEach((d,i)=>{const st=styles[d.style??i%5],t=crossing(trends[i]),y=185+i*21;
     s+=line(268,y-5,292,y-5,st.color,2,st.dash)+text(303,y,`${d.label} · ${t===null?'>'+fmt(d.points.at(-1)[0]):fmt(t)} steps`,16,C.ink);
   });
   s+='</g>';
 }
 const legend=series.map((d,i)=>{const st=styles[d.style??i%5];const t=options.tts?crossing(trends[i]):undefined;return `<span class="legend-item" data-legend-series="${esc(d.label)}"><svg width="24" height="12" aria-hidden="true"><path d="M0 6H24" stroke="${st.color}" stroke-width="2" ${st.dash?`stroke-dasharray="${st.dash}"`:''}/>${options.rounds?`<g style="color:${st.color}">${marker(12,6,d.marker,3)}</g>`:''}</svg><span>${esc(d.label)}${options.tts?` · ${t===null?'>'+fmt(d.points.at(-1)[0]):fmt(t)} steps`:''}</span></span>`;}).join('');
 return `<div class="chart-card" data-chart-id="${id}"><h4 class="chart-title">${title}</h4><div class="chart-wrap">${svg(W,H,s,`${title}. Success rates. ${series.map(d=>d.label).join(', ')}.`).replace('class="diagram-native"','class="chart-svg" tabindex="0" aria-describedby="readout-'+id+'"')}<div class="chart-tooltip" hidden></div></div>${options.insetLegend?'':`<div class="chart-legend">${legend}</div>`}<p class="chart-readout visually-hidden" id="readout-${id}" aria-live="polite">${options.rounds?'20 physical trials per point.':'Pale points: raw evaluations. Lines: 7-checkpoint moving averages.'} <span class="chart-hint">Hover, tap, or use ← → to inspect.</span></p></div>`;
}
export function bindCharts(charts,root=document){root.querySelectorAll('[data-chart-id]').forEach(el=>{
 const id=el.dataset.chartId;if(!charts[id])return;const series=charts[id],view=el.querySelector('svg.chart-svg'),tip=el.querySelector('.chart-tooltip');let index=0;
 const allSteps=[...new Set(series.flatMap(s=>s.points.map(p=>p[0])))].sort((a,b)=>a-b),max=allSteps.at(-1);
 function show(step,px,py){const shown=el.dataset.highlightSeries?series.filter(s=>s.label===el.dataset.highlightSeries):series;const info=shown.map(s=>{let p=s.points.reduce((a,b)=>Math.abs(b[0]-step)<Math.abs(a[0]-step)?b:a);return `<div>${esc(s.label)}: <strong>${p[1].toFixed(2)}%</strong> <span>(step ${p[0]})</span></div>`;}).join('');tip.innerHTML=`<strong>Raw evaluation</strong>${info}`;tip.hidden=false;const wrap=tip.parentElement;tip.style.left=`${Math.max(0,Math.min(px+12,wrap.clientWidth-tip.offsetWidth))}px`;tip.style.top=`${Math.max(0,Math.min(py-30,wrap.clientHeight-tip.offsetHeight))}px`;const cursor=view.querySelector('.chart-cursor');cursor.removeAttribute('hidden');cursor.querySelector('path').setAttribute('d',`M${55+step/max*487} 29V282`);cursor.querySelector('circle').setAttribute('cx',55+step/max*487);cursor.querySelector('circle').setAttribute('cy',282);}
 function pointer(e){const r=view.getBoundingClientRect(),localX=(e.clientX-r.left)/r.width*560,step=Math.max(0,Math.min(max,(localX-55)/487*max));index=allSteps.reduce((best,v,i)=>Math.abs(v-step)<Math.abs(allSteps[best]-step)?i:best,0);const wr=tip.parentElement.getBoundingClientRect();show(allSteps[index],(e.clientX-wr.left)*tip.parentElement.clientWidth/wr.width,(e.clientY-wr.top)*tip.parentElement.clientHeight/wr.height);}
 view.addEventListener('pointermove',pointer);view.addEventListener('pointerdown',pointer);view.addEventListener('pointerleave',()=>{tip.hidden=true;view.querySelector('.chart-cursor').setAttribute('hidden','');});
 view.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End','Escape'].includes(e.key))return;e.preventDefault();if(e.key==='Escape'){tip.hidden=true;return;}index=e.key==='Home'?0:e.key==='End'?allSteps.length-1:Math.max(0,Math.min(allSteps.length-1,index+(e.key==='ArrowRight'?1:-1)));show(allSteps[index],el.clientWidth/2,40);el.querySelector('.chart-readout').textContent=`Raw evaluation at step ${allSteps[index]}: ${[...tip.querySelectorAll('div')].map(d=>d.textContent).join(' · ')}`;});
 view.addEventListener('blur',()=>{tip.hidden=true;});
 });}

export function performanceBars(){const names=['GTPO ‡','GTPO †','πRL','GRPO ‡','OpenVLA-OFT','SimpleVLA-RL','π0.5','GROOT-N1'],values=[99.70,98.65,98.30,97.45,97.10,96.90,96.90,93.90];let s=text(48,17,'Average success rate (%)',12,C.muted);const y=v=>225-(v-88)/14*195;[90,95,100].forEach(v=>s+=line(48,y(v),540,y(v))+text(39,y(v)+4,v,12,C.muted,'end'));values.forEach((v,i)=>{const x=64+i*59;s+=`<rect class="result-bar" x="${x}" y="${y(v)}" width="35" height="${225-y(v)}" fill="${i<2?styles[i].color:'#a8af9c'}"/>`+`<g class="result-value">${text(x+17.5,y(v)-8,v.toFixed(2),12,i<2?C.green:C.muted,'middle')}</g>`+`<text x="${x+15}" y="245" font-size="11" text-anchor="end" transform="rotate(-28 ${x+15} 245)">${names[i]}</text>`;});return `<div class="chart-card"><h4 class="chart-title"><span class="subtle">(d)</span> Performance</h4>${svg(560,302,s,'Average success rate: GTPO full demonstrations 99.70%, GTPO one demonstration 98.65%, and published references.')}<p class="chart-readout">† One demo · ‡ Full demos · Axis from 88%</p></div>`;}
export function realBars(real){let s=text(52,18,'Success rate (%) · 20 trials per point',12,C.muted);const y=v=>265-v/108*230;[0,20,40,60,80,100].forEach(v=>s+=line(52,y(v),551,y(v))+text(43,y(v)+4,v,12,C.muted,'end'));const tasks=Object.keys(real.SFT);tasks.forEach((t,i)=>{const vals=[real.SFT[t],real.DATA[t].GRPO.at(-1),real.DATA[t].GTPO.at(-1)];const colors=['#a6ad9b',C.red,C.green];vals.forEach((v,j)=>{const x=68+i*97+j*23;s+=`<rect class="result-bar" x="${x}" y="${y(v)}" width="19" height="${265-y(v)}" fill="${colors[j]}"/>`+`<g class="result-value">${text(x+9.5,y(v)-7,v,11,colors[j],'middle')}</g>`;});const labels=t==='Battery insertion'?['Battery','insertion']:[t];labels.forEach((l,k)=>s+=text(101+i*97,286+k*14,l,12,C.ink,'middle'));});return `<div class="chart-card"><h4 class="chart-title">(b) Final success across five tasks</h4>${svg(570,326,s,'Final real-world task success: SFT, GRPO and GTPO. Twenty trials per point.')}<div class="chart-legend">${[['SFT','#a6ad9b'],['GRPO',C.red],['GTPO',C.green]].map(([n,c])=>`<span class="legend-item"><span class="legend-line" style="--series-color:${c}"></span>${n}</span>`).join('')}</div></div>`;}
