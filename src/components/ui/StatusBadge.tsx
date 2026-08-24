import React from 'react';

export type BadgeVariant = 'optimal' | 'warning' | 'critical' | 'neutral' | 'info' | 'pending';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  dot = true,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    optimal: {
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-300',
      border: 'border-emerald-700/60',
      dotColor: 'bg-emerald-400',
    },
    warning: {
      bg: 'bg-amber-950/80',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      dotColor: 'bg-amber-400',
    },
    critical: {
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      border: 'border-rose-700/60',
      dotColor: 'bg-rose-400 animate-pulse',
    },
    info: {
      bg: 'bg-blue-950/80',
      text: 'text-blue-300',
      border: 'border-blue-700/60',
      dotColor: 'bg-blue-400',
    },
    pending: {
      bg: 'bg-yellow-950/80',
      text: 'text-yellow-300',
      border: 'border-yellow-700/60',
      dotColor: 'bg-yellow-400',
    },
    neutral: {
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700/60',
      dotColor: 'bg-slate-400',
    },
  };

  const current = variantStyles[variant] || variantStyles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold font-mono rounded-md border whitespace-nowrap ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${current.dotColor}`} />}
      <span className="truncate">{label}</span>
    </span>
  );
};
