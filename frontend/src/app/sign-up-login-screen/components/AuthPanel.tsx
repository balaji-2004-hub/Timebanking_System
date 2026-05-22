'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import OnboardingWizard from './OnboardingWizard';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/timebank-store';

export default function AuthPanel() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  const router = useRouter();

  const handleLoginSuccess = (role: UserRole) => {
    router.push(role === 'admin' ? '/admin-dashboard' : '/');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
      <div className="flex items-center gap-2 mb-8">
        <AppLogo size={32} />
        <span className="font-bold text-foreground text-lg">TimeBank</span>
      </div>

      <div className="flex p-1 bg-muted rounded-xl mb-6 self-start w-full max-w-xs">
        {(['login', 'signup'] as const).map((tab) => (
          <button
            key={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 btn-press ${
              activeTab === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'login' ? (
          <LoginForm onSuccess={handleLoginSuccess} />
        ) : (
          <OnboardingWizard />
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {activeTab === 'login' ? (
            <>
              New here?{' '}
              <button onClick={() => setActiveTab('signup')} className="text-primary font-semibold hover:underline">
                Create your account
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button onClick={() => setActiveTab('login')} className="text-primary font-semibold hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2">
          By joining, you agree to our{' '}
          <Link href="#" className="text-primary hover:underline">Terms of Service</Link>{' '}
          and{' '}
          <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
