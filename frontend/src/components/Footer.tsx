import React, { useState, useRef } from 'react';

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const clickTimesRef = useRef<number[]>([]);

  const handleLogoClick = () => {
    const now = Date.now();
    
    // Add current click time
    clickTimesRef.current.push(now);
    
    // Remove clicks older than 5 seconds
    clickTimesRef.current = clickTimesRef.current.filter(time => now - time <= 5000);
    
    setClickCount(clickTimesRef.current.length);
    
    // Check if we have 4 clicks within 5 seconds
    if (clickTimesRef.current.length >= 4) {
      setShowEasterEgg(true);
      // Reset the click counter
      clickTimesRef.current = [];
      setClickCount(0);
    }
  };

  const closeEasterEgg = () => {
    setShowEasterEgg(false);
  };

  return (
    <>
      <footer className="bg-slate-900 border-t border-slate-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div 
                className="bg-white rounded-lg p-2 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={handleLogoClick}
                title="Click me..."
              >
                <img 
                  src="/KWbug.png" 
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

    {/* Easter Egg Modal */}
    {showEasterEgg && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn"
        onClick={closeEasterEgg}
      >
        <div className="relative max-w-4xl max-h-[90vh] mx-4">
          {/* Close button */}
          <button
            onClick={closeEasterEgg}
            className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors duration-200 text-2xl font-bold z-10"
            title="Close"
          >
            ✕
          </button>
          
          {/* Easter egg container with animation */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl border-2 border-red-500/50 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h2 className="text-white text-xl font-bold text-center animate-slideInFromTop">
                🎉 You Found the Easter Egg! 🎉
              </h2>
            </div>
            
            <div className="p-6">
              <div className="animate-slideInFromBottom">
                <img 
                  src="/SMAEaster.png" 
                  alt="Easter Egg" 
                  className="w-full h-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>
              
              <div className="text-center mt-4 animate-fadeInDelay">
                <p className="text-slate-300 text-sm">
                  Congratulations! You discovered the secret easter egg! 🥚
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  Click anywhere to close
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Custom CSS for animations */}
    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes scaleIn {
        from { 
          opacity: 0;
          transform: scale(0.8) rotate(-5deg);
        }
        to { 
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
      }
      
      @keyframes slideInFromTop {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInFromBottom {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInDelay {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
      
      .animate-scaleIn {
        animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .animate-slideInFromTop {
        animation: slideInFromTop 0.4s ease-out 0.2s both;
      }
      
      .animate-slideInFromBottom {
        animation: slideInFromBottom 0.4s ease-out 0.3s both;
      }
      
      .animate-fadeInDelay {
        animation: fadeInDelay 0.4s ease-out 0.5s both;
      }
    `}</style>
    </>
  );
}
