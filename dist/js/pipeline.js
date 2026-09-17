import {C,svg,text,photo,badge,recolor,stripMarkup,barsMarkup} from './figures.js?v=overview-14';


const stroke=(d,color=C.ink,width=2.1,dash='')=>`<path class="pipe-stroke" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
function arrow(x,y,x2,y2,color=C.green,width=2.2,head=9) {
  const angle=Math.atan2(y2-y,x2-x),length=head;
  return stroke(`M${x} ${y}L${x2} ${y2}`,color,width)+`<path d="M${x2} ${y2}L${x2-length*Math.cos(angle-.48)} ${y2-length*Math.sin(angle-.48)}L${x2-length*Math.cos(angle+.48)} ${y2-length*Math.sin(angle+.48)}Z" fill="${color}"/>`;
}
const label=(x,y,value,size=16,color=C.ink,anchor='middle')=>text(x,y,value,size,color,anchor);
const stage=(title,body,note,classes='')=>`<div class="pipe-stage ${classes}"><h5>${title}</h5><div class="pipe-art">${body}</div><p class="pipe-description">${note}</p></div>`;

function encoding() {
  let routes='',frames='';const ids=[[27,28,29],[19,20,21],[30,31,32],[22,23,24]];
  ids.forEach((row,i)=>{const y=20+i*68,color=i<2?C.green:C.red;
    frames+=label(26,y+14,i<2?'Success':'Failure',13,color)+badge(26,y+38,i+1,color,12);
    row.forEach((id,j)=>{const x=66+j*82,lane=x+22+(i-1.5)*5;
      routes+=arrow(lane,y+47,lane,318,C.light,1.7);
      frames+=photo(id,x,y,48,48);
      if(j<2)frames+=label(x+64,y+29,'···',18,C.muted);
      if(j===2)frames+=`<rect x="${x-1}" y="${y-1}" width="50" height="50" fill="none" stroke="${color}" stroke-width="2.5"/>`;
    });
  });
  let s=routes+frames;
  [2,1,0].forEach(i=>s+=`<rect x="${57+i*4}" y="${324-i*5}" width="230" height="49" rx="4" fill="#e3eadc" stroke="${C.green}" stroke-width="1.8"/>`);
  s+=label(172,345,'Visual encoder',17,C.green)+label(172,364,'𝒳ᵢ = fϕ(i)',16,C.green);
  return svg(320,390,s,'Four rollouts, twelve observation frames, and their connections to the shared visual encoder.');
}
function features() {
  let s=arrow(25,345,300,345,C.muted)+arrow(25,345,25,28,C.muted)+label(299,367,'D₁',16,C.muted)+label(13,22,'D₂',16,C.muted);
  const paths=[[[42,155],[89,131],[143,153],[199,140],[263,157]],[[43,218],[101,223],[141,256],[202,239],[266,217]],[[41,115],[92,79],[143,55],[205,41],[264,49]],[[42,270],[94,313],[145,310],[204,321],[268,305]]];
  paths.forEach((points,i)=>{const color=i<2?C.green:C.red;
    s+=stroke(points.map((p,j)=>`${j?'L':'M'}${p.join(' ')}`).join(''),C.ink,2.4);
    points.forEach(([x,y],j)=>s+=j===points.length-1?badge(x,y,i+1,color,14):`<circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="${C.paper}" stroke-width="1.5"/>`);
    s+=label(293,points.at(-1)[1]+6,`𝒳${['₁','₂','₃','₄'][i]}`,16,color);
  });
  return svg(320,390,s,'Four visual-feature trajectories. Green successes 1 and 2, red failures 3 and 4.');
}
function pairs() {
  let s=label(57,38,'Teachers',17,C.green)+label(260,38,'Students',17,C.red);
  s+=stroke('M72 110L245 298M72 279L245 94',C.line,1.9,'6 6');
  s+=arrow(74,100,242,87)+arrow(74,290,242,309);
  s+=badge(57,102,1,C.green,16)+badge(57,288,2,C.green,16)+badge(260,85,3,C.red,16)+badge(260,311,4,C.red,16);
  s+=label(162,69,'dtraj(𝒳₁, 𝒳₃)',17,C.green)+label(162,342,'dtraj(𝒳₂, 𝒳₄)',17,C.green);
  return svg(320,390,s,'Selected teacher pairs 1 to 3 and 2 to 4. Dashed alternatives remain visible.');
}

// Same cell order as the original artwork rotated -90 degrees. Only geometry
// and site colors change: student time increases upward, teacher time rightward.
export function sourceGrid(g,x,y,size,kind,mask=null) {
  const n=g.size,cell=size/n;let s='';
  for(let row=0;row<n;row++)for(let col=0;col<n;col++) {
    const rgb=g.colors[row][col],allowed=mask?mask.colors[row][col][0]<220:rgb[0]<220;
    const color=kind==='mask'?(allowed?'#98b59b':'#eeece3'):recolor(rgb);
    s+=`<rect class="pipe-cell" data-student="${col}" data-chunk="${col}" data-teacher="${row}" data-permitted="${allowed}" x="${x+row*cell}" y="${y+(n-1-col)*cell}" width="${cell+.08}" height="${cell+.08}" fill="${color}"/>`;
  }
  return `<g class="pipe-grid-cells" data-source-grid="${kind}">${s}</g>`;
}
function matrixAxes() {
  return arrow(46,225,226,225,C.green,1.8)+arrow(39,218,39,39,C.red,1.8)+label(136,248,'Teacher 1 · time',16,C.green)+`<text x="16" y="133" text-anchor="middle" transform="rotate(-90 16 133)" font-size="16" style="fill:${C.red}">Student 3 · time</text>`;
}
function matrixStage(g,kind,mask) {
  let s=sourceGrid(g,47,43,174,kind,mask);
  s+=matrixAxes();
  if(kind==='cost')s+=`<g class="pipe-cost-scan" opacity="0"><rect x="47" y="43" width="174" height="6.96" fill="${C.red}" fill-opacity=".13" stroke="${C.red}" stroke-width="1.5"/><rect class="pipe-cost-column" x="47" y="43" width="6.96" height="174" fill="${C.green}" fill-opacity=".15" stroke="${C.green}" stroke-width="1.5"/></g>`;
  if(kind==='mask'){
    // Match sourceGrid's rotated coordinates: a student chunk is a screen row.
    const student=Math.floor(g.size/2),cell=174/g.size;
    const permitted=g.colors.flatMap((row,teacher)=>row[student][0]<220?[teacher]:[]);
    const left=47+permitted[0]*cell,right=47+(permitted.at(-1)+1)*cell;
    const y=43+(g.size-1-student+.5)*cell,half=cell/2;
    const d=`M${left} ${y-half}V${y+half}M${left} ${y}H${right}M${right} ${y-half}V${y+half}`;
    s+=`<g class="pipe-window-label" data-student="${student}" data-window-left="${left}" data-window-right="${right}">${stroke(d,C.paper,4.5)}${stroke(d,C.green,1.8)}<text x="${(left+right)/2}" y="${y+23}" text-anchor="middle" font-size="15" fill="${C.green}" style="fill:${C.green};paint-order:stroke;stroke:${C.paper};stroke-width:3;stroke-linejoin:round">Window k</text></g>`;
  }
  if(kind==='plan')s+=`<g class="pipe-plan-scan" opacity="0"><rect x="47" y="43" width="174" height="6.96" fill="${C.green}" fill-opacity=".13" stroke="${C.green}" stroke-width="1.5"/></g><g class="pipe-plan-column" opacity="0"><rect x="47" y="43" width="6.96" height="174" fill="${C.green}" fill-opacity=".13" stroke="${C.green}" stroke-width="1.5"/></g>`;
  return svg(240,270,s,kind==='cost'?'Source visual cosine-distance matrix for student 3 and teacher 1.':kind==='mask'?'Source temporal mask. Only the banded time window permits a match.':'Source transport plan after temporally masked alignment.');
}
function sinkhorn() {
  let s=`<defs><marker id="pipeline-mass-tip" markerUnits="userSpaceOnUse" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L8 4L0 8Z" fill="${C.light}"/></marker></defs>`+label(41,30,'Student',16,C.red)+label(199,30,'Teacher',16,C.green);
  s+=stroke('M32 48V220',C.red,2)+stroke('M208 48V220',C.green,2);
  s+=`<path class="pipe-student-mass" d="M32 49C34 74 95 65 94 92C91 112 34 104 32 139C77 147 81 171 32 218Z" fill="${C.red}" opacity=".8"/><path class="pipe-teacher-mass" d="M208 49C209 81 151 85 151 104C156 126 207 122 208 143C152 157 147 181 208 219Z" fill="${C.green}" opacity=".8"/>`;
  const links=['M93 90Q125 60 155 101','M93 90Q143 114 155 177','M74 163Q119 144 155 101','M74 163Q124 199 155 177'];
  links.forEach((d,i)=>s+=`<path class="pipe-mass-link" data-link="${i}" pathLength="1" d="${d}" fill="none" stroke="${C.light}" stroke-width="2" stroke-dasharray=".04 .025" marker-end="url(#pipeline-mass-tip)"/>`);
  s+=`<g class="pipe-row-focus" opacity="0"><rect x="23" y="43" width="81" height="182" rx="5" fill="none" stroke="${C.red}" stroke-width="2.5"/></g><g class="pipe-column-focus" opacity="0"><rect x="143" y="43" width="74" height="182" rx="5" fill="none" stroke="${C.green}" stroke-width="2.5"/></g>`;
  s+=label(120,248,'Alternate row / column scaling',13,C.muted);
  return svg(240,270,s,'Schematic Sinkhorn mass transport with alternating student-row and teacher-column normalization.');
}
function chunkMarkup(markup){let i=0;return markup.replace(/<rect /g,()=>`<rect data-chunk="${i++}" `);}
function creditScoring(g) {
  let s=label(64,69,'Cost 𝒞',18)+label(256,69,'Plan 𝒯⋆',18);
  s+=sourceGrid(g['25'],12,91,104,'score-cost')+sourceGrid(g['26'],204,91,104,'score-plan')+label(160,149,'⊙',30,C.green);
  s+=`<g class="credit-aggregation-arrows">${arrow(64,208,142,252,C.green,3,12)}${arrow(256,208,178,252,C.green,3,12)}</g>`;
  s+=`<g class="credit-row-focus" opacity="0"><rect x="12" y="91" width="104" height="4.16" fill="${C.green}" fill-opacity=".15" stroke="${C.green}" stroke-width="2" vector-effect="non-scaling-stroke"/><rect x="204" y="91" width="104" height="4.16" fill="${C.green}" fill-opacity=".15" stroke="${C.green}" stroke-width="2" vector-effect="non-scaling-stroke"/></g><g class="credit-row-particles">${Array.from({length:50},(_,i)=>`<rect data-particle="${i}" x="0" y="0" width="3.5" height="3.5" opacity="0"/>`).join('')}</g>`;
  s+=label(160,278,'Chunk score',19,C.green);
  s+=`<g class="credit-score-strip">${chunkMarkup(stripMarkup(g['51'],18,296,284,28))}</g>`;
  s+=arrow(18,347,304,347,C.muted,1.8)+label(310,352,'t',15,C.muted);
  return svg(320,400,s,'Multiply aligned cost and transport, sum each row and negate to form the source chunk score.');
}
function creditAllocation(g) {
  let s='';
  const rows=[['59','Original advantage',48,true,C.red],['58','Credit weight',178,false,null],['62','Dense advantage',308,true,null]];
  for(const [id,name,y,negative,color] of rows){
    s+=label(32,y-17,name,18,id==='58'?C.green:id==='62'?C.red:C.ink,'start');
    s+=`<g class="credit-bars credit-bars-${id}" data-source-bars="${id}">${chunkMarkup(barsMarkup(g[id],32,y,470,64,negative,color))}</g>`;
    const base=negative?y:y+64;s+=arrow(29,base,511,base,C.muted,1.7)+label(518,base+5,'t',15,C.muted);
  }
  s+=`<g class="credit-chunk-focus" opacity="0"><rect x="31" y="47" width="18.8" height="67" fill="${C.green}" fill-opacity=".06" stroke="${C.green}" stroke-width="1.8"/><rect x="31" y="177" width="18.8" height="67" fill="${C.green}" fill-opacity=".06" stroke="${C.green}" stroke-width="1.8"/><rect x="31" y="307" width="18.8" height="67" fill="${C.red}" fill-opacity=".06" stroke="${C.red}" stroke-width="1.8"/></g>`;
  return svg(540,400,s,'Twenty-five corresponding action chunks: original negative advantage multiplied by normalized credit weights produces dense negative advantage. Source profiles are qualitative.');
}
function creditFlow(g) {
  return `<div class="credit-flow" data-credit-motion data-credit-mode="pending" data-playback="idle">
    <div class="credit-stages">
      <svg class="credit-transfer-overlay" aria-hidden="true"><defs><marker id="credit-transfer-tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${C.green}"/></marker></defs><path class="credit-transfer-path" fill="none" stroke="${C.green}" stroke-width="3" pathLength="1" marker-end="url(#credit-transfer-tip)" opacity="0"/>${Array.from({length:25},(_,i)=>`<rect class="credit-transfer-token" data-chunk="${i}" x="0" y="0" width="1" height="1" opacity="0"/>`).join('')}</svg>
      <div class="credit-phase credit-scoring" data-credit-phase="0"><div class="credit-phase-head"><h5>01 <span>Score aligned progress</span></h5><button class="credit-pause" type="button" hidden aria-label="Pause credit animation">Pause</button></div><div class="pipe-art">${creditScoring(g)}</div></div>
      <div class="credit-phase credit-allocation" data-credit-phase="1"><div class="credit-phase-head"><h5>02 <span>Distribute credit over time</span></h5><button class="credit-pause" type="button" hidden aria-label="Pause credit animation">Pause</button></div><div class="pipe-art">${creditAllocation(g)}</div></div>
    </div>
  </div>`;
}

