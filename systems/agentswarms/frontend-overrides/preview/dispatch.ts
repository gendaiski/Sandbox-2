import {localSheets} from './sheets';
import {toast} from 'sonner';
export async function dispatch(name:string,args:any,shape:any={}){
 const local=localSheets(name,args?.data||{});if(local!==undefined)return local;
 const error='Requires the original AgentSwarms backend. Frontend-only preview: no AI or service action was executed.';
 if(name==='serviceHealth'||name==='systemMetrics'||name==='nbRuntimeGetState')throw new Error(error);
 if(name==='semanticListModels'||name==='listLocalSources'||name==='semanticListLocalSources')return [];
 if(name==='mlListModels')return {enabled:false,models:[],limits:{}};
 if(name==='sqlModelsList')return {ok:true,models:[],schemas:[],deps:{},missing:[]};
 if(name==='sqlModelRunsList')return {ok:true,runs:[]};
 if(name==='workflowsList')return {ok:true,workflows:[]};
 if(name==='workflowCandidates')return {ok:true,workflows:[],agents:[],swarms:[],pipelines:[],models:[],connections:[]};
 if(name==='dataMonitorsList')return {ok:true,monitors:[],incidents:[]};
 if(name==='dataMonitorSources')return {ok:true,lakehouse:[],warehouses:[],connections:[],schemas:[],tables:[]};
 if(name==='getModelRegistry')return {models:[],meta:null,total:0};
 if(name==='getEtlOverview')return {pipelines:[],stats:{running_now:0,runs_7d:0,succeeded_7d:0,failed_7d:0,success_rate_7d:null,rows_loaded_7d:0,runtime_ms_7d:0},per_pipeline:{},recent_runs:[]};
 const words=name.replace(/[A-Z]/g,x=>' '+x).toLowerCase().split(/\s+/);
 if(words.some(x=>['list','get','fetch','load','read','search'].includes(x)))return {ok:true,...shape};
 toast.info(error);throw new Error(error);
}
