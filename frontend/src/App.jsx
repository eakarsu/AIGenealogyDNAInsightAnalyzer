import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AICenter from './pages/AICenter';
import AIStructuredTools from './pages/AIStructuredTools';
import AIHistory from './pages/AIHistory';
import FamilyTreeAndCommunity from './pages/FamilyTreeAndCommunity';
import CustomViewsPage from './pages/CustomViewsPage';
import Sidebar from './components/Sidebar';

// === Batch 04 Gaps & Frontend Mounts ===
import CfAgenticGenealogyResearchAutonomously from './pages/CfAgenticGenealogyResearchAutonomously';
import CfMultiModalDnaDocumentFusionCombinin from './pages/CfMultiModalDnaDocumentFusionCombinin';
import CfHealthAncestryInsightsLinkingGenetic from './pages/CfHealthAncestryInsightsLinkingGenetic';
import CfSensitiveDnaSurpriseHandlingForNon from './pages/CfSensitiveDnaSurpriseHandlingForNon';
import CfCelebrityAncestorMatchingGamifyingEn from './pages/CfCelebrityAncestorMatchingGamifyingEn';
import CfCousinResearchCollaborationWithShare from './pages/CfCousinResearchCollaborationWithShare';
import GapNoDnaMatchInterpretationEndpoint from './pages/GapNoDnaMatchInterpretationEndpoint';
import GapNoMigrationStoryNarrativeSynthesis from './pages/GapNoMigrationStoryNarrativeSynthesis';
import GapNoHealthRiskExplanationInLayman from './pages/GapNoHealthRiskExplanationInLayman';
import GapNoCousinDiscoveryBranchInference from './pages/GapNoCousinDiscoveryBranchInference';
import GapNoEthnicityDeepDive from './pages/GapNoEthnicityDeepDive';
import GapNoDnaAnomalyDetectionNonPaternity from './pages/GapNoDnaAnomalyDetectionNonPaternity';
import GapNoExpertConsultationBookingGenealogi from './pages/GapNoExpertConsultationBookingGenealogi';
import GapNoWebhookIntegrationsWithAncestryfam from './pages/GapNoWebhookIntegrationsWithAncestryfam';
import GapNoRealTimeTreeCollaboration from './pages/GapNoRealTimeTreeCollaboration';
import GapLimitedDocumentOcrUploadExistsBut from './pages/GapLimitedDocumentOcrUploadExistsBut';
import GapNoPaymentSubscriptionModule from './pages/GapNoPaymentSubscriptionModule';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleStorage = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/feature/:featureId" element={<FeaturePage />} />
          <Route path="/ai-center" element={<AICenter />} />
          <Route path="/ai-structured-tools" element={<AIStructuredTools />} />
          <Route path="/ai-history" element={<AIHistory />} />
          <Route path="/family-tree-community" element={<FamilyTreeAndCommunity />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          {/* // === Batch 04 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-genealogy-research-autonomously-" element={<CfAgenticGenealogyResearchAutonomously />} />
          <Route path="/cf-multi-modal-dna-document-fusion-combinin" element={<CfMultiModalDnaDocumentFusionCombinin />} />
          <Route path="/cf-health-ancestry-insights-linking-genetic" element={<CfHealthAncestryInsightsLinkingGenetic />} />
          <Route path="/cf-sensitive-dna-surprise-handling-for-non" element={<CfSensitiveDnaSurpriseHandlingForNon />} />
          <Route path="/cf-celebrity-ancestor-matching-gamifying-en" element={<CfCelebrityAncestorMatchingGamifyingEn />} />
          <Route path="/cf-cousin-research-collaboration-with-share" element={<CfCousinResearchCollaborationWithShare />} />
          <Route path="/gap-no-dna-match-interpretation-endpoint" element={<GapNoDnaMatchInterpretationEndpoint />} />
          <Route path="/gap-no-migration-story-narrative-synthesis" element={<GapNoMigrationStoryNarrativeSynthesis />} />
          <Route path="/gap-no-health-risk-explanation-in-layman" element={<GapNoHealthRiskExplanationInLayman />} />
          <Route path="/gap-no-cousin-discovery-branch-inference" element={<GapNoCousinDiscoveryBranchInference />} />
          <Route path="/gap-no-ethnicity-deep-dive" element={<GapNoEthnicityDeepDive />} />
          <Route path="/gap-no-dna-anomaly-detection-non-paternity" element={<GapNoDnaAnomalyDetectionNonPaternity />} />
          <Route path="/gap-no-expert-consultation-booking-genealogi" element={<GapNoExpertConsultationBookingGenealogi />} />
          <Route path="/gap-no-webhook-integrations-with-ancestryfam" element={<GapNoWebhookIntegrationsWithAncestryfam />} />
          <Route path="/gap-no-real-time-tree-collaboration" element={<GapNoRealTimeTreeCollaboration />} />
          <Route path="/gap-limited-document-ocr-upload-exists-but" element={<GapLimitedDocumentOcrUploadExistsBut />} />
          <Route path="/gap-no-payment-subscription-module" element={<GapNoPaymentSubscriptionModule />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
