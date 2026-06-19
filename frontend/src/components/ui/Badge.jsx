import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    pending: 'badge-pending',
    in_progress: 'badge-in_progress',
    completed: 'badge-completed',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-red-500/15 text-red-400',
    info: 'bg-cyan-500/15 text-cyan-400',
    purple: 'bg-purple-500/15 text-purple-400',
  };

  return (
    <span className={`badge ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
