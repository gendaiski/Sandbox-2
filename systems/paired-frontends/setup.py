from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parent
xyops=root.parent/'xyops';altaflow=root.parent/'altaflow-recreation'
if not (xyops/'dist/index.html').is_file():
 subprocess.run([sys.executable,str(xyops/'setup.py')],check=True)
if not (altaflow/'dist/index.html').is_file():raise SystemExit('The adjacent altaflow-recreation package with dist files is required.')
subprocess.run([sys.executable,str(root/'build.py'),'--xyops',str(xyops/'dist'),'--altaflow',str(altaflow/'dist'),'--output',str(root/'dist/index.html')],check=True)
print('The self-contained dist/index.html contains both frontends. Serve it as a static file or open in a compatible browser.')
