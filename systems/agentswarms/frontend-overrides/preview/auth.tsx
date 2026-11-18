import {previewUser,previewSession} from './database';
// Local UI state only; does not authenticate with any service.
export function useAuth(){return {user:previewUser,session:previewSession,loading:false,isAuthenticated:true,signOut:async()=>{location.assign('/')}}}
