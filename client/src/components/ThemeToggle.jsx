import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('ng-theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('ng-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('ng-theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-xs text-[var(--ng-muted)] hover:text-[var(--ng-text)] hover:bg-[var(--ng-hover-bg)]`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Moon size={14} /> : <Sun size={14} />}
      <span className="font-medium">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;
