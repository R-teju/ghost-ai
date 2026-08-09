import { auth, createClerkClient } from "@clerk/nextjs/server"
import { checkProjectAccess } from "@/lib/project-access"
import { liveblocks, getUserColor } from "@/lib/liveblocks"

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  let room = ""

  try {
    const json = await request.json()
    room = json.room
  } catch {
    // Bad request or empty payload
  }

  if (!room) {
    return Response.json(
      { error: "Room parameter is required" },
      { status: 400 }
    )
  }

  try {
    // Verify project access
    const { hasAccess, project } = await checkProjectAccess(room)

    if (!hasAccess || !project) {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Ensure the Liveblocks room exists
    await liveblocks.getOrCreateRoom(room, {
      defaultAccesses: [],
      usersAccesses: {
        [userId]: ["room:write"],
      },
    })

    // Ensure current user has access
    await liveblocks.updateRoom(room, {
      usersAccesses: {
        [userId]: ["room:write"],
      },
    })

    // Get Clerk user
    const clerkUser = await clerk.users.getUser(userId)

    const displayName =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") ||
      clerkUser.username ||
      "Collaborator"

    const { avatarColor, cursorColor } = getUserColor(userId)

    // Create Liveblocks access-token session
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: displayName,
        avatar: clerkUser.imageUrl,
        avatarColor,
        cursorColor,
      },
    })

    // Give this user access to this room
    session.allow(room, ["*:write"])

    // Authorize
    const { status, body } = await session.authorize()

    return new Response(body, { status })
  } catch (error) {
    console.error(
      "Failed to authenticate with Liveblocks:",
      error
    )

    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}