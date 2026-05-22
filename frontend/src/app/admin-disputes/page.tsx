'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { apiCreateDispute, apiListDisputes, apiUpdateDispute, apiListMembers } from '@/lib/timebank-api';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminDisputesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [disputes, memberData] = await Promise.all([apiListDisputes(), apiListMembers()]);
    setItems(disputes.items);
    setMembers(memberData.members);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!user) return;
    setError('');
    setStatus('');
    try {
      await apiCreateDispute({ reporterEmail: user.email, title, details, severity });
      setTitle('');
      setDetails('');
      setStatus('Dispute submitted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create dispute');
    }
  };

  return (
    <AppLayout variant="admin">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disputes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Open issues, moderation notes, and resolution actions.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-border hover:bg-muted transition-colors"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Create dispute</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none mb-3" placeholder="Title" />
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none resize-none mb-3" placeholder="Explain the issue" />
            <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none mb-3">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button onClick={create} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-amber-700 transition-colors">Submit dispute</button>
            {status && <p className="text-sm font-medium text-success mt-3">{status}</p>}
            {error && <p className="text-sm font-medium text-danger mt-3">{error}</p>}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Member context</h3>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {members.slice(0, 6).map((member) => (
                <div key={member.email} className="rounded-lg border border-border p-3 bg-muted/20">
                  <p className="font-semibold text-foreground">{member.displayName}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Dispute queue</h3>
          {items.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-10 text-center">
              <AlertTriangle size={28} className="mx-auto text-muted-foreground mb-3" />
              <h2 className="text-lg font-semibold text-foreground">No disputes yet</h2>
              <p className="text-sm text-muted-foreground mt-1">When a member raises a dispute, it will appear here for review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.reporterEmail} · {item.severity} · {item.status}</p>
                    </div>
                    <span className="text-xs rounded-full px-2 py-1 font-semibold bg-amber-50 text-amber-700">#{item.id}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.details}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={async () => { await apiUpdateDispute({ id: item.id, status: 'investigating' }); await load(); }} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors">Mark investigating</button>
                    <button onClick={async () => { await apiUpdateDispute({ id: item.id, status: 'resolved', resolution: 'Resolved by admin review' }); await load(); }} className="inline-flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"><ShieldCheck size={12} /> Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
