'use client';

import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeProvider';
import { IoSunny, IoMoon } from 'react-icons/io5';

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  // Use the ThemeContext to get the current system theme
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className={`flex items-center ${className}`}>
      {isDarkMode ? (
        <div className="flex items-center text-white">
          <IoMoon className="mr-2" size={18} />
          <span>Dark Mode (System)</span>
        </div>
      ) : (
        <div className="flex items-center text-gray-700">
          <IoSunny className="mr-2" size={18} />
          <span>Light Mode (System)</span>
        </div>
      )}
    </div>
  );
}
