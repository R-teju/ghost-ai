Add resizing and inline label editing to canvas nodes.

## implementation

1. add resizing.
  - selected nodes should show resize handles
  - prevent nodes from being resized below minimum size
  - keep resize handles subtle and consistent with the dark canvas UI
2. Add inline label edditing.
   - keep the node label centered inside the node
   - double-click the center/label area of a node to edit its label
   - show a placeholder text in the same centered position when the label is empty
   - keep editing smooth without causing layout shifts
   - show a textarea directly over the lable while editing
   - update the label as users type
   - close editing on blur on `Escape`
   - prevent text editing intrcations from dragging or panning in the canvas

3. keep all node updates connected to the existing collaborative canvas state.

## scope limits

- don't change shape rendering from the previous unit
- don't change how dropped nodes are crreated
- keep this focused on resize and label editing only



