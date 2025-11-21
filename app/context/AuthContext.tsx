'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Simplified type for user data (excluding password)
export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  role: 'client' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility function to get user from local storage (simulating session)
const getStoredUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
  return null;
};

// Utility function to store user
const setStoredUser = (user: AuthUser | null) => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount, load user from local storage
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (res.ok) {
        const data = await res.json();
        const authUser: AuthUser = data.user;
        setUser(authUser);
        setStoredUser(authUser);
        return true;
      } else {
        const errorData = await res.json();
        console.error('Login failed:', errorData.error);
        alert(`Login failed: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      console.error('Network or system error during login:', error);
      alert('An unexpected error occurred during login.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        // Automatically log in the user after successful registration
        const data = await res.json();
        const authUser: AuthUser = data.user;
        setUser(authUser);
        setStoredUser(authUser);
        return true;
      } else {
        const errorData = await res.json();
        console.error('Registration failed:', errorData.error);
        alert(`Registration failed: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      console.error('Network or system error during registration:', error);
      alert('An unexpected error occurred during registration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    try {
      // In a real app, this would call /api/auth/logout to clear the server session (cookies)
      // For this environment, we just clear local state.
      setStoredUser(null);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated, isAdmin }}>
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