import React,{useSyncExternalStore} from 'react';
const subscribe=(cb:any)=>{addEventListener('hashchange',cb);return()=>removeEventListener('hashchange',cb)};
export function usePathname(){return useSyncExternalStore(subscribe,()=>location.hash.slice(1).split('?')[0]||'/')}
export function useRouter(){return {push:(x:string)=>location.hash=x,replace:(x:string)=>location.hash=x,refresh:()=>location.reload(),back:()=>history.back()}}
export function useSearchParams(){usePathname();return new URLSearchParams(location.hash.split('?')[1]||'')}
export function useParams(){return {id:usePathname().split('/').pop()}}
export default function Link({href,children,...p}:any){return <a {...p} href={'#'+href}>{children}</a>}
