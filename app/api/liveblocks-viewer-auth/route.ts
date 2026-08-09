import { liveblocks, getUserColor } from "@/lib/liveblocks"
import { verifyViewerToken } from "@/lib/viewer-token"

/**
 * POST: Liveblocks auth endpoint for READ-ONLY viewer access.
 * Uses a signed viewer JWT (no Clerk auth required).
 * Grants only `room:read` permission — viewers cannot edit the canvas.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    let viewerToken = url.searchParams.get("token") || ""
    let room = ""

    try {
      const body = await request.json()
      room = body.room || ""
      if (!viewerToken && body.viewerToken) {
        viewerToken = body.viewerToken
      }
    } catch {
      // Invalid body
    }

    if (!room || !viewerToken) {
      return Response.json(
        { error: "Room and viewerToken are required" },
        { status: 400 }
      )
    }

    // 1. Verify the viewer token
    const payload = await verifyViewerToken(viewerToken)
    if (!payload) {
      return Response.json({ error: "Invalid or expired viewer token" }, { status: 401 })
    }

    // 2. Ensure the token is for this room
    if (payload.projectId !== room) {
      return Response.json({ error: "Token does not match this room" }, { status: 403 })
    }

    // 3. Generate a viewer user ID
    const viewerUserId = `viewer_${payload.email.replace(/[^a-zA-Z0-9]/g, "_")}`

    // 4. Ensure the room exists and grant read-only access
    await liveblocks.getOrCreateRoom(room, {
      defaultAccesses: [],
    })

    await liveblocks.updateRoom(room, {
      usersAccesses: {
        [viewerUserId]: ["room:read"],
      },
    })

    // 5. Identify the viewer with user info
    const { avatarColor, cursorColor } = getUserColor(viewerUserId)

    const { status, body: responseBody } = await liveblocks.identifyUser(viewerUserId, {
      userInfo: {
        name: payload.email.split("@")[0] || "Viewer",
        avatar: "",
        avatarColor,
        cursorColor,
      },
    })

    return new Response(responseBody, { status })
  } catch (error) {
    console.error("Viewer Liveblocks auth failed:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
