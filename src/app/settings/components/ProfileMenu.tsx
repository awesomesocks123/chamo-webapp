'use client';

import React, { useContext, useState, useEffect } from 'react';
import { IoPerson, IoSave, IoCheckmarkCircle } from 'react-icons/io5';
import { AuthContext } from '../../context/AuthProvider';
import DarkModeToggle from '../../components/DarkModeToggle';
import { getUserProfile, updateUserProfile, UserProfile } from '../../lib/userService';
import { auth } from '../../lib/firebase';

const ProfileMenu: React.FC = () => {
  const { authUser } = useContext(AuthContext);
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [bio, setBio] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('Authentication error');
        return;
      }
      
      // Update user profile in Firebase
      await updateUserProfile(currentUser.uid, {
        username,
        bio,
      });
      
      setSuccess(true);
      setStatus('Profile updated successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setStatus('');
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load user profile data from Firebase
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser) return;
      
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile) {
          setUsername(userProfile.username || 'User');
          setEmail(userProfile.email || 'user@example.com');
          setBio(userProfile.bio || '');
          setStatus(userProfile.status || '');
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [authUser]);

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-zinc-900 rounded-lg p-6">
      <h1 className="text-4xl font-semibold text-gray-700 dark:text-white mb-8">Profile Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm flex flex-col items-center">
            <div className="relative mb-4">
              <IoPerson size={120} className="text-med-green dark:text-light-green bg-light-green dark:bg-dark-green p-4 rounded-full" />
              <button className="absolute bottom-0 right-0 bg-med-green text-white p-2 rounded-full hover:bg-dark-green">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{username}</h2>
            <p className="text-gray-500 dark:text-gray-300">{email}</p>
          </div>
        </div>
        
        {/* Profile Details Section */}
        <div className="col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-med-green"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-med-green"
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                    <DarkModeToggle />
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
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-med-green dark:peer-checked:bg-dark-green"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 bg-med-green text-white py-2 px-4 rounded-md hover:bg-dark-green transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                  {loading ? null : <IoSave />}
                  {success && <IoCheckmarkCircle className="text-white" />}
                </button>
                
                {status && (
                  <p className="mt-2 text-green-600 dark:text-green-400">{status}</p>
                )}
                
                {error && (
                  <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;
