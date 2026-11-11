import React from 'react';
export const useAuth=()=>({user:{userId:'local-preview',email:'',fullName:'Local Preview',workspaceId:'local'},isLoading:false,login:async()=>{},logout:()=>location.assign('/')});
export default function AuthProvider({children}:any){return children}
