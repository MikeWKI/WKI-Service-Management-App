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
      <div className="flex flex-col items-center justify-center text-center px-4 w-full max-w-lg mx-auto animate-fade-in-center">
        {/* Splash Image Container */}
        <div className="mb-6 border-4 border-black/80 rounded-2xl shadow-2xl w-full max-w-md bg-white/95 p-4 sm:p-8 flex items-center justify-center">
          <img
            src="/WKIsplash.png"
            alt="WKI Kenworth Splash"
            className="object-contain w-full max-h-[32vh] sm:max-h-[40vh] drop-shadow-xl rounded-lg"
            style={{ display: 'block', margin: '0 auto' }}
          />
        </div>

        {/* Service Management Text */}
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
            WKI Service Management
          </h1>
          <h2 className="text-lg sm:text-2xl font-bold text-red-400 mb-2">
            Process Application
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Powered by WKI Excellence
          </p>
        </div>

        {/* Loading indicator - simple fade in, no stagger */}
        <div className="mt-8 flex justify-center animate-fade-in">
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
