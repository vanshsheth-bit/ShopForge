import { GeneratedPage } from '@/types';

// Legacy encoder kept for backward compatibility decoding on the share page.
export function encodeShareData(page: GeneratedPage): string {
  try {
    const json = JSON.stringify({
      id: page.id,
      title: page.title,
      pageType: page.pageType,
      description: page.description,
      html: page.html,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      versions: [],
    });
    return encodeURIComponent(btoa(json));
  } catch {
    return '';
  }
}

function generateShareId(): string {
  // Short, URL-safe id (~8 chars). We avoid adding a new dependency just for nanoid.
  return Math.random().toString(36).slice(2, 10);
}

export function generateShareUrl(page: GeneratedPage): string {
  if (typeof window === 'undefined') return '';

  const id = generateShareId();
  const key = `shopforge_share_${id}`;

  const payload = {
    id: page.id,
    title: page.title,
    pageType: page.pageType,
    description: page.description,
    html: page.html,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    versions: [],
  } as GeneratedPage;

  // Primary: sessionStorage (tab-scoped), with localStorage as a longer-lived backup.
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(payload));
    }
  } catch {
    // Ignore sessionStorage errors; we'll still try localStorage.
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(payload));
    }
  } catch {
    // If localStorage quota is hit we still allow the link to be copied; it
    // will simply not resolve later and the share page will show a warning.
  }

  const base = window.location.origin;
  return `${base}/share/${id}`;
}

export async function copyShareLink(page: GeneratedPage): Promise<boolean> {
  const url = generateShareUrl(page);
  if (!url) return false;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
