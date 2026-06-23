# Project Overview

## Project Name
AI SaaS Platform

## Description
A full-stack AI-powered SaaS application built with Next.js 15, Convex, and Clerk.

## Core Value Proposition
[Describe what your AI SaaS does]

## Target Users
- [Define your target audience]

## Key Features
1. **AI-Powered Generation** — Users input prompts, AI generates content
2. **Real-Time Collaboration** — Live updates via Convex subscriptions
3. **User Authentication** — Secure auth with Clerk
4. **File Management** — Store and retrieve generated content
5. **Subscription Tiers** — Free/Pro/Premium plans
6. **Responsive Design** — Works on all devices

## Tech Stack Summary
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS v4 |
| UI Components | Shadcn/ui |
| Backend | Convex (serverless) |
| Auth | Clerk |
| AI | OpenAI GPT-4o / GPT-4o-mini |
| Validation | Zod |
| Deployment | Vercel |

## Project Structure
my-saas/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API routes (minimal)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── _generated/       # Auto-generated code
│   └── [feature].ts      # Feature functions
├── lib/                  # Utilities
│   ├── utils.ts          # cn(), helpers
│   └── [feature].ts      # Feature utilities
├── types/                # TypeScript types
├── public/               # Static assets
└── context/              # AI context files (this folder)
