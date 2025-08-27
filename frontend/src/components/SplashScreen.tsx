import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Additional delay for fade out animation
      setTimeout(() => {
        onFinish();
      }, 300);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Main content container */}
      <div className="flex flex-col items-center justify-center text-center px-8 w-full">
        {/* WKI Splash Image with border - 90% screen width (20% larger than 75%) */}
        <div className="mb-8 border-4 border-black rounded-lg shadow-2xl w-[90%] max-w-5xl bg-white p-8 relative min-h-[400px]">
          <img 
            src="/WKIsplash.png" 
            alt="WKI Kenworth Splash" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain animate-fade-in-center"
            style={{ maxHeight: '70vh', maxWidth: 'calc(100% - 4rem)' }}
          />
        </div>

        {/* Service Management Text */}
        <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              WKI Service Management
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">
              Process Application
            </h2>
            <p className="text-slate-400 text-base">
              Powered by WKI Excellence
            </p>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="mt-12 animate-pulse" style={{ animationDelay: '1s' }}>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
