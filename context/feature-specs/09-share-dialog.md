Add a `share` button to the editor navbar that opens the share dialog.

owners can:
- invite collaborations by email
- view current collaborations
- remove collaborations
- copy the project link with temporary`copied` feedback

collaboration can:

- view the collaborator list only
- not invite,remove,or manage access


## Clerk User Data
 
 collaborators are stored by email in the database.

 Use Clerk Backend API to enrich collaborator emails with:

 - display name
 - avatar image
 if a clerk user is not found  for an email,fall back to showing the email only.

## Implementation

Add the required API logic for:

- listing collaborators
- inviting collaborators
- removing collaborators

Enforce ownership server-side for invite and remove actions.

Do not add a local user table.
## Check when done

- share dialog opens from the workspace
- owners can invite and remove collaborators
- collaborators see read-only access
- collaborator name/avatars load from Clerk when available
- `npm run build` passes