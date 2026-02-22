'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, PageType, TemplatePreset } from '@/types';
import PageTypeSelector from './PageTypeSelector';
import PresetSelector from './PresetSelector';
import clsx from 'clsx';

interface ChatPanelProps {
  messages: Message[];
  pageType: PageType;
  preset: TemplatePreset;
  referenceUrl: string;
  isLoading: boolean;
  onPageTypeChange: (type: PageType) => void;
  onPresetChange: (preset: TemplatePreset) => void;
  onReferenceUrlChange: (url: string) => void;
  onSend: (content: string) => void;
}

const EXAMPLE_PROMPTS: { pageType: PageType; text: string }[] = [
  {
    pageType: 'landing',
    text: "Premium coffee subscription 'Morning Ritual'. Dark moody aesthetic, gold accents.",
  },
  {
    pageType: 'landing',
    text: "Organic skincare brand 'Glow Natural'. Light airy feel, sage green palette.",
  },
  {
    pageType: 'product',
    text: 'Wireless noise-canceling headphones. Sleek tech-focused design, dark theme.',
  },
  {
    pageType: 'product',
    text: "Handmade leather wallet 'Craft & Co'. Warm browns, artisan minimal style.",
  },
];

const LOADING_MESSAGES = [
  'Crafting your design...',
  'Writing React components...',
  'Applying Tailwind styles...',
  'Building your layout...',
  'Adding finishing touches...',
  'Almost there...',
];

function LoadingBar() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8, 90));
    }, 600);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 p-4 bg-[#3b2bee]/5 border border-[#3b2bee]/20 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#3b2bee] animate-spin"
            style={{ fontSize: '16px' }}
          >
            progress_activity
          </span>
          <span className="text-xs font-semibold text-[#3b2bee]">{LOADING_MESSAGES[messageIndex]}</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">{Math.round(progress)}%</span>
      </div>
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#3b2bee] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isError =
    message.content.startsWith('Error:') || message.content.startsWith('Network error');

  return (
    <div className={clsx('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={clsx(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
          isUser ? 'bg-[#3b2bee] text-white' : 'bg-zinc-800 text-zinc-400'
        )}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
          {isUser ? 'person' : 'smart_toy'}
        </span>
      </div>
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed',
          isUser
            ? 'rounded-tr-sm bg-[#3b2bee] text-white'
            : isError
            ? 'rounded-tl-sm bg-red-500/10 border border-red-500/20 text-red-400'
            : 'rounded-tl-sm bg-zinc-900 border border-zinc-800 text-zinc-300'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function ChatPanel({
  messages,
  pageType,
  preset,
  referenceUrl,
  isLoading,
  onPageTypeChange,
  onPresetChange,
  onReferenceUrlChange,
  onSend,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showReference, setShowReference] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFirstMessage = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleExampleClick = (example: { pageType: PageType; text: string }) => {
    onPageTypeChange(example.pageType);
    setInput(example.text);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col bg-[#09090b]">
      {/* Scrollable config + messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 [scrollbar-width:thin]">

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white">Create your storefront</h2>
          <p className="text-sm text-zinc-500">Configure your AI-generated shop page below.</p>
        </div>

        {/* Page type */}
        <PageTypeSelector value={pageType} onChange={onPageTypeChange} disabled={isLoading} />

        {/* Style preset */}
        <PresetSelector
          value={preset}
          onChange={onPresetChange}
          disabled={isLoading}
        />

        {/* Reference URL */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Inspiration URL
            </label>
            <span className="text-[10px] bg-[#3b2bee]/10 text-[#3b2bee] px-2 py-0.5 rounded-full font-bold">
              OPTIONAL
            </span>
          </div>
          {!showReference ? (
            <button
              onClick={() => setShowReference(true)}
              className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                link
              </span>
              Add reference URL for design inspiration
            </button>
          ) : (
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                style={{ fontSize: '16px' }}
              >
                link
              </span>
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => onReferenceUrlChange(e.target.value)}
                placeholder="https://apple.com/store"
                className="w-full pl-10 pr-10 py-3 input-field rounded-xl text-sm"
              />
              {referenceUrl && (
                <button
                  onClick={() => { onReferenceUrlChange(''); setShowReference(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    close
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Prompt area */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Design Prompt
          </label>

          {/* Examples (first message only) */}
          {isFirstMessage && !isLoading && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Try an example</p>
              {EXAMPLE_PROMPTS.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-left text-xs text-zinc-400 transition-all hover:border-[#3b2bee]/30 hover:bg-[#3b2bee]/5 hover:text-zinc-200"
                >
                  <span className="mr-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#3b2bee]/15 text-[#3b2bee]">
                    {example.pageType}
                  </span>
                  {example.text}
                </button>
              ))}
            </div>
          )}

          {/* Chat history */}
          {messages.length > 0 && (
            <div className="space-y-3 py-2">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && <LoadingBar />}
        </div>
      </div>

      {/* Input area - sticky bottom */}
      <div className="border-t border-zinc-800 p-4 space-y-3 bg-[#09090b]">
        {!isFirstMessage && !isLoading && (
          <p className="text-[10px] text-zinc-600 font-medium">
            💡 Refine: "Make the hero bigger", "Switch to dark mode", "Change to red theme"
          </p>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? 'Please wait...'
              : isFirstMessage
              ? 'Describe your dream boutique. Mention styles like "minimalist", "luxury", "brutalist grid"...'
              : 'Refine the page...'
          }
          rows={isFirstMessage ? 4 : 2}
          disabled={isLoading}
          className="w-full input-field rounded-xl px-4 py-3 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: isFirstMessage ? '100px' : '60px' }}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-full btn-primary rounded-xl py-3.5 flex items-center justify-center gap-2.5 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
          >
            {isLoading ? 'progress_activity' : 'bolt'}
          </span>
          {isLoading ? 'Generating...' : isFirstMessage ? 'Generate Website' : 'Refine Page'}
        </button>

        {isFirstMessage && (
          <p className="text-center text-[10px] text-zinc-600 px-4">
            By generating, you agree to our terms. Generation takes approximately 30–60 seconds.
          </p>
        )}
      </div>
    </div>
  );
}