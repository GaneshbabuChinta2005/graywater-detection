import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Institutional default: Government Light Theme
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('hydrosense_theme');
    if (saved && (saved === 'light' || saved === 'dark')) return saved;
    return 'light'; // Clean Government Light Theme by default
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hydrosense_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
