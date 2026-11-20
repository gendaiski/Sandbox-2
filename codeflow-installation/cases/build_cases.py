from pathlib import Path
import json,zipfile
root=Path(__file__).parent
cases=[{'id':'legal-intake','title':'Legal intake app','description':'Explore a small TypeScript legal intake application. Follow the path from the form through validation and services to the repository.','steps':['Select src/services/intake.ts to inspect callers and dependencies.','Switch Graph to Code or Block Diagram to inspect the same analysis.','Open Security, Patterns and Suggestions; export a JSON or Markdown report.'],'files':{
'src/main.ts':'''import { IntakePage } from './pages/IntakePage';
import { createIntake } from './services/intake';
export async function main() {
  const input = IntakePage();
  return createIntake(input);
}
main();
''',
'src/pages/IntakePage.ts':'''import { IntakeForm } from '../components/IntakeForm';
import { useIntake } from '../hooks/useIntake';
export function IntakePage() {
  const state = useIntake();
  return IntakeForm(state);
}
''',
'src/components/IntakeForm.ts':'''import { formatName } from '../utils/format';
export function IntakeForm(state) {
  return { client: formatName(state.client), jurisdiction: 'EG', matter: 'Contract review' };
}
''',
'src/hooks/useIntake.ts':'''export function useIntake() {
  return { client: 'Example Client', status: 'draft' };
}
''',
'src/services/intake.ts':'''import { validateIntake } from '../utils/validation';
import { saveMatter } from '../repositories/matters';
import { publish } from './events';
export async function createIntake(input) {
  const validated = validateIntake(input);
  const matter = await saveMatter(validated);
  publish('matter.created', matter);
  return matter;
}
''',
'src/services/events.ts':'''const listeners = new Map();
export function subscribe(event, handler) {
  listeners.set(event, [...(listeners.get(event) || []), handler]);
}
export function publish(event, data) {
  for (const handler of listeners.get(event) || []) handler(data);
}
''',
'src/repositories/matters.ts':'''import { database } from '../data/database';
export async function saveMatter(input) {
  return database.insert(input);
}
export function findMatter(id) {
  return database.get(id);
}
''',
'src/data/database.ts':'''const matters = new Map();
export const database = {
  insert(input) { const matter = { ...input, id: String(matters.size + 1) }; matters.set(matter.id, matter); return matter; },
  get(id) { return matters.get(id); }
};
''',
'src/utils/validation.ts':'''export function validateIntake(input) {
  if (!input.client || !input.jurisdiction) throw new Error('Client and jurisdiction required');
  return input;
}
''',
'src/utils/format.ts':'''export function formatName(value) {
  return String(value).trim().replace(/\\s+/g, ' ');
}
''',
'README.md':'# Legal intake architecture case\nFictional teaching code for CodeFlow analysis. Data remains in memory; this is not a live legal service. The analyzer computes dependencies from these actual source files.\n'
}},
{'id':'security-review','title':'Security & blast radius','description':'Analyze intentionally problematic JavaScript. The scanner should find real patterns in the supplied source; these examples are never executed.','steps':['Open the Security tab and inspect the eval and debug-statement findings.','Select src/utils/filters.js to explore which callers are affected by a change.','Download a safe debug-removal patch where offered, then export the report.'],'files':{
'src/main.js':'''import { search } from './api/search.js';
import { render } from './ui/render.js';
export function start(query) { return render(search(query)); }
''',
'src/api/search.js':'''import { settings } from '../config/settings.js';
import { findRecords } from '../data/records.js';
import { compileFilter } from '../utils/filters.js';
export function search(query) {
  console.log('Debug search request', query);
  const filter = compileFilter(query);
  return findRecords(settings.limit).filter(filter);
}
''',
'src/utils/filters.js':'''// Intentionally unsafe sample for static analysis only. Never execute user input.
export function compileFilter(expression) {
  return eval(expression);
}
export function unusedLegacyFilter(items) {
  return items.filter(Boolean);
}
''',
'src/data/records.js':'''import { settings } from '../config/settings.js';
export function findRecords(limit) {
  return [{ id: 'demo-1', title: 'Fictional document', mode: settings.mode }].slice(0, limit);
}
''',
'src/config/settings.js':'''export const settings = { limit: 20, mode: 'training' };
''',
'src/ui/render.js':'''export function render(records) {
  debugger;
  console.info('Rendering records');
  return records.map(record => record.title).join('\\n');
}
''',
'README.md':'# Security review training case\nIntentionally unsafe eval and debug statements. Source is parsed as text only; do not execute this example. No real credentials, personal data, commit history or vulnerabilities in an external repository are claimed. Findings come from the original CodeFlow analyzer.\n'
}},
{'id':'knowledge-vault','title':'Connected knowledge vault','description':'Explore a linked research vault. Markdown and wiki-link references become real graph edges, with no code execution or external service.','steps':['Select Home.md to inspect its connected notes.','Switch to 3D Graph, Tree, Bundle or Matrix to explore the same relationships.','Use search to find Contract review and export the graph as SVG or PDF.'],'files':{
'Home.md':'# Legal engineering notebook\nStart with [[Workflows/Intake]], [[Research/Egypt]], and [[Research/United Kingdom]].\nSee [Risk register](./Risk%20register.md).\n',
'Workflows/Intake.md':'# Intake\nCollect a fictional client brief, then use [[Contract review]] and [[Risk register]].\n',
'Workflows/Contract review.md':'# Contract review\nReview the source in [[Research/Egypt]] and record [[Decisions/Approval]].\n',
'Research/Egypt.md':'# Egypt research\nThis is a fictional notebook, not legal advice. See [[Sources]] and [[Contract review]].\n',
'Research/United Kingdom.md':'# United Kingdom research\nCompare [[Sources]] and [[Research/Egypt]].\n',
'Research/Sources.md':'# Sources\nMaintain provenance and current dates. Return to [[Home]].\n',
'Decisions/Approval.md':'# Approval\nRecord a reviewer decision after [[Workflows/Contract review]]. See [[Risk register]].\n',
'Risk register.md':'# Risk register\nTrack incomplete facts and missing evidence. Revisit [[Workflows/Intake]].\n'
}}]
for case in cases:
 d=root/case['id'];d.mkdir(exist_ok=True)
 for name,content in case['files'].items():
  p=d/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content)
 with zipfile.ZipFile(root/(case['id']+'.zip'),'w',zipfile.ZIP_DEFLATED) as z:
  for name,content in case['files'].items():z.writestr(case['id']+'/'+name,content)
(root/'cases.js').write_text('// Authored example sources; analyzed locally by the unchanged original pipeline.\nwindow.CODEFLOW_CASES = '+json.dumps(cases,ensure_ascii=False)+';\n')
