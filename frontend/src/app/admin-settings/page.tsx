/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Settings } from 'lucide-react';

export default function PlatformSettingsPage() {
  return (
    <AppLayout variant="admin">
      <div className="bg-card border border-border rounded-xl p-10 text-center max-w-2xl mx-auto">
        <Settings size={28} className="mx-auto text-muted-foreground mb-3" />
        <h1 className="text-xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">Configure platform-wide defaults in this fresh starter setup.</p>
      </div>
    </AppLayout>
  );
}
