import * as React from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { checkProjectAccess } from "@/lib/project-access"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"

interface PageProps {
  params: Promise<{ roomID: string }>
}

export default async function RoomPage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const { roomID } = await params
  const { hasAccess, project } = await checkProjectAccess(roomID)

  if (!hasAccess || !project) {
    return <AccessDenied />
  }

  const serialized = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }

  return <WorkspaceShell project={serialized} />
}
