"use client";

import { useEffect, useState } from 'react';
import { GeneratedPage } from '@/types';
import { getStoredPages, deletePage } from '@/lib/storage';
import Header from '@/components/Header';
import Link from 'next/link';
import clsx from 'clsx';

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function PageCard({
  page,
  onDelete,
  onPreview,
}: {
  page: GeneratedPage;
  onDelete: (id: string) => void;
  onPreview: (page: GeneratedPage) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(page.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="group flex flex-col rounded-2xl bg-[#161616] border border-[#262626] card-hover transition-all overflow-hidden shadow-sm">
      {/* Mini preview */}
      <div
        className="relative aspect-[4/3] w-full bg-[#0a0a0a] overflow-hidden cursor-pointer"
        onClick={() => onPreview(page)}
      >
        <iframe
          srcDoc={page.html}
          title={page.title}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          style={{
            transform: 'scale(0.4)',
            transformOrigin: 'top left',
            width: '250%',
            height: '250%',
          }}
          sandbox="allow-scripts"
        />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
            {page.pageType === 'landing' ? 'Landing Page' : 'Product Page'}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex gap-2 w-full">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(page); }}
              className="flex-1 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Preview
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className={clsx(
                'size-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors',
                confirmDelete
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 backdrop-blur-md text-white hover:bg-red-500'
              )}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {confirmDelete ? 'warning' : 'delete'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-white truncate flex-1 mr-2">{page.title}</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{page.description || 'No description'}</p>

        <div className="mt-auto pt-4 border-t border-[#262626] flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
              schedule
            </span>
            {timeAgo(page.createdAt)}
          </span>

          <Link
            href="/"
            className="px-4 py-1.5 bg-[#3b2bee]/10 text-[#3b2bee] hover:bg-[#3b2bee] text-xs font-bold rounded-lg transition-all hover:text-white"
          >
            Edit Site
          </Link>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  page,
  onClose,
}: {
  page: GeneratedPage;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleDownload = () => {
    const blob = new Blob([page.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopforge-${page.pageType}-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ height: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white truncate max-w-sm">{page.title}</span>
            <span className="text-[10px] bg-[#3b2bee]/10 text-[#3b2bee] px-2 py-0.5 rounded-full font-bold border border-[#3b2bee]/20 capitalize">
              {page.pageType} page
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                import('@/lib/share').then(({ generateShareUrl }) => {
                  const url = generateShareUrl(page);
                  if (url) navigator.clipboard.writeText(url);
                });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                share
              </span>
              Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-[#3b2bee]/40 bg-[#3b2bee]/10 px-3 py-1.5 text-xs font-bold text-[#3b2bee] hover:bg-[#3b2bee]/20 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                download
              </span>
              Download HTML
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                close
              </span>
              Close (Esc)
            </button>
          </div>
        </div>

        {/* Iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            srcDoc={page.html}
            title={page.title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [pages, setPages] = useState<GeneratedPage[]>([]);
  const [previewPage, setPreviewPage] = useState<GeneratedPage | null>(null);
  const [filter, setFilter] = useState<'all' | 'landing' | 'product'>('all');

  useEffect(() => {
    setPages(getStoredPages());
  }, []);

  const handleDelete = (id: string) => {
    deletePage(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPages = pages.filter((p) => {
    if (filter === 'all') return true;
    return p.pageType === filter;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <main className="pt-28 pb-20 px-6 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Your Projects</h2>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-medium">{pages.length} saved {pages.length === 1 ? 'page' : 'pages'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter tabs */}
            <div className="flex bg-[#161616] p-1 rounded-xl border border-[#262626]">
              {(['all', 'landing', 'product'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize',
                    filter === f
                      ? 'bg-[#262626] text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-200'
                  )}
                >
                  {f === 'all' ? 'All' : f === 'landing' ? 'Landing' : 'Product'}
                </button>
              ))}
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-xl text-sm font-bold"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                add_circle
              </span>
              Generate New Site
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create new card */}
          <Link
            href="/"
            className="group relative flex flex-col items-center justify-center gap-4 min-h-[280px] rounded-2xl border-2 border-dashed border-[#262626] hover:border-[#3b2bee]/50 bg-transparent transition-all overflow-hidden"
          >
            <div className="size-14 rounded-full bg-[#3b2bee]/10 flex items-center justify-center text-[#3b2bee] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
                add
              </span>
            </div>
            <div className="text-center">
              <p className="font-bold text-white">Create New Project</p>
              <p className="text-xs text-zinc-500 mt-1">AI-powered shop generator</p>
            </div>
            <div className="absolute inset-0 bg-[#3b2bee]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Empty state message */}
          {pages.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-zinc-600" style={{ fontSize: '32px' }}>
                  web
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No saved pages yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Generate a page and click Save to store it here for later.
              </p>
            </div>
          )}

          {/* Page cards */}
          {filteredPages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              onDelete={handleDelete}
              onPreview={setPreviewPage}
            />
          ))}
        </div>
      </main>

      {/* Help button */}
      <button className="fixed bottom-6 right-6 size-12 bg-[#161616] border border-[#262626] rounded-full shadow-xl flex items-center justify-center text-zinc-400 hover:text-[#3b2bee] transition-all hover:scale-105 z-40">
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          help
        </span>
      </button>

      {previewPage && (
        <PreviewModal page={previewPage} onClose={() => setPreviewPage(null)} />
      )}
    </div>
  );
}