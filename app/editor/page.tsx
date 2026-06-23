"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DialogPattern } from "@/components/editor/dialog-pattern"
import { Sparkles, Terminal, FileCode2, Play } from "lucide-react"

export default function EditorPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-3.5rem)]">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col border border-zinc-800 bg-zinc-900/30 backdrop-blur-md rounded-xl p-6 relative overflow-hidden">
        {/* Decorative Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        <div className="z-10 flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 animate-pulse">
            <Sparkles className="size-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-400 bg-clip-text text-transparent mb-2">
            Ghost Editor Canvas
          </h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            The workspace environment is active and running. The project sidebar and editor layout boundaries are fully integrated.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="default"
              onClick={() => setDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 gap-2 h-9 text-sm"
            >
              <Play className="size-4 fill-white" />
              Demo Dialog Pattern
            </Button>
            <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 h-9 text-sm">
              Read Docs
            </Button>
          </div>
        </div>
      </div>

      {/* Mini Info Panel */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="border border-zinc-800 bg-zinc-900/30 backdrop-blur-md rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <FileCode2 className="size-4 text-emerald-400" />
            Active Segment
          </h3>
          <div className="space-y-3 text-xs text-zinc-400 font-mono">
            <div className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-lg">
              <span className="text-emerald-400">route:</span> /editor
            </div>
            <div className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-lg">
              <span className="text-emerald-400">layout:</span> server-wrapped
            </div>
            <div className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-lg">
              <span className="text-emerald-400">sidebar:</span> floating-layer
            </div>
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/30 backdrop-blur-md rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Terminal className="size-4 text-indigo-400" />
            Integration Logs
          </h3>
          <div className="h-32 text-[10px] font-mono text-zinc-500 overflow-y-auto space-y-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <div>[system] layout loaded.</div>
            <div>[system] client-shell initialized.</div>
            <div>[system] navbar registered.</div>
            <div>[system] sidebar bound (state: closed).</div>
            <div className="text-emerald-400">[success] canvas ready for tools.</div>
          </div>
        </div>
      </div>

      {/* Dialog Pattern Instance */}
      <DialogPattern
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create New Project"
        description="Launch a new AI agent flow inside your workspace. Enter the project name and description to begin."
        footerActions={
          <>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => setDialogOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Create Project
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="proj-name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 align-baseline">
              Project Name
            </label>
            <Input
              id="proj-name"
              type="text"
              placeholder="e.g. Ghost Assistant"
              className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50"
            />
          </div>
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="proj-desc" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 align-baseline">
              Description
            </label>
            <Textarea
              id="proj-desc"
              rows={3}
              placeholder="Describe what this AI agent does..."
              className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50 resize-none min-h-20"
            />
          </div>
        </div>
      </DialogPattern>
    </div>
  )
}
