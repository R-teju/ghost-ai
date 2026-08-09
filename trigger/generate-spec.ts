import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { liveblocks } from "../lib/liveblocks";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: z.object({
    projectId: z.string(),
    roomId: z.string(),
    canvasJson: z.any(),
  }),
  run: async (payload) => {
    const { roomId, canvasJson } = payload;
    console.log(`[generate-spec] Starting spec generation for room: ${roomId}`);

    try {
      // 1. Set generating flag to true
      await liveblocks.mutateStorage(roomId, ({ root }: { root: any }) => {
        root.set("is-generating-spec", true);
      });

      const nodes = canvasJson?.nodes || [];
      const edges = canvasJson?.edges || [];

      // 2. Call Gemini to create the specification
      const model = google("gemini-2.5-flash");
      const systemPrompt = `You are a professional Principal Software Architect.
Your task is to generate a comprehensive, high-quality, professional technical specification document in Markdown format based on the provided collaborative flowchart canvas elements (nodes and edges).

Make the specification extremely thorough, detailed, and quality-wise ready for a production development team.
Include the following sections:
1. Executive Summary & Overview
2. System Architecture & Diagram Breakdown (detail what each node does, its type/shape, and role in the system)
3. Component-to-Component Interaction Flows (trace the connections defined by the edges)
4. Key Technology Choices & Specifications (e.g. databases, caching, message queues, APIs)
5. Non-Functional Requirements (Scalability, Reliability, Performance, Security)

Canvas elements:
Nodes: ${JSON.stringify(nodes)}
Edges: ${JSON.stringify(edges)}

Output ONLY the Markdown content for the specification. Do not wrap it in extra markdown code block ticks at the outer level.`;

      const response = await generateText({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a detailed technical specification document for this canvas layout.` }
        ],
      });

      const markdownSpec = response.text.trim();

      // 3. Save spec document directly into Liveblocks Room Storage
      await liveblocks.mutateStorage(roomId, ({ root }: { root: any }) => {
        let specs = root.get("specs");
        if (!specs) {
          root.set("specs", []);
          specs = root.get("specs");
        }

        const newSpec = {
          id: `${Date.now()}`,
          name: `${Date.now()}.md`,
          content: markdownSpec,
          createdAt: Date.now(),
        };

        if (typeof specs.push === "function") {
          specs.push(newSpec);
        } else if (Array.isArray(specs)) {
          root.set("specs", [...specs, newSpec]);
        } else {
          // If it's a LiveList/LiveObject or similar
          try {
            specs.push(newSpec);
          } catch {
            const current = root.get("specs") || [];
            root.set("specs", [...current, newSpec]);
          }
        }

        root.set("is-generating-spec", false);
      });

      console.log(`[generate-spec] Successfully generated spec and updated Room Storage for room: ${roomId}`);
      return { success: true };
    } catch (error: any) {
      console.error("[generate-spec] Error during spec generation:", error);
      
      try {
        await liveblocks.mutateStorage(roomId, ({ root }: { root: any }) => {
          root.set("is-generating-spec", false);
        });
      } catch {}

      throw error;
    }
  },
});
