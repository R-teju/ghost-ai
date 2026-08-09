"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Terminal, Loader2 } from "lucide-react"
import { useProjectActions } from "@/hooks/use-project-actions"
import { DialogPattern } from "@/components/editor/dialog-pattern"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function EditorDashboard() {
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
  } = useProjectActions()

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreate()
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
      <div className="max-w-2xl text-center space-y-8 relative z-10">
        {/* Glow Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wide select-none">
            <Terminal className="size-3.5" />
            Next-Gen AI Canvas
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight select-none">
            Create a project or open an existing one
          </h1>
          <p className="text-zinc-400 text-[14px] max-w-lg mx-auto leading-relaxed select-none">
            Start a new architecture workspace, or choose a project from the sidebar
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-4">
          <Button
            variant="default"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 px-6 py-5 rounded-lg flex items-center gap-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-600/30"
          >
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Localized Create Dialog for the dashboard */}
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
              type="submit"
              form="dashboard-create-form"
              disabled={!createName.trim() || isCreating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </>
        }
      >
        <form id="dashboard-create-form" onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="dashboard-proj-name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Project Name
            </label>
            <Input
              id="dashboard-proj-name"
              type="text"
              required
              autoFocus
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
            <label htmlFor="dashboard-proj-desc" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <Textarea
              id="dashboard-proj-desc"
              rows={3}
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Describe what this AI agent does..."
              className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50 resize-none min-h-20"
            />
          </div>
        </form>
      </DialogPattern>
    </div>
  )
}
