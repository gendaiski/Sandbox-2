// Write interactive/data/continue_fim.json: the autocomplete prompt Continue builds for each model family,
// rendered by its own getTemplateForModel with <<PREFIX>> and <<SUFFIX>> placeholders.
//   bun interactive/data/extract_continue_fim.ts "$PWD/vendor/continue"
const root = process.argv[2];
const m = await import(root + '/core/autocomplete/templating/AutocompleteTemplate.ts');
const models = ['claude-sonnet-5', 'codestral-latest', 'qwen2.5-coder:1.5b', 'deepseek-coder-v2', 'codellama:7b-code', 'codegemma:2b', 'starcoder2:3b', 'seed-coder-8b', 'granite4', 'mercury-coder', 'codegeex4', 'gpt-5'];
const PRE = '<<PREFIX>>', SUF = '<<SUFFIX>>';
const out: any = {};
for (const name of models) {
  const t = m.getTemplateForModel(name);
  let rendered: any;
  if (typeof t.template === 'string') rendered = { kind: 'mustache', text: t.template };
  else { try { rendered = { kind: 'function', text: t.template(PRE, SUF, 'file:///workspace/src/renewals.py', 'renewals', 'python', [], []) }; } catch (e) { rendered = { kind: 'function', error: String(e) }; } }
  out[name] = { ...rendered, stop: t.completionOptions?.stop || [] };
}
await Bun.write(root + '/../../interactive/data/continue_fim.json', JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log('==', k, (v as any).kind, JSON.stringify((v as any).text || (v as any).error).slice(0, 220));
