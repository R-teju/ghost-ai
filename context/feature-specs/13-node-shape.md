Replace the place holder node render with proper shape reendering and a drag preview.
## Implementaion

1. Replace the  placeholder node shape rendering.
   - rectangle,pill and circle should use CSS styling
   - diamond,hexagon and cylinder should render  with SVG shapes
   - SVG shapes should scale with node size
   - keep borders subtle at rest  and brighter when selected
   - use the same shape type and default size that will be used on drop
   - hide the previous after the shape is dropped or the drag is cancelled
   - keep this limited to drag preview behaviour only

3. keep node rendering connected to the existing collaborative canvas state.

## scope limits

- dont rebuild shape panel layout
- dont change how dropped nodes are created 
- dont add resize or label editing yet
- keep drag/drop changes limited to the ghost preview only


## check when done

- nodes render the correct shape panel layout
- CSS shapes render correctly for rectangle ,pill and circle.
- SVG shapes render and scale correctly for diamond ,hexagon and cylinder.
- Shape dragging shows a ghost preview matching the dragged shape.
- `npm run build` passes without type errors.
