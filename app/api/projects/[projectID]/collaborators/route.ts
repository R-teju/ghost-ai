import { auth, createClerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
})

const removeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
})

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
    })

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    // Verify Access: User is owner OR has their email in ProjectCollaborator
    let isAuthorized = project.ownerId === userId

    if (!isAuthorized) {
      const currentUserObj = await clerk.users.getUser(userId)
      const userEmails = currentUserObj.emailAddresses.map((e) => e.emailAddress.toLowerCase())

      const collabMatch = await prisma.projectCollaborator.findFirst({
        where: {
          projectId: projectID,
          email: {
            in: userEmails,
          },
        },
      })
      if (collabMatch) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Retrieve database collaborators
    const dbCollaborators = await prisma.projectCollaborator.findMany({
      where: { projectId: projectID },
      orderBy: { createdAt: "asc" },
    })

    let enrichedCollaborators = dbCollaborators.map((c) => ({
      id: c.id,
      email: c.email,
      name: null as string | null,
      imageUrl: null as string | null,
      inviteStatus: c.inviteStatus,
    }))

    let ownerDetails = {
      email: "",
      name: "Project Owner",
      imageUrl: null as string | null,
    }

    try {
      const emails = dbCollaborators.map((c) => c.email)
      const clerkUsers = emails.length > 0 ? await clerk.users.getUserList({
        emailAddress: emails,
      }) : { data: [] }

      enrichedCollaborators = dbCollaborators.map((c) => {
        const match = clerkUsers.data.find((u) =>
          u.emailAddresses.some((e) => e.emailAddress.toLowerCase() === c.email.toLowerCase())
        )
        return {
          id: c.id,
          email: c.email,
          name: match ? [match.firstName, match.lastName].filter(Boolean).join(" ") || match.username || null : null,
          imageUrl: match ? match.imageUrl : null,
          inviteStatus: c.inviteStatus,
        }
      })

      const owner = await clerk.users.getUser(project.ownerId)
      if (owner) {
        ownerDetails = {
          email: owner.emailAddresses[0]?.emailAddress || "",
          name: [owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.username || "Project Owner",
          imageUrl: owner.imageUrl,
        }
      }
    } catch (clerkError) {
      console.warn("Clerk profile lookup warning (using DB fallback):", clerkError)
    }

    return Response.json({
      owner: ownerDetails,
      collaborators: enrichedCollaborators,
    })
  } catch (error) {
    console.error("Failed to fetch collaborators:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
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

    // Enforce Ownership
    if (project.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Empty body
    }

    const result = inviteSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 })
    }

    const { email } = result.data

    // Check if trying to invite the owner
    const owner = await clerk.users.getUser(project.ownerId)
    const ownerEmails = owner.emailAddresses.map((e) => e.emailAddress.toLowerCase())
    if (ownerEmails.includes(email)) {
      return Response.json({ error: "You cannot invite the project owner" }, { status: 400 })
    }

    // Check if already exists
    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_email: {
          projectId: projectID,
          email,
        },
      },
    })

    if (existing) {
      return Response.json({ error: "Collaborator already invited" }, { status: 400 })
    }

    // Create collaborator record (inviteToken auto-generated by DB)
    const created = await prisma.projectCollaborator.create({
      data: {
        projectId: projectID,
        email,
      },
    })

    // Send real invitation email via Resend
    const url = new URL(request.url)
    const viewUrl = `${url.origin}/view/${projectID}?token=${created.inviteToken}`
    const inviterName =
      [owner.firstName, owner.lastName].filter(Boolean).join(" ") ||
      owner.username ||
      "Project Owner"

    try {
      const { sendInvitationEmail } = await import("@/lib/mailer")
      const emailResult = await sendInvitationEmail({
        to: email,
        projectName: project.name,
        inviterName,
        viewUrl,
      })

      if (!emailResult.success) {
        console.warn("Invitation email failed:", emailResult.error)
      }
    } catch (emailError) {
      console.warn("Failed to send invitation email:", emailError)
    }

    // Fetch Clerk info for newly invited collaborator if available
    const clerkUserList = await clerk.users.getUserList({ emailAddress: [email] })
    const match = clerkUserList.data[0]

    return Response.json({
      id: created.id,
      email: created.email,
      name: match ? [match.firstName, match.lastName].filter(Boolean).join(" ") || match.username || null : null,
      imageUrl: match ? match.imageUrl : null,
      inviteStatus: created.inviteStatus,
    })
  } catch (error) {
    console.error("Failed to invite collaborator:", error)
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

    // Enforce Ownership
    if (project.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Empty body
    }

    const result = removeSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 })
    }

    const { email } = result.data

    await prisma.projectCollaborator.delete({
      where: {
        projectId_email: {
          projectId: projectID,
          email,
        },
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to remove collaborator:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
