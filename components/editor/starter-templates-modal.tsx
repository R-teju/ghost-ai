"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CANVAS_TEMPLATES, CanvasTemplate } from "./starter-templates"
import { NODE_THEMES } from "@/types/canvas"

interface StarterTemplatesModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

// Lightweight static SVG-based template preview component
export function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-650 text-xs italic bg-zinc-950/40">
        Empty Template
      </div>
    )
  }

  // Calculate bounding box bounds from node positions to fit automatically inside viewBox
  const minX = Math.min(...nodes.map((n) => n.position.x))
  const minY = Math.min(...nodes.map((n) => n.position.y))
  const maxX = Math.max(
    ...nodes.map((n) => n.position.x + Number(n.style?.width || 120))
  )
  const maxY = Math.max(
    ...nodes.map((n) => n.position.y + Number(n.style?.height || 60))
  )

  const width = maxX - minX
  const height = maxY - minY
  const padding = 35 // Padding around outer boundaries to avoid edge clipping

  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full select-none"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <marker
          id={`arrow-preview-${template.id}`}
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
        </marker>
      </defs>

      {/* 1. Draw connecting lines between nodes centers with boundary offsets */}
      {edges.map((e, idx) => {
        const sourceNode = nodes.find((n) => n.id === e.source)
        const targetNode = nodes.find((n) => n.id === e.target)

        if (!sourceNode || !targetNode) return null

        const sw = Number(sourceNode.style?.width || 120)
        const sh = Number(sourceNode.style?.height || 60)
        const tw = Number(targetNode.style?.width || 120)
        const th = Number(targetNode.style?.height || 60)

        const sx = sourceNode.position.x + sw / 2
        const sy = sourceNode.position.y + sh / 2
        const tx = targetNode.position.x + tw / 2
        const ty = targetNode.position.y + th / 2

        // Calculate line angle and offsets to prevent node shapes from covering the arrowheads
        const dx = tx - sx
        const dy = ty - sy
        const angle = Math.atan2(dy, dx)

        // Shape half-sizes for boundary offsets
        const sOffset = Math.min(sw, sh) / 2 + 2
        const tOffset = Math.min(tw, th) / 2 + 6

        const startX = sx + Math.cos(angle) * sOffset
        const startY = sy + Math.sin(angle) * sOffset
        const endX = tx - Math.cos(angle) * tOffset
        const endY = ty - Math.sin(angle) * tOffset

        return (
          <line
            key={idx}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#52525b"
            strokeWidth={2}
            markerEnd={`url(#arrow-preview-${template.id})`}
          />
        )
      })}

      {/* 2. Draw styled nodes matching shape/color definitions */}
      {nodes.map((n) => {
        const x = n.position.x
        const y = n.position.y
        const w = Number(n.style?.width || 120)
        const h = Number(n.style?.height || 60)
        const shape = n.data.shape || "rectangle"
        const color = n.data.color || "zinc"

        const theme = NODE_THEMES[color] || NODE_THEMES.zinc

        let shapeElement = null

        if (shape === "circle") {
          shapeElement = (
            <circle
              cx={x + w / 2}
              cy={y + h / 2}
              r={Math.min(w, h) / 2}
              fill={theme.bg}
              stroke={theme.border}
              strokeWidth={2}
            />
          )
        } else if (shape === "pill") {
          shapeElement = (
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={h / 2}
              ry={h / 2}
              fill={theme.bg}
              stroke={theme.border}
              strokeWidth={2}
            />
          )
        } else if (shape === "diamond") {
          const cx = x + w / 2
          const cy = y + h / 2
          shapeElement = (
            <polygon
              points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`}
              fill={theme.bg}
              stroke={theme.border}
              strokeWidth={2}
            />
          )
        } else if (shape === "hexagon") {
          shapeElement = (
            <polygon
              points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h * 0.5} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h * 0.5}`}
              fill={theme.bg}
              stroke={theme.border}
              strokeWidth={2}
            />
          )
        } else if (shape === "cylinder") {
          shapeElement = (
            <>
              <path
                d={`M ${x} ${y + 12} L ${x} ${y + h - 12} A ${w / 2} 12 0 0 0 ${x + w} ${y + h - 12} L ${x + w} ${y + 12}`}
                fill={theme.bg}
                stroke={theme.border}
                strokeWidth={2}
              />
              <ellipse
                cx={x + w / 2}
                cy={y + 12}
                rx={w / 2}
                ry={12}
                fill={theme.bg}
                stroke={theme.border}
                strokeWidth={2}
              />
            </>
          )
        } else {
          // Rectangle fallback
          shapeElement = (
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={8}
              ry={8}
              fill={theme.bg}
              stroke={theme.border}
              strokeWidth={2}
            />
          )
        }

        // Limit label text to first word + ellipsis if too long to fit preview
        const cleanLabel = n.data.label ? n.data.label.split(" ")[0] : ""

        return (
          <g key={n.id}>
            {shapeElement}
            <text
              x={x + w / 2}
              y={y + h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={theme.text}
              fontSize="10px"
              fontWeight="bold"
              className="select-none pointer-events-none"
            >
              {cleanLabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function StarterTemplatesModal({
  isOpen,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-zinc-800 bg-[#09090b] text-zinc-100 shadow-2xl shadow-black/80 p-6 sm:max-w-2xl rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-4 border-b border-zinc-850">
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-100">
            Starter Templates
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Start your canvas with a pre-built architecture diagram instead of drawing from scratch.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto py-4 pr-1">
          {CANVAS_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col rounded-xl border border-zinc-850 bg-zinc-900/10 hover:border-zinc-750 transition-all p-4 gap-3 group"
            >
              <div className="flex flex-col gap-1 select-none">
                <span className="text-sm font-bold text-zinc-200 group-hover:text-zinc-50 transition-colors">
                  {tpl.name}
                </span>
                <p className="text-[11px] text-zinc-450 leading-relaxed min-h-[44px]">
                  {tpl.description}
                </p>
              </div>

              {/* Vector diagram preview viewport */}
              <div className="w-full h-36 bg-[#040407] rounded-lg border border-zinc-950 overflow-hidden flex items-center justify-center p-2.5 shadow-inner">
                <TemplatePreview template={tpl} />
              </div>

              {/* Action import trigger */}
              <Button
                onClick={() => {
                  onImport(tpl)
                  onOpenChange(false)
                }}
                className="w-full bg-indigo-650 hover:bg-indigo-500 hover:text-white border-none text-zinc-100 text-xs font-semibold cursor-pointer h-8.5 rounded-lg mt-1 transition-all active:scale-[0.98]"
              >
                Import Diagram
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
