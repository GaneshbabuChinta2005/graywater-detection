import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 1. Check persisted preference first
    const stored = localStorage.getItem('hydrosense_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    // 2. Respect OS preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    // Apply theme attribute to <html> so CSS [data-theme] selectors work
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hydrosense_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
