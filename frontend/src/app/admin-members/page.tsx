'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users } from 'lucide-react';
import RealUsersPanel from '@/components/community/RealUsersPanel';
import { apiListMembers } from '@/lib/timebank-api';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    apiListMembers().then((data) => setMembers(data.members)).catch(() => setMembers([]));
  }, []);

  return (
    <AppLayout variant="admin">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All registered accounts pulled from the backend.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg px-3 py-2"><Users size={14} /><span className="font-semibold text-foreground font-tabular">{members.length}</span> total members</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
        {members.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <Users size={28} className="mx-auto text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold text-foreground">No members to show</h2>
            <p className="text-sm text-muted-foreground mt-1">Ask a user to create a new account from the sign-up page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((account) => (
              <div key={account.email} className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{account.role}</p>
                <p className="mt-1 inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground bg-muted/40">{account.ageGroup === 'senior' ? '60+ / Senior' : account.ageGroup === 'youth' ? 'Below 60 / Youth' : 'Adult'}</p>
                <h3 className="text-lg font-semibold text-foreground mt-2">{account.displayName}</h3>
                <p className="text-sm text-muted-foreground">{account.email}</p>
                <div className="grid grid-cols-3 gap-2 text-xs mt-4">
                  <div className="rounded-lg bg-muted/20 border border-border p-2"><p className="text-muted-foreground">Credits</p><p className="font-semibold">{account.credits}</p></div>
                  <div className="rounded-lg bg-muted/20 border border-border p-2"><p className="text-muted-foreground">Exchanges</p><p className="font-semibold">{account.exchanges}</p></div>
                  <div className="rounded-lg bg-muted/20 border border-border p-2"><p className="text-muted-foreground">Rating</p><p className="font-semibold">{Number(account.rating ?? 0).toFixed(1)}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <RealUsersPanel title="Real users" subtitle="This panel refreshes automatically" compact showExchangeLink={false} />
      </div>
    </AppLayout>
  );
}
