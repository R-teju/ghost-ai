implemnet the full AI design agent so a user prompt results in real-time updates on the collaborative canvas,with visible AI presence and status

## implamentation

1. update the design agent task in `trigger/design-agent.ts`.

  before implementing:
   - check `context/project-overview.md` and `context/architecture-context.md` for product behaviour and system rules
   - before implementing,check liveblocks and trigger.dev agent skills for current patterns on canvas mutation and background task execution.
   - follow the existing trigger.dev setup and agent patterns already in the project
   - reuse existing liveblocks flow and presence patterns instead of creating new ones 

   then implement:
   - use Gemini(`@ai-sdk/google`) to interpret the user prompt
   - update the canvas using the existing collaborative flow utilities
   - support actions like:
     - add node
     - move node
     - resize node
     - update node
     - delete node
     - add edge
     - delete edge
- publish AI activity to the shared status feed so all users see progress
- update AI presence (cursor + thinking state) while the task runs
- push clear status messages at key steps (starts ,processing,complete)

- ensure generated designs follow:
  - allowed node shapes
  - color palette
  - layout and spacing rules

- handle errors gracefully and update status if something fails 
- clear AI presence when the task finishes


## dependencies

 all packages are already installed.`GEMINI_API_KEY` is already in `.env.local`

 ## scope limits
 - dont change canvas architecture
 - dont introduce a neww state system outside liveblocks
 - dont bypass existing collaborative flow utilities

 ## check when done

 - design task updates the canvas through the existing collaborative flow.
 - AI presence and status are visible to all participants.
 - status messages reflect task progress.
 - errors are handled wihtout breaking the canvas 
 - `npm run build` passes.