"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X, Plus, Share2, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjects } from "@/lib/project-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import { DialogPattern } from "@/components/editor/dialog-pattern"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const router = useRouter()
  const { projects, sharedProjects, activeProject, setActiveProject } = useProjects()
  
  const {
    isCreateOpen,
    setIsCreateOpen,
    createName,
    setCreateName,
    createDescription,
    setCreateDescription,
    previewRoomId,
    isCreating,
    handleOpenCreate,
    handleCreate,

    isRenameOpen,
    setIsRenameOpen,
    renameName,
    setRenameName,
    isRenaming,
    handleOpenRename,
    handleRename,

    isDeleteOpen,
    setIsDeleteOpen,
    deleteName,
    isDeleting,
    handleOpenDelete,
    handleDelete,
  } = useProjectActions()

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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
          <Tabs defaultValue="my-projects" className="w-full flex-1 flex flex-col gap-4 min-h-0">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800/80 shrink-0">
              <TabsTrigger value="my-projects" className="py-1.5 text-xs">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="py-1.5 text-xs">
                Shared
              </TabsTrigger>
            </TabsList>

            {/* My Projects Panel */}
            <TabsContent value="my-projects" className="flex-1 flex flex-col min-h-0 pt-1">
              {projects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-12 text-center text-zinc-500 text-sm select-none">
                  No projects yet.
                </div>
              ) : (
                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setActiveProject(project)
                        onClose() // Close sidebar on select
                        router.push(`/editor/${project.id}`)
                      }}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-colors select-none",
                        activeProject?.id === project.id
                          ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-200"
                          : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100"
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs font-semibold truncate leading-normal flex items-center gap-1.5">
                          {activeProject?.id === project.id && (
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0 inline-block" />
                          )}
                          {project.name}
                        </span>
                        {project.description && (
                          <span className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {project.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenRename(project.id, project.name)
                          }}
                          className="text-zinc-500 hover:text-zinc-300 size-6 hover:bg-zinc-800 rounded"
                          aria-label="Rename project"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDelete(project.id, project.name)
                          }}
                          className="text-zinc-500 hover:text-red-400 size-6 hover:bg-zinc-800 rounded"
                          aria-label="Delete project"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Shared Panel */}
            <TabsContent value="shared" className="flex-1 flex flex-col min-h-0 pt-1">
              {sharedProjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center shrink-0">
                  <div className="flex size-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 mb-4">
                    <Share2 className="size-5" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-200">No shared projects</h3>
                  <p className="mt-1 text-xs text-zinc-500 max-w-[200px]">
                    Projects shared with you by other collaborators will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                  {sharedProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setActiveProject(project)
                        onClose()
                        router.push(`/editor/${project.id}`)
                      }}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-colors select-none",
                        activeProject?.id === project.id
                          ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-200"
                          : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100"
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs font-semibold truncate leading-normal flex items-center gap-1.5">
                          {activeProject?.id === project.id && (
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0 inline-block" />
                          )}
                          {project.name}
                        </span>
                        {project.description && (
                          <span className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {project.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer: New Project Action Button */}
        <div className="border-t border-zinc-800 p-4 bg-zinc-950 shrink-0">
          <Button
            variant="default"
            onClick={() => {
              handleOpenCreate()
              onClose() // Close sidebar so they can see the dialog clearly
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 gap-2 h-9 text-sm cursor-pointer"
          >
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </aside>

      {/* Create Dialog */}
      <DialogPattern
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create New Project"
        description="Launch a new AI agent flow inside your workspace. Enter the project name and description to begin."
        footerActions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCreate}
              disabled={!createName.trim() || isCreating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="sidebar-proj-name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Project Name
            </label>
            <Input
              id="sidebar-proj-name"
              type="text"
              required
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Ghost Assistant"
              className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50"
            />
          </div>
          {previewRoomId && (
            <div className="text-[10px] text-zinc-500 flex flex-col gap-1.5">
              <span className="font-semibold text-zinc-400 uppercase tracking-wider">Room ID Preview</span>
              <code className="bg-zinc-900/60 px-2.5 py-1.5 rounded border border-zinc-800 text-indigo-400 truncate text-[11px]">
                {previewRoomId}
              </code>
            </div>
          )}
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="sidebar-proj-desc" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <Textarea
              id="sidebar-proj-desc"
              rows={3}
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Describe what this AI agent does..."
              className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50 resize-none min-h-20"
            />
          </div>
        </div>
      </DialogPattern>

      {/* Rename Dialog */}
      <DialogPattern
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        title="Rename Project"
        description={`Rename the project "${renameName}".`}
        footerActions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              className="border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="sidebar-rename-form"
              disabled={!renameName.trim() || isRenaming}
              className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </>
        }
      >
        <form
          id="sidebar-rename-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleRename()
          }}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="rename-name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              New Project Name
            </label>
            <Input
              id="rename-name"
              type="text"
              required
              autoFocus
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Project Name"
              className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50"
            />
          </div>
        </form>
      </DialogPattern>

      {/* Delete Dialog */}
      <DialogPattern
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteName}"? This action cannot be undone.`}
        footerActions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </>
        }
      />
    </>
  )
}
