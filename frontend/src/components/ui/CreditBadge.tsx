/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';
import { Clock } from 'lucide-react';

interface CreditBadgeProps {
  hours: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function CreditBadge({ hours, size = 'md', showIcon = true }: CreditBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };
  const iconSizes = { sm: 11, md: 13, lg: 15 };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full credit-badge font-tabular ${sizeClasses[size]}`}
    >
      {showIcon && <Clock size={iconSizes[size]} />}
      {hours} {hours === 1 ? 'hr' : 'hrs'}
    </span>
  );
}