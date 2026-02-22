'use client';

import { useState } from 'react';
import { PageType } from '@/types';
import clsx from 'clsx';

export interface SectionTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  prompt: string; // We now use AI to blend, not raw code injection
}

const LANDING_SECTIONS: SectionTemplate[] = [
  {
    id: 'hero-centered',
    label: 'Hero — Centered',
    description: 'Full-height centered hero with gradient headline',
    icon: 'web_asset',
    category: 'Hero',
    prompt:
      'Replace the existing top hero section with a stunning full-height centered hero. Keep only ONE hero on the page. Use a large gradient headline, compelling subheadline, and two CTA buttons (primary + outline). Match the existing brand colors, spacing, and typography exactly.',
  },
  {
    id: 'hero-split',
    label: 'Hero — Split',
    description: 'Two-column hero with image on right',
    icon: 'view_column',
    category: 'Hero',
    prompt:
      'Replace the existing top hero section with a two-column split hero (text on the left, large product/brand image on the right). There must still be only ONE hero on the page. Match the current color palette, typography scale, and spacing.',
  },
  {
    id: 'features-grid',
    label: 'Features — Grid',
    description: '3-column feature cards with icons',
    icon: 'grid_view',
    category: 'Features',
    prompt:
      'Replace ANY existing features section with a new features section laid out as a 3-COLUMN GRID (not stacked rows). There must be only ONE features section on the page after this change. Use 3 feature cards side-by-side on desktop, each with an emoji icon, bold title, and description. Include a section label and heading. Match existing card styles, shadows, borders, and hover effects. The features array MUST have EXACTLY 3 objects each with non-empty "icon" (emoji), "title", and "description". Do NOT return features: [] or features: null.',
  },
  {
    id: 'features-list',
    label: 'Features — List',
    description: 'Alternating feature rows with images',
    icon: 'view_agenda',
    category: 'Features',
    prompt:
      'Replace ANY existing features section with a new features section as a VERTICAL LIST of 3 rows. There must be only ONE features section on the page after this change. Each row alternates text on one side and an image on the other (left/right/left). Do NOT use a grid; this should look different from the 3-column grid. Match existing colors, spacing, and typography. The features array MUST have EXACTLY 3 objects each with non-empty "icon", "title", and "description". Do NOT return features: [] or features: null.',
  },
  {
    id: 'pricing-3col',
    label: 'Pricing — 3 Tiers',
    description: 'Three pricing cards with highlighted middle',
    icon: 'payments',
    category: 'Pricing',
    prompt:
      'Replace ANY existing pricing section with a PRICING section that has 3 tier cards (Starter, Pro, Enterprise). There must be only ONE pricing section on the page after this change. Middle card is highlighted with gradient background and a Most Popular badge. Each tier has feature list and CTA button. Match existing brand colors and overall layout. The tiers array MUST have EXACTLY 3 objects each with "name", "price", "period", non-empty "features" array (min 4 items), "ctaLabel", and "highlighted" boolean. Do NOT return tiers: [] or tiers: null.',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    description: '3 customer review cards',
    icon: 'format_quote',
    category: 'Social Proof',
    prompt:
      'Replace ANY existing testimonials section with a new testimonials section that still keeps EXACTLY ONE testimonials section on the page. Use 3 testimonial cards, each with 5 star rating in amber, italic quote, customer avatar from picsum.photos, customer name, and role. Match the existing testimonials layout, spacing, and colors so it feels like an upgrade, not a brand new style. The testimonials array MUST have EXACTLY 3 objects each with "quote", "name", "role", and "avatar" (picsum URL). Do NOT return testimonials: [] or testimonials: null.',
  },
  {
    id: 'stats',
    label: 'Stats / Numbers',
    description: '4 key metrics in a row',
    icon: 'bar_chart',
    category: 'Social Proof',
    prompt:
      'Add a stats / metrics section in a logical position before the footer. Show 4 impressive metrics (e.g. customers, uptime, rating, support) with large bold numbers and labels. Match the current brand colors and typography. Do NOT change or remove the existing core sections (hero, features, pricing, testimonials, CTA banner, footer). The items array MUST have EXACTLY 4 objects, each with non-empty "label" string and "value" string (e.g. "10k+"). Do NOT return items: [] or items: null.',
  },
  {
    id: 'cta-banner',
    label: 'CTA Banner',
    description: 'Full-width gradient call to action',
    icon: 'campaign',
    category: 'CTA',
    prompt:
      'Replace ANY existing final CTA banner so that there is exactly ONE CTA banner near the end of the page. It should be a full-width section with gradient background matching brand colors, bold headline, subtext, and a large button. Preserve the rest of the page structure. "headline", "subtext", and "ctaLabel" MUST all be non-empty strings matching the brand.',
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    description: 'Email capture with input',
    icon: 'email',
    category: 'CTA',
    prompt:
      'Add a newsletter signup section with heading, subtext, email input field, and subscribe button. Match existing brand style. "heading", "subtext", "placeholder", and "buttonLabel" MUST all be non-empty strings.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions',
    icon: 'help',
    category: 'Content',
    prompt:
      'Add an FAQ section with 5 relevant questions and answers for this brand. Use an accordion-style layout with border separators. Match existing colors. The items array MUST have EXACTLY 5 objects, each with non-empty "question" string and "answer" string (2-3 sentences). Do NOT return items: [] or items: null under any circumstance.',
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Team member cards',
    icon: 'group',
    category: 'Content',
    prompt:
      'Add a team section with 3 team member cards. Each has a photo avatar, name, role, and short bio. Match existing design style. The members array MUST have EXACTLY 3 objects, each with non-empty "name", "role", "bio" (1-2 sentences), and "avatar" (loremflickr URL). Do NOT return members: [] or members: null.',
  },
  {
    id: 'logo-bar',
    label: 'Logo Bar',
    description: 'Trusted by / partner logos',
    icon: 'business',
    category: 'Social Proof',
    prompt:
      'Add a "Trusted by" logo bar section with 5 placeholder company names in a horizontal row. Subtle styling, muted colors. The logos array MUST have EXACTLY 5 non-empty company name strings. Do NOT return logos: [] or logos: null.',
  },
];

