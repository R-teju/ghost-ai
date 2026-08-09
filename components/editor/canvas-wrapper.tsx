"use client"

import * as React from "react"
import { ClientSideSuspense } from "@liveblocks/react"
import { LiveCanvas } from "./live-canvas"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught Liveblocks connection error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

interface CanvasWrapperProps {
  roomId: string
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  const errorFallback = (
    <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 p-6 text-center select-none border border-zinc-900 rounded-2xl">
      <div className="size-12 rounded-xl bg-red-950/40 border border-red-900/40 flex items-center justify-center text-red-400 mb-4 shadow-lg">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-200">Collaboration Connection Lost</h3>
      <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
        We encountered an error authenticating or establishing collaboration connection channels.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-200 hover:text-white px-3.5 h-8.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors shadow-md"
      >
        <RefreshCw className="size-3.5" />
        Retry Connection
      </button>
    </div>
  )

  return (
    <ErrorBoundary fallback={errorFallback}>
      <ClientSideSuspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-zinc-950/10 text-zinc-500 rounded-2xl">
            <Loader2 className="size-6 animate-spin text-teal-400" />
            <span className="ml-2.5 text-xs font-medium">Entering diagram room...</span>
          </div>
        }
      >
        <LiveCanvas />
      </ClientSideSuspense>
    </ErrorBoundary>
  )
}
