Replace the default canvas edges with custom edges that feel easier to follow, easier to click and support inline labels

## implementation
1.
- place handles on the top ,right,bottom and left sides
- users should be able to connect from any handle to  any other handle 
- keep the handles subtle:small white dots with a dark border
- hide them by default and fade them in when hocerring the node

2. add a default style for new edges.
  - use a light stroke with roundable ends
  - add an arrowed at the end of each edge
  - make new connections use the custom canvas edge renderer

3. create the custom edge renderer.
  - use clean right-angle routing
  - keep edges when slightly dimmed at rest
  - brighten edges when hovered or selected 
  - make edges easier to hover and click without increasing the visible line thickness

4. add inline edge label editting.
  - double-click an edge to edit its label
  - use react folw `EdgeLabelRender` and the pathh midpoint coordinatees from `getSmoothStepath` to position the label do not calculate midpoint position manually
  - use an input that arows with the label text