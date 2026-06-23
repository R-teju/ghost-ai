"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface DialogPatternProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children?: React.ReactNode
  footerActions?: React.ReactNode
  showCloseButton?: boolean
}

export function DialogPattern({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footerActions,
  showCloseButton = true,
}: DialogPatternProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className="max-w-md border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-xl shadow-black/40"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold tracking-tight text-zinc-100">
            {title}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        {children && (
          <div className="py-4 text-sm text-zinc-300">
            {children}
          </div>
        )}

        {footerActions && (
          <DialogFooter className="bg-zinc-950/40 border-t border-zinc-800/80 -mx-4 -mb-4 p-4 mt-4 flex justify-end gap-2">
            {footerActions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
