import * as React from "react"
import { useReactFlow } from "@xyflow/react"

interface KeyboardShortcutHandlers {
  undo: () => void
  redo: () => void
}

export function useKeyboardShortcuts(
  reactFlowInstance: ReturnType<typeof useReactFlow> | null,
  { undo, redo }: KeyboardShortcutHandlers
): void {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts while typing in inputs, textareas, or editable elements
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }

      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey

      // 1. Zoom In: "+" or "="
      if (e.key === "+" || e.key === "=") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault()
          reactFlowInstance?.zoomIn({ duration: 300 })
        }
      }

      // 2. Zoom Out: "-"
      if (e.key === "-") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault()
          reactFlowInstance?.zoomOut({ duration: 300 })
        }
      }

      // 3. Undo: Cmd/Ctrl + Z (but NOT shift)
      if (modifierPressed && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // 4. Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (
        (modifierPressed && e.key.toLowerCase() === "z" && e.shiftKey) ||
        (modifierPressed && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [reactFlowInstance, undo, redo])
}
