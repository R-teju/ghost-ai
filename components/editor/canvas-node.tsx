import * as React from "react"
import { NodeProps, Handle, Position, NodeResizer, useReactFlow, NodeToolbar } from "@xyflow/react"
import { CanvasNodeData, NODE_THEMES } from "@/types/canvas"
import { cn } from "@/lib/utils"

export function CanvasNodeComponent({ id, data, selected }: NodeProps) {
  const { label, color = "zinc", shape = "rectangle", isGhost = false } =
    data as unknown as CanvasNodeData & { isGhost?: boolean }

  const { setNodes } = useReactFlow()

  // Inline label editing states
  const [isEditing, setIsEditing] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(label || "")

  // Keep internal text state synchronized with updates from external collaborators
  React.useEffect(() => {
    setInputValue(label || "")
  }, [label])

  // Resolve active color pair from predefined NODE_THEMES
  const themeKey = (color && NODE_THEMES[color]) ? color : "zinc"
  const theme = NODE_THEMES[themeKey]

  const inlineStyle: React.CSSProperties = {
    backgroundColor: theme.bg,
    color: theme.text,
    borderColor: selected ? theme.border : "transparent",
    boxShadow: selected ? `0 0 16px ${theme.border}33` : "none",
  }

  // Dynamically configure minimum bounds based on shape geometries to prevent clipping
  let minWidth = 120
  let minHeight = 60

  if (shape === "circle") {
    minWidth = 80
    minHeight = 80
  } else if (shape === "diamond") {
    minWidth = 90
    minHeight = 90
  } else if (shape === "pill") {
    minWidth = 100
    minHeight = 40
  } else if (shape === "cylinder" || shape === "hexagon") {
    minWidth = 90
    minHeight = 65
  }

  // Label interaction handlers
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isGhost) return
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputValue(val)
    
    // Broadcast updates as user types to support real-time collaboration
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: val,
            },
          }
        }
        return n
      })
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setIsEditing(false)
      const originalVal = label || ""
      setInputValue(originalVal)
      // Broadcast revert
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                label: originalVal,
              },
            }
          }
          return n
        })
      )
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      setIsEditing(false)
    }
  }

  const handleColorSelect = (newColor: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              color: newColor,
            },
          }
        }
        return n
      })
    )
  }

  // 1. CSS Shapes Rendering Block (rectangle, pill, circle)
  const isCssShape = ["rectangle", "pill", "circle"].includes(shape)
  let cssShapeClass = ""

  if (isCssShape) {
    const borderStyle = isGhost
      ? "border-2 border-dashed"
      : selected
      ? "border-2"
      : "border"

    cssShapeClass = cn(
      "flex items-center justify-center shadow-lg transition-all w-full h-full",
      borderStyle,
      isGhost ? "opacity-50" : "opacity-100"
    )

    inlineStyle.borderColor = selected ? theme.border : isGhost ? "#52525b" : "#27272a"

    switch (shape) {
      case "rectangle":
        cssShapeClass = cn(cssShapeClass, "rounded-lg min-w-[130px] min-h-[65px] px-4 py-2")
        break
      case "pill":
        cssShapeClass = cn(cssShapeClass, "rounded-full min-w-[125px] min-h-[48px] px-5 py-2")
        break
      case "circle":
        cssShapeClass = cn(cssShapeClass, "rounded-full min-w-[85px] min-h-[85px] px-3 py-3")
        break
    }
  }

  // Compound Target & Source handles on all 4 compass sides. Subtle white dots with dark border.
  // Fades in/out on group hover.
  const handles = (
    <>
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="t-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="t-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
      {/* Bottom handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="b-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="l-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="l-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
      {/* Right handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="r-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-2.5 h-2.5 bg-white border border-zinc-950 rounded-full hover:bg-indigo-400"
      />
    </>
  )

  // Track hover state for each color swatch
  const [hoveredSwatchId, setHoveredSwatchId] = React.useState<string | null>(null)

  // Floating color swatch toolbar (only visible when selected, has isolation & drag/pan locks)
  const colorToolbar = !isGhost && (
    <NodeToolbar
      isVisible={!!selected}
      position={Position.Top}
      offset={14}
      className="nodrag nopan z-50 shadow-2xl animate-in fade-in zoom-in duration-200"
      style={{
        pointerEvents: "all",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "#0d0d11f2",
        border: "1px solid #27272a",
        borderRadius: "9999px",
        padding: "6px 14px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {Object.values(NODE_THEMES).map((t) => {
        const isActive = themeKey === t.id
        const isHovered = hoveredSwatchId === t.id

        // Render active/hover/inactive shadow styles
        let swatchBoxShadow = `0 0 4px ${t.border}33`
        if (isActive) {
          swatchBoxShadow = `0 0 0 2px #0d0d11, 0 0 0 4px ${t.border}, 0 0 12px ${t.border}66`
        } else if (isHovered) {
          swatchBoxShadow = `0 0 8px ${t.border}80`
        }

        return (
          <button
            key={t.id}
            title={t.name}
            onClick={() => handleColorSelect(t.id)}
            onMouseEnter={() => setHoveredSwatchId(t.id)}
            onMouseLeave={() => setHoveredSwatchId(null)}
            className="cursor-pointer transition-all duration-200"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              borderWidth: "2px",
              borderStyle: "solid",
              backgroundColor: t.bg,
              borderColor: t.border,
              boxShadow: swatchBoxShadow,
              padding: 0,
              flexShrink: 0,
              outline: "none",
              transform: isActive ? "scale(1.15)" : hoveredSwatchId === t.id ? "scale(1.1)" : "scale(1)",
            }}
          />
        )
      })}
    </NodeToolbar>
  )

  // Label display/edit template
  const textEditor = isEditing ? (
    <textarea
      value={inputValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={() => setIsEditing(false)}
      autoFocus
      placeholder="Type label..."
      className="nodrag nopan w-full h-full bg-zinc-900 border border-indigo-500/80 rounded text-[11px] text-center resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/80 p-1 flex items-center justify-center"
      style={{ color: theme.text }}
    />
  ) : (
    <div
      onDoubleClick={handleDoubleClick}
      className="text-xs font-semibold text-center select-none break-words max-w-full px-1 cursor-default"
      style={{ color: theme.text }}
    >
      {label || (
        <span className="opacity-50 italic font-normal">
          Double-click to edit
        </span>
      )}
    </div>
  )

  // Render CSS shape
  if (isCssShape) {
    return (
      <div className={cn("group relative transition-all w-full h-full", selected ? "ring-2 ring-indigo-500/20 rounded-xl" : "")}>
        {colorToolbar}
        <NodeResizer
          isVisible={!!selected && !isGhost}
          minWidth={minWidth}
          minHeight={minHeight}
          keepAspectRatio={shape === "circle"} // Keep circles circular during resizing
          lineClassName="border-indigo-500/35"
          handleClassName="w-2 h-2 bg-zinc-950 border border-zinc-700 rounded-sm"
        />
        {handles}
        <div className={cssShapeClass} style={inlineStyle}>
          {textEditor}
        </div>
      </div>
    )
  }

  // 2. SVG Shapes Rendering Block (diamond, hexagon, cylinder)
  let svgContent = null
  let containerDimensions = "min-w-[100px] min-h-[100px]" // default diamond
  const svgClass = cn(
    "absolute inset-0 w-full h-full transition-all",
    isGhost ? "opacity-50" : "opacity-100"
  )
  const strokeDashArray = isGhost ? "4 4" : "none"
  const strokeColor = selected ? theme.border : "#27272a"
  const strokeWidthValue = selected ? 2.5 : 1.5

  switch (shape) {
    case "diamond":
      containerDimensions = "min-w-[105px] min-h-[105px] w-full h-full"
      svgContent = (
        <polygon
          points="50,1.5 98.5,50 50,98.5 1.5,50"
          stroke={strokeColor}
          strokeWidth={strokeWidthValue}
          strokeDasharray={strokeDashArray}
        />
      )
      break
    case "hexagon":
      containerDimensions = "min-w-[110px] min-h-[75px] w-full h-full"
      svgContent = (
        <polygon
          points="25,1.5 75,1.5 98.5,50 75,98.5 25,98.5 1.5,50"
          stroke={strokeColor}
          strokeWidth={strokeWidthValue}
          strokeDasharray={strokeDashArray}
        />
      )
      break
    case "cylinder":
      containerDimensions = "min-w-[95px] min-h-[75px] w-full h-full"
      svgContent = (
        <>
          <path
            d="M 1.5,15 L 1.5,85 A 48.5,13.5 0 0,0 98.5,85 L 98.5,15"
            stroke={strokeColor}
            strokeWidth={strokeWidthValue}
            strokeDasharray={strokeDashArray}
          />
          <ellipse
            cx="50"
            cy="15"
            rx="48.5"
            ry="13.5"
            stroke={strokeColor}
            strokeWidth={strokeWidthValue}
            strokeDasharray={strokeDashArray}
          />
        </>
      )
      break
  }

  return (
    <div
      className={cn("group relative transition-all w-full h-full", selected ? "ring-2 ring-indigo-500/20 rounded-xl" : "")}
      style={{ boxShadow: selected ? `0 0 16px ${theme.border}33` : "none" }}
    >
      {colorToolbar}
      <NodeResizer
        isVisible={!!selected && !isGhost}
        minWidth={minWidth}
        minHeight={minHeight}
        keepAspectRatio={false}
        lineClassName="border-indigo-500/35"
        handleClassName="w-2 h-2 bg-zinc-950 border border-zinc-700 rounded-sm"
      />
      {handles}

      <div className={cn("relative flex items-center justify-center w-full h-full", containerDimensions)}>
        {/* Vector Background Graphic */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={svgClass}
          fill={theme.bg}
        >
          {svgContent}
        </svg>

        {/* Text overlay layer positioned centered inside the SVG geometry */}
        <div className="absolute inset-0 flex items-center justify-center p-3 select-none z-10">
          {textEditor}
        </div>
      </div>
    </div>
  )
}
export const CanvasNode = React.memo(CanvasNodeComponent)
