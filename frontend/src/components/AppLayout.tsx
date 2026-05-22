/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AuthGate from './auth/AuthGate';

interface AppLayoutProps {
  children: React.ReactNode;
  variant?: 'member' | 'admin';
}

export default function AppLayout({ children, variant = 'member' }: AppLayoutProps) {
  return (
    <AuthGate>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar variant={variant} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar variant={variant} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
