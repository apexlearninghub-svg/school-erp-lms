import React from 'react';

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] rounded-[24px] p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <SkeletonLine className="w-10 h-10 rounded-[12px]" />
        <SkeletonLine className="w-14 h-5 rounded-full" />
      </div>
      <SkeletonLine className="w-24 h-8 mb-2" />
      <SkeletonLine className="w-32 h-4" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] rounded-[24px] overflow-hidden ${className}`}>
      <div className="p-4 border-b border-[#d8e0ea] dark:border-[#334155]">
        <SkeletonLine className="w-40 h-6" />
      </div>
      <div className="divide-y divide-[#f1f5f9] dark:divide-[#334155]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonLine key={j} className={`h-4 flex-1 ${j === 0 ? 'max-w-[120px]' : ''}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonLine className="w-48 h-8" />
        <SkeletonLine className="w-32 h-6 rounded-full" />
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] rounded-[24px] p-6 h-64">
            <SkeletonLine className="w-32 h-5 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <SkeletonLine key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#d8e0ea] dark:border-[#334155]">
          <SkeletonLine className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
          <SkeletonLine className="w-16 h-6 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] rounded-[24px] p-6 flex gap-6 items-center">
        <SkeletonLine className="w-24 h-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonLine className="h-7 w-48" />
          <SkeletonLine className="h-5 w-32" />
          <SkeletonLine className="h-5 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] rounded-[24px] p-5">
            <SkeletonLine className="h-4 w-24 mb-3" />
            <SkeletonLine className="h-6 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
