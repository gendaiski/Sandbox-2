import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as HashRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CreatePlaybookAI from "./pages/CreatePlaybookAI";
import Dashboard from "./pages/Dashboard";
import PlaybookLibrary from "./pages/PlaybookLibrary";
import PlaybookDetail from "./pages/PlaybookDetail";
import Export from "./pages/Export";
import Settings from "./pages/Settings";
import CreatePlaybook from "./pages/CreatePlaybook";
import ClauseLibrary from "./pages/ClauseLibrary";
import ClauseDetail from "./pages/ClauseDetail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/create-ai" component={CreatePlaybookAI} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/playbook-library"} component={PlaybookLibrary} />
      <Route path={"/playbook/:id"} component={PlaybookDetail} />
      <Route path={"/export/:id"} component={Export} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/create"} component={CreatePlaybook} />
      <Route path={"/clause-library"} component={ClauseLibrary} />
      <Route path={"/clause/:id"} component={ClauseDetail} />
      <Route path={"/404"} component={NotFound} />     {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div role="status" style={{padding:"9px 18px",background:"#fff4d6",color:"#5c420d",fontSize:12}}>Original UI · Frontend preview · Drafts stay in this browser. AI coaching, generation and OneDrive need the backend. Built-in clauses/templates are upstream reference content. <a href="#/create" style={{textDecoration:"underline"}}>Manual draft</a></div><HashRouter hook={useHashLocation}><Router /></HashRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
