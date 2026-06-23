"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Terminal, Layers, Play, Check } from "lucide-react"

export default function Home() {
  const [inputText, setInputText] = React.useState("")
  const [areaText, setAreaText] = React.useState("")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
              <Sparkles className="size-3.5" />
              UI Primitives Installed
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-400 bg-clip-text text-transparent">
              Ghost AI Design System
            </h1>
            <p className="text-zinc-400 max-w-2xl text-lg">
              A premium, high-performance UI library built on React 19, Tailwind CSS v4, and Shadcn primitives.
            </p>
          </div>
          <div className="flex justify-center md:justify-end shrink-0">
            <Link href="/editor">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 h-10 px-6 text-sm font-semibold cursor-pointer">
                Open Editor Workspace
              </Button>
            </Link>
          </div>
        </header>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card Component (takes 2 columns on desktop) */}
          <Card className="md:col-span-2 border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Layers className="size-5 text-indigo-400" />
                    Interactive Playground
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Interact with the newly registered primitive components.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="inputs" className="w-full">
                <TabsList className="bg-zinc-950 border border-zinc-800/80 mb-4">
                  <TabsTrigger value="inputs" className="px-4 py-1.5">Input Controls</TabsTrigger>
                  <TabsTrigger value="buttons" className="px-4 py-1.5">Buttons & Dialogs</TabsTrigger>
                </TabsList>

                {/* Inputs Content */}
                <TabsContent value="inputs" className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Input Primitive
                    </label>
                    <Input
                      type="text"
                      placeholder="Type something here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50"
                    />
                    {inputText && (
                      <p className="text-xs text-indigo-400">Live preview: {inputText}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Textarea Primitive
                    </label>
                    <Textarea
                      placeholder="Describe your AI agent's goals..."
                      rows={4}
                      value={areaText}
                      onChange={(e) => setAreaText(e.target.value)}
                      className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50 resize-none"
                    />
                  </div>
                </TabsContent>

                {/* Buttons & Dialogs Content */}
                <TabsContent value="buttons" className="space-y-6 py-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Button Variants
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="default">Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Dialog Primitive
                    </label>
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                            <Play className="size-4 mr-1.5 fill-white" />
                            Launch Action Dialog
                          </Button>
                        }
                      />
                      <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="size-5 text-indigo-400" />
                            Primitive Configured
                          </DialogTitle>
                          <DialogDescription className="text-zinc-400 pt-1">
                            This dialog confirms that the `@base-ui/react/dialog` and shadcn integration is working flawlessly.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 text-sm text-zinc-300">
                          All Dialog components can render subcomponents, trigger states, animations, overlay backdrops, and close handlers seamlessly.
                        </div>
                        <DialogFooter showCloseButton>
                          <Button variant="outline">Learn More</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t border-zinc-800 bg-zinc-950/40 justify-between">
              <span className="text-xs text-zinc-500">Workspace Status: Stable</span>
              <span className="text-xs text-indigo-400 flex items-center gap-1">
                <Check className="size-3.5" /> Checked & Verified
              </span>
            </CardFooter>
          </Card>

          {/* Scroll Area Card (takes 1 column on desktop) */}
          <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Terminal className="size-5 text-emerald-400" />
                ScrollArea Logs
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Smooth custom scrollbar primitive.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[220px] relative">
              <ScrollArea className="h-[220px] w-full rounded border border-zinc-800 bg-zinc-950/60 p-3 text-xs font-mono text-zinc-400">
                <div className="space-y-2">
                  <div className="text-emerald-400">[info] Initializing system...</div>
                  <div>[info] Loading Tailwind CSS v4 directives</div>
                  <div>[info] Resolving Radix UI components</div>
                  <div>[info] Initializing progress tracker</div>
                  <div>[info] Verifying Button primitives</div>
                  <div>[info] Verifying Card primitives</div>
                  <div>[info] Verifying Dialog primitives</div>
                  <div>[info] Verifying Input primitives</div>
                  <div>[info] Verifying Tabs primitives</div>
                  <div>[info] Verifying Textarea primitives</div>
                  <div>[info] Verifying ScrollArea primitives</div>
                  <div className="text-indigo-400">[success] Design system active!</div>
                  <div>[status] Dark mode: True</div>
                  <div>[status] Path Alias `@/*` verified</div>
                  <div>[status] Reusable cn() helper verified</div>
                  <div className="text-zinc-500">End of system verification log</div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}
