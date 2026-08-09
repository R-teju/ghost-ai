import { Liveblocks } from "@liveblocks/node"

// Singleton wrapper for the Liveblocks Node SDK client
const globalForLiveblocks = global as unknown as { liveblocks: Liveblocks }

export const liveblocks =
  globalForLiveblocks.liveblocks ||
  new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_dummy_build_key",
  })

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks
}

// Deterministic palette mapping
const PALETTE = [
  "#f43f5e", // Rose
  "#ec4899", // Pink
  "#d946ef", // Fuchsia
  "#a855f7", // Purple
  "#8b5cf6", // Violet
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#0ea5e9", // Sky
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#10b981", // Emerald
  "#22c55e", // Green
  "#84cc16", // Lime
  "#eab308", // Yellow
  "#f97316", // Orange
  "#ef4444", // Red
]

/**
 * Deterministically generates avatar and cursor colors for a user ID
 * to maintain consistency across collaboration sessions.
 */
export function getUserColor(userId: string): { avatarColor: string; cursorColor: string } {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }

  const avatarIndex = Math.abs(hash) % PALETTE.length
  const cursorIndex = Math.abs(hash + 5) % PALETTE.length

  return {
    avatarColor: PALETTE[avatarIndex] || "#6366f1",
    cursorColor: PALETTE[cursorIndex] || "#3b82f6",
  }
}
