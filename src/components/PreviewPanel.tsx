'use client';

import { useEffect, useRef, useState } from 'react';
import { DeviceType, GeneratedCode } from '@/types';
import DeviceToggle from './DeviceToggle';
import { clsx } from 'clsx';
import { Loader2, MonitorX } from 'lucide-react';
import { SectionTemplate } from './ComponentLibrary';

interface PreviewPanelProps {
  html: string;
  generatedCode: GeneratedCode | null;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  isLoading: boolean;
  onDrop?: (section: SectionTemplate) => void;
  isAddingSection?: boolean;
}

const deviceConfig: Record<DeviceType, { width: number; label: string }> = {
  desktop: { width: 0, label: 'Full width' },
  tablet: { width: 768, label: '768px' },
  mobile: { width: 390, label: '390px' },
};

function buildReactPreviewHtml(generatedCode: GeneratedCode): string {
  let componentCode = generatedCode.componentCode
    .replace(/^import\s+.*?;?\s*$/gm, '')
    .replace(/^export\s+default\s+App;?\s*$/gm, '')
    .replace(/^export\s+default\s+function/gm, 'function')
    .trim();

  if (!componentCode.includes('function App')) {
    componentCode = `function App() {\n  return (\n    ${componentCode}\n  );\n}`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${generatedCode.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; padding: 0; overflow-x: hidden; }
    ${generatedCode.cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, true);
  </script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.23.4/babel.min.js"></script>
  <script type="text/babel" data-presets="react">
    ${componentCode}
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
}

function ReactPreview({
  generatedCode,
  device,
}: {
  generatedCode: GeneratedCode;
  device: DeviceType;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const html = buildReactPreviewHtml(generatedCode);
    iframeRef.current.srcdoc = html;
  }, [generatedCode]);

  const config = deviceConfig[device];
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const isConstrained = isMobile || isTablet;

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-start justify-center overflow-auto bg-gray-900 p-4"
    >
      {/* Browser chrome mockup for tablet/mobile */}
      {isConstrained ? (
        <div
          className="flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50"
          style={{ width: config.width, minHeight: '600px', flex: 'none' }}
        >
          {/* Browser top bar */}
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2.5 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 mx-2 rounded-md bg-gray-700/50 px-3 py-1 text-xs text-gray-400 text-center">
              🔒 your-store.shopforge.ai
            </div>
          </div>
          {/* iframe content */}
          <iframe
            ref={iframeRef}
            title="React Preview"
            className="w-full flex-1 border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
            style={{ height: '80vh' }}
          />
        </div>
      ) : (
        /* Desktop — full width with browser chrome */
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10">
          {/* Browser top bar */}
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2.5 border-b border-white/10 shrink-0">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 mx-2 rounded-md bg-gray-700/50 px-3 py-1 text-xs text-gray-400 text-center max-w-sm mx-auto">
              🔒 your-store.shopforge.ai
            </div>
          </div>
          <iframe
            ref={iframeRef}
            title="React Preview"
            className="flex-1 w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}

export default function PreviewPanel({
  html,
  generatedCode,
  device,
  onDeviceChange,
  isLoading,
  onDrop,
  isAddingSection,
}: PreviewPanelProps) {
  const hasContent = html || generatedCode;
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      onDragEnter={() => {
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        // Only reset when actually leaving the component, not moving between children
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsDragging(false);
        }
      }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Live Preview
          </span>
          {generatedCode && (
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              React · Tailwind CSS
            </span>
          )}
        </div>
        <DeviceToggle value={device} onChange={onDeviceChange} />
      </div>

      {/* Preview area */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gray-950/90 backdrop-blur-sm">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" style={{ animationDirection: 'reverse' }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">Generating your page</p>
              <p className="text-xs text-gray-500 mt-1">This may take a few seconds...</p>
            </div>
          </div>
        )}

        {!hasContent && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center bg-gray-950">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <MonitorX className="h-12 w-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No preview yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Describe your shop and click Generate
              </p>
            </div>
          </div>
        )}

        {hasContent && !isLoading && (
          <div
            className="h-full relative"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const sectionId = e.dataTransfer.getData('sectionId');
              const sectionPrompt = e.dataTransfer.getData('sectionPrompt');
              const sectionLabel = e.dataTransfer.getData('sectionLabel');
              if (sectionId && onDrop) {
                onDrop({ id: sectionId, prompt: sectionPrompt, label: sectionLabel } as SectionTemplate);
              }
              setIsDragging(false);
            }}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragging(false);
            }}
          >
            {generatedCode ? (
              <ReactPreview generatedCode={generatedCode} device={device} />
            ) : (
              <div
                className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 m-4"
                style={{ height: 'calc(100% - 2rem)' }}
              >
                <div className="flex items-center gap-2 bg-gray-800 px-4 py-2.5 border-b border-white/10 shrink-0">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 mx-2 rounded-md bg-gray-700/50 px-3 py-1 text-xs text-gray-400 text-center max-w-sm mx-auto">
                    🔒 your-store.shopforge.ai
                  </div>
                </div>
                <iframe
                  srcDoc={html}
                  title="Generated Page Preview"
                  className="flex-1 w-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}

            {/* Drop overlay — ABOVE the iframe, intercepts drag events */}
            {isDragging && (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#3b2bee] bg-[#3b2bee]/10 backdrop-blur-sm"
                style={{ pointerEvents: 'all' }}
              >
                <span
                  className="material-symbols-outlined text-[#3b2bee] text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_circle
                </span>
                <p className="text-sm font-bold text-[#3b2bee]">Drop to add section</p>
              </div>
            )}

            {isAddingSection && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gray-950/80 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-full border-4 border-[#3b2bee]/20 border-t-[#3b2bee] animate-spin" />
                <p className="text-sm font-medium text-white">Adding section...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}