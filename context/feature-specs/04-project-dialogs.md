## goal

Build the `/editor` home screen and add project dialogs/sidebar actions.no API calls or persistence yet.

## editor home

Reuse the existing editor layout. DoNot modify the navbar or sidebar behaviour.

In the center of the page , add:
- heading:`Create a project or open an existing one`
- description:`start a new architecture workspace, or choose a project from the sidebar`
- `NewProject` button with a `Plus` icon

keep the layout minimal.do not wrap this contrnt in cards.

clicking `New Project` should open the create project dialog.

## dialogs
### create project

- project name input
- live slug preview based on the name
- preview updates as the user types

### Rename Project
- prefilled project name input
- current project name shown in the description
- input auto-focuses
- enter submits

### Delete Projects

- destructive confirmation only
- no input  
- confirm button uses destructive styling

### sidebar

Add project item actions:
- rename
- delete

Show actions only for owned projects.

Hide actions for shared/collaborator projects.

On mobile:

- tapping outside the sidebar closes it 
- add a backdrop scrim

## implementation

Create a dedicated hook to manage:

- dialog state
- form state 
- loading state

wire:

- editor home `New Project` ->Create dialog
- sidebar create -> rename dialog
- sidebar rename ->Rename dialog
- sidebar delete ->Delete dialog

use mock project data only. Do Not add API calls or persistence.

## check when done
- sidebar actions are wired
- slug preview works
- no TypeScript errors
- no lint errors