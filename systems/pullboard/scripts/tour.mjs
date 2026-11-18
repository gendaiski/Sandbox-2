import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// The upstream tour creates a new throwaway repository; no model is invoked.
const home = mkdtempSync(join(tmpdir(), 'pullboard-demo-home-'));
const cli = fileURLToPath(new URL('../upstream/bin/pullboard.js', import.meta.url));
const result = spawnSync(process.execPath, [cli, 'tour'], {stdio:'inherit', env:{...process.env, PULLBOARD_HOME:home, PULLBOARD_MACHINE_HOME:join(home,'machine')}});
process.exit(result.status ?? 1);