const PRODUCT_SECTIONS: SectionTemplate[] = [
  {
    id: 'product-hero',
    label: 'Product Display',
    description: 'Two-column product with images',
    icon: 'shopping_bag',
    category: 'Product',
    prompt:
      'Replace the existing main product section (product.productSection) with a refined two-column product layout: large image gallery on the left and product details on the right (title, rating, price, description, size/color selectors, main buy button, trust badges). Keep ONLY ONE main product section on the page and preserve the nav and footer.',
  },
  {
    id: 'product-reviews',
    label: 'Product Reviews',
    description: 'Customer review cards',
    icon: 'star',
    category: 'Product',
    prompt:
      'Add or replace the REVIEWS section for this product by updating product.reviews. Include an overall summary (average rating and review count) and 3 detailed reviews with avatar, name, rating, short title, and review text. Match the existing product page style. The reviews array MUST have EXACTLY 3 objects each with "name", "avatar" (loremflickr URL), "rating" (4 or 5), "title", and "text" (2-3 sentences). Do NOT return reviews: [] or reviews: null.',
  },
  {
    id: 'related-products',
    label: 'Related Products',
    description: '4 product recommendation cards',
    icon: 'grid_view',
    category: 'Product',
    prompt:
      'Add or replace the RELATED PRODUCTS section by updating product.relatedProducts. Show up to 4 cards with image, title, and price that feel like realistic complementary products. Match the existing product page styling. The items array MUST have EXACTLY 4 objects each with "title", "image" (loremflickr URL), and "price". Do NOT return items: [] or items: null.',
  },
];

const CATEGORIES = ['All', 'Hero', 'Features', 'Pricing', 'Social Proof', 'CTA', 'Content', 'Product'];

interface ComponentLibraryProps {
  pageType: PageType;
  isLoading: boolean;
  onAddSection: (section: SectionTemplate) => void;
  onClose: () => void;
}

export default function ComponentLibrary({
  pageType,
  isLoading,
  onAddSection,
  onClose,
}: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const allSections = pageType === 'product' ? PRODUCT_SECTIONS : LANDING_SECTIONS;

  const filtered = allSections.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = !search ||
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = async (section: SectionTemplate) => {
    if (adding || isLoading) return;
    setAdding(section.id);
    await onAddSection(section);
    setAdding(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] border-l border-zinc-800 w-80 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div>
          <p className="text-sm font-black text-white">Components</p>
          <p className="text-[10px] text-zinc-500">Click or drag to add sections</p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-zinc-800 shrink-0">
        <input
          type="text"
          placeholder="Search sections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full input-field rounded-lg px-3 py-2 text-xs"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-zinc-800 shrink-0 [scrollbar-width:none]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all',
              activeCategory === cat
                ? 'bg-[#3b2bee] text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 [scrollbar-width:thin]">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-xs">No sections found</div>
        )}
        {filtered.map((section) => (
          <div key={section.id} className="space-y-1">
            <div
              draggable
              onDragStart={(e) => {
                setDraggedId(section.id);
                e.dataTransfer.setData('sectionId', section.id);
                e.dataTransfer.setData('sectionPrompt', section.prompt);
                e.dataTransfer.setData('sectionLabel', section.label);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => setDraggedId(null)}
              className={clsx(
                'group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing',
                draggedId === section.id
                  ? 'border-[#3b2bee]/60 bg-[#3b2bee]/10 opacity-50'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50'
              )}
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[#3b2bee]/20 transition-colors">
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#3b2bee]" style={{ fontSize: '18px' }}>
                  {section.icon}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{section.label}</p>
                <p className="text-[10px] text-zinc-500 truncate leading-relaxed">{section.description}</p>
              </div>

              {/* Add button */}
              <button
                onClick={() => handleAdd(section)}
                disabled={!!adding || isLoading}
                className={clsx(
                  'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                  adding === section.id
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-[#3b2bee] hover:text-white opacity-0 group-hover:opacity-100'
                )}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                  {adding === section.id ? 'check' : 'add'}
                </span>
              </button>
            </div>
            {adding === section.id && (
              <p className="text-[10px] text-[#3b2bee] text-center mt-1 animate-pulse">
                AI is blending section...
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
        <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
          AI blends sections to match your current design
        </p>
      </div>
    </div>
  );
}