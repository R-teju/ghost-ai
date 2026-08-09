import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"
import { History, Share2, FileText } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-zinc-950 text-zinc-100 antialiased">
      {/* Left panel: Info (Visible only on large screens) */}
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-border bg-zinc-950">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md shadow-primary/25">
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

      {/* Right panel: Form (Centered on all screens) */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Logo only shown on small screens */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-md shadow-primary/25">
              G
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Ghost AI</span>
          </div>
          
          <SignUp
            appearance={{
              theme: dark,
              variables: {
                colorPrimary: "var(--primary)",
                colorBackground: "var(--card)",
                colorForeground: "var(--foreground)",
                colorMutedForeground: "var(--muted-foreground)",
                colorBorder: "var(--border)",
                colorInput: "var(--background)",
                colorInputForeground: "var(--foreground)",
              },
              elements: {
                cardBox: "shadow-2xl border border-border bg-card rounded-xl overflow-hidden w-full",
                card: "bg-card shadow-none border-none p-8 w-full",
                socialButtonsBlockButton: "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 rounded-lg w-full",
                socialButtonsBlockButtonText: "text-secondary-foreground font-medium",
                formButtonPrimary: "bg-primary hover:bg-primary/95 text-primary-foreground font-semibold border-none transition-all duration-200 rounded-lg shadow-md shadow-primary/10 hover:shadow-primary/20 h-10 cursor-pointer w-full",
                footerActionText: "text-muted-foreground text-sm",
                footerActionLink: "text-primary hover:text-primary/90 hover:underline font-semibold",
                dividerLine: "bg-border/60",
                dividerText: "text-muted-foreground uppercase tracking-widest text-[10px]",
                formFieldLabel: "text-foreground font-medium text-xs mb-1.5",
                formFieldInput: "bg-background border border-border text-foreground focus:border-primary/50 rounded-lg h-10 placeholder-zinc-600 transition-colors w-full",
                identityPreviewText: "text-foreground",
                identityPreviewEditButtonLink: "text-primary hover:underline",
                formHeaderTitle: "text-foreground font-bold text-xl tracking-tight",
                formHeaderSubtitle: "text-muted-foreground text-sm",
                headerTitle: "text-foreground font-bold text-xl tracking-tight",
                headerSubtitle: "text-muted-foreground text-sm",
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
