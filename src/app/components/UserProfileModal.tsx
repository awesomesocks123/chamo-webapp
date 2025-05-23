'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IoPerson, IoClose, IoCamera, IoPencil, IoMail, IoCalendar } from 'react-icons/io5';
import { auth } from '../lib/firebase';
import { getUserProfile, updateUserProfile, UserProfile } from '../lib/userService';

interface UserProfileModalProps {
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  
  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Add debugging to see if auth.currentUser exists
      console.log('Auth current user:', auth.currentUser);
      
      if (!auth.currentUser) {
        console.warn('No current user found in auth object');
        setError('You must be logged in to view your profile');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching profile for user ID:', auth.currentUser.uid);
        const profile = await getUserProfile(auth.currentUser.uid);
        console.log('Profile data retrieved:', profile);
        
        if (profile) {
          setUserProfile(profile);
          setBio(profile.bio || '');
        } else {
          console.warn('No profile found for current user');
          setError('Profile not found. Please complete your profile setup.');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    // Check if auth is initialized before fetching
    if (auth) {
      fetchUserProfile();
    } else {
      console.error('Firebase auth not initialized');
      setError('Authentication service not available');
      setLoading(false);
    }
  }, []);
  
  // Handle animation and keyboard events
  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => {
      if (modalRef.current) {
        console.log('Animating modal in');
        modalRef.current.classList.remove('translate-x-full');
        modalRef.current.classList.add('translate-x-0');
      } else {
        console.warn('Modal ref is null, cannot animate');
      }
    }, 50); // Slightly longer delay to ensure DOM is ready
    
    // Add event listener to handle escape key
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      clearTimeout(timer);
    };
  }, []);

  // Handle close with animation
  const handleClose = () => {
    if (modalRef.current) {
      // Trigger slide-out animation
      modalRef.current.classList.remove('translate-x-0');
      modalRef.current.classList.add('translate-x-full');

      // Wait for animation to complete before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onClose();
    }
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser || !userProfile) return;

    try {
      await updateUserProfile(auth.currentUser.uid, { bio });
      setUserProfile(prev => prev ? { ...prev, bio } : null);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 md:bg-opacity-30"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="w-full h-full md:w-[400px] bg-[#f0f0f0] dark:bg-zinc-800 transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center h-[60px] px-4 bg-med-green">
          <div className="flex items-center">
            <button onClick={handleClose} className="text-white hover:text-gray-200 mr-3">
              <IoClose size={24} />
            </button>
            <h2 className="text-xl font-medium text-white">My Profile</h2>
          </div>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-med-green"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-med-green text-white rounded hover:bg-dark-green transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : userProfile ? (
        <>
          <div className="flex flex-col items-center p-6 space-y-4">
            <div className="relative">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.username} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-med-green flex items-center justify-center text-white text-3xl">
                  {userProfile.username.charAt(0).toUpperCase()}
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-med-green text-white rounded-full p-1 hover:bg-dark-green">
                <IoCamera size={18} />
              </button>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white">{userProfile.username}</h3>
            <p className="text-gray-600 dark:text-white">{userProfile.email}</p>
          </div>
          

          <div className="flex-1 p-4">
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2 text-black dark:text-white">Account Information</h4>
              <div className="bg-white dark:bg-zinc-700 rounded-lg p-4 shadow-sm">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-white mb-1">Username</p>
                  <p className="font-medium text-black dark:text-white">{userProfile.username}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-white mb-1">Email</p>
                  <p className="font-medium text-black dark:text-white">{userProfile.email}</p>
                </div>
                {userProfile.createdAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-white mb-1">Account Created</p>
                    <p className="font-medium text-black dark:text-white">
                      {typeof userProfile.createdAt === 'object' && 'seconds' in userProfile.createdAt
                        ? new Date((userProfile.createdAt as any).seconds * 1000).toLocaleDateString()
                        : new Date(userProfile.createdAt as any).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2 text-black dark:text-white">Bio</h4>
              <div className="bg-white dark:bg-zinc-700 rounded-lg p-4 shadow-sm">
                {editMode ? (
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-med-green dark:bg-zinc-800 dark:text-white"
                      rows={4}
                      placeholder="Tell others about yourself..."
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => {
                          setBio(userProfile.bio || '');
                          setEditMode(false);
                        }}
                        className="px-3 py-1 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-white rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="px-3 py-1 bg-med-green text-white rounded hover:bg-dark-green"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-white">
                    {userProfile.bio || 'No bio provided yet.'}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2 text-black dark:text-white">Privacy Settings</h4>
              <div className="bg-white dark:bg-zinc-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-black dark:text-white">Show Online Status</p>
                    <p className="text-sm text-gray-600 dark:text-white">Allow others to see when you're online</p>
                  </div>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="toggle" 
                      className="sr-only" 
                    />
                    <label 
                      htmlFor="toggle" 
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-zinc-600 cursor-pointer"
                    >
                      <span 
                        className={`absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 dark:border-zinc-600 appearance-none cursor-pointer transform transition-transform duration-200 ease-in-out`}
                      ></span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black dark:text-white">Allow Friend Requests</p>
                    <p className="text-sm text-gray-600 dark:text-white">Receive friend requests from other users</p>
                  </div>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="toggle2" 
                      id="toggle2" 
                      className="sr-only" 
                      defaultChecked 
                    />
                    <label 
                      htmlFor="toggle2" 
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-zinc-600 cursor-pointer"
                    >
                      <span 
                        className={`absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 dark:border-zinc-600 appearance-none cursor-pointer transform transition-transform duration-200 ease-in-out`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-white">User not found</p>
        </div>
      )}
    </div>
    </div>
  );
};

export default UserProfileModal;
