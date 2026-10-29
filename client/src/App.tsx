// DCT Platform — App Router
// RSM | CATT | DCT + Roger | Prototype Sandbox

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";

// Load dashboard workspace pages only after their route is requested. The
// sign-in screen no longer needs to download every page in the application.
const Home = lazy(() => import("./pages/Home"));
const GateStatus = lazy(() => import("./pages/GateStatus"));
const TouchpointsPage = lazy(() => import("./pages/TouchpointsPage"));
const ArchitectureView = lazy(() => import("./pages/ArchitectureView"));
const DeveloperArchitecturePage = lazy(() => import("./pages/DeveloperArchitecturePage"));
const EnterpriseArchitecturePage = lazy(() => import("./pages/EnterpriseArchitecturePage"));
const RogerApiEvolution = lazy(() => import("./pages/RogerApiEvolution"));
const RuntimeJourney = lazy(() => import("./pages/RuntimeJourney"));
const BatchControlPanel = lazy(() => import("./pages/BatchControlPanel"));
const TaxonomyPage = lazy(() => import("./pages/TaxonomyPage"));
const DataModelPage = lazy(() => import("./pages/DataModelPage"));
const DataGovernancePage = lazy(() => import("./pages/DataGovernancePage"));
const ClassificationWalkthroughPage = lazy(() => import("./pages/ClassificationWalkthroughPage"));
const TaxMappingPage = lazy(() => import("./pages/TaxMappingPage"));
const AAPReviewPage = lazy(() => import("./pages/AAPReviewPage"));
const BatchDeliveryReviewModel = lazy(() => import("./pages/BatchDeliveryReviewModel"));
const AskBuddy = lazy(() => import("./pages/AskBuddy"));
const RogerMappingPage = lazy(() => import("./pages/RogerMappingPage"));
const BatchDeliveryCalendar = lazy(() => import("./pages/BatchDeliveryCalendar"));
const BatchRoadmap = lazy(() => import("./pages/BatchRoadmap"));
const BatchDetailPage = lazy(() => import("./pages/BatchDetailPage"));
const IntegrationSimulation = lazy(() => import("./pages/IntegrationSimulation"));
const ConsumerIntegrationReadinessHub = lazy(() => import("./pages/ConsumerIntegrationReadinessHub"));
const GapAnalysisEngine = lazy(() => import("./pages/GapAnalysisEngine"));
const DeploymentRegistry = lazy(() => import("./pages/DeploymentRegistry"));
const QADeploymentRegistry = lazy(() => import("./pages/QADeploymentRegistry"));
const QAReleaseSim = lazy(() => import("./pages/QAReleaseSim"));
const DiscoveryCenter = lazy(() => import("./pages/DiscoveryCenter"));
const BAStoryBuilder = lazy(() => import("./pages/discovery/BAStoryBuilder"));
const EcosystemOverview = lazy(() => import("./pages/discovery/EcosystemOverview"));
const PlatformResponsibilities = lazy(() => import("./pages/discovery/PlatformResponsibilities"));
const EndToEndDataFlow = lazy(() => import("./pages/discovery/EndToEndDataFlow"));
const DataFlowSimulation = lazy(() => import("./pages/discovery/DataFlowSimulation"));
const IntegrationArchitecture = lazy(() => import("./pages/discovery/IntegrationArchitecture"));
const BARequirementDiscovery = lazy(() => import("./pages/discovery/BARequirementDiscovery"));
const DiscoveryChecklist = lazy(() => import("./pages/discovery/DiscoveryChecklist"));
const Glossary = lazy(() => import("./pages/discovery/Glossary"));
const DCTOverview = lazy(() => import("./pages/discovery/DCTOverview"));
const RogerOverview = lazy(() => import("./pages/discovery/RogerOverview"));
const IMSIntegration = lazy(() => import("./pages/discovery/GoSystemTax"));
const PDCOverview = lazy(() => import("./pages/discovery/PDCOverview"));
const DataGateway = lazy(() => import("./pages/discovery/DataGateway"));
const KnowledgeGraphPage = lazy(() => import("./pages/discovery/KnowledgeGraphPage"));
const PriorYearMigration = lazy(() => import("./pages/discovery/PriorYearMigration"));
const PriorYearInventory = lazy(() => import("./pages/discovery/PriorYearInventory"));
const MasterDataGovernance = lazy(() => import("./pages/discovery/MasterDataGovernance"));
const DiscoveryWorkspace = lazy(() => import("./pages/onboarding/DiscoveryWorkspace"));
const LearningCenter = lazy(() => import("./pages/LearningCenter"));
const Step1Features = lazy(() => import("./pages/onboarding/Step1Features"));
const Step2FeatureDetail = lazy(() => import("./pages/onboarding/Step2FeatureDetail"));
const Step3DiscoveryReview = lazy(() => import("./pages/onboarding/Step3DiscoveryReview"));
const Step4Simulation = lazy(() => import("./pages/onboarding/Step4Simulation"));
const Step5AskBuddy = lazy(() => import("./pages/onboarding/Step5AskBuddy"));
const Step6Questions = lazy(() => import("./pages/onboarding/Step6Questions"));
const Step7Complete = lazy(() => import("./pages/onboarding/Step7Complete"));
const UATTestingPage = lazy(() => import("./pages/UATTestingPage"));
const OperatingModelHub = lazy(() => import("./pages/OperatingModelHub"));
const PI4PlanningWorkspace = lazy(() => import("./pages/PI4PlanningWorkspace"));
const PostPilotPage = lazy(() => import("./pages/PostPilotPage"));
const MeetingRecapsPage = lazy(() => import("./pages/MeetingRecapsPage"));
const RogerPilotBacklogPage = lazy(() => import("./pages/RogerPilotBacklogPage"));
const StateTaxonomyReadinessPage = lazy(() => import("./pages/StateTaxonomyReadinessPage"));
const OnboardingHub = lazy(() => import("./pages/onboarding/OnboardingHub"));
const StateCompliancePrototype = lazy(() => import("./pages/StateCompliancePrototype"));
// Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { BatchStatusProvider } from "./contexts/BatchStatusContext";
import { DiscoveryProvider } from "./contexts/DiscoveryContext";
import { GlobalPageProvider } from "./contexts/GlobalPageContext";
import { TourProvider, useTour } from "./contexts/TourContext";
import ExecTour from "./components/ExecTour";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  if (location === "/state-compliance") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginRight: "0px" }}>
        <Header />
        <main className="flex-1 overflow-y-auto" style={{ paddingRight: "0px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <>{children}</>;
}

function PageLoading() {
  return (
    <div aria-live="polite" style={{ color: "#475569", fontSize: "13px", padding: "32px" }}>
      Loading workspace…
    </div>
  );
}

function GlobalTour() {
  const { tourOpen, closeTour } = useTour();
  if (!tourOpen) return null;
  return <ExecTour onClose={closeTour} />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <AuthGate>
      <Layout>
        <Suspense fallback={<PageLoading />}>
          <Switch>
          {/* Core platform */}
          <Route path="/" component={Home} />
          <Route path="/batch-calendar" component={BatchDeliveryCalendar} />
          <Route path="/batch-roadmap" component={BatchRoadmap} />
          <Route path="/workspace/delivery" component={() => <OperatingModelHub workspaceId="delivery" />} />
          <Route path="/pi4-planning" component={PI4PlanningWorkspace} />
          <Route path="/post-pilot" component={PostPilotPage} />
          <Route path="/post-pilot/meeting-recaps" component={MeetingRecapsPage} />
          <Route path="/post-pilot/roger-pilot-backlog" component={RogerPilotBacklogPage} />
          <Route path="/post-pilot/state-taxonomy-readiness" component={StateTaxonomyReadinessPage} />
          <Route path="/workspace/roger" component={() => <OperatingModelHub workspaceId="roger" />} />
          <Route path="/workspace/discovery" component={() => <OperatingModelHub workspaceId="discovery" />} />
          <Route path="/workspace/architecture" component={() => <OperatingModelHub workspaceId="architecture" />} />
          <Route path="/workspace/quality" component={() => <OperatingModelHub workspaceId="quality" />} />
          <Route path="/gate-status" component={GateStatus} />
          <Route path="/touchpoints" component={TouchpointsPage} />
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
          <Route path="/state-compliance" component={StateCompliancePrototype} />
          <Route path="/runtime-journey" component={RuntimeJourney} />
          <Route path="/control-panel" component={BatchControlPanel} />

          {/* Batch detail routes */}
          <Route path="/batch/:id" component={BatchDetailPage} />

          {/* Gate detail routes */}
          <Route path="/gate/overview" component={GateStatus} />
          <Route path="/gate/:id" component={GateStatus} />

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
          <Route path="/qa-deployment-registry" component={QADeploymentRegistry} />
          <Route path="/qa-release-sim" component={QAReleaseSim} />
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
           <Route path="/discovery/prior-year-inventory" component={PriorYearInventory} />
           <Route path="/discovery/pdc" component={PDCOverview} />
          <Route path="/discovery/master-data-governance" component={MasterDataGovernance} />
          <Route path="/discovery/data-gateway" component={DataGateway} />
          <Route path="/discovery/ba-story-builder" component={BAStoryBuilder} />
           <Route path="/discovery/knowledge-graph" component={KnowledgeGraphPage} />
          <Route path="/discovery/prior-year-migration" component={PriorYearMigration} />
          {/* UAT Testing */}
          <Route path="/uat-testing" component={UATTestingPage} />
          {/* Learning Center */}
          <Route path="/learning-center" component={LearningCenter} />
          <Route path="/guided-onboarding" component={OnboardingHub} />
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
        </Suspense>
        <GlobalTour />
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
                <TourProvider>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </TourProvider>
              </GlobalPageProvider>
            </DiscoveryProvider>
          </BatchStatusProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
