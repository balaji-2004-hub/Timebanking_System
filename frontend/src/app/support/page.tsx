'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Handshake, CircleUserRound, ArrowRightLeft, ShieldCheck, MessageCircle, CalendarCheck2, ShoppingBag, CarFront, LampDesk, PhoneCall } from 'lucide-react';

const seniorHelp = [
  { icon: ShoppingBag, title: 'Grocery support', desc: 'Shopping, carrying items, or doorstep delivery help.' },
  { icon: CarFront, title: 'Transport help', desc: 'Rides, appointments, and safe local travel support.' },
  { icon: PhoneCall, title: 'Medicine reminders', desc: 'Simple check-ins and reminder calls for daily care.' },
  { icon: MessageCircle, title: 'Companionship', desc: 'Friendly conversation, calls, and regular visit support.' },
];

const youthHelp = [
  { icon: LampDesk, title: 'Tutoring & learning', desc: 'School help, coding support, and language practice.' },
  { icon: Handshake, title: 'Community service', desc: 'Offer repair, cleaning, organizing, and tech help.' },
  { icon: CalendarCheck2, title: 'Errands & scheduling', desc: 'Book appointments, organize tasks, and save time.' },
  { icon: ShieldCheck, title: 'Family support', desc: 'Help parents, grandparents, and neighbors when needed.' },
];

export default function SupportPage() {
  const { user } = useAuth();
  const { profile } = useCurrentUserProfile();
  const ageLabel = profile?.ageGroup === 'senior' ? '60+ / Senior' : profile?.ageGroup === 'youth' ? 'Below 60 / Youth' : 'Adult';

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Simple services for seniors, families, and younger members.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <CircleUserRound size={16} />
          <div>
            <p className="font-semibold text-foreground">Your group</p>
            <p className="text-muted-foreground">{ageLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-100 mb-2">For 60+ users</p>
          <h2 className="text-2xl font-bold mb-2">Easy help with clear steps</h2>
          <p className="text-amber-50/90 text-sm leading-relaxed">Large buttons, simple words, and helpful services like grocery support, transport, medicine reminders, and companionship.</p>
          <Link href="/community" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white text-amber-700 px-4 py-2 text-sm font-semibold">
            Find helper <ArrowRightLeft size={14} />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">For younger members</p>
          <h2 className="text-2xl font-bold text-foreground mb-2">Help seniors and earn credits</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Offer tech help, errands, tutoring, and home support. Every completed service adds credits to your account and stays saved after refresh or close.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Senior-friendly services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seniorHelp.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className="text-primary" />
                    <p className="font-semibold text-foreground">{item.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Younger member support</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {youthHelp.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className="text-primary" />
                    <p className="font-semibold text-foreground">{item.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-2">Working process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          {[
            ['1. Create account', 'Save one profile that stays after close and reopen.'],
            ['2. Pick support type', 'Choose senior help, youth help, or general services.'],
            ['3. Complete exchange', 'Credits update for both users.'],
            ['4. Refresh safely', 'The same login and numbers remain stored.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-border p-4 bg-muted/20">
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
