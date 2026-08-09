## Implementation

1.check ui-context.md for the node color palette.
- a node background color
- a matching text color

Reuse existing theme colors if they already exist in the `global.css` otherwise, keep the palette in the canvas types constants such as ` types/canvas.ts`

2. Add a Toolbar above selected nodes. 

- only show it when the node is selected
- keep it slightly above the node without overlapping it 
- show one swatch per color pair
- active swacthes should feel clearly selected
- hovering a swatch should show a subtle glow based on its text color
- keep the glow tight and controlled not overly blurred
- prevent toolbar interactions from dragging nodes or panning the canvas

3.when a swatch is selected:
  - update both the node background color and text color
  - update the node UI immedietly
  - keep this inside the existing collaborative canvas state 
  - no server calls

4. selected nodes should visually reflect thier active color pair.

the node background update to the selectedd color, and the next automatically updates to its paired text color.

## score limits 

- dont change drag/drop behaviour 
- dont rebuild node selection logic
- dont add a full color picker
- keep this focused on predefined color themes only

## check when done
- nodes use predefined background/text color pairs.
- selected nodes show a floating color toolbar
- swatch selection updates both node and text colors.
- `npm run build` passes without type errors