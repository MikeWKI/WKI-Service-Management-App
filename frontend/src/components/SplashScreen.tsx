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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900 transition-opacity duration-500 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ minHeight: '100dvh' }}
    >
      <div className="flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto animate-fade-in-center" style={{ minHeight: '70vh' }}>
        {/* Splash Image (logo) */}
        <img
          src="/WKIsplash.png"
          alt="WKI Kenworth Splash"
          className="object-contain w-full max-w-xs sm:max-w-sm md:max-w-md mb-8 drop-shadow-xl rounded-lg mx-auto"
          style={{ display: 'block' }}
        />

        {/* Service Management Text */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
          WKI Service Management
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-2">
          Process Application
        </h2>
        <p className="text-slate-300 text-lg sm:text-xl">
          Powered by WKI Excellence
        </p>

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
