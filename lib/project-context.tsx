"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string | null
  status: "DRAFT" | "ARCHIVED"
  canvasJsonPath: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectContextType {
  projects: Project[]
  sharedProjects: Project[]
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
  aiSidebarOpen: boolean
  setAiSidebarOpen: (open: boolean) => void
  starterTemplatesOpen: boolean
  setStarterTemplatesOpen: (open: boolean) => void
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({
  children,
  initialOwned = [],
  initialShared = [],
}: {
  children: React.ReactNode
  initialOwned?: Project[]
  initialShared?: Project[]
}) {
  const [projects, setProjects] = React.useState<Project[]>(initialOwned)
  const [sharedProjects, setSharedProjects] = React.useState<Project[]>(initialShared)
  const [activeProject, setActiveProject] = React.useState<Project | null>(null)
  const [aiSidebarOpen, setAiSidebarOpen] = React.useState(false)
  const [starterTemplatesOpen, setStarterTemplatesOpen] = React.useState(false)
  const pathname = usePathname()

  // Keep state in sync with server props
  React.useEffect(() => {
    setProjects(initialOwned)
    setSharedProjects(initialShared)
  }, [initialOwned, initialShared])

  // Sync active project with current pathname (/editor/[projectID])
  React.useEffect(() => {
    const parts = pathname.split("/")
    if (parts[1] === "editor" && parts[2]) {
      const id = parts[2]
      const found = projects.find((p) => p.id === id) || sharedProjects.find((p) => p.id === id)
      if (found) {
        setActiveProject(found)
      } else {
        setActiveProject(null)
      }
    } else {
      setActiveProject(null)
    }
  }, [pathname, projects, sharedProjects])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        sharedProjects,
        activeProject,
        setActiveProject,
        aiSidebarOpen,
        setAiSidebarOpen,
        starterTemplatesOpen,
        setStarterTemplatesOpen,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = React.useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}
