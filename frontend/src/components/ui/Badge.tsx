import React from 'react';

type BadgeVariant = 'violet' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pink' | 'amber';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  violet:  { bg: 'bg-[#ebdafd] dark:bg-[rgba(134,47,231,0.18)]',  text: 'text-[#862fe7] dark:text-[#ad6df4]' },
  success: { bg: 'bg-[#dcfce7] dark:bg-[rgba(34,197,94,0.15)]',   text: 'text-[#16a34a] dark:text-[#4ade80]' },
  warning: { bg: 'bg-[#fef9c3] dark:bg-[rgba(234,179,8,0.15)]',   text: 'text-[#ca8a04] dark:text-[#facc15]' },
  danger:  { bg: 'bg-[#fee2e2] dark:bg-[rgba(239,68,68,0.15)]',   text: 'text-[#dc2626] dark:text-[#f87171]' },
  info:    { bg: 'bg-[#dbeafe] dark:bg-[rgba(59,130,246,0.15)]',  text: 'text-[#2563eb] dark:text-[#60a5fa]' },
  neutral: { bg: 'bg-[#f1f5f9] dark:bg-[#334155]',                text: 'text-[#6b7589] dark:text-[#94A3B8]' },
  pink:    { bg: 'bg-[#fce7f3] dark:bg-[rgba(226,43,164,0.15)]',  text: 'text-[#be185d] dark:text-[#f472b6]' },
  amber:   { bg: 'bg-[#fff7ed] dark:bg-[rgba(220,95,5,0.15)]',   text: 'text-[#c2410c] dark:text-[#fb923c]' },
};

const dotColors: Record<BadgeVariant, string> = {
  violet:  'bg-[#862fe7]',
  success: 'bg-[#16a34a]',
  warning: 'bg-[#ca8a04]',
  danger:  'bg-[#dc2626]',
  info:    'bg-[#2563eb]',
  neutral: 'bg-[#6b7589]',
  pink:    'bg-[#be185d]',
  amber:   'bg-[#c2410c]',
};

export function Badge({ variant = 'neutral', children, className = '', dot = false }: BadgeProps) {
  const { bg, text } = variantStyles[variant];
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        bg,
        text,
        className,
      ].join(' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
