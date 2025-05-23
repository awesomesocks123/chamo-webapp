import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CiBellOn } from 'react-icons/ci';
import { LuMessagesSquare } from 'react-icons/lu';
import { FaCompass } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { BsGearWideConnected } from 'react-icons/bs';
import { IoSearch, IoMenu, IoClose } from 'react-icons/io5';
import NavButton from './NavButton';
import { auth } from '../lib/firebase';
import { getPendingFriendRequests } from '../lib/userService';

interface NavBarProps {
  onNavButtonClick: (buttonName: string) => void;
  onSignOut: () => void;
  onSearch?: (query: string) => void;
  onNotificationUpdate?: (count: number) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onNavButtonClick, onSignOut, onSearch, onNotificationUpdate }) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
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
  
  // Load notification count (pending friend requests)
  useEffect(() => {
    const loadNotificationCount = async () => {
      if (!auth.currentUser) return;
      
      setIsLoadingNotifications(true);
      
      try {
        const requests = await getPendingFriendRequests(auth.currentUser.uid);
        setNotificationCount(requests.length);
        
        // Notify parent component if callback provided
        if (onNotificationUpdate) {
          onNotificationUpdate(requests.length);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    
    loadNotificationCount();
    
    // Set up an interval to check for new notifications every minute
    const intervalId = setInterval(loadNotificationCount, 60000);
    
    return () => clearInterval(intervalId);
  }, [onNotificationUpdate]);
  
  // Function to refresh notifications (called after accepting/rejecting a request)
  const refreshNotifications = async () => {
    if (!auth.currentUser) return;
    
    try {
      const requests = await getPendingFriendRequests(auth.currentUser.uid);
      setNotificationCount(requests.length);
      
      // Notify parent component if callback provided
      if (onNotificationUpdate) {
        onNotificationUpdate(requests.length);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

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
    <header className="bg-[#313131] dark:!bg-[#E1EACD] text-white dark:!text-[#313131] p-4 flex justify-between items-center relative">
      <Link href="/explore" className="text-2xl font-bold m-0 hover:opacity-80 transition-opacity text-[#BED292] dark:text-[#313131]">Chamo Chat</Link>
      
      {/* Mobile Hamburger Menu Button */}
      {isMobile && (
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <IoClose size={24} className="hamburger-icon" />
          ) : (
            <IoMenu size={24} className="hamburger-icon" />
          )}
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
                className="px-3 py-2 rounded-l bg-gray-700 dark:bg-white text-white dark:text-dark-grey outline-none border border-gray-600 dark:border-med-green"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setShowSearchInput(false)}
                className="bg-gray-700 dark:bg-white text-white dark:text-dark-grey px-2 py-2 rounded-r hover:bg-gray-600 dark:hover:bg-gray-200 border border-gray-600 dark:border-med-green border-l-0"
              >
                <IoClose size={20} />
              </button>
            </form>
          ) : (
            <>
              {/* Custom styled buttons instead of NavButton component */}
              <div className="relative">
                <button 
                  className="nav-button w-10 h-10 rounded-2xl flex items-center justify-center bg-med-green text-white hover:bg-dark-green transition-colors"
                  onClick={() => {
                    onNavButtonClick('notifications');
                    // Refresh notifications when the panel is opened
                    refreshNotifications();
                  }}
                >
                  <CiBellOn size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="relative">
                <button 
                  className="nav-button w-10 h-10 rounded-2xl flex items-center justify-center bg-med-green text-white hover:bg-dark-green transition-colors"
                  onClick={() => onNavButtonClick('messages')}
                >
                  <LuMessagesSquare size={20} />
                </button>
              </div>
              
              <div className="relative">
                <button 
                  className="nav-button w-10 h-10 rounded-2xl flex items-center justify-center bg-med-green text-white hover:bg-dark-green transition-colors"
                  onClick={() => onNavButtonClick('explore')}
                >
                  <FaCompass size={20} />
                </button>
              </div>
              
              <div className="relative">
                <button 
                  className="nav-button w-10 h-10 rounded-2xl flex items-center justify-center bg-med-green text-white hover:bg-dark-green transition-colors"
                  onClick={() => onNavButtonClick('profile')}
                >
                  <IoMdPerson size={20} />
                </button>
              </div>
              
              <div className="relative">
                <button 
                  className="nav-button w-10 h-10 rounded-2xl flex items-center justify-center bg-med-green text-white hover:bg-dark-green transition-colors"
                  onClick={() => onNavButtonClick('settings')}
                >
                  <BsGearWideConnected size={20} />
                </button>
              </div>
              
              <div className="relative">
                <button 
                  className="nav-button w-10 h-10 rounded-2xl flex items-center justify-center bg-med-green text-white hover:bg-dark-green transition-colors"
                  onClick={handleSearchClick}
                >
                  <IoSearch size={20} />
                </button>
              </div>
            </>
          )}
          <button
            onClick={onSignOut}
            className="nav-button bg-med-green text-white px-3 py-2 rounded-2xl hover:bg-dark-green transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      )}
      
      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#313131] dark:!bg-[#E1EACD] z-50 shadow-lg">
          <div className="flex flex-col p-4 space-y-4">
            <button 
              onClick={() => {
                onNavButtonClick('notifications');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white dark:text-[#313131] hover:text-light-green dark:hover:text-[#474747] transition-colors"
            >
              <CiBellOn size={20} className="mr-3" /> Notifications
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('messages');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white dark:text-[#313131] hover:text-light-green dark:hover:text-[#474747] transition-colors"
            >
              <LuMessagesSquare size={20} className="mr-3" /> Messages
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('explore');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white dark:text-[#313131] hover:text-light-green dark:hover:text-[#474747] transition-colors"
            >
              <FaCompass size={20} className="mr-3" /> Explore
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white dark:text-[#313131] hover:text-light-green dark:hover:text-[#474747] transition-colors"
            >
              <IoMdPerson size={20} className="mr-3" /> Profile
            </button>
            <button 
              onClick={() => {
                onNavButtonClick('settings');
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white dark:text-[#313131] hover:text-light-green dark:hover:text-[#474747] transition-colors"
            >
              <BsGearWideConnected size={20} className="mr-3" /> Settings
            </button>
            <button 
              onClick={() => {
                handleSearchClick();
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-white dark:text-[#313131] hover:text-light-green dark:hover:text-[#474747] transition-colors"
            >
              <IoSearch size={20} className="mr-3" /> Search
            </button>
            <button
              onClick={() => {
                onSignOut();
                setMobileMenuOpen(false);
              }}
              className="nav-button bg-med-green text-white px-3 py-2 rounded hover:bg-dark-green transition-colors w-full text-center mt-4 font-medium"
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
