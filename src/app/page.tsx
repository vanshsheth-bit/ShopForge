'use client';

import { useState, useCallback } from 'react';
import { AppState, Message, PageType, DeviceType, GeneratedPage, GeneratedCode, TemplatePreset, DesignVariant, PageVersion, GeneratedPageData } from '@/types';
import { generateId, savePage, addVersion } from '@/lib/storage';
import Header from '@/components/Header';
import ChatPanel from '@/components/ChatPanel';
import PreviewPanel from '@/components/PreviewPanel';
import CodePanel from '@/components/CodePanel';
import VariantPicker from '@/components/VariantPicker';
import VersionHistory from '@/components/VersionHistory';
import ComponentLibrary, { SectionTemplate } from '@/components/ComponentLibrary';
import ShareModal from '@/components/ShareModal';
import DeployModal from '@/components/DeployModal';
import clsx from 'clsx';

const initialState: AppState = {
  messages: [],
  currentHtml: '',
  currentCode: null,
  pageType: 'landing',
  referenceUrl: '',
  preset: 'bold' as TemplatePreset,
  isLoading: false,
  activeTab: 'preview',
  device: 'desktop',
  currentPageId: null,
};

export default function HomePage() {
  const [state, setState] = useState<AppState>(initialState);
  const [saved, setSaved] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [variants, setVariants] = useState<DesignVariant[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Maintain separate chat histories for each page type
  const [landingMessages, setLandingMessages] = useState<Message[]>([]);
  const [productMessages, setProductMessages] = useState<Message[]>([]);

  const updateState = (partial: Partial<AppState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const getCurrentMessages = () =>
    state.pageType === 'landing' ? landingMessages : productMessages;

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const currentMessages = getCurrentMessages();

      const isRefinement = currentMessages.length > 0 && state.currentCode !== null;

      // For refinements, inject the actual current code as context
      let messagesForAPI: Message[];

      if (isRefinement && state.currentCode) {
        // Build a clean refinement history: original request + current page JSON
        const originalUserMessage = currentMessages.find((m) => m.role === 'user');
        const activePageData: GeneratedPageData | null =
          state.pageType === 'landing'
            ? state.landingPageData ?? null
            : state.productPageData ?? null;

        const contextPayload =
          activePageData ?? {
            componentCode: state.currentCode.componentCode,
            cssCode: state.currentCode.cssCode,
            title: state.currentCode.title,
          };

        const codeContext: Message = {
          id: generateId(),
          role: 'assistant',
          content: JSON.stringify(contextPayload),
          timestamp: Date.now(),
        };

        messagesForAPI = [
          originalUserMessage ?? userMessage,
          codeContext,
          userMessage,
        ];
      } else {
        messagesForAPI = [...currentMessages, userMessage];
      }

      const updatedMessages = [...currentMessages, userMessage];
      updateState({ isLoading: true, messages: updatedMessages });

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesForAPI,
            pageType: state.pageType,
            preset: state.preset,
            referenceUrl: state.referenceUrl || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          const errorMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: `Error: ${data.error || 'Something went wrong. Please try again.'}`,
            timestamp: Date.now(),
          };
          const newMessagesForType = [...updatedMessages, errorMessage];

          if (state.pageType === 'landing') {
            setLandingMessages(newMessagesForType);
          } else {
            setProductMessages(newMessagesForType);
          }

          updateState({ isLoading: false, messages: newMessagesForType });
          return;
        }

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: '✅ Page generated! Check the preview. You can ask me to refine it.',
          timestamp: Date.now(),
        };

        const newPageId = state.currentPageId ?? generateId();

        const newMessagesForType = [...updatedMessages, assistantMessage];

        if (state.pageType === 'landing') {
          setLandingMessages(newMessagesForType);
        } else {
          setProductMessages(newMessagesForType);
        }

        const pageData: GeneratedPageData | undefined = data.pageData;

        updateState({
          isLoading: false,
          currentHtml: data.html,
          currentCode: (data.generatedCode as GeneratedCode) ?? null,
          // persist per-page-type
          landingHtml:
            state.pageType === 'landing' ? data.html : state.landingHtml ?? '',
          landingCode:
            state.pageType === 'landing'
              ? ((data.generatedCode as GeneratedCode) ?? null)
              : state.landingCode ?? null,
          landingPageData:
            state.pageType === 'landing'
              ? (pageData ?? null)
              : state.landingPageData ?? null,
          productHtml:
            state.pageType === 'product' ? data.html : state.productHtml ?? '',
          productCode:
            state.pageType === 'product'
              ? ((data.generatedCode as GeneratedCode) ?? null)
              : state.productCode ?? null,
          productPageData:
            state.pageType === 'product'
              ? (pageData ?? null)
              : state.productPageData ?? null,
          messages: newMessagesForType,
          activeTab: 'preview',
          currentPageId: newPageId,
        });

        // Auto-save new version if page was already saved
        if (state.currentPageId && data.generatedCode) {
          const labelPrompt = isRefinement ? content : 'Initial generation';
          addVersion(
            state.currentPageId,
            data.html,
            data.generatedCode as GeneratedCode,
            labelPrompt
          );
        }
      } catch {
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: 'Network error. Please check your connection and try again.',
          timestamp: Date.now(),
        };
        const newMessagesForType = [...updatedMessages, errorMessage];

        if (state.pageType === 'landing') {
          setLandingMessages(newMessagesForType);
        } else {
          setProductMessages(newMessagesForType);
        }

        updateState({ isLoading: false, messages: newMessagesForType });
      }
    },
    [state, landingMessages, productMessages]
  );

  const handleSavePage = () => {
    if (!state.currentHtml || !state.currentCode) return;

    const currentMessages = getCurrentMessages();
    const firstUserMessage = currentMessages.find((m) => m.role === 'user');
    const title =
      firstUserMessage?.content.slice(0, 50) ||
      `${state.pageType === 'landing' ? 'Landing' : 'Product'} Page`;

    const pageId = state.currentPageId ?? generateId();

    const initialVersion: PageVersion = {
      versionId: generateId(),
      versionNumber: 1,
      label: 'v1 — Initial generation',
      html: state.currentHtml,
      generatedCode: state.currentCode,
      prompt: firstUserMessage?.content ?? '',
      createdAt: Date.now(),
    };

    const page: GeneratedPage = {
      id: pageId,
      title,
      pageType: state.pageType,
      description: firstUserMessage?.content || '',
      html: state.currentHtml,
      generatedCode: state.currentCode ?? undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [initialVersion],
    };

    savePage(page);
    updateState({ currentPageId: pageId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleGenerateVariants = async () => {
    const currentMessages = getCurrentMessages();
    if (!currentMessages.length) return;
    setIsGeneratingVariants(true);
    try {
      const firstUserMessage = currentMessages.find((m) => m.role === 'user');
      if (!firstUserMessage) return;
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [firstUserMessage],
          pageType: state.pageType,
          referenceUrl: state.referenceUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.variants && data.variants.length > 0) {
        setVariants(data.variants as DesignVariant[]);
        setShowVariants(true);
      }
    } catch (e) {
      console.error('Failed to generate variants', e);
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const handleSelectVariant = (variant: DesignVariant) => {
    setSelectedVariantId(variant.id);
    const pageData = variant.pageData;
    updateState({
      currentHtml: variant.html,
      currentCode: variant.generatedCode,
      landingHtml:
        pageData.pageType === 'landing' ? variant.html : state.landingHtml ?? '',
      landingCode:
        pageData.pageType === 'landing' ? variant.generatedCode : state.landingCode ?? null,
      landingPageData:
        pageData.pageType === 'landing' ? pageData : state.landingPageData ?? null,
      productHtml:
        pageData.pageType === 'product' ? variant.html : state.productHtml ?? '',
      productCode:
        pageData.pageType === 'product' ? variant.generatedCode : state.productCode ?? null,
      productPageData:
        pageData.pageType === 'product' ? pageData : state.productPageData ?? null,
    });
  };

  const handleAddSection = async (section: SectionTemplate) => {
    const currentPageData =
      state.pageType === 'landing' ? state.landingPageData : state.productPageData;

    if (!currentPageData) return;

    setIsAddingSection(true);

    try {
      const res = await fetch('/api/insert-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPageData,
          sectionPrompt: section.prompt,
          sectionLabel: section.label,
          pageType: state.pageType,
          preset: state.preset,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        console.error('Failed to add section:', data.error);
        setIsAddingSection(false);
        return;
      }

      const updatedPageData: GeneratedPageData | undefined = data.pageData;

      updateState({
        isLoading: false,
        currentHtml: data.html,
        currentCode: data.generatedCode as GeneratedCode,
        landingHtml:
          state.pageType === 'landing' ? data.html : state.landingHtml ?? '',
        landingCode:
          state.pageType === 'landing'
            ? (data.generatedCode as GeneratedCode)
            : state.landingCode ?? null,
        landingPageData:
          state.pageType === 'landing'
            ? (updatedPageData ?? null)
            : state.landingPageData ?? null,
        productHtml:
          state.pageType === 'product' ? data.html : state.productHtml ?? '',
        productCode:
          state.pageType === 'product'
            ? (data.generatedCode as GeneratedCode)
            : state.productCode ?? null,
        productPageData:
          state.pageType === 'product'
            ? (updatedPageData ?? null)
            : state.productPageData ?? null,
      });
      setIsAddingSection(false);
      setToast('Section added successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error('Add section error:', e);
      setIsAddingSection(false);
    }
  };

  const handleRestoreVersion = (version: PageVersion) => {
    updateState({
      currentHtml: version.html,
      currentCode: version.generatedCode,
    });
    setShowVersionHistory(false);
  };

  const buildSharePage = (): GeneratedPage | null => {
    if (!state.currentHtml) return null;
    const currentMessages = getCurrentMessages();
    const firstUserMessage = currentMessages.find((m) => m.role === 'user');
    return {
      id: state.currentPageId ?? generateId(),
      title: firstUserMessage?.content.slice(0, 50) ?? 'My ShopForge Page',
      pageType: state.pageType,
      description: firstUserMessage?.content ?? '',
      html: state.currentHtml,
      generatedCode: state.currentCode ?? undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
    };
  };

  const handleReset = () => {
    setState(initialState);
    setLandingMessages([]);
    setProductMessages([]);
    setSaved(false);
    setShowCodePanel(false);
  };

  return (
    <div className="flex h-screen flex-col bg-[#09090b] overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Left panel — Chat/Config */}
        <aside className="flex w-[420px] shrink-0 flex-col border-r border-zinc-800 overflow-hidden">
          <ChatPanel
            messages={getCurrentMessages()}
            pageType={state.pageType}
            preset={state.preset}
            referenceUrl={state.referenceUrl}
            isLoading={state.isLoading}
            onPageTypeChange={(type: PageType) => {
              const nextMessages =
                type === 'landing' ? landingMessages : productMessages;
              // swap in the stored html/code for this type when switching tabs
              updateState({
                pageType: type,
                messages: nextMessages,
                currentHtml:
                  type === 'landing'
                    ? state.landingHtml ?? ''
                    : state.productHtml ?? '',
                currentCode:
                  type === 'landing'
                    ? state.landingCode ?? null
                    : state.productCode ?? null,
              });
            }}
            onPresetChange={(preset: TemplatePreset) => updateState({ preset })}
            onReferenceUrlChange={(url: string) => updateState({ referenceUrl: url })}
            onSend={handleSend}
          />
        </aside>

        {/* Right panel */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Action bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 h-12 bg-zinc-950/50 shrink-0">
            {/* Left: status */}
            <div className="flex items-center gap-3">
              {state.isLoading ? (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[#3b2bee] animate-spin"
                    style={{ fontSize: '16px' }}
                  >
                    progress_activity
                  </span>
                  <span className="text-xs font-semibold text-[#3b2bee]">Generating...</span>
                </div>
              ) : state.currentHtml ? (
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-2 w-2 rounded-full bg-emerald-500"
                  />
                  <span className="text-xs text-zinc-400 font-medium">
                    {state.currentCode ? 'React · Tailwind CSS' : 'HTML Preview'}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-zinc-600">No page generated yet</span>
              )}
            </div>

            {/* Current style preset badge */}
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b2bee]" />
              {state.preset === 'minimalist' && 'Minimalist style'}
              {state.preset === 'bold' && 'Bold style'}
              {state.preset === 'luxury' && 'Luxury style'}
              {state.preset === 'playful' && 'Playful style'}
            </span>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {/* Code toggle */}
              {state.currentHtml && (
                <button
                  onClick={() => setShowCodePanel(!showCodePanel)}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    showCodePanel
                      ? 'bg-[#3b2bee]/20 text-[#3b2bee] border border-[#3b2bee]/30'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                  )}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    code
                  </span>
                  Code
                </button>
              )}

              {/* Save */}
              {state.currentHtml && (
                <button
                  onClick={handleSavePage}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    saved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {saved ? 'check_circle' : 'save'}
                  </span>
                  {saved ? 'Saved!' : 'Save'}
                </button>
              )}

              {state.currentHtml && !state.isLoading && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                  >
                    share
                  </span>
                  Share
                </button>
              )}

              {state.currentCode && !state.isLoading && (
                <button
                  onClick={() => setShowDeployModal(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold bg-black border border-zinc-700 text-white hover:bg-zinc-900 transition-all"
                >
                  <svg width="12" height="11" viewBox="0 0 76 65" fill="white">
                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                  </svg>
                  Deploy
                </button>
              )}

              {state.currentHtml && !state.isLoading && (
                <button
                  onClick={() => setShowComponentLibrary(!showComponentLibrary)}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    showComponentLibrary
                      ? 'bg-[#3b2bee]/20 text-[#3b2bee] border border-[#3b2bee]/30'
                      : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                  >
                    widgets
                  </span>
                  {showComponentLibrary ? 'Close Panel' : 'Components'}
                </button>
              )}

              {state.currentPageId && state.currentHtml && (
                <button
                  onClick={() => setShowVersionHistory(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all border border-zinc-800"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    history
                  </span>
                  History
                </button>
              )}

              {state.currentHtml && !state.isLoading && (
                <button
                  onClick={handleGenerateVariants}
                  disabled={isGeneratingVariants}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    isGeneratingVariants
                      ? 'opacity-50 cursor-not-allowed border border-zinc-700 text-zinc-500'
                      : 'border border-violet-500/40 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                  )}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                  >
                    {isGeneratingVariants ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  {isGeneratingVariants ? 'Generating...' : '3 Variants'}
                </button>
              )}

              {/* New page */}
              {state.messages.length > 0 && !state.isLoading && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    add_circle
                  </span>
                  New Page
                </button>
              )}
            </div>
          </div>

          {/* Panel content — sidebar + preview side by side */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main preview/code area */}
            <div className="flex-1 overflow-hidden">
              {showCodePanel && state.currentHtml ? (
                <CodePanel
                  html={state.currentHtml}
                  generatedCode={state.currentCode}
                  pageData={
                    state.pageType === 'landing'
                      ? state.landingPageData ?? null
                      : state.productPageData ?? null
                  }
                  pageType={state.pageType}
                />
              ) : (
                <PreviewPanel
                  html={state.currentHtml}
                  generatedCode={state.currentCode}
                  device={state.device}
                  onDeviceChange={(device: DeviceType) => updateState({ device })}
                  isLoading={state.isLoading}
                  isAddingSection={isAddingSection}
                  onDrop={handleAddSection}
                />
              )}
            </div>

            {/* Component library sidebar */}
            {showComponentLibrary && (
              <ComponentLibrary
                pageType={state.pageType}
                isLoading={state.isLoading}
                onAddSection={handleAddSection}
                onClose={() => setShowComponentLibrary(false)}
              />
            )}
          </div>
        </main>
      </div>
      {showVariants && variants.length > 0 && (
        <VariantPicker
          variants={variants}
          selectedId={selectedVariantId}
          onSelect={handleSelectVariant}
          onClose={() => setShowVariants(false)}
        />
      )}
      {showVersionHistory && state.currentPageId && (
        <VersionHistory
          pageId={state.currentPageId}
          currentHtml={state.currentHtml}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
      {showShareModal && buildSharePage() && (
        <ShareModal
          page={buildSharePage()!}
          onClose={() => setShowShareModal(false)}
        />
      )}
      {showDeployModal && state.currentCode && (
        <DeployModal
          title={
            getCurrentMessages().find((m) => m.role === 'user')?.content.slice(0, 50) ??
            'My ShopForge Page'
          }
          pageType={state.pageType}
          generatedCode={state.currentCode}
          onClose={() => setShowDeployModal(false)}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-medium text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}