'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Clock, ArrowRightLeft, Star, Plus, ChevronRight, Sparkles, Users, MessageSquare, Briefcase, CheckCircle2, Handshake } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { apiEarnCredits } from '@/lib/timebank-api';
import RealUsersPanel from '@/components/community/RealUsersPanel';

export default function HomePage() {
  const { user, profile, setProfile } = useCurrentUserProfile();
  const name = profile?.displayName || user?.displayName || 'New user';
  const stats = profile?.stats;
  const credits = stats?.credits ?? 1;
  const [description, setDescription] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const handleCompleteService = async () => {
    if (!user) return;
    setActionError('');
    setActionMessage('');
    const note = description.trim();
    if (!note) {
      setActionError('Please write a description.');
      return;
    }
    const normalized = note.toLowerCase().replace(/\s+/g, ' ');
    const duplicate = profile?.transactions?.some((tx) => tx.description.trim().toLowerCase().replace(/\s+/g, ' ') === normalized);
    if (duplicate) {
      setActionError('This description was already used. Please write a new one.');
      return;
    }
    try {
      const next = await apiEarnCredits(user.email, 1, note);
      setProfile(next);
      setDescription('');
      setActionMessage('Earned 1 credit from the completed service.');
      window.setTimeout(() => setActionMessage(''), 2400);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to complete service');
    }
  };

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, {name} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your dashboard shows only your own data and starts empty.</p>
        </div>
        <Link href="/service-listings" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-amber-700 transition-colors btn-press w-fit">
          <Plus size={14} /> Post a Listing
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Clock size={20} className="text-white" /></div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Your Balance</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1">Time Credits</p>
          <p className="text-4xl font-bold font-tabular text-white mb-1">{credits}</p>
          <p className="text-sm text-amber-100">hours available to spend</p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
            <div>
              <p className="text-xs text-amber-100">Given</p>
              <p className="text-sm font-bold font-tabular">{stats?.given ?? 0} hrs</p>
            </div>
            <div>
              <p className="text-xs text-amber-100">Received</p>
              <p className="text-sm font-bold font-tabular">{stats?.received ?? 0} hrs</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-white/10 p-4">
            <div className="flex items-center gap-2 mb-1"><Handshake size={14} className="text-white" /><p className="text-sm font-semibold text-white">Support Hub</p></div>
            <p className="text-sm text-amber-50">Use the support page for seniors 60+, younger members, and family help requests.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-3"><ArrowRightLeft size={18} className="text-success" /></div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Exchanges</p>
          <p className="text-2xl font-bold font-tabular text-foreground">{stats?.exchanges ?? 0}</p>
          <p className="text-xs text-success font-medium mt-1">Ready to grow</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3"><Star size={18} className="text-amber-500" /></div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Rating</p>
          <p className="text-2xl font-bold font-tabular text-foreground">{(stats?.rating ?? 0).toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats?.reviews ?? 0} reviews</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center mb-3"><Users size={18} className="text-info" /></div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Listings</p>
          <p className="text-2xl font-bold font-tabular text-foreground">{stats?.listings ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first listing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Quick Credit Action</h3>
            <span className="text-xs text-muted-foreground">Write a description to earn 1 credit</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none resize-none"
                placeholder="Helped a member with their laptop"
              />
            </div>
            <button onClick={handleCompleteService} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-amber-700 transition-colors btn-press">
              <CheckCircle2 size={14} /> Complete Service
            </button>
            {actionMessage && <p className="text-sm text-success font-medium">{actionMessage}</p>}
            {actionError && <p className="text-sm text-danger font-medium">{actionError}</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Link href="/credits" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">View all <ChevronRight size={12} /></Link>
          </div>
          <div className="border border-dashed border-border rounded-xl p-6 text-center">
            <Sparkles size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="font-medium text-foreground">{profile?.recentActivity?.length ? profile.recentActivity[0] : 'No activity yet'}</p>
            <p className="text-sm text-muted-foreground mt-1">{profile?.recentActivity?.length ? 'More updates are available on the Credits page.' : 'Your exchanges will appear here after the first interaction.'}</p>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-1"><Handshake size={14} className="text-primary" /><p className="text-sm font-semibold text-foreground">Support Hub</p></div>
            <p className="text-sm text-muted-foreground">Use the support page for seniors 60+, younger members, and family help requests.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground">How credits move</h3><span className="text-xs text-muted-foreground">Very simple flow</span></div>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>• You help another member and earn credits.</p>
            <p>• You request help and spend credits.</p>
            <p>• The balance, activity, and history update together.</p>
            <p>• Your changes stay saved even after refresh.</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground">Quick Start</h3><Link href="/service-listings" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">Browse listings <ChevronRight size={12} /></Link></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'Post a skill', desc: 'Share what you can do.', href: '/service-listings', icon: Briefcase },
              { title: 'Find members', desc: 'Choose a real user.', href: '/community', icon: Users },
              { title: 'Complete profile', desc: 'Add your details.', href: '/profile', icon: MessageSquare },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="rounded-xl border border-border p-4 hover:bg-muted transition-colors">
                <item.icon size={18} className="text-primary mb-2" />
                <p className="font-semibold text-foreground text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <RealUsersPanel title="Real users" subtitle="Live member list for this browser" />
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground">Working process</h3><span className="text-xs text-muted-foreground">Simple steps</span></div>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>• Sign up a new account.</p>
            <p>• Add a profile and first listing.</p>
            <p>• Pick a real member from the list.</p>
            <p>• Earn or spend credits through exchange.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
