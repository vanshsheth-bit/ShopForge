'use client';

import { useState, useEffect } from 'react';
import { PageVersion } from '@/types';
import { getPageVersions } from '@/lib/storage';
import clsx from 'clsx';

interface VersionHistoryProps {
  pageId: string;
  currentHtml: string;
  onRestore: (version: PageVersion) => void;
  onClose: () => void;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${hours}h ago`;
}

export default function VersionHistory({
  pageId,
  currentHtml,
  onRestore,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [previewVersion, setPreviewVersion] = useState<PageVersion | null>(null);

  useEffect(() => {
    const v = getPageVersions(pageId);
    setVersions([...v].reverse()); // newest first
    if (v.length > 0) setPreviewVersion(v[v.length - 1]);
  }, [pageId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        className="w-full max-w-5xl bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ height: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">Version History</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{versions.length} versions saved</p>
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

        <div className="flex flex-1 overflow-hidden">
          {/* Version list */}
          <div className="w-72 shrink-0 border-r border-zinc-800 overflow-y-auto p-4 space-y-2">
            {versions.length === 0 && (
              <div className="text-center py-12">
                <span
                  className="material-symbols-outlined text-zinc-700 block mb-2"
                  style={{ fontSize: '32px' }}
                >
                  history
                </span>
                <p className="text-xs text-zinc-600">No versions yet. Save the page first.</p>
              </div>
            )}
            {versions.map((version) => (
              <button
                key={version.versionId}
                onClick={() => setPreviewVersion(version)}
                className={clsx(
                  'w-full text-left rounded-xl p-3 border transition-all',
                  previewVersion?.versionId === version.versionId
                    ? 'border-[#3b2bee]/50 bg-[#3b2bee]/10'
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-white">v{version.versionNumber}</span>
                  <span className="text-[10px] text-zinc-500">{timeAgo(version.createdAt)}</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">
                  {version.prompt}
                </p>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {previewVersion ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0 bg-zinc-900/50">
                  <div>
                    <p className="text-sm font-bold text-white">{previewVersion.label}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                      {previewVersion.prompt}
                    </p>
                  </div>
                  <button
                    onClick={() => onRestore(previewVersion)}
                    className="flex items-center gap-1.5 btn-primary rounded-xl px-4 py-2 text-xs font-bold"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                    >
                      restore
                    </span>
                    Restore this version
                  </button>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  <iframe
                    srcDoc={previewVersion.html}
                    title={previewVersion.label}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-600 text-sm">Select a version to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
