'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { TrendingUp, Users, ArrowRightLeft, Clock, Star, AlertTriangle } from 'lucide-react';
import RealUsersPanel from '@/components/community/RealUsersPanel';
import { apiListAnalytics } from '@/lib/timebank-api';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    apiListAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  const cards = useMemo(() => {
    const totals = analytics?.totals ?? {};
    return [
      { label: 'Total Members', value: totals.members ?? 0, icon: Users },
      { label: 'Active Exchanges', value: totals.exchanges ?? 0, icon: ArrowRightLeft },
      { label: 'Hours Moved', value: totals.credits ?? 0, icon: Clock },
      { label: 'Avg Rating', value: totals.averageRating ?? 0, icon: Star },
      { label: 'Open Disputes', value: totals.openDisputes ?? 0, icon: AlertTriangle },
      { label: 'Listings', value: totals.listings ?? 0, icon: TrendingUp },
    ];
  }, [analytics]);

  return (
    <AppLayout variant="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live analytics are calculated from the backend records.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2"><card.icon size={16} className="text-muted-foreground" /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{card.label}</p>
            <p className="text-xl font-bold font-tabular text-foreground">{typeof card.value === 'number' && card.label === 'Avg Rating' ? card.value.toFixed(1) : card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Listing categories</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={analytics?.categoryBreakdown ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <RealUsersPanel title="Top members" subtitle="Credits and exchanges update automatically" compact showExchangeLink={false} />
      </div>
    </AppLayout>
  );
}
