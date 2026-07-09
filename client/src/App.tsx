// DCT Platform — App Router
// RSM | CATT | DCT + Roger | Prototype Sandbox

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";

// Core pages
import Home from "./pages/Home";
import GateStatus from "./pages/GateStatus";
import TouchpointsPage from "./pages/TouchpointsPage";
import AgentHub from "./pages/AgentHub";
import ArchitectureView from "./pages/ArchitectureView";
import DeveloperArchitecturePage from "./pages/DeveloperArchitecturePage";
import EnterpriseArchitecturePage from "./pages/EnterpriseArchitecturePage";

// Platform pages
import RogerApiEvolution from "./pages/RogerApiEvolution";
import RuntimeJourney from "./pages/RuntimeJourney";
import BatchControlPanel from "./pages/BatchControlPanel";
import TaxonomyPage from "./pages/TaxonomyPage";
import DataModelPage from "./pages/DataModelPage";
import DataGovernancePage from "./pages/DataGovernancePage";
import ClassificationWalkthroughPage from "@/pages/ClassificationWalkthroughPage";
import TaxMappingPage from "./pages/TaxMappingPage";
import AAPReviewPage from "./pages/AAPReviewPage";
import BatchDeliveryReviewModel from "./pages/BatchDeliveryReviewModel";
import AskBuddy from "./pages/AskBuddy";
import RogerMappingPage from "./pages/RogerMappingPage";
import BatchDeliveryCalendar from "./pages/BatchDeliveryCalendar";
import BatchDetailPage from "./pages/BatchDetailPage";
import IntegrationSimulation from "./pages/IntegrationSimulation";
import ConsumerIntegrationReadinessHub from "./pages/ConsumerIntegrationReadinessHub";
import GapAnalysisEngine from "./pages/GapAnalysisEngine";
import DeploymentRegistry from "./pages/DeploymentRegistry";
import DeliveryIntelligencePage from "./pages/DeliveryIntelligencePage";
// Discovery Center
import DiscoveryCenter from "./pages/DiscoveryCenter";
import BAStoryBuilder from "./pages/discovery/BAStoryBuilder";
import EcosystemOverview from "./pages/discovery/EcosystemOverview";
import PlatformResponsibilities from "./pages/discovery/PlatformResponsibilities";
import EndToEndDataFlow from "./pages/discovery/EndToEndDataFlow";
import DataFlowSimulation from "./pages/discovery/DataFlowSimulation";
import IntegrationArchitecture from "./pages/discovery/IntegrationArchitecture";
import BARequirementDiscovery from "./pages/discovery/BARequirementDiscovery";
import DiscoveryChecklist from "./pages/discovery/DiscoveryChecklist";
import Glossary from "./pages/discovery/Glossary";
import DCTOverview from "./pages/discovery/DCTOverview";
import RogerOverview from "./pages/discovery/RogerOverview";
import IMSIntegration from "./pages/discovery/GoSystemTax";
import KnowledgeGraphPage from "./pages/discovery/KnowledgeGraphPage";
import DiscoveryWorkspace from "./pages/onboarding/DiscoveryWorkspace";
import LearningCenter from "./pages/LearningCenter";
import Step1Features from "./pages/onboarding/Step1Features";
import Step2FeatureDetail from "./pages/onboarding/Step2FeatureDetail";
import Step3DiscoveryReview from "./pages/onboarding/Step3DiscoveryReview";
import Step4Simulation from "./pages/onboarding/Step4Simulation";
import Step5AskBuddy from "./pages/onboarding/Step5AskBuddy";
import Step6Questions from "./pages/onboarding/Step6Questions";
import Step7Complete from "./pages/onboarding/Step7Complete";
import UATTestingPage from "./pages/UATTestingPage";
// Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { BatchStatusProvider } from "./contexts/BatchStatusContext";
import { DiscoveryProvider } from "./contexts/DiscoveryContext";
import { GlobalPageProvider } from "./contexts/GlobalPageContext";
import ContextAwarenessPanel from "./components/ContextAwarenessPanel";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginRight: "0px" }}>
        <Header />
        <main className="flex-1 overflow-y-auto" style={{ paddingRight: "0px" }}>
          {children}
        </main>
      </div>
      <ContextAwarenessPanel />
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <>{children}</>;
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <AuthGate>
      <Layout>
        <Switch>
          {/* Core platform */}
          <Route path="/" component={Home} />
          <Route path="/batch-calendar" component={BatchDeliveryCalendar} />
          <Route path="/gate-status" component={GateStatus} />
          <Route path="/touchpoints" component={TouchpointsPage} />
          <Route path="/agent-hub" component={AgentHub} />
          <Route path="/architecture" component={ArchitectureView} />
          <Route path="/architecture/developer" component={DeveloperArchitecturePage} />
          <Route path="/architecture/enterprise" component={EnterpriseArchitecturePage} />
          <Route path="/architecture/sync" component={ArchitectureView} />
          <Route path="/architecture/visio" component={ArchitectureView} />

          {/* Platform pages */}
          <Route path="/integration-hub" component={() => { window.location.replace("/consumer-integration-hub"); return null; }} />
          <Route path="/integration-simulation" component={IntegrationSimulation} />
          <Route path="/roger-consumer-readiness" component={() => { window.location.replace("/consumer-integration-hub"); return null; }} />
          <Route path="/consumer-integration-hub" component={ConsumerIntegrationReadinessHub} />
          <Route path="/roger-api" component={RogerApiEvolution} />
          <Route path="/runtime-journey" component={RuntimeJourney} />
          <Route path="/control-panel" component={BatchControlPanel} />

          {/* Batch detail routes */}
          <Route path="/batch/:id" component={BatchDetailPage} />

          {/* Gate detail routes */}
          <Route path="/gate/overview" component={GateStatus} />
          <Route path="/gate/:id" component={GateStatus} />

          {/* Agent detail routes */}
          <Route path="/agent/:id" component={AgentHub} />

          {/* Tool pages */}
          <Route path="/taxonomy" component={TaxonomyPage} />
          <Route path="/data-model" component={DataModelPage} />
          <Route path="/data-governance" component={DataGovernancePage} />
          <Route path="/roger-mapping" component={RogerMappingPage} />
          <Route path="/aap-review" component={AAPReviewPage} />
          <Route path="/batch-delivery-review" component={BatchDeliveryReviewModel} />
          <Route path="/ask-buddy" component={AskBuddy} />
          <Route path="/tax-mapping" component={TaxMappingPage} />
          <Route path="/classification-walkthrough" component={ClassificationWalkthroughPage} />
          <Route path="/gap-analysis" component={GapAnalysisEngine} />
          <Route path="/deployment-registry" component={DeploymentRegistry} />
          <Route path="/delivery-intelligence" component={DeliveryIntelligencePage} />
          {/* Discovery Center */}
          <Route path="/discovery" component={DiscoveryCenter} />
          <Route path="/discovery/ecosystem" component={EcosystemOverview} />
          <Route path="/discovery/platform-responsibilities" component={PlatformResponsibilities} />
          <Route path="/discovery/data-flow" component={EndToEndDataFlow} />
          <Route path="/discovery/simulation" component={DataFlowSimulation} />
          <Route path="/discovery/integration-architecture" component={IntegrationArchitecture} />
          <Route path="/discovery/ba-requirements" component={BARequirementDiscovery} />
          <Route path="/discovery/checklist" component={DiscoveryChecklist} />
          <Route path="/discovery/glossary" component={Glossary} />
          <Route path="/discovery/dct-overview" component={DCTOverview} />
          <Route path="/discovery/roger-overview" component={RogerOverview} />
           <Route path="/discovery/gosystem" component={IMSIntegration} />
          <Route path="/discovery/ba-story-builder" component={BAStoryBuilder} />
           <Route path="/discovery/knowledge-graph" component={KnowledgeGraphPage} />
          {/* UAT Testing */}
          <Route path="/uat-testing" component={UATTestingPage} />
          {/* Learning Center */}
          <Route path="/learning-center" component={LearningCenter} />
          {/* Provision & State Discovery Workspace */}
          <Route path="/onboarding" component={DiscoveryWorkspace} />
          <Route path="/onboarding/step1" component={Step1Features} />
          <Route path="/onboarding/step2" component={Step2FeatureDetail} />
          <Route path="/onboarding/step3" component={Step3DiscoveryReview} />
          <Route path="/onboarding/step4" component={Step4Simulation} />
          <Route path="/onboarding/step5" component={Step5AskBuddy} />
          <Route path="/onboarding/step6" component={Step6Questions} />
          <Route path="/onboarding/step7" component={Step7Complete} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </AuthGate>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BatchStatusProvider>
            <DiscoveryProvider>
              <GlobalPageProvider>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </GlobalPageProvider>
            </DiscoveryProvider>
          </BatchStatusProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
