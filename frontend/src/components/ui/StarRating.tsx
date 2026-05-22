/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 14,
  showValue = true,
  reviewCount,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={`star-${i}`}
            size={size}
            className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-300 fill-stone-100'}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground font-tabular">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}