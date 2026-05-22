'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser, LoginInput, RegisterInput, clearSessionUser, findAccount, getProfile, getSessionUser, setSessionUser } from '@/lib/timebank-store';
import { apiLogin, apiRegister, apiUpdateProfile } from '@/lib/timebank-api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

// Shared context that exposes authentication state and actions.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Current signed-in user available across the application.
  const [user, setUser] = useState<AuthUser | null>(null);
  // Keeps the UI in a loading state until session recovery completes.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSessionUser());
    setIsLoading(false);
  }, []);

  // Sign in through the backend, then persist the session locally.
  const login = async (input: LoginInput) => {
    try {
      const nextUser = await apiLogin(input);
      setSessionUser(nextUser, Boolean(input.rememberMe));
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in right now';
      const legacyAccount = findAccount(input.email);
      if (legacyAccount && legacyAccount.password === input.password) {
        const migrated = await apiRegister({
          email: legacyAccount.email,
          password: legacyAccount.password,
          displayName: legacyAccount.displayName,
          role: legacyAccount.role,
          credits: legacyAccount.credits,
          ageGroup: legacyAccount.ageGroup,
          rememberMe: input.rememberMe,
        });

        const localProfile = getProfile(legacyAccount.email);
        await apiUpdateProfile(legacyAccount.email, localProfile);

        setSessionUser(migrated, Boolean(input.rememberMe));
        setUser(migrated);
        return migrated;
      }

      throw new Error(message);
    }
  };

  // Create a new account and immediately sign the user in.
  const register = async (input: RegisterInput) => {
    const nextUser = await apiRegister(input);
    setSessionUser(nextUser, Boolean(input.rememberMe));
    setUser(nextUser);
    return nextUser;
  };

  // Clear the local session and reset the authenticated user state.
  const logout = () => {
    clearSessionUser();
    setUser(null);
  };

  // Memoize the context value to avoid unnecessary re-renders.
  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
