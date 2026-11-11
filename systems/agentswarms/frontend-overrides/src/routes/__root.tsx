import {createRootRoute,Outlet} from '@tanstack/react-router';
import {ThemeProvider} from '@/hooks/use-theme';
import {LayoutPrefsProvider} from '@/hooks/use-layout-prefs';
import {Toaster} from '@/components/ui/sonner';
import {ConfirmHost} from '@/components/ui/confirm-dialog';
import '@/styles.css';
export const Route=createRootRoute({component:()=> <ThemeProvider><LayoutPrefsProvider><Outlet/><Toaster/><ConfirmHost/><aside style={{position:'fixed',bottom:6,right:8,zIndex:9999,maxWidth:480,padding:'5px 10px',background:'#172632',color:'#e1f6ef',border:'1px solid #456777',borderRadius:8,font:'11px system-ui'}} role="note">Frontend preview · local drafts only · AI, cloud data and credentials disabled</aside></LayoutPrefsProvider></ThemeProvider>,notFoundComponent:()=> <main style={{padding:40}}>Page not found. <a href="/dashboard">Open workspace</a></main>});
