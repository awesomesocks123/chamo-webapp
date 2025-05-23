'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DarkModeTest() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [manualDarkMode, setManualDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up an interval to check regularly
    const interval = setInterval(checkDarkMode, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleManualDarkMode = () => {
    const newMode = !manualDarkMode;
    setManualDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-zinc-800 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-dark-grey dark:text-white">Dark Mode Test Page</h1>
        
        <div className="mb-8 p-6 bg-gray-100 dark:bg-zinc-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-dark-grey dark:text-white">Current Status</h2>
          <p className="mb-2 text-gray-700 dark:text-white">
            Dark mode is currently: <span className="font-bold">{isDarkMode ? 'ON' : 'OFF'}</span>
          </p>
          <p className="mb-4 text-gray-700 dark:text-white">
            System preference for dark mode: <span className="font-bold">
              {typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}
            </span>
          </p>
          
          <button 
            onClick={toggleManualDarkMode}
            className="px-4 py-2 bg-med-green text-white rounded hover:bg-dark-green dark:hover:bg-light-green transition-colors"
          >
            {manualDarkMode ? 'Turn Off Manual Dark Mode' : 'Turn On Manual Dark Mode'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-zinc-700 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2 text-dark-grey dark:text-white">Light Text on Dark Background</h3>
            <p className="text-gray-600 dark:text-white">This text should be white in dark mode and gray in light mode.</p>
          </div>
          
          <div className="p-6 bg-gray-100 dark:bg-zinc-800 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2 text-dark-grey dark:text-white">Another Example</h3>
            <p className="text-gray-600 dark:text-white">This should also change based on the theme.</p>
          </div>
        </div>
        
        <Link href="/" className="text-med-green hover:text-dark-green dark:text-light-green dark:hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
