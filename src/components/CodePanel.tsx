'use client';

import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GeneratedCode, GeneratedPageData, PageType } from '@/types';
import clsx from 'clsx';

interface CodePanelProps {
  html: string;
  generatedCode: GeneratedCode | null;
  pageData: GeneratedPageData | null;
  pageType: PageType;
}

// ─── Prettier dynamic loader (for nicer code formatting) ────────────────────

async function loadPrettier(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.prettier && window.prettierPlugins?.babel) return;

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const existing = Array.from(document.getElementsByTagName('script')).find(
        (s) => s.src === src
      );
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  try {
    // Prettier standalone + Babel parser for JSX/TSX
    await loadScript('https://unpkg.com/prettier@3.2.5/standalone.js');
    await loadScript('https://unpkg.com/prettier@3.2.5/parser-babel.js');
  } catch {
    // If loading fails, we silently fall back to unformatted code
  }
}

function formatComponentCode(code: string): string {
  if (typeof window === 'undefined') return code;
  const anyWin = window as any;
  const prettier = anyWin.prettier;
  const babelPlugin = anyWin.prettierPlugins?.babel;
  if (!prettier || !babelPlugin) return code;

  try {
    return prettier.format(code, {
      parser: 'babel',
      plugins: [babelPlugin],
      singleQuote: true,
      trailingComma: 'all',
      semi: true,
      printWidth: 100,
      tabWidth: 2,
    });
  } catch {
    return code;
  }
}

type CodeTab = 'component' | 'css' | 'html';

/**
 * Fix code strings that have literal \n escape sequences instead of real newlines.
 * This happens when the AI response JSON is stored and the string escapes aren't
 * converted back to real characters.
 */
function unescapeCode(code: string): string {
  if (!code) return '';
  // Already has real newlines — return as-is
  if (code.includes('\n')) return code;
  // Replace literal backslash-n sequences with real newlines
  return code
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r');
}

// ─── JSZip dynamic loader ────────────────────────────────────────────────────

type JSZipInstance = {
  folder: (name: string) => JSZipInstance;
  file: (name: string, content: string) => void;
  generateAsync: (options: { type: 'blob'; compression?: string }) => Promise<Blob>;
};

declare global {
  interface Window {
    JSZip?: new () => JSZipInstance;
    prettier?: any;
    prettierPlugins?: any;
  }
}

