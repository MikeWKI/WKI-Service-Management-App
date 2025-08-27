import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'flex flex-col items-center justify-center min-h-screen bg-slate-900'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <Loader2 
        className={`${sizeClasses[size]} text-red-500 animate-spin mb-2`}
        aria-hidden="true"
      />
      <span className={`${textSizeClasses[size]} text-slate-300 font-medium`}>
        {text}
      </span>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
