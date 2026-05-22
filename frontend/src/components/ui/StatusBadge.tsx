/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';

type StatusVariant =
  | 'active' |'pending' |'disputed' |'completed' |'suspended' |'banned' |'offer' |'request' |'in-progress' |'archived';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  active: { label: 'Active', className: 'status-badge-active' },
  pending: { label: 'Pending', className: 'status-badge-pending' },
  disputed: { label: 'Disputed', className: 'status-badge-disputed' },
  completed: { label: 'Completed', className: 'status-badge-completed' },
  suspended: { label: 'Suspended', className: 'status-badge-suspended' },
  banned: { label: 'Banned', className: 'bg-stone-100 text-stone-600 border border-stone-300' },
  offer: { label: 'Offer', className: 'offer-badge' },
  request: { label: 'Request', className: 'request-badge' },
  'in-progress': { label: 'In Progress', className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  archived: { label: 'Archived', className: 'bg-stone-100 text-stone-500 border border-stone-200' },
};

export default function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${sizeClass} ${config.className}`}>
      {label ?? config.label}
    </span>
  );
}