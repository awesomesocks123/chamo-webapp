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

  // Function to get a user profile, first from cache, then from Firestore
  const getUserProfile = async (userId: string) => {
    // First check if we have a fresh cached version (less than 5 minutes old)
    const cachedProfile = userProfiles[userId];
    if (cachedProfile && (Date.now() - cachedProfile.cachedAt < 300000)) {
      console.log(`Using cached profile for user ${userId}`);
      return cachedProfile;
    }

    // If not in cache or cache is stale, try to fetch from Firestore
    try {
      console.log(`Fetching profile for user ${userId} from Firestore`);
      const userRef = doc(db, 'users', userId);
      
      // Set a timeout for the Firestore operation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore operation timed out')), 5000)
      );
      
      // Race between the Firestore operation and the timeout
      const userSnapshot = await Promise.race([
        getDoc(userRef),
        timeoutPromise
      ]) as any;

      if (userSnapshot && userSnapshot.exists()) {
        const userData = userSnapshot.data();
        // Cache the user profile
        setUserProfile(userId, userData);
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

    // If all else fails, return a default profile
    return {
      uid: userId,
      username: 'Unknown User',
      photoURL: null,
      status: 'offline',
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
