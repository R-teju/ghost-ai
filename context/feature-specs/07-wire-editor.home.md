wire the editor home sidebar and dialogs to the real projects API.
### Data fetching

 The editor home page is a server component.

 Fetch owned and shared projects server-side using the existing project data helper and pass both lists to the sidebar.

 No client-side fetching for initial load.

 ### `Use Project Actions`

 Create a book in `hooks/` that manages dialog state and project mutations

**Create**
- manage create dialog state
- mange project name input 
- generate a short unique suffix
- slugify the name to create the room ID
- call `POST /api/projects`
- navigate to the new workspace

The projects ID and Liveblocks room ID should stay aligned.

 **Rename**
 - store target project id + current name
 - call `PATCH /api/projects/[id]`
 - refresh on success

 **Delete**
- store target project
- call `DELETE /api/projects/[id]`
- redirect to `/editor` if detecting the active workspace
- otherwise refresh

## wiring
Connect the hook to the sidebar and dialogs.
- create dialog shows roon ID preview
- rename dialog pre-fills current name
- delete dialog shows project name 

### check when done
- sidebar uses real project data
- create navigates to workspace
- rename updates correctly
- delete refreshes or redirects correctly 
- `npm run build `passes