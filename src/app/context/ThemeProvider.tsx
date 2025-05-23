'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

type ThemeContextType = {
  isDarkMode: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state from system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Set up theme based on system preference only
  useEffect(() => {
    try {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
      
      // Listen for changes in system color scheme preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      // Add event listener with newer API if available, fallback to older API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // @ts-ignore - For older browsers
        mediaQuery.addListener(handleChange);
      }
      
      // Cleanup
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // @ts-ignore - For older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    } catch (error) {
      console.error('Error setting up theme:', error);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
