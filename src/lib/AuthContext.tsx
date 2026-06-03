'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, User } from './db';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error refreshing user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
      setLoading(false);
      
      // Handle redirects based on login status
      const isAuthPage = pathname.startsWith('/auth');
      if (updatedUser) {
        if (isAuthPage) {
          router.replace('/dashboard');
        }
      } else {
        if (!isAuthPage) {
          router.replace('/auth/login');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pathname, router]);

  const signOut = async () => {
    setLoading(true);
    await auth.signOut();
    setUser(null);
    setLoading(false);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
