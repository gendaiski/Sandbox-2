import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPlanningWorkspace } from '../vendor/src/core/workspace.js';
import { initProject, addTemplate } from '../vendor/src/core/generator.js';
import { generateHandoff } from '../vendor/src/core/handoff.js';
import { scoreProject } from '../vendor/src/core/scorer.js';
import { doctorProject } from '../vendor/src/core/doctor.js';
import { PROJECT_TYPES } from '../vendor/src/data/project-types.js';
import { normalizeContext } from '../vendor/src/core/context.js';
import { TEMPLATE_FILES } from '../vendor/src/data/templates.js';

export class InputError extends Error {}
const fields = ['projectName','projectType','rawIdea','problem','targetUsers','mvpFeatures','outOfScope','techPreferences','aiBuildMode','deadline'];
export function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InputError('Provide a project.');
  if (Buffer.byteLength(JSON.stringify(input)) > 600000) throw new InputError('This workspace is too large (600 KB maximum).');
  if (!['generate','analyze','add','handoff'].includes(input.action)) throw new InputError('Unknown action.');
  if (!input.context || typeof input.context !== 'object' || Array.isArray(input.context)) throw new InputError('Project context is required.');
  const raw={};
  for (const key of fields) {
    if (input.context[key] != null && typeof input.context[key] !== 'string') throw new InputError('Context values must be text.');
    raw[key]=(input.context[key] || '').trim();
    if (raw[key].length > 12000) throw new InputError('Please shorten '+key+'.');
  }
  if (!Object.hasOwn(PROJECT_TYPES,raw.projectType)) throw new InputError('Select a supported project type.');
  if (!raw.projectName || raw.projectName.length>140) throw new InputError('Enter a project name (up to 140 characters).');
  if(input.action==='generate' && input.mode!=='quick' && !raw.rawIdea) throw new InputError('Describe your project idea.');
  if(input.action==='add' && (typeof input.template!=='string' || !Object.hasOwn(TEMPLATE_FILES,input.template))) throw new InputError('Choose a supported template.');
  if(input.action!=='generate') {
    if(!input.files || typeof input.files!=='object' || Array.isArray(input.files) || Object.keys(input.files).length>80) throw new InputError('Invalid workspace files.');
    for(const [path,value] of Object.entries(input.files)) {
      if(!/^(AGENTS\.md|docs\/[a-zA-Z0-9_-]+\.md|\.beforecoderc\.json)$/.test(path)) throw new InputError('Invalid document path.');
      if(typeof value!=='string' || value.length>80000) throw new InputError('Invalid document content.');
    }
  }
  return normalizeContext(raw);
}
export async function work(input) {
  const context=validate(input);
  const cwd=await mkdtemp(join(tmpdir(),'beforecode-web-'));
  const options={cwd,projectName:context.projectName,projectType:context.projectType,docsPath:'docs',force:false,dryRun:false};
  try {
    if(input.action==='generate') {
      if(input.mode==='quick') await initProject(options);
      else await createPlanningWorkspace({...options,context});
      await generateHandoff(options);
    } else {
      await mkdir(join(cwd,'docs'));
      for(const [path,content] of Object.entries(input.files)) {
        if(path!=='.beforecoderc.json') await writeFile(join(cwd,path),content);
      }
      // Rebuild only server-controlled configuration; never trust uploaded paths.
      const supplied=Object.keys(input.files).filter(p=>p.startsWith('docs/')).map(p=>p.slice(5));
      await writeFile(join(cwd,'.beforecoderc.json'),JSON.stringify({projectName:context.projectName,projectType:context.projectType,docsPath:'docs',createdBy:'beforecode',version:'0.2.0',documents:supplied},null,2)+'\n');
      if(input.action==='add') await addTemplate({...options,templateName:input.template});
      if(input.action==='handoff') await generateHandoff(options);
    }
    const score=await scoreProject(options), doctor=await doctorProject(options);
    // Do not return temporary server paths.
    for(const doc of [...doctor.foundDocs,...doctor.weakDocs]) delete doc.path;
    const files={};
    for(const name of (await readdir(cwd)).sort()) {
      if(name==='docs') {
        for(const file of (await readdir(join(cwd,'docs'))).sort()) files['docs/'+file]=await readFile(join(cwd,'docs',file),'utf8');
      } else files[name]=await readFile(join(cwd,name),'utf8');
    }
    return {files,score,doctor,engine:{name:'BeforeCode',version:'0.2.0',revision:'8c2fe6d3c9f120c213c7010422d68327e17be7f4'}};
  } finally { await rm(cwd,{recursive:true,force:true}); }
}
