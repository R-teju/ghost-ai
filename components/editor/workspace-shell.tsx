"use client"

import * as React from "react"
import { useProjects, Project } from "@/lib/project-context"
import { cn } from "@/lib/utils"
import { PanelRightClose, Send, Loader2, Sparkles, FileText, Download, X, FileCode } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CanvasWrapper } from "./canvas-wrapper"
import { LiveblocksProvider, ClientSideSuspense } from "@liveblocks/react"
import { RoomProvider, useStorage } from "@/liveblocks.config"

interface WorkspaceShellProps {
  project: Project
}

function parseInline(text: string): React.ReactNode[] | string {
  const parts: React.ReactNode[] = []
  let remaining = text
  
  while (remaining.length > 0) {
    const boldIndex = remaining.indexOf("**")
    const codeIndex = remaining.indexOf("`")
    
    if (boldIndex !== -1 && (codeIndex === -1 || boldIndex < codeIndex)) {
      if (boldIndex > 0) {
        parts.push(remaining.substring(0, boldIndex))
      }
      const endBold = remaining.indexOf("**", boldIndex + 2)
      if (endBold !== -1) {
        parts.push(
          <strong key={parts.length} className="font-semibold text-zinc-100">
            {remaining.substring(boldIndex + 2, endBold)}
          </strong>
        )
        remaining = remaining.substring(endBold + 2)
      } else {
        parts.push(remaining.substring(boldIndex))
        remaining = ""
      }
    } else if (codeIndex !== -1 && (boldIndex === -1 || codeIndex < boldIndex)) {
      if (codeIndex > 0) {
        parts.push(remaining.substring(0, codeIndex))
      }
      const endCode = remaining.indexOf("`", codeIndex + 1)
      if (endCode !== -1) {
        parts.push(
          <code key={parts.length} className="bg-zinc-900 border border-zinc-800/80 px-1 py-0.5 rounded font-mono text-[10px] text-teal-400">
            {remaining.substring(codeIndex + 1, endCode)}
          </code>
        )
        remaining = remaining.substring(endCode + 1)
      } else {
        parts.push(remaining.substring(codeIndex))
        remaining = ""
      }
    } else {
      parts.push(remaining)
      remaining = ""
    }
  }
  
  return parts.length > 0 ? parts : text
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null
  
  const lines = text.split("\n")
  let inCodeBlock = false
  const codeBlockContent: string[] = []
  const renderedElements: React.ReactNode[] = []

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false
        const code = codeBlockContent.join("\n")
        codeBlockContent.length = 0
        renderedElements.push(
          <pre key={`code-${index}`} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[10px] font-mono text-zinc-300 overflow-x-auto my-2 select-text">
            <code>{code}</code>
          </pre>
        )
      } else {
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      return
    }

    if (line.startsWith("### ")) {
      renderedElements.push(<h4 key={index} className="text-xs font-bold text-zinc-100 mt-4 mb-2 select-text">{parseInline(line.substring(4))}</h4>)
      return
    }
    if (line.startsWith("## ")) {
      renderedElements.push(<h3 key={index} className="text-sm font-bold text-zinc-50 mt-5 mb-2 select-text">{parseInline(line.substring(3))}</h3>)
      return
    }
    if (line.startsWith("# ")) {
      renderedElements.push(<h2 key={index} className="text-base font-bold text-zinc-50 mt-6 mb-3 select-text">{parseInline(line.substring(2))}</h2>)
      return
    }

    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const content = line.trim().substring(2)
      renderedElements.push(
        <li key={index} className="ml-4 list-disc text-zinc-300 my-1 text-[11px] leading-relaxed select-text">
          {parseInline(content)}
        </li>
      )
      return
    }

    if (line.trim() === "") {
      renderedElements.push(<div key={index} className="h-2" />)
      return
    }

    renderedElements.push(
      <p key={index} className="text-zinc-300 my-2 text-[11px] leading-relaxed select-text">
        {parseInline(line)}
      </p>
    )
  })

  return <React.Fragment>{renderedElements}</React.Fragment>
}

