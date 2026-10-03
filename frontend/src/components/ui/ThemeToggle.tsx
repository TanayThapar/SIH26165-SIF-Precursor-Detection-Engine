import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'Day' : 'Night'} Mode`}
        title={`Current: ${isDark ? 'Night (Dark)' : 'Day (Light)'} Mode. Click to toggle.`}
        className="relative p-1.5 rounded border border-surface-border bg-surface hover:bg-surface-sunken text-graphite-600 dark:text-slate-300 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs overflow-hidden group"
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <Sun
            className={`w-3.5 h-3.5 text-amber-500 absolute transition-all duration-500 transform ${
              isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <Moon
            className={`w-3.5 h-3.5 text-petrol-300 absolute transition-all duration-500 transform ${
              isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-full flex items-center justify-between px-3 py-2 rounded bg-graphite-900/60 hover:bg-graphite-900 border border-graphite-800 text-slate-300 transition-all duration-200 group text-xs"
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded flex items-center justify-center bg-graphite-800 text-slate-300 group-hover:text-amber-400 transition-colors">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-petrol-400 transition-transform group-hover:rotate-12 duration-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:rotate-45 duration-300" />
          )}
        </div>
        <span className="font-medium text-[11px] text-slate-300">
          {isDark ? 'Night Mode' : 'Day Mode'}
        </span>
      </div>

      {/* Animated Pill Switch */}
      <div
        className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
          isDark ? 'bg-petrol-600 justify-end' : 'bg-graphite-700 justify-start'
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-300" />
      </div>
    </button>
  );
};
