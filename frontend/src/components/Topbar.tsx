'use client';
/* Layout or shell component responsible for the global app structure. */
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Search, MessageSquare, Bell, LogOut } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';

interface TopbarProps {
  variant?: 'member' | 'admin';
}

export default function Topbar({ variant = 'member' }: TopbarProps) {
  const { user, logout } = useAuth();
  const { profile } = useCurrentUserProfile();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/sign-up-login-screen');
  };

  const label = profile?.displayName ?? user?.displayName ?? (variant === 'admin' ? 'Admin User' : 'New User');
  const initial = label.slice(0, 1).toUpperCase();

  return (
    <header className="bg-white border-b border-border h-16 flex items-center px-4 lg:px-6 flex-shrink-0 z-20 relative">
      <div className="flex lg:hidden items-center gap-2 mr-4">
        <AppLogo size={28} />
        <span className="font-bold text-foreground text-base">TimeBank</span>
      </div>

      <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
        <Search size={16} className="text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search services, members..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/messages"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <MessageSquare size={18} />
        </Link>
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            {initial}
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{profile?.email ?? user?.email ?? 'Create your first account'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
