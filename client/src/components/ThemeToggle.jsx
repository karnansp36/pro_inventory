import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl transition-all duration-200 ${
        theme === 'dark'
          ? 'hover:bg-slate-800/50 active:scale-95'
          : 'hover:bg-gray-100 active:scale-95'
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-slate-300 transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle;