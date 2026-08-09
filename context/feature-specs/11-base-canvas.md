Replace the canvas placeholder with a liveblocks-backed React Flow canvas.

## implementation

1.Keep the wworkspace page server-side.
2.Create a client-side editor/canvas wrapper that sets up the liveblocks room.

It should include:
- `LiveblocksProvider` using `/api/liveblocks-auth`
- `RoomProvider` using the current room ID
- initial presence with `cursor:null`
- `ClientSideSuspense` with a simple loading state
- an error fallback for liveblocks connection issues
  
3.wire React Flow to liveblocks state.
   - use `useliveblocksFlow`
   - enable suspense
   - starrt with empty nodes and edges
   - pass the synced nodes,edges and change handlers into `ReactFlow`

4.Add shared canvas types in `types/canvas.ts`
 Node data should support:
 - label
 - color
 - shape
 also define the custom node and edge types:
 - `canvaNode`
 - `canvasEdge`

5.render the basic canvas.
  Include:
  - loose connection behaviour
  - `fitView`
  - `MiniMap`
  - dot-pattern background

## Scope Limits
## check when done

- Client canvas wrapper sets up the LiveBlocks room.
- React Flow uses liveblocks-synced nodes and edges.
- shared canvas types exist in `types/canvas.ts`.
- `npm run build` passes.