from pathlib import Path
import json,shutil,re
r=Path(__file__).parent;site=Path('/workspace/sites/xyops-original');d=site/'dist'
if d.exists():shutil.rmtree(d)
shutil.copytree(r/'htdocs',d,symlinks=False)
for p in d.rglob('*.gz'):p.unlink()
# Only public UI config, never server credentials or TLS keys.
c=json.loads((r/'sample_conf/config.json').read_text());ui=json.loads((r/'internal/ui.json').read_text());intl=json.loads((r/'internal/intl.json').read_text())
cfg=c['client'].copy()
for key in ['quick_monitors','default_user_privileges','default_user_prefs','job_universal_limits','job_universal_actions','log_columns']:
 cfg[key]=c.get(key)
cfg.update(ui=ui,intl=intl,hostname_display_strip='(?!)',ip_display_strip='(?!)',free_accounts=False,email_from='',tz='UTC',https_port=443,base_app_url='',debug=False,systems=[{'id':'hourly','epoch_div':60,'date_format':'[yyyy]/[mm]/[dd]/[hh]','single_only':True},{'id':'daily','epoch_div':120,'date_format':'[yyyy]/[mm]/[dd]'},{'id':'monthly','epoch_div':3600,'date_format':'[yyyy]/[mm]'},{'id':'yearly','epoch_div':43200,'date_format':'[yyyy]'}])
(d/'preview-config.json').write_text(json.dumps(cfg))
safe=c.copy();safe['secret_key']='';safe['preview_mode']=True;safe['notice']='Public sample configuration only; backend is offline.'
(d/'sample-preview.json').write_text(json.dumps(safe))
setup=json.loads((r/'internal/setup.json').read_text());lists={}
for x in setup['storage']:
 if x[0]=='listPush' and x[1].startswith('global/'):
  key=x[1].split('/')[1]
  if key not in ['users','api_keys','secrets','events']:lists.setdefault(key,[]).append(x[2])
(d/'preview-defaults.json').write_text(json.dumps(lists))
shutil.copytree(r/'docs',d/'docs',dirs_exist_ok=True);shutil.copy(r/'LICENSE.md',d/'LICENSE.md')
html=(d/'index.html').read_text();html=html.replace('<script src="/api/app/config"></script>','<script src="/preview.js"></script>');html=html.replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="connect-src \'self\' blob: data:; form-action \'self\';">');(d/'index.html').write_text(html)
shutil.copy(r/'preview.js',d/'preview.js');print('Built original UI static preview')
