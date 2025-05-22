'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  authUser: string | null;
  setAuthUser: (user: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  authUser: null,
  setAuthUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [authUser, setAuthUserState] = useState<string | null>(null);
  
  // Load authentication state from localStorage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setAuthUserState(storedUser);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
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
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
}
