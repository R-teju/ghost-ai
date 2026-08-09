
---

## File: `progress-tracker.md`

```markdown
# Progress Tracker

## Project Status

### ✅ Completed
- [x] Project initialization (Next.js + Shadcn/ui)
- [x] Clerk authentication setup
- [x] Convex backend configuration
- [x] Database schema definition
- [x] Basic layout and navigation
- [x] Landing page design
- [x] Design system and UI primitive components
- [x] Editor Shell (Top Navbar & Project Sidebar)
- [x] Prisma Database Integration & Client Setup
- [x] Project Backend API Routes (/api/projects)
- [x] Editor home sidebar and dialogs wiring
- [x] Project Sharing & Collaboration Dialog
- [x] Project Dialogs & Home Actions Alignment
- [x] Editor Workspace Shell with server-side checks
- [x] Workspace Shell Visual Alignment
- [x] Custom Sign-In Form & Auth Verification
- [x] AI Copilot Chatbot Integration
- [x] Liveblocks Setup & Auth Route
- [x] Multiplayer React Flow Canvas Setup
- [x] Draggable Shapes Panel integration
- [x] Refined Node Shapes & Ghost Preview
- [x] Node Resizing & Label Editing
- [x] Predefined Node Colors & Swatch Toolbar
- [x] Custom Edge Renderer & Color Swatches
- [x] Floating Canvas Ergonomics Pill (Zoom, Fit View, Undo/Redo & Keyboard Shortcuts)
- [x] Small Starter Template Library (Microservices, CI/CD, Event-Driven + Vector Preview Modal)
- [x] Trigger.dev task infrastructure setup
- [x] AI Design Agent (Gemini live mutation + cursor presence + status banners)
- [x] AI Spec Generator (canvas specification compiler + live storage specs list + download modal)
- [x] Collaborator Invitation System Overhaul (Resend email delivery + room password gate + read-only viewer canvas + signed viewer JWTs + public /view route)

### 🔄 In Progress
- [ ] User dashboard
- [ ] File upload/storage

### ⏳ Pending
- [ ] Subscription/billing
- [ ] Advanced AI workflows
- [ ] Deployment
- [ ] Testing

## Feature Checklist

### Authentication & User Management
- [x] Sign up / Sign in pages
- [x] Protected routes
- [x] User profile page
- [x] Password reset
- [x] Email verification

### Core Features
- [x] Editor Shell (Top Navbar & Project Sidebar)
- [x] Dynamic Room / Workspace Shell
- [x] Main AI functionality
- [x] History/persistence
- [ ] File handling
- [x] Real-time updates

### UI/UX
- [x] Responsive layout
- [x] Dark mode
- [ ] Loading states
- [ ] Error boundaries
- [x] Empty states
- [ ] Toast notifications

### Backend
- [x] Project Sharing & Collaborations
- [x] Collaborator Invitation Emails (Resend)
- [x] Room Password Viewer Gate
- [x] Read-Only Viewer Canvas & Liveblocks Auth
- [x] Prisma Integration & Models
- [x] Project API routes
- [x] Database schema
- [x] Basic CRUD operations
- [x] AI integration
- [ ] File storage
- [ ] Webhooks

### DevOps
- [ ] Environment setup
- [ ] Build pipeline
- [ ] Deployment (Vercel)
- [ ] Convex production
- [ ] Clerk production

## Notes
- Resolved database connection reset error (`Server has closed the connection`) by configuring the `PrismaPg` driver adapter with `ssl: { rejectUnauthorized: false }` in `lib/prisma.ts`.
- Fixed the Liveblocks server-side rendering (SSR) suspense error in `components/editor/workspace-shell.tsx` by wrapping the inner workspace shell component in a `ClientSideSuspense` wrapper.
- Fixed `GOOGLE_AI_API_KE` → `GOOGLE_GENERATIVE_AI_API_KEY` env var typo that blocked all AI features.
- Replaced OpenAI chat backend with Gemini (via Vercel AI SDK `@ai-sdk/google`) + improved offline fallback with rich architecture templates.
- Added direct inline spec generation via Gemini in `/api/specs/generate` (no longer requires Trigger.dev running).
- Fixed chat message rendering to use `renderMarkdown()` for professional formatted output.
- Fixed specification document preview modal layout by constraining it to a medium-sized squared box (`max-w-lg` and `h-[500px]`) and adding `overflow-hidden` so that long spec documents scroll internally and the bottom download footer stays accessible within the viewport.
- Updated AI Design Agent prompt constraints to strictly prevent it from generating cluttered descriptive/spec text nodes on the canvas.
- Configured Clerk invitation email dispatching when inviting collaborators to projects, allowing new users to receive invitation links in their email.
- **Replaced Clerk `createInvitation` with Resend email delivery** — Clerk invitations only sign up new Clerk users, they don't send project-specific invites. Now uses Resend API to send styled HTML invitation emails with a link to `/view/[projectId]?token=[inviteToken]`.
- **Added Room Password system** — owners set a password in the Share Dialog; viewers must enter it to access the canvas. Stored as plain text in `Project.roomPassword` (viewer convenience, not security-critical).
- **Added Read-Only Viewer Canvas** — separate `/view/[projectId]` public route (no Clerk auth needed). Viewers enter email + room password, receive a signed JWT, connect to Liveblocks with `room:read` only. Canvas is fully locked (no drag/drop/edit).
- **Added signed viewer JWTs** — `lib/viewer-token.ts` creates HMAC-SHA256 tokens using Web Crypto API. 24h expiry. Used for Liveblocks viewer auth at `/api/liveblocks-viewer-auth`.
- **Schema changes**: Added `roomPassword` to `Project`, `inviteToken` and `inviteStatus` to `ProjectCollaborator`.
- Use this file to track what has been built and what's next
- Update after every coding session
- Mark items complete only after testing