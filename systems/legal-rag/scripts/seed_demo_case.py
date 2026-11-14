"""Populate the running app with the fictional Northstar PDF and verify every index."""
import argparse
import json
import time
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:7860')
    args = parser.parse_args()
    base = args.url.rstrip('/')
    path = ROOT / 'ui/demo-case/ingestion.json'
    if path.exists():
        saved = json.loads(path.read_text())
        if saved.get('verified_complete'):
            ready = requests.get(base+'/ready', timeout=15)
            present = requests.get(base+'/debug/ingest/preview', params={'doc_id': saved['doc_id'], 'n': 1}, timeout=15)
            status = requests.get(base+'/ingest/status/'+saved['doc_id'], timeout=15)
            states = status.json() if status.ok else {'error': 'unavailable'}
            if ready.ok and ready.json().get('ready') and present.ok and (not states or all(states.get(k)=='done' for k in ('faiss','bm25','colbert','graph'))):
                print('Case is already populated and ready.')
                return
    packet = ROOT / 'ui/demo-case/Northstar-case-pack.pdf'
    with packet.open('rb') as f:
        response = requests.post(base+'/ingest/pdf', files={'file': (packet.name, f, 'application/pdf')}, timeout=90)
    response.raise_for_status()
    upload = response.json()
    marker = {'doc_id': upload['doc_id'], 'source': upload['source'], 'chunks': upload['num_chunks'], 'verified_complete': False}
    path = ROOT / 'ui/demo-case/ingestion.json'
    path.write_text(json.dumps(marker, indent=2)+'\n')
    for _ in range(240):
        response = requests.get(base+'/ingest/status/'+upload['doc_id'], timeout=15)
        response.raise_for_status()
        status = response.json()
        if status.get('error'):
            raise RuntimeError(status)
        if all(status.get(key)=='done' for key in ('faiss','bm25','colbert','graph')):
            marker['verified_complete'] = True
            marker['verified_utc'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            path.write_text(json.dumps(marker, indent=2)+'\n')
            print('Case indexed:', marker)
            return
        time.sleep(5)
    raise RuntimeError('Case indexing did not complete within 20 minutes.')

if __name__ == '__main__':
    main()
