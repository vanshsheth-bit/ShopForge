'use client';

import { DesignVariant } from '@/types';
import clsx from 'clsx';

interface VariantPickerProps {
  variants: DesignVariant[];
  selectedId: string | null;
  onSelect: (variant: DesignVariant) => void;
  onClose: () => void;
}

export default function VariantPicker({
  variants,
  selectedId,
  onSelect,
  onClose,
}: VariantPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        className="w-full max-w-6xl bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ height: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">Choose Your Design</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {variants.length} variants generated  pick your favorite
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              close
            </span>
            Close
          </button>
        </div>

        {/* Variants grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={clsx(
                  'flex flex-col rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200',
                  selectedId === variant.id
                    ? 'border-[#3b2bee] shadow-lg shadow-[#3b2bee]/20'
                    : 'border-zinc-800 hover:border-zinc-600'
                )}
                onClick={() => onSelect(variant)}
              >
                {/* Label */}
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
                  <div>
                    <p className="text-sm font-bold text-white">{variant.label}</p>
                    <p className="text-[10px] text-zinc-500">{variant.style}</p>
                  </div>
                  {selectedId === variant.id && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#3b2bee] bg-[#3b2bee]/10 px-2 py-1 rounded-full border border-[#3b2bee]/30">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      Selected
                    </span>
                  )}
                </div>

                {/* Preview iframe */}
                <div className="relative flex-1 bg-white overflow-hidden" style={{ minHeight: '400px' }}>
                  <iframe
                    srcDoc={variant.html}
                    title={variant.label}
                    className="absolute inset-0 border-0 pointer-events-none"
                    style={{
                      width: '200%',
                      height: '200%',
                      transform: 'scale(0.5)',
                      transformOrigin: 'top left',
                    }}
                    sandbox="allow-scripts"
                  />
                </div>

                {/* Select button */}
                <button
                  onClick={() => onSelect(variant)}
                  className={clsx(
                    'w-full py-3 text-sm font-bold transition-all shrink-0',
                    selectedId === variant.id
                      ? 'bg-[#3b2bee] text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-[#3b2bee]/10 hover:text-[#3b2bee]'
                  )}
                >
                  {selectedId === variant.id ? '✓ Using this design' : 'Use this design'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
