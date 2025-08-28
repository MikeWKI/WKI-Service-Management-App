
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  LiberalMetrics
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
          {/* Responsive layout: main content + quick links on right for desktop, stacked for mobile */}
          <div className="w-full max-w-full sm:max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 flex flex-col lg:flex-row gap-0 lg:gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
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
                <Route path="/scorecard-manager" element={<ScorecardManager />} />
                <Route path="/location-metrics" element={<LocationMetrics />} />
                <Route path="/metrics/wichita" element={<WichitaMetrics />} />
                <Route path="/metrics/emporia" element={<EmporiaMetrics />} />
                <Route path="/metrics/dodge-city" element={<DodgeCityMetrics />} />
                <Route path="/metrics/liberal" element={<LiberalMetrics />} />
              </Routes>
            </div>
              {/* Quick Links fixed to far right for desktop, bottom for mobile */}
              {/* Desktop: fixed right, scrolls with user */}
              <div className="hidden lg:block">
                <div className="fixed top-1/2 right-0 z-40 flex flex-col items-center -translate-y-1/2 pr-2 w-[110px] xl:w-[130px] 2xl:w-[150px]">
                  <span className="writing-mode-vertical-rl text-orientation-mixed text-xs font-bold tracking-wider text-slate-400 mb-2 select-none">
                    Quick Links
                  </span>
                  <div className="w-full">
                    <QuickLinksPanel />
                  </div>
                </div>
              </div>
              {/* Mobile: bottom */}
              <div className="block lg:hidden w-full max-w-full sm:max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 mt-2">
                <QuickLinksPanel />
              </div>
          </div>
          {/* Quick Links for mobile (below content) */}
          <div className="block lg:hidden w-full max-w-full sm:max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 mt-2">
            <QuickLinksPanel />
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

