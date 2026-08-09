import { Node, Edge } from "@xyflow/react"

export interface CanvasNodeData {
  label: string
  color?: string // Predefined color theme ID
  shape?: "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"
  [key: string]: unknown
}

export type CanvasNode = Node<CanvasNodeData>
export type CanvasEdge = Edge

// Type aliases for specification compliance
export type canvaNode = CanvasNode
export type canvasNode = CanvasNode
export type canvasEdge = CanvasEdge

export interface ColorTheme {
  id: string
  name: string
  bg: string       // Predefined background color
  border: string   // Matching border/accent color
  text: string     // Matching text/label color
}

// Predefined palette mapping background and text color pairs matching user dashboard
export const NODE_THEMES: Record<string, ColorTheme> = {
  zinc: {
    id: "zinc",
    name: "Zinc",
    bg: "#18181b", // zinc-900
    border: "#3f3f46", // zinc-600
    text: "#fafafa", // zinc-50
  },
  blue: {
    id: "blue",
    name: "Blue",
    bg: "#172554", // blue-950
    border: "#3b82f6", // blue-500
    text: "#eff6ff", // blue-50
  },
  purple: {
    id: "purple",
    name: "Purple",
    bg: "#3b0764", // purple-955
    border: "#a855f7", // purple-500
    text: "#f3e8ff", // purple-50
  },
  amber: {
    id: "amber",
    name: "Amber",
    bg: "#451a03", // amber-955
    border: "#f59e0b", // amber-500
    text: "#fef3c7", // amber-50
  },
  red: {
    id: "red",
    name: "Red",
    bg: "#450a0a", // red-955
    border: "#ef4444", // red-500
    text: "#fef2f2", // red-50
  },
  rose: {
    id: "rose",
    name: "Rose",
    bg: "#4c0519", // rose-955
    border: "#f43f5e", // rose-500
    text: "#fff1f2", // rose-50
  },
  green: {
    id: "green",
    name: "Green",
    bg: "#022c22", // green-950 (emerald-950)
    border: "#22c55e", // green-500
    text: "#f0fdf4", // green-50
  },
  teal: {
    id: "teal",
    name: "Teal",
    bg: "#042f2e", // teal-955
    border: "#14b8a6", // teal-500
    text: "#f0fdfa", // teal-50
  },
}
