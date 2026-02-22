import {
  GeneratedCode,
  GeneratedPageData,
  LandingPageData,
  ProductPageData,
  TemplatePreset,
} from '@/types';

function s(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;')
    .replace(/\$\{/g, '&#36;{');
}

// Helper to safely access landing/product data based on pageType
function getLandingData(data: GeneratedPageData): LandingPageData {
  if (!data.landing) {
    throw new Error('Missing landing data in GeneratedPageData');
  }
  return data.landing;
}

function getProductData(data: GeneratedPageData): ProductPageData {
  if (!data.product) {
    throw new Error('Missing product data in GeneratedPageData');
  }
  return data.product;
}

// Build a React componentCode string that composes the shell components.
// Note: for the sandboxed iframe preview we still need a self-contained
// function App() with no imports, so we inline a minimal version of the
// shell layout directly in JSX here. For exported code, the frontend will
// rewrite this into an App.jsx that imports from src/shells.
export function buildComponentFromPageData(
  page: GeneratedPageData,
  preset: TemplatePreset = 'bold'
): GeneratedCode {
  const title = page.title;

  const theme = {
    minimalist: {
      pageBg: 'bg-white',
      pageText: 'text-gray-900',
      navBg: 'bg-white/90',
      navBorder: 'border-gray-200',
      navText: 'text-gray-700',
      navHover: 'hover:text-gray-900',
      heroBg: 'bg-white',
      heroHeadline: 'text-gray-900',
      heroSub: 'text-gray-500',
      primaryBtn:
        'border border-gray-900 text-gray-900 bg-transparent hover:bg-gray-900 hover:text-white',
      secondaryBtn: 'border border-gray-300 text-gray-600 bg-transparent',
      sectionLabel: 'text-gray-400',
      sectionHeading: 'text-gray-900',
      cardBg: 'bg-white border border-gray-100',
      cardText: 'text-gray-600',
      pricingHighlight: 'bg-gray-900 text-white',
      pricingNormal: 'bg-white border border-gray-200',
      testimonialCard: 'bg-gray-50 border border-gray-100',
      ctaBg: 'bg-gray-900',
      ctaText: 'text-white',
      footerBg: 'bg-white border-t border-gray-200',
      footerText: 'text-gray-500',
      starColor: 'text-gray-900',
    },
    bold: {
      pageBg: 'bg-zinc-950',
      pageText: 'text-white',
      navBg: 'bg-black/60',
      navBorder: 'border-white/10',
      navText: 'text-zinc-300',
      navHover: 'hover:text-white',
      heroBg: 'bg-zinc-950',
      heroHeadline: 'text-white',
      heroSub: 'text-zinc-400',
      primaryBtn: 'text-black font-black',
      secondaryBtn: 'border border-white/20 text-zinc-100',
      sectionLabel: 'text-zinc-500',
      sectionHeading: 'text-white',
      cardBg: 'bg-white/5 border border-white/10',
      cardText: 'text-zinc-300',
      pricingHighlight:
        'bg-gradient-to-b from-white/10 to-white/5 border border-white/20',
      pricingNormal: 'bg-white/5 border border-white/10',
      testimonialCard: 'bg-white/5 border border-white/10',
      ctaBg:
        'bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/10',
      ctaText: 'text-white',
      footerBg: 'border-t border-white/10',
      footerText: 'text-zinc-500',
      starColor: 'text-amber-400',
    },
    luxury: {
      pageBg: 'bg-black',
      pageText: 'text-amber-50',
      navBg: 'bg-black/80',
      navBorder: 'border-amber-300/10',
      navText: 'text-amber-100/70',
      navHover: 'hover:text-amber-200',
      heroBg: 'bg-black',
      heroHeadline: 'text-amber-50',
      heroSub: 'text-amber-100/60',
      primaryBtn: 'bg-amber-300 text-black font-black tracking-wide',
      secondaryBtn: 'border border-amber-300/30 text-amber-200',
      sectionLabel: 'text-amber-400/60',
      sectionHeading: 'text-amber-50',
      cardBg: 'bg-zinc-950 border border-amber-300/10',
      cardText: 'text-amber-100/70',
      pricingHighlight:
        'bg-gradient-to-b from-amber-300/10 to-transparent border border-amber-300/30',
      pricingNormal: 'bg-zinc-950 border border-amber-300/10',
      testimonialCard: 'bg-zinc-950 border border-amber-300/10',
      ctaBg:
        'bg-gradient-to-r from-amber-300/5 via-amber-300/10 to-amber-300/5 border border-amber-300/20',
      ctaText: 'text-amber-50',
      footerBg: 'border-t border-amber-300/10',
      footerText: 'text-amber-100/40',
      starColor: 'text-amber-300',
    },
    playful: {
      pageBg: 'bg-white',
      pageText: 'text-gray-900',
      navBg: 'bg-white/90',
      navBorder: 'border-purple-100',
      navText: 'text-gray-600',
      navHover: 'hover:text-purple-600',
      heroBg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      heroHeadline: 'text-gray-900',
      heroSub: 'text-gray-500',
      primaryBtn: 'rounded-full font-black shadow-lg',
      secondaryBtn:
        'rounded-full border-2 border-purple-200 text-purple-600',
      sectionLabel: 'text-purple-400',
      sectionHeading: 'text-gray-900',
      cardBg: 'bg-white border-2 border-purple-100 rounded-3xl',
      cardText: 'text-gray-600',
      pricingHighlight:
        'bg-gradient-to-b from-purple-500 to-pink-500 text-white rounded-3xl',
      pricingNormal:
        'bg-white border-2 border-purple-100 rounded-3xl',
      testimonialCard:
        'bg-purple-50 border-2 border-purple-100 rounded-3xl',
      ctaBg:
        'bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl',
      ctaText: 'text-white',
      footerBg: 'bg-gray-50 border-t border-purple-100',
      footerText: 'text-gray-400',
      starColor: 'text-yellow-400',
    },
  }[preset] ?? {
    // fallback to bold
    pageBg: 'bg-zinc-950',
    pageText: 'text-white',
    navBg: 'bg-black/60',
    navBorder: 'border-white/10',
    navText: 'text-zinc-300',
    navHover: 'hover:text-white',
    heroBg: 'bg-zinc-950',
    heroHeadline: 'text-white',
    heroSub: 'text-zinc-400',
    primaryBtn: 'text-black font-black',
    secondaryBtn: 'border border-white/20 text-zinc-100',
    sectionLabel: 'text-zinc-500',
    sectionHeading: 'text-white',
    cardBg: 'bg-white/5 border border-white/10',
    cardText: 'text-zinc-300',
    pricingHighlight: 'bg-white/10 border border-white/20',
    pricingNormal: 'bg-white/5 border border-white/10',
    testimonialCard: 'bg-white/5 border border-white/10',
    ctaBg: 'bg-white/5 border border-white/10',
    ctaText: 'text-white',
    footerBg: 'border-t border-white/10',
    footerText: 'text-zinc-500',
    starColor: 'text-amber-400',
  };

  let bodyJsx = '';

  if (page.pageType === 'landing') {
    const d = getLandingData(page);
    bodyJsx = `
      <div className="${theme.pageBg} ${theme.pageText} min-h-screen">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b ${theme.navBorder} ${theme.navBg}">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <span className="text-xl font-black">${s(d.nav.logo)}</span>
            <div className="hidden md:flex items-center gap-8">
              ${(d.nav.links ?? [])
                .map(
                  (l) => `
              <a href="${l.href ?? '#'}" className="text-sm font-medium ${theme.navText} ${theme.navHover} transition-colors">
                ${s(l.label)}
              </a>`
                )
                .join('')}
            </div>
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold ${theme.primaryBtn}" style={{ backgroundColor: '${d.nav.accentColor ?? '#ffffff'}' }}>
              ${s(d.nav.ctaLabel)}
            </button>
          </div>
        </nav>

        <main className="pt-20">
          <section id="hero" className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${theme.heroBg}">
            <div className="max-w-5xl mx-auto">
              <p className="text-xs font-bold tracking-[0.3em] mb-4 ${theme.sectionLabel}">HERO</p>
              <h1 className="text-5xl md:text-7xl font-black mb-6 ${theme.heroHeadline}">${s(d.hero.headline)}</h1>
              <p className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto ${theme.heroSub}">${s(d.hero.subheadline)}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 rounded-xl font-bold text-sm ${theme.primaryBtn}" style={{ backgroundColor: '${d.nav.accentColor ?? '#ffffff'}' }}>
                  ${s(d.hero.primaryCta)}
                </button>
                <button className="px-8 py-3 rounded-xl font-bold text-sm ${theme.secondaryBtn}">
                  ${s(d.hero.secondaryCta)}
                </button>
              </div>
            </div>
          </section>

          ${(d.team?.members?.length ?? 0) > 0
            ? `<section id="team" className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">TEAM</p>
                <h2 className="text-3xl md:text-4xl font-black ${theme.sectionHeading}">${s(d.team!.heading)}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${(d.team!.members ?? [])
                  .map(
                    (m) => `
                <div className="rounded-2xl p-6 ${theme.cardBg}">
                  <img src="${m.avatar}" alt="${s(m.name)}" className="w-16 h-16 rounded-full object-cover mb-4" />
                  <p className="text-sm font-bold mb-1">${s(m.name)}</p>
                  <p className="text-xs mb-3 ${theme.sectionLabel}">${s(m.role)}</p>
                  <p className="text-sm leading-relaxed ${theme.cardText}">${s(m.bio)}</p>
                </div>`
                  )
                  .join('')}
              </div>
            </div>
          </section>`
            : ''}

          ${(d.logoBar?.logos?.length ?? 0) > 0
            ? `<section id="logos" className="py-16 px-4 border-y ${theme.footerBg}">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] ${theme.sectionLabel}">${s(d.logoBar!.heading)}</p>
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                ${(d.logoBar!.logos ?? [])
                  .map(
                    (name) => `
                <span className="text-sm md:text-base font-semibold ${theme.cardText}">${
                  typeof name === 'string' ? s(name) : s(JSON.stringify(name))
                }</span>`
                  )
                  .join('')}
              </div>
            </div>
          </section>`
            : ''}

          ${(d.faq?.items?.length ?? 0) > 0
            ? `<section id="faq" className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-black ${theme.sectionHeading}">${s(d.faq!.heading)}</h2>
              </div>
              <div className="space-y-4">
                ${d.faq!.items
                  .map(
                    (item) => `
                <div className="rounded-2xl p-5 ${theme.testimonialCard}">
                  <p className="text-sm font-semibold mb-2 ${theme.sectionHeading}">${
                    typeof item.question === 'string'
                      ? s(item.question)
                      : s(JSON.stringify(item.question))
                  }</p>
                  <p className="text-sm leading-relaxed ${theme.cardText}">${
                    typeof item.answer === 'string'
                      ? s(item.answer)
                      : s(JSON.stringify(item.answer))
                  }</p>
                </div>`
                  )
                  .join('')}
              </div>
            </div>
          </section>`
            : ''}

          <section id="features" className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">${s(d.features.sectionLabel)}</p>
                <h2 className="text-3xl md:text-4xl font-black ${theme.sectionHeading}">${s(d.features.heading)}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${(d.features.features ?? [])
                  .map(
                    (f) => `
                <div className="rounded-2xl p-8 hover:-translate-y-2 transition-transform ${theme.cardBg}">
                  <span className="text-4xl mb-4 block">${s(f.icon)}</span>
                  <h3 className="text-xl font-bold mb-3">${s(f.title)}</h3>
                  <p className="text-sm leading-relaxed ${theme.cardText}">${s(f.description)}</p>
                </div>`
                  )
                  .join('')}
              </div>
            </div>
          </section>

          ${(d.stats?.items?.length ?? 0) > 0
            ? `<section id="stats" className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">STATS</p>
                <h2 className="text-3xl md:text-4xl font-black ${theme.sectionHeading}">${s(d.stats!.heading)}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                ${d.stats!.items
                  .map(
                    (stat) => `
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-black mb-1 ${theme.sectionHeading}">${
                    typeof stat.value === 'string' ? s(stat.value) : s(JSON.stringify(stat.value))
                  }</p>
                  <p className="text-xs uppercase tracking-[0.25em] ${theme.sectionLabel}">${
                    typeof stat.label === 'string' ? s(stat.label) : s(JSON.stringify(stat.label))
                  }</p>
                </div>`
                  )
                  .join('')}
              </div>
            </div>
          </section>`
            : ''}

          ${d.newsletter?.heading?.trim()
            ? `<section id="newsletter" className="py-24 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">NEWSLETTER</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3 ${theme.sectionHeading}">${s(d.newsletter?.heading ?? '')}</h2>
              <p className="text-sm md:text-base mb-6 ${theme.cardText}">${s(d.newsletter?.subtext ?? '')}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  placeholder="${s(d.newsletter?.placeholder ?? '')}"
                  className="w-full sm:w-80 px-4 py-3 rounded-xl bg-black/40 border text-sm outline-none focus:border-white/40 ${theme.footerBg} ${theme.pageText}"
                />
                <button className="px-6 py-3 rounded-xl font-bold text-sm ${theme.primaryBtn}" style={{ backgroundColor: '${d.nav.accentColor ?? '#ffffff'}' }}>
                  ${s(d.newsletter?.buttonLabel ?? '')}
                </button>
              </div>
            </div>
          </section>`
            : ''}

          <section id="pricing" className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">${s(d.pricing.sectionLabel)}</p>
                <h2 className="text-3xl md:text-4xl font-black ${theme.sectionHeading}">${s(d.pricing.heading)}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                ${(d.pricing.tiers ?? [])
                  .map(
                    (t) => `
                <div className="rounded-2xl p-8 ${
                  t.highlighted ? theme.pricingHighlight : theme.pricingNormal
                } ${t.highlighted ? 'scale-105 shadow-lg shadow-black/40' : ''}">
                  ${
                    t.highlighted
                      ? '<span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] bg-amber-500/10 text-amber-300 border border-amber-400/40 mb-4">MOST POPULAR</span>'
                      : ''
                  }
                  <h3 className="text-2xl font-black mb-2 ${theme.sectionHeading}">${s(t.name)}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black ${theme.sectionHeading}">${s(t.price)}</span>
                    <span className="text-sm ${theme.sectionLabel}">/${s(t.period)}</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm ${theme.cardText}">
                    ${(t.features ?? [])
                      .map(
                        (f) =>
                          `<li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>${s(f)}</li>`
                      )
                      .join('')}
                  </ul>
                  <button className="w-full py-3 rounded-xl font-bold text-sm ${theme.primaryBtn}" style={{ backgroundColor: '${
                    t.highlighted ? d.nav.accentColor ?? '#ffffff' : 'transparent'
                  }', borderColor: '${d.nav.accentColor ?? '#ffffff'}', borderWidth: 1 }}>
                    ${s(t.ctaLabel)}
                  </button>
                </div>`
                  )
                  .join('')}
              </div>
            </div>
          </section>

          <section id="testimonials" className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">${s(d.testimonials.sectionLabel)}</p>
                <h2 className="text-3xl md:text-4xl font-black ${theme.sectionHeading}">${s(d.testimonials.heading)}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${(d.testimonials.testimonials ?? [])
                  .map(
                    (t) => `
                <div className="rounded-2xl p-8 ${theme.testimonialCard}">
                  <div className="text-lg mb-4 ${theme.starColor}">★★★★★</div>
                  <p className="italic text-sm mb-6 leading-relaxed ${theme.cardText}">"${s(t.quote)}"</p>
                  <div className="flex items-center gap-3">
                    <img src="${t.avatar ?? ''}" alt="${s(t.name)}" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold ${theme.sectionHeading}">${s(t.name)}</p>
                      <p className="text-xs ${theme.sectionLabel}">${s(t.role)}</p>
                    </div>
                  </div>
                </div>`
                  )
                  .join('')}
              </div>
            </div>
          </section>

          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto text-center rounded-3xl px-8 py-16 ${theme.ctaBg}">
              <h2 className="text-3xl md:text-4xl font-black mb-4 ${theme.ctaText}">${s(d.ctaBanner.headline)}</h2>
              <p className="text-sm md:text-base mb-8 max-w-2xl mx-auto ${theme.cardText}">${s(d.ctaBanner.subtext)}</p>
              <button className="px-8 py-3 rounded-xl font-bold text-sm ${theme.primaryBtn}" style={{ backgroundColor: '${d.nav.accentColor ?? '#ffffff'}' }}>
                ${s(d.ctaBanner.ctaLabel)}
              </button>
            </div>
          </section>
        </main>

        <footer className="py-16 px-4 mt-16 ${theme.footerBg}">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <span className="text-xl font-black mb-4 block">${s(d.footer.logo)}</span>
              </div>
              ${(d.footer.columns ?? [])
                .map(
                  (col) => `
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4 ${theme.sectionLabel}">${s(col.heading)}</p>
                <ul className="space-y-2 text-sm ${theme.footerText}">
                  ${(col.links ?? [])
                    .map(
                      (l) =>
                        `<li><a href="${l.href ?? '#'}" className="hover:text-white transition-colors">${s(l.label)}</a></li>`
                    )
                    .join('')}
                </ul>
              </div>`
                )
                .join('')}
            </div>
            <div className="pt-6">
              <p className="text-xs ${theme.footerText}">${s(d.footer.copyright)}</p>
            </div>
          </div>
        </footer>
      </div>
    `;
  } else {
    const d = getProductData(page);
    bodyJsx = `
      <div className="min-h-screen bg-black text-white">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10 bg-black/60">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <span className="text-xl font-black">${s(d.nav.logo)}</span>
            <div className="hidden md:flex items-center gap-8">
              ${(d.nav.links ?? [])
                .map(
                  (l) => `
              <a href="${l.href}" className="text-sm font-medium ${theme.navText} ${theme.navHover} transition-colors">
                ${s(l.label)}
              </a>`
                )
                .join('')}
            </div>
            <button className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${theme.primaryBtn}" style={{ backgroundColor: '${d.nav.accentColor}' }}>
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              Cart
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-black text-[10px] flex items-center justify-center">2</span>
            </button>
          </div>
        </nav>
        <main className="pt-24 pb-16 px-4">
          <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <img src="${(d.productSection.images && d.productSection.images[0]) ||
                'https://loremflickr.com/1200/1200/product,lifestyle'}" alt="${s(d.productSection.title)}" className="w-full rounded-2xl object-cover aspect-square mb-4" />
              <div className="grid grid-cols-3 gap-3">
                ${(d.productSection.images ?? [])
                  .slice(1, 4)
                  .map(
                    (img) => `
                  <img src="${img}" alt="" className="w-full rounded-xl object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity" />`
                  )
                  .join('')}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.3em] mb-2 ${theme.sectionLabel}">Home / Products</p>
              <h1 className="text-3xl md:text-4xl font-black mb-4 ${theme.sectionHeading}">${s(d.productSection.title)}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="${theme.starColor}">★★★★★</span>
                <span className="text-sm ${theme.sectionLabel}">(128 reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-black ${theme.sectionHeading}">${s(d.productSection.price)}</span>
                <span className="text-lg line-through ${theme.sectionLabel}">${s(d.productSection.originalPrice)}</span>
              </div>
              <p className="text-sm mb-8 leading-relaxed ${theme.cardText}">${s(d.productSection.description)}</p>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">Color</p>
                <div className="flex gap-2">
                  ${(d.productSection.colors ?? [])
                    .map(
                      (c) =>
                        `<div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: '${c}' }}></div>`
                    )
                    .join('')}
                </div>
              </div>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3 ${theme.sectionLabel}">Size</p>
                <div className="flex gap-2">
                  ${(d.productSection.sizes ?? [])
                    .map(
                      (s) =>
                        `<button className="px-4 py-2 rounded-lg text-sm font-bold ${theme.secondaryBtn}">${s}</button>`
                    )
                    .join('')}
                </div>
              </div>
              <button className="w-full py-4 rounded-xl font-black text-sm ${theme.primaryBtn}" style={{ backgroundColor: '${d.nav.accentColor}' }}>
                ${s(d.productSection.ctaLabel ?? 'Add to cart')}
              </button>
              <div className="flex gap-6 text-xs mt-4 ${theme.sectionLabel}">
                <span>✓ Free shipping</span>
                <span>✓ Free returns</span>
                <span>✓ 2 year warranty</span>
              </div>
            </div>
          </section>
          ${(d.reviews?.reviews?.length ?? 0) > 0
            ? `<section id="reviews" className="max-w-6xl mx-auto mt-16 px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black mb-1 ${theme.sectionHeading}">${s(d.reviews!.heading)}</h2>
              <p className="text-sm ${theme.cardText}">${s(d.reviews!.summaryText)}</p>
            </div>
            <div className="flex items-center gap-2 text-sm ${theme.cardText}">
              <span className="${theme.starColor}">★★★★★</span>
              <span>${d.reviews!.averageRating.toFixed(1)} · ${d.reviews!.reviewCount} reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${d.reviews!.reviews
              .slice(0, 3)
              .map(
                (r) => `
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="${r.avatar}" alt="${s(r.name)}" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold ${theme.sectionHeading}">${s(r.name)}</p>
                  <p className="text-xs ${theme.starColor}">${'★'.repeat(r.rating)}${'☆'.repeat(
                  5 - r.rating
                )}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-2 ${theme.sectionHeading}">${s(r.title)}</h3>
              <p className="text-sm leading-relaxed ${theme.cardText}">${s(r.text)}</p>
            </div>`
              )
              .join('')}
          </div>
        </section>`
            : ''}
          ${(d.relatedProducts?.items?.length ?? 0) > 0
            ? `<section id="related" className="max-w-6xl mx-auto mt-20 px-4 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black ${theme.sectionHeading}">${s(d.relatedProducts!.heading)}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            ${d.relatedProducts!.items
              .slice(0, 4)
              .map(
                (p) => `
            <div className="rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 transition-all ${theme.cardBg}">
              <img src="${p.image}" alt="${p.title}" className="w-full aspect-square object-cover" />
              <div className="p-4 flex flex-col gap-2">
                <p className="text-sm font-semibold truncate ${theme.sectionHeading}">${s(p.title)}</p>
                <p className="text-sm ${theme.cardText}">${s(p.price)}</p>
                <button className="mt-2 w-full py-2 rounded-lg text-xs font-bold ${theme.secondaryBtn}">
                  View product
                </button>
              </div>
            </div>`
              )
              .join('')}
          </div>
        </section>`
            : ''}

        </main>
      </div>
    `;
  }

  const componentCode = `function App() {
    return (
      ${bodyJsx}
    );
  }
  `;

  return {
    title,
    componentCode,
    cssCode:
      "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); body { font-family: 'Inter', sans-serif; margin: 0; background-color: #09090b; color: #e5e7eb; }",
  };
}

export function buildHtmlFromGeneratedCode(code: GeneratedCode): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${code.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; padding: 0; overflow-x: hidden; }
    ${code.cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.23.4/babel.min.js"></script>
  <script type="text/babel" data-presets="react">
    ${code.componentCode}
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
}
