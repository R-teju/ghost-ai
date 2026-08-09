"use client"

import * as React from "react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { History, Share2, FileText, Loader2, AlertCircle } from "lucide-react"

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [localError, setLocalError] = React.useState("")

  const loading = fetchStatus === "fetching"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn) return

    setLocalError("")

    try {
      await signIn.password({
        emailAddress: email,
        password,
      })

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/editor")
            if (url.startsWith("http")) {
              window.location.href = url
            } else {
              router.push(url)
            }
          },
        })
      } else {
        setLocalError(`Authentication did not complete. Status: ${signIn.status}`)
      }
    } catch (err: any) {
      console.error(err)
      setLocalError(err.message || "Invalid email or password.")
    }
  }

  const errs = errors as any
  const activeError = errs?.global?.[0]?.message || errs?.raw?.[0]?.message || localError

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-zinc-950 text-zinc-100 antialiased select-none">
      {/* Left panel: Info (Visible only on large screens) */}
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-zinc-900 bg-zinc-950">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/25">
            G
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Ghost AI</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center space-y-10 max-w-md my-auto">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Design systems at the speed of thought.
            </h1>
            <p className="text-zinc-400 text-[15px] leading-relaxed">
              Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                <History className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  AI Architecture Generation
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Describe your system, AI maps it to nodes and edges on a live canvas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                <Share2 className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Real-time Collaboration
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Live cursors, presence indicators, and shared node editing across your team.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                <FileText className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Instant Spec Generation
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Export a complete Markdown technical spec directly from the canvas graph.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Ghost AI. All rights reserved.
        </div>
      </div>

      {/* Right panel: Custom credentials form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Logo only shown on small screens */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/25">
              G
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Ghost AI</span>
          </div>
          
          <div className="w-full border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 space-y-6 shadow-xl shadow-black/40">
            <div className="space-y-1.5 text-center">
              <h2 className="text-xl font-bold tracking-tight text-white">Sign in to your account</h2>
              <p className="text-xs text-zinc-400">Enter your credentials below to access the editor.</p>
            </div>

            {activeError && (
              <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-lg flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{activeError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="email-input" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                {errs?.fields?.emailAddress && (
                  <span className="text-[10px] text-red-450 mt-1">{errs.fields.emailAddress.message}</span>
                )}
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="password-input" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                  Password
                </label>
                <input
                  id="password-input"
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                {errs?.fields?.password && (
                  <span className="text-[10px] text-red-450 mt-1">{errs.fields.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm h-10 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
