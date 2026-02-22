import { NextRequest, NextResponse } from 'next/server';
import { getProvider, getAnthropicClient, getOpenAIClient, getGeminiClient, getGroqClient } from '@/lib/claude';
import { GeneratedPageData, LandingPageData, PageType, ProductPageData, TemplatePreset } from '@/types';
import { buildComponentFromPageData, buildHtmlFromGeneratedCode } from '@/lib/pageBuilder';

interface InsertRequest {
  currentPageData: GeneratedPageData;
  sectionPrompt: string;
  sectionLabel: string;
  pageType: PageType;
  preset?: TemplatePreset;
}

async function callAI(systemPrompt: string, userMessage: string, provider: string): Promise<string> {
  if (provider === 'openai') {
    const client = getOpenAIClient();
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 8192,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
  }

  if (provider === 'gemini') {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });
    const chat = model.startChat({
      generationConfig: { maxOutputTokens: 8192, temperature: 0.5 },
    });
    const result = await chat.sendMessage(userMessage);
    return result.response.text().trim();
  }

  if (provider === 'groq') {
    const client = getGroqClient();
    const res = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 8192,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content:
            systemPrompt +
            '\n\nCRITICAL: Return ONLY raw JSON starting with { and ending with }. No markdown.',
        },
        { role: 'user', content: userMessage },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
  }

  const client = getAnthropicClient();
  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  const content = res.content[0];
  if (content.type !== 'text') throw new Error('Bad response');
  return content.text.trim();
}

function parseUpdatedPageData(raw: string): GeneratedPageData {
  let text = raw.trim();

  // Strip common markdown fences
  text = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1) {
    throw new Error('AI did not return valid JSON');
  }

  text = text.slice(first, last + 1);

  const parsed = JSON.parse(text);
  if (!parsed.pageType || !parsed.title) {
    throw new Error('Missing required fields in JSON response');
  }
  return parsed as GeneratedPageData;
}

// Returns true if a section object has meaningful content (non-empty arrays where expected)
function hasContent(obj: any, arrayKeys: string[]): boolean {
  if (!obj) return false;
  return arrayKeys.every((key) => Array.isArray(obj[key]) && obj[key].length > 0);
}

function mergeLandingData(original: GeneratedPageData, updated: GeneratedPageData): GeneratedPageData {
  if (!original.landing) return updated;
  const orig = original.landing;
  const next: Partial<LandingPageData> = updated.landing ?? {};

  return {
    pageType: original.pageType,
    title: updated.title ?? original.title,
    landing: {
      // Nav: use next only if it has links
      nav: next.nav && next.nav.links?.length > 0 ? next.nav : orig.nav,

      // Hero: use next only if it has a non-empty headline
      hero: next.hero && next.hero.headline?.trim() ? next.hero : orig.hero,

      // Features: use next only if features array is populated
      features: hasContent(next.features, ['features']) ? next.features! : orig.features,

      // Pricing: use next only if tiers array is populated
      pricing: hasContent(next.pricing, ['tiers']) ? next.pricing! : orig.pricing,

      // Testimonials: use next only if testimonials array is populated
      testimonials: hasContent(next.testimonials, ['testimonials']) ? next.testimonials! : orig.testimonials,

      // FAQ: use next only if items array is populated
      faq: hasContent(next.faq, ['items']) ? next.faq : orig.faq,

      // Stats: use next only if items array is populated
      stats: hasContent(next.stats, ['items']) ? next.stats : orig.stats,

      // Newsletter: use next only if heading is non-empty
      newsletter: next.newsletter && next.newsletter.heading?.trim() ? next.newsletter : orig.newsletter,

      // Team: use next only if members array is populated
      team: hasContent(next.team, ['members']) ? next.team : orig.team,

      // LogoBar: use next only if logos array is populated
      logoBar: hasContent(next.logoBar, ['logos']) ? next.logoBar : orig.logoBar,

      // CTABanner: use next only if headline is non-empty
      ctaBanner: next.ctaBanner && next.ctaBanner.headline?.trim() ? next.ctaBanner! : orig.ctaBanner,

      // Footer: use next only if columns array is populated
      footer: hasContent(next.footer, ['columns']) ? next.footer! : orig.footer,
    },
  };
}

