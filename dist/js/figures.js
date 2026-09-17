export const C={green:'#35634d',light:'#81937a',red:'#9b4843',ink:'#414b3c',muted:'#7d8276',paper:'#f7f4ec',line:'#d9d8cd'};
let uid=0;
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function svg(w,h,body,label){const id=`native-${++uid}`;return `<svg class="diagram-native" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}"><title id="${id}">${esc(label)}</title>${body}</svg>`;}
export const text=(x,y,s,size=15,fill=C.ink,anchor='start')=>`<text x="${x}" y="${y}" style="fill:${fill}" font-size="${size}" text-anchor="${anchor}">${esc(s)}</text>`;
export const line=(x,y,x2,y2,color=C.line,width=1,dash='')=>`<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
export const arrow=(x,y,x2,y2,color=C.muted,dash='')=>{const a=Math.atan2(y2-y,x2-x),d=7;return line(x,y,x2,y2,color,1.5,dash)+`<path d="M${x2-d*Math.cos(a-.5)} ${y2-d*Math.sin(a-.5)}L${x2} ${y2}L${x2-d*Math.cos(a+.5)} ${y2-d*Math.sin(a+.5)}" fill="none" stroke="${color}" stroke-width="1.5"/>`;};
export const badge=(x,y,label,color=C.green,r=12)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>${text(x,y+4,label,r*.95,C.paper,'middle')}`;
export const photo=(n,x,y,w,h)=>`<image data-photo="${n}" href="assets/photo-${n}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
const panel=(label,body,cls='')=>`<div class="diagram-panel ${cls}"><h4 class="panel-title">${label}</h4>${body}</div>`;

export function rolloutDiagram(){
 // Slide 3, shapes 21/24/34/30: original Bézier points, including rotation/flip.
 // Coordinates are transformed from PPT EMUs; only the palette is adapted.
 const trajectories=['M169.66 145.51C171.87 128.34 174.08 111.17 187.82 101.81C201.56 92.45 231.67 100.13 252.09 89.35C272.51 78.56 284.79 42.75 310.33 37.08C335.86 31.41 379.71 54.59 405.31 55.32C430.9 56.05 439.61 43.03 463.91 41.47C488.21 39.9 537.48 45.99 551.13 45.92', 'M172.79 141.69C180.41 130.47 188.04 119.25 199.59 114.89C211.14 110.53 226.61 120.34 242.08 115.54C257.55 110.75 279.01 92.12 292.41 86.13C305.81 80.14 311.04 81.23 322.48 79.59C333.92 77.96 341.98 74.69 361.05 76.32C380.12 77.96 412.69 89.07 436.88 89.4C461.07 89.72 485.91 78.61 506.17 78.29C526.43 77.96 542.45 82.7 558.47 87.44', 'M170.85 146.19C179.74 142.33 188.62 138.46 199.32 137.02C210.03 135.59 223.86 139.45 235.07 137.56C246.27 135.68 254.15 131.27 266.57 125.7C278.99 120.13 286.96 108.08 309.58 104.13C332.2 100.17 377.94 101.16 402.27 101.97C426.6 102.78 439.73 102.87 455.58 108.98C471.43 115.09 483.45 131.9 497.38 138.64C511.32 145.38 528.88 140.84 539.18 149.43C549.49 158.02 553.45 182.1 559.21 190.19C564.96 198.28 571.17 198.68 576.58 198.33', 'M170.69 148.13C186.13 151.48 201.56 154.83 220.92 162.53C240.27 170.23 263.21 184.42 286.83 194.34C310.45 204.26 342.14 218.4 362.63 222.05C383.13 225.7 392.4 216.77 409.81 216.25C427.23 215.72 450.03 219.3 467.1 218.88C484.16 218.47 498.74 213.62 512.21 213.77C525.69 213.92 536.83 216.84 547.96 219.76'];
 const light='#accd8d', mid='#669d68', coral='#c0786a', ochre='#b1803f';
 const stops=[[[0,light],[.42,mid],[1,C.green]],[[0,light],[.6,mid],[1,C.green]],[[0,light],[.45,mid],[1,C.red]],[[0,light],[.4,coral],[1,C.red]]];
 const bufferStops=[[[0,light],[.62,light],[1,C.green]],[[0,light],[1,C.green]],[[0,light],[.43,mid],[1,C.red]],[[0,light],[.43,coral],[1,C.red]]];
 const prefix=`rollout-${++uid}`;
 const gradient=(id,colors,axis='x')=>`<linearGradient id="${id}" x1="0" y1="0" x2="${axis==='x'?1:0}" y2="${axis==='y'?1:0}">${colors.map(([offset,color])=>`<stop offset="${offset}" stop-color="${color}"/>`).join('')}</linearGradient>`;
 const defs=(suffix,axis='x')=>`<defs>${stops.map((v,i)=>gradient(`${prefix}-${suffix}-${i}`,v,axis)).join('')}${bufferStops.map((v,i)=>gradient(`${prefix}-${suffix}-buffer-${i}`,v)).join('')}</defs>`;
 const path=(d,i,suffix,width=3.3)=>`<path data-rollout-link="${i+1}" data-trajectory="${i+1}" pathLength="1" d="${d}" fill="none" stroke="url(#${prefix}-${suffix}-${i})" stroke-width="${width}" stroke-linecap="round"/>`;
 // Callouts end inside the observation, at the gripper; they do not point back at the rollout.
 const callout=(d,x,y,dx,dy)=>`<path class="rollout-callout" d="${d}" fill="none" stroke="${ochre}" stroke-width="1.7" stroke-dasharray="4 4" stroke-linecap="round"/>${arrow(x-dx,y-dy,x,y,ochre)}`;
 const buffer=(x,y,w,h,suffix)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${C.muted}" stroke-width="1.2" stroke-dasharray="6 5"/>${text(x+w/2,y-14,'Rollout buffer',16,C.ink,'middle')}${text(x+w/2,y+28,'Success trajectories',14,C.green,'middle')}${text(x+w/2,y+h*.59,'Failure trajectories',14,C.red,'middle')}${[.26,.44,.73,.91].map((v,i)=>`<g data-rollout-link="${i+1}"><rect x="${x+27}" y="${y+h*v-2.5}" width="${w-63}" height="5" fill="url(#${prefix}-${suffix}-buffer-${i})"/>${badge(x+w-36,y+h*v,i+1,i<2?C.green:C.red,10)}</g>`).join('')}`;
 let s=defs('desktop');
 s+=`<path d="M129 80L172 147L129 162Z" fill="${light}" opacity=".38"/><path d="M508 23C512 5 573 25 598 50S610 72 600 96S573 128 543 116S522 122 510 104S474 65 487 55S506 48 508 23Z" fill="${light}" opacity=".3"/><path d="M552 164C575 145 587 171 617 174S626 202 611 216S637 233 616 248S581 264 567 248S535 246 528 235S535 216 526 208S540 187 539 178S543 169 552 164Z" fill="${C.red}" opacity=".14"/><path d="M558 46L636 34V117L558 88Z" fill="${light}" opacity=".22"/><path d="M579 199L634 159V242L552 220Z" fill="${C.red}" opacity=".12"/>`;
 s+=trajectories.map((d,i)=>path(d,i,'desktop')).join('');
 s+=photo(5,18.8,78.5,110.6,83)+text(74,179,'Same initial state',12,C.muted,'middle');
 s+=photo(7,132,180.5,101,75.8)+photo(8,341.1,126.2,103.3,77.5);
 s+=callout('M208 161C208 177 199 189 190 191S181 207 180 219',180,223,0,4);
 s+=callout('M457 116C423 116 449 151 408 154',404,154,-4,0);
 s+=`<circle cx="172" cy="147" r="8" fill="${light}"/>`;
 [[561.3,46],[565.7,87.9],[581.7,199.1],[554.5,220.6]].forEach(([x,y],i)=>{s+=`<g data-rollout-link="${i+1}">${badge(x,y,i+1,i<2?C.green:C.red,11)}</g>`;});
 s+=photo(10,636.4,34.2,110.6,83)+photo(6,634.4,158.8,111.3,83)+text(691.7,22,'Success',15,C.green,'middle')+text(690,146,'Failure',15,C.red,'middle');
 s+=buffer(774,35,240,218,'desktop');
 const full=svg(1025,276,s,'Four rollouts from one initial state. Successful trajectories gradually deepen in green. Failure 3 turns red later than failure 4. Dashed arrows point from each failed trajectory into its intermediate observation. The rollout buffer preserves all four color progressions.');
 // Reflow the same four progressions vertically on narrow screens.
 let m=defs('mobile','y')+photo(5,4,12,105,79)+text(56,5,'Same initial state',12,C.muted,'middle');
 m+=`<path d="M10 80L25 132L107 80Z" fill="${light}" opacity=".24"/>`;
 const mobilePaths=['M25 132C38 113 48 93 78 99S124 80 152 93S173 91 187 96','M25 132C62 130 63 115 95 121S148 117 187 128','M25 132C66 134 83 176 139 177S213 170 243 206S251 298 275 323S273 385 279 410','M25 132C30 174 20 204 40 261S52 365 107 407S170 456 279 450'];
 // Success curves still progress left to right; failed curves progress downward.
 m+=`<defs>${stops.slice(0,2).map((v,i)=>gradient(`${prefix}-mobile-success-${i}`,v)).join('')}</defs>`;
 m+=mobilePaths.map((d,i)=>i<2?`<path data-rollout-link="${i+1}" data-trajectory="${i+1}" pathLength="1" d="${d}" fill="none" stroke="url(#${prefix}-mobile-success-${i})" stroke-width="3.3" stroke-linecap="round"/>`:path(d,i,'mobile')).join('');
 m+=photo(10,219,71,105,79)+text(271,59,'Success',14,C.green,'middle');
 m+=photo(7,79,233,104,78)+photo(8,172,309,104,78);
 m+=callout('M28 208C76 207 91 242 126 276',129,279,3,3)+callout('M260 294C227 296 256 333 239 337',235,337,-4,0);
 m+=text(131,329,'Trajectory 4',12,C.muted,'middle')+text(224,404,'Trajectory 3',12,C.muted,'middle');
 m+=`<circle cx="25" cy="132" r="7" fill="${light}"/>`;
 [[193,96],[193,128],[279,414],[279,450]].forEach(([x,y],i)=>m+=`<g data-rollout-link="${i+1}">${badge(x,y,i+1,i<2?C.green:C.red,11)}</g>`);
 m+=`<path d="M279 414L216 490H321L279 450Z" fill="${C.red}" opacity=".12"/>`+photo(6,216,490,105,79)+text(268,483,'Failure',14,C.red,'middle');
 const mobile=svg(330,587,m,'The four rollouts reflow vertically. Failure 3 changes color later than failure 4; dashed callouts point into the corresponding observation frames.');
 const mobileBuffer=svg(330,250,defs('compact')+buffer(5,30,320,212,'compact'),'Rollout buffer with two gradually greener successes, a late green-to-red failure 3, and an earlier green-to-red failure 4.');
 return `<div class="rollout-desktop">${full}</div><div class="rollout-mobile">${mobile}${mobileBuffer}</div>`;
}
// Filled arrowheads and constant-width shafts remain legible at phone sizes.
const flowArrow=(x,y,x2,y2,color=C.muted,width=2.2,head=7)=>{
 const a=Math.atan2(y2-y,x2-x),bx=x2-head*Math.cos(a),by=y2-head*Math.sin(a),wing=head*.48;
 return `<path d="M${x} ${y}L${bx} ${by}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="M${x2} ${y2}L${bx-wing*Math.sin(a)} ${by+wing*Math.cos(a)}L${bx+wing*Math.sin(a)} ${by-wing*Math.cos(a)}Z" fill="${color}"/>`;
};
const weightText=(x,y,label,size=16,color=C.ink,anchor='middle',weight=600)=>`<g font-weight="${weight}">${text(x,y,label,size,color,anchor)}</g>`;
export function sparseDiagram(){
 let s=weightText(73,24,'Sparse reward',16)+weightText(249,24,'Sparse advantage',16,C.red);
 [1,2,3,4].forEach((v,i)=>{
  const y=73+i*60,col=i<2?C.green:C.red;
  let row=`<rect class="sparse-row-wash" x="4" y="${y-30}" width="322" height="54" rx="4" fill="${col}" opacity="0"/>`;
  row+=`<g font-weight="650">${badge(20,y,v,col,13)}</g>`+flowArrow(40,y,62,y,'#a47d43',2.5,8)+weightText(82,y+7,i<2?'+1':'0',23,col,'middle',650)+flowArrow(108,y,147,y,'#a47d43',2.5,8);
  row+=flowArrow(164,y+17,325,y+17,C.muted,1.4,6)+flowArrow(164,y+17,164,y-27,C.muted,1.4,6)+weightText(154,y-24,'A',14,C.muted)+weightText(325,y+34,'t',14,C.muted);
  row+='<g class="uniform-bars">';
  for(let j=0;j<20;j++)row+=`<rect x="${171+j*7}" y="${y-15}" width="6.6" height="31" fill="${col}" opacity=".94"/>`;
  row+='</g>';
  s+=`<g data-rollout-link="${v}" class="sparse-row"><title>Rollout ${v}: ${i<2?'success, reward +1':'failure, reward 0'}. One group-relative advantage is shared by all action chunks.</title>${row}</g>`;
 });
 return svg(330,300,s,'GRPO: sparse terminal rewards +1, +1, 0, 0 lead to uniform advantage across time within each trajectory. A denotes advantage and t denotes time. Bar heights are schematic, not numeric advantage values.')+'<p class="sparse-explanation"><strong>Uniform across time.</strong> One group-relative advantage is shared by every action chunk.</p>';
}
// Recover position along the source color ramp, then map it continuously to
// the same green / ivory / red tokens as GRPO. This preserves cell ordering.
const sourceRamp=[[0,104,55],[26,152,80],[102,189,99],[166,217,106],[217,239,139],[255,255,191],[254,224,139],[253,174,97],[244,109,67],[215,48,39],[165,0,38]];
const teachingTone=rgb=>{
 let best=Infinity,t=0;
 for(let i=0;i<sourceRamp.length-1;i++){
  const a=sourceRamp[i],d=sourceRamp[i+1].map((v,k)=>v-a[k]);
  const u=Math.max(0,Math.min(1,rgb.reduce((sum,v,k)=>sum+(v-a[k])*d[k],0)/d.reduce((sum,v)=>sum+v*v,0)));
  const distance=rgb.reduce((sum,v,k)=>sum+(v-a[k]-u*d[k])**2,0);
  if(distance<best){best=distance;t=(i+u)/(sourceRamp.length-1);}
 }
 const parse=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16));
 const a=parse(t<.5?C.green:C.paper),b=parse(t<.5?C.paper:C.red),u=t<.5?t*2:(t-.5)*2;
 return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*u)).join(',')})`;
};
function teachingCells(g,x,y,size){
 const cell=size/g.size;let cells='';
 // PPT image 58 has flipV="1". Data rows remain in source-image order.
 for(let r=0;r<g.size;r++)for(let c=0;c<g.size;c++)cells+=`<rect class="ot-matrix-cell" data-row="${r}" data-col="${c}" x="${x+c*cell}" y="${y+r*cell}" width="${cell+.04}" height="${cell+.04}" fill="${teachingTone(g.colors[g.size-1-r][c])}"/>`;
 return cells;
}
const teachingStrip=(g,x,y,w,h,cls='')=>g.colors.map((color,i)=>`<rect class="${cls}" data-col="${i}" x="${x+i*w/g.colors.length}" y="${y}" width="${w/g.colors.length+.04}" height="${h}" fill="${teachingTone(color)}"/>`).join('');
export function overviewTeaching(graphics,part='all'){
 const grad=`feature-grad-${++uid}`;
 // The source surface is a folded sheet, not a cone. Its outline is traced from
 // slide 3 image 967; its 9.40977° rotation and node positions follow the PPT.
 const defs=`<defs><linearGradient id="${grad}" gradientUnits="userSpaceOnUse" x1="0" y1="224" x2="0" y2="594"><stop stop-color="${C.green}"/><stop offset=".26" stop-color="#789580"/><stop offset=".51" stop-color="${C.paper}"/><stop offset=".73" stop-color="#cfaaa1"/><stop offset="1" stop-color="${C.red}"/></linearGradient><linearGradient id="${grad}-fold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d7b9ae"/><stop offset="1" stop-color="${C.red}"/></linearGradient></defs>`;
 let pairing=weightText(85,24,'Group pairing',17);
 pairing+=`<g class="feature-manifold" transform="translate(5 -22) scale(1.18)"><g transform="translate(-71.6944 26.3838) rotate(9.40977 145.5648 116.5742) scale(.2911296 .2914356)">
 <path class="manifold-fold" d="M637 503C670 514 717 503 732 482C746 461 742 444 724 454C696 459 668 480 637 503Z" fill="url(#${grad}-fold)"/>
 <path class="manifold-surface" d="M405 468C425 427 435 312 454 257C463 225 478 209 499 234C548 275 583 367 619 418C639 446 665 465 690 467C641 499 603 527 560 552C531 570 500 583 479 587C422 604 367 582 333 552C305 525 324 493 343 482C361 472 383 468 405 468Z" fill="url(#${grad})"/>
 </g>`;
 const projection=(d,x,y,dx,dy)=>`<path d="${d}" fill="none" stroke="#606c67" stroke-width="1.7" stroke-dasharray="3 3" stroke-linecap="round"/>${arrow(x-dx,y-dy,x,y,'#606c67')}`;
 // Dashed projections attach the four labels to the illustrated surface.
 pairing+=projection('M92 93Q87 99 81 101',78,102,-3,1)+projection('M57 105Q65 109 65 119',65,124,0,5)+projection('M36 154Q37 161 42 166',45,170,3,4)+projection('M121 161Q114 165 113 170',112,175,-1,5);
 // Source pairings: 2 ↔ 3 and 1 ↔ 4, with arrowheads at both ends.
 const pairArrow=(x,y,x2,y2)=>flowArrow(x,y,x2,y2,'#b1803f',1.9,5)+flowArrow(x2,y2,x,y,'#b1803f',1.9,5);
 pairing+=pairArrow(46.79,110.86,39.12,137.01)+pairArrow(99.81,91.39,124.17,146.72);
 pairing+=[[95.43,84.56,1],[48.88,103.64,2],[35.75,144.81,3],[127.40,153.99,4]].map(([x,y,n])=>`<g data-rollout-link="${n}" font-weight="650">${badge(x,y,n,n<3?C.green:C.red,8.4)}</g>`).join('')+'</g>';
 pairing+=weightText(85,265,'Feature space',13,C.muted,'middle',500);
 let ot=weightText(307,24,'OT teaching',17);
 ot+=`<defs><linearGradient id="${grad}-teacher" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${C.green}"/><stop offset="1" stop-color="#b9c8b8"/></linearGradient></defs>`;
 ot+=`<g class="ot-teacher-input"><rect x="209" y="72" width="5" height="170" fill="url(#${grad}-teacher)"/><text transform="translate(200 157) rotate(-90)" text-anchor="middle" font-size="14" font-weight="600" style="fill:${C.green}">Teacher</text>${badge(211.5,60,'2',C.green,9)}</g>`;
 ot+=`<g class="ot-matrix" aria-label="Illustrative alignment matrix: teacher 2 against student 3">${teachingCells(graphics['13'],222,72,170)}</g>`;
 ot+=`<g class="ot-alignment-guides"><path class="ot-band" pathLength="1" d="M222 233.5L383.5 72M230.5 242L392 80.5" fill="none" stroke="#fff9df" stroke-width=".8" opacity=".72"/></g>`;
 ot+=teachingStrip(graphics['11'],222,251,170,5)+weightText(307,280,'Student',14,C.red)+badge(397,253.5,'3',C.red,9);
 let dense=weightText(512,24,'Dense advantage',17,C.green);
 dense+=`<g class="ot-score-output">${weightText(504,53,'Score',14,C.ink)}${badge(539,49,'3',C.red,8.5)}${teachingStrip(graphics['11'],456,63,113,12,'ot-score-cell')}</g>`;
 dense+=`<g class="ot-advantage-output"><g class="ot-score-down">${flowArrow(512,82,512,100,C.green,2.4,8)}</g>`;
 dense+=graphics['12'].bars.map((b,i)=>`<rect class="ot-credit-bar" x="${456+i*113/20}" y="${241-b.height*135}" width="${113/20*.82}" height="${b.height*135}" fill="${teachingTone(b.color)}"/>`).join('');
 dense+=flowArrow(451,242,576,242,C.muted,1.4,6)+flowArrow(451,242,451,100,C.muted,1.4,6)+weightText(440,107,'A',13,C.muted)+weightText(576,260,'t',13,C.muted)+weightText(512,280,'Advantage over time',12,C.muted,'middle',500)+'</g>';
 // The teaching output feeds Score 3, not the middle of the advantage bars.
 const scoreConnector=`<g class="ot-score-connector"><path class="ot-score-link" pathLength="1" d="M394 121C425 121 414 69 448 69" fill="none" stroke="#b1803f" stroke-width="2" stroke-dasharray=".055 .04" stroke-linecap="round"/>${flowArrow(444,69,452,69,'#b1803f',2,6)}</g>`;
 const parts={pairing,ot,dense},crops={pairing:'0 40 180 245',ot:'186 40 224 245',dense:'430 40 150 245'};
 const body=part==='all'?pairing+ot+dense+scoreConnector:parts[part];
 const result=svg(580,300,defs+body,'Teacher 2 aligns with student 3 through temporal optimal transport. The illustrated alignment produces Score 3, then dense advantage over time. The colors and animation are qualitative.').replace('<svg ',`<svg ${part!=='pairing'?`data-ot-sequence="${part==='all'?'full':part==='ot'?'matrix':'score'}"`:''} `);
 return part==='all'?result:result.replace('viewBox="0 0 580 300"',`viewBox="${crops[part]}"`);
}

