'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AppTileProps {
  name: string;
  description: string;
  loginUrl: string;
  iconUrl?: string | null;
}

export function AppTile({ name, description, loginUrl, iconUrl }: AppTileProps) {
  const [errored, setErrored] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        'group flex h-40 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:ring-2',
        'focus:outline-none'
      )}
      onClick={() => window.open(loginUrl, '_blank', 'noopener,noreferrer')}
      aria-label={`Open ${name} login`}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-100">
        {iconUrl && !errored ? (
          <Image
            src={iconUrl}
            alt=""
            width={56}
            height={56}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
            priority={false}
          />
        ) : (
          <span className="text-xl font-semibold text-primary-600">
            {name
              .split(' ')
              .filter(Boolean)
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'APP'}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-slate-900">{name}</span>
      <span className="mt-1 line-clamp-2 text-xs text-slate-500">{description}</span>
    </button>
  );
}
