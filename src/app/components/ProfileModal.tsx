'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IoPerson, IoClose, IoCheckmark, IoPersonAdd, IoMail, IoCalendar } from 'react-icons/io5';
import { auth } from '../lib/firebase';
import { getUserProfile, sendFriendRequest, UserProfile } from '../lib/userService';

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ userId, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState<boolean>(false);
  const [isFriend, setIsFriend] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        console.error('No userId provided to ProfileModal');
        setError('User ID is required to view profile');
        setLoading(false);
        return;
      }

      console.log('Fetching profile for user ID:', userId);
      
      try {
        const profile = await getUserProfile(userId);
        console.log('Profile data retrieved:', profile);
        
        if (profile) {
          setUserProfile(profile);
          
          // Check if this user is a friend of the current user
          if (auth.currentUser && profile.friends?.includes(auth.currentUser.uid)) {
            console.log('This user is a friend of the current user');
            setIsFriend(true);
          }
          
          // Check if a friend request has been sent to this user
          if (auth.currentUser && profile.friendRequests?.includes(auth.currentUser.uid)) {
            console.log('Friend request has been sent to this user');
            setRequestSent(true);
          }
        } else {
          console.warn('No profile found for user ID:', userId);
          setError('User profile not found');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => {
      if (modalRef.current) {
        console.log('Animating profile modal in');
        modalRef.current.classList.remove('translate-x-full');
        modalRef.current.classList.add('translate-x-0');
      } else {
        console.warn('Profile modal ref is null, cannot animate');
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

  const handleSendFriendRequest = async () => {
    if (!auth.currentUser || !userProfile) return;
    
    try {
      await sendFriendRequest(auth.currentUser.uid, userId);
      setRequestSent(true);
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
    }
  };

  const handleClose = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove('translate-x-0');
      modalRef.current.classList.add('translate-x-full');
      
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 md:bg-opacity-30" onClick={handleClose}>
      <div
        ref={modalRef}
        className="w-full h-full md:w-[400px] bg-[#f0f0f0] dark:bg-zinc-800 transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center h-[60px] px-4 bg-med-green">
          <div className="flex items-center">
            <button onClick={handleClose} className="text-white hover:text-gray-200 mr-3">
              <IoClose size={24} />
            </button>
            <h2 className="text-xl font-medium text-white">Profile</h2>
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
              <button onClick={handleClose} className="mt-4 px-4 py-2 bg-med-green text-white rounded hover:bg-dark-green transition-colors">Close</button>
            </div>
          </div>
        ) : userProfile ? (
          <div className="flex flex-col h-full overflow-auto">
            <div className="flex flex-col items-center p-6 space-y-4">
              <div className="relative">
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.username} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-med-green flex items-center justify-center text-white text-3xl">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white">{userProfile.username}</h3>
              <div className="flex items-center text-gray-600 dark:text-white">
                <IoMail className="mr-2" />
                <span>{userProfile.email}</span>
              </div>
              {userProfile.createdAt && (
                <div className="flex items-center text-gray-600 dark:text-white text-sm">
                  <IoCalendar className="mr-2" />
                  <span>Joined {typeof userProfile.createdAt === 'object' && 'seconds' in userProfile.createdAt
                    ? new Date((userProfile.createdAt as any).seconds * 1000).toLocaleDateString()
                    : new Date(userProfile.createdAt as any).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="flex-1 p-4">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2 text-black dark:text-white">Actions</h4>
                <div className="space-y-2">
                  {isFriend ? (
                    <button className="w-full py-2 px-4 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white rounded flex items-center justify-center" disabled>
                      <IoCheckmark className="mr-2" /> Friends
                    </button>
                  ) : requestSent ? (
                    <button className="w-full py-2 px-4 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white rounded flex items-center justify-center" disabled>
                      <IoCheckmark className="mr-2" /> Request Sent
                    </button>
                  ) : (
                    <button onClick={handleSendFriendRequest} className="w-full py-2 px-4 bg-med-green text-white rounded hover:bg-dark-green dark:hover:bg-light-green transition-colors flex items-center justify-center">
                      <IoPersonAdd className="mr-2" /> Add Friend
                    </button>
                  )}
                  <button className="w-full py-2 px-4 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">Block User</button>
                  <button className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Report User</button>
                </div>
              </div>
              {userProfile.bio && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2 text-black dark:text-white">Bio</h4>
                  <p className="text-gray-600 dark:text-white">{userProfile.bio}</p>
                </div>
              )}
              <div>
                <h4 className="text-lg font-medium mb-2 text-black dark:text-white">Status</h4>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${userProfile.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <p className="text-gray-600 dark:text-white capitalize">{userProfile.status || 'Offline'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600 dark:text-white">User not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;