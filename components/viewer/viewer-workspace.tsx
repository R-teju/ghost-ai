"use client"

import * as React from "react"
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from "@xyflow/react"
import { LiveblocksProvider, RoomProvider, useStatus, ClientSideSuspense } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { CanvasNode } from "@/components/editor/canvas-node"
import { CanvasEdge } from "@/components/editor/canvas-edge"
import { CanvasNode as CanvasNodeType, CanvasEdge as CanvasEdgeType } from "@/types/canvas"
import { Eye, Wifi, WifiOff, Loader2, Lock } from "lucide-react"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = {
  canvasNode: CanvasNode,
}

const edgeTypes = {
  canvasEdge: CanvasEdge,
}

// ─── Main Viewer Workspace Component ────────────────────────────────────────

interface ViewerWorkspaceProps {
  projectId: string
  projectName: string
  viewerEmail: string
  viewerToken: string
}

export function ViewerWorkspace({
  projectId,
  projectName,
  viewerEmail,
  viewerToken,
}: ViewerWorkspaceProps) {
  const viewerAuthEndpoint = React.useMemo(
    () => `/api/liveblocks-viewer-auth?token=${encodeURIComponent(viewerToken)}`,
    [viewerToken]
  )

  return (
    <LiveblocksProvider authEndpoint={viewerAuthEndpoint}>
      <RoomProvider
        id={projectId}
        initialPresence={{
          cursor: null,
          isThinking: false,
        }}
      >
        <ClientSideSuspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400 gap-2">
              <Loader2 className="size-5 animate-spin text-indigo-400" />
              <span className="text-sm">Connecting to live canvas...</span>
            </div>
          }
        >
          <ViewerWorkspaceInner
            projectName={projectName}
            viewerEmail={viewerEmail}
          />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

// ─── Inner Viewer (Read-Only Canvas) ────────────────────────────────────────

function ViewerWorkspaceInner({
  projectName,
  viewerEmail,
}: {
  projectName: string
  viewerEmail: string
}) {
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 overflow-hidden">
      {/* Top Banner */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Eye className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-bold text-zinc-100 truncate tracking-tight">
              {projectName}
            </h1>
            <span className="text-[10px] text-zinc-500 font-medium truncate">
              Viewing as {viewerEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 border border-amber-800/40 rounded-full">
            <Lock className="size-3 text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
              Read-Only
            </span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <ReadOnlyCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

// ─── Read-Only React Flow Canvas ─────────────────────────────────────────────

function ReadOnlyCanvas() {
  const status = useStatus()
  const showConnectionBanner = status !== "connected"
  const isDisconnected = status === "disconnected"

  const { nodes, edges } = useLiveblocksFlow({
    suspense: true,
    nodes: {
      initial: [] as CanvasNodeType[],
    },
    edges: {
      initial: [] as CanvasEdgeType[],
    },
  })

  return (
    <div className="w-full h-full relative bg-zinc-950">
      {/* Connection Status Banner */}
      {showConnectionBanner && (
        <div className="absolute top-4 left-4 z-50 bg-yellow-950/85 border border-yellow-800 text-yellow-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md animate-pulse">
          {isDisconnected ? (
            <>
              <WifiOff className="size-4 text-red-400" />
              <span>Disconnected from live canvas</span>
            </>
          ) : (
            <>
              <Wifi className="size-4 text-yellow-400" />
              <span>Reconnecting ({status})...</span>
            </>
          )}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
        fitView
        className="bg-zinc-950"
      >
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
        <Background variant={BackgroundVariant.Dots} color="#27272a" gap={20} size={1.2} />
      </ReactFlow>
    </div>
  )
}
