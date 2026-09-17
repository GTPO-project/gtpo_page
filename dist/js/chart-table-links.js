// Local pairing avoids cross-highlighting another chart or its expanded copy.
const bound=new WeakSet();
export function bindChartTableLinks(root=document){
 root.querySelectorAll('.ablation-pair').forEach(pair=>{
  if(bound.has(pair))return;bound.add(pair);
  const chart=pair.querySelector('[data-chart-id]'),groups=[...chart.querySelectorAll('g[data-series]')];
  const rows=[...pair.querySelectorAll('tr[data-series-label]')],legend=[...chart.querySelectorAll('[data-legend-series]')];
  const byLabel=new Map(groups.map(g=>[g.dataset.series,g]));
  let selected=chart.dataset.highlightSeries||null;
  rows.forEach(row=>row.style.setProperty('--row-series-color',byLabel.get(row.dataset.seriesLabel)?.style.color||'var(--green)'));
  function select(label){
   selected=label&&byLabel.has(label)?label:null;
   if(selected)chart.dataset.highlightSeries=selected;else delete chart.dataset.highlightSeries;
   groups.forEach(g=>{g.classList.toggle('series-selected',g.dataset.series===selected);g.classList.toggle('series-muted',!!selected&&g.dataset.series!==selected);});
   rows.forEach(row=>{const on=row.dataset.seriesLabel===selected;row.classList.toggle('series-selected',on);row.querySelector('button').setAttribute('aria-pressed',String(on));});
   legend.forEach(item=>{item.classList.toggle('series-selected',item.dataset.legendSeries===selected);item.classList.toggle('series-muted',!!selected&&item.dataset.legendSeries!==selected);});
   // Selected geometry stays above the other curves; preserve data and line patterns.
   const cursor=chart.querySelector('.chart-cursor');
   (selected?[byLabel.get(selected)]:groups).forEach(g=>g.parentNode.insertBefore(g,cursor));
   chart.querySelector('.chart-tooltip').hidden=true;cursor.setAttribute('hidden','');
   chart.querySelector('.chart-readout').textContent=selected?`${selected} highlighted. Select its row again or press Escape to show all curves.`:'All curves shown.';
  }
  pair.addEventListener('click',event=>{
   const row=event.target.closest('tr[data-series-label]');if(!row||!pair.contains(row))return;
   // Dragging to copy a metric should not change the highlighted curve.
   if(!event.target.closest('button')&&document.getSelection()?.toString())return;
   select(selected===row.dataset.seriesLabel?null:row.dataset.seriesLabel);
  });
  pair.addEventListener('keydown',event=>{if(event.key==='Escape'&&selected){event.preventDefault();select(null);}});
  select(selected);
 });
}
