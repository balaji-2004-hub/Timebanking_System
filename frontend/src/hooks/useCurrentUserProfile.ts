'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { TimeBankProfile } from '@/lib/timebank-store';
import { apiGetProfile, apiUpdateProfile } from '@/lib/timebank-api';

export function useCurrentUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TimeBankProfile | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let active = true;
    const sync = async () => {
      try {
        const next = await apiGetProfile(user.email);
        if (active) setProfile(next);
      } catch {
        // keep last known state
      }
    };

    sync();
    const interval = window.setInterval(sync, 3500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [user?.email, user?.role, user?.displayName]);

  const updateProfile = async (patch: Partial<TimeBankProfile>) => {
    if (!user) return null;
    setProfile((current: TimeBankProfile | null) => current ? { ...current, ...patch, ageGroup: patch.ageGroup ?? current.ageGroup, stats: { ...current.stats, ...(patch.stats ?? {}) }, settings: { ...current.settings, ...(patch.settings ?? {}) }, skillsOffered: patch.skillsOffered ?? current.skillsOffered, skillsNeeded: patch.skillsNeeded ?? current.skillsNeeded, recentActivity: patch.recentActivity ?? current.recentActivity, transactions: patch.transactions ?? current.transactions, firstListing: patch.firstListing === undefined ? current.firstListing : patch.firstListing } : current);
    const next = await apiUpdateProfile(user.email, patch);
    setProfile(next);
    return next;
  };

  return useMemo(() => ({ user, profile, setProfile, updateProfile }), [user, profile]);
}
