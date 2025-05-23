'use client';

import React from 'react';
import { IoSunny, IoMoon } from 'react-icons/io5';

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="hidden dark:flex items-center text-white">
        <IoMoon className="mr-2" size={18} />
        <span>Dark Mode (System)</span>
      </div>
      <div className="flex dark:hidden items-center text-gray-700">
        <IoSunny className="mr-2" size={18} />
        <span>Light Mode (System)</span>
      </div>
    </div>
  );
}
