'use client';

import React, { useContext, useState } from 'react';
import { IoPerson } from 'react-icons/io5';
import { AuthContext } from '../../context/AuthProvider';

const ProfileMenu: React.FC = () => {
  const { authUser } = useContext(AuthContext);
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [bio, setBio] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [status, setStatus] = useState('');

  const handleSaveProfile = () => {
    // In a real app, you would send this to your server
    // For now, just show a success message
    setStatus('Profile updated successfully!');
    
    // Clear the status message after 3 seconds
    setTimeout(() => {
      setStatus('');
    }, 3000);
  };

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-dark-grey rounded-lg p-6">
      <h1 className="text-4xl font-semibold text-gray-700 dark:text-white mb-8">Profile Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-zinc-700 rounded-lg p-6 shadow-sm flex flex-col items-center">
            <div className="relative mb-4">
              <IoPerson size={120} className="text-med-green bg-light-green p-4 rounded-full" />
              <button className="absolute bottom-0 right-0 bg-med-green text-white p-2 rounded-full hover:bg-dark-green">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{username}</h2>
            <p className="text-gray-500 dark:text-gray-400">{email}</p>
          </div>
        </div>
        
        {/* Profile Details Section */}
        <div className="col-span-2">
          <div className="bg-white dark:bg-zinc-700 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-med-green"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-med-green"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-med-green resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-med-green"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Enable Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-med-green"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="bg-med-green hover:bg-dark-green text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Save Changes
              </button>
            </div>
            
            {status && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;
