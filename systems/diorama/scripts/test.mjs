import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const three=fileURLToPath(import.meta.resolve('three'));
const files=[...readdirSync('verify').filter(f=>f.endsWith('.mjs')).map(f=>'verify/'+f),...readdirSync('verify/stroked-toon').filter(f=>f.endsWith('.mjs')).map(f=>'verify/stroked-toon/'+f),'templates/qa/inspection.test.mjs','templates/qa/mechanism-contract.test.mjs'];
const env={...process.env,THREE_MODULE:three,THREE_MODULE_PATH:three};
for(const args of [['--test',...files],['verify/climb/test.mjs']]){const p=spawnSync(process.execPath,args,{env,stdio:'inherit'});if(p.status)process.exit(p.status)}
