import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '../contexts/ThemeContext';

const themeOptions: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'auto', label: 'Auto', icon: <Monitor size={16} /> },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
            theme === option.value
              ? 'bg-white text-slate-800 shadow-md dark:bg-slate-600 dark:text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
          }`}
          title={`Switch to ${option.label.toLowerCase()} theme`}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
