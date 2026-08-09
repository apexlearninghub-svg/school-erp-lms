import React from 'react';
import { Loader2 } from 'lucide-react';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  noPadding?: boolean;
}

export function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  className = '',
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={[
        'bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155]',
        'rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]',
        'transition-shadow duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
        noPadding ? '' : 'p-6',
        className,
      ].join(' ')}
    >
      {(title || action) && (
        <div className={`flex items-center justify-between ${noPadding ? 'px-6 pt-6' : ''} ${children ? 'mb-4' : ''}`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-[12px] bg-[#ebdafd] flex items-center justify-center text-[#862fe7] shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-semibold text-[#111827] dark:text-white text-base leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-[#6b7589] dark:text-[#94A3B8] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#862fe7] animate-spin" />
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f1f5f9] dark:bg-[#334155] flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#6b7589]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#6b7589] dark:text-[#94A3B8]">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
