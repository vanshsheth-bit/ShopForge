import { NextRequest, NextResponse } from 'next/server';
import { getProvider, getAnthropicClient, getOpenAIClient, getGeminiClient, getGroqClient } from '@/lib/claude';
import { buildSystemPrompt } from '@/lib/prompts';
import { buildMessages } from '@/lib/promptMessages';
import { GeneratedPageData, TemplatePreset } from '@/types';
import { buildComponentFromPageData, buildHtmlFromGeneratedCode } from '@/lib/pageBuilder';

const VARIANT_PRESETS: { preset: TemplatePreset; label: string; style: string }[] = [
  { preset: 'minimalist', label: 'Minimalist', style: 'Clean, airy, whitespace-focused' },
  { preset: 'bold', label: 'Bold', style: 'High contrast, strong typography' },
  { preset: 'luxury', label: 'Luxury', style: 'Dark, premium, gold accents' },
];

function parsePageData(raw: string): GeneratedPageData {
  let text = raw.trim();
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON found');
  text = text.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(text);
  if (!parsed.pageType || !parsed.title) throw new Error('Missing fields');
  return parsed as GeneratedPageData;
}

async function generateOne(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  provider: string
): Promise<string> {
  if (provider === 'openai') {
    const client = getOpenAIClient();
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 8192,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
  }
  if (provider === 'gemini') {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const last = messages[messages.length - 1];
    const chat = model.startChat({
      history,
      generationConfig: { maxOutputTokens: 8192, temperature: 0.9 },
    });
    const result = await chat.sendMessage(last.content);
    return result.response.text().trim();
  }
  if (provider === 'groq') {
    const client = getGroqClient();
    const res = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 8192,
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content:
            systemPrompt +
            '\n\nCRITICAL: Return ONLY raw JSON starting with { and ending with }. No markdown.',
        },
        ...messages,
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? '';
  }
  const client = getAnthropicClient();
  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages,
  });
  const content = res.content[0];
  if (content.type !== 'text') throw new Error('Bad response');
  return content.text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, pageType, referenceUrl } = body;

    const provider = getProvider();
    const formattedMessages = buildMessages(messages, pageType, referenceUrl);

    const results = await Promise.allSettled(
      VARIANT_PRESETS.map(async (variant) => {
        const systemPrompt = buildSystemPrompt(pageType, variant.preset);
        const MAX_RETRIES = 2;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const raw = await generateOne(systemPrompt, formattedMessages, provider);
            const pageData = parsePageData(raw);
            const generatedCode = buildComponentFromPageData(pageData, variant.preset);
            const html = buildHtmlFromGeneratedCode(generatedCode);
            return {
              id: variant.preset,
              label: variant.label,
              style: variant.style,
              html,
              generatedCode,
              pageData,
            };
          } catch (e) {
            if (attempt === MAX_RETRIES) throw e;
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      })
    );

    const variants = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value != null)
      .map((r) => r.value);

    if (variants.length === 0) {
      return NextResponse.json({ error: 'Failed to generate any variants' }, { status: 500 });
    }

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Variants API error:', error);
    return NextResponse.json({ error: 'Failed to generate variants' }, { status: 500 });
  }
}
