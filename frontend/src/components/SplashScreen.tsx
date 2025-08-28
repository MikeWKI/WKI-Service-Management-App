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
      }, 350);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-opacity duration-500 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ minHeight: '100dvh' }}
    >
      <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl mx-auto animate-fade-in-center" style={{ minHeight: '70vh' }}>
        {/* Splash Image Container */}
        <div className="mb-8 border-4 border-black/80 rounded-2xl shadow-2xl w-full max-w-3xl lg:max-w-4xl bg-white/95 p-4 sm:p-10 flex items-center justify-center mx-auto">
          <img
            src="/WKIsplash.png"
            alt="WKI Kenworth Splash"
            className="object-contain w-full max-h-[44vh] sm:max-h-[56vh] md:max-h-[60vh] lg:max-h-[70vh] drop-shadow-xl rounded-lg mx-auto"
            style={{ display: 'block' }}
          />
        </div>

        {/* Service Management Text */}
        <div className="w-full flex flex-col items-center justify-center mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
            WKI Service Management
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-2">
            Process Application
          </h2>
          <p className="text-slate-300 text-lg sm:text-xl">
            Powered by WKI Excellence
          </p>
        </div>

        {/* Loading indicator - simple fade in, no stagger */}
        <div className="mt-10 flex justify-center animate-fade-in mx-auto">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
