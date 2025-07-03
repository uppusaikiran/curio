'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/authService';
import { User } from '@supabase/supabase-js';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  signIn: async () => {
    throw new Error('AuthContext not initialized');
  },
  signUp: async () => {
    throw new Error('AuthContext not initialized');
  },
  signOut: async () => {
    throw new Error('AuthContext not initialized');
  }
});

// Export the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the auth hook to get authentication state and methods
  const auth = useAuth();
  
  // Provide the auth context to children components
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Export a hook to use the auth context
export function useAuthContext() {
  return useContext(AuthContext);
} 