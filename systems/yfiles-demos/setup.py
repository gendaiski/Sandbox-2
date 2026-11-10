#!/usr/bin/env python3
"""Read-only preflight for a separately licensed complete yFiles distribution.

Does not download a commercial library, create a license, install packages,
copy restricted demo files, or start services. No secrets are read or printed.
"""
import argparse,json,sys
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--distribution',type=Path,help='Path to a complete legitimately obtained yFiles for HTML distribution')
args=parser.parse_args()
links={'gallery':'https://yfiles.com/demos/','playground':'https://yfiles.com/play','evaluation':'https://www.yworks.com/products/yfiles-for-html/evaluate'}
if not args.distribution:
 print(json.dumps({'status':'blocked','reason':'The public Git clone does not include the commercial runtime or license. No installation was attempted.','original_links':links},indent=2))
 sys.exit(2)
root=args.distribution.resolve();manifest=root/'package.json';demo=root/'demos/package.json'
checks={'root_package_json':manifest.is_file(),'demos_package_json':demo.is_file(),'license_file_exists_not_read':(root/'lib/license.json').is_file()}
metadata={}
if manifest.is_file():
 try:
  package=json.loads(manifest.read_text());metadata={'package_version':package.get('version'),'engines':package.get('engines'),'start_script_present':bool(package.get('scripts',{}).get('start'))};checks['complete_distribution_start_script']=metadata['start_script_present'];checks['expected_version']=package.get('version')=='31.0.4'
 except (OSError,ValueError):checks['valid_root_manifest']=False
else:checks['complete_distribution_start_script']=False
runtime_locations=[root/'node_modules/@yfiles/yfiles/package.json',root/'lib/package.json',root/'lib/yfiles/package.json']
checks['runtime_package_present']=any(p.is_file() for p in runtime_locations)
status='ready_for_owner_review' if all(checks.values()) else 'blocked'
print(json.dumps({'status':status,'checks':checks,'metadata':metadata,'license_validated':False,'note':'A file existing does not establish license validity or redistribution rights. Use the official distribution instructions after reviewing its license. This preflight never executes npm/start.','original_links':links},indent=2))
sys.exit(0 if status=='ready_for_owner_review' else 2)
