"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PanelLeftOpen, PanelLeftClose } from "lucide-react"

interface EditorNavbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({ sidebarOpen, onToggleSidebar }: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-md select-none">
      {/* Left Section: Sidebar Toggle Button */}
      <div className="flex items-center gap-2">
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
      </div>

      {/* Center Section: Project Title */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-tight text-zinc-200">
          Untitled Project
        </span>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 uppercase">
          Draft
        </span>
      </div>

      {/* Right Section: Empty placeholder for future actions */}
      <div className="flex items-center gap-2 w-[32px] justify-end" />
    </header>
  )
}
