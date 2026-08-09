"use client"

import * as React from "react"
import Link from "next/link"
import { Lock, ArrowLeft } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-[calc(100vh-3.5rem)] bg-zinc-950 px-6 select-none relative overflow-hidden">
      {/* Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 text-center space-y-6 shadow-xl shadow-black/40 relative z-10">
        <div className="mx-auto size-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <Lock className="size-6" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">Access Denied</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            You do not have permission to view this project, or the project does not exist.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/editor"
            className="w-full flex items-center justify-center gap-2 h-10 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/50 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
