import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '../contexts/ThemeContext';

const themeOptions: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'auto', label: 'Auto', icon: <Monitor size={16} /> },
];

export default function FixedThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-2 sm:left-6 z-50 flex items-center space-x-1 bg-slate-800/90 backdrop-blur-md rounded-lg p-1 shadow-lg border border-slate-700/50">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            theme === option.value
              ? 'bg-white text-slate-800 shadow-md dark:bg-slate-600 dark:text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
          }`}
          title={`Switch to ${option.label.toLowerCase()} theme`}
          aria-label={`Switch to ${option.label.toLowerCase()} theme`}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}