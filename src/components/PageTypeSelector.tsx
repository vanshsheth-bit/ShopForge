"use client";

import React from 'react';
import { PageType } from '@/types';
import clsx from 'clsx';

interface PageTypeSelectorProps {
  value: PageType;
  onChange: (type: PageType) => void;
  disabled?: boolean;
}

export default function PageTypeSelector({
  value,
  onChange,
  disabled = false,
}: PageTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Generation Mode
      </label>
      <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
        <button
          onClick={() => onChange('landing')}
          disabled={disabled}
          className={clsx(
            'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            value === 'landing'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          Landing Page
        </button>
        <button
          onClick={() => onChange('product')}
          disabled={disabled}
          className={clsx(
            'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            value === 'product'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          Product Page
        </button>
      </div>
    </div>
  );
}