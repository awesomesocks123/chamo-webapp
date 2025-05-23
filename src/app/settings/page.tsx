'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../context/AuthProvider';
import NavBar from '../components/NavBar';
import Help from './components/Help';
import FAQ from './components/FAQ';
import Blocklist from './components/Blocklist';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ProfileMenu from './components/ProfileMenu';
import FriendsList from '../components/FriendsList';

export default function SettingsPage() {
  const { authUser, setAuthUser } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState('help'); // Initial active component
  
  // For NavBar functionality
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authUser) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else {
      setIsLoading(false);
      
      // Check for tab parameter in URL
      const tab = searchParams.get('tab');
      if (tab && ['help', 'profile', 'friends', 'faq', 'blocklist', 'privacy', 'terms'].includes(tab)) {
        setActiveComponent(tab);
      }
    }
  }, [authUser, router, searchParams]);

  const handleSignOut = () => {
    // Clear the auth user from context
    setAuthUser(null);
    // Redirect to login page
    router.replace('/auth/login');
  };

  const handleNavButtonClick = (buttonName: string) => {
    switch (buttonName) {
      case 'messages':
        router.push('/chat');
        break;
      case 'explore':
        router.push('/explore');
        break;
      case 'profile':
        setShowUserProfileModal(true);
        break;
      case 'settings':
        // Already on settings page
        break;
      case 'search':
        router.push('/explore');
        break;
      case 'notifications':
        setShowNotifications(!showNotifications);
        break;
      default:
        break;
    }
  };

  const handleNavClick = (componentName: string) => {
    setActiveComponent(componentName);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-light-green">
        <p className="text-dark-green font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#191919]">
      {/* Header/Navbar */}
      <NavBar 
        onNavButtonClick={handleNavButtonClick}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 bg-[#f7fee7] dark:bg-[#191919] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-1/4 bg-gray-100 dark:bg-zinc-800 p-8 h-full">
            <h1 className="text-gray-800 dark:text-white text-4xl font-bold mb-8">Settings</h1>
            <nav className="space-y-2">
              <button 
                className={`block w-full text-left py-3 px-4 rounded-md font-medium ${activeComponent === 'profile' ? 'bg-med-green text-white dark:bg-dark-green' : 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                onClick={() => handleNavClick('profile')}
              >
                Profile Menu
              </button>
              <button 
                className={`block w-full text-left py-3 px-4 rounded-md font-medium ${activeComponent === 'friends' ? 'bg-med-green text-white dark:bg-dark-green' : 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                onClick={() => handleNavClick('friends')}
              >
                Friends
              </button>
              <button 
                className={`block w-full text-left py-3 px-4 rounded-md font-medium ${activeComponent === 'help' ? 'bg-med-green text-white dark:bg-dark-green' : 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                onClick={() => handleNavClick('help')}
              >
                Help
              </button>
              <button 
                className={`block w-full text-left py-3 px-4 rounded-md font-medium ${activeComponent === 'faq' ? 'bg-med-green text-white dark:bg-dark-green' : 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                onClick={() => handleNavClick('faq')}
              >
                FAQ
              </button>
              <button 
                className={`block w-full text-left py-3 px-4 rounded-md font-medium ${activeComponent === 'blocklist' ? 'bg-med-green text-white dark:bg-dark-green' : 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                onClick={() => handleNavClick('blocklist')}
              >
                Blocklist
              </button>
              <button 
                className={`block w-full text-left py-3 px-4 rounded-md font-medium ${activeComponent === 'privacy' ? 'bg-med-green text-white dark:bg-dark-green' : 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                onClick={() => handleNavClick('privacy')}
              >
                Privacy
              </button>
              <button 
                className={`block w-full text-left py-3 px-4 rounded-md font-medium ${activeComponent === 'terms' ? 'bg-med-green text-white dark:bg-dark-green' : 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                onClick={() => handleNavClick('terms')}
              >
                Terms of Service
              </button>
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="w-3/4 h-full overflow-y-auto bg-gray-200 dark:bg-zinc-900 p-8 rounded-tl-lg rounded-bl-lg">
            {activeComponent === 'help' && <Help />}
            {activeComponent === 'profile' && <ProfileMenu />}
            {activeComponent === 'friends' && <FriendsList />}
            {activeComponent === 'faq' && <FAQ />}
            {activeComponent === 'blocklist' && <Blocklist />}
            {activeComponent === 'privacy' && <PrivacyPolicy />}
            {activeComponent === 'terms' && <TermsOfService />}
          </div>
        </div>
      </div>
    </div>
  );
}
