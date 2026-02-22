import { NextRequest, NextResponse } from 'next/server';
import {
  getProvider,
  getAnthropicClient,
  getOpenAIClient,
  getGeminiClient,
  getGroqClient,
} from '@/lib/claude';
import { buildSystemPrompt } from '@/lib/prompts';
import { buildMessages } from '@/lib/promptMessages';
import { GenerateRequest, GeneratedPageData } from '@/types';
import { buildComponentFromPageData, buildHtmlFromGeneratedCode } from '@/lib/pageBuilder';

async function generateWithAnthropic(
  systemPrompt: string,
  formattedMessages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: formattedMessages,
  });
  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response format from Anthropic');
  return content.text.trim();
}

async function generateWithOpenAI(
  systemPrompt: string,
  formattedMessages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 8192,
    messages: [
      { role: 'system', content: systemPrompt },
      ...formattedMessages,
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Unexpected response format from OpenAI');
  return content.trim();
}

async function generateWithGemini(
  systemPrompt: string,
  formattedMessages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const history = formattedMessages.slice(0, -1).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = formattedMessages[formattedMessages.length - 1];

  const chat = model.startChat({
    history,
    generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
  });

  const result = await chat.sendMessage(lastMessage.content);
  const text = result.response.text();
  if (!text) throw new Error('Unexpected response format from Gemini');
  return text.trim();
}

async function generateWithGroq(
  systemPrompt: string,
  formattedMessages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 8192,
    temperature: 0.7,
    messages: [
      { 
        role: 'system', 
        content: systemPrompt + '\n\nCRITICAL: Your response must start with { and end with }. No text before or after the JSON object. No markdown. No code fences. Raw JSON only.'
      },
      ...formattedMessages,
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Unexpected response format from Groq');
  return content.trim();
}

function parseGeneratedPageData(raw: string): GeneratedPageData {
  let text = raw.trim();

  // Remove markdown code fences
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  // Find the first { and last } to extract just the JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('AI did not return valid JSON. Please try again.');
  }
  
  text = text.slice(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(text);
    if (!parsed.pageType || !parsed.title) {
      throw new Error('Missing required fields in JSON response');
    }
    return parsed as GeneratedPageData;
  } catch (e) {
    if (e instanceof SyntaxError) {
      try {
        const fixed = text
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        const parsed = JSON.parse(fixed);
        return parsed as GeneratedPageData;
      } catch {
        throw new Error('AI did not return valid JSON. Please try again.');
      }
    }
    throw e;
  }
}

function validatePageData(data: GeneratedPageData): void {
  if (data.pageType === 'landing' && data.landing) {
    const l = data.landing;
    if (!l.nav?.links?.length) throw new Error('JSON validation failed: nav.links is empty');
    if (!l.hero?.headline?.trim()) throw new Error('JSON validation failed: hero.headline is empty');
    if (!l.features?.features?.length) throw new Error('JSON validation failed: features.features is empty');
    if (!l.pricing?.tiers?.length) throw new Error('JSON validation failed: pricing.tiers is empty');
    if (!l.testimonials?.testimonials?.length)
      throw new Error('JSON validation failed: testimonials.testimonials is empty');
    if (!l.ctaBanner?.headline?.trim())
      throw new Error('JSON validation failed: ctaBanner.headline is empty');
    if (!l.footer?.columns?.length) throw new Error('JSON validation failed: footer.columns is empty');
  }
  if (data.pageType === 'product' && data.product) {
    const p = data.product;
    if (!p.nav?.links?.length) throw new Error('JSON validation failed: product nav.links is empty');
    if (!p.productSection?.title?.trim())
      throw new Error('JSON validation failed: productSection.title is empty');
    if (!p.productSection?.images?.length)
      throw new Error('JSON validation failed: productSection.images is empty');
  }
}

export async function generateVariant(
  systemPrompt: string,
  formattedMessages: { role: 'user' | 'assistant'; content: string }[],
  provider: string
): Promise<string> {
  if (provider === 'openai') return generateWithOpenAI(systemPrompt, formattedMessages);
  if (provider === 'gemini') return generateWithGemini(systemPrompt, formattedMessages);
  if (provider === 'groq') return generateWithGroq(systemPrompt, formattedMessages);
  return generateWithAnthropic(systemPrompt, formattedMessages);
}


export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { messages, pageType, referenceUrl, preset } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    if (!pageType || !['landing', 'product'].includes(pageType)) {
      return NextResponse.json(
        { error: 'Invalid page type. Must be landing or product.' },
        { status: 400 }
      );
    }

    const provider = getProvider();
    const systemPrompt = buildSystemPrompt(pageType, preset ?? 'bold');
    const formattedMessages = buildMessages(messages, pageType, referenceUrl);

    // Retry up to 3 times on JSON parse failure
    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        let rawOutput: string;

        if (provider === 'openai') {
          rawOutput = await generateWithOpenAI(systemPrompt, formattedMessages);
        } else if (provider === 'gemini') {
          rawOutput = await generateWithGemini(systemPrompt, formattedMessages);
        } else if (provider === 'groq') {
          rawOutput = await generateWithGroq(systemPrompt, formattedMessages);
        } else {
          rawOutput = await generateWithAnthropic(systemPrompt, formattedMessages);
        }

        const pageData = parseGeneratedPageData(rawOutput);
        pageData.preset = preset ?? 'bold';
        validatePageData(pageData);
        const generatedCode = buildComponentFromPageData(pageData, preset ?? 'bold');
        const html = buildHtmlFromGeneratedCode(generatedCode);

        return NextResponse.json({ html, generatedCode, provider, pageData });

      } catch (attemptError: unknown) {
        const isJsonError =
          attemptError instanceof Error &&
          (attemptError.message.includes('valid JSON') ||
            attemptError.message.includes('JSON') ||
            attemptError.message.includes('parse'));

        if (isJsonError && attempt < MAX_RETRIES) {
          console.warn(`Attempt ${attempt} failed with JSON error. Retrying...`);
          lastError = attemptError as Error;
          // Small delay before retry
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        // Non-JSON error or final attempt — throw to outer catch
        throw attemptError;
      }
    }

    // All retries exhausted
    throw lastError ?? new Error('Failed after multiple attempts.');

  } catch (error: unknown) {
    console.error('Generate API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('not set')) {
        return NextResponse.json(
          { error: `API key error: ${error.message}` },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit reached. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      if (error.message.includes('credit') || error.message.includes('billing')) {
        return NextResponse.json(
          { error: 'Insufficient credits. Please top up your API account.' },
          { status: 402 }
        );
      }
      if (error.message.includes('valid JSON')) {
        return NextResponse.json(
          { error: 'AI had trouble formatting the response. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate page. Please try again.' },
      { status: 500 }
    );
  }
}