'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GeneratedPage } from '@/types';

function decodeShareData(encoded: string): GeneratedPage | null {
  try {
    const json = atob(decodeURIComponent(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function SharePage() {
  const params = useParams();
  const [page, setPage] = useState<GeneratedPage | null>(null);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) {
      setError(true);
      return;
    }

    // Legacy links: full base64-encoded payload in the URL param
    if (id.length > 100) {
      const decoded = decodeShareData(id);
      if (!decoded) {
        setError(true);
        return;
      }
      setPage(decoded);
      return;
    }

    if (typeof window === 'undefined') return;

    const key = `shopforge_share_${id}`;

    try {
      // Prefer sessionStorage (same-tab), then fall back to localStorage
      const sessionRaw = typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(key)
        : null;
      const localRaw = !sessionRaw && typeof localStorage !== 'undefined'
        ? localStorage.getItem(key)
        : null;
      const raw = sessionRaw || localRaw;

      if (!raw) {
        setNotFound(true);
        return;
      }

      const parsed = JSON.parse(raw) as GeneratedPage;
      setPage(parsed);
    } catch {
      setError(true);
    }
  }, [params]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-white text-xl font-bold mb-3">This share link expired</p>
          <p className="text-zinc-400 text-sm mb-4">
            This link only works in the same browser where it was created. For cross-device
            sharing, the page needs to be saved first.
          </p>
          <a
            href="/"
            className="mt-4 inline-block px-6 py-3 bg-[#3b2bee] text-white rounded-xl font-bold text-sm hover:bg-[#3b2bee]/80 transition-all"
          >
            Open ShopForge
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Invalid share link</p>
          <p className="text-zinc-500 text-sm">This link may be expired or malformed.</p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-[#3b2bee] text-white rounded-xl font-bold text-sm hover:bg-[#3b2bee]/80 transition-all"
          >
            Create your own
          </a>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <span
            className="material-symbols-outlined animate-spin"
            style={{ fontSize: '24px' }}
          >
            progress_activity
          </span>
          <span className="text-sm">Loading shared page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3b2bee]">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
            <span className="text-sm font-black text-white">ShopForge</span>
            <span className="text-zinc-700">·</span>
            <span className="text-sm text-zinc-400 truncate max-w-xs">{page.title}</span>
            <span className="text-[10px] bg-[#3b2bee]/10 text-[#3b2bee] px-2 py-0.5 rounded-full font-bold border border-[#3b2bee]/20 capitalize">
              {page.pageType} page
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                link
              </span>
              Copy Link
            </button>
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-primary text-xs font-bold"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              Build your own
            </a>
          </div>
        </div>
      </div>

      {/* Full page preview */}
      <div className="flex-1 pt-14">
        <iframe
          srcDoc={page.html}
          title={page.title}
          className="w-full border-0"
          style={{ height: 'calc(100vh - 3.5rem)' }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
