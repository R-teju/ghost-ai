Add a bottom shape panel  so users can drag shapes onto the canvas and create new notes.

## implementation

1. Add a floating pill-shaped toolbar at the bottom-center of the canvas.

2. Add draggable icon buttons for these shapes:
  - rectangle
  - diamond
  - circle
  - pill
  - cylinder
  - hexagon

3. when dragging a shape,include the shape name and default size in the drag payload.

  use sensible default sizes:
  - rectangle should be wider than tall
  - circles should be square
  - diamonds shuold be slightly larger so labeles have room

4. Add `dragover` and `drop` handling to the canvas wrapper.

5. on drop:
      - read the dragged shape payload
      - convert the screen position to canvas coordinates using React Flow
      - create a new node at that position
      - use an empty label
      - use the default node color
      - use the dragged shape value

6. Generate each node ID using the shape name , timestamp, and a counter.
7. add a basic render for the custom canvas node ype so new are visible