export function recolor(rgb,kind='matrix'){const [r,g,b]=rgb;let t=Math.max(0,Math.min(1,1-(.2126*r+.7152*g+.0722*b)/255));const target=(r>g*1.14&&r>b*1.05)?[155,72,67]:[53,99,77];if(kind==='red')return C.red;return `rgb(${[247,244,236].map((v,i)=>Math.round(v*(1-t*.94)+target[i]*t*.94)).join(',')})`;}
export function matrixMarkup(g,x,y,size,id='',rotation=0){const n=g.size,cell=size/n;let s='';for(let r=0;r<n;r++)for(let c=0;c<n;c++)s+=`<rect x="${x+c*cell}" y="${y+r*cell}" width="${cell+.1}" height="${cell+.1}" fill="${recolor(g.colors[r][c])}"/>`;return `<g ${rotation?`transform="rotate(${rotation} ${x+size/2} ${y+size/2})"`:''}>${s}</g>`;}
export function stripMarkup(g,x,y,w,h){return g.colors.map((col,i)=>`<rect x="${x+i*w/g.colors.length}" y="${y}" width="${w/g.colors.length+.1}" height="${h}" fill="${recolor(col)}"/>`).join('');}
export function barsMarkup(g,x,y,w,h,negative=false,uniformColor=null){return g.bars.map((b,i)=>`<rect x="${x+i*w/g.bars.length}" y="${negative?y:y+h-b.height*h}" width="${w/g.bars.length*.82}" height="${b.height*h}" fill="${uniformColor||recolor(b.color)}"/>`).join('');}
export function overview(graphics){const teaching=overviewTeaching(graphics);const mobile=()=>`<div class="teaching-mobile">${[['pairing','Group pairing'],['ot','OT teaching'],['dense','Dense advantage']].map(([part,label],i)=>`${i?'<p class="flow-arrow" aria-hidden="true">↓</p>':''}<div class="teaching-crop" data-part="${part}"><h5>${label}</h5>${overviewTeaching(graphics,part)}</div>`).join('')}</div>`;return `<div class="overview-interactive"><div class="overview-grid">${panel('<span>(a)</span> Group rollout',rolloutDiagram(),'overview-rollout')}${panel('<span>(b)</span> <strong>GRPO</strong><em class="advantage-label sparse-label">Low efficiency</em>',sparseDiagram(),'sparse-diagram')}${panel('<span>(c)</span> <strong>GTPO</strong><em class="advantage-label dense-label">High efficiency</em>',`<div class="teaching-desktop">${teaching}</div>${mobile()}<p class="sparse-explanation"><strong>Redistributed across time.</strong> Aligned visual progress provides chunk-level credit.</p>`,'teaching-diagram')}</div><div class="overview-outcomes"><div id="overview-performance"></div><div id="overview-efficiency"></div></div></div>`;}