export const alignmentSteps=[
  {title:'Compare visual progress',detail:'Build cosine costs between every student and teacher feature.'},
  {title:'Keep nearby time matches',detail:'The temporal window excludes distant pairs before transport.'},
  {title:'Balance transport mass',detail:'Alternate student rows and teacher columns under uniform marginals.'},
  {title:'Keep the aligned plan',detail:'The final transport weights connect the two timelines.'}
];
export function pipeline(g) {
  const alignFigures=[matrixStage(g['25'],'cost',g['43']),matrixStage(g['43'],'mask',g['43']),sinkhorn(),matrixStage(g['26'],'plan',g['43'])];
  const equations=['𝒞 = 1 − cosine similarity','𝒦 = ℳ ⊙ exp(−𝒞 / ε)','u ← μ / (𝒦v) · v ← ν / (𝒦ᵀu)','𝒯⋆ = diag(u) 𝒦 diag(v)'];
  const names=['Cost matrix 𝒞','Temporal mask ℳ','Sinkhorn alignment','Transport plan 𝒯⋆'];
  return `<div class="pipeline-figure">
    <section class="pipeline-block pipe-section"><div class="pipeline-label"><span>(a)</span><h4>Represent rollouts. Find a teacher.</h4></div>
      <div class="pipe-three pipe-representation">
        ${stage('01 / Encode',encoding(),'Shared visual encoder')}
        ${stage('02 / Represent',features(),'Feature-space trajectories')}
        ${stage('03 / Pair',pairs(),'Nearest successful teacher')}
      </div>
    </section>
    <section class="pipeline-block pipe-section pipe-alignment" data-pipeline-alignment data-playback="idle">
      <div class="pipeline-label"><span>(b)</span><h4>Align progress through time.</h4><button class="pipe-pause" type="button" hidden aria-label="Pause alignment animation">Pause</button></div>
      <div class="pipe-four">${alignFigures.map((art,i)=>`<div class="pipe-stage pipe-align-stage" data-align-stage="${i}" data-state="ready"><div class="pipe-stage-heading"><h5><span class="pipe-step-number">0${i+1}</span>${names[i]}</h5><button class="pipe-local-pause" type="button" hidden aria-label="Pause alignment animation">Pause</button></div><div class="pipe-art">${art}</div><p class="pipe-description">${alignmentSteps[i].detail}</p><p class="pipe-local-equation">${equations[i]}</p></div>`).join('')}</div>
      <div class="pipe-narration" aria-live="polite" aria-atomic="true"><span class="pipe-phase-number">01 → 04</span><div><strong class="pipe-phase-title">From visual cost to temporal alignment.</strong><p class="pipe-phase-detail">Compare features, restrict matches, balance mass, and retain the transport plan.</p><span class="pipe-phase-equation">𝒦 = ℳ ⊙ exp(−𝒞 / ε)</span></div></div>

    </section>
    <section class="pipeline-block pipe-section"><div class="pipeline-label"><span>(c)</span><h4>Turn alignment into dense credit.</h4></div>
      ${creditFlow(g)}
    </section>
  </div>`;
}
