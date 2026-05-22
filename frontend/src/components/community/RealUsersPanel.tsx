'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Users, ArrowRightLeft, MapPin } from 'lucide-react';
import { apiListMembers } from '@/lib/timebank-api';

export interface MemberSummary {
  email: string;
  displayName: string;
  role: string;
  ageGroup: 'senior' | 'adult' | 'youth';
  credits: number;
  exchanges: number;
  skillsOffered: string[];
  neighborhood: string;
}

interface RealUsersPanelProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  showExchangeLink?: boolean;
}

export default function RealUsersPanel({
  title = 'Real users',
  subtitle = 'Accounts saved in this browser',
  compact = false,
  showExchangeLink = true,
}: RealUsersPanelProps) {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await apiListMembers();
      setMembers(data.members);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    const timer = window.setInterval(fetchMembers, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const topMembers = useMemo(() => members.slice(0, compact ? 3 : 4), [members, compact]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
          <h3 className="text-lg font-semibold text-foreground">{members.length} registered member{members.length === 1 ? '' : 's'}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <button
          onClick={fetchMembers}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {topMembers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <Users size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="font-medium text-foreground">No users yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create a new account to see the member list populate here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topMembers.map((member) => (
            <div key={member.email} className="rounded-xl border border-border p-3 bg-muted/20">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground truncate">{member.displayName}</p>
                  <p className="mt-1 inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground bg-muted/40">{member.ageGroup === 'senior' ? '60+ / Senior' : member.ageGroup === 'youth' ? 'Below 60 / Youth' : 'Adult'}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{member.role}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users size={12} /> {member.credits} credits</span>
                <span className="inline-flex items-center gap-1"><ArrowRightLeft size={12} /> {member.exchanges} exchanges</span>
                <span className="inline-flex items-center gap-1"><MapPin size={12} /> {member.neighborhood || 'No area set'}</span>
              </div>
              {showExchangeLink && (
                <Link
                  href={`/credits?counterparty=${encodeURIComponent(member.email)}`}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                >
                  Start exchange
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
