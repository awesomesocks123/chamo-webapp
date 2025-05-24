'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatRoom } from '../lib/chatRoomService';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Define the shape of our global app data
interface AppData {
  chatRooms: ChatRoom[];
  userProfiles: Record<string, any>;
  setChatRooms: (rooms: ChatRoom[]) => void;
  setUserProfile: (userId: string, profile: any) => void;
  getUserProfile: (userId: string) => Promise<any>;
  clearCache: () => void;
  isLoading: boolean;
}

// Create the context with a default value
const AppDataContext = createContext<AppData>({
  chatRooms: [],
  userProfiles: {},
  setChatRooms: () => {},
  setUserProfile: () => {},
  getUserProfile: async () => null,
  clearCache: () => {},
  isLoading: true
});

// Custom hook to use the app data context
export const useAppData = () => useContext(AppDataContext);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // State for chat rooms and user profiles
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load cached data from localStorage on initial mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        // Load cached chat rooms
        const cachedRooms = localStorage.getItem('cachedChatRooms');
        if (cachedRooms) {
          setChatRooms(JSON.parse(cachedRooms));
        }

        // Load cached user profiles
        const cachedProfiles = localStorage.getItem('cachedUserProfiles');
        if (cachedProfiles) {
          setUserProfiles(JSON.parse(cachedProfiles));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cached data:', error);
        setIsLoading(false);
      }
    };

    loadCachedData();
  }, []);

  // Save chat rooms to localStorage whenever they change
  useEffect(() => {
    if (chatRooms.length > 0) {
      try {
        localStorage.setItem('cachedChatRooms', JSON.stringify(chatRooms));
        localStorage.setItem('chatRoomsCacheTimestamp', Date.now().toString());
      } catch (error) {
        console.error('Error caching chat rooms:', error);
      }
    }
  }, [chatRooms]);

  // Save user profiles to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(userProfiles).length > 0) {
      try {
        localStorage.setItem('cachedUserProfiles', JSON.stringify(userProfiles));
        localStorage.setItem('userProfilesCacheTimestamp', Date.now().toString());
      } catch (error) {
        console.error('Error caching user profiles:', error);
      }
    }
  }, [userProfiles]);

  // Function to update a user profile in the cache
  const setUserProfile = (userId: string, profile: any) => {
    setUserProfiles(prev => ({
      ...prev,
      [userId]: {
        ...profile,
        cachedAt: Date.now()
      }
    }));
  };

  // Function to get a user profile, with multiple fallback mechanisms
  const getUserProfile = async (userId: string) => {
    if (!userId) {
      console.warn('getUserProfile called with no userId');
      return null;
    }

    // First check if we have a fresh cached version in memory (less than 5 minutes old)
    const cachedProfile = userProfiles[userId];
    if (cachedProfile && (Date.now() - cachedProfile.cachedAt < 300000)) {
      console.log(`Using in-memory cached profile for user ${userId}`);
      return cachedProfile;
    }

    // Next, check localStorage for a cached version
    if (typeof window !== 'undefined') {
      try {
        const localStorageProfile = localStorage.getItem(`userProfile_${userId}`);
        if (localStorageProfile) {
          const parsedProfile = JSON.parse(localStorageProfile);
          console.log(`Using localStorage cached profile for user ${userId}`);
          // Cache it in memory too
          setUserProfile(userId, parsedProfile);
          return parsedProfile;
        }
      } catch (e) {
        console.warn('Error reading profile from localStorage:', e);
      }
    }

    // If not in cache, try to fetch from Firestore
    try {
      console.log(`Fetching profile for user ${userId} from Firestore`);
      const userRef = doc(db, 'users', userId);
      
      // Set a timeout for the Firestore operation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore operation timed out')), 8000)
      );
      
      // Race between the Firestore operation and the timeout
      const userSnapshot = await Promise.race([
        getDoc(userRef),
        timeoutPromise
      ]) as any;

      if (userSnapshot && userSnapshot.exists()) {
        const userData = userSnapshot.data();
        // Cache the user profile in both memory and localStorage
        setUserProfile(userId, userData);
        
        // Also cache in localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`userProfile_${userId}`, JSON.stringify(userData));
          } catch (e) {
            console.warn('Error caching profile in localStorage:', e);
          }
        }
        
        return userData;
      } else if (cachedProfile) {
        // If Firestore fetch failed but we have a cached version, use it
        console.log(`Using stale cached profile for user ${userId}`);
        return cachedProfile;
      }
    } catch (error) {
      console.error(`Error fetching user profile for ${userId}:`, error);
      
      // If we have any cached version, return it even if stale
      if (cachedProfile) {
        console.log(`Using stale cached profile for user ${userId} after error`);
        return cachedProfile;
      }
    }

    // Check if we have userData in localStorage as a last resort
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.uid === userId) {
            console.log('Using userData from localStorage as fallback');
            return parsedData;
          }
        }
      } catch (e) {
        console.warn('Error reading userData from localStorage:', e);
      }
    }

    // If all else fails, return a default profile
    console.warn(`No profile found for user ${userId}, using default profile`);
    return {
      uid: userId,
      username: 'Unknown User',
      email: '',
      photoURL: null,
      status: 'offline',
      friends: [],
      friendRequests: [],
      sentRequests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cachedAt: Date.now()
    };
  };

  // Function to clear all cached data
  const clearCache = () => {
    localStorage.removeItem('cachedChatRooms');
    localStorage.removeItem('chatRoomsCacheTimestamp');
    localStorage.removeItem('cachedUserProfiles');
    localStorage.removeItem('userProfilesCacheTimestamp');
    setChatRooms([]);
    setUserProfiles({});
  };

  return (
    <AppDataContext.Provider
      value={{
        chatRooms,
        userProfiles,
        setChatRooms,
        setUserProfile,
        getUserProfile,
        clearCache,
        isLoading
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