function loadJSZip(): Promise<new () => JSZipInstance> {
  return new Promise((resolve, reject) => {
    if (window.JSZip) { resolve(window.JSZip); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => window.JSZip ? resolve(window.JSZip) : reject(new Error('JSZip not found after load'));
    script.onerror = () => reject(new Error('Failed to load JSZip'));
    document.head.appendChild(script);
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

// Build a nice, production-style React file for display/export
function buildComponentFile(rawComponentCode: string): string {
  const core = unescapeCode(rawComponentCode).trim();

  // Ensure we have a function App() definition
  let body = core;
  if (!body.includes('function App')) {
    body = `function App() {\n  return (\n    ${body}\n  );\n}`;
  }

  // Add export default if missing
  if (!/export\s+default\s+function\s+App/.test(body)) {
    body = body.replace(/^function\s+App\s*\(/, 'export default function App(');
  }

  // Prepend React import
  const file = `import React from 'react';\n\n${body}`;
  return file;
}

export default function CodePanel({ html, generatedCode, pageData, pageType }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<CodeTab>('component');
  const [isZipping, setIsZipping] = useState(false);
  // Note: we still load Prettier lazily for possible future use, but
  // the current UI uses our own simple formatting (buildComponentFile).
  useEffect(() => {
    loadPrettier().catch(() => {
      // ignore; we'll just show unformatted code if Prettier fails to load
    });
  }, []);

  const getCurrentCode = (): string => {
    if (activeTab === 'component' && generatedCode)
      return buildComponentFile(generatedCode.componentCode);
    if (activeTab === 'css' && generatedCode) return unescapeCode(generatedCode.cssCode);
    if (activeTab === 'html') return html;
    if (!generatedCode) return html;
    return buildComponentFile(generatedCode.componentCode);
  };

  const getCurrentLanguage = () => {
    if (activeTab === 'css') return 'css';
    if (activeTab === 'html') return 'html';
    return 'jsx';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopforge-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (!generatedCode || !pageData || isZipping) return;
    setIsZipping(true);

    try {
      const JSZip = await loadJSZip();
      const cssCode = unescapeCode(generatedCode.cssCode);

      const packageJson = JSON.stringify(
        {
          name: 'shopforge-page',
          version: '0.1.0',
          private: true,
          scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
          dependencies: { next: '14.0.0', react: '^18', 'react-dom': '^18' },
          devDependencies: { tailwindcss: '^3', autoprefixer: '^10', postcss: '^8' },
        },
        null,
        2
      );

      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
`;

      const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

      const layoutCode = `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

      const pageCode = `import App from '../components/App';

export default function Page() {
  return <App />;
}
`;

      const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

${cssCode}
`;

      const readme = `# ${generatedCode.title}

Generated by ShopForge — AI Storefront Builder.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000 to view your store.
`;

      const zip = new JSZip();
      const root = zip.folder('shopforge-project');
      root.file('package.json', packageJson);
      root.file('tailwind.config.js', tailwindConfig);
      root.file('postcss.config.js', postcssConfig);
      root.file('README.md', readme);

      const srcFolder = root.folder('src');
      const app = srcFolder.folder('app');
      app.file('layout.jsx', layoutCode);
      app.file('page.jsx', pageCode);
      app.file('globals.css', globalCss);

      const componentsFolder = srcFolder.folder('components');

      // Build App.jsx directly from the generated componentCode so the ZIP matches
      // the live preview exactly.
      const appComponentCode = `'use client';\nimport React from 'react';\n\n${unescapeCode(
        generatedCode.componentCode
      ).replace(/^function App/, 'export default function App')}`;

      componentsFolder.file('App.jsx', appComponentCode);

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shopforge-nextjs-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Zip failed, falling back to HTML:', err);
      handleDownloadHTML();
    } finally {
      setIsZipping(false);
    }
  };

  if (!html && !generatedCode) {
    return (
      <div className="flex h-full items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <span className="material-symbols-outlined text-zinc-700 mb-3 block" style={{ fontSize: '48px' }}>
            terminal
          </span>
          <p className="text-sm text-zinc-600">No code generated yet.</p>
        </div>
      </div>
    );
  }

  const codeTabs: { id: CodeTab; label: string; icon: string }[] = [
    ...(generatedCode
      ? [
          { id: 'component' as CodeTab, label: 'App.jsx', icon: 'javascript' },
          { id: 'css' as CodeTab, label: 'styles.css', icon: 'css' },
        ]
      : []),
    { id: 'html' as CodeTab, label: 'preview.html', icon: 'code' },
  ];

  return (
    <div className="flex h-full flex-col bg-[#09090b]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#3b2bee]" style={{ fontSize: '20px' }}>
            terminal
          </span>
          <h3 className="text-sm font-bold text-white">Export Production Code</h3>
          {generatedCode && (
            <span className="text-[10px] bg-[#3b2bee]/10 text-[#3b2bee] px-2 py-0.5 rounded-full font-bold border border-[#3b2bee]/20">
              REACT + TAILWIND
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 hidden sm:block">
          All dependencies included. Optimized for performance.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-zinc-800/50 bg-zinc-900/30">
        {codeTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'border-[#3b2bee] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            )}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code display */}
      <div className="flex-1 overflow-auto relative">
        {/* Floating copy button */}
        <button
          onClick={handleCopy}
          className={clsx(
            'absolute right-5 top-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95',
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-[#3b2bee] hover:text-white hover:border-[#3b2bee] backdrop-blur'
          )}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '14px', fontVariationSettings: copied ? "'FILL' 1" : "'FILL' 0" }}
          >
            {copied ? 'check_circle' : 'content_copy'}
          </span>
          {copied ? 'COPIED!' : 'COPY CODE'}
        </button>

        <SyntaxHighlighter
          language={getCurrentLanguage()}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.72rem',
            lineHeight: '1.7',
            fontFamily:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
          showLineNumbers
          lineNumberStyle={{ color: '#3f3f46', minWidth: '2.5rem' }}
          wrapLines
          wrapLongLines={false}
        >
          {String(getCurrentCode() ?? '')}
        </SyntaxHighlighter>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500 text-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            info
          </span>
          All dependencies included in package.json
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadHTML}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              download
            </span>
            Download HTML
          </button>
          {generatedCode && (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-bold active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span
                className={clsx('material-symbols-outlined', isZipping && 'animate-spin')}
                style={{ fontSize: '16px' }}
              >
                {isZipping ? 'progress_activity' : 'folder_zip'}
              </span>
              {isZipping ? 'Zipping...' : 'Download .zip'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}