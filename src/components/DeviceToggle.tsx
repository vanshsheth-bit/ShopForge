"use client";

import React from 'react';
import { DeviceType } from '@/types';
import clsx from 'clsx';

interface DeviceToggleProps {
  value: DeviceType;
  onChange: (device: DeviceType) => void;
}

const devices: { value: DeviceType; icon: string; label: string }[] = [
  { value: 'desktop', icon: 'desktop_windows', label: 'Desktop' },
  { value: 'tablet', icon: 'tablet_mac', label: 'Tablet' },
  { value: 'mobile', icon: 'phone_iphone', label: 'Mobile' },
];

export default function DeviceToggle({ value, onChange }: DeviceToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
      {devices.map((device) => (
        <button
          key={device.value}
          onClick={() => onChange(device.value)}
          title={device.label}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            value === device.value
              ? 'bg-[#3b2bee] text-white shadow-lg shadow-[#3b2bee]/20'
              : 'text-zinc-400 hover:text-zinc-100'
          )}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {device.icon}
          </span>
          <span className="hidden sm:inline uppercase tracking-wider text-[10px]">{device.label}</span>
        </button>
      ))}
    </div>
  );
}