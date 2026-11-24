'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { PRESET_AVATARS } from '@/lib/imageUtils';
import { upsertRemoteProfile, fetchRemoteProfile, isSupabaseConfigured } from '@/lib/supabase';
import { upsertApiProfile, fetchApiProfile } from '@/lib/api';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string) => boolean;
  register: (profileData: Omit<UserProfile, 'id' | 'createdAt'>) => UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_CURRENT_USER = 'loy_krathong_current_user';
const STORAGE_KEY_USERS_DB = 'loy_krathong_users_db';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to get all registered users
  const getUsersDB = (): Record<string, UserProfile> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS_DB);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  // Helper to save all registered users
  const saveUsersDB = (db: Record<string, UserProfile>) => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save users DB:', e);
    }
  };

  // Simple Login by Username
  const login = (username: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return false;

    const db = getUsersDB();
    const existing = db[cleanUsername];

    if (existing) {
      setCurrentUser(existing);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(existing));
      upsertApiProfile(existing);
      if (isSupabaseConfigured()) {
        upsertRemoteProfile(existing);
      }
      return true;
    }

    // Try fetching from PostgreSQL API
    fetchApiProfile(cleanUsername).then((dbUser) => {
      if (dbUser) {
        const updatedDb = getUsersDB();
        updatedDb[cleanUsername] = dbUser;
        saveUsersDB(updatedDb);
        setCurrentUser(dbUser);
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(dbUser));
        return;
      }

      // If not in PostgreSQL, attempt Supabase if configured
      if (isSupabaseConfigured()) {
        fetchRemoteProfile(cleanUsername).then((remoteUser) => {
          if (remoteUser) {
            const updatedDb = getUsersDB();
            updatedDb[cleanUsername] = remoteUser;
            saveUsersDB(updatedDb);
            setCurrentUser(remoteUser);
            localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(remoteUser));
          }
        });
      }
    });

    return false;
  };

  // Register / Create new profile
  const register = (profileData: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile => {
    const rawUsername = (profileData.username || profileData.nickname || 'user_' + Date.now().toString().slice(-4)).trim().toLowerCase();
    const cleanUsername = rawUsername.replace(/[^a-z0-9_]/g, '') || ('user_' + Date.now().toString().slice(-4));
    const newUser: UserProfile = {
      ...profileData,
      id: 'usr-' + Date.now(),
      username: cleanUsername,
      nickname: profileData.nickname || cleanUsername,
      avatarUrl: profileData.avatarUrl || PRESET_AVATARS[0].url,
      createdAt: new Date().toISOString(),
    };

    const db = getUsersDB();
    db[cleanUsername] = newUser;
    saveUsersDB(db);

    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));

    // Sync to PostgreSQL backend
    upsertApiProfile(newUser);

    // Sync to Supabase when configured
    if (isSupabaseConfigured()) {
      upsertRemoteProfile(newUser);
    }

    return newUser;
  };

  // Update Profile
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    const updatedUser: UserProfile = {
      ...currentUser,
      ...updates,
      contacts: {
        ...(currentUser.contacts || {}),
        ...(updates.contacts || {}),
      },
    };

    const db = getUsersDB();
    db[updatedUser.username] = updatedUser;
    saveUsersDB(db);

    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updatedUser));

    // Sync to PostgreSQL backend
    upsertApiProfile(updatedUser);

    // Sync to Supabase when configured
    if (isSupabaseConfigured()) {
      upsertRemoteProfile(updatedUser);
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
