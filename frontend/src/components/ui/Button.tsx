import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#862fe7] text-white hover:bg-[#5f259e] shadow-[0_4px_16px_rgba(134,47,231,0.3)] hover:shadow-[0_8px_24px_rgba(134,47,231,0.4)] active:scale-[0.98]',
  dark:
    'bg-[#111827] text-white hover:bg-[#1f2937] active:scale-[0.98]',
  outline:
    'bg-transparent border border-[#111827] text-[#111827] hover:bg-[#f1f5f9] dark:border-[#d8e0ea] dark:text-white dark:hover:bg-[#1e293b]',
  ghost:
    'bg-transparent text-[#3f4654] hover:bg-[#f1f5f9] dark:text-[#94A3B8] dark:hover:bg-[#1e293b]',
  destructive:
    'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_4px_12px_rgba(239,68,68,0.3)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  'px-3 py-1.5 text-sm rounded-[10px] gap-1.5',
  md:  'px-5 py-2.5 text-sm rounded-[12px] gap-2',
  lg:  'px-6 py-3 text-base rounded-[12px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#862fe7] focus-visible:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
