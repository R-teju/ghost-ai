"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Eye, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react"

// Lazy import the viewer workspace to keep the initial page bundle small
const ViewerWorkspace = React.lazy(() =>
  import("@/components/viewer/viewer-workspace").then((mod) => ({
    default: mod.ViewerWorkspace,
  }))
)

export default function ViewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const [projectId, setProjectId] = React.useState<string>("")

  React.useEffect(() => {
    params.then((p) => setProjectId(p.projectId))
  }, [params])

  if (!projectId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 className="size-5 animate-spin text-indigo-400" />
      </div>
    )
  }

  return <ViewPageInner projectId={projectId} />
}

function ViewPageInner({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("token") || ""

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  // Authenticated viewer state
  const [viewerToken, setViewerToken] = React.useState("")
  const [projectName, setProjectName] = React.useState("")

  // Pre-fill email from invite token
  React.useEffect(() => {
    if (inviteToken) {
      // We don't know the email from the token alone, but we can try to
      // decode it from the URL or let the user fill it in
    }
  }, [inviteToken])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/view/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          email: trimmedEmail,
          password,
          inviteToken: inviteToken || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Verification failed")
      }

      setViewerToken(data.token)
      setProjectName(data.projectName)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // If authenticated, render the viewer workspace
  if (viewerToken && projectName) {
    return (
      <React.Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400 gap-2">
            <Loader2 className="size-5 animate-spin text-indigo-400" />
            <span className="text-sm">Loading viewer...</span>
          </div>
        }
      >
        <ViewerWorkspace
          projectId={projectId}
          projectName={projectName}
          viewerEmail={email.trim().toLowerCase()}
          viewerToken={viewerToken}
        />
      </React.Suspense>
    )
  }

  // Login form
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 px-4 select-none relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 mb-4">
            G
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Ghost AI</h1>
          <p className="text-sm text-zinc-500 mt-1">Live Canvas Viewer</p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
            <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Eye className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Enter Viewer Access</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Enter your email and the room password shared by the project owner.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="viewer-email"
                className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider"
              >
                Your Email
              </label>
              <input
                id="viewer-email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 px-3 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Room Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="viewer-password"
                className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Lock className="size-3" />
                Room Password
              </label>
              <input
                id="viewer-password"
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="w-full h-10 px-3 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/40 rounded-lg">
                <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-[11px] text-red-300 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  View Live Canvas
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-zinc-600 mt-6">
          You need an invitation from the project owner to access this canvas.
        </p>
      </div>
    </div>
  )
}
