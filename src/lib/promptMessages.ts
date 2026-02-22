import { Message, PageType } from '@/types';

export function buildMessages(
  conversationMessages: Message[],
  pageType: PageType,
  referenceUrl?: string
) {
  return conversationMessages.map((msg, index) => {
    if (msg.role === 'user') {
      const isFirst = index === 0;

      let content = msg.content;

      if (isFirst) {
        const refPart = referenceUrl ? `Design inspiration reference: ${referenceUrl}\n\n` : '';
        content = `${refPart}${msg.content}\n\nGenerate a premium ${
          pageType === 'landing' ? 'landing page' : 'product page'
        } that feels like a world-class SaaS marketing site (Stripe / Linear / Vercel quality).\n\nIMPORTANT:\n- You must NOT output any JSX, HTML, or CSS.\n- Instead, fill the JSON shape described above for pageType = "${pageType}".\n- All copy must be realistic and on-brand. No lorem ipsum.\n- Every image URL must use https://loremflickr.com/WIDTH/HEIGHT/keyword1,keyword2 with highly specific, brand-appropriate keywords (e.g. /1200/1200/headphones,audio or /1200/800/coffee,espresso).\n- For avatar images always use /96/96/portrait,face or /128/128/portrait,professional — never product keywords.\n- Colors should be Tailwind color names or hex values and should respect the style preset.`;
      } else {
        content = `Refinement request: ${msg.content}\n\nApply ONLY this specific change to the existing JSON page data you returned earlier.\n- Keep the overall section structure identical.\n- If the user asks to change color, update color-related fields consistently across nav/hero/sections.\n- If the user asks to change copy or button labels, update only the relevant text fields.\n- On PRODUCT pages, treat requests like "add a buy button at the end" or "change the buy button text" as updates to product.productSection.ctaLabel (e.g. set it to "Buy Now").\nReturn ONLY the full updated JSON object starting with { and ending with }.`;
      }

      return { role: 'user' as const, content };
    }
    return { role: 'assistant' as const, content: msg.content };
  });
}
