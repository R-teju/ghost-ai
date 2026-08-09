import { auth } from "@clerk/nextjs/server"
import { checkProjectAccess } from "@/lib/project-access"
import { liveblocks } from "@/lib/liveblocks"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const { projectId } = json

    if (!projectId) {
      return Response.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Verify project access
    const { hasAccess } = await checkProjectAccess(projectId)
    if (!hasAccess) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // 1. Set the generating flag in Liveblocks storage
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await liveblocks.mutateStorage(projectId, ({ root }: { root: any }) => {
        root.set("is-generating-spec", true)
      })
    } catch (storageErr) {
      console.warn("Could not set is-generating-spec flag:", storageErr)
    }

    // 2. Read current canvas state from Liveblocks
    let nodes: Array<Record<string, unknown>> = []
    let edges: Array<Record<string, unknown>> = []
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storage: any = await (liveblocks as any).getStorageDocument(projectId, "json")
      const flow = storage?.flow
      if (flow) {
        const nodesMap = flow.nodes
        const edgesMap = flow.edges
        if (nodesMap) nodes = Object.values(nodesMap) as Array<Record<string, unknown>>
        if (edgesMap) edges = Object.values(edgesMap) as Array<Record<string, unknown>>
      }
    } catch (readErr) {
      console.warn("Could not read canvas from Liveblocks storage:", readErr)
    }

    // 3. Generate spec using Gemini (or fallback)
    let markdownSpec = ""
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (apiKey && nodes.length > 0) {
      try {
        const model = google("gemini-2.5-flash")
        const systemPrompt = `You are a professional Principal Software Architect.
Your task is to generate a comprehensive, production-ready technical specification document in Markdown format based on the provided collaborative flowchart canvas elements (nodes and edges).

Make the specification thorough, detailed, and professional. Include:
1. Executive Summary & Overview
2. System Architecture & Diagram Breakdown (detail what each node does, its type/shape, and role)
3. Component-to-Component Interaction Flows (trace connections defined by edges)
4. Key Technology Choices & Specifications (databases, caching, message queues, APIs)
5. Non-Functional Requirements (Scalability, Reliability, Performance, Security)

Canvas elements:
Nodes: ${JSON.stringify(nodes)}
Edges: ${JSON.stringify(edges)}

Output ONLY the Markdown content. Do not wrap it in code block fences.`

        const response = await generateText({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate a detailed technical specification document for this canvas layout." },
          ],
        })

        markdownSpec = response.text.trim()
      } catch (aiErr) {
        console.error("Gemini spec generation failed, using fallback:", aiErr)
      }
    }

    // Fallback: generate a basic spec from node data
    if (!markdownSpec) {
      markdownSpec = generateFallbackSpec(nodes, edges)
    }

    // 4. Save spec into Liveblocks storage
    const specName = `spec-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}.md`
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await liveblocks.mutateStorage(projectId, ({ root }: { root: any }) => {
        let specs = root.get("specs")
        if (!specs || !Array.isArray(specs)) {
          root.set("specs", [])
          specs = root.get("specs")
        }

        const newSpec = {
          id: `${Date.now()}`,
          name: specName,
          content: markdownSpec,
          createdAt: Date.now(),
        }

        if (typeof specs.push === "function") {
          specs.push(newSpec)
        } else {
          const current = root.get("specs") || []
          root.set("specs", [...current, newSpec])
        }

        root.set("is-generating-spec", false)
      })
    } catch (writeErr) {
      console.error("Failed to write spec to Liveblocks:", writeErr)
      // Clear the generating flag on error
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await liveblocks.mutateStorage(projectId, ({ root }: { root: any }) => {
          root.set("is-generating-spec", false)
        })
      } catch { /* ignore */ }
      return Response.json({ error: "Failed to save specification" }, { status: 500 })
    }

    return Response.json({ success: true, specName })
  } catch (error) {
    console.error("Failed to generate spec:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/**
 * Generates a structured specification from canvas nodes and edges without AI.
 */
function generateFallbackSpec(
  nodes: Array<Record<string, unknown>>,
  edges: Array<Record<string, unknown>>
): string {
  if (nodes.length === 0) {
    return `# System Architecture Specification

## Overview
No canvas nodes found. Add components to your canvas and generate the specification again.

## Getting Started
1. Use the **Shapes** toolbar at the bottom to drag components onto the canvas
2. Connect nodes by dragging from one node's handle to another
3. Click **Generate Spec** to compile your architecture into a specification document

## Template Suggestions
- Try the **AI Architect** presets for pre-built architectures
- Or describe your system in the **Chat** tab and let Ghost AI design it for you`
  }

  const nodeList = nodes.map((n) => {
    const data = n.data as Record<string, unknown> | undefined
    const label = (data?.label as string) || "Unnamed Component"
    const shape = (data?.shape as string) || "rectangle"
    const color = (data?.color as string) || "zinc"
    return { id: n.id as string, label, shape, color }
  })

  const edgeList = edges.map((e) => ({
    source: e.source as string,
    target: e.target as string,
    label: (e.label as string) || "",
  }))

  // Build node lookup
  const nodeMap = new Map(nodeList.map((n) => [n.id, n]))

  let md = `# System Architecture Specification\n\n`
  md += `## 1. Executive Summary\nThis document describes a system architecture with **${nodeList.length} components** and **${edgeList.length} connections**.\n\n`
  md += `## 2. System Components\n\n`

  for (const node of nodeList) {
    const shapeRole = getShapeRole(node.shape)
    md += `### ${node.label}\n`
    md += `- **Type**: ${node.shape} (${shapeRole})\n`
    md += `- **Theme**: ${node.color}\n`

    // List connections
    const outgoing = edgeList.filter((e) => e.source === node.id)
    const incoming = edgeList.filter((e) => e.target === node.id)
    if (outgoing.length > 0) {
      md += `- **Sends to**: ${outgoing.map((e) => nodeMap.get(e.target)?.label || e.target).join(", ")}\n`
    }
    if (incoming.length > 0) {
      md += `- **Receives from**: ${incoming.map((e) => nodeMap.get(e.source)?.label || e.source).join(", ")}\n`
    }
    md += `\n`
  }

  md += `## 3. Data Flow\n\n`
  if (edgeList.length > 0) {
    for (const edge of edgeList) {
      const src = nodeMap.get(edge.source)?.label || edge.source
      const tgt = nodeMap.get(edge.target)?.label || edge.target
      md += `- \`${src}\` → \`${tgt}\`${edge.label ? ` (${edge.label})` : ""}\n`
    }
  } else {
    md += `No connections defined. Connect your canvas nodes to define data flow.\n`
  }

  md += `\n## 4. Technology Recommendations\n\n`
  md += `Based on the architecture components, consider:\n`
  md += `- **API Layer**: RESTful or GraphQL endpoints\n`
  md += `- **Database**: PostgreSQL for relational data, Redis for caching\n`
  md += `- **Messaging**: Kafka or RabbitMQ for event-driven components\n`
  md += `- **Deployment**: Kubernetes with horizontal pod autoscaling\n`

  return md
}

function getShapeRole(shape: string): string {
  switch (shape) {
    case "rectangle": return "Service / Processing Component"
    case "pill": return "Gateway / Entry Point"
    case "circle": return "Trigger / Event Source"
    case "cylinder": return "Database / Storage"
    case "hexagon": return "Message Broker / Queue"
    case "diamond": return "Decision / Validation Gate"
    default: return "Component"
  }
}
