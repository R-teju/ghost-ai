import { auth, createClerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export interface ClerkIdentity {
  userId: string | null
  email: string | null
}

/**
 * Retrieves the currently authenticated user's ID and primary email from Clerk.
 */
export async function getClerkIdentity(): Promise<ClerkIdentity> {
  const { userId } = await auth()
  if (!userId) {
    return { userId: null, email: null }
  }

  try {
    const user = await clerk.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress || null
    return { userId, email }
  } catch (error) {
    console.error("Error fetching Clerk identity:", error)
    return { userId, email: null }
  }
}

/**
 * Checks if the current authenticated user has access to the specified project.
 * User must either be the project owner or listed as an active collaborator.
 */
export async function checkProjectAccess(projectId: string) {
  const { userId, email } = await getClerkIdentity()
  if (!userId) {
    return { hasAccess: false, project: null, isOwner: false }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return { hasAccess: false, project: null, isOwner: false }
  }

  // Owner check
  if (project.ownerId === userId) {
    return { hasAccess: true, project, isOwner: true }
  }

  // Collaborator check
  if (email) {
    const collab = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    })
    if (collab) {
      return { hasAccess: true, project, isOwner: false }
    }
  }

  return { hasAccess: false, project: null, isOwner: false }
}
