import { auth, createClerkClient } from "@clerk/nextjs/server"
import { checkProjectAccess } from "@/lib/project-access"
import { liveblocks, getUserColor } from "@/lib/liveblocks"

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let room = ""
  try {
    const json = await request.json()
    room = json.room
  } catch {
    // Bad request or empty payload
  }

  if (!room) {
    return Response.json({ error: "Room parameter is required" }, { status: 400 })
  }

  try {
    // 1. Verify project access using the existing access helper
    const { hasAccess, project } = await checkProjectAccess(room)

    // 2. Return 403 for unauthorized project access
    if (!hasAccess || !project) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // 3. Ensure the liveblocks room exists and the user has access
    await liveblocks.getOrCreateRoom(room, {
      defaultAccesses: [], // Private room by default
      usersAccesses: {
        [userId]: ["room:write"],
      },
    })

    // Update permissions in case the room was previously created as private
    await liveblocks.updateRoom(room, {
      usersAccesses: {
        [userId]: ["room:write"],
      },
    })

    // Fetch user details from Clerk
    const clerkUser = await clerk.users.getUser(userId)
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      "Collaborator"

    // Generate colors deterministically
    const { avatarColor, cursorColor } = getUserColor(userId)

    // 4. Return a session token with userInfo details
    const { status, body } = await liveblocks.identifyUser(userId, {
      userInfo: {
        name: displayName,
        avatar: clerkUser.imageUrl,
        avatarColor,
        cursorColor,
      },
    })

    return new Response(body, { status })
  } catch (error) {
    console.error("Failed to authenticate with Liveblocks:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
