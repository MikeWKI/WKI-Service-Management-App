
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  Navigation,
  ProcessWorkflowLayout,
  ComprehensiveWorkflow,
  MetricsRoleSelection,
  MetricsDefinitions,
  ServiceAdvisorMetrics,
  PartsStaffMetrics,
  TechnicianMetrics,
  Footer,
  SplashScreen,
  ScorecardManager,
  LocationMetrics,
  LocationMetricsManager,
  WichitaMetrics,
  EmporiaMetrics,
  DodgeCityMetrics,
  LiberalMetrics,
  CampaignMetrics
} from "./components";
import QuickLinksPanel from "./components/QuickLinksPanel";
import FixedThemeToggle from "./components/FixedThemeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onFinish={handleSplashFinish} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 light:from-gray-50 light:via-white light:to-gray-100">
          <Navigation />
          <FixedThemeToggle />
          {/* Responsive layout: main content centered, quick links on right for desktop */}
          <div className="relative w-full">
            {/* Main content - always centered */}
            <div className="w-full max-w-full sm:max-w-7xl mx-auto px-1 sm:px-4 lg:px-8">
              <Routes>
                <Route path="/" element={
                  <div className="flex flex-col items-center justify-center py-2 sm:py-4 md:py-8">
                    <ProcessWorkflowLayout />
                  </div>
                } />
                <Route path="/comprehensive" element={
                  <div className="flex flex-col items-center justify-center py-2 sm:py-4 md:py-8">
                    <ComprehensiveWorkflow />
                  </div>
                } />
                <Route path="/metrics" element={<MetricsRoleSelection />} />
                <Route path="/metrics/definitions" element={<MetricsDefinitions />} />
                <Route path="/metrics/service-advisor" element={<ServiceAdvisorMetrics />} />
                <Route path="/metrics/parts-staff" element={<PartsStaffMetrics />} />
                <Route path="/metrics/technician" element={<TechnicianMetrics />} />
                <Route path="/metrics/campaigns" element={<CampaignMetrics />} />
                <Route path="/scorecard-manager" element={<ScorecardManager />} />
                <Route path="/location-metrics" element={<LocationMetrics />} />
                <Route path="/metrics/wichita" element={<WichitaMetrics />} />
                <Route path="/metrics/emporia" element={<EmporiaMetrics />} />
                <Route path="/metrics/dodge-city" element={<DodgeCityMetrics />} />
                <Route path="/metrics/liberal" element={<LiberalMetrics />} />
                {/* Handle index.html specifically */}
                <Route path="/index.html" element={<Navigate to="/" replace />} />
                {/* Catch-all route - redirect any unmatched routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            
            {/* Quick Links fixed to right side for desktop */}
            <div className="hidden lg:flex fixed top-1/2 right-4 -translate-y-1/2 z-30 flex-col items-center justify-start w-[60px] xl:w-[70px] 2xl:w-[80px]">
              <div className="w-full">
                <QuickLinksPanel />
              </div>
            </div>
          </div>
          {/* Quick Links for mobile (integrated in navigation) */}
          <div className="block lg:hidden w-full bg-slate-800 border-t border-slate-700">
            <div className="max-w-full sm:max-w-7xl mx-auto px-1 sm:px-4">
              <QuickLinksPanel />
            </div>
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

