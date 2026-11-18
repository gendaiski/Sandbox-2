export function useIamState(){return {isSuperadmin:true,modelRules:null,loading:false}}
export function useIsSuperadmin(){return true}
export function invalidateIamState(){}
export function useMyModelRules(){return null}
export {isModelAllowed as isModelAllowedByRules,modelMatchesAnyRule,allowedProviders} from '@/lib/iamRules';
