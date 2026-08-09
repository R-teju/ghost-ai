import { CanvasNode, CanvasEdge } from "@/types/canvas"
import { MarkerType } from "@xyflow/react"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

// Helper to keep template data clean and readable
function node(
  id: string,
  label: string,
  x: number,
  y: number,
  shape: "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon",
  color: string,
  width = 120,
  height = 60
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    style: { width, height },
    data: {
      label,
      shape,
      color,
    },
  }
}

// Helper to construct edges with default arrow configurations
function edge(source: string, target: string, label?: string): CanvasEdge {
  return {
    id: `e_${source}_to_${target}_${Date.now()}`,
    source,
    target,
    type: "canvasEdge",
    label,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#71717a",
    },
  }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard web architecture featuring an API gateway, auth, and database-backed business services communicating via a message queue.",
    nodes: [
      node("gw", "API Gateway", 100, 150, "pill", "teal", 130, 48),
      node("auth", "Auth Service", 300, 50, "rectangle", "blue", 130, 60),
      node("users", "User Service", 300, 150, "rectangle", "blue", 130, 60),
      node("orders", "Order Service", 300, 250, "rectangle", "blue", 130, 60),
      node("db", "Main Database", 520, 100, "cylinder", "purple", 120, 75),
      node("mq", "Message Broker", 520, 250, "hexagon", "amber", 120, 75),
      node("notif", "Notification Svc", 720, 250, "rectangle", "blue", 130, 60),
    ],
    edges: [
      edge("gw", "auth"),
      edge("gw", "users"),
      edge("gw", "orders"),
      edge("users", "db"),
      edge("orders", "db"),
      edge("orders", "mq"),
      edge("mq", "notif"),
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Deployment Pipeline",
    description: "A continuous integration and delivery workflow spanning code push, automated test stages, container build, and deployment.",
    nodes: [
      node("repo", "GitHub Repo", 50, 100, "circle", "zinc", 85, 85),
      node("build", "Build Stage", 180, 112, "rectangle", "blue", 120, 60),
      node("test", "Test Stage", 340, 92, "diamond", "amber", 100, 100),
      node("docker", "Docker Build", 480, 112, "hexagon", "teal", 110, 75),
      node("registry", "Registry", 630, 112, "pill", "purple", 130, 48),
      node("deploy", "K8s Deploy", 800, 105, "cylinder", "green", 100, 75),
    ],
    edges: [
      edge("repo", "build"),
      edge("build", "test"),
      edge("test", "docker"),
      edge("docker", "registry"),
      edge("registry", "deploy"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "An asynchronous architecture using pub/sub topics to decouple ingestion sources from downstream consumers and analytics processes.",
    nodes: [
      node("client", "Web Client", 50, 150, "pill", "zinc", 130, 48),
      node("ingest", "API Ingestion", 220, 144, "rectangle", "blue", 130, 60),
      node("kafka", "Kafka Event Hub", 400, 136, "hexagon", "amber", 120, 75),
      node("billing", "Billing Consumer", 580, 50, "rectangle", "teal", 130, 60),
      node("analytics", "Analytics Svc", 580, 240, "rectangle", "teal", 130, 60),
      node("db", "Data Warehouse", 770, 232, "cylinder", "purple", 110, 75),
    ],
    edges: [
      edge("client", "ingest"),
      edge("ingest", "kafka"),
      edge("kafka", "billing"),
      edge("kafka", "analytics"),
      edge("analytics", "db"),
    ],
  },
]
