import * as React from "react"
import { EditorShell } from "@/components/editor/editor-shell"

export const metadata = {
  title: "Editor - Ghost AI",
  description: "Ghost AI agent workspace and canvas.",
}

interface EditorLayoutProps {
  children: React.ReactNode
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return <EditorShell>{children}</EditorShell>
}
