'use client';

import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  categories: string[];
  selected: string[];
  onToggle: (category: string) => void;
  onClear: () => void;
}

export function CategoryChips({ categories, selected, onToggle, onClear }: CategoryChipsProps) {
  const hasSelection = selected.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((category) => {
        const isActive = selected.includes(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              isActive
                ? 'border-primary-500 bg-primary-100 text-primary-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200'
            )}
          >
            {category}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onClear}
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-medium text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-50',
          hasSelection ? 'border-slate-300 bg-white hover:border-primary-200 hover:text-primary-600' : 'border-transparent'
        )}
        disabled={!hasSelection}
      >
        Clear all
      </button>
    </div>
  );
}
