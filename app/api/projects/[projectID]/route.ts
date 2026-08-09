import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
})

export async function PATCH(
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
    })

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Empty body
    }

    const result = updateProjectSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: "Invalid name", details: result.error.format() }, { status: 400 })
    }

    const updated = await prisma.project.update({
      where: { id: projectID },
      data: {
        name: result.data.name,
      },
    })

    return Response.json(updated)
  } catch (error) {
    console.error("Failed to update project:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
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
    })

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.project.delete({
      where: { id: projectID },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
