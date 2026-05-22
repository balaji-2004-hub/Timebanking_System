'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, Shield, CreditCard, User, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import RealUsersPanel from '@/components/community/RealUsersPanel';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { profile, updateProfile } = useCurrentUserProfile();

  const handleLogout = () => {
    logout();
    router.push('/sign-up-login-screen');
  };

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Edit preferences for the logged-in user only.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Profile', icon: User },
              { label: 'Notifications', icon: Bell },
              { label: 'Privacy', icon: Shield },
              { label: 'Account', icon: CreditCard },
            ].map((item) => (
              <button key={item.label} className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-semibold text-foreground">
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <span className="text-sm font-medium text-foreground">Notifications on</span>
              <input type="checkbox" checked={profile?.settings.notifications ?? true} onChange={(e) => updateProfile({ settings: { ...(profile?.settings ?? { notifications: true, privacy: 'members', emailUpdates: true }), notifications: e.target.checked } })} />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <span className="text-sm font-medium text-foreground">Email updates</span>
              <input type="checkbox" checked={profile?.settings.emailUpdates ?? true} onChange={(e) => updateProfile({ settings: { ...(profile?.settings ?? { notifications: true, privacy: 'members', emailUpdates: true }), emailUpdates: e.target.checked } })} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="rounded-xl border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-semibold text-foreground">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
              <LogOut size={14} /> Logout / Switch user
            </button>
          </div>

          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <p className="font-medium text-foreground">Your settings are empty and user-specific</p>
            <p className="text-sm text-muted-foreground mt-1">Change your account data in Profile or create a new user account.</p>
          </div>
        </div>

        <div className="mt-5">
          <RealUsersPanel title="People using the app" subtitle="Switch users, compare credits, and start exchanges" compact />
        </div>
      </div>
    </AppLayout>
  );
}
