"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PanelLeftOpen, PanelLeftClose, Share2, Sparkles, LayoutTemplate } from "lucide-react"
import { UserButton, useAuth } from "@clerk/nextjs"
import { useProjects } from "@/lib/project-context"
import { ShareDialog } from "./share-dialog"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({ sidebarOpen, onToggleSidebar }: EditorNavbarProps) {
  const { activeProject, aiSidebarOpen, setAiSidebarOpen, setStarterTemplatesOpen } = useProjects()
  const { userId } = useAuth()
  const [isShareOpen, setIsShareOpen] = React.useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-md select-none">
      {/* Left Section: Sidebar Toggle Button and Workspace title */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
        <span className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">
          Workspace
        </span>
      </div>

      {/* Center Section: Project Title */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-tight text-zinc-200">
          {activeProject ? activeProject.name : "Untitled Project"}
        </span>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 uppercase">
          {activeProject ? activeProject.status : "Draft"}
        </span>
      </div>

      {/* Right Section: User Profile, logout and share */}
      <div className="flex items-center gap-2.5 justify-end">
        {activeProject && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStarterTemplatesOpen(true)}
              className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 text-xs font-semibold gap-1.5 h-8 px-3 cursor-pointer"
            >
              <LayoutTemplate className="size-3.5 text-emerald-400" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareOpen(true)}
              className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 text-xs font-semibold gap-1.5 h-8 px-3 cursor-pointer"
            >
              <Share2 className="size-3.5 text-indigo-400" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
              aria-label={aiSidebarOpen ? "Close AI chat" : "Open AI chat"}
              className={cn(
                "h-8 gap-1.5 px-3 rounded-lg border transition-colors cursor-pointer text-xs font-semibold",
                aiSidebarOpen
                  ? "bg-teal-950/30 border-teal-800/60 text-teal-400 hover:bg-teal-950/50"
                  : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100"
              )}
            >
              <Sparkles className="size-3.5" />
              AI
            </Button>
          </>
        )}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7 border border-zinc-800 hover:opacity-85 transition-opacity"
            }
          }}
        />
      </div>

      {/* Share Dialog Modal */}
      {activeProject && userId && (
        <ShareDialog
          isOpen={isShareOpen}
          onOpenChange={setIsShareOpen}
          projectId={activeProject.id}
          currentUserId={userId}
          ownerId={activeProject.ownerId}
          projectName={activeProject.name}
        />
      )}
    </header>
  )
}