export function WorkspaceShell({ project }: WorkspaceShellProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={project.id}
        initialPresence={{
          cursor: null,
          isThinking: false,
        }}
      >
        <ClientSideSuspense fallback={
          <div className="flex h-screen w-screen bg-zinc-950">
            {/* Canvas skeleton */}
            <div className="flex-1 m-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 animate-pulse" />
          </div>
        }>
          <WorkspaceShellInner project={project} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function WorkspaceShellInner({ project }: WorkspaceShellProps) {
  const { aiSidebarOpen, setAiSidebarOpen } = useProjects()

  const [activeTab, setActiveTab] = React.useState<"architect" | "chat" | "specs">("chat")
  const [selectedSpec, setSelectedSpec] = React.useState<any | null>(null)
  
  // Local spec fallback state if Room Storage is empty
  const [localSpecs, setLocalSpecs] = React.useState<string>(
    `# Specifications for ${project.name}\n\nAsk AI Architect to generate or refine your system architecture to draft technical specifications.`
  )

  // Reactive subscription to Liveblocks Storage for specs list
  const specsList = useStorage((root: any) => {
    if (!root) return []
    return root.specs || (root.get ? root.get("specs") : [])
  }) || []

  const isGeneratingSpec = useStorage((root: any) => {
    if (!root) return false
    return root["is-generating-spec"] || (root.get ? root.get("is-generating-spec") : false)
  }) || false

  const [messages, setMessages] = React.useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Welcome to Ghost AI Workspace! I can help you design architecture diagrams, analyze flow specifications, and setup your backend models for "${project.name}". What would you like to build today?`,
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const chatEndRef = React.useRef<HTMLDivElement>(null)

  // Auto scroll to bottom of chat
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading, activeTab])

  // Trigger Chat completions
  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault()
    const content = customPrompt || input.trim()
    if (!content || isLoading) return

    const newMessages = [...messages, { role: "user", content } as const]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          projectId: project.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to query assistant")
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }])
      
      if (data.specs) {
        setLocalSpecs(data.specs)
      }
      
      if (data.template) {
        window.dispatchEvent(new CustomEvent("load-template", { detail: data.template }))
      }
    } catch (err: any) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an issue generating a response." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Trigger Spec generation task
  const handleGenerateSpec = async () => {
    if (isGeneratingSpec) return

    try {
      const res = await fetch("/api/specs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger specification generation")
      }
    } catch (err: any) {
      console.error("Failed to generate spec:", err)
      alert("Error: " + err.message)
    }
  }

  // Download spec markdown locally
  const handleDownloadSpec = (spec: { name: string; content: string }) => {
    const blob = new Blob([spec.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = spec.name || "spec.md"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const presets = [
    {
      title: "E-Commerce System",
      description: "Setup API Gateway, Auth, Catalog, Cart, and Order pipelines.",
      prompt: "Design a high-scale e-commerce backend architecture. Include an API Gateway, a User Service with Auth, a Product Catalog service using a NoSQL database, and an Order Processing system that communicates via a Message Queue. Don't forget to add a Redis cache for the catalog to handle high traffic."
    },
    {
      title: "CI/CD Pipeline",
      description: "Standard docker build flow with testing and deployment checks.",
      prompt: "Design a CI/CD pipeline featuring code linting, automated unit testing, container build (Docker), and deployment steps targeting staging and production environments."
    },
    {
      title: "Event-Driven Analytics",
      description: "Queue pipelines with ingest consumers and data warehouse.",
      prompt: "Design an event-driven analytics system featuring a high-throughput message queue (like Kafka/RabbitMQ), ingestion consumers, databases for cold storage, and real-time dashboard notification handlers."
    },
    {
      title: "Microservices Platform",
      description: "Service mesh, API gateway, discovery, and observability stack.",
      prompt: "Design a production-grade microservices platform with an API Gateway handling routing and rate-limiting, a Service Registry for discovery, an Auth Service issuing JWT tokens, a Notification Service publishing events, and a centralized Observability stack with logs, metrics, and distributed tracing."
    },
    {
      title: "Real-Time Chat App",
      description: "WebSocket server, presence, message persistence, and push.",
      prompt: "Design a scalable real-time chat application architecture. Include a WebSocket server cluster behind a load balancer, a Presence Service tracking online users with Redis pub/sub, a Message Store backed by a time-series or NoSQL database, and a Push Notification Service for mobile clients."
    },
    {
      title: "ML Training Pipeline",
      description: "Data ingestion, feature store, model training, and serving.",
      prompt: "Design a machine learning training and serving pipeline. Include a Data Ingestion layer pulling from raw sources, a Feature Store for computed features, a Model Training scheduler with GPU workers, a Model Registry to version artifacts, and a low-latency Model Serving API with A/B routing."
    },
  ]

  return (
    <div className="flex-1 flex gap-4 p-4 bg-zinc-950 h-full overflow-hidden" style={{ height: "100%" }}>
      {/* Central Canvas Container Area */}
      <div className="flex-1 border border-zinc-800 bg-zinc-900/10 rounded-2xl overflow-hidden relative h-full flex flex-col">
        <CanvasWrapper roomId={project.id} />
      </div>

      {/* Right Sidebar (AI Workspace) */}
      <aside
        className={cn(
          "h-full border border-zinc-800 bg-zinc-900/10 backdrop-blur-md rounded-2xl flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
          aiSidebarOpen ? "w-80 translate-x-0" : "w-0 border-none translate-x-full overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 p-4 shrink-0 bg-zinc-950/20">
          <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5 select-none">
              AI Workspace
            </h3>
            <span className="text-[10px] text-zinc-500 font-medium select-none">Collaborate with Ghost AI</span>
          </div>
          <button
            onClick={() => setAiSidebarOpen(false)}
            aria-label="Close assistant"
            className="text-zinc-500 hover:text-zinc-200 cursor-pointer rounded p-1 hover:bg-zinc-900/50 transition-colors"
          >
            <PanelRightClose className="size-4" />
          </button>
        </div>

        {/* Tabs Group */}
        <div className="px-4 py-2.5 shrink-0 border-b border-zinc-800/40">
          <div className="flex p-1 bg-zinc-950/60 border border-zinc-800/60 rounded-xl gap-0.5">
            <button
              onClick={() => setActiveTab("architect")}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                activeTab === "architect"
                  ? "bg-zinc-850 text-zinc-100 shadow-sm border border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              AI Architect
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                activeTab === "chat"
                  ? "bg-zinc-850 text-zinc-100 shadow-sm border border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                activeTab === "specs"
                  ? "bg-zinc-850 text-zinc-100 shadow-sm border border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Specs
            </button>
          </div>
        </div>

        {/* Content Section */}
        {activeTab === "specs" ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0 bg-zinc-950/10 select-none">
            {/* Generate Spec Action Button */}
            <Button
              onClick={handleGenerateSpec}
              disabled={isGeneratingSpec}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold h-10 gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingSpec ? (
                <>
                  <Loader2 className="size-4 animate-spin text-white" />
                  Generating Spec...
                </>
              ) : (
                <>
                  <FileCode className="size-4" />
                  Generate Spec
                </>
              )}
            </Button>

            {/* Specs List Cards */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {specsList.length === 0 ? (
                <div className="h-40 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                  <FileText className="size-6 text-zinc-600 mb-2" />
                  <span className="text-[10px] font-semibold text-zinc-400">No specifications generated yet</span>
                  <p className="text-[9px] text-zinc-650 max-w-xs mt-1">Click the button above to analyze the canvas nodes and compile architectural specs.</p>
                </div>
              ) : (
                specsList.map((spec: any, idx: number) => (
                  <div
                    key={spec.id || idx}
                    onClick={() => setSelectedSpec(spec)}
                    className="group border border-zinc-850 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/90 rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 shrink-0">
                        <FileText className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-zinc-200 truncate">{spec.name}</span>
                        <span className="text-[8px] text-zinc-550 mt-0.5">
                          {new Date(spec.createdAt || Date.now()).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadSpec(spec)
                      }}
                      className="size-7 rounded-lg border border-zinc-850 bg-zinc-900/40 hover:bg-indigo-650 text-zinc-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Download Specification"
                    >
                      <Download className="size-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === "architect" ? (
          /* AI Architect Preset Library Panel */
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col min-h-0 bg-zinc-950/10 select-none">
            <div className="text-[10px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Canvas Presets</div>
            {presets.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveTab("chat")
                  handleSendMessage(undefined, preset.prompt)
                }}
                className="group border border-zinc-850 hover:border-indigo-500/30 bg-zinc-950/40 hover:bg-zinc-950/95 rounded-xl p-3.5 flex flex-col transition-all cursor-pointer hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-250 group-hover:text-indigo-400 transition-colors">
                    {preset.title}
                  </span>
                  <Sparkles className="size-3 text-zinc-650 group-hover:text-indigo-400 transition-all group-hover:rotate-12" />
                </div>
                <p className="text-[9px] text-zinc-500 leading-normal mt-1">{preset.description}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Chat tab message history log */
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0 bg-zinc-950/10">
            {messages.map((msg, i) => {
              if (msg.role === "user") {
                return (
                  <div
                    key={i}
                    className="border border-teal-500/30 bg-zinc-900/40 text-zinc-250 rounded-xl p-3.5 text-[10px] leading-relaxed shadow-sm w-full select-text"
                  >
                    {msg.content}
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  className="self-start bg-zinc-900/60 border border-zinc-855 text-zinc-250 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[10px] leading-relaxed shadow-sm max-w-[90%] select-text"
                >
                  <div className="prose prose-sm prose-invert max-w-none space-y-1.5">{renderMarkdown(msg.content)}</div>
                </div>
              )
            })}
            {isLoading && (
              <div className="self-start flex items-center gap-2 text-[9px] text-zinc-550 bg-zinc-900/40 border border-zinc-850 rounded-full px-3 py-1.5 animate-pulse">
                <Loader2 className="size-3 animate-spin text-indigo-400" />
                <span>Ghost AI is generating...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Message form input (only in Chat tab) */}
        {activeTab === "chat" && (
          <form onSubmit={(e) => handleSendMessage(e)} className="p-4 border-t border-zinc-800/80 bg-zinc-950/20 shrink-0 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your system..."
              disabled={isLoading}
              className="flex-1 bg-zinc-950 border-zinc-800 text-xs h-9.5 focus-visible:ring-indigo-500/35 focus-visible:ring-offset-0 placeholder:text-zinc-650"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white size-9.5 p-0 rounded-lg flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        )}
      </aside>

      {/* Render Specification Document View Dialog (Modal) */}
      {selectedSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg h-[500px] max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-zinc-150">{selectedSpec.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSpec(null)}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer rounded p-1 hover:bg-zinc-800/50 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[10px] leading-relaxed text-zinc-300 select-text">
              <div className="prose prose-sm prose-invert max-w-none space-y-3">
                {renderMarkdown(selectedSpec.content)}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end border-t border-zinc-800 p-4 shrink-0 bg-zinc-950/40">
              <button
                onClick={() => handleDownloadSpec(selectedSpec)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold h-9 px-4 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="size-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
