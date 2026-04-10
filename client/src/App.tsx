// DCT Platform — App Router
// RSM | CATT | DCT + Roger | Prototype Sandbox
// Matches reference: rsm-ai-team-niua6bzx.manus.space

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Core pages
import Home from "./pages/Home";
import BatchRoadmap from "./pages/BatchRoadmap";
import GateStatus from "./pages/GateStatus";
import TouchpointsPage from "./pages/TouchpointsPage";
import ArtifactsPage from "./pages/ArtifactsPage";
import AgentHub from "./pages/AgentHub";
import ArchitectureView from "./pages/ArchitectureView";
import DemoRunner from "./pages/DemoRunner";
import LineageExplorer from "./pages/LineageExplorer";

// New reference-matching pages
import RogerApiEvolution from "./pages/RogerApiEvolution";
import RuntimeJourney from "./pages/RuntimeJourney";
import BatchFlow from "./pages/BatchFlow";
import WeeklyDemo from "./pages/WeeklyDemo";
import BatchControlPanel from "./pages/BatchControlPanel";
import TaxonomyPage from "./pages/TaxonomyPage";
import DataModelPage from "./pages/DataModelPage";
import GovernanceTimelinePage from "./pages/GovernanceTimelinePage";
import TaxMappingPage from "./pages/TaxMappingPage";
import AAPReviewPage from "./pages/AAPReviewPage";
import RogerMappingPage from "./pages/RogerMappingPage";

// Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { BatchStatusProvider } from "./contexts/BatchStatusContext";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
      <Sidebar />
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
        {/* Core platform */}
        <Route path="/" component={Home} />
        <Route path="/batch-roadmap" component={BatchRoadmap} />
        <Route path="/gate-status" component={GateStatus} />
        <Route path="/touchpoints" component={TouchpointsPage} />
        <Route path="/artifacts" component={ArtifactsPage} />
        <Route path="/agent-hub" component={AgentHub} />
        <Route path="/architecture" component={ArchitectureView} />
        <Route path="/architecture/enterprise" component={ArchitectureView} />
        <Route path="/architecture/developer" component={ArchitectureView} />
        <Route path="/architecture/sync" component={ArchitectureView} />
        <Route path="/architecture/visio" component={ArchitectureView} />
        <Route path="/demo" component={DemoRunner} />
        <Route path="/lineage" component={LineageExplorer} />

        {/* Reference-matching new pages */}
        <Route path="/roger-api" component={RogerApiEvolution} />
        <Route path="/runtime-journey" component={RuntimeJourney} />
        <Route path="/batchflow" component={BatchFlow} />
        {/* Weekly Demo — PROTECTED: do not remove */}
        <Route path="/weekly-demo" component={WeeklyDemo} />
        {/* Global Control Panel — batch status management */}
        <Route path="/control-panel" component={BatchControlPanel} />

        {/* Batch detail routes — redirect to batch roadmap */}
        <Route path="/batch/:id" component={BatchRoadmap} />

        {/* Gate detail routes — redirect to gate status */}
        <Route path="/gate/:id" component={GateStatus} />

        {/* Agent detail routes — redirect to agent hub */}
        <Route path="/agent/:id" component={AgentHub} />

        {/* Dedicated tool pages */}
        <Route path="/taxonomy" component={TaxonomyPage} />
        <Route path="/data-model" component={DataModelPage} />
        <Route path="/roger-mapping" component={RogerMappingPage} />
        <Route path="/aap-review" component={AAPReviewPage} />
        <Route path="/tax-mapping" component={TaxMappingPage} />
        <Route path="/governance-timeline" component={GovernanceTimelinePage} />
        <Route path="/pi2" component={BatchRoadmap} />
        <Route path="/pi3" component={BatchRoadmap} />

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
        <BatchStatusProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BatchStatusProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
