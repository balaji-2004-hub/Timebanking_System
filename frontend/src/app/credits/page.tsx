'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Clock, TrendingUp, TrendingDown, Download, PlusCircle, MinusCircle, History, Users, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { apiCompleteExchange, apiEarnCredits, apiSpendCredits, apiListMembers } from '@/lib/timebank-api';
import RealUsersPanel from '@/components/community/RealUsersPanel';

interface MemberSummary {
  email: string;
  displayName: string;
  role: string;
  credits: number;
  exchanges: number;
  skillsOffered: string[];
  neighborhood: string;
}

export default function CreditsPage() {
  const { user, profile, setProfile } = useCurrentUserProfile();
  const searchParams = useSearchParams();
  const stats = profile?.stats;
  const [amount, setAmount] = useState(1);
  const [description, setDescription] = useState('');
  const [counterpartyEmail, setCounterpartyEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const data = await apiListMembers();
      setMembers(data.members.filter((member) => member.email !== user?.email));
      if (!counterpartyEmail && data.members.length > 1) {
        const firstOther = data.members.find((member) => member.email !== user?.email);
        if (firstOther) setCounterpartyEmail(firstOther.email);
      }
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (user) fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  useEffect(() => {
    const target = searchParams.get('counterparty') || searchParams.get('target');
    if (target) setCounterpartyEmail(target);
  }, [searchParams]);

  const selectedMember = useMemo(
    () => members.find((member) => member.email === counterpartyEmail) ?? null,
    [counterpartyEmail, members],
  );

  const handleEarn = async () => {
    if (!user) return;
    setError('');
    setStatus('');
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }
    const nextDescription = description.trim().toLowerCase().replace(/\s+/g, ' ');
    if (profile?.transactions?.some((tx) => tx.description.trim().toLowerCase().replace(/\s+/g, ' ') === nextDescription)) {
      setError('That description was already used. Please write a new one.');
      return;
    }
    try {
      const next = await apiEarnCredits(user.email, 1, description.trim());
      setProfile(next);
      setStatus('Added 1 credit to your account.');
      setDescription('');
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add credits');
    }
  };

  const handleSpend = async () => {
    if (!user) return;
    setError('');
    setStatus('');
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }
    const nextDescription = description.trim().toLowerCase().replace(/\s+/g, ' ');
    if (profile?.transactions?.some((tx) => tx.description.trim().toLowerCase().replace(/\s+/g, ' ') === nextDescription)) {
      setError('That description was already used. Please write a new one.');
      return;
    }
    try {
      const next = await apiSpendCredits(user.email, amount, description.trim());
      setProfile(next);
      setStatus(`Spent ${amount} credit${amount === 1 ? '' : 's'} from your account.`);
      setDescription('');
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to spend credits');
    }
  };

  const handleExchange = async () => {
    if (!user || !counterpartyEmail.trim()) return;
    setError('');
    setStatus('');
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }
    const nextDescription = description.trim().toLowerCase().replace(/\s+/g, ' ');
    if (profile?.transactions?.some((tx) => tx.description.trim().toLowerCase().replace(/\s+/g, ' ') === nextDescription)) {
      setError('That description was already used. Please write a new one.');
      return;
    }
    try {
      const result = await apiCompleteExchange({
        providerEmail: counterpartyEmail.trim(),
        requesterEmail: user.email,
        amount,
        description: description.trim(),
      });
      setProfile(result.requester);
      setStatus(`Completed exchange with ${selectedMember?.displayName ?? counterpartyEmail.trim()}.`);
      setDescription('');
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete exchange');
    }
  };

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Credit Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Refresh-safe, user-specific credits that persist after close and reopen.</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Choose a registered member, enter the amount, then click Earn, Spend, or Complete exchange. The server saves everything, so the numbers stay after refresh or reopening the app.</p>
        </div>
        <button
          onClick={fetchMembers}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors btn-press w-fit"
        >
          <RefreshCw size={14} /> Refresh users
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <div className="col-span-1 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3"><Clock size={18} /></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1">Balance</p>
          <p className="text-4xl font-bold font-tabular mb-1">{stats?.credits ?? 1}</p>
          <p className="text-sm text-amber-100">hours available</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-3"><TrendingUp size={18} className="text-success" /></div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Given</p>
          <p className="text-3xl font-bold font-tabular text-foreground">{stats?.given ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Credits earned by helping others</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center mb-3"><TrendingDown size={18} className="text-danger" /></div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Received</p>
          <p className="text-3xl font-bold font-tabular text-foreground">{stats?.received ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Credits spent on help</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center mb-3"><History size={18} className="text-info" /></div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Transactions</p>
          <p className="text-3xl font-bold font-tabular text-foreground">{profile?.transactions?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Saved to your account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Update credits</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Amount / Hours</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none"
                  placeholder="Write a unique description"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <label className="block text-xs font-semibold text-muted-foreground">Other user</label>
                <button type="button" onClick={fetchMembers} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <RefreshCw size={12} /> Reload members
                </button>
              </div>
              <select
                value={counterpartyEmail}
                onChange={(e) => setCounterpartyEmail(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none"
              >
                <option value="">Choose a registered user</option>
                {members.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.displayName} · {member.email} · {member.credits} credits
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-dashed border-border p-4 bg-muted/20 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Simple flow</p>
              <p>1. Write a unique description. 2. Choose a user. 3. Use Earn, Spend, or Exchange. 4. The balance changes instantly and stays saved.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEarn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-amber-700 transition-colors btn-press"
              >
                <PlusCircle size={14} /> Earn credits
              </button>
              <button
                onClick={handleSpend}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                <MinusCircle size={14} /> Spend credits
              </button>
              <button
                onClick={handleExchange}
                disabled={!counterpartyEmail || loadingMembers}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <CheckCircle2 size={14} /> Complete exchange
              </button>
            </div>

            {status && <p className="text-sm font-medium text-success">{status}</p>}
            {error && <p className="text-sm font-medium text-danger">{error}</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">How credits work</h3>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>• Complete a service to earn credits.</p>
            <p>• Spend credits when another member helps you.</p>
            <p>• Pick a real registered member from the dropdown to exchange credits.</p>
            <p>• Every action is saved in the backend, so refresh and reopen still keep the numbers.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Transaction history</h3>
          {profile?.transactions?.length ? (
            <div className="space-y-3">
              {profile.transactions.map((tx) => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`text-sm font-semibold ${tx.kind === 'earned' ? 'text-success' : 'text-danger'}`}>
                    {tx.kind === 'earned' ? '+' : '-'}{tx.amount} credit{tx.amount === 1 ? '' : 's'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-xl p-8 text-center">
              <Clock size={28} className="mx-auto text-muted-foreground mb-3" />
              <h2 className="text-lg font-semibold text-foreground">No credit transactions yet</h2>
              <p className="text-sm text-muted-foreground mt-1">Earn or spend credits using the form above.</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Registered members</h3>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
            {members.length ? members.map((member) => (
              <button
                key={member.email}
                type="button"
                onClick={() => setCounterpartyEmail(member.email)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${counterpartyEmail === member.email ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{member.displayName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-foreground">{member.role}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{member.neighborhood || 'No neighborhood added'}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span>{member.credits} credits</span>
                  <span>{member.exchanges} exchanges</span>
                </div>
              </button>
            )) : (
              <p className="text-sm text-muted-foreground">{loadingMembers ? 'Loading members…' : 'No other registered members yet.'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RealUsersPanel title="Real users to exchange with" subtitle="Choose an actual registered account" />
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Credit flow</h3>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>• Earn credits after helping another member.</p>
            <p>• Spend credits when you receive help.</p>
            <p>• Exchange credits between two real users.</p>
            <p>• Refreshing the page keeps the saved balance.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
