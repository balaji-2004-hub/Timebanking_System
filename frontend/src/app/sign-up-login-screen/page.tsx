'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React, { useEffect } from 'react';
import AuthPanel from './components/AuthPanel';
import { Clock, Users, Star, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

const communityStats = [
  { id: 'stat-members', value: '0', label: 'Registered members', icon: Users },
  { id: 'stat-hours', value: '0', label: 'Hours exchanged', icon: Clock },
  { id: 'stat-rating', value: '0.0', label: 'Average rating', icon: Star },
  { id: 'stat-exchanges', value: '0', label: 'Exchanges completed', icon: ArrowRightLeft },
];

export default function SignUpLoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(user.role === 'admin' ? '/admin-dashboard' : '/');
  }, [isLoading, router, user]);

  if (isLoading || user) return null;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col community-pattern relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/10 translate-y-1/3 -translate-x-1/3" />
        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-10">
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 w-fit border border-amber-200">
              <Clock size={13} /> 1 hour of help = 1 time credit
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-foreground leading-tight mb-4">Create your account.<br /><span className="text-primary">Personalize every page.</span><br />No demo data loaded.</h1>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">Register a new user, save your profile, and the dashboard will update only for that account.</p>
            <div className="grid grid-cols-2 gap-3 mt-8 max-w-sm">
              {communityStats.map((stat) => { const Icon = stat.icon; return (<div key={stat.id} className="bg-white/70 backdrop-blur border border-border rounded-xl p-3.5"><div className="flex items-center gap-2 mb-1"><Icon size={14} className="text-primary" /><span className="text-xs text-muted-foreground">{stat.label}</span></div><p className="text-xl font-bold font-tabular text-foreground">{stat.value}</p></div>); })}
            </div>
          </div>
          <div className="space-y-3 pb-4">
            <div className="bg-white/80 backdrop-blur border border-border rounded-xl p-4">
              <p className="text-sm text-foreground">Fresh workspace ready for your first listing, message, and exchange.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 lg:w-[48%] xl:w-[45%] bg-background">
        <AuthPanel />
      </div>
    </div>
  );
}
