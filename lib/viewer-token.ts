/**
 * Lightweight viewer token utility using HMAC-SHA256.
 * Creates short-lived JWTs for viewer authentication without requiring
 * a full JWT library. Tokens are signed with the CLERK_SECRET_KEY to
 * avoid needing a separate secret.
 */

const VIEWER_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

interface ViewerTokenPayload {
  projectId: string
  email: string
  role: "viewer"
  exp: number
}

function getSecret(): string {
  const secret = process.env.CLERK_SECRET_KEY
  if (!secret) throw new Error("CLERK_SECRET_KEY is not set")
  return secret
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) str += "="
  return atob(str)
}

/**
 * Creates a signed viewer token for read-only Liveblocks access.
 */
export async function createViewerToken(projectId: string, email: string): Promise<string> {
  const payload: ViewerTokenPayload = {
    projectId,
    email,
    role: "viewer",
    exp: Date.now() + VIEWER_TOKEN_EXPIRY_MS,
  }

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const signature = await hmacSign(`${header}.${body}`, getSecret())

  return `${header}.${body}.${signature}`
}

/**
 * Verifies a viewer token and returns the payload if valid.
 */
export async function verifyViewerToken(token: string): Promise<ViewerTokenPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, body, signature] = parts
    const expectedSignature = await hmacSign(`${header}.${body}`, getSecret())

    if (signature !== expectedSignature) return null

    const payload: ViewerTokenPayload = JSON.parse(base64UrlDecode(body))

    if (payload.exp < Date.now()) return null
    if (payload.role !== "viewer") return null

    return payload
  } catch {
    return null
  }
}
