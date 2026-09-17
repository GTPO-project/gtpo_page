"""Reproducible, read-only import of paper/PPT sources into this site.

Requires Pillow. Run with the bundled Python runtime documented in README.md.
Only writes inside academic-site; source papers, scripts and data are never modified.
"""
from pathlib import Path
import ast, csv, html, io, json, re, shutil, zipfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageOps
from collections import Counter

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent
PAPER = ROOT / 'GTPO-paper'
DIST = SITE / 'dist'
NS = {'a':'http://schemas.openxmlformats.org/drawingml/2006/main',
      'p':'http://schemas.openxmlformats.org/presentationml/2006/main',
      'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for name in ('assets','data'):
    (DIST/name).mkdir(parents=True, exist_ok=True)

def save(name, value):
    (DIST/'data'/name).write_text(json.dumps(value, ensure_ascii=False, separators=(',',':')))

def curve(path, value=1, step=0):
    with (ROOT/path).open() as f:
        rows = list(csv.reader(f))[1:]
    return [[float(r[step]),float(r[value])*100] for r in rows
            if len(r)>max(value,step) and r[step].strip() and r[value].strip()]

def series(label,path,value=1,step=0,style=0):
    return dict(label=label,points=curve(path,value,step),source=path,column=value,stepColumn=step,style=style)

charts = {}
for suite,path in [('object','data/libero_object/gtpo.csv'),('goal','data/libero_goal/goal_gtpo.csv')]:
    charts[suite] = [series('GTPO ‡',path,3,style=0),series('GTPO †',path,1,style=1),series('GRPO †',path,2,style=2)]
charts['spatial'] = [series('GTPO ‡','data/libero_spatial/spatial_gtpo_full.csv'),
    series('GTPO †','data/libero_spatial/spatial_grpo.csv',style=1),
    series('GRPO †','data/libero_spatial/spatial_gtpo.csv',style=2)]
charts['long'] = [series('GTPO ‡','data/libero_long/long_grpo.csv',4,2),
    series('GTPO †','data/libero_long/long_grpo.csv',1,0,1),
    series('GRPO †','data/libero_long/long_grpo.csv',3,2,2)]
charts['ot'] = [series('GTPO','GTPO-paper/data/ablation_ot/ot_necessity.csv',2),
    series('GTPO-pointwise','GTPO-paper/data/ablation_ot/ot_necessity.csv',1,style=3),
    series('GRPO','GTPO-paper/data/ablation_ot/ot_necessity.csv',3,style=2)]
charts['window'] = [series(f'k = {k}'+(' (default)' if k==30 else ''),f'data/ablation_ksize/gtpo_k_{ {15:50,50:15}.get(k,k)}.csv',style=s)
    for k,s in [(1,4),(5,3),(15,1),(30,0),(50,2)]]
horizon=min(s['points'][-1][0] for s in charts['window'])
for s in charts['window']:
    s['points']=[p for p in s['points'] if p[0]<=horizon]
for key,path,mapping in [
    ('temperature','data/ablation_tau/gtpo_tau_0.01.csv',{'0.01':('τ = 0.01',4),'0.1':('τ = 0.1',3),'1':('τ = 1',1),'exp':('Exponential (default)',0),'linear':('Linear',2)}),
    ('teacher','data/gtpo_NT.csv',{'AT':('MTA',3),'NT':('NNT (default)',0),'ST':('ST',2)})]:
    with (ROOT/path).open() as f: header=next(csv.reader(f))
    charts[key]=[series(mapping[name][0],path,i,style=mapping[name][1]) for i,name in enumerate(header[1:],1)]
tree=ast.parse((PAPER/'scripts/draw_real_world_results.py').read_text())
real={}
for node in tree.body:
    if isinstance(node,ast.Assign) and isinstance(node.targets[0],ast.Name) and node.targets[0].id in ('SFT','DATA'):
        real[node.targets[0].id]=ast.literal_eval(node.value)
charts['rounds']=[dict(label=f'{task} · {method}',points=list(enumerate([real['SFT'][task],*real['DATA'][task][method]])),style=0 if method=='GTPO' else 2,marker='square' if task=='Opening' else 'circle',source='GTPO-paper/scripts/draw_real_world_results.py')
    for task in ('Soldering','Opening') for method in ('GTPO','GRPO')]
save('charts.json',charts);save('real-world.json',real)

# Parse the table bodies rather than transcribing experimental values.
def group(s,i):
    assert s[i]=='{',s[i:i+40]
    depth=1;j=i+1
    while depth:
        if s[j]=='{' and s[j-1]!='\\':depth+=1
        elif s[j]=='}' and s[j-1]!='\\':depth-=1
        j+=1
    return s[i+1:j-1],j

def tex(s):
    out='';i=0
    symbols={'dagger':'†','ddagger':'‡','S':'§','uparrow':'↑','downarrow':'↓','pi':'π','tau':'τ','beta':'β','epsilon':'ε','eps':'ε','times':'×','sim':'∼','method':'GTPO','%':'%','&':'&','_':'_','delta':'δ','theta':'θ'}
    while i<len(s):
        c=s[i]
        if c=='$':i+=1;continue
        if c=='{':v,i=group(s,i);out+=tex(v);continue
        if c in '^_':
            tag='sup' if c=='^' else 'sub';i+=1
            if i<len(s) and s[i]=='{':v,i=group(s,i)
            else:v=s[i:i+1];i+=1
            out+=f'<{tag}>{tex(v)}</{tag}>';continue
        if c=='\\':
            m=re.match(r'\\([A-Za-z]+|.)',s[i:]);cmd=m[1];i+=len(m[0])
            if cmd in ('textbf','mathbf','mathrm','texttt','text','shortstack','textit'):
                while i<len(s) and s[i].isspace():i+=1
                if i<len(s) and s[i]=='{':
                    v,i=group(s,i);tag={'textbf':'strong','mathbf':'strong','textit':'em'}.get(cmd,'span');out+=f'<{tag}>{tex(v)}</{tag}>'
            elif cmd=='gainsr':
                a,i=group(s,i);b,i=group(s,i);out+=tex(a)+f' <span class="gain">(+{tex(b)})</span>'
            elif cmd=='textcolor':
                _,i=group(s,i);v,i=group(s,i);out+=tex(v)
            elif cmd in ('frac','tfrac'):
                a,i=group(s,i);b,i=group(s,i);out+=f'({tex(a)}/{tex(b)})'
            elif cmd=='\\':out+='<br>'
            elif cmd in ('footnotesize','small','scriptsize','quad','qquad',',',';','!',' '):out+=' '
            elif cmd in symbols:out+=symbols[cmd]
            else:out+=html.escape(cmd)
            continue
        out+=html.escape(c);i+=1
    return re.sub(r'\s+',' ',out).replace('~',' ').strip()

def split(s,delimiter):
    depth=0;parts=[];start=0;i=0
    while i<len(s):
        if depth==0 and s.startswith(delimiter,i):parts.append(s[start:i]);i+=len(delimiter);start=i;continue
        if s[i]=='{' and (i==0 or s[i-1]!='\\'):depth+=1
        if s[i]=='}' and (i==0 or s[i-1]!='\\'):depth-=1
        i+=1
    parts.append(s[start:]);return parts

experiments=(PAPER/'sections/experiments.tex').read_text()
titles=['LIBERO success rate','RoboTwin fine-grained manipulation','Aggregate training efficiency on LIBERO','OT versus pointwise matching','Design-analysis metrics on LIBERO-Object']
headers=[['Model','Paradigm','Object · SR ↑','Rank ↓','Spatial · SR ↑','Rank ↓','Goal · SR ↑','Rank ↓','Long · SR ↑','Rank ↓','Average · SR ↑','Rank ↓'],
    ['Method','Place Container Plate','Place Empty Cup','Beat Block Hammer','Pick Dual Bottles','Average'],
    ['Method','AUC-SR ↑','Early SR@25% ↑','TTS@95 ↓'],['Method','AUC-SR','Early SR','TTS@95','Final SR'],['Analysis','Setting','AUC','Early','TTS@95']]
tables=[]
for index,m in enumerate(re.finditer(r'\\begin\{tabular\*?\}.*?\\toprule(.*?)\\bottomrule',experiments,re.S)):
    body=m[1].split('\\midrule',1)[1]
    rows=[]
    for row in split(body,'\\\\'):
        section='\\midrule' in row
        row=re.sub(r'\\(?:midrule|addlinespace)(?:\[[^]]*\])?','',row).strip()
        row=re.sub(r'^\[[^]]*\]','',row).strip()
        if row:rows.append({'cells':[tex(c.strip()) for c in split(row,'&')],'section':section})
    tables.append(dict(number=index+1,title=titles[index],headers=headers[index],rows=rows,source='GTPO-paper/sections/experiments.tex'))
for file in ['appendix_simulation.tex','appendix_real_world.tex']:
    source=(PAPER/'sections'/file).read_text()
    for m in re.finditer(r'\\begin\{appendixparams\}',source):
        title,i=group(source,m.end());label,i=group(source,i)
        body=source[i:source.index('\\end{appendixparams}',i)]
        rows=[{'cells':[tex(c.strip()) for c in split(r.strip(),'&')],'section':False} for r in split(body,'\\\\') if r.strip()]
        tables.append(dict(number=len(tables)+1,title=title,headers=['Parameter','Setting'],rows=rows,source=f'GTPO-paper/sections/{file}',label=label))
assert len(tables)==10
for t in tables:
    assert all(len(r['cells'])==len(t['headers']) for r in t['rows']),t
save('tables.json',tables)

z=zipfile.ZipFile(ROOT/'images.pptx')
photos=list(range(5,9))+[10]+list(range(19,25))+list(range(27,33))+list(range(63,84))
# Stable website IDs preserve task identity after the real-world PPT photos were reordered.
real_photo_sources = {63:65, 64:64, 65:66, 66:67, 67:63, 68:68}
assetmap={};inventory=[]
for n in photos:
    source_n = real_photo_sources.get(n,n)
    names=[p for p in z.namelist() if re.fullmatch(fr'ppt/media/image{source_n}\.(png|jpe?g)',p)]
    if not names:continue
    im=ImageOps.exif_transpose(Image.open(io.BytesIO(z.read(names[0])))).convert('RGB')
    im.thumbnail((1600,1400))
    path=f'assets/photo-{n}.webp';im.save(DIST/path,'WEBP',quality=89)
    assetmap[str(n)]=path
for slide in range(3,8):
    root=ET.fromstring(z.read(f'ppt/slides/slide{slide}.xml'))
    for element in root.iter():
        kind=element.tag.rsplit('}',1)[-1]
        if kind not in ('sp','cxnSp','pic'):continue
        ident=element.find('.//p:cNvPr',NS)
        if ident is None:continue
        inventory.append(dict(slide=slide,kind=kind,**ident.attrib,text=' '.join(t.text or '' for t in element.findall('.//a:t',NS))))
save('photos.json',assetmap);save('ppt-elements.json',inventory)

# Reconstruct individual matrix cells and bars from supplied chart bitmaps.
# Colors/heights are visual evidence, NOT recovered experimental measurements.
graphics={}
for num,n in [(13,20),(25,25),(26,25),(43,25)]:
    im=Image.open(io.BytesIO(z.read(f'ppt/media/image{num}.png'))).convert('RGB')
    # Figure 1's white alignment guides cross cell centers. Use the modal
    # interior color so these guides remain separate native SVG paths.
    if num == 13:
        colors=[]
        for r in range(n):
            row=[]
            for c in range(n):
                box=(int((c+.12)*im.width/n),int((r+.12)*im.height/n),int((c+.88)*im.width/n),int((r+.88)*im.height/n))
                row.append(Counter(im.crop(box).getdata()).most_common(1)[0][0])
            colors.append(row)
    else:
        colors=[[im.getpixel((int((c+.5)*im.width/n),int((r+.5)*im.height/n))) for c in range(n)] for r in range(n)]
    graphics[str(num)]=dict(kind='matrix',size=n,colors=colors)
for num,n in [(11,20),(51,25)]:
    im=Image.open(io.BytesIO(z.read(f'ppt/media/image{num}.png'))).convert('RGB')
    graphics[str(num)]=dict(kind='strip',colors=[im.getpixel((int((c+.5)*im.width/n),im.height//2)) for c in range(n)])
for num,n in [(12,20),(15,20),(16,20),(58,25),(59,25),(62,25)]:
    im=Image.open(io.BytesIO(z.read(f'ppt/media/image{num}.png'))).convert('RGBA');bars=[]
    for c in range(n):
        x=int((c+.5)*im.width/n)
        ys=[y for y in range(im.height) if im.getpixel((x,y))[3]>128]
        bars.append(dict(height=(max(ys)-min(ys)+1)/im.height if ys else 0,color=im.getpixel((x,ys[len(ys)//2]))[:3] if ys else (0,0,0)))
    graphics[str(num)]=dict(kind='bars',bars=bars)
save('graphics.json',graphics)
shutil.copy2(PAPER/'main.pdf',DIST/'assets/gtpo-paper.pdf')
save('abstract.json',{'html':tex((PAPER/'sections/abstract.tex').read_text())})
print(f'Prepared {len(tables)} tables, {len(charts)} chart groups, {len(assetmap)} photographs, {len(inventory)} PPT elements.')
