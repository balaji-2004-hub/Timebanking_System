"use client";
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Search, Users, ArrowRightLeft, Sparkles, Filter, Clock3 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiListMembers } from '@/lib/timebank-api';

interface MemberSummary {
  email: string;
  displayName: string;
  role: string;
  ageGroup: 'senior' | 'adult' | 'youth';
  credits: number;
  exchanges: number;
  skillsOffered: string[];
  neighborhood: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState<'all' | 'senior' | 'adult' | 'youth'>('all');
  const [sortBy, setSortBy] = useState<'credits' | 'exchanges'>('credits');

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
  }, []);

  const visibleMembers = useMemo(() => {
    const text = query.trim().toLowerCase();
    const filtered = members.filter((member) => {
      const haystack = [member.displayName, member.email, member.neighborhood, member.ageGroup, ...(member.skillsOffered ?? [])].join(' ').toLowerCase();
      const ageMatch = ageFilter === 'all' || member.ageGroup === ageFilter;
      return (!text || haystack.includes(text)) && ageMatch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'credits') return b.credits - a.credits;
      return b.exchanges - a.exchanges;
    });
  }, [members, query, ageFilter, sortBy]);

  const topThree = visibleMembers.slice(0, 3);

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find real registered users, compare skills, and start an exchange.</p>
        </div>
        <button onClick={fetchMembers} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-muted transition-colors w-fit">
          <Users size={14} /> Refresh members
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">How it works</p>
              <h2 className="text-lg font-semibold text-foreground">Choose a user, then exchange credits</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><ArrowRightLeft size={18} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
            {[
              { title: '1. Find a member', desc: 'Search by name, skill, or location.' },
              { title: '2. Open credits', desc: 'Pick the user in the exchange box.' },
              { title: '3. Complete exchange', desc: 'Credits update for both users.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border p-3 bg-muted/30">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1">Members</p>
          <p className="text-4xl font-bold font-tabular">{members.length}</p>
          <p className="text-sm text-amber-100 mt-1">Registered accounts in this backend</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Search</p>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border">
            <Search size={16} className="text-muted-foreground flex-shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, skill, city..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground"><Clock3 size={12} /><span>Updated every time you refresh members</span></div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Age group</label>
            <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value as 'all' | 'senior' | 'adult' | 'youth')} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none">
              <option value="all">All users</option>
              <option value="senior">60+ / Senior</option>
              <option value="adult">Adult</option>
              <option value="youth">Below 60 / Youth</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter size={14} /> Sort members</div>
        <div className="flex gap-2">
          <button onClick={() => setSortBy('credits')} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${sortBy === 'credits' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>Top credits</button>
          <button onClick={() => setSortBy('exchanges')} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${sortBy === 'exchanges' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>Top exchanges</button>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">Loading members...</div>
      ) : visibleMembers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <Sparkles size={28} className="mx-auto text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold text-foreground">No members match your search</h2>
          <p className="text-sm text-muted-foreground mt-1">Try a different name, skill, or location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleMembers.map((member) => (
              <div key={member.email} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{member.role}</p>
                    <p className="mt-1 inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground bg-muted/40">{member.ageGroup === 'senior' ? '60+ / Senior' : member.ageGroup === 'youth' ? 'Below 60 / Youth' : 'Adult'}</p>
                    <h3 className="text-lg font-semibold text-foreground">{member.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Credits</p>
                    <p className="text-2xl font-bold font-tabular text-foreground">{member.credits}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-semibold text-foreground">Area:</span> {member.neighborhood || 'Not set'}</p>
                  <p><span className="font-semibold text-foreground">Exchanges:</span> {member.exchanges}</p>
                  <p><span className="font-semibold text-foreground">Skills:</span> {(member.skillsOffered ?? []).length ? member.skillsOffered.join(', ') : 'No skills added yet'}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/credits?counterparty=${encodeURIComponent(member.email)}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-amber-700 transition-colors">Exchange credits</Link>
                  <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors">Open profile</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Top 3 by {sortBy}</p>
            <div className="space-y-3">
              {topThree.map((member, index) => (
                <div key={member.email} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">#{index + 1}</p>
                    <p className="font-semibold text-foreground">{member.displayName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{sortBy === 'credits' ? 'Credits' : 'Exchanges'}</p>
                    <p className="text-lg font-bold font-tabular text-foreground">{sortBy === 'credits' ? member.credits : member.exchanges}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
