export const useServerFn=(fn:any)=>fn;
export const createServerFn=()=>{const c:any={middleware:()=>c,inputValidator:()=>c,validator:()=>c,handler:()=>async()=>{throw Error('Requires the original backend. Frontend preview only.')}};return c};
export const createMiddleware=()=>{const c:any={middleware:()=>c,client:()=>c,server:()=>c};return c};
export const createStart=()=>({});
export const createServerOnlyFn=()=>()=>{throw Error('Server execution is disabled in this frontend preview.')};
