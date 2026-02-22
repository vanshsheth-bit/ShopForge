'use client';

import React from 'react';
import { TemplatePreset } from '@/types';
import clsx from 'clsx';

const PRESETS: {
  value: TemplatePreset;
  label: string;
  emoji: string;
  description: string;
  colors: string;
}[] = [
  {
    value: 'minimalist',
    label: 'Minimalist',
    emoji: '◻',
    description: 'Clean, airy, subtle',
    colors: 'border-zinc-700 text-zinc-300',
  },
  {
    value: 'bold',
    label: 'Bold',
    emoji: '◼',
    description: 'Strong, high contrast',
    colors: 'border-zinc-700 text-zinc-300',
  },
  {
    value: 'luxury',
    label: 'Luxury',
    emoji: '◈',
    description: 'Premium, dark, gold',
    colors: 'border-zinc-700 text-zinc-300',
  },
  {
    value: 'playful',
    label: 'Playful',
    emoji: '◉',
    description: 'Colorful, fun, rounded',
    colors: 'border-zinc-700 text-zinc-300',
  },
];

interface PresetSelectorProps {
  value: TemplatePreset;
  onChange: (preset: TemplatePreset) => void;
  disabled?: boolean;
}

export default function PresetSelector({ value, onChange, disabled }: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Style Preset
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            disabled={disabled}
            className={clsx(
              'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              value === preset.value
                ? 'border-[#3b2bee]/60 bg-[#3b2bee]/10 text-white shadow-lg shadow-[#3b2bee]/10'
                : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50'
            )}
          >
            <span className="text-base leading-none">{preset.emoji}</span>
            <span className="text-xs font-bold mt-1">{preset.label}</span>
            <span className="text-[10px] text-zinc-500 leading-tight">{preset.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
