import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'beta' | 'verified' | 'default';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    beta: 'bg-gavel-500/20 text-gavel-400 border border-gavel-500/30',
    verified: 'bg-verdict-success/20 text-verdict-success border border-verdict-success/30',
    default: 'bg-courtroom-700 text-courtroom-300 border border-courtroom-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
