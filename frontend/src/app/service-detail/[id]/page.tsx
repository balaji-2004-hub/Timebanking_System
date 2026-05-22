'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { ArrowLeft, Sparkles, MessageSquare, BadgeInfo, Clock3 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { apiGetListing, apiListMembers } from '@/lib/timebank-api';
import { useAuth } from '@/components/auth/AuthProvider';

interface ListingItem {
  id: number;
  ownerEmail: string;
  title: string;
  category: string;
  type: 'offer' | 'request';
  description: string;
  creditHours: number;
  createdAt: string;
}

export default function ServiceDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingItem | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const id = Number(params?.id);
        const data = await apiGetListing(id);
        setListing(data.listing);
        const members = await apiListMembers();
        const owner = members.members.find((member) => member.email === data.listing.ownerEmail);
        setOwnerName(owner?.displayName ?? data.listing.ownerEmail);
      } catch (err) {
        setListing(null);
        setError(err instanceof Error ? err.message : 'Unable to load listing');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="mb-6">
        <Link href="/service-listings" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back to listings
        </Link>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center max-w-2xl mx-auto">
          <Sparkles size={28} className="mx-auto text-muted-foreground mb-3 animate-pulse" />
          <h1 className="text-xl font-bold text-foreground">Loading listing…</h1>
        </div>
      ) : error || !listing ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center max-w-2xl mx-auto">
          <BadgeInfo size={28} className="mx-auto text-muted-foreground mb-3" />
          <h1 className="text-xl font-bold text-foreground">Listing not found</h1>
          <p className="text-sm text-muted-foreground mt-2">{error || 'The requested listing no longer exists.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{listing.category}</p>
                <h1 className="text-2xl font-bold text-foreground mt-1">{listing.title}</h1>
                <p className="text-sm text-muted-foreground mt-2">Posted by {ownerName}</p>
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-wider rounded-full px-2 py-1 ${listing.type === 'offer' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>{listing.type}</span>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 mb-4">
              <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Credits</p>
                <p className="text-2xl font-bold font-tabular text-foreground mt-1">{listing.creditHours}</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Owner</p>
                <p className="text-sm font-semibold text-foreground mt-1 break-all">{listing.ownerEmail}</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Created</p>
                <p className="text-sm font-semibold text-foreground mt-1 inline-flex items-center gap-1"><Clock3 size={14} /> {new Date(listing.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-2">Next step</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Message the owner to discuss timing, then complete the exchange from the credit center.</p>
              <div className="mt-4 flex flex-col gap-2">
                <button onClick={() => router.push(`/messages?to=${encodeURIComponent(listing.ownerEmail)}&subject=${encodeURIComponent(`About: ${listing.title}`)}`)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-amber-700 transition-colors">
                  <MessageSquare size={14} /> Message owner
                </button>
                <Link href={`/credits?counterparty=${encodeURIComponent(listing.ownerEmail)}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors">
                  Start exchange
                </Link>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-2">What this gives you</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Direct contact with the member who posted it.</li>
                <li>• One-click jump to the credit exchange flow.</li>
                <li>• A persistent record in the backend JSON store.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
