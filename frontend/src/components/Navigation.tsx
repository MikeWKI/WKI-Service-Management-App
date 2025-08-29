import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Workflow, GitBranch, BookOpen, Menu, X } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Improved route detection
  const isWorkflow = location.pathname === '/';
  const isComprehensive = location.pathname === '/comprehensive';
  const isMetricsDefinitions = location.pathname === '/metrics/definitions';
  const isMetrics = location.pathname === '/metrics';
  const isInMetricsSection = location.pathname.startsWith('/metrics') || location.pathname.startsWith('/location-metrics');

  return (
    <nav className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 shadow-2xl border-b-4 border-red-600 mb-4 sm:mb-8">
      <div className="w-full max-w-full sm:max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between">
            {/* Left side - Logos spanning both rows */}
            <div className="flex items-center space-x-2 sm:space-x-4 pr-2 sm:pr-8">
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-lg">
                <img 
                  src="/KWbug.png" 
                  alt="WKI Kenworth Logo" 
                  className="h-8 sm:h-12 w-auto" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <a 
                href="https://paccar.decisiv.net/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-2 sm:p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
              >
                <img 
                  src="/Decisiv-Logo.svg" 
                  alt="Decisiv Logo" 
                  className="h-8 sm:h-12 w-auto" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
              <div className="text-white font-bold">
                <div className="text-base sm:text-xl text-red-400">WKI Service Management</div>
                <div className="text-xs sm:text-sm text-slate-300">Performance Excellence</div>
              </div>
            </div>

            {/* Right side - Navigation buttons */}
            <div className="flex flex-col space-y-2 sm:space-y-3">
              {/* Top row - Main navigation */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isWorkflow 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600'
                  }`}
                >
                  <Workflow size={20} />
                  <span>Workflow</span>
                </Link>
                
                <Link
                  to="/metrics"
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isMetrics || (isInMetricsSection && !isMetricsDefinitions)
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600'
                  }`}
                >
                  <BarChart3 size={20} />
                  <span>Metrics</span>
                </Link>
                
                <Link
                  to="/comprehensive"
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isComprehensive 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600'
                  }`}
                >
                  <GitBranch size={20} />
                  <span>Detailed</span>
                </Link>
                
                <Link
                  to="/metrics/definitions"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border-2 ${
                    isMetricsDefinitions 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-blue-500' 
                      : 'bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white border-blue-500/50 hover:border-blue-400'
                  }`}
                >
                  <BookOpen size={18} />
                  <span className="text-sm font-semibold">Metrics Guide</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-1">
              <div className="bg-white rounded-lg p-1 shadow-lg">
                <img 
                  src="/KWbug.png" 
                  alt="WKI Kenworth Logo" 
                  className="h-5 w-auto" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-white font-bold">
                <div className="text-xs text-red-400">WKI Service</div>
                <div className="text-[10px] text-slate-300">Management</div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-2 pb-2 border-t border-slate-700">
              <div className="flex flex-col space-y-1 mt-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isWorkflow 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Workflow size={20} />
                  <span>Workflow</span>
                </Link>
                
                <Link
                  to="/metrics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isMetrics || (isInMetricsSection && !isMetricsDefinitions)
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <BarChart3 size={20} />
                  <span>Metrics Dashboard</span>
                </Link>
                
                <Link
                  to="/comprehensive"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isComprehensive 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <GitBranch size={20} />
                  <span>Detailed Workflow</span>
                </Link>

                <Link
                  to="/metrics/definitions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-blue-500/50 ${
                    isMetricsDefinitions 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-blue-500' 
                      : 'text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-400'
                  }`}
                >
                  <BookOpen size={20} />
                  <span>Metrics Guide</span>
                </Link>

                {/* Mobile Quick Links */}
                <div className="pt-2 mt-2 border-t border-slate-700">
                  <div className="px-4 py-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Quick Access
                  </div>
                  
                  <Link
                    to="/metrics/scorecard-manager"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <span className="text-green-400">•</span>
                    <span>Upload Scorecards</span>
                  </Link>
                  
                  <Link
                    to="/location-metrics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <span className="text-blue-400">•</span>
                    <span>Performance Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}