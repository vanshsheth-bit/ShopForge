import { GeneratedPage, PageVersion, GeneratedCode } from '@/types';

const STORAGE_KEY = 'shopforge_pages';

export function getStoredPages(): GeneratedPage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const pages = raw ? JSON.parse(raw) : [];
    // Migrate old pages that don't have versions array
    return pages.map((p: GeneratedPage) => ({
      ...p,
      versions: p.versions ?? [],
    }));
  } catch {
    return [];
  }
}

export function getStorageSizeKB(): number {
  try {
    if (typeof window === 'undefined') return 0;
    const raw = localStorage.getItem(STORAGE_KEY) ?? '';
    return Math.round((raw.length * 2) / 1024);
  } catch {
    return 0;
  }
}

export function savePage(page: GeneratedPage): void {
  if (typeof window === 'undefined') return;
  try {
    const pages = getStoredPages();

    // If we're already near the 4MB limit, proactively evict oldest pages
    let estimatedSize = getStorageSizeKB();
    while (estimatedSize > 4000 && pages.length > 0) {
      pages.pop();
      console.warn('ShopForge: localStorage size high, evicting oldest page before save');
      estimatedSize = getStorageSizeKB();
    }

    const safeHtml = page.html.length > 150000
      ? page.html.slice(0, 150000) + '<!-- truncated for storage -->'
      : page.html;
    const safePage: GeneratedPage = { ...page, html: safeHtml };

    const existingIndex = pages.findIndex((p) => p.id === page.id);
    if (existingIndex >= 0) {
      pages[existingIndex] = safePage;
    } else {
      pages.unshift(safePage);
    }

    trySetStorage(pages);
  } catch {
    console.error('Failed to save page to localStorage');
  }
}

function trySetStorage(pages: GeneratedPage[], attempt = 0): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch (e: any) {
    const isQuota = e?.name === 'QuotaExceededError' || e?.code === 22;
    if (isQuota && pages.length > 0 && attempt < 3) {
      // Evict oldest and retry
      pages.pop();
      console.warn('ShopForge: localStorage quota exceeded, evicting oldest page');
      trySetStorage(pages, attempt + 1);
    } else if (isQuota) {
      console.error('ShopForge: localStorage quota exceeded, could not save page');
    } else {
      console.error('ShopForge: Failed to write to localStorage', e);
    }
  }
}

export function addVersion(
  pageId: string,
  html: string,
  generatedCode: GeneratedCode,
  prompt: string
): PageVersion | null {
  if (typeof window === 'undefined') return null;
  try {
    const pages = getStoredPages();
    const pageIndex = pages.findIndex((p) => p.id === pageId);
    if (pageIndex === -1) return null;

    const page = pages[pageIndex];
    const versionNumber = (page.versions?.length ?? 0) + 1;

    const version: PageVersion = {
      versionId: generateId(),
      versionNumber,
      label: `v${versionNumber} — ${prompt.slice(0, 40)}${
        prompt.length > 40 ? '...' : ''
      }`,
      html,
      generatedCode,
      prompt,
      createdAt: Date.now(),
    };

    page.versions = [...(page.versions ?? []), version];
    page.html = html;
    page.generatedCode = generatedCode;
    page.updatedAt = Date.now();
    pages[pageIndex] = page;

    trySetStorage(pages);
    return version;
  } catch {
    console.error('Failed to add version');
    return null;
  }
}

export function getPageVersions(pageId: string): PageVersion[] {
  const pages = getStoredPages();
  return pages.find((p) => p.id === pageId)?.versions ?? [];
}

export function deletePage(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const pages = getStoredPages().filter((p) => p.id !== id);
    trySetStorage(pages);
  } catch {
    console.error('Failed to delete page from localStorage');
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
