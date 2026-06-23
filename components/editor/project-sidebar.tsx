"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X, Plus, FolderOpen, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <>
      {/* Sidebar Overlay (subtle backdrop, click outside to close) */}
      <div
        className={cn(
          "fixed inset-0 top-14 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:bg-black/20",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-50 flex w-80 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="text-base font-semibold tracking-tight text-zinc-200">
            Projects
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content: Tabs */}
        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="my-projects" className="w-full h-full flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800/80">
              <TabsTrigger value="my-projects" className="py-1.5 text-xs">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="py-1.5 text-xs">
                Shared
              </TabsTrigger>
            </TabsList>

            {/* My Projects Panel */}
            <TabsContent value="my-projects" className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 mb-4">
                <FolderOpen className="size-5" />
              </div>
              <h3 className="text-sm font-medium text-zinc-200">No projects yet</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-[200px]">
                Create a new project to get started with Ghost AI.
              </p>
            </TabsContent>

            {/* Shared Panel */}
            <TabsContent value="shared" className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 mb-4">
                <Share2 className="size-5" />
              </div>
              <h3 className="text-sm font-medium text-zinc-200">No shared projects</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-[200px]">
                Projects shared with you by other collaborators will appear here.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer: New Project Action Button */}
        <div className="border-t border-zinc-800 p-4 bg-zinc-950">
          <Button
            variant="default"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 gap-2 h-9 text-sm"
          >
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