export function rolloutEncoding(){let s='';const ids=[[27,28,29],[19,20,21],[30,31,32],[22,23,24]];ids.forEach((row,i)=>{const y=20+i*76,c=i<2?C.green:C.red;s+=text(6,y+18,i<2?'Success':'Failure',13,c)+badge(28,y+42,i+1,c,10);row.forEach((n,j)=>{const x=77+j*103;s+=photo(n,x,y,57,57);if(j<2)s+=text(x+71,y+33,'···',18,C.muted,'middle');if(j===2)s+=`<rect x="${x-1}" y="${y-1}" width="59" height="59" stroke="${c}" stroke-width="2" fill="none"/>`;s+=arrow(x+28,y+58,x+28,338,C.light);});});
 s+=[3,2,1,0].map(i=>`<rect x="${63+i*3}" y="${338-i*4}" width="293" height="53" rx="3" fill="#e1e7d9" stroke="${C.green}"/>`).join('')+text(210,360,'Visual encoder',16,C.green,'middle')+text(210,380,'𝒳ᵢ = fϕ(i)',15,C.green,'middle');return svg(385,408,s,'Twelve observation frames from four trajectories are passed through the shared visual encoder.');}
export function featureSpace(){let s=arrow(24,265,339,265)+arrow(24,265,24,24)+text(322,285,'D₁',13)+text(7,23,'D₂',13);const pts=[[[48,110],[98,92],[158,111],[220,97],[285,112]],[[53,151],[119,158],[162,188],[221,170],[289,153]],[[47,86],[99,59],[148,40],[213,26],[282,34]],[[53,189],[109,227],[155,224],[219,232],[295,219]]];pts.forEach((ps,i)=>{const c=i<2?C.green:C.red;s+=`<path d="${ps.map((p,j)=>`${j?'L':'M'}${p.join(' ')}`).join('')}" stroke="${C.ink}" stroke-width="1.5" fill="none"/>`;ps.forEach(([x,y],j)=>s+=j===ps.length-1?badge(x,y,i+1,c,10):`<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="${C.paper}"/>`);s+=text(ps.at(-1)[0]+15,ps.at(-1)[1]+5,`𝒳${['₁','₂','₃','₄'][i]}`,16);});return svg(370,295,s,'Visual-feature trajectories: successes 1 and 2, failures 3 and 4.');}
export function pairing(){let s=arrow(66,68,259,56,C.green)+arrow(66,181,259,218,C.green)+line(66,68,259,218,C.line,1.5,'5 5')+line(66,181,259,56,C.line,1.5,'5 5')+badge(66,68,'1')+badge(66,181,'2')+badge(259,56,'3',C.red)+badge(259,218,'4',C.red);s+=text(163,41,'dtraj(𝒳₁, 𝒳₃)',14,C.green,'middle')+text(163,230,'dtraj(𝒳₂, 𝒳₄)',14,C.green,'middle')+text(66,274,'Teachers',13,C.green,'middle')+text(259,274,'Students',13,C.red,'middle');return svg(340,295,s,'Nearest-neighbor pairing selects success 1 for failure 3, and success 2 for failure 4. Dashed lines are alternative pairings.');}
export function matrixFigure(g,label,rotation=0){return `<div class="matrix">${svg(300,315,matrixMarkup(g,35,15,245,'',rotation)+arrow(30,267,285,267,C.green)+arrow(28,260,28,11,C.red)+text(165,298,'Teacher trajectory',13,C.green,'middle')+`<text transform="translate(13 142) rotate(-90)" text-anchor="middle" font-size="13" style="fill:${C.red}">Student trajectory</text>`,label)}</div>`;}
function temporalMask(g){let s=matrixMarkup(g,12,15,240,'',-90);s+=`<path d="M90 155v12h77v-12" fill="none" stroke="${C.green}" stroke-width="1.5"/>`+text(127,188,'Window k',13,C.green,'middle');return svg(265,275,s,'A banded temporal mask restricts alignment to a local time window.');}
function sinkhorn(){let s=line(35,25,35,204,C.red)+line(235,25,235,204,C.green);s+=`<path d="M35 29C36 65 98 64 104 81C98 95 35 93 35 131C92 139 84 166 35 200Z" fill="${C.red}" opacity=".75"/><path d="M235 27C235 63 169 69 171 89C176 113 235 113 235 134C175 147 163 160 235 202Z" fill="${C.green}" opacity=".75"/>`;
 [[101,82,174,89],[101,82,174,159],[72,157,174,89],[72,157,174,159]].forEach(p=>s+=arrow(...p,C.light,'4 3'));
 s+=text(135,230,'Entropic alignment',13,C.muted,'middle');return svg(270,270,s,'Sinkhorn alignment transports mass between student and teacher under a temporal mask.');}
