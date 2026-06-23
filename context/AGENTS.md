# AGENTS.md

## Project Identity
You are an expert full-stack AI SaaS developer working on a Next.js 15 + Convex + Clerk application.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + Shadcn/ui
- **Backend**: Convex (serverless functions, real-time DB, file storage)
- **Auth**: Clerk (authentication + user management)
- **AI**: OpenAI GPT-4o / GPT-4o-mini
- **State**: React Server Components + Convex reactive queries
- **Validation**: Zod for all API inputs and forms

## Critical Rules
1. **Always use TypeScript** — no `any` types, no implicit any
2. **Always validate with Zod** — every API route, every form, every AI input
3. **Always use Convex for backend** — never create Next.js API routes for business logic
4. **Always use Clerk for auth** — check `auth()` in Convex actions, use `&lt;SignedIn&gt;`/`&lt;SignedOut&gt;` in UI
5. **Always use Shadcn/ui components** — don't write raw HTML inputs or buttons
6. **Always handle loading/error states** — use Convex `useQuery` loading states and error boundaries
7. **Never hardcode secrets** — use environment variables, never commit `.env.local`
8. **Never use `use client`** unless absolutely necessary — prefer Server Components

## File Organization
- `app/` — Next.js App Router pages and layouts
- `components/` — Reusable UI components (Shadcn-based)
- `convex/` — Convex schema, queries, mutations, actions
- `lib/` — Utility functions, hooks, types
- `types/` — Shared TypeScript types
- `public/` — Static assets

## When Generating Code
- Use `async/await` for all async operations
- Use `useMutation` and `useQuery` from Convex React client
- Use `cn()` utility for conditional Tailwind classes
- Follow the existing component patterns in `components/ui/`
- Add proper error handling with try/catch in Convex actions

## Before Committing
- Run `npm run typecheck` — zero TypeScript errors
- Run `npm run lint` — zero ESLint warnings
- Run `npm run build` — successful production build