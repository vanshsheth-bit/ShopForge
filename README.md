🎉 Both pages are working perfectly!

✅ Landing Page — Coffee brand with hero, features, pricing, testimonials
✅ Product Page — Headphones with image, price, variants, add to cart, reviews
✅ App.jsx shows real React component code
✅ styles.css shows all the CSS
✅ Both page types generate correctly

Your app is fully functional and meets all core requirements! Now let's write the README for submission. Here's your prompt:

Create a file called README.md at the project root. Replace any existing content with this:
markdown# ShopForge — AI Shop Website Generator

> Describe your shop, pick a page type, get a production-ready website instantly.

![ShopForge](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38bdf8?style=flat-square)
![AI](https://img.shields.io/badge/AI-Multi--Provider-violet?style=flat-square)

## What I Built

ShopForge is an AI-powered web application where users describe their shop in plain English, select a page type (Landing Page or Product Page), and the AI generates a complete, styled React component with live preview — instantly.

The generated code is a proper React component (`function App()`) with separate CSS, rendered live in a sandboxed iframe using Babel in the browser. Users can also export the page as a Next.js project structure.

## Live Demo

[Add your Vercel URL here]

## Screen Recording

[Add your Loom/recording URL here]

## Features

- **AI Chat Interface** — Describe your shop, refine with follow-up prompts
- **Page Type Selector** — Landing Page or Product Page with different section structures
- **Live Preview** — React component rendered instantly in sandboxed iframe
- **Device Preview** — Toggle between Desktop, Tablet, Mobile viewports
- **Code Export** — View App.jsx, styles.css, preview.html separately
- **Next.js Export** — Download full Next.js project structure
- **Reference URL** — Add inspiration URL as AI context
- **Save to Dashboard** — All generated pages saved to localStorage
- **Multi-Provider AI** — Supports Anthropic Claude, OpenAI GPT-4o, Google Gemini, Groq Llama

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Providers | Claude / GPT-4o / Gemini / Groq |
| Preview | Sandboxed iframe + Babel standalone |
| Storage | localStorage |
| Icons | Lucide React |
| Code Display | React Syntax Highlighter |

## How to Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/shopforge.git
cd shopforge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file at the root:
```env
# Choose one provider and set AI_PROVIDER accordingly
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here      # Free at aistudio.google.com
GROQ_API_KEY=your_key_here        # Free at console.groq.com

# Set which provider to use
AI_PROVIDER=groq
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to Get a Free API Key

The easiest free options:
- **Groq** (fastest): https://console.groq.com — free, no credit card
- **Gemini**: https://aistudio.google.com/app/apikey — free tier

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Main generator UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── dashboard/page.tsx    # Saved pages dashboard
│   └── api/generate/route.ts # AI API route (server-side)
├── components/
│   ├── Header.tsx            # Top navigation
│   ├── ChatPanel.tsx         # Chat input + message history
│   ├── PreviewPanel.tsx      # Live iframe preview
│   ├── CodePanel.tsx         # Code viewer + export
│   ├── PageTypeSelector.tsx  # Landing/Product toggle
│   └── DeviceToggle.tsx      # Desktop/Tablet/Mobile toggle
├── lib/
│   ├── claude.ts             # AI client initializers
│   ├── prompts.ts            # System prompts + message builder
│   └── storage.ts            # localStorage helpers
└── types/
    └── index.ts              # TypeScript interfaces
```

## Design Decisions

**Single-file React output over raw HTML** — The AI generates a proper `function App()` React component with separate CSS. This is compiled in the browser using Babel standalone, giving a true live preview without a build step while still producing exportable React code.

**Multi-provider AI support** — Supporting Anthropic, OpenAI, Gemini, and Groq makes the app accessible to everyone regardless of which API credits they have. Switch providers by changing one env variable.

**Server-side API calls** — All AI API calls go through Next.js API routes, keeping API keys secure and never exposed to the browser.

**localStorage for persistence** — No database needed. Pages are saved locally and accessible in the dashboard instantly.

## Hardest Technical Challenge

Getting the AI to consistently output a proper `function App()` React component (not raw JSX, not HTML) in valid JSON format. The solution was a strict system prompt with exact format examples, plus a fallback parser that wraps raw JSX in a function if the AI forgets.

## What I'd Improve With More Time

- Sandpack integration for true in-browser Next.js compilation
- Multiple design variants generated simultaneously
- Version history per page
- One-click Vercel deploy from the UI
- Better error recovery when AI output is malformed

## How I Used AI in My Workflow

- Used Claude to architect the full system design before writing code
- Used Windsurf (AI coding assistant) for implementation
- Iterated on the AI system prompt by testing dozens of generations
- Used AI to debug TypeScript errors and CSS compatibility issues