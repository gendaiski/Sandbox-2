// Device-local workbook drafts only. Cloud/lakehouse/sharing/AI remain disabled.
const KEY='agentswarms.frontend-workbooks.v1';
const limits={maxCells:100000,pageRows:100,maxImportSheets:20,exportMaxRows:10000,aiFillMaxRows:0};
const now=()=>new Date().toISOString();
const makeTab=(id:string,name:string,grid:any={cells:{}},position=0)=>({id:crypto.randomUUID(),workbook_id:id,name,kind:'grid',position,grid,table_config:null,version:1,updated_at:now()});
const NAME_RE = /^[^\\/?*[\]:']{1,100}$/;
export function sheetNameProblem(name:string):string|null{
 const n=name.trim();if(!n)return 'A sheet needs a name';if(!NAME_RE.test(n))return 'Invalid sheet name';if(/^[A-Za-z]{1,3}\d+$/.test(n))return 'A sheet name cannot be a cell address';if(/^(true|false)$/i.test(n))return 'Reserved sheet name';return null;
}
export function localSheets(name:string,data:any):any|undefined{
 if(!name.startsWith('sheets'))return undefined;
 const supported=['sheetsList','sheetsCreate','sheetsGet','sheetsUpdateWorkbook','sheetsDelete','sheetsAddTab','sheetsRenameTab','sheetsDeleteTab','sheetsReorderTabs','sheetsSetPreview','sheetsBackfillPreviews','sheetsSaveGrid','sheetsImportGrids','sheetsSetNames'];
 if(!supported.includes(name))return undefined;
 let books:any[]=JSON.parse(localStorage.getItem(KEY)||'[]');const save=()=>localStorage.setItem(KEY,JSON.stringify(books));
 const wb=books.find(w=>w.id===(data.id||data.workbook_id))||books.find(w=>w.tabs.some((t:any)=>t.id===data.tab_id));
 const fail=(error:string)=>({ok:false,error});
 if(name==='sheetsList')return {ok:true,limits,workbooks:books.map(w=>({...w,sheet_count:w.tabs.length,sheets:w.tabs.map((t:any)=>({name:t.name,kind:t.kind})),role:'owner',owner:null}))};
 if(name==='sheetsCreate'){const id=crypto.randomUUID();books.push({id,name:data.name,description:data.description||null,created_at:now(),updated_at:now(),names:[],preview:null,tabs:[makeTab(id,'Sheet1')]});save();return {ok:true,id}}
 if(name==='sheetsImportGrids'){
  if(!Array.isArray(data.sheets)||!data.sheets.length)return fail('No sheets to import');
  if(data.sheets.length>limits.maxImportSheets)return fail('Too many sheets for this local preview');
  const problem=data.sheets.map((s:any)=>sheetNameProblem(s.name)).find(Boolean);if(problem)return fail(problem);
  let target=wb;if(!target){const id=crypto.randomUUID();target={id,name:data.name||'Imported workbook',description:null,created_at:now(),updated_at:now(),names:data.names||[],preview:null,tabs:[]};books.push(target)}
  const tabs=data.sheets.map((s:any,i:number)=>makeTab(target.id,s.name,s.grid,target.tabs.length+i));target.tabs.push(...tabs);save();return {ok:true,workbook_id:target.id,tabs};
 }
 if(name==='sheetsBackfillPreviews')return {ok:true,previews:{}};
 if(!wb)return {ok:false,missing:true,error:'This workbook is not saved in this browser.'};
 if(name==='sheetsGet')return {ok:true,workbook:wb,tabs:wb.tabs,names:wb.names,limits,access:{role:'owner',viewing_as:null,viewing_as_label:null,owner:null,filtered:[],hidden:0}};
 if(name==='sheetsUpdateWorkbook'){if(data.name!==undefined)wb.name=data.name;if(data.description!==undefined)wb.description=data.description;wb.updated_at=now()}
 if(name==='sheetsDelete')books=books.filter(w=>w.id!==wb.id);
 if(name==='sheetsSetPreview')wb.preview=data.preview;
 if(name==='sheetsSetNames')wb.names=data.names;
 if(name==='sheetsAddTab'){const problem=sheetNameProblem(data.name);if(problem)return fail(problem);if(wb.tabs.some((t:any)=>t.name.toLowerCase()===data.name.toLowerCase()))return fail('That sheet name is already used');const tab=makeTab(wb.id,data.name,{cells:{}},wb.tabs.length);wb.tabs.push(tab);save();return {ok:true,tab}}
 const tab=wb.tabs.find((t:any)=>t.id===data.tab_id);
 if(name==='sheetsSaveGrid'){
  if(!tab)return fail('Sheet not found');if(tab.version!==data.base_version)return {ok:false,conflict:true,version:tab.version,error:'The local draft changed. Reload before saving.'};
  if(Object.keys(data.grid.cells||{}).length>limits.maxCells)return fail('Local preview cell limit exceeded');tab.grid=data.grid;tab.version++;wb.updated_at=now();save();return {ok:true,version:tab.version};
 }
 if(name==='sheetsRenameTab'){const problem=sheetNameProblem(data.name);if(problem)return fail(problem);if(!tab)return fail('Sheet not found');tab.name=data.name}
 if(name==='sheetsDeleteTab'){if(wb.tabs.length<2)return fail('Keep at least one sheet');wb.tabs=wb.tabs.filter((t:any)=>t.id!==data.tab_id)}
 if(name==='sheetsReorderTabs'&&Array.isArray(data.ids))data.ids.forEach((id:string,i:number)=>{const tab=wb.tabs.find((t:any)=>t.id===id);if(tab)tab.position=i});
 save();return {ok:true};
}
