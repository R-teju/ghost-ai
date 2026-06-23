# Code Standards

## TypeScript Standards
- **Strict mode enabled** — no `any`, no implicit types
- **Explicit return types** on all exported functions
- **Interface over Type** for object shapes
- **Enum over union types** for fixed sets of values
- **Nullish coalescing** (`??`) over logical OR (`||`)
- **Optional chaining** (`?.`) for potentially undefined values

## Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase starting with `use` (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types/Interfaces**: PascalCase with descriptive names (`UserProfileProps`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Files**: kebab-case for non-component files

## Component Patterns

### Server Component (Default)
```tsx
// app/dashboard/page.tsx
import { fetchUsers } from "@/convex/users";

export default async function DashboardPage() {
  const users = await fetchUsers();
  return (
    <div className="container mx-auto p-4">
      <UserList users={users} />
    </div>
  );
}
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  const createItem = useMutation(api.items.create);

  const handleClick = async () => {
    await createItem({ name: `Item ${count}` });
    setCount((c) => c + 1);
  };

  return (
    <Button onClick={handleClick}>
      Clicked {count} times
    </Button>
  );
}
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("items", {
      name: args.name,
      description: args.description,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});


import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateText = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: args.prompt }],
    });
    return response.choices[0].message.content;
  },
});
Error Handling
Always validate inputs with Zod before processing
Return structured errors — { success: false, error: string }
Use try/catch in actions — external APIs can fail
Log errors on server, show user-friendly messages on client
Never expose stack traces to the client in production
Styling Standards
Tailwind only — no inline styles, no CSS modules unless necessary
Use cn() utility for conditional classes
Responsive first — mobile → tablet → desktop
Dark mode support — use dark: variants
Consistent spacing — use Tailwind's scale (4 = 1rem)
Import Order
React/Next.js imports
Third-party libraries
Convex imports
Internal utilities (@/lib/*)
Internal components (@/components/*)
Types (@/types/*)
Relative imports (if necessary)