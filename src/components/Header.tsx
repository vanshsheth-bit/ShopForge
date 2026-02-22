"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 glass-nav">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b2bee] text-white shadow-lg shadow-[#3b2bee]/20">
            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">ShopForge</h1>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/'
                ? 'text-[#3b2bee] bg-[#3b2bee]/10'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            Builder
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/dashboard'
                ? 'text-[#3b2bee] bg-[#3b2bee]/10'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            Dashboard
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            {/*<span className="text-xs font-bold text-[#3b2bee] uppercase tracking-wider">Pro Plan</span>
            <span className="text-[10px] text-zinc-500">Unlimited generations</span>*/}
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="size-9 rounded-full bg-[#3b2bee]/20 border border-[#3b2bee]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#3b2bee]" style={{ fontSize: '18px' }}>
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}