const formula=(label,body)=>`<div class="formula"><span class="formula-label">${label}</span><math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${body}</math></div>`;
export function pipeline(g){return `
 <div class="pipeline-block"><div class="pipeline-label"><span>(a)</span><h4>Represent rollouts. Find a teacher.</h4><p>On-policy teaching within each group</p></div><div class="pipeline-grid"><div>${rolloutEncoding()}<p class="matrix-name">Shared visual encoder</p></div><div>${featureSpace()}<p class="matrix-name">Feature-space trajectories</p></div><div>${pairing()}<p class="matrix-name">Nearest-success pairing</p></div></div>
 ${formula('Failure-specific teacher', '<msubsup><mi>j</mi><mi>i</mi><mo>⋆</mo></msubsup><mo>=</mo><munder><mo>arg min</mo><mrow><mi>j</mi><mo>∈</mo><mi>𝒮</mi></mrow></munder><msub><mi>d</mi><mtext>traj</mtext></msub><mo>(</mo><msub><mi>𝒳</mi><mi>i</mi></msub><mo>,</mo><msub><mi>𝒳</mi><mi>j</mi></msub><mo>)</mo>')}
 </div>
 <div class="pipeline-block"><div class="pipeline-label"><span>(b)</span><h4>Align progress through time.</h4><p>Temporally masked optimal transport</p></div><div class="pipeline-grid four"><div>${matrixFigure(g['25'],'Visual cosine-distance cost matrix',-90)}<p class="matrix-name">Cost matrix 𝒞<sup>(i,j)</sup></p></div><div>${temporalMask(g['43'])}<p class="matrix-name">Temporal mask ℳ</p></div><div>${sinkhorn()}<p class="matrix-name">Sinkhorn alignment</p></div><div>${matrixFigure(g['26'],'Temporally aligned transport plan',-90)}<p class="matrix-name">Transport plan 𝒯<sup>⋆</sup></p></div></div>
 ${formula('Masked transport objective', '<msup><mi>𝒯</mi><mo>⋆</mo></msup><mo>=</mo><munder><mo>arg min</mo><mrow><mi>𝒯</mi><mo>≥</mo><mn>0</mn><mo>,</mo><mi>𝒯</mi><mo>=</mo><mi>𝒯</mi><mo>⊙</mo><mi>ℳ</mi></mrow></munder><mo>⟨</mo><mi>𝒯</mi><mo>,</mo><mi>𝒞</mi><mo>⟩</mo><mo>−</mo><mi>ε</mi><mi>H</mi><mo>(</mo><mi>𝒯</mi><mo>)</mo>')}
 <p class="native-caption">Uniform marginals: 𝒯1 = 1/Lᵢ · 1 and 𝒯ᵀ1 = 1/Lⱼ · 1. The temporal mask excludes distant matches.</p></div>
 <div class="pipeline-block"><div class="pipeline-label"><span>(c)</span><h4>Turn alignment into dense credit.</h4><p>Reweight the failed trajectory’s advantage</p></div><div class="pipeline-grid"><div>${scoreDiagram(g)}<p class="matrix-name">Aligned cost → chunk score</p></div><div>${weightDiagram(g)}<p class="matrix-name">Original advantage × credit weight</p></div><div>${denseDiagram(g)}<p class="matrix-name">Dense advantage → policy update</p></div></div>
 <div class="comparison">${formula('Chunk score · corrected paper formula','<msub><mi>s</mi><mrow><mi>i</mi><mo>,</mo><mi>t</mi></mrow></msub><mo>=</mo><mo>−</mo><munderover><mo>∑</mo><mrow><mi>b</mi><mo>=</mo><mn>0</mn></mrow><mrow><msub><mi>L</mi><msubsup><mi>j</mi><mi>i</mi><mo>⋆</mo></msubsup></msub><mo>−</mo><mn>1</mn></mrow></munderover><msub><mrow><mo>(</mo><msubsup><mi>𝒯</mi><mi>i</mi><mo>⋆</mo></msubsup><mo>)</mo></mrow><mrow><mi>t</mi><mi>b</mi></mrow></msub><msub><mrow><mo>(</mo><msubsup><mi>𝒞</mi><mi>i</mi><mo>⋆</mo></msubsup><mo>)</mo></mrow><mrow><mi>t</mi><mi>b</mi></mrow></msub>')}
 ${formula('Normalized credit · corrected paper formula','<msub><mover><mi mathvariant="bold">w</mi><mo>~</mo></mover><mi>i</mi></msub><mo>=</mo><msub><mi>L</mi><mi>i</mi></msub><mi mathvariant="normal">softmax</mi><mo>(</mo><mo>−</mo><msub><mi mathvariant="bold">s</mi><mi>i</mi></msub><mo>/</mo><mi>τ</mi><mo>)</mo>')}</div>
 <p class="native-caption">Successful rollouts keep uniform weights. When no valid successful teacher is available, the update reduces to the original GRPO assignment.</p></div>`;}
