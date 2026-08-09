<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1.`context/project-overview.md` - product definition,goals,features and scope
2.`context/architecture-context.md` - system structure , boundaries,storagemodel and invariants
3.`context/ui-context.md`- themes,colors,typograpy,canvas  design and component conventions
4.`context/code-standards.md`-implementation rules and conventions
5.`context/ai-workflow-rules.md`-development workflow,scoping rules and delivery approach
6.`context/progess-tracker.md`-current phase,completed work,open questions and next steps

update `context/progress-tracker.md` after each meaningful implemetation change.

if implementation changes architecture ,scope, or standards documented in the contextt files update the relevant file before continuing.
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