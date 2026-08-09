import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title = 'Nothing here yet',
  message = 'No data available at the moment.',
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-[20px] bg-[#f1f5f9] dark:bg-[#334155] flex items-center justify-center mb-4 text-[#6b7589]">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-semibold text-[#111827] dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-[#6b7589] dark:text-[#94A3B8] max-w-xs">{message}</p>
      {action && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
