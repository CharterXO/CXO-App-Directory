'use client';

import { useMemo, useState } from 'react';
import { AppTile } from '@/components/AppTile';
import { SearchBar } from '@/components/SearchBar';
import { CategoryChips } from '@/components/CategoryChips';

export interface AppRecord {
  id: string;
  name: string;
  description: string;
  loginUrl: string;
  categories: string[];
  iconUrl?: string | null;
  featured?: boolean;
}

interface AppDirectoryProps {
  apps: AppRecord[];
}

export function AppDirectory({ apps }: AppDirectoryProps) {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach((app) => app.categories.forEach((category) => set.add(category)));
    return Array.from(set).sort();
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesQuery = query
        ? `${app.name} ${app.description}`.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesCategories =
        selectedCategories.length === 0 || selectedCategories.every((category) => app.categories.includes(category));
      return matchesQuery && matchesCategories;
    });
  }, [apps, query, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchBar onChange={setQuery} placeholder="Search apps by name or description" />
        <CategoryChips categories={categories} selected={selectedCategories} onToggle={toggleCategory} onClear={() => setSelectedCategories([])} />
      </div>
      {filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No applications match your filters. Try adjusting your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredApps.map((app) => (
            <AppTile key={app.id} {...app} />
          ))}
        </div>
      )}
    </div>
  );
}