function scoreDiagram(g){let s=matrixMarkup(g['25'],15,20,113,'',-90)+matrixMarkup(g['26'],187,20,113,'',-90)+text(157,88,'×',26,C.muted,'middle')+arrow(74,145,150,180)+arrow(244,145,165,180)+text(156,207,'Aligned transport cost',15,C.green,'middle')+arrow(157,215,157,242);s+=stripMarkup(g['51'],17,255,280,19)+text(307,272,'t',12)+text(155,304,'Score sᵢ',14,C.muted,'middle');return svg(325,325,s,'Cost matrix and transport plan produce a per-chunk score strip.');}
function weightDiagram(g){let s=text(16,20,'Original advantage Aᵢ',15)+barsMarkup(g['59'],17,42,280,72,true,C.red)+arrow(15,41,306,41)+text(309,46,'t',12)+text(16,165,'Credit weight w̃ᵢ',15)+barsMarkup(g['58'],17,192,280,88)+arrow(15,282,306,282)+text(309,288,'t',12)+text(156,311,'Normalize to mean weight 1',13,C.muted,'middle');return svg(325,325,s,'Uniform original negative advantage and non-uniform normalized credit weights.');}
function denseDiagram(g){let s=text(155,20,'Dense advantage Âᵢ',15,C.ink,'middle')+barsMarkup(g['62'],17,43,280,107,true)+arrow(15,42,306,42)+text(309,47,'t',12)+arrow(157,166,157,205,C.green)+text(157,229,'Policy update',14,C.green,'middle')+`<rect x="57" y="251" width="200" height="54" rx="3" fill="#e0e6d7" stroke="${C.green}"/>`+text(157,286,'VLA  πθ',22,C.green,'middle');return svg(325,325,s,'Dense negative advantage allocates more credit near visually divergent chunks and updates the VLA policy.');}

