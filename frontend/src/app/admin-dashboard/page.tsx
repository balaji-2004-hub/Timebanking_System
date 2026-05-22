'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { RefreshCw, Download, Settings, ShieldAlert, Users, ArrowRightLeft, Star } from 'lucide-react';
import RealUsersPanel from '@/components/community/RealUsersPanel';
import { apiListAnalytics } from '@/lib/timebank-api';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);

  const load = async () => {
    const data = await apiListAnalytics();
    setAnalytics(data);
  };

  useEffect(() => {
    load();
  }, []);

  const totals = analytics?.totals ?? {};

  return (
    <AppLayout variant="admin">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live platform metrics pulled from the server database.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors btn-press"><RefreshCw size={14} /> Refresh</button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors btn-press"><Download size={14} /> Export</button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-amber-700 transition-colors btn-press"><Settings size={14} /> Platform Settings</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ['Members', totals.members ?? 0, Users],
          ['Exchanges', totals.exchanges ?? 0, ArrowRightLeft],
          ['Open Disputes', totals.openDisputes ?? 0, ShieldAlert],
          ['Reviews', totals.reviews ?? 0, Star],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="bg-card border border-border rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2"><Icon size={16} className="text-muted-foreground" /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label as string}</p>
            <p className="text-2xl font-bold font-tabular text-foreground">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Platform overview</h3>
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="rounded-xl border border-border p-4 bg-muted/20"><p className="text-xs text-muted-foreground">Listings</p><p className="text-xl font-bold">{totals.listings ?? 0}</p></div>
            <div className="rounded-xl border border-border p-4 bg-muted/20"><p className="text-xs text-muted-foreground">Messages</p><p className="text-xl font-bold">{totals.messages ?? 0}</p></div>
            <div className="rounded-xl border border-border p-4 bg-muted/20"><p className="text-xs text-muted-foreground">Average Rating</p><p className="text-xl font-bold">{Number(totals.averageRating ?? 0).toFixed(1)}</p></div>
            <div className="rounded-xl border border-border p-4 bg-muted/20"><p className="text-xs text-muted-foreground">Credits in system</p><p className="text-xl font-bold">{totals.credits ?? 0}</p></div>
          </div>
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <ShieldAlert size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="font-medium text-foreground">No platform incidents blocking the system</p>
            <p className="text-sm text-muted-foreground mt-1">The dashboard is now backed by persisted analytics.</p>
          </div>
        </div>
        <RealUsersPanel title="Admin member view" subtitle="All registered users visible from the dashboard" showExchangeLink={false} />
      </div>
    </AppLayout>
  );
}
