Add a floating control bar for zoom and undo/redo,the wire the same actions to keyboard shortcuts

## implementation
1.add a pill-shaped control bar at the bottom-left of the canvas. 

 it should sit above the shape panel and include two groups:
  - zoom controls:zoom out,fit view,zoom in
  - history controls: undo,redo

  separate the two groups with a thin divider.

2.wire the zoom controls to the react flow innstance.
  - zoom in
  - zoom out
  - fit view
  - use a short animations so the movement feels smooth

3. wire undo and redo to liveblocks history.
  - use the existing liveblocks undi/redo hooks
  - disable undo when there is nothing to undo
  - disable redo when there is nothing to redo
  - keep disabled buttons visually dimmed.

4. create a `useKeyboardShortcuts` hook  in `hooks/`.

 the hook should:
 - recieve the React Flow instance
 - recieve undo and redo handlers
 - listen for keyboard shortcuts on `window`
 - ignore shortcuts while tyoing in inputs, textareas, or editable text fields

5. support these shortcuts:
 - `+` or `=` to zoom in
 - `-` to zoom out
 - `Cmd/Ctrl +z` to  undo
 - `Cmd/Ctrl +shift +z` to redo
 - `Cmd/Ctrl + y` to redo

## scope limits
  - dont change the shape panel
  - dont change the node  or edge  rendering
  - dont add extra canvas controls
  - dont change the existing collaborations state setup