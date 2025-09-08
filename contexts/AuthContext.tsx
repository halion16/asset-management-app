'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  role: string;
  department: string;
  isAuthenticated: boolean;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Check for existing auth session
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Check if session is still valid (24 hours)
        const loginTime = new Date(parsedUser.loginTime);
        const now = new Date();
        const diffHours = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (diffHours < 24) {
          setUser(parsedUser);
        } else {
          // Session expired, clear storage
          localStorage.removeItem('authUser');
        }
      } catch (error) {
        console.error('Error parsing auth user:', error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    setUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(user));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
      // Redirect to login
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};