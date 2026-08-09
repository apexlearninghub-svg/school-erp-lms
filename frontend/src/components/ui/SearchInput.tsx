import React, { useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

export function SearchInput({
  loading = false,
  onClear,
  containerClassName = '',
  value,
  className = '',
  ...props
}: SearchInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${containerClassName}`}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        {loading ? (
          <Loader2 className="w-4 h-4 text-[#862fe7] animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-[#6b7589]" />
        )}
      </div>
      <input
        ref={ref}
        value={value}
        className={[
          'w-full pl-9 pr-9 py-2.5 text-sm rounded-[12px]',
          'bg-white dark:bg-[#1E293B]',
          'border border-[#d8e0ea] dark:border-[#334155]',
          'text-[#111827] dark:text-[#F1F5F9]',
          'placeholder-[#6b7589] dark:placeholder-[#94A3B8]',
          'focus:outline-none focus:border-[#862fe7] focus:ring-2 focus:ring-[rgba(134,47,231,0.15)]',
          'transition-all duration-150',
          className,
        ].join(' ')}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={() => { onClear(); ref.current?.focus(); }}
          className="absolute inset-y-0 right-3 flex items-center text-[#6b7589] hover:text-[#111827] dark:hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
