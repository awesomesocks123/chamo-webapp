'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  authUser: string | null;
  setAuthUser: (user: string | null) => void;
  isInitializing: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  authUser: null,
  setAuthUser: () => {},
  isInitializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [authUser, setAuthUserState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Listen to Firebase authentication state changes
  useEffect(() => {
    let unsubscribe: () => void;

    try {
      // Check if auth object is properly initialized
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in
            setAuthUserState(user.uid);
            localStorage.setItem('authUser', user.uid);
            console.log('User authenticated:', user.uid);
          } else {
            // User is signed out
            // Check localStorage as fallback
            try {
              const storedUser = localStorage.getItem('authUser');
              if (storedUser) {
                console.log('Using stored authentication from localStorage');
                setAuthUserState(storedUser);
              } else {
                setAuthUserState(null);
                localStorage.removeItem('authUser');
              }
            } catch (error) {
              console.error('Error accessing localStorage:', error);
              setAuthUserState(null);
            }
          }
          setIsInitializing(false);
        });
      } else {
        // Firebase auth not available, fallback to localStorage
        console.warn('Firebase auth not available, using localStorage only');
        try {
          const storedUser = localStorage.getItem('authUser');
          if (storedUser) {
            console.log('Using stored authentication from localStorage');
            setAuthUserState(storedUser);
          }
        } catch (error) {
          console.error('Error accessing localStorage:', error);
        }
        setIsInitializing(false);
      }
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setIsInitializing(false);
    }
    
    // Cleanup subscription if it exists
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Custom setter that updates both state and localStorage
  const setAuthUser = (user: string | null) => {
    setAuthUserState(user);
    try {
      if (user) {
        localStorage.setItem('authUser', user);
      } else {
        localStorage.removeItem('authUser');
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}
