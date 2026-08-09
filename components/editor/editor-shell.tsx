"use client"

import * as React from "react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectProvider, Project } from "@/lib/project-context"

interface EditorShellProps {
  children: React.ReactNode
  initialOwnedProjects: Project[]
  initialSharedProjects: Project[]
}

export function EditorShell({
  children,
  initialOwnedProjects,
  initialSharedProjects,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <ProjectProvider
      initialOwned={initialOwnedProjects}
      initialShared={initialSharedProjects}
    >
      <div 
        className="relative flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Top Fixed Navbar */}
        <EditorNavbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Floating Left Project Sidebar */}
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Canvas Content */}
        <main 
          className="flex-1 pt-14 relative w-full flex flex-col overflow-hidden"
          style={{ height: "calc(100vh - 3.5rem)" }}
        >
          {children}
        </main>
      </div>
    </ProjectProvider>
  )
}
