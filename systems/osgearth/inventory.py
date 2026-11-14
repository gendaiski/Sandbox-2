"""Inventory every shipped sample, application and data asset without modifying upstream."""
import hashlib,json,re,sys
from PIL import Image,ImageOps
from pathlib import Path
root=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/osgearth-upstream')
out=Path(__file__).parent/'web';sha='16de96a16b10bce7f2167897826998060edc49f0'
raw=f'https://raw.githubusercontent.com/pelicanmapping/osgearth/{sha}/'
def category(name,text):
 if any(x in name for x in ['prestige','procedural','splat','vegetation','slughorn','biome']):return 'Procedural & advanced rendering'
 if any(x in name for x in ['boston','feature','extrusion','bridges','buildings','model','overlay','kml']):return 'Cities, features & 3D models'
 if any(x in name for x in ['annotation','label','graticule','mgrs','text','place']):return 'Labels & annotations'
 if any(x in name for x in ['sky','day_night','ocean','triton','silverlining','lighting','shadow','moon']):return 'Atmosphere, lighting & ocean'
 if any(x in name for x in ['utm','project','state_plane','flat','plate_carree','srs','datum']):return 'Projections & coordinates'
 if any(x in name for x in ['debug','error','test','sse','constraint','tessellat']):return 'Diagnostics & rendering tests'
 if any(x in name for x in ['elevation','terrain','contour','mount','surface','flatten','decal']):return 'Terrain & elevation'
 return 'Maps & imagery providers'
def resolved_text(path,seen=None):
 seen=set() if seen is None else seen
 if path in seen or not path.is_file():return ''
 seen.add(path); text=path.read_text(errors='replace')
 for ref in re.findall(r'<xi:include[^>]+href=["\']([^"\']+)',text)+re.findall(r'\{%\s*include\s+([^\s%]+)\s*%\}',text):
  if not ref.startswith(('http:','https:')):text+='\n'+resolved_text((path.parent/ref).resolve(),seen)
 return text
samples=[]
for p in sorted((root/'tests').glob('*.earth')):
 text=p.read_text(errors='replace');full=resolved_text(p);name=p.stem
 title=re.search(r'<(?:map|Map)\b[^>]*\bname=["\']([^"\']+)',text)
 comments=re.findall(r'<!--(.*?)-->',text,re.S)
 desc=re.sub(r'\s+',' ',' '.join(comments)).strip()[:650]
 urls=sorted(set(re.findall(r'https?://[^\s<>"\']+',full)))
 flags=[]
 if re.search(r'YOUR(?:[_ -](?:API|ACCESS|TOKEN|KEY))|YOURKEY|API_KEY|access_token|subscription.key|api_key|\$\{',full,re.I):flags.append('Provider credentials or environment settings')
 if any(x in name for x in ['triton','silverlining']):flags.append('Separate commercial SDK required')
 if 'cesium' in name:flags.append('Optional Cesium Native nodekit and provider access')
 if 'slughorn' in name:flags.append('Optional Slughorn dependency')
 if urls:flags.append('Online data source (including inherited layers)')
 local_paths=sorted(set(re.findall(r'[A-Z]:[/\\][^<>\n"\']+',text)))
 if local_paths:flags.append('Developer-specific local data paths are not bundled: '+', '.join(local_paths))
 if name=='readymap_template':flags.append('Template pseudoloader: launcher appends .template as documented upstream')
 if name=='errors':flags.append('Intentional error-handling test; not a finished scene')
 missing=[]
 for ref in re.findall(r'(?:<(?:url|filename)>\s*|(?:url|href)=["\'])(\.\./data/[^<"\'\s]+)',text):
  base=re.sub(r'(\.(?:osg|osgb|osgt|ive))\..*',r'\1',ref)
  if not (p.parent/base).exists():missing.append(ref)
 if missing:flags.append('Some referenced data is not shipped')
 samples.append(dict(id=name,title=title.group(1) if title else name.replace('_',' ').title(),path=str(p.relative_to(root)),category=category(name,text),description=desc or 'Original osgEarth example configuration.',source=text,urls=urls,requirements=flags,missing=missing,availability='Requires setup' if any('Developer-specific' in f or 'SDK' in f or 'credentials' in f or 'Slughorn' in f or 'Cesium' in f for f in flags) else 'Online data' if urls else 'Bundled data'))
assets=[]
for p in sorted((root/'data').rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(root).as_posix();ext=p.suffix.lower();kind='Textures & artwork' if ext in ['.jpg','.jpeg','.png','.gif','.tga','.dds'] else '3D models' if ext in ['.osg','.osgb','.osgt','.ive','.flt','.obj','.gltf','.glb'] else 'Maps & GIS data' if ext in ['.tif','.tiff','.shp','.shx','.dbf','.prj','.gpkg','.mbtiles','.pmtiles','.geojson','.kmz','.kml'] else 'Supporting resources'
 a=dict(id=rel,title=p.name,path=rel,category=kind,bytes=p.stat().st_size,url=raw+rel)
 if ext in ['.jpg','.jpeg','.png','.gif']:
  # Public gallery uses exact original bytes, without generating replacement artwork.
  dst=out/'artwork'/p.relative_to(root/'data');dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(p.read_bytes());a['preview']='artwork/'+p.relative_to(root/'data').as_posix()
 if ext in ['.dds','.tga','.tif','.tiff']:
  try:
   with Image.open(p) as image:
    image.thumbnail((640,640)); image=image.convert('RGBA' if image.mode=='RGBA' else 'RGB')
    relative='converted/'+p.relative_to(root/'data').as_posix()+'.png';dest=out/relative;dest.parent.mkdir(parents=True,exist_ok=True);image.save(dest)
    a['preview']=relative;a['previewNote']='PNG preview decoded from the original '+ext.upper()+' file; original download is unchanged.'
  except Exception as error:a['previewNote']='Native image preview needs its original decoder: '+str(error)
 assets.append(a)
apps=[]
for d in sorted((root/'src/applications').iterdir()):
 if d.is_dir():
  files=[str(p.relative_to(root)) for p in d.rglob('*') if p.is_file()]
  apps.append(dict(id=d.name,title=d.name,files=files,url=f'https://github.com/pelicanmapping/osgearth/tree/{sha}/src/applications/{d.name}'))
files=[dict(path=p.relative_to(root).as_posix(),bytes=p.stat().st_size) for p in root.rglob('*') if p.is_file() and '.git' not in p.parts]
result=dict(upstream='pelicanmapping/osgearth',revision=sha,samples=samples,assets=assets,applications=apps,files=files)
(out/'catalog.json').write_text(json.dumps(result,ensure_ascii=False))
(out/'LICENSE.txt').write_bytes((root/'LICENSE.txt').read_bytes())
print(json.dumps({k:len(result[k]) for k in ['samples','assets','applications','files']}))
