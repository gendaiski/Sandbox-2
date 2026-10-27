// Write interactive/data/lobehub_models.json from LobeHub's model bank (providers and chat models).
//   bun interactive/data/extract_lobehub_models.ts "$PWD/vendor/lobehub"
// Each provider and model file is imported on its own: they import only types.
import { readdirSync, statSync } from 'node:fs';
const root = process.argv[2], bank = root + '/packages/model-bank/src';
const files = (dir: string) => readdirSync(dir).flatMap((f) => { const p = dir + '/' + f; return statSync(p).isDirectory() ? (f === '__tests__' ? [] : files(p)) : /\.ts$/.test(f) && !/test|index|typesafe/.test(f) ? [p] : []; });
const providers: any[] = [], models: any[] = [], types: Record<string, number> = {}, failed: string[] = [];
for (const f of files(bank + '/modelProviders')) {
  try { const p = (await import(f)).default; if (p?.id) providers.push({ id: p.id, name: p.name, desc: (p.description || '').slice(0, 220), url: p.url || '', sdk: p.settings?.sdkType || '' }); } catch (e) { failed.push(f.split('/').pop()!); }
}
const modelFiles = readdirSync(bank + '/aiModels').flatMap((f) => {
  const p = bank + '/aiModels/' + f;
  if (statSync(p).isDirectory()) return f === '__tests__' ? [] : [p + '/index.ts'];  // a provider folder: its index has every list
  return /\.ts$/.test(f) && !/test|^index|typesafe/.test(f) ? [p] : [];
});
const seen = new Set<string>();
for (const f of modelFiles) {
  const pid = f.split('/aiModels/')[1].split(/[/.]/)[0];
  try {
    const mod = await import(f);
    const list = (Array.isArray(mod.default) ? mod.default : Object.values(mod).filter(Array.isArray).flat()) as any[];
    for (const m of list) {
      if (!m?.id || seen.has(pid + m.id + (m.type || 'chat'))) continue;
      seen.add(pid + m.id + (m.type || 'chat')); const t = m.type || 'chat'; types[t] = (types[t] || 0) + 1;
      if (t !== 'chat') continue;
      models.push({ id: m.id, name: m.displayName || m.id, p: pid, ctx: m.contextWindowTokens || 0, out: m.maxOutput || 0, ab: Object.keys(m.abilities || {}).filter((k) => m.abilities[k]), d: (m.description || '').slice(0, 150), rel: m.releasedAt || '', en: !!m.enabled });
    }
  } catch (e) { failed.push(f.split('/').pop()!); }
}
const { createSystemRole } = await import(root + '/packages/builtin-agents/src/agents/inbox/systemRole.ts');  // the default Lobe agent
await Bun.write(root + '/../../interactive/data/lobehub_models.json', JSON.stringify({ providers, models, types, inboxRole: createSystemRole('en-US') }));
console.log(providers.length, 'providers', models.length, 'chat models', types, 'failed', failed);
