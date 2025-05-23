'use client';

import React, { useState, useEffect } from 'react';

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize on component mount
  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModeEnabled);
    
    // Apply the dark mode class to the HTML element
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Store the preference in localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Apply the dark mode class to the HTML element
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Dispatch an event to notify other components
    window.dispatchEvent(new Event('dark-mode-changed'));
  };

  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={isDarkMode}
        onChange={toggleDarkMode}
      />
      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-med-green dark:peer-checked:bg-dark-green"></div>
    </label>
  );
}
