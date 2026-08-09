import { prisma } from "./prisma"

export async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getSharedProjects(email: string) {
  return prisma.project.findMany({
    where: {
      collaborators: {
        some: {
          email: email,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
