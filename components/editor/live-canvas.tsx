"use client"

import * as React from "react"
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useStatus } from "@liveblocks/react"
import { CanvasNode } from "./canvas-node"
import { CanvasEdge } from "./canvas-edge"
import { CanvasNode as CanvasNodeType, CanvasEdge as CanvasEdgeType } from "@/types/canvas"
import { Wifi, WifiOff, ZoomIn, ZoomOut, Maximize, Undo2, Redo2, Loader2 } from "lucide-react"
import { useUndo, useRedo, useCanUndo, useCanRedo, useOthers, useStorage } from "@/liveblocks.config"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useProjects } from "@/lib/project-context"
import { StarterTemplatesModal } from "./starter-templates-modal"
import { CanvasTemplate } from "./starter-templates"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = {
  canvasNode: CanvasNode,
}

const edgeTypes = {
  canvasEdge: CanvasEdge,
}

// Shape panel items with default proportions
const SHAPES = [
  {
    name: "rectangle",
    width: 130,
    height: 65,
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="12" rx="2" />
      </svg>
    ),
  },
  {
    name: "diamond",
    width: 105,
    height: 105,
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3L21 12L12 21L3 12Z" />
      </svg>
    ),
  },
  {
    name: "circle",
    width: 85,
    height: 85,
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    name: "pill",
    width: 125,
    height: 48,
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="8" rx="4" />
      </svg>
    ),
  },
  {
    name: "cylinder",
    width: 95,
    height: 75,
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V6" />
      </svg>
    ),
  },
  {
    name: "hexagon",
    width: 105,
    height: 75,
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2Z" />
      </svg>
    ),
  },
]

