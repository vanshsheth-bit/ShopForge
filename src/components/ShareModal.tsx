'use client';

import { useState, useEffect } from 'react';
import { GeneratedPage } from '@/types';
import { generateShareUrl } from '@/lib/share';
import clsx from 'clsx';

interface ShareModalProps {
  page: GeneratedPage;
  onClose: () => void;
}

export default function ShareModal({ page, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(generateShareUrl(page));
  }, [page]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3b2bee]/20 border border-[#3b2bee]/30 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#3b2bee]"
                style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
              >
                share
              </span>
            </div>
            <div>
              <h2 className="text-base font-black text-white">Share this page</h2>
              <p className="text-xs text-zinc-500">Share a preview link from this browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Page info */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="w-12 h-12 rounded-xl bg-[#3b2bee]/10 border border-[#3b2bee]/20 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[#3b2bee]"
                style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}
              >
                {page.pageType === 'landing' ? 'web' : 'shopping_bag'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{page.title}</p>
              <p className="text-xs text-zinc-500 capitalize">{page.pageType} Page</p>
            </div>
          </div>

          {/* Share link */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Share Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 truncate font-mono">
                {shareUrl || 'Generating link...'}
              </div>
              <button
                onClick={handleCopy}
                disabled={!shareUrl}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 disabled:opacity-50',
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'btn-primary'
                )}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', fontVariationSettings: copied ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {copied ? 'check_circle' : 'content_copy'}
                </span>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Open in new tab */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white text-sm font-bold transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              open_in_new
            </span>
            Open Preview in New Tab
          </a>

          {/* Info note */}
          <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
            ⚠️ Share links work in the <span className="font-semibold text-zinc-300">same browser</span> only.
            Save your page for permanent sharing.
          </p>
        </div>
      </div>
    </div>
  );
}
