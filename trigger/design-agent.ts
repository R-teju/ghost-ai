import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { liveblocks } from "../lib/liveblocks";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// Helper function to update the AI Agent's presence cursor and status in the room
async function updateAiPresence(roomId: string, presence: { cursor: { x: number; y: number } | null; isThinking: boolean }) {
  const userId = "ghost-ai-agent";
  try {
    if (typeof (liveblocks as any).updatePresence === "function") {
      await (liveblocks as any).updatePresence(roomId, userId, presence);
    } else if (typeof (liveblocks as any).updateRoomUserPresence === "function") {
      await (liveblocks as any).updateRoomUserPresence(roomId, userId, presence);
    } else if (typeof (liveblocks as any).setPresence === "function") {
      await (liveblocks as any).setPresence(roomId, { userId, data: presence });
    } else {
      console.warn("[design-agent] Presence update method not available on Liveblocks client instance");
    }
  } catch (err) {
    console.error(`[design-agent] Failed to update AI presence for room ${roomId}:`, err);
  }
}

export const generateDesign = schemaTask({
  id: "generate-design",
  schema: z.object({
    projectId: z.string(),
    roomId: z.string(),
    prompt: z.string(),
    userId: z.string(),
  }),
  run: async (payload) => {
    const { roomId, prompt, userId } = payload;
    console.log(`[design-agent] Starting design agent execution for room: ${roomId}, user: ${userId}`);

    try {
      // 1. Broadcast AI Presence (Starts Stage)
      await updateAiPresence(roomId, {
        cursor: { x: 200, y: 150 },
        isThinking: true,
      });

      await liveblocks.mutateStorage(roomId, ({ root }: { root: any }) => {
        root.set("ai-status", {
          message: "Ghost AI is analyzing prompt & designing system architecture...",
          step: "starts",
          timestamp: Date.now(),
        });
      });

      // 2. Fetch current canvas state to provide context to Gemini
      let currentNodes: any[] = [];
      let currentEdges: any[] = [];
      try {
        const storage: any = await (liveblocks as any).getStorageDocument(roomId, "json");
        const currentNodesMap = storage?.flow?.nodes || {};
        const currentEdgesMap = storage?.flow?.edges || {};
        currentNodes = Object.values(currentNodesMap);
        currentEdges = Object.values(currentEdgesMap);
      } catch (err) {
        console.warn("[design-agent] Room storage not initialized yet or empty. Starting with empty canvas context.");
      }

      // Animate Cursor to simulate reading
      await updateAiPresence(roomId, {
        cursor: { x: 350, y: 180 },
        isThinking: true,
      });

      // 3. Invoke Gemini using Vercel AI SDK to get structured actions list
      const model = google("gemini-2.5-flash");
      const systemPrompt = `You are an AI Software Architecture Designer agent.
Your task is to translate a user's natural language architecture editing prompt into a list of structural updates for a collaborative flowchart canvas.

The canvas contains nodes and edges matching React Flow structures.
Allowed node shapes: "rectangle", "diamond", "circle", "pill", "cylinder", "hexagon".
Allowed color themes: "zinc", "blue", "purple", "amber", "red", "rose", "green", "teal".
Default node dimensions:
- rectangle: 130x60
- pill: 130x48
- circle: 85x85
- cylinder: 95x75
- hexagon: 105x75
- diamond: 105x105

CRITICAL CONSTRAINT: Node 'label' must ONLY be the clean, concise name of the service/component (e.g., "Auth Service", "API Gateway", "NoSQL Database"). Do NOT include metadata, bullet points, connection descriptions, lists, or properties like "Theme: ...", "Sends to: ...", "Type: ..." inside the node label.

You must output a JSON array of actions. Do not output markdown fences or explanatory text, output ONLY valid JSON.
Each action must have a 'type' from: "add-node", "move-node", "resize-node", "update-node", "delete-node", "add-edge", "delete-edge".

Current canvas state:
Nodes: ${JSON.stringify(currentNodes)}
Edges: ${JSON.stringify(currentEdges)}

Action object schemas:
- add-node: { "type": "add-node", "id": "unique_string", "shape": "rectangle", "color": "blue", "label": "Label text", "x": 100, "y": 200, "width": 130, "height": 60 }
- move-node: { "type": "move-node", "id": "node_id", "x": 150, "y": 250 }
- resize-node: { "type": "resize-node", "id": "node_id", "width": 150, "height": 80 }
- update-node: { "type": "update-node", "id": "node_id", "label": "New label", "color": "purple", "shape": "cylinder" } // all props optional except id
- delete-node: { "type": "delete-node", "id": "node_id" }
- add-edge: { "type": "add-edge", "id": "unique_string", "source": "source_id", "target": "target_id", "label": "optional label" }
- delete-edge: { "type": "delete-edge", "id": "edge_id" }`;

      const response = await generateText({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      });

      let rawJson = response.text.trim();
      if (rawJson.startsWith("```json")) {
        rawJson = rawJson.substring(7);
      }
      if (rawJson.startsWith("```")) {
        rawJson = rawJson.substring(3);
      }
      if (rawJson.endsWith("```")) {
        rawJson = rawJson.substring(0, rawJson.length - 3);
      }
      rawJson = rawJson.trim();

      const actions = JSON.parse(rawJson);
      console.log(`[design-agent] Parsing succeeded. Processing ${actions.length} canvas actions.`);

      // 4. Update status & cursor to simulate processing mutations
      await liveblocks.mutateStorage(roomId, ({ root }: { root: any }) => {
        root.set("ai-status", {
          message: `Ghost AI is rendering ${actions.length} canvas layout mutations...`,
          step: "processing",
          timestamp: Date.now(),
        });
      });

      await updateAiPresence(roomId, {
        cursor: { x: 500, y: 300 },
        isThinking: true,
      });

      // 5. Execute canvas updates inside mutateFlow
      await mutateFlow(
        { client: liveblocks, roomId },
        (flow) => {
          for (const action of actions) {
            switch (action.type) {
              case "add-node": {
                flow.addNode({
                  id: action.id,
                  type: "canvasNode",
                  position: { x: action.x, y: action.y },
                  style: { width: action.width, height: action.height },
                  data: {
                    label: action.label,
                    shape: action.shape,
                    color: action.color,
                  },
                } as any);
                break;
              }
              case "move-node": {
                const node = flow.getNode(action.id);
                if (node) {
                  flow.addNode({
                    ...node,
                    position: { x: action.x, y: action.y },
                  } as any);
                }
                break;
              }
              case "resize-node": {
                const node = flow.getNode(action.id);
                if (node) {
                  flow.addNode({
                    ...node,
                    style: {
                      ...node.style,
                      width: action.width,
                      height: action.height,
                    },
                  } as any);
                }
                break;
              }
              case "update-node": {
                const node = flow.getNode(action.id);
                if (node) {
                  flow.addNode({
                    ...node,
                    data: {
                      ...node.data,
                      label: action.label ?? (node.data as any)?.label,
                      shape: action.shape ?? (node.data as any)?.shape,
                      color: action.color ?? (node.data as any)?.color,
                    },
                  } as any);
                }
                break;
              }
              case "delete-node": {
                (flow as any).removeNode(action.id);
                break;
              }
              case "add-edge": {
                flow.addEdge({
                  id: action.id,
                  source: action.source,
                  target: action.target,
                  label: action.label,
                  type: "canvasEdge",
                  markerEnd: {
                    type: "arrowclosed",
                    color: "#71717a",
                  },
                } as any);
                break;
              }
              case "delete-edge": {
                (flow as any).removeEdge(action.id);
                break;
              }
            }
          }
        }
      );

      // 6. Complete stage: update status & remove presence cursor
      await liveblocks.mutateStorage(roomId, ({ root }: { root: any }) => {
        root.set("ai-status", {
          message: "Ghost AI has successfully completed the canvas updates.",
          step: "complete",
          timestamp: Date.now(),
        });
      });

      await updateAiPresence(roomId, {
        cursor: null,
        isThinking: false,
      });

      return {
        success: true,
        actionsExecuted: actions.length,
      };
    } catch (error: any) {
      console.error("[design-agent] Error during task execution:", error);
      
      try {
        await liveblocks.mutateStorage(roomId, ({ root }: { root: any }) => {
          root.set("ai-status", {
            message: `Failed: ${error.message || "An unexpected error occurred during design updates."}`,
            step: "failed",
            timestamp: Date.now(),
          });
        });
        await updateAiPresence(roomId, {
          cursor: null,
          isThinking: false,
        });
      } catch (innerErr) {
        console.error("[design-agent] Failed to report task failure to liveblocks:", innerErr);
      }
      
      throw error;
    }
  },
});
