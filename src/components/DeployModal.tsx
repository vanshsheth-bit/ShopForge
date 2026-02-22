'use client';

import { useState } from 'react';
import { GeneratedCode } from '@/types';
import clsx from 'clsx';

interface DeployModalProps {
  title: string;
  pageType: string;
  generatedCode: GeneratedCode;
  onClose: () => void;
}

type DeployState = 'idle' | 'deploying' | 'success' | 'error';

const DEPLOY_STEPS = [
  'Preparing project files...',
  'Uploading to Vercel...',
  'Building Next.js app...',
  'Deploying to production...',
  'Almost ready...',
];

export default function DeployModal({ title, pageType, generatedCode, onClose }: DeployModalProps) {
  const [deployState, setDeployState] = useState<DeployState>('idle');
  const [deployUrl, setDeployUrl] = useState('');
  const [error, setError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    setDeployState('deploying');
    setError('');
    setStepIndex(0);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, DEPLOY_STEPS.length - 1));
    }, 3000);

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: '',
          componentCode: generatedCode.componentCode,
          cssCode: generatedCode.cssCode,
          title,
          pageType,
        }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok || data.error) {
        setError(data.error || 'Deployment failed');
        setDeployState('error');
        return;
      }

      setDeployUrl(data.url);
      setDeployState('success');
    } catch {
      clearInterval(stepInterval);
      setError('Network error. Please check your connection.');
      setDeployState('error');
    }
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(deployUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={deployState === 'deploying' ? undefined : onClose}
    >
      <div
        className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black border border-zinc-700 flex items-center justify-center">
              <svg width="18" height="16" viewBox="0 0 76 65" fill="white">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-white">Deploy to Vercel</h2>
              <p className="text-xs text-zinc-500">One-click production deployment</p>
            </div>
          </div>
          {deployState !== 'deploying' && (
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                close
              </span>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* IDLE state */}
          {deployState === 'idle' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3b2bee]/10 border border-[#3b2bee]/20 flex items-center justify-center shrink-0">
                    <span
                      className="material-symbols-outlined text-[#3b2bee]"
                      style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                    >
                      {pageType === 'landing' ? 'web' : 'shopping_bag'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white truncate">{title}</p>
                    <p className="text-xs text-zinc-500 capitalize">{pageType} Page · Next.js + Tailwind</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">What gets deployed</p>
                {[
                  'Full Next.js 14 project',
                  'Tailwind CSS configured',
                  'React component + styles',
                  'Live production URL',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="text-emerald-400 text-xs">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs text-amber-400/80 leading-relaxed">
                  <span className="font-bold">Required:</span> Add <code className="bg-amber-500/10 px-1 rounded">VERCEL_DEPLOY_TOKEN</code> to your <code className="bg-amber-500/10 px-1 rounded">.env.local</code>. Get it from vercel.com/account/tokens
                </p>
              </div>

              <button
                onClick={handleDeploy}
                className="w-full py-4 bg-black border border-zinc-700 text-white font-black rounded-xl hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <svg width="16" height="14" viewBox="0 0 76 65" fill="white">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                Deploy to Vercel
              </button>
            </div>
          )}

          {/* DEPLOYING state */}
          {deployState === 'deploying' && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-white animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="20" height="18" viewBox="0 0 76 65" fill="white">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{DEPLOY_STEPS[stepIndex]}</p>
                  <p className="text-xs text-zinc-500 mt-1">This usually takes 30–60 seconds</p>
                </div>
              </div>

              <div className="space-y-2">
                {DEPLOY_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={clsx(
                      'flex items-center gap-3 text-xs transition-all',
                      i < stepIndex ? 'text-emerald-400' : i === stepIndex ? 'text-white' : 'text-zinc-700'
                    )}
                  >
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{
                        fontSize: '14px',
                        fontVariationSettings: i < stepIndex ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      {i < stepIndex
                        ? 'check_circle'
                        : i === stepIndex
                        ? 'radio_button_checked'
                        : 'radio_button_unchecked'}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUCCESS state */}
          {deployState === 'success' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-emerald-400"
                    style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="text-lg font-black text-white">Deployed successfully!</p>
                  <p className="text-xs text-zinc-500 mt-1">Your page is live on Vercel</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 truncate font-mono">
                    {deployUrl}
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold transition-all shrink-0',
                      copied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'btn-primary'
                    )}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {copied ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              <a
                href={deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-black border border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-900 transition-all text-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  open_in_new
                </span>
                Open Live Site
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-bold transition-all"
              >
                Close
              </button>
            </div>
          )}

          {/* ERROR state */}
          {deployState === 'error' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-red-400"
                    style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                </div>
                <div>
                  <p className="text-base font-black text-white">Deployment failed</p>
                  <p className="text-xs text-red-400 mt-2 leading-relaxed">{error}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <p className="font-bold text-white">Troubleshooting:</p>
                <p>1. Check VERCEL_DEPLOY_TOKEN in .env.local</p>
                <p>2. Make sure token has deployment permissions</p>
                <p>3. Get token at vercel.com/account/tokens</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeployState('idle')}
                  className="flex-1 py-3 btn-primary rounded-xl text-sm font-bold"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-sm font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
