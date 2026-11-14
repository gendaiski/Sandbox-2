"""Serve the original osgEarth viewer through a bounded, allowlisted browser launcher."""
import http.server,json,os,pathlib,select,shutil,socket,subprocess,threading,time,urllib.parse
ROOT=pathlib.Path('/app/web');SOURCE=pathlib.Path('/opt/osgearth/source');LOCK=threading.RLock()
CAT=json.loads((ROOT/'catalog.json').read_text());SAMPLES={s['id']:s for s in CAT['samples']};ASSETS={a['id']:a for a in CAT['assets'] if a['category']=='3D models'}
PROCESS=None;CURRENT=None;STARTED=None;LOG=pathlib.Path('/tmp/osgearth-viewer.log')

def launch(sample=None,asset=None):
    """Replace only this launcher's viewer with one exact, inventoried upstream example."""
    global PROCESS,CURRENT,STARTED
    if asset is not None:
        if asset not in ASSETS:raise ValueError('Unknown model')
        item=ASSETS[asset];command=['osgearth_viewer',str(SOURCE/item['path']),'--light','--window','0','0','1280','800'];selection=asset
    else:
        if sample not in SAMPLES:raise ValueError('Unknown sample')
        item=SAMPLES[sample];scene=SOURCE/item['path']
        if sample=='mbtiles':
            # Upstream's bundled SQLite database uses WAL mode. Read-only bind mounts
            # cannot create its sidecar files, so launch an exact writable copy.
            staging=pathlib.Path('/tmp/osgearth-sqlite-example')
            (staging/'tests').mkdir(parents=True,exist_ok=True);(staging/'data').mkdir(exist_ok=True)
            shutil.copyfile(scene,staging/'tests/mbtiles.earth')
            db=staging/'data/world_countries.mbtiles'
            if not db.exists():shutil.copyfile(SOURCE/'data/world_countries.mbtiles',db)
            scene=staging/'tests/mbtiles.earth'
        if sample=='readymap_template':scene=pathlib.Path(str(scene)+'.template')
        program={'skyview1':'osgearth_skyview','skyview2':'osgearth_skyview','feature_custom_filters':'osgearth_featurefilter'}.get(sample,'osgearth_imgui')
        command=[program,str(scene),'--window','0','0','1280','800']
        if sample=='day_night':command.append('--sky')
        selection=sample
    with LOCK:
        if PROCESS and PROCESS.poll() is None:
            PROCESS.terminate()
            try:PROCESS.wait(timeout=4)
            except subprocess.TimeoutExpired:PROCESS.kill();PROCESS.wait()
        with LOG.open('wb') as log:
            PROCESS=subprocess.Popen(command,cwd=SOURCE/'tests',stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
        CURRENT=selection;STARTED=time.time()
    return status()

def status():
    """Return nonsecret process state and installed binary names for the public library."""
    with LOCK:
        return dict(online=True,current=CURRENT,running=PROCESS is not None and PROCESS.poll() is None,exitCode=PROCESS.poll() if PROCESS else None,started=STARTED,viewer='Original osgEarth ImGui',revision=CAT['revision'],samples=len(SAMPLES),binaries=sorted(p.name for p in pathlib.Path('/opt/osgearth/install/bin').glob('osgearth*')),mode='Shared temporary evaluation session',requirements='API-key examples and separately licensed SDKs require their own setup.')

class Handler(http.server.SimpleHTTPRequestHandler):
    """Static library, safe launch API and a WebSocket relay to the local noVNC service."""
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def translate_path(self,path):
        """Serve original artwork directly from the pinned, read-only data folder."""
        clean=urllib.parse.unquote(urllib.parse.urlsplit(path).path)
        if clean.startswith('/artwork/'):
            base=(SOURCE/'data').resolve();target=(base/clean.removeprefix('/artwork/')).resolve()
            if target.is_relative_to(base):return str(target)
            return str(ROOT/'__not_found__')
        return super().translate_path(path)
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        super().end_headers()
    def send_json(self,data,code=200):
        """Write a JSON response without leaking paths or environment secrets."""
        b=json.dumps(data).encode();self.send_response(code);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(b)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(b)
    def do_OPTIONS(self):self.send_response(204);self.end_headers()
    def do_POST(self):
        if self.path!='/api/launch':return self.send_json({'error':'Not found'},404)
        try:
            n=int(self.headers.get('Content-Length','0'))
            if n<1 or n>4096:return self.send_json({'error':'Invalid request'},400)
            body=json.loads(self.rfile.read(n))
            if not isinstance(body,dict):raise ValueError('JSON object required')
            self.send_json(launch(body.get('sample'),body.get('asset')))
        except OSError:self.send_json({'error':'The native viewer could not start. Check the installation and runtime logs.'},503)
        except (ValueError,TypeError,json.JSONDecodeError):self.send_json({'error':'Choose a sample from the library'},400)
    def do_GET(self):
        path=urllib.parse.urlsplit(self.path).path
        if path=='/api/status':return self.send_json(status())
        if path=='/api/logs':return self.send_json({'sample':CURRENT,'log':LOG.read_text(errors='replace')[-24000:] if LOG.exists() else ''})
        if path=='/websockify':return self.relay()
        return super().do_GET()
    def relay(self):
        """Forward the browser's RFB WebSocket only to the isolated local display proxy."""
        self.close_connection=True
        try:
            with socket.create_connection(('127.0.0.1',6080),timeout=10) as upstream:
                request='GET /websockify HTTP/1.1\r\n'+''.join(f'{k}: {v}\r\n' for k,v in self.headers.items())+'\r\n'
                upstream.sendall(request.encode());upstream.settimeout(None)
                while True:
                    ready,_,_=select.select([self.connection,upstream],[],[],300)
                    if not ready:break
                    for source in ready:
                        data=source.recv(65536)
                        if not data:return
                        (upstream if source is self.connection else self.connection).sendall(data)
        except (OSError,ConnectionError):pass

if __name__=='__main__':
    launch('simple')
    http.server.ThreadingHTTPServer(('0.0.0.0',8080),Handler).serve_forever()
