'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Star, RefreshCw } from 'lucide-react';
import { apiListReviews, apiListAnalytics } from '@/lib/timebank-api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const load = async () => {
    const [reviewData, analyticsData] = await Promise.all([apiListReviews(), apiListAnalytics()]);
    setReviews(reviewData.items);
    setAnalytics(analyticsData);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppLayout variant="admin">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Reviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor member feedback and average platform satisfaction.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-border hover:bg-muted transition-colors"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <p className="text-sm font-semibold text-amber-100 mb-2">Average rating</p>
          <p className="text-5xl font-bold font-tabular">{Number(analytics?.totals?.averageRating ?? 0).toFixed(1)}</p>
          <p className="text-xs text-amber-100 mt-2">Across {analytics?.totals?.reviews ?? 0} reviews</p>
        </div>
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Latest reviews</h3>
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Star size={28} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">Member feedback will appear here after exchanges.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 10).map((review) => (
                <div key={review.id} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">{review.authorEmail} → {review.targetEmail}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"><Star size={12} fill="currentColor" /> {review.rating}</span>
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
