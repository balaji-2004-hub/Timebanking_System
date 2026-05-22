'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { apiCreateListing, apiListListings } from '@/lib/timebank-api';
import RealUsersPanel from '@/components/community/RealUsersPanel';

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

export default function ServiceListingsPage() {
  const { user, profile } = useCurrentUserProfile();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'offer' | 'request'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tech Help');
  const [type, setType] = useState<'offer' | 'request'>('offer');
  const [description, setDescription] = useState('');
  const [creditHours, setCreditHours] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await apiListListings();
      setListings(data.items);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const categories = useMemo(() => ['all', ...new Set(listings.map((item) => item.category).filter(Boolean))], [listings]);

  const visibleListings = useMemo(() => {
    const text = query.trim().toLowerCase();
    return listings.filter((item) => {
      const matchesText = !text || [item.title, item.category, item.description, item.ownerEmail].join(' ').toLowerCase().includes(text);
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesText && matchesType && matchesCategory;
    });
  }, [listings, query, typeFilter, categoryFilter]);

  const handleCreate = async () => {
    if (!user) return;
    setError('');
    setStatus('');
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    try {
      await apiCreateListing({
        ownerEmail: user.email,
        title: title.trim(),
        category: category.trim(),
        type,
        description: description.trim(),
        creditHours,
      });
      setTitle('');
      setDescription('');
      setCreditHours(1);
      setStatus('Listing created successfully.');
      await fetchListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create listing');
    }
  };

  const myListings = user ? listings.filter((item) => item.ownerEmail === user.email) : [];

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Listings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Publish offers and requests, then browse the live marketplace.</p>
        </div>
        <button onClick={fetchListings} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors btn-press w-fit">
          <Sparkles size={14} /> Refresh listings
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2 flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border">
              <Search size={16} className="text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent outline-none text-sm w-full" placeholder="Search title, category, description..." />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | 'offer' | 'request')} className="px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none">
              <option value="all">All types</option>
              <option value="offer">Offer</option>
              <option value="request">Request</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none">
              {categories.map((item) => (
                <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter size={14} /> {visibleListings.length} live listing{visibleListings.length === 1 ? '' : 's'}</div>
            <button onClick={fetchListings} className="text-xs font-semibold text-primary hover:underline">Reload</button>
          </div>

          {visibleListings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Sparkles size={24} className="mx-auto text-muted-foreground mb-2" />
              <h2 className="text-lg font-semibold text-foreground">No listings match your filters</h2>
              <p className="text-sm text-muted-foreground mt-1">Try a different search or create the first listing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleListings.map((listing) => (
                <div key={listing.id} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{listing.category}</p>
                      <h3 className="text-lg font-semibold text-foreground mt-1">{listing.title}</h3>
                    </div>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider rounded-full px-2 py-1 ${listing.type === 'offer' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>{listing.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 max-h-14 overflow-hidden">{listing.description}</p>
                  <div className="flex items-center justify-between gap-3 mt-4 text-xs text-muted-foreground">
                    <span>{listing.creditHours} credit hour{listing.creditHours === 1 ? '' : 's'}</span>
                    <Link href={`/service-detail/${listing.id}`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                      Open <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Create listing</h3>
              <Plus size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none" placeholder="Title" />
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none" placeholder="Category" />
              <select value={type} onChange={(e) => setType(e.target.value as 'offer' | 'request')} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none">
                <option value="offer">Offer</option>
                <option value="request">Request</option>
              </select>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none resize-none" placeholder="Describe the service" />
              <input type="number" min={1} value={creditHours} onChange={(e) => setCreditHours(Math.max(1, Number(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none" />
              <button onClick={handleCreate} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-amber-700 transition-colors">
                Publish listing
              </button>
              {status && <p className="text-sm font-medium text-success">{status}</p>}
              {error && <p className="text-sm font-medium text-danger">{error}</p>}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Your listings</h3>
            {user && myListings.length > 0 ? (
              <div className="space-y-3">
                {myListings.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-xl border border-border p-3 bg-muted/20">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.category} · {item.type} · {item.creditHours} credits</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You have not published anything yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Starter guide</h3>
            <span className="text-xs text-muted-foreground">Simple flow</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>• Post a service offer or a request.</p>
            <p>• Open the detail page to inspect one listing.</p>
            <p>• Message the owner or start an exchange.</p>
            <p>• Refresh to see the same saved data again.</p>
          </div>
        </div>
        <RealUsersPanel title="Members and listings" subtitle="Use real users to start exchanges" />
      </div>
    </AppLayout>
  );
}
