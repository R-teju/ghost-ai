Add a small starter template library so users can start a canvas from a pre-nuilt diagram instead of building from scratch.

## implmentation 

1.create `components/editors/starter-templates.ts`.
   include:
   - a `CanvasTemplate` type
   - a `CANVAS-TEMPLATES` array
   - at least three templates,such as microservices,CI/CD pipeline, and event-driven systemm

   each template should include:

   - `id`
   - `name`
   - `description`
   - nodes
   - edges

   use the shared canvas types ans existing node color palette.Add small helper functions if neede tokeep the template data readable

2.create `components/editor/starter-templates-modal.tsx`.

 the model should:
 - open as a dialog
 - show template cards in a scrollable grid
 - show the template name and description
 - include an import button for each template
 - call `onImport` with the selected template ,then  close

3. add a simple diagram preview to each template card.
  - fit the preview to a fixed-size viewport
  - calculate the preview bounds from the template node positions
  - draw edges as simple lines between nodes centers
  - draw nodes using thier shape and color data
  - keep the preview lightweight, no react flow instance needed