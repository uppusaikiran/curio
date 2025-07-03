'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Auth service with Supabase implementation
export const authService = {
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('getCurrentUser result:', user);
    return user;
  },
  
  // Sign in user
  signIn: async (email: string, password: string): Promise<User> => {
    console.log('Attempting to sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error.message);
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('User not found');
    }
    
    console.log('Sign in successful:', data.user);
    return data.user;
  },
  
  // Sign up user
  signUp: async (name: string, email: string, password: string): Promise<User> => {
    console.log('Attempting to sign up with email:', email);
    // First, create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    
    if (error) {
      console.error('Sign up error:', error.message);
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('Failed to create user');
    }
    
    console.log('Sign up successful:', data.user);
    return data.user;
  },
  
  // Sign out user
  signOut: async (): Promise<void> => {
    console.log('Attempting to sign out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
      throw new Error(error.message);
    }
    console.log('Sign out successful');
  }
};

// Auth hook for components
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user || null);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user || null);
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    try {
      const user = await authService.signIn(email, password);
      return user;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };
  
  const signUp = async (name: string, email: string, password: string) => {
    try {
      const user = await authService.signUp(name, email, password);
      return user;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };
  
  const signOut = async () => {
    await authService.signOut();
  };
  
  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
} 