function mergeProductData(original: GeneratedPageData, updated: GeneratedPageData): GeneratedPageData {
  if (!original.product) return updated;
  const orig = original.product;
  const next: Partial<ProductPageData> = updated.product ?? {};

  return {
    pageType: original.pageType,
    title: updated.title ?? original.title,
    product: {
      // Nav: use next only if links populated
      nav: next.nav && next.nav.links?.length > 0 ? next.nav : orig.nav,

      // ProductSection: use next only if title and images are non-empty
      productSection:
        next.productSection && next.productSection.title?.trim() && next.productSection.images?.length > 0
          ? next.productSection
          : orig.productSection,

      // Reviews: use next only if reviews array is populated
      reviews: hasContent(next.reviews, ['reviews']) ? next.reviews : orig.reviews,

      // RelatedProducts: use next only if items array is populated
      relatedProducts: hasContent(next.relatedProducts, ['items']) ? next.relatedProducts : orig.relatedProducts,

      // Footer: use next only if columns populated
      footer: hasContent(next.footer, ['columns']) ? next.footer : orig.footer,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: InsertRequest = await req.json();
    const { currentPageData, sectionPrompt, sectionLabel, pageType, preset } = body;

    const provider = getProvider();

    const systemPrompt = `You are ShopForge, an expert JSON page-structure editor for a React + Tailwind CSS storefront.
You will receive an existing GeneratedPageData JSON object that represents either a landing page or a product page.
Your job is to ADD or UPDATE a single section in this JSON while keeping the overall structure compatible with GeneratedPageData.

CRITICAL RULES:
- You must operate ONLY on JSON data. Do NOT output JSX, HTML, or CSS.
- Preserve the fundamental section ordering for each page type:
  - landing: NAV → HERO → FEATURES → PRICING → TESTIMONIALS → CTA BANNER → FOOTER
  - product: NAV → PRODUCT SECTION → FOOTER
- Always edit the existing canonical section keys for the page type rather than adding new top-level sections:
  - For a HERO-related request on a landing page, update only landing.hero.
  - For a FEATURES-related request on a landing page, update only landing.features.
  - For a PRICING-related request on a landing page, update only landing.pricing.
  - For a TESTIMONIALS-related request on a landing page, update only landing.testimonials.
  - For a CTA banner request on a landing page, update only landing.ctaBanner.
  - For product-specific layout changes, update only product.productSection.
- Do NOT introduce new peer keys like extraTestimonials, secondaryHero, altPricing, etc. The only valid section keys are those defined in GeneratedPageData.
- By default, INSERT or REPLACE content inside the correct section while keeping all other sections unchanged, unless the user explicitly instructs you to remove or replace them.
- Match the existing tone, wording style, and brand positioning.
- Match the existing style preset (minimalist, bold, luxury, etc.) in terms of intensity, voice, and copy style.
- Reuse and respect the existing color accents and product/brand theme.

CONTENT POPULATION RULES (non-negotiable):

Every array field you include MUST be populated with real, brand-appropriate content. NEVER return an empty array [] for any section you are adding or updating.
Minimum array sizes: features.features >= 3, pricing.tiers = 3, testimonials.testimonials >= 3, faq.items >= 5, stats.items = 4, team.members >= 3, logoBar.logos >= 5, reviews.reviews >= 3, relatedProducts.items >= 4, nav.links >= 2, footer.columns >= 2.
If you cannot populate an optional section with real content, omit the entire key from the JSON rather than returning it with an empty array.
All string fields (headline, heading, quote, description, etc.) must be non-empty strings relevant to the brand context.

OUTPUT FORMAT:
- You must return ONLY a single JSON object, starting with { and ending with }.
- The JSON MUST be directly parseable as GeneratedPageData.
- Do NOT include markdown, code fences, comments, JSX, HTML, or CSS. Raw JSON only.`;

    const prettyJson = JSON.stringify(currentPageData, null, 2);

    const userMessage = `You are editing an existing page described as a GeneratedPageData JSON object.

Here is the existing page JSON:

"""
${prettyJson}
"""

TASK: Add or update a section labeled "${sectionLabel}". Specifically: ${sectionPrompt}

- Edit only the JSON data.
- You MUST modify the correct existing section key for this label (for example, hero -> landing.hero, features -> landing.features, pricing -> landing.pricing, testimonials -> landing.testimonials, CTA banner -> landing.ctaBanner, product hero/details -> product.productSection).
- Do NOT create new sibling keys such as extraTestimonials, secondaryHero, altPricing, etc.
- Keep the same keys and overall structure compatible with GeneratedPageData.
- Preserve the correct section ordering for a ${pageType} page.
- Do NOT output JSX, HTML, or CSS.
- Return ONLY the full updated JSON object (no markdown).`;

    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const raw = await callAI(systemPrompt, userMessage, provider);
        const updatedPageData = parseUpdatedPageData(raw);

        // Merge with the original to avoid losing sections if the model omits them
        const mergedPageData =
          pageType === 'landing'
            ? mergeLandingData(currentPageData, updatedPageData)
            : mergeProductData(currentPageData, updatedPageData);

        const generatedCode = buildComponentFromPageData(mergedPageData, preset ?? 'bold');
        const html = buildHtmlFromGeneratedCode(generatedCode);
        return NextResponse.json({ html, generatedCode, pageData: mergedPageData });
      } catch (e) {
        if (attempt === MAX_RETRIES) throw e;
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    throw new Error('Failed after retries');
  } catch (error) {
    console.error('Insert section error:', error);
    return NextResponse.json({ error: 'Failed to add section' }, { status: 500 });
  }
}
