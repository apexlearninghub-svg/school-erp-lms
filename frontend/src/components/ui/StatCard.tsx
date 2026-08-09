import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  growth?: string;
  comparison?: string;
  loading?: boolean;
  iconBg?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend = 'neutral',
  growth,
  comparison,
  loading = false,
  iconBg = 'bg-[#ebdafd]',
  className = '',
}: StatCardProps) {
  if (loading) {
    return (
      <div className={`bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] rounded-[24px] p-6 ${className}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-[12px] skeleton" />
          <div className="w-14 h-5 rounded-full skeleton" />
        </div>
        <div className="w-20 h-8 rounded skeleton mb-2" />
        <div className="w-28 h-4 rounded skeleton" />
      </div>
    );
  }

  return (
    <div
      className={[
        'group bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155]',
        'rounded-[24px] p-6 transition-all duration-200',
        'hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-[#862fe7] shrink-0 ${iconBg} group-hover:scale-105 transition-transform duration-200`}>
          {icon}
        </div>
        {growth && (
          <div
            className={[
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
              trend === 'up'   ? 'bg-[#dcfce7] text-[#16a34a] dark:bg-[rgba(34,197,94,0.15)] dark:text-[#4ade80]' : '',
              trend === 'down' ? 'bg-[#fee2e2] text-[#dc2626] dark:bg-[rgba(239,68,68,0.15)] dark:text-[#f87171]' : '',
              trend === 'neutral' ? 'bg-[#f1f5f9] text-[#6b7589] dark:bg-[#334155] dark:text-[#94A3B8]' : '',
            ].join(' ')}
          >
            {trend === 'up'   && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {growth}
          </div>
        )}
      </div>

      <p className="kpi-number text-[#111827] dark:text-white mb-1">{value}</p>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6b7589] dark:text-[#94A3B8] font-medium">{label}</p>
        {comparison && (
          <span className="text-xs text-[#6b7589] dark:text-[#94A3B8]">{comparison}</span>
        )}
      </div>
    </div>
  );
}
