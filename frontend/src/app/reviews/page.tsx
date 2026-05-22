'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Star, MessageSquare, RefreshCw } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import RealUsersPanel from '@/components/community/RealUsersPanel';
import { apiCreateReview, apiListMembers, apiListReviews } from '@/lib/timebank-api';

interface MemberSummary {
  email: string;
  displayName: string;
  role: string;
  ageGroup: 'senior' | 'adult' | 'youth';
  credits: number;
  exchanges: number;
  skillsOffered: string[];
  neighborhood: string;
}

interface ReviewItem {
  id: number;
  authorEmail: string;
  targetEmail: string;
  rating: number;
  comment: string;
  exchangeId?: number | null;
  createdAt: string;
}

export default function ReviewsPage() {
  const { user, profile } = useCurrentUserProfile();
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [targetEmail, setTargetEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!user) return;
    const [memberData, reviewData] = await Promise.all([apiListMembers(), apiListReviews(user.email)]);
    setMembers(memberData.members);
    setReviews(reviewData.items);
  };

  useEffect(() => {
    load();
  }, [user?.email]);

  const visibleReviews = useMemo(() => reviews.slice(0, 8), [reviews]);

  const submitReview = async () => {
    if (!user) return;
    setError('');
    setStatus('');
    try {
      if (!targetEmail.trim() || !comment.trim()) {
        throw new Error('Choose a member and write a comment.');
      }
      await apiCreateReview({ authorEmail: user.email, targetEmail, rating, comment: comment.trim() });
      setComment('');
      setStatus('Review posted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post review');
    }
  };

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews & Ratings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Feedback is now stored in the backend and reflected in member stats.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-border hover:bg-muted transition-colors w-fit">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <p className="text-sm font-semibold text-amber-100 mb-2">Overall Rating</p>
          <div className="flex items-end gap-3">
            <p className="text-5xl font-bold font-tabular">{(profile?.stats.rating ?? 0).toFixed(1)}</p>
            <p className="pb-1 text-xs text-amber-100">{profile?.stats.reviews ?? 0} reviews</p>
          </div>
          <div className="flex gap-0.5 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} fill={s <= Math.round(profile?.stats.rating ?? 0) && (profile?.stats.rating ?? 0) > 0 ? 'white' : 'none'} className="text-white" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Leave feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none md:col-span-2">
              <option value="">Choose member</option>
              {members.filter((member) => member.email !== user?.email).map((member) => (
                <option key={member.email} value={member.email}>{member.displayName} · {member.email}</option>
              ))}
            </select>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value) || 5)} className="px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none">
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>)}
            </select>
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none resize-none mb-3" placeholder="Share what went well" />
          <button onClick={submitReview} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-amber-700 transition-colors">
            <MessageSquare size={14} /> Submit review
          </button>
          {status && <p className="text-sm font-medium text-success mt-3">{status}</p>}
          {error && <p className="text-sm font-medium text-danger mt-3">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent reviews</h3>
          {visibleReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Star size={28} className="mx-auto text-muted-foreground mb-3" />
              <h2 className="text-lg font-semibold text-foreground">Nothing to review yet</h2>
              <p className="text-sm text-muted-foreground mt-1">Complete an exchange and then leave feedback here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleReviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">By {review.authorEmail} · {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      <Star size={12} fill="currentColor" /> {review.rating}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">For {review.targetEmail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <RealUsersPanel title="Review members" subtitle="Pick a real user and start an exchange first" compact />
      </div>
    </AppLayout>
  );
}
