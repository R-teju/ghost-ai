import * as React from "react"
import { getSmoothStepPath, EdgeProps, EdgeLabelRenderer, useReactFlow } from "@xyflow/react"
import { cn } from "@/lib/utils"

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  label,
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const [isHovered, setIsHovered] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [inputValue, setInputValue] = React.useState((label as string) || "")

  // Sync internal text state with external collaborator updates
  React.useEffect(() => {
    setInputValue((label as string) || "")
  }, [label])

  // Generate right-angle orthogonal stepped path with rounded corners
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
    borderRadius: 8,
  })

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    // Broadcast label updates to collaborators as user types
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            label: val,
          }
        }
        return edge
      })
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditing(false)
      const originalVal = (label as string) || ""
      setInputValue(originalVal)
      // Broadcast revert
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              label: originalVal,
            }
          }
          return edge
        })
      )
    }
    if (e.key === "Enter") {
      e.preventDefault()
      setIsEditing(false)
    }
  }

  // Calculate input width dynamically to grow with content (7px per character)
  const inputWidth = Math.max(45, inputValue.length * 6.5) + "px"

  return (
    <>
      {/* Thick invisible interaction guide (makes clicking and hovering super easy) */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={15}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Thin visible stroke (brightens on selection or hover) */}
      <path
        d={edgePath}
        fill="none"
        stroke={selected ? "#6366f1" : isHovered ? "#a1a1aa" : "#3f3f46"}
        strokeWidth={selected || isHovered ? 2.5 : 1.5}
        markerEnd={markerEnd}
        className="transition-all duration-200"
      />

      {/* Floating interactive label container positioned at path midpoint */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan z-50 select-none"
        >
          {isEditing ? (
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setIsEditing(false)}
              autoFocus
              className="bg-zinc-900 border border-indigo-500 rounded px-1.5 py-0.5 text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-150 shadow-lg min-w-[45px]"
              style={{ width: inputWidth }}
            />
          ) : (
            (label || isHovered) && (
              <div
                onDoubleClick={handleDoubleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                  "bg-zinc-950/95 border border-zinc-800/90 rounded px-2 py-0.5 text-[9px] font-semibold transition-all cursor-text text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 shadow-md",
                  selected ? "border-indigo-500/40 text-indigo-300" : ""
                )}
              >
                {label || <span className="opacity-55 italic font-normal">label</span>}
              </div>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const CanvasEdge = React.memo(CanvasEdgeComponent)