export function teachers(){
 const variants=[['ST','Single teacher','One successful rollout teaches all failed rollouts in the group.'],['MTA','Average teacher','Average the guidance from the successful rollouts.'],['NNT','Nearest teacher','Choose the nearest successful rollout separately for each failure.']];
 return `<div class="teacher-grid"><button class="teacher-motion-toggle" type="button" hidden>Pause animation</button>${variants.map(([key,name,desc],index)=>{
  const xs=[51,115,267],start=index*2600;
  const link=(x,y,x2,y2,delay,duration=650)=>`<g class="teacher-link" data-start="${delay}" data-duration="${duration}" data-from="${x},${y}" data-to="${x2},${y2}"><g class="teacher-link-final">${arrow(x,y,x2,y2,C.light,'5 5')}</g><path class="teacher-link-draw" d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${C.green}" stroke-width="4" pathLength="100"/><circle class="teacher-signal" cx="${x}" cy="${y}" r="6" fill="${C.green}"/></g>`;
  let s=`<rect x="14" y="15" width="292" height="71" rx="3" fill="none" stroke="${C.green}" stroke-dasharray="5 5"/><rect x="14" y="240" width="292" height="71" rx="3" fill="none" stroke="${C.red}" stroke-dasharray="5 5"/>`;
  for(const x of xs)s+=`<circle cx="${x}" cy="51" r="16" fill="${C.green}"/><circle cx="${x}" cy="275" r="16" fill="${C.red}"/><circle class="teacher-arrival" data-at="${key==='ST'?start+1700:key==='MTA'?start+1800:start+700+xs.indexOf(x)*550}" cx="${x}" cy="275" r="23" fill="none" stroke="${C.green}" stroke-width="3"/>`;
  for(const x of [164,188,212])s+=`<circle cx="${x}" cy="51" r="3" fill="${C.ink}"/><circle cx="${x}" cy="275" r="3" fill="${C.ink}"/>`;
  if(key==='ST'){
   s+=link(160,87,160,139,start+150,550)+`<g class="teacher-best" data-at="${start+650}"><circle cx="160" cy="167" r="16" fill="${C.green}"/>${text(126,173,'Best',18,C.green,'end')}</g>`;
   for(const x of xs)s+=link(160,186,x,252,start+1000,700);
  }else if(key==='MTA'){
   for(const [i,x] of xs.entries())for(const x2 of xs)s+=link(x,70,x2,252,start+150+i*400,850);
  }else{
   for(const [i,x] of xs.entries())s+=link(x,70,x,252,start+50+i*550,650);
  }
  return `<div class="teacher-card" data-teacher-type="${key}"><div class="section-kicker">${key}</div><h4>${name}</h4>${svg(320,325,s,`${name}: ${desc}`)}<p>${desc}</p></div>`;
 }).join('')}</div>`;
}

export function credit(g){
 const film=(ids,failure=false)=>`<div class="film-row" data-credit-film="${failure?'student':'teacher'}">${ids.map((n,i)=>`<div class="film-cell ${failure&&i===5?'error':''}" data-observation="${i}"><img src="assets/photo-${n}.webp" alt="${failure?'Failed student':'Successful teacher'}, observation ${i+1} of 8${failure&&i===5?'; annotated empty-space grasp':''}" loading="lazy" width="128" height="128"></div>`).join('')}</div>`;
 const profile=svg(820,137,text(10,20,'Student credit weight',14)+`<g class="detail-weight-bars">${barsMarkup(g['58'],0,28,820,83)}</g><path class="detail-time-cursor" d="M0 27V114" stroke="${C.green}" stroke-width="2" vector-effect="non-scaling-stroke" opacity="0"/>`+arrow(0,114,820,114)+text(820,135,'t',12,C.muted,'end'),'Student credit weights, with higher weights toward the end of the illustrated trajectory.');
 return `<div class="credit-layout" data-credit-detail><div class="detail-cost">${matrixFigure(g['25'],'Illustrative cost matrix between the teacher and student')}<p class="matrix-name">Cost matrix</p></div><div class="detail-timeline"><div class="film-label"><span>Successful teacher</span><span class="detail-controls"><span>Time →</span><button class="detail-pause" type="button" aria-label="Pause trajectory animation" hidden>Pause</button></span></div>${film([27,77,78,79,80,81,82,83])}<div class="credit-profile">${profile}</div><div class="film-label failure"><span>Failed student</span><span>× Annotated failed grasp</span></div>${film([69,70,71,72,73,74,75,76],true)}</div></div>`;
}

export const scenePhotos=[{id:67,label:'(a) Scene',alt:'Franka Panda scene with base and wrist cameras and five manipulation tasks'},{id:65,label:'(b) Stack blocks',alt:'Robot stacks foam blocks'},{id:63,label:'(c) Insert battery',alt:'Robot inserts a battery into a computer mouse'},{id:66,label:'(d) Solder component',alt:'Robot solders an electronic component'},{id:64,label:'(e) Drive screw',alt:'Robot drives a screw into an electronic enclosure'},{id:68,label:'(f) Pop the top',alt:'Robot removes a bottle cap'}];
export function scenes(){
 const targets=['','stack-blocks','insert-battery','solder-component','drive-screw','pop-the-top'];
 return `<div class="scene-grid">${scenePhotos.map((p,i)=>{
  const body=`<span class="scene-frame"><img src="assets/photo-${p.id}.webp?v=franka-panda-1" alt="${p.alt}" loading="lazy" width="700" height="620"></span><span class="scene-caption">${p.label}</span>`;
  return `<figure class="scene-card">${i?`<a class="scene-link" href="#video-${targets[i]}" aria-label="Go to ${p.label.slice(4)} video">${body}</a>`:`<div class="scene-link">${body}</div>`}</figure>`;
 }).join('')}</div>`;
}
