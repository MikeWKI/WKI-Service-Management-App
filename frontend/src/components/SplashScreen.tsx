import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onFinish();
      }, 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="h-screen flex items-center justify-center p-8">
        <div className={`text-center transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Main Logo */}
          <div className="mb-8">
            <img
              src="/WKIsplash.png"
              alt="WKI Kenworth"
              className="mx-auto h-[28rem] w-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            WKI Service Management
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-3xl font-semibold text-red-400 mb-6">
            Process Application
          </h2>
          
          {/* Tagline */}
          <p className="text-xl text-slate-300 mb-12">
            Powered by WKI Excellence
          </p>
          
          {/* Loading Animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
