'use client';

import debounce from 'lodash.debounce';
import { useEffect, useMemo } from 'react';

type SearchBarProps = {
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ defaultValue = '', onChange, placeholder = 'Search apps' }: SearchBarProps) {
  const handler = useMemo(() => debounce(onChange, 200), [onChange]);

  useEffect(() => {
    return () => handler.cancel();
  }, [handler]);

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        type="search"
        defaultValue={defaultValue}
        onChange={(event) => handler(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
