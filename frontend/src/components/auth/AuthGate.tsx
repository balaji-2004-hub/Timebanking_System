'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === '/sign-up-login-screen';
    const isAdminRoute = pathname.startsWith('/admin');

    if (!user && !isLoginPage) {
      router.replace('/sign-up-login-screen');
      return;
    }

    if (user && isLoginPage) {
      router.replace(user.role === 'admin' ? '/admin-dashboard' : '/');
      return;
    }

    if (user && user.role === 'admin' && pathname === '/') {
      router.replace('/admin-dashboard');
      return;
    }

    if (user && isAdminRoute && user.role !== 'admin') {
      router.replace('/');
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading account…
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === '/sign-up-login-screen';
  if (!user && !isLoginPage) {
    return null;
  }

  if (user && pathname.startsWith('/admin') && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
