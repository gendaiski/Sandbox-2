"""Publish the catalogue and a portable Docker launcher without repackaging upstream assets."""
from pathlib import Path
import shutil,zipfile,json
root=Path(__file__).parent;dist=root/'dist'
if dist.exists():shutil.rmtree(dist)
shutil.copytree(root/'web',dist)
(dist/'downloads').mkdir(exist_ok=True)
with zipfile.ZipFile(dist/'downloads/osgearth-installation.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['Dockerfile','compose.yaml','README.md','Start-Windows.ps1','Start-Mac.command','LICENSE.txt']:
  p=root/name
  if p.is_file():z.write(p,'osgearth-library/'+name)
 for folder in ['runtime','web','verification','hosting']:
  for p in (root/folder).rglob('*'):
   if p.is_file() and 'artwork' not in p.relative_to(root).parts and '__pycache__' not in p.parts:
    name='osgearth-library/'+p.relative_to(root).as_posix()
    if p.name=='runtime-config.js':z.writestr(name,"window.OSGEARTH_RUNTIME = '';\n")
    else:z.write(p,name)
# Portable HTML includes navigation, styles and the entire catalogue. Linked media and
# the native remote renderer still require their hosted resources or the Docker package.
html=(dist/'index.html').read_text()
html=html.replace('<head>','<head><base href="https://osgearth-library-gendaiski.vercel.app/">',1)
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(dist/'style.css').read_text()+'</style>')
data=[json.loads((dist/name).read_text()) for name in ['catalog.json','reference.json','native-scenes.json','installation.json']]
encoded=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
html=html.replace('<script src="runtime-config.js"></script>','<script>'+(dist/'runtime-config.js').read_text()+'window.OSGEARTH_DATA='+encoded+';</script>')
js=(dist/'app.js').read_text().replace('</script','<\\/script')
html=html.replace('<script type="module" src="app.js"></script>','<script type="module">'+js+'</script>')
(dist/'osgearth-library.html').write_text(html)
(dist/'downloads/osgearth-library.html').write_text(html)
print('Published complete osgEarth library and installation ZIP.')
