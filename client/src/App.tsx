// DCT Platform — App Router
// RSM | CATT | DCT + Roger | Prototype Sandbox

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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
import DeveloperArchitecturePage from "./pages/DeveloperArchitecturePage";
import EnterpriseArchitecturePage from "./pages/EnterpriseArchitecturePage";
import DemoRunner from "./pages/DemoRunner";
import LineageExplorer from "./pages/LineageExplorer";

// Platform pages
import RogerApiEvolution from "./pages/RogerApiEvolution";
import RuntimeJourney from "./pages/RuntimeJourney";
import BatchControlPanel from "./pages/BatchControlPanel";
import TaxonomyPage from "./pages/TaxonomyPage";
import DataModelPage from "./pages/DataModelPage";
import DataGovernancePage from "./pages/DataGovernancePage";
import GovernanceTimelinePage from "@/pages/GovernanceTimelinePage";
import ClassificationWalkthroughPage from "@/pages/ClassificationWalkthroughPage";
import TaxMappingPage from "./pages/TaxMappingPage";
import AAPReviewPage from "./pages/AAPReviewPage";
import RogerMappingPage from "./pages/RogerMappingPage";
import BatchDeliveryCalendar from "./pages/BatchDeliveryCalendar";
import BatchDetailPage from "./pages/BatchDetailPage";
import IntegrationSimulation from "./pages/IntegrationSimulation";
import ConsumerIntegrationReadinessHub from "./pages/ConsumerIntegrationReadinessHub";
import BATouchpointSummary from "./pages/BATouchpointSummary";

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
        <Route path="/batch-calendar" component={BatchDeliveryCalendar} />
        <Route path="/gate-status" component={GateStatus} />
        <Route path="/touchpoints" component={TouchpointsPage} />
        <Route path="/artifacts" component={ArtifactsPage} />
        <Route path="/agent-hub" component={AgentHub} />
        <Route path="/architecture" component={ArchitectureView} />
        <Route path="/architecture/developer" component={DeveloperArchitecturePage} />
        <Route path="/architecture/enterprise" component={EnterpriseArchitecturePage} />
        <Route path="/architecture/sync" component={ArchitectureView} />
        <Route path="/architecture/visio" component={ArchitectureView} />
        <Route path="/demo" component={DemoRunner} />
        <Route path="/lineage" component={LineageExplorer} />

        {/* Platform pages */}
        <Route path="/integration-hub" component={() => { window.location.replace("/consumer-integration-hub"); return null; }} />
        <Route path="/integration-simulation" component={IntegrationSimulation} />
        <Route path="/roger-consumer-readiness" component={() => { window.location.replace("/consumer-integration-hub"); return null; }} />
        <Route path="/consumer-integration-hub" component={ConsumerIntegrationReadinessHub} />
        <Route path="/roger-api" component={RogerApiEvolution} />
        <Route path="/runtime-journey" component={RuntimeJourney} />
        <Route path="/control-panel" component={BatchControlPanel} />
        <Route path="/ba-touchpoint" component={BATouchpointSummary} />

        {/* Batch detail routes */}
        <Route path="/batch/:id" component={BatchDetailPage} />

        {/* Gate detail routes */}
        <Route path="/gate/:id" component={GateStatus} />

        {/* Agent detail routes */}
        <Route path="/agent/:id" component={AgentHub} />

        {/* Tool pages */}
        <Route path="/taxonomy" component={TaxonomyPage} />
        <Route path="/data-model" component={DataModelPage} />
        <Route path="/data-governance" component={DataGovernancePage} />
        <Route path="/roger-mapping" component={RogerMappingPage} />
        <Route path="/aap-review" component={AAPReviewPage} />
        <Route path="/tax-mapping" component={TaxMappingPage} />
        <Route path="/governance-timeline" component={GovernanceTimelinePage} />
        <Route path="/classification-walkthrough" component={ClassificationWalkthroughPage} />

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
