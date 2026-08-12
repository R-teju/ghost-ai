import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createProjectSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return Response.json(projects)
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Body may be empty
    }

    const result = createProjectSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: "Invalid fields", details: result.error.format() }, { status: 400 })
    }

    const { id, name, description } = result.data

    const project = await prisma.project.create({
      data: {
        id: id || undefined,
        ownerId: userId,
        name: name,
        description: description || null,
        status: "DRAFT",
      },
    })

    return Response.json(project)
  } catch (error) {
    console.error("Failed to create project:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
