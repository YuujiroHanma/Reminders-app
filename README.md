# Reminders App (TypeScript, Next.js, Supabase, AI)

This repository is a starter full-stack app for Notes & Reminders using Next.js (App Router), TypeScript, Tailwind CSS, and Supabase (Postgres + Auth). It includes an AI abstraction (`server/ai.ts`) to summarise and spellcheck notes.

Features
- Create reminders: title, due datetime, optional note
- View reminders grouped by Today, Tomorrow, Upcoming
- AI helpers: Summarize and Spellcheck (server-side proxy)
- Supabase for Auth & persistence (RLS policies included)
- Tests: Jest (unit) + Playwright (E2E) skeletons

Quick setup
1. Create a Supabase project and enable Auth (email + magic link)
2. Create a table by running `supabase/schema.sql` in your DB (or use Supabase SQL editor)
3. Add env vars (see below)
4. Install and run

Install

```powershell
npm install
npm run dev
```

Local MCP server (development)

You can run a lightweight MCP-compatible server locally which proxies AI calls to OpenAI. This is convenient for development and keeps AI keys on the server side.

1. Set your AI key (PowerShell):

```powershell
$env:AI_API_KEY = "sk-..."
```

2. Start the local MCP server:

```powershell
npm run mcp:start
```

3. Set `MCP_URL` in your `.env` or environment for your Next app to use it (example):

```powershell
$env:MCP_URL = "http://localhost:8081"
npm run dev
```

Environment variables (example)
 - MCP_URL: (optional) http://localhost:8081 to route AI calls to the local MCP server

Running tests

Unit tests are implemented with Jest. The AI unit tests mock the provider responses so they do not require a real AI key. To run tests locally:

```powershell
npm ci
npm test
```

Playwright E2E

Playwright E2E tests are included in `e2e/`. The CI workflow will only run Playwright E2E if an `AI_API_KEY` secret is provided to the runner (the action will start the local MCP server using that key). To run Playwright locally with the MCP server:

```powershell
$env:AI_API_KEY = "sk-..."
npm run mcp:start
$env:MCP_URL = "http://localhost:8081"
npx playwright test
```

CI notes

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs unit tests by default. Playwright E2E and starting the MCP server are gated behind the presence of the `AI_API_KEY` secret to avoid failing CI when an AI key isn't available.

API contracts
- POST /api/ai
  - body: { action: 'summarize' | 'spellcheck', text: string }
  - response: { result: string }

Database schema
- See `supabase/schema.sql` - `reminders` table with RLS policies restricting rows to `auth.uid()`.

CI / Deploy
- Recommended: Vercel for Next.js and Supabase for DB.
- Add GitHub Actions to run tests and deploy. See `.github/workflows/ci.yml` for an example (not yet implemented).

What's next / optional
- Wire UI to Supabase client for real CRUD operations
- Add notifications via Web Push or Supabase functions
- Add recurring scheduling logic and background jobs
- Harden server API routes with auth verification using Supabase service role

