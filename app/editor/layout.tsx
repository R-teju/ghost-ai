import * as React from "react"
import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { EditorShell } from "@/components/editor/editor-shell"
import { getProjects, getSharedProjects } from "@/lib/projects"

export const metadata = {
  title: "Editor - Ghost AI",
  description: "Ghost AI agent workspace and canvas.",
}

interface EditorLayoutProps {
  children: React.ReactNode
}

export default async function EditorLayout({ children }: EditorLayoutProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress || ""

  const ownedProjects = await getProjects(userId)
  const sharedProjects = email ? await getSharedProjects(email) : []

  // Serialize Date objects to strings for Client Component boundary safety
  const serializeProject = (p: any) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  })

  const serializedOwned = ownedProjects.map(serializeProject)
  const serializedShared = sharedProjects.map(serializeProject)

  return (
    <EditorShell
      initialOwnedProjects={serializedOwned}
      initialSharedProjects={serializedShared}
    >
      {children}
    </EditorShell>
  )
}
