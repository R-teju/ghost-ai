import { auth, createClerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const passwordSchema = z.object({
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(64, "Password must be at most 64 characters"),
})

/**
 * GET: Owner retrieves the current room password.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectID: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectID } = await params

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectID },
      select: { ownerId: true, roomPassword: true },
    })

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    return Response.json({ password: project.roomPassword || "" })
  } catch (error) {
    console.error("Failed to fetch room password:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/**
 * PUT: Owner sets or updates the room password.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectID: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectID } = await params

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectID },
      select: { ownerId: true },
    })

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    let body: unknown = {}
    try {
      body = await request.json()
    } catch {
      // empty body
    }

    const result = passwordSchema.safeParse(body)
    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    await prisma.project.update({
      where: { id: projectID },
      data: { roomPassword: result.data.password },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to set room password:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
