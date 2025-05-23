import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CiBellOn } from 'react-icons/ci';
import { LuMessagesSquare } from 'react-icons/lu';
import { FaCompass } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { BsGearWideConnected } from 'react-icons/bs';
import { IoSearch, IoMenu, IoClose } from 'react-icons/io5';
import NavButton from './NavButton';

interface NavBarProps {
  onNavButtonClick: (buttonName: string) => void;
  onSignOut: () => void;
  onSearch?: (query: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onNavButtonClick, onSignOut, onSearch }) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
    onNavButtonClick('search');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };
  
  return (
    <header className="bg-[#313131] text-white p-4 flex justify-between items-center relative">
      <Link href="/explore" className="text-2xl font-bold m-0 hover:opacity-80 transition-opacity">Chamo Chat</Link>
      
      {/* Mobile Hamburger Menu Button */}
      {isMobile && (
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2 focus:outline-none"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
        </button>
      )}
      
      {/* Desktop Navigation */}
      {!isMobile && (
        <div className="flex items-center space-x-3">
          {showSearchInput ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center mr-2">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 rounded-l bg-gray-700 text-white outline-none"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setShowSearchInput(false)}
                className="bg-gray-700 text-white px-2 py-2 rounded-r hover:bg-gray-600"
              >
                <IoClose size={20} />
              </button>
            </form>
          ) : (
            <>
              <NavButton 
                icon={<CiBellOn size={20} />} 
                onClick={() => onNavButtonClick('notifications')} 
                tooltip="Notifications"
              />
              <NavButton 
                icon={<LuMessagesSquare size={20} />} 
                onClick={() => onNavButtonClick('messages')} 
                tooltip="Messages"
              />
              <NavButton 
                icon={<FaCompass size={20} />} 
                onClick={() => onNavButtonClick('explore')} 
                tooltip="Explore"
              />
              <NavButton 
                icon={<IoMdPerson size={20} />} 
                onClick={() => onNavButtonClick('profile')} 
                tooltip="Profile"
              />
              <NavButton 
                icon={<BsGearWideConnected size={20} />} 
                onClick={() => onNavButtonClick('settings')} 
                tooltip="Settings"
              />
              <NavButton 
                icon={<IoSearch size={20} />} 
                onClick={handleSearchClick} 
                tooltip="Search"
              />
            </>
          )}
          <button
            onClick={onSignOut}
            className="bg-med-green text-white px-3 py-2 rounded hover:bg-dark-green transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
      
      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#313131] z-50 shadow-lg">
          <div className="flex flex-col p-4 space-y-4">
            <button 
              onClick={() => {
                onNavButtonClick('notifications');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white hover:text-med-green transition-colors"
            >
              <CiBellOn size={20} className="mr-3" /> Notifications
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('messages');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white hover:text-med-green transition-colors"
            >
              <LuMessagesSquare size={20} className="mr-3" /> Messages
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('explore');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white hover:text-med-green transition-colors"
            >
              <FaCompass size={20} className="mr-3" /> Explore
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white hover:text-med-green transition-colors"
            >
              <IoMdPerson size={20} className="mr-3" /> Profile
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('settings');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white hover:text-med-green transition-colors"
            >
              <BsGearWideConnected size={20} className="mr-3" /> Settings
            </button>
            <button 
              onClick={() => {
                handleSearchClick();
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white hover:text-med-green transition-colors"
            >
              <IoSearch size={20} className="mr-3" /> Search
            </button>
            <button
              onClick={() => {
                onSignOut();
                setMobileMenuOpen(false);
              }}
              className="bg-med-green text-white px-3 py-2 rounded hover:bg-dark-green transition-colors w-full text-center mt-4"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
