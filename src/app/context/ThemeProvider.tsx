'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state from the current class on the HTML element
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // This will run on the client side only
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  // Make sure state is in sync with the actual DOM on mount
  useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    } catch (error) {
      console.error('Error checking dark mode:', error);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    try {
      const newIsDarkMode = !isDarkMode;
      
      if (newIsDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      
      setIsDarkMode(newIsDarkMode);
      
      // Force a re-render of components that might depend on the theme
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
