// DCT Platform Executive Demo Environment — App Router
// RSM | CATT | DCT + Roger | Prototype Sandbox

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import AgentHub from "./pages/AgentHub";
import ArchitectureView from "./pages/ArchitectureView";
import DemoRunner from "./pages/DemoRunner";
import LineageExplorer from "./pages/LineageExplorer";
import PlaceholderPage from "./pages/PlaceholderPage";

// Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Derive active section from path
  const sectionMap: Record<string, string> = {
    "/": "dashboard",
    "/batch-roadmap": "batches",
    "/gate-status": "gates",
    "/touchpoints": "touchpoints",
    "/artifacts": "artifacts",
    "/agent-hub": "agent-hub",
    "/architecture": "architecture",
    "/demo": "demo",
    "/lineage": "lineage",
  };
  const activeSection = sectionMap[location] || "dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeSection={activeSection} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/batch-roadmap" component={() => <PlaceholderPage title="Batch Roadmap" description="Architectural Batch AB-01 through AB-06 roadmap and delivery timeline." />} />
        <Route path="/gate-status" component={() => <PlaceholderPage title="Gate Status" description="Detailed gate verification status for all active batches." />} />
        <Route path="/touchpoints" component={() => <PlaceholderPage title="Touchpoints" description="T1–T11 touchpoint state and system ownership detail." />} />
        <Route path="/artifacts" component={() => <PlaceholderPage title="Artifacts" description="Full artifact registry across all gates and batches." />} />
        <Route path="/agent-hub" component={AgentHub} />
        <Route path="/architecture" component={ArchitectureView} />
        <Route path="/demo" component={DemoRunner} />
        <Route path="/lineage" component={LineageExplorer} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
