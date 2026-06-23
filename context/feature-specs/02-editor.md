we need the basse chrome components that frame every editor screen- the top navbar and the left sidebar shell. these will be reused and extended in every chapter that follows.

### Editor Navbar
Create `components/editor/editor-navbar.tsx`.

Requirements:
- fixed-height top navbar
- left , center, and right sectoins
- left section contains sidebar toggle button
- use `PannelLeftOpen` / `PannelLeftClose` icons based on sidebar state
- right section stay empty for now
- dark background with subtle bottom border

### Project Sidebar

Create `components/editor/project-sidebar.tsx`.
 
 Requirements
 - sidebar should float above the editor canvas
 - opening it should not push page content
 - accepts `isOpen` prop
 - header with `Projects` title +close button
 - shadcn `Tabs`:
    -My Projects
    - Shared 
- both tabs show empty placeholder state
- full width `New Project` button at athe bottom with `Plus` icon

### Dialog Pattern
use the existing color tokens from `global.css` for dialog styling.
Support:
  -title
  -description
  -footer actions
do not build actual dialogs yet.

### check when done
 - new components compile without TypeScript errors
 -no lint errors
 -dialog pattern is ready for future use