// Collaborative Cursors overlay component for multiplayer cursor rendering
function CollaborativeCursors({
  reactFlowInstance,
  reactFlowWrapper,
}: {
  reactFlowInstance: any
  reactFlowWrapper: React.RefObject<HTMLDivElement | null>
}) {
  const others = useOthers()
  const [rect, setRect] = React.useState<DOMRect | null>(null)

  React.useEffect(() => {
    if (!reactFlowWrapper.current) return

    setRect(reactFlowWrapper.current.getBoundingClientRect())

    const updateRect = () => {
      if (reactFlowWrapper.current) {
        setRect(reactFlowWrapper.current.getBoundingClientRect())
      }
    }

    window.addEventListener("resize", updateRect)
    window.addEventListener("scroll", updateRect, true)

    const observer = new ResizeObserver(updateRect)
    observer.observe(reactFlowWrapper.current)

    return () => {
      window.removeEventListener("resize", updateRect)
      window.removeEventListener("scroll", updateRect, true)
      observer.disconnect()
    }
  }, [reactFlowWrapper])

  if (!reactFlowInstance || !reactFlowWrapper?.current || !rect) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {others.map(({ connectionId, presence, info, id }) => {
        if (!presence || !presence.cursor) return null

        // Project flow coordinates to screen positions
        const screenPos = reactFlowInstance.flowToScreenPosition(presence.cursor)
        const left = screenPos.x - rect.left
        const top = screenPos.y - rect.top

        // Don't render outside the bounding box
        if (left < 0 || top < 0 || left > rect.width || top > rect.height) return null

        // Detect if user is the AI design agent
        const isAi = id === "ghost-ai-agent"
        const name = isAi ? "Ghost AI" : (info?.name || "Collaborator")
        const cursorColor = isAi ? "#8b5cf6" : (info?.cursorColor || "#3b82f6")

        return (
          <div
            key={connectionId}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left,
              top,
            }}
          >
            {/* Cursor SVG */}
            <svg
              className="size-5 filter drop-shadow-md"
              viewBox="0 0 24 24"
              fill={cursorColor}
              stroke="white"
              strokeWidth="1.5"
            >
              <path d="M5.653 20.25c-.253 0-.5-.078-.71-.237a1.127 1.127 0 0 1-.417-.89V4.877c0-.395.206-.76.545-.96a1.077 1.077 0 0 1 1.085-.027l12.44 6.945c.34.19.553.555.556.953.003.398-.205.766-.547.969L8.358 19.866c-.207.123-.448.384-.705.384z" />
            </svg>

            {/* Avatar / Name Label */}
            <div
              className="ml-3.5 px-2 py-0.5 rounded text-[10px] font-semibold text-white shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              style={{ backgroundColor: cursorColor }}
            >
              {presence.isThinking && (
                <Loader2 className="size-2.5 animate-spin text-white" />
              )}
              <span>{name}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function LiveCanvasInner() {
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)
  const nodeCounter = React.useRef(0)

  // Local drag-and-drop ghost tracking states
  const [draggedShape, setDraggedShape] = React.useState<{
    shape: string
    width: number
    height: number
  } | null>(null)
  const [ghostPosition, setGhostPosition] = React.useState<{ x: number; y: number } | null>(null)

  // 1. Sync React Flow with Liveblocks
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: {
        initial: [] as CanvasNodeType[],
      },
      edges: {
        initial: [] as CanvasEdgeType[],
      },
    })

  const reactFlow = useReactFlow()
  const { setNodes, setEdges } = reactFlow
  const status = useStatus()

  const aiStatus = useStorage((root: any) => {
    if (!root) return null
    return root["ai-status"] || (root.get ? root.get("ai-status") : null)
  })

  // Project context state for starter templates modal
  const { starterTemplatesOpen, setStarterTemplatesOpen } = useProjects()

  // Dynamic template loader via custom window event
  React.useEffect(() => {
    const handleLoadTemplate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        const { nodes, edges } = customEvent.detail
        setNodes(nodes)
        setEdges(edges)
      }
    }
    window.addEventListener("load-template", handleLoadTemplate)
    return () => {
      window.removeEventListener("load-template", handleLoadTemplate)
    }
  }, [setNodes, setEdges])

  // Import template handler
  const handleImportTemplate = React.useCallback(
    (template: CanvasTemplate) => {
      setNodes(template.nodes)
      setEdges(template.edges)
    },
    [setNodes, setEdges]
  )

  // Liveblocks history hooks
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  // Register keyboard shortcuts hook
  useKeyboardShortcuts(reactFlow, { undo, redo })

  // 2. Loose connection banner UI
  const showConnectionBanner = status !== "connected"
  const isDisconnected = status === "disconnected"

  // 3. Drag and Drop handlers
  const onDragStart = (event: React.DragEvent, shapeName: string, width: number, height: number) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ shape: shapeName, width, height })
    )
    event.dataTransfer.effectAllowed = "move"
    setDraggedShape({ shape: shapeName, width, height })
  }

  const onDragOver = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"

      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        setGhostPosition(position)
      }
    },
    [reactFlowInstance]
  )

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDraggedShape(null)
      setGhostPosition(null)

      const dataStr = event.dataTransfer.getData("application/reactflow")
      if (!dataStr) return

      try {
        const { shape, width, height } = JSON.parse(dataStr)
        if (!reactFlowInstance || !reactFlowWrapper.current) return

        // Translate drop coordinates into canvas viewport coords
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        // Generate ID shape_timestamp_counter
        const id = `${shape}_${Date.now()}_${nodeCounter.current++}`

        const newNode: CanvasNodeType = {
          id,
          type: "canvasNode",
          position,
          style: {
            width,
            height,
          },
          data: {
            label: "", // Empty label
            shape,
            color: "zinc", // Default color theme (zinc)
          },
        }

        setNodes((nds) => nds.concat(newNode))
      } catch (err) {
        console.error("Failed to parse shape drop payload", err)
      }
    },
    [reactFlowInstance, setNodes]
  )

  // 4. Client-side local-only list of nodes combining live nodes and active drag previews
  const displayNodes = React.useMemo(() => {
    if (draggedShape && ghostPosition) {
      const ghostNode: CanvasNodeType = {
        id: "__ghost_preview__",
        type: "canvasNode",
        position: ghostPosition,
        style: {
          width: draggedShape.width,
          height: draggedShape.height,
        },
        data: {
          label: "",
          shape: draggedShape.shape as any,
          color: "zinc",
          isGhost: true,
        },
      }
      return [...nodes, ghostNode]
    }
    return nodes
  }, [nodes, draggedShape, ghostPosition])

  return (
    <div className="w-full h-full relative flex flex-col bg-zinc-950" ref={reactFlowWrapper}>
      {/* Collaborative Cursors */}
      <CollaborativeCursors
        reactFlowInstance={reactFlowInstance}
        reactFlowWrapper={reactFlowWrapper}
      />

      {/* AI Status Banner */}
      {aiStatus && aiStatus.step !== "complete" && aiStatus.step !== "failed" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d11]/90 border border-indigo-500/30 text-zinc-100 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs backdrop-blur-md animate-pulse">
          <Loader2 className="size-3.5 animate-spin text-indigo-400" />
          <span className="font-medium tracking-tight select-none">{aiStatus.message}</span>
        </div>
      )}

      {/* Loose connection warning banner */}
      {showConnectionBanner && (
        <div className="absolute top-4 left-4 z-50 bg-yellow-950/85 border border-yellow-800 text-yellow-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md animate-pulse">
          {isDisconnected ? (
            <>
              <WifiOff className="size-4 text-red-400" />
              <span>Offline: Disconnected from canvas</span>
            </>
          ) : (
            <>
              <Wifi className="size-4 text-yellow-400" />
              <span>Connecting: Sync state is loose ({status})...</span>
            </>
          )}
        </div>
      )}

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: "canvasEdge",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#71717a",
            },
          }}
          onInit={setReactFlowInstance}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          className="bg-zinc-950"
        >
          {/* MiniMap */}
          <MiniMap
            style={{
              background: "#09090b",
              border: "1px solid #1f1f23",
              borderRadius: "0.75rem",
            }}
            nodeColor={() => "#27272a"}
            nodeStrokeColor={() => "#3f3f46"}
            maskColor="rgba(0, 0, 0, 0.5)"
          />

          {/* Dot background pattern */}
          <Background variant={BackgroundVariant.Dots} color="#27272a" gap={20} size={1.2} />
        </ReactFlow>
      </div>

      {/* Floating Pill control bar (zoom & history) */}
      <div 
        className="absolute bottom-[88px] left-6 z-50 bg-[#0d0d11]/95 border border-zinc-800/80 rounded-full p-1.5 shadow-2xl backdrop-blur-sm flex items-center gap-1 select-none"
      >
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => reactFlow.zoomOut({ duration: 300 })}
            title="Zoom Out (-)"
            className="size-8 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            onClick={() => reactFlow.fitView({ duration: 300 })}
            title="Fit View"
            className="size-8 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <Maximize className="size-4" />
          </button>
          <button
            onClick={() => reactFlow.zoomIn({ duration: 300 })}
            title="Zoom In (+)"
            className="size-8 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <ZoomIn className="size-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-zinc-800/80 mx-1" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="size-8 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 disabled:text-zinc-600 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="size-8 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 disabled:text-zinc-600 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Floating Pill shapes toolbar */}
      <div 
        className="z-50 bg-zinc-900/90 border border-zinc-800 rounded-full py-2.5 px-5 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center gap-4 select-none"
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-r border-zinc-800 pr-3.5">
          Shapes
        </span>
        <div className="flex items-center gap-2.5">
          {SHAPES.map((shape) => (
            <div
              key={shape.name}
              draggable
              onDragStart={(e) => onDragStart(e, shape.name, shape.width, shape.height)}
              onDragEnd={() => {
                setDraggedShape(null)
                setGhostPosition(null)
              }}
              className="size-9 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5"
              title={`Drag ${shape.name}`}
            >
              {shape.icon}
            </div>
          ))}
        </div>
      </div>

      <StarterTemplatesModal
        isOpen={starterTemplatesOpen}
        onOpenChange={setStarterTemplatesOpen}
        onImport={handleImportTemplate}
      />
    </div>
  )
}

export function LiveCanvas() {
  return (
    <ReactFlowProvider>
      <LiveCanvasInner />
    </ReactFlowProvider>
  )
}
