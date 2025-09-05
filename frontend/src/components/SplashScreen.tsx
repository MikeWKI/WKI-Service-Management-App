import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [animationStage, setAnimationStage] = useState<'initial' | 'fadeIn' | 'visible' | 'fadeOut' | 'complete'>('initial');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage 1: Initial delay and fade in (0-800ms)
    const stage1 = setTimeout(() => setAnimationStage('fadeIn'), 100);
    
    // Stage 2: Fully visible state (800ms-2500ms)
    const stage2 = setTimeout(() => setAnimationStage('visible'), 800);
    
    // Stage 3: Begin fade out (2500ms-3200ms)
    const stage3 = setTimeout(() => setAnimationStage('fadeOut'), 2500);
    
    // Stage 4: Complete and trigger callback (3200ms)
    const stage4 = setTimeout(() => {
      setAnimationStage('complete');
      onFinish();
    }, 3200);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 8 + 2; // Randomized progress increments
      });
    }, 120);

    return () => {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(stage4);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  // Get animation classes based on current stage
  const getContainerClasses = () => {
    switch (animationStage) {
      case 'initial':
        return 'opacity-0 scale-95 blur-sm';
      case 'fadeIn':
        return 'opacity-100 scale-100 blur-none transition-all duration-700 ease-out';
      case 'visible':
        return 'opacity-100 scale-100 blur-none';
      case 'fadeOut':
        return 'opacity-0 scale-105 blur-sm transition-all duration-700 ease-in';
      case 'complete':
        return 'opacity-0 scale-110 blur-md';
      default:
        return 'opacity-0 scale-95';
    }
  };

  const getBackgroundClasses = () => {
    switch (animationStage) {
      case 'initial':
        return 'opacity-0';
      case 'fadeIn':
        return 'opacity-100 transition-opacity duration-500 ease-out';
      case 'visible':
        return 'opacity-100';
      case 'fadeOut':
        return 'opacity-0 transition-opacity duration-500 ease-in';
      case 'complete':
        return 'opacity-0';
      default:
        return 'opacity-0';
    }
  };

  if (animationStage === 'complete') {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 ${getBackgroundClasses()}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="h-screen flex items-center justify-center p-8 relative z-10">
        <div className={`text-center ${getContainerClasses()}`}>
          {/* Enhanced Logo with glow effect */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-red-400/30 rounded-full blur-xl animate-pulse"></div>
            <img
              src="/WKIsplash.png"
              alt="WKI Kenworth"
              className="relative mx-auto h-[20rem] sm:h-[24rem] lg:h-[28rem] w-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Enhanced title with staggered animation */}
          <div className="space-y-2 mb-8">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight transform transition-all duration-1000 ${
              animationStage === 'fadeIn' ? 'translate-y-0 opacity-100' : animationStage === 'initial' ? 'translate-y-8 opacity-0' : ''
            }`} style={{ transitionDelay: '200ms' }}>
              WKI Service Management
            </h1>
            
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-semibold text-red-400 transform transition-all duration-1000 ${
              animationStage === 'fadeIn' ? 'translate-y-0 opacity-100' : animationStage === 'initial' ? 'translate-y-8 opacity-0' : ''
            }`} style={{ transitionDelay: '400ms' }}>
              Process Application
            </h2>
            
            <p className={`text-lg sm:text-xl lg:text-2xl text-slate-300 transform transition-all duration-1000 ${
              animationStage === 'fadeIn' ? 'translate-y-0 opacity-100' : animationStage === 'initial' ? 'translate-y-8 opacity-0' : ''
            }`} style={{ transitionDelay: '600ms' }}>
              Powered by WKI Excellence
            </p>
          </div>

          {/* Enhanced progress bar */}
          <div className={`w-80 mx-auto mb-8 transform transition-all duration-1000 ${
            animationStage === 'fadeIn' ? 'translate-y-0 opacity-100' : animationStage === 'initial' ? 'translate-y-8 opacity-0' : ''
          }`} style={{ transitionDelay: '800ms' }}>
            <div className="bg-slate-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-slate-600/50">
              <div 
                className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-400">
              <span>Initializing...</span>
              <span>{Math.round(Math.min(progress, 100))}%</span>
            </div>
          </div>

          {/* Enhanced loading dots with better animation */}
          <div className={`flex justify-center space-x-3 transform transition-all duration-1000 ${
            animationStage === 'fadeIn' ? 'translate-y-0 opacity-100' : animationStage === 'initial' ? 'translate-y-8 opacity-0' : ''
          }`} style={{ transitionDelay: '1000ms' }}>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-lg shadow-red-500/50"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-lg shadow-red-500/50" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-lg shadow-red-500/50" style={{ animationDelay: '300ms' }}></div>
          </div>

          {/* Version info */}
          <div className={`mt-8 text-xs text-slate-500 transform transition-all duration-1000 ${
            animationStage === 'fadeIn' ? 'translate-y-0 opacity-100' : animationStage === 'initial' ? 'translate-y-8 opacity-0' : ''
          }`} style={{ transitionDelay: '1200ms' }}>
            v2.0.0 | Built for WKI Internal Use
          </div>
        </div>
      </div>
    </div>
  );
}
