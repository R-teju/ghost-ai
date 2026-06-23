# Architecture Context

## System Architecture
Client Layer:
Next.js 15 (App Router)
React 19 Components
Tailwind CSS + Shadcn/ui
Convex React Client (real-time subscriptions)
Convex Backend:
Queries (read)
Mutations (write)
Actions (HTTP + AI calls)
Convex Database (auto-sync)
File Storage
External Services:
Clerk (Auth)
OpenAI (AI/LLM)
Other APIs (Stripe, etc.)
plain

## Data Flow

### Reading Data (Real-time)
1. Client calls `useQuery(api.module.function, args)`
2. Convex React client subscribes to query
3. Convex server executes query function
4. Database returns data
5. Client receives data + auto-updates on changes

### Writing Data
1. Client calls `useMutation(api.module.function)`
2. Convex React client sends mutation
3. Convex server executes mutation with auth context
4. Database is updated
5. All subscribed queries auto-refetch

### AI Operations (Actions)
1. Client triggers action (via mutation or direct HTTP)
2. Convex action runs on server
3. Action calls OpenAI API with proper auth
4. AI response is processed and validated with Zod
5. Result is stored in database and returned to client

## Authentication Flow
1. User signs in via Clerk UI component
2. Clerk issues JWT token
3. Convex client sends JWT with every request
4. Convex validates JWT via Clerk issuer
5. `auth()` in Convex functions returns user identity

## Key Architectural Decisions
- **No REST API** — all backend logic is in Convex functions
- **No State Management Library** — Convex handles all state
- **No Custom Backend** — Convex replaces Express/Fastify
- **File Storage in Convex** — no S3 needed for most use cases
- **Server Components by Default** — only use client components for interactivity