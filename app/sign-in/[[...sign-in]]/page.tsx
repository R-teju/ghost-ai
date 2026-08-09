import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"
import { History, Share2, FileText, Zap, Users, Lock } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-[#0d0d14] text-zinc-100 antialiased overflow-hidden">
      {/* Animated background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* ── Left panel ── */}
        <div className="hidden lg:flex flex-col justify-between p-14 border-r border-white/5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Ghost icon SVG */}
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/10 blur-sm" />
              <svg
                className="relative z-10 h-7 w-7 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]"
                viewBox="0 0 64 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M32 4C17.088 4 5 16.088 5 31v29l9-7 9 7 9-7 9 7 9-7V31C50 16.088 37.912 4 32 4Z"
                  fill="url(#ghostGrad1)"
                />
                <defs>
                  <linearGradient id="ghostGrad1" x1="5" y1="4" x2="50" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a5b4fc" />
                    <stop offset="1" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                {/* Eyes */}
                <ellipse cx="22" cy="29" rx="4" ry="5" fill="#0d0d14" />
                <ellipse cx="42" cy="29" rx="4" ry="5" fill="#0d0d14" />
                <ellipse cx="22" cy="29" rx="2" ry="2.5" fill="#22d3ee" />
                <ellipse cx="42" cy="29" rx="2" ry="2.5" fill="#22d3ee" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">GHOST</span>
              <span className="text-xl font-bold tracking-tight text-cyan-400">AI</span>
            </div>
          </div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center space-y-12 max-w-md my-auto">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5">
                <Zap className="size-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">AI-powered platform</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white leading-[1.15]">
                Design systems at the{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  speed of thought.
                </span>
              </h1>
              <p className="text-zinc-400 text-[15px] leading-relaxed">
                Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-5">
              {[
                {
                  icon: History,
                  title: "AI Architecture Generation",
                  desc: "Describe your system, AI maps it to nodes and edges on a live canvas.",
                },
                {
                  icon: Users,
                  title: "Real-time Collaboration",
                  desc: "Live cursors, presence indicators, and shared node editing across your team.",
                },
                {
                  icon: FileText,
                  title: "Instant Spec Generation",
                  desc: "Export a complete Markdown technical spec directly from the canvas graph.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 group">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-all duration-300">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Ghost AI. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Lock className="size-3" />
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo — mobile only */}
            <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
              <div className="relative flex h-9 w-9 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/10 blur-sm" />
                <svg
                  className="relative z-10 h-6 w-6 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]"
                  viewBox="0 0 64 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M32 4C17.088 4 5 16.088 5 31v29l9-7 9 7 9-7 9 7 9-7V31C50 16.088 37.912 4 32 4Z"
                    fill="url(#ghostGrad2)"
                  />
                  <defs>
                    <linearGradient id="ghostGrad2" x1="5" y1="4" x2="50" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#a5b4fc" />
                      <stop offset="1" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="22" cy="29" rx="4" ry="5" fill="#0d0d14" />
                  <ellipse cx="42" cy="29" rx="4" ry="5" fill="#0d0d14" />
                  <ellipse cx="22" cy="29" rx="2" ry="2.5" fill="#22d3ee" />
                  <ellipse cx="42" cy="29" rx="2" ry="2.5" fill="#22d3ee" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">GHOST</span>
                <span className="text-lg font-bold tracking-tight text-cyan-400">AI</span>
              </div>
            </div>

            {/* Clerk SignIn component */}
            <SignIn
              appearance={{
                theme: dark,
                variables: {
                  colorPrimary: "#6366f1",
                  colorBackground: "#13131f",
                  colorForeground: "#f4f4f5",
                  colorNeutral: "#3f3f46",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox:
                    "w-full shadow-2xl border border-white/8 bg-[#13131f]/90 backdrop-blur-2xl rounded-2xl overflow-hidden",
                  card: "bg-transparent shadow-none border-none p-8 w-full",
                  header: "mb-6",
                  headerTitle:
                    "text-white font-bold text-xl tracking-tight",
                  headerSubtitle: "text-zinc-400 text-sm mt-1",
                  logoBox: "hidden",
                  dividerLine: "bg-white/8",
                  dividerText:
                    "text-zinc-600 uppercase tracking-widest text-[10px] bg-[#13131f]",
                  socialButtonsBlockButton:
                    "border border-white/15 bg-white/5 hover:bg-white/10 text-white hover:text-white transition-all duration-200 rounded-xl h-11 font-medium text-sm",
                  socialButtonsBlockButtonText: "text-white font-medium opacity-100",
                  socialButtonsBlockButtonArrow: "text-zinc-400",
                  formFieldLabel:
                    "text-zinc-400 font-medium text-xs uppercase tracking-wider mb-1.5",
                  formFieldInput:
                    "bg-[#0d0d14] border border-white/10 text-zinc-100 placeholder-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl h-11 text-sm transition-all duration-200",
                  formFieldInputShowPasswordButton: "text-zinc-500 hover:text-zinc-300",
                  formButtonPrimary:
                    "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold border-none transition-all duration-200 rounded-xl h-11 text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer w-full",
                  footerActionText: "text-zinc-500 text-sm",
                  footerActionLink:
                    "text-indigo-400 hover:text-indigo-300 font-semibold transition-colors",
                  footer: "bg-transparent border-t border-white/5 pt-4",
                  identityPreviewText: "text-zinc-300",
                  identityPreviewEditButtonLink:
                    "text-indigo-400 hover:text-indigo-300",
                  formResendCodeLink: "text-indigo-400 hover:text-indigo-300",
                  otpCodeFieldInput:
                    "border border-white/10 bg-[#0d0d14] text-zinc-100 rounded-xl",
                  alertText: "text-sm",
                  internal_backLink: "text-indigo-400",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
