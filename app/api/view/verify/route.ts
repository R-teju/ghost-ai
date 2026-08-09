import { prisma } from "@/lib/prisma"
import { createViewerToken } from "@/lib/viewer-token"
import { z } from "zod"

const verifySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Room password is required"),
  inviteToken: z.string().optional(),
})

/**
 * POST: Verify a viewer's email + room password and issue a signed viewer JWT.
 * This endpoint is PUBLIC (no Clerk auth required).
 */
export async function POST(request: Request) {
  try {
    let body: unknown = {}
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 })
    }

    const result = verifySchema.safeParse(body)
    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { projectId, email, password, inviteToken } = result.data

    // 1. Find the project and verify room password
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, roomPassword: true },
    })

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    if (!project.roomPassword) {
      return Response.json(
        { error: "This project has not set up a room password yet. Contact the project owner." },
        { status: 403 }
      )
    }

    if (project.roomPassword !== password) {
      return Response.json({ error: "Incorrect room password" }, { status: 403 })
    }

    // 2. Find or auto-create collaborator record when room password is correct
    let collaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        email: { equals: email, mode: "insensitive" },
      },
    })

    if (!collaborator) {
      // Allow access with valid room password and record viewer in database
      collaborator = await prisma.projectCollaborator.create({
        data: {
          projectId,
          email,
          inviteStatus: "ACCEPTED",
        },
      })
    } else if (collaborator.inviteStatus === "PENDING") {
      // Mark invitation as ACCEPTED
      await prisma.projectCollaborator.update({
        where: { id: collaborator.id },
        data: { inviteStatus: "ACCEPTED" },
      })
    }

    // 5. Issue a signed viewer token
    const viewerToken = await createViewerToken(projectId, email)

    return Response.json({
      token: viewerToken,
      projectName: project.name,
    })
  } catch (error) {
    console.error("Viewer verification failed:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
