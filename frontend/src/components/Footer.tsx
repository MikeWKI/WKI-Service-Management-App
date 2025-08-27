import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <img 
                src="https://www.wkikenworth.com/efs/wp/domains/www.wkikenworth.com/wp-content/uploads/2022/02/wkw-160x300.png" 
                alt="WKI Kenworth Logo" 
                className="h-8 w-auto" 
              />
            </div>
            <div className="text-white">
              <div className="font-bold text-red-400">WKI Service Management</div>
              <div className="text-xs text-slate-300">© {new Date().getFullYear()} All rights reserved</div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center md:text-right">
            <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm max-w-md">
              <div className="text-red-300 font-semibold text-sm mb-2">
                🔒 WKI Proprietary Application
              </div>
              <div className="text-slate-300 text-xs leading-relaxed">
                This application is proprietary to WKI and contains confidential business information. 
                Unauthorized access, use, or distribution is strictly prohibited.
              </div>
            </div>
          </div>
        </div>

        {/* Additional Footer Info */}
        <div className="border-t border-slate-700 mt-6 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
            <div className="mb-2 md:mb-0">
              Built for PACCAR Dealer Performance Excellence
            </div>
            <div className="flex space-x-4">
              <span>Service Management System</span>
              <span>•</span>
              <span>Decisiv Integration</span>
              <span>•</span>
              <span>WKI Internal Use Only</